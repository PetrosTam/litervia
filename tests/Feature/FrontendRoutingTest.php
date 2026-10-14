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
            ->assertSee('<title>Litervia — Discover research. Explore knowledge.</title>', false)
            ->assertSee('<meta name="robots" content="noindex, nofollow">', false)
            ->assertSee('<div id="app"></div>', false);
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
