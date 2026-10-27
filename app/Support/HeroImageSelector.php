<?php

namespace App\Support;

final class HeroImageSelector
{
    /** @return array{id: string, title: string, desktopSrc: string, mobileSrc: string} */
    public function choose(?string $previousId): array
    {
        $images = array_values(config('hero_images'));
        $eligible = array_values(array_filter(
            $images,
            fn (array $image): bool => $image['id'] !== $previousId,
        ));

        if ($eligible === []) {
            $eligible = $images;
        }

        // Allowlist is owned by the app, not by request input.
        return $eligible[random_int(0, count($eligible) - 1)];
    }

    /** @return list<array{id: string, title: string, desktopSrc: string, mobileSrc: string}> */
    public function all(): array
    {
        return array_values(config('hero_images'));
    }
}
