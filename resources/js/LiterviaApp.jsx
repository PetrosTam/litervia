import { useEffect } from 'react';
import { Link, NavLink, Route, Routes } from 'react-router';

const container = 'mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12';

const pages = {
  home: {
    title: 'Litervia — Discover research. Explore knowledge.',
    description:
      'Litervia is an independent research discovery and personal knowledge platform.',
  },
  research: {
    title: 'Research | Litervia',
    description: 'The Litervia research catalogue is under development.',
  },
};

function PageMetadata({ title, description }) {
  useEffect(() => {
    document.title = title;

    const metadata = [
      ['meta[name="description"]', description],
      ['meta[property="og:title"]', title],
      ['meta[property="og:description"]', description],
    ];

    for (const [selector, value] of metadata) {
      const element = document.querySelector(selector);

      if (element) {
        element.setAttribute('content', value);
      }
    }
  }, [title, description]);

  return null;
}

function AppHeader() {
  const navLinkClass =
    'inline-flex min-h-11 items-center rounded-control px-3 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink aria-[current=page]:bg-selected aria-[current=page]:text-on-selected focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus';

  return (
    <header className="border-b border-stroke bg-surface">
      <div className={`${container} flex min-h-20 items-center justify-between gap-3`}>
        <Link
          to="/"
          className="rounded-control font-display text-[1.7rem] leading-none tracking-tight text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
        >
          Litervia
        </Link>
        <nav aria-label="Main navigation" className="flex items-center gap-1 sm:gap-2">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/research" className={navLinkClass}>
            Research
          </NavLink>
        </nav>
      </div>
    </header>
  );
}

function ResearchArtwork() {
  return (
    <div
      aria-hidden="true"
      className="lv-research-art relative isolate min-h-[24rem] overflow-hidden rounded-[1.75rem] p-7 shadow-[0_28px_70px_-38px_rgba(12,36,26,0.55)] sm:min-h-[29rem] lg:min-h-[33rem]"
    >
      <div className="relative z-10 text-[0.65rem] font-semibold uppercase tracking-[0.24em] opacity-80">
        Research / ideas / people
      </div>
      <svg
        viewBox="0 0 560 560"
        className="absolute inset-0 h-full w-full"
        fill="none"
        focusable="false"
      >
        <circle cx="280" cy="282" r="212" stroke="currentColor" strokeOpacity="0.15" />
        <circle cx="280" cy="282" r="156" stroke="currentColor" strokeOpacity="0.27" />
        <circle cx="280" cy="282" r="102" stroke="currentColor" strokeOpacity="0.4" />
        <path
          d="M48 388C126 342 160 157 274 188S408 410 516 169"
          stroke="currentColor"
          strokeOpacity="0.6"
          strokeWidth="1.5"
        />
        <path
          d="M62 196C149 268 209 435 296 387S402 129 501 326"
          stroke="currentColor"
          strokeOpacity="0.42"
          strokeWidth="1.5"
        />
        <rect
          x="216" y="203" width="128" height="160" rx="12"
          fill="currentColor" fillOpacity="0.09" stroke="currentColor" strokeOpacity="0.75"
        />
        <path d="M242 242H318M242 263H308M242 284H295" stroke="currentColor" strokeOpacity="0.8" strokeWidth="2" strokeLinecap="round" />
        <path d="M242 319H281" stroke="currentColor" strokeOpacity="0.45" strokeWidth="2" strokeLinecap="round" />
        <circle cx="126" cy="301" r="6" fill="currentColor" />
        <circle cx="412" cy="179" r="7" fill="currentColor" />
        <circle cx="408" cy="413" r="5" fill="currentColor" />
        <circle cx="215" cy="128" r="4" fill="currentColor" />
        <circle cx="476" cy="321" r="4" fill="currentColor" />
      </svg>
      <div className="absolute inset-x-7 bottom-7 z-10 flex items-end justify-between gap-4 border-t border-current/25 pt-5">
        <span className="max-w-40 font-display text-2xl leading-tight sm:text-3xl">
          Ideas connect.
        </span>
        <span className="shrink-0 text-xs font-medium tracking-[0.15em]">1982 — 2026</span>
      </div>
    </div>
  );
}

