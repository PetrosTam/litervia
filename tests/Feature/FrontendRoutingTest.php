<?php

namespace Tests\Feature;

use Tests\TestCase;

class FrontendRoutingTest extends TestCase
{
    public function test_home_page_has_server_rendered_metadata(): void
    {
        $this->withoutVite();

        $this->get('/')
            ->assertOk()
            ->assertSee('<title>Litervia - Discover research. Explore knowledge.</title>', false)
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false)
            ->assertSee('data-hero-image=', false);
    }

    public function test_home_preloads_only_the_selected_responsive_hero_at_high_priority(): void
    {
        $this->withoutVite();

        $response = $this->get('/')->assertOk();

        preg_match_all('/<link rel="preload" as="image"[^>]*>/', $response->getContent(), $matches);

        $this->assertCount(2, $matches[0]);
        $this->assertStringContainsString('media="(max-width: 639px)"', $matches[0][0]);
        $this->assertStringContainsString('media="(min-width: 640px)"', $matches[0][1]);

        foreach ($matches[0] as $preload) {
            $this->assertStringContainsString('type="image/webp"', $preload);
            $this->assertStringContainsString('fetchpriority="high"', $preload);
            $this->assertStringContainsString('/media/heroes/', $preload);
        }

        $this->get('/research')
            ->assertOk()
            ->assertDontSee('rel="preload" as="image"', false);
    }

    public function test_research_page_has_its_own_server_rendered_metadata(): void
    {
        $this->withoutVite();

        $this->get('/research')
            ->assertOk()
            ->assertSee('<title>Research | Litervia</title>', false)
            ->assertSee('The Litervia research catalogue is under development.')
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false)
            ->assertDontSee('<link rel="canonical"', false);
    }

    public function test_unknown_research_page_returns_404(): void
    {
        $this->get('/research/not-a-real-page')->assertNotFound();
    }

    public function test_unknown_api_endpoint_returns_json_404(): void
    {
        $this->getJson('/api/not-a-real-endpoint')
            ->assertNotFound()
            ->assertHeader('Content-Type', 'application/json');
    }
}
