<?php

use Illuminate\Support\Facades\Route;

Route::view('/', 'app', [
    'title' => 'Litervia — Discover research. Explore knowledge.',
    'description' => 'Litervia is an independent research discovery and personal knowledge platform.',
])->name('home');

Route::view('/research', 'app', [
    'title' => 'Research | Litervia',
    'description' => 'The Litervia research catalogue is under development.',
])->name('research.index');
