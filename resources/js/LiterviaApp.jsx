import { useEffect, useRef } from 'react';
import { Link, NavLink, Route, Routes, useLocation } from 'react-router';
import HomeHero from './components/HomeHero.jsx';
import RevealOnScroll from './components/RevealOnScroll.jsx';

const container = 'mx-auto w-full max-w-[1200px] px-5 sm:px-8 lg:px-12';

const pages = {
  home: {
    title: 'Litervia - Discover research. Explore knowledge.',
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

// Client-side navigation should announce the new main content to keyboard
// and assistive-technology users without stealing focus on the initial load.
function RouteFocus() {
  const { pathname } = useLocation();
  const previousPath = useRef(pathname);

  useEffect(() => {
    if (previousPath.current === pathname) {
      return;
    }

    previousPath.current = pathname;
    // Start each new page at the top; focusing <main> must not scroll past the header.
    window.scrollTo(0, 0);
    document.getElementById('main-content')?.focus({ preventScroll: true });
  }, [pathname]);

  return null;
}

function AppHeader() {
  const navLinkClass =
    'lv-nav-link relative inline-flex min-h-11 items-center rounded-control px-3 text-sm font-medium text-ink-muted hover:bg-surface-muted hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus';

  return (
    <header className="lv-site-header border-b">
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

function HomePage({ heroImage }) {
  return (
    <>
      <PageMetadata {...pages.home} />
      <main id="main-content" tabIndex={-1}>
        <HomeHero heroImage={heroImage} />

        <section aria-labelledby="home-context-title" className="border-b border-stroke bg-surface">
          <div className={`${container} py-16 sm:py-22`}>
            <RevealOnScroll>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-action">A longer view</p>
              <h2 id="home-context-title" className="mt-4 max-w-3xl font-display text-[clamp(2.25rem,4vw,3.75rem)] leading-tight text-ink">
                Research deserves context, not just results.
              </h2>
              <p className="mt-5 max-w-[68ch] text-base leading-8 text-ink-muted">
                Litervia is being developed to make CHI-related bibliographic history
                easier to navigate, while making the limitations of its sources clear.
              </p>
            </RevealOnScroll>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {[
                ['01 / CONTEXT', 'Historical perspective', 'A planned view of CHI-related bibliography across 1982-2026.'],
                ['02 / SOURCES', 'Source transparency', 'Records will distinguish verified metadata from unavailable fields.'],
                ['03 / KNOWLEDGE', 'Personal knowledge', 'Private notes and collections are planned for a later release.'],
              ].map(([label, title, description]) => (
                <RevealOnScroll key={label} className="rounded-panel border border-stroke bg-editorial-surface p-6 sm:p-7">
                  <p className="text-xs font-semibold tracking-[0.14em] text-action">{label}</p>
                  <h3 className="mt-4 font-display text-2xl text-ink">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-ink-muted">{description}</p>
                </RevealOnScroll>
              ))}
            </div>
          </div>
        </section>

        <section aria-labelledby="home-method-title" className="overflow-hidden border-b border-stroke bg-editorial-surface">
          <div className={`${container} grid gap-8 py-18 md:grid-cols-[1fr_1fr] md:gap-16 md:py-24`}>
            <RevealOnScroll direction="left">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-action">Built around evidence</p>
              <h2 id="home-method-title" className="mt-5 max-w-[18ch] font-display text-[clamp(2.25rem,4vw,3.5rem)] leading-tight">
                Sources first. Discoveries next.
              </h2>
            </RevealOnScroll>
            <RevealOnScroll className="flex items-center" direction="right">
              <p className="max-w-[56ch] text-base leading-8 text-ink-muted">
                Bibliographic records and their origins need careful verification before
                they can support meaningful exploration. Search, author discovery and
                reading tools will be introduced as those foundations are validated.
              </p>
            </RevealOnScroll>
          </div>
        </section>

        <section aria-labelledby="home-next-title" className="bg-surface">
          <div className={`${container} py-18 sm:py-24`}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-action">Explore what is next</p>
              <h2 id="home-next-title" className="mt-4 max-w-3xl font-display text-[clamp(2.3rem,4.5vw,4rem)] leading-tight">
                The catalogue is taking shape.
              </h2>
              <p className="mt-5 max-w-[62ch] text-base leading-8 text-ink-muted">
                Visit the Research page for the current development status.
                Publication search and browsing are not live yet.
              </p>
              <Link
                to="/research"
                className="mt-7 inline-flex min-h-12 items-center gap-3 rounded-control bg-action px-6 py-3 text-sm font-semibold text-on-action hover:bg-action-hover focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-focus"
              >
                Research status <span aria-hidden="true">→</span>
              </Link>
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
        className="min-h-[65vh] bg-surface"
      >
        <div className={`${container} py-16 sm:py-24`}>
          <p className="lv-entrance lv-entrance-1 text-xs font-semibold uppercase tracking-[0.2em] text-action">
            Discover research
          </p>
          <h1 className="lv-entrance lv-entrance-2 mt-5 font-display text-[clamp(3.5rem,7vw,5rem)] leading-none tracking-tight">
            Research
          </h1>
          <div className="lv-entrance lv-entrance-3 mt-10 max-w-2xl rounded-panel border border-stroke bg-editorial-surface p-6 sm:p-9">
            <p className="text-sm font-semibold text-action">Catalogue preparation</p>
            <p className="mt-3 text-lg leading-8 text-ink">
              The Litervia research catalogue is under development.
            </p>
            <p className="mt-3 text-sm leading-7 text-ink-muted">
              Search, filters, and publication records will appear after the
              underlying bibliographic data has been verified and prepared.
            </p>
          </div>
        </div>
      </main>
    </>
  );
}

export default function LiterviaApp({ initialHeroImage = null }) {
  return (
    <div className="min-h-screen bg-canvas text-ink font-sans">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-3 focus:text-ink focus:outline-2 focus:outline-offset-2 focus:outline-focus focus:not-sr-only"
      >
        Skip to main content
      </a>
      <AppHeader />
      <RouteFocus />
      <Routes>
        <Route path="/" element={<HomePage heroImage={initialHeroImage} />} />
        <Route path="/research" element={<ResearchPage />} />
      </Routes>
      <footer className="lv-site-footer">
        <div className={`${container} grid gap-10 py-14 sm:grid-cols-[1.6fr_1fr_1fr] sm:gap-12 sm:py-18`}>
          <div>
            <p className="font-display text-4xl tracking-tight">Litervia</p>
            <p className="mt-3 max-w-[32ch] text-sm leading-7 text-(--lv-footer-muted)">
              Discover research. Explore knowledge.
            </p>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Explore</h2>
            <nav aria-label="Footer navigation" className="mt-4 flex flex-col items-start gap-3 text-sm">
              <Link className="lv-footer-link" to="/">Home</Link>
              <Link className="lv-footer-link" to="/research">Research</Link>
            </nav>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Project</h2>
            <p className="mt-4 text-sm leading-7 text-(--lv-footer-muted)">
              An independent research-discovery project exploring CHI-related bibliography from 1982-2026.
            </p>
          </div>
        </div>
        <div className={`${container} border-t border-(--lv-footer-rule) py-5 text-center text-xs leading-6 text-(--lv-footer-muted)`}>
          Not affiliated with ACM or SIGCHI.
        </div>
      </footer>
    </div>
  );
}
