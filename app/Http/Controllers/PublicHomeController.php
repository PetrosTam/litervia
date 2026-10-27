<?php

namespace App\Http\Controllers;

use App\Support\HeroImageSelector;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpFoundation\Cookie;

final class PublicHomeController extends Controller
{
    public function index(Request $request, HeroImageSelector $selector): Response
    {
        $previous = $request->cookie('lv_previous_hero');
        $heroImage = $selector->choose(is_string($previous) ? $previous : null);

        return response()->view('app', [
            'title' => 'Litervia - Discover research. Explore knowledge.',
            'description' => 'Litervia is an independent research discovery and personal knowledge platform.',
            'heroImage' => $heroImage,
        ])->header('Cache-Control', 'private, no-store')
            ->withCookie(new Cookie(
                name: 'lv_previous_hero',
                value: $heroImage['id'],
                expire: now()->addDays(7),
                path: '/',
                secure: $request->isSecure(),
                httpOnly: true,
                sameSite: Cookie::SAMESITE_LAX,
            ));
    }

    public function manifest(HeroImageSelector $selector): JsonResponse
    {
        // This web route can issue a session cookie, so shared caching is unsafe.
        return response()->json(['data' => $selector->all()])
            ->header('Cache-Control', 'private, no-store');
    }
}
