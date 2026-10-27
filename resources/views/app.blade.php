<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <link rel="icon" href="data:,">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ $title }}</title>
        <meta name="description" content="{{ $description }}">
        <meta name="robots" content="noindex, nofollow">

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Litervia">
        <meta property="og:title" content="{{ $title }}">
        <meta property="og:description" content="{{ $description }}">

        @isset($heroImage)
            <link rel="preload" as="image" type="image/webp" media="(max-width: 639px)" href="{{ $heroImage['mobileSrc'] }}" fetchpriority="high">
            <link rel="preload" as="image" type="image/webp" media="(min-width: 640px)" href="{{ $heroImage['desktopSrc'] }}" fetchpriority="high">
        @endisset

        @viteReactRefresh
        @vite('resources/js/app.jsx')
    </head>

    <body>
        <div id="app" @isset($heroImage) data-hero-image="{{ json_encode($heroImage, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT) }}" @endisset></div>

        <noscript>
            JavaScript is required to use Litervia.
        </noscript>
    </body>
</html>
