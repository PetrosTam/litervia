<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_home_page_returns_the_litervia_application_shell(): void
    {
        $this->withoutVite();

        $this->get('/')
            ->assertOk()
            ->assertSee('Litervia')
            ->assertSee('<div id="app"></div>', false);
    }

    public function test_placeholder_has_safe_initial_seo_metadata(): void
    {
        $this->withoutVite();

        $this->get('/')
            ->assertOk()
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false)
            ->assertSee('name="description"', false)
            ->assertDontSee('<link rel="canonical"', false);
    }

    public function test_unknown_api_endpoint_returns_json_404(): void
    {
        $this->getJson('/api/does-not-exist')
            ->assertNotFound()
            ->assertHeader('Content-Type', 'application/json');
    }

    public function test_health_endpoint_returns_a_successful_response(): void
    {
        $this->get('/up')->assertOk();
    }

    public function test_private_storage_routes_are_not_registered(): void
    {
        $this->assertFalse(Route::has('storage.local'));
        $this->assertFalse(Route::has('storage.local.upload'));
    }
}
