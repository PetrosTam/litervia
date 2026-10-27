<?php

namespace Tests\Feature;

use App\Support\HeroImageSelector;
use Illuminate\Cookie\CookieValuePrefix;
use Illuminate\Cookie\Middleware\EncryptCookies;
use Tests\TestCase;

class HeroImageTest extends TestCase
{
    public function test_manifest_exposes_only_three_approved_assets(): void
    {
        $response = $this->getJson('/api/home/hero-images');
        $response->assertOk()->assertJsonCount(3, 'data')
            ->assertJsonPath('data.0.id', '02')
            ->assertJsonPath('data.1.id', '06')
            ->assertJsonPath('data.2.id', '07');
    }

    public function test_manifest_disables_caching_when_web_middleware_issues_a_session_cookie(): void
    {
        // Do not disable middleware: this verifies the actual HTTP response.
        $response = $this->getJson('/api/home/hero-images');
        $response->assertOk();
        $cacheDirectives = array_map('trim', explode(',', (string) $response->headers->get('Cache-Control')));
        $this->assertContains('private', $cacheDirectives);
        $this->assertContains('no-store', $cacheDirectives);
        $this->assertNotContains('public', $cacheDirectives);

        $cookieNames = collect($response->headers->getCookies())
            ->map(fn ($cookie) => $cookie->getName())
            ->all();

        $this->assertContains(config('session.cookie'), $cookieNames);
        $this->assertNotContains('lv_previous_hero', $cookieNames);
    }

    public function test_selector_excludes_previous_id(): void
    {
        $selector = app(HeroImageSelector::class);
        foreach (['02', '06', '07'] as $previous) {
            for ($i = 0; $i < 8; $i++) {
                $this->assertNotSame($previous, $selector->choose($previous)['id']);
            }
        }
    }

    public function test_only_home_selects_and_sets_previous_hero_cookie(): void
    {
        $this->withoutVite();

        // Inspect the raw cookie contract without the encryption middleware.
        // Laravel's test client still encrypts withCookie() automatically;
        // withUnencryptedCookie() sends the exact previous hero ID instead.
        $this->withoutMiddleware(EncryptCookies::class);

        $response = $this->withUnencryptedCookie('lv_previous_hero', '06')->get('/');
        $response->assertOk()->assertSee('data-hero-image=', false);
        $this->assertStringContainsString('no-store', $response->headers->get('Cache-Control'));

        $cookie = collect($response->headers->getCookies())->first(
            fn ($candidate) => $candidate->getName() === 'lv_previous_hero'
        );
        $this->assertNotNull($cookie);
        $this->assertContains($cookie->getValue(), ['02', '07']);
        $this->assertTrue($cookie->isHttpOnly());

        $research = $this->get('/research');
        $research->assertOk();
        $this->assertFalse(collect($research->headers->getCookies())->contains(
            fn ($candidate) => $candidate->getName() === 'lv_previous_hero'
        ));
    }

    public function test_home_cookie_is_encrypted_and_honors_http_security_attributes(): void
    {
        $this->withoutVite();

        // Keep the real web middleware active: the client encrypts the incoming
        // previous ID, and EncryptCookies encrypts the outgoing response cookie.
        $response = $this->withCookie('lv_previous_hero', '06')->get('/');
        $response->assertOk();

        $cookie = collect($response->headers->getCookies())->first(
            fn ($candidate) => $candidate->getName() === 'lv_previous_hero'
        );

        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', strtolower((string) $cookie->getSameSite()));
        $this->assertFalse($cookie->isSecure());
        $this->assertSame('/', $cookie->getPath());
        $this->assertNotContains($cookie->getValue(), ['02', '06', '07']);

        $encrypter = app('encrypter');
        $decrypted = $encrypter->decrypt($cookie->getValue(), false);
        $selectedId = CookieValuePrefix::validate(
            'lv_previous_hero',
            $decrypted,
            $encrypter->getAllKeys(),
        );

        // Successful decryption and name-prefix validation also prove that
        // the incoming encrypted previous ID was honored by hero selection.
        $this->assertContains($selectedId, ['02', '07']);
    }

    public function test_home_cookie_is_secure_when_the_request_uses_https(): void
    {
        $this->withoutVite();

        $response = $this->get('https://localhost/');
        $response->assertOk();

        $cookie = collect($response->headers->getCookies())->first(
            fn ($candidate) => $candidate->getName() === 'lv_previous_hero'
        );

        $this->assertNotNull($cookie);
        $this->assertTrue($cookie->isSecure());
        $this->assertTrue($cookie->isHttpOnly());
        $this->assertSame('lax', strtolower((string) $cookie->getSameSite()));
    }

    public function test_unknown_api_path_still_returns_json_404(): void
    {
        $this->getJson('/api/not-a-real-endpoint')->assertNotFound();
    }
}
