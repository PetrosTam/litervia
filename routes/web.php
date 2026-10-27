<?php

use App\Http\Controllers\PublicHomeController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PublicHomeController::class, 'index'])->name('home');

Route::view('/research', 'app', [
    'title' => 'Research | Litervia',
    'description' => 'The Litervia research catalogue is under development.',
])->name('research.index');

// Public, read-only asset metadata. Explicit registration avoids a new API route stack.
Route::get('/api/home/hero-images', [PublicHomeController::class, 'manifest'])
    ->name('api.home.hero-images');