function HomePage() {
  return (
    <>
      <PageMetadata {...pages.home} />
      <main id="main-content" tabIndex={-1}>
        <section
          aria-labelledby="home-title"
          className={`${container} grid gap-12 pb-18 pt-14 sm:pt-20 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:py-25`}
        >
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-action">
              Discover research. Explore knowledge.
            </p>
            <h1
              id="home-title"
              className="mt-6 max-w-[13ch] font-display text-[clamp(3.25rem,6vw,5.75rem)] leading-[0.99] tracking-[-0.045em] text-ink"
            >
              40+ years of CHI research, in one place.
            </h1>
            <p className="mt-7 max-w-[53ch] text-base leading-8 text-ink-muted sm:text-lg">
              An independent space for exploring CHI-related bibliographic records
              from 1982 through 2026, with source transparency at its core.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <NavLink
                to="/research"
                className="inline-flex min-h-12 items-center justify-center gap-3 rounded-control bg-action px-6 py-3 text-sm font-semibold text-on-action hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
              >
                Explore research
                <span aria-hidden="true">→</span>
              </NavLink>
              <span className="text-sm text-ink-muted">Catalogue under development</span>
            </div>
          </div>
          <ResearchArtwork />
        </section>

        <section aria-label="What Litervia is building" className="border-t border-stroke bg-surface">
          <div className={`${container} grid gap-9 py-12 sm:grid-cols-3 sm:gap-8 sm:py-16`}>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-action">01 / CONTEXT</p>
              <h2 className="mt-3 font-display text-2xl text-ink">Historical perspective</h2>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                A planned view of CHI-related bibliography across 1982–2026.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-action">02 / SOURCES</p>
              <h2 className="mt-3 font-display text-2xl text-ink">Source transparency</h2>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Records will distinguish verified metadata from unavailable fields.
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-action">03 / KNOWLEDGE</p>
              <h2 className="mt-3 font-display text-2xl text-ink">Personal knowledge</h2>
              <p className="mt-2 text-sm leading-7 text-ink-muted">
                Private notes and collections are planned for a later release.
              </p>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ResearchPage() {
  return (
    <>
      <PageMetadata {...pages.research} />
      <main
        id="main-content"
        tabIndex={-1}
        className={`${container} min-h-[65vh] py-16 sm:py-24`}
      >
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-action">
          Discover research
        </p>
        <h1 className="mt-5 font-display text-[clamp(3.5rem,7vw,5rem)] leading-none tracking-tight">
          Research
        </h1>
        <div className="mt-10 max-w-2xl rounded-panel border border-stroke bg-surface p-6 sm:p-9">
          <p className="text-sm font-semibold text-action">Catalogue preparation</p>
          <p className="mt-3 text-lg leading-8 text-ink">
            The Litervia research catalogue is under development.
          </p>
          <p className="mt-3 text-sm leading-7 text-ink-muted">
            Search, filters, and publication records will appear after the
            underlying bibliographic data has been verified and prepared.
          </p>
        </div>
      </main>
    </>
  );
}

export default function LiterviaApp() {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-ink focus:outline-2 focus:outline-offset-2 focus:outline-focus focus:not-sr-only"
      >
        Skip to main content
      </a>
      <AppHeader />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/research" element={<ResearchPage />} />
      </Routes>
      <footer className="border-t border-stroke bg-surface">
        <div className={`${container} py-6 text-xs leading-6 text-ink-muted`}>
          Independent research discovery project. Not affiliated with ACM or SIGCHI.
        </div>
      </footer>
    </div>
  );
}
