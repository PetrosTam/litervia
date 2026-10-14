<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>{{ $title }}</title>
        <meta name="description" content="{{ $description }}">
        <meta name="robots" content="noindex, nofollow">

        <meta property="og:type" content="website">
        <meta property="og:site_name" content="Litervia">
        <meta property="og:title" content="{{ $title }}">
        <meta property="og:description" content="{{ $description }}">

        @viteReactRefresh
        @vite('resources/js/app.jsx')
    </head>

    <body>
        <div id="app"></div>

        <noscript>
            JavaScript is required to use Litervia.
        </noscript>
    </body>
</html>
