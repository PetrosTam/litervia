import { useState } from 'react';
import { NavLink } from 'react-router';

// Direct /research -> / client navigation does not issue a new Home HTTP request.
// That case uses an intentionally stable local fallback until the next refresh.
export const fallbackHero = {
  id: '06',
  title: 'Tangible Computing',
  desktopSrc: '/media/heroes/litervia-hero-06-tangible-computing-desktop.webp',
  mobileSrc: '/media/heroes/litervia-hero-06-tangible-computing-mobile.webp',
};

export default function HomeHero({ heroImage }) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = heroImage || fallbackHero;

  return (
    <section aria-labelledby="home-title" className="lv-hero relative isolate overflow-hidden">
      {!imageFailed && (
        <picture className="lv-hero-picture" aria-hidden="true">
          <source media="(max-width: 639px)" srcSet={image.mobileSrc} />
          <img
            src={image.desktopSrc}
            width="1672"
            height="941"
            alt=""
            fetchPriority="high"
            decoding="async"
            onError={() => setImageFailed(true)}
          />
        </picture>
      )}
      <div aria-hidden="true" className="lv-hero-scrim" />
      <div className="lv-hero-inner mx-auto flex w-full max-w-[1200px] flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:px-12">
        <p className="lv-entrance lv-entrance-1 text-xs font-semibold uppercase tracking-[0.2em]">
          Discover research. Explore knowledge.
        </p>
        <h1
          id="home-title"
          className="lv-entrance lv-entrance-2 mt-6 max-w-[14ch] font-display text-[clamp(3rem,7vw,6rem)] leading-[1.02] tracking-[-0.045em]"
        >
          40+ years of CHI research in one place.
        </h1>
        <p className="lv-entrance lv-entrance-3 mt-7 max-w-[49ch] text-base leading-7 sm:text-lg sm:leading-8">
          An independent space for exploring CHI-related bibliographic records
          from 1982 through 2026, with source transparency at its core.
        </p>
        <div className="lv-entrance lv-entrance-4 mt-9 flex flex-wrap items-center gap-4">
          <NavLink
            to="/research"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-control bg-action px-6 py-3 text-sm font-semibold text-on-action hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
          >
            Explore research <span aria-hidden="true">→</span>
          </NavLink>
          <span className="lv-hero-note text-sm">Catalogue under development</span>
        </div>
      </div>
    </section>
  );
}
