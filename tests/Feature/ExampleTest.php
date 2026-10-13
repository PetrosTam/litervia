<?php

namespace Tests\Feature;

use Illuminate\Support\Facades\Route;
use Tests\TestCase;

class ExampleTest extends TestCase
{
    public function test_home_page_returns_a_successful_litervia_response(): void
    {
        $this->get('/')
            ->assertOk()
            ->assertSee('Litervia');
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
