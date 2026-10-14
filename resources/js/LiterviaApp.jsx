import { useEffect } from 'react';
import { NavLink, Route, Routes } from 'react-router';

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

function HomePage() {
  return (
    <>
      <PageMetadata {...pages.home} />

      <main
        id="main-content"
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <h1 className="text-4xl font-semibold tracking-tight">
          Litervia
        </h1>

        <p className="mt-4 text-lg">
          Discover research. Explore knowledge.
        </p>

        <p className="mt-6 text-sm text-slate-600">
          Frontend foundation in progress.
        </p>
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
        className="mx-auto max-w-3xl px-6 py-16"
      >
        <h1 className="text-4xl font-semibold tracking-tight">
          Research
        </h1>

        <p className="mt-4 text-slate-600">
          The Litervia research catalogue is under development.
        </p>
      </main>
    </>
  );
}

export default function LiterviaApp() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <a
        href="#main-content"
        className="sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-white focus:p-3 focus:not-sr-only"
      >
        Skip to main content
      </a>

      <header className="border-b border-slate-200">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-3xl items-center gap-6 px-6 py-4"
        >
          <NavLink
            to="/"
            end
            className="font-semibold focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Litervia
          </NavLink>

          <NavLink
            to="/research"
            className="text-sm focus-visible:outline-2 focus-visible:outline-offset-4"
          >
            Research
          </NavLink>
        </nav>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/research" element={<ResearchPage />} />
      </Routes>
    </div>
  );
}
