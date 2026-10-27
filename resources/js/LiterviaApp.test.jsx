import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router';

import LiterviaApp from './LiterviaApp.jsx';

function renderApp(route = '/') {
  return render(
    <MemoryRouter initialEntries={[route]}>
      <LiterviaApp />
    </MemoryRouter>,
  );
}

function mainNavigationLink(name) {
  return within(
    screen.getByRole('navigation', { name: 'Main navigation' }),
  ).getByRole('link', { name });
}

beforeEach(() => {
  // jsdom does not implement viewport scrolling; assert the requested scroll explicitly.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => {});

  document.head.innerHTML = `
    <meta name="description" content="">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:title" content="">
    <meta property="og:description" content="">
  `;
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe('Litervia frontend', () => {
  it('renders the editorial home page with accessible navigation', () => {
    renderApp();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '40+ years of CHI research in one place.',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();

    expect(screen.getByRole('banner')).toHaveClass('lv-site-header');

    expect(
      screen.getByRole('link', { name: 'Litervia' }),
    ).not.toHaveAttribute('aria-current');

    expect(
      mainNavigationLink('Home'),
    ).toHaveAttribute('aria-current', 'page');

    expect(
      screen.getByRole('link', { name: 'Skip to main content' }),
    ).toHaveAttribute('href', '#main-content');
  });

  it('marks the active navigation link without the rejected persistent outline', async () => {
    const user = userEvent.setup();
    renderApp();

    const home = mainNavigationLink('Home');
    const research = mainNavigationLink('Research');

    expect(home).toHaveAttribute('aria-current', 'page');
    expect(home).toHaveClass('lv-nav-link', 'focus-visible:outline-2');
    expect(home).not.toHaveClass('border-2');
    expect(research).not.toHaveAttribute('aria-current');

    await user.click(research);

    expect(home).not.toHaveAttribute('aria-current');
    expect(research).toHaveAttribute('aria-current', 'page');
    expect(research).toHaveClass('lv-nav-link', 'focus-visible:outline-2');
  });

  it('renders the selected desktop and mobile hero images as decorative media', () => {
    const hero = {
      id: '02', title: 'Interaction Lab',
      desktopSrc: '/media/heroes/litervia-hero-02-interaction-lab-desktop.webp',
      mobileSrc: '/media/heroes/litervia-hero-02-interaction-lab-mobile.webp',
    };
    render(
      <MemoryRouter initialEntries={['/']}>
        <LiterviaApp initialHeroImage={hero} />
      </MemoryRouter>,
    );
    const image = document.querySelector('.lv-hero-picture img');
    const source = document.querySelector('.lv-hero-picture source');
    expect(image).toHaveAttribute('src', hero.desktopSrc);
    expect(image).toHaveAttribute('alt', '');
    expect(image).toHaveAttribute('fetchpriority', 'high');
    expect(source).toHaveAttribute('srcset', hero.mobileSrc);
    expect(screen.queryByText(/Conceptual AI-generated research artwork/)).not.toBeInTheDocument();
    expect(screen.queryByText(/AI-generated imagery is conceptual, not documentary/)).not.toBeInTheDocument();
  });

  it('keeps the hero copy and CTA usable when the selected image fails', () => {
    renderApp();
    const image = document.querySelector('.lv-hero-picture img');
    expect(image).toBeTruthy();
    fireEvent.error(image);
    expect(document.querySelector('.lv-hero-picture')).toBeNull();
    expect(screen.getByRole('heading', {
      level: 1,
      name: '40+ years of CHI research in one place.',
    })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore research' })).toBeInTheDocument();
  });

  it('keeps Version A context reveals while the final catalogue CTA stays immediately available', () => {
    const observed = [];
    class MockObserver {
      observe(element) { observed.push(element); }
      disconnect() {}
    }
    vi.stubGlobal('IntersectionObserver', MockObserver);
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: false }));
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000 });

    renderApp();

    const contextHeading = screen.getByRole('heading', {
      name: 'Research deserves context, not just results.',
    });
    const context = contextHeading.closest('.lv-scroll-reveal');
    const card = screen.getByRole('heading', {
      name: 'Historical perspective',
    }).closest('.lv-scroll-reveal');
    const nextHeading = screen.getByRole('heading', {
      name: 'The catalogue is taking shape.',
    });
    const nextSection = nextHeading.closest('section');

    expect(context).toHaveAttribute('data-reveal', 'pending');
    expect(card).toHaveAttribute('data-reveal', 'pending');
    expect(observed).toContain(context);
    expect(observed).toContain(card);
    expect(nextSection).toHaveAttribute('aria-labelledby', 'home-next-title');
    expect(nextSection.firstElementChild).toHaveClass('py-18', 'sm:py-24');
    expect(nextHeading.closest('.lv-scroll-reveal')).toBeNull();
    expect(observed.some((element) => nextSection.contains(element))).toBe(false);
    expect(within(nextSection).getByRole('link', { name: 'Research status' })).toHaveAttribute('href', '/research');
  });

  it('preserves Version A decorative scroll reveals on narrow screens', () => {
    const observed = [];
    vi.stubGlobal('IntersectionObserver', class {
      observe(element) { observed.push(element); }
      disconnect() {}
    });
    vi.stubGlobal('matchMedia', vi.fn((query) => ({ matches: query === '(max-width: 767px)' })));
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000 });

    renderApp();

    const context = screen.getByRole('heading', {
      name: 'Research deserves context, not just results.',
    }).closest('.lv-scroll-reveal');
    const card = screen.getByRole('heading', {
      name: 'Historical perspective',
    }).closest('.lv-scroll-reveal');
    const catalogueSection = screen.getByRole('heading', {
      name: 'The catalogue is taking shape.',
    }).closest('section');

    expect(context).toHaveAttribute('data-reveal', 'pending');
    expect(card).toHaveAttribute('data-reveal', 'pending');
    expect(observed).toContain(context);
    expect(observed).toContain(card);
    expect(catalogueSection.querySelector('.lv-scroll-reveal')).toBeNull();
    expect(screen.getByRole('link', { name: 'Research status' })).toBeInTheDocument();
  });

  it('uses the shared editorial surface for the three context cards and evidence band', () => {
    renderApp();

    expect(document.querySelector('.lv-site-header')).toBeInTheDocument();

    for (const title of ['Historical perspective', 'Source transparency', 'Personal knowledge']) {
      const card = screen.getByRole('heading', { name: title }).closest('.lv-scroll-reveal');
      expect(card).toHaveClass('bg-editorial-surface');
    }

    const evidence = screen.getByRole('heading', {
      name: 'Sources first. Discoveries next.',
    }).closest('section');
    expect(evidence).toHaveClass('bg-editorial-surface');
    expect(evidence).not.toHaveClass('lv-knowledge-lines');

    expect(screen.getByText(/bibliography across 1982-2026/)).toBeInTheDocument();
    expect(screen.getByText(/bibliography from 1982-2026/)).toBeInTheDocument();
  });

  it('assigns opposite reveal directions only to the evidence columns', () => {
    renderApp();

    const evidence = screen.getByRole('heading', {
      name: 'Sources first. Discoveries next.',
    }).closest('section');
    const title = within(evidence).getByRole('heading', {
      name: 'Sources first. Discoveries next.',
    }).closest('.lv-scroll-reveal');
    const paragraph = within(evidence).getByText(/Bibliographic records and their origins need careful verification/).closest('.lv-scroll-reveal');

    expect(title).toHaveAttribute('data-reveal-direction', 'left');
    expect(paragraph).toHaveAttribute('data-reveal-direction', 'right');
    expect(title).not.toHaveAttribute('data-reveal', 'pending');
    expect(paragraph).not.toHaveAttribute('data-reveal', 'pending');

    const card = screen.getByRole('heading', { name: 'Historical perspective' }).closest('.lv-scroll-reveal');
    expect(card).not.toHaveAttribute('data-reveal-direction');
  });

  it('reveals both evidence columns when observed, then disconnects each observer', () => {
    const observers = [];
    class MockObserver {
      constructor(callback) {
        this.callback = callback;
        this.disconnect = vi.fn();
        observers.push(this);
      }
      observe(element) { this.element = element; }
    }
    vi.stubGlobal('IntersectionObserver', MockObserver);
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000 });

    renderApp();

    const evidence = screen.getByRole('heading', {
      name: 'Sources first. Discoveries next.',
    }).closest('section');

    for (const direction of ['left', 'right']) {
      const element = evidence.querySelector(`[data-reveal-direction="${direction}"]`);
      const observer = observers.find((candidate) => candidate.element === element);
      expect(observer).toBeDefined();
      expect(element).toHaveAttribute('data-reveal', 'pending');

      observer.callback([{ isIntersecting: true }]);
      expect(element).toHaveAttribute('data-reveal', 'visible');
      expect(observer.disconnect).toHaveBeenCalledTimes(1);
    }
  });

  it('leaves the evidence section visible when reduced motion is requested', () => {
    const observe = vi.fn();
    vi.stubGlobal('IntersectionObserver', class {
      observe = observe;
      disconnect() {}
    });
    vi.stubGlobal('matchMedia', vi.fn().mockReturnValue({ matches: true }));
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({ top: 2000 });

    renderApp();

    const evidence = screen.getByRole('heading', {
      name: 'Sources first. Discoveries next.',
    }).closest('section');
    const columns = evidence.querySelectorAll('[data-reveal-direction]');
    expect(columns).toHaveLength(2);
    for (const column of columns) {
      expect(column).not.toHaveAttribute('data-reveal', 'pending');
    }
    expect(observe).not.toHaveBeenCalled();
  });

  it('keeps the Research placeholder honest and footer links functional', () => {
    renderApp('/research');
    const footerNavigation = screen.getByRole('navigation', {
      name: 'Footer navigation',
    });

    expect(
      within(footerNavigation).getByRole('link', { name: 'Home' }),
    ).toHaveAttribute('href', '/');
    expect(
      within(footerNavigation).getByRole('link', { name: 'Research' }),
    ).toHaveAttribute('href', '/research');
    expect(screen.getByText(/Not affiliated with ACM or SIGCHI/)).toBeInTheDocument();
  });

  it('offers a real Research destination without pretending the catalogue is live', async () => {
    const user = userEvent.setup();
    renderApp();

    expect(screen.getByText('Catalogue under development')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /search|sign in|filter/i })).not.toBeInTheDocument();

    const exploreLink = screen.getByRole('link', { name: 'Explore research' });
    expect(exploreLink).toHaveAttribute('href', '/research');

    await user.click(exploreLink);

    expect(
      screen.getByRole('heading', { level: 1, name: 'Research' }),
    ).toBeInTheDocument();
    expect(
      screen.getByText('The Litervia research catalogue is under development.'),
    ).toBeInTheDocument();
  });

  it('navigates between Home and Research', async () => {
    const user = userEvent.setup();

    renderApp();

    await user.click(mainNavigationLink('Research'));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Research' }),
    ).toBeInTheDocument();

    expect(
      mainNavigationLink('Research'),
    ).toHaveAttribute('aria-current', 'page');

    expect(
      screen.getByRole('link', { name: 'Litervia' }),
    ).not.toHaveAttribute('aria-current');

    await waitFor(() => {
      expect(document.title).toBe('Research | Litervia');
    });

    await user.click(screen.getByRole('link', { name: 'Litervia' }));

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '40+ years of CHI research in one place.',
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(document.title).toBe(
        'Litervia - Discover research. Explore knowledge.',
      );
    });
  });

  it('uses the Home staggered entrance sequence on a direct Research load', () => {
    renderApp('/research');

    const main = screen.getByRole('main');
    const label = within(main).getByText('Discover research');
    const heading = within(main).getByRole('heading', { level: 1, name: 'Research' });
    const statusCard = within(main).getByText('Catalogue preparation').closest('.rounded-panel');

    expect(label).toHaveClass('lv-entrance', 'lv-entrance-1');
    expect(heading).toHaveClass('lv-entrance', 'lv-entrance-2');
    expect(statusCard).toHaveClass('lv-entrance', 'lv-entrance-3');
    expect(main).not.toHaveClass('lv-entrance');
  });

  it('restarts the Research entrance after SPA navigation', async () => {
    const user = userEvent.setup();
    renderApp();

    await user.click(mainNavigationLink('Research'));
    const firstHeading = screen.getByRole('heading', { level: 1, name: 'Research' });
    expect(firstHeading).toHaveClass('lv-entrance', 'lv-entrance-2');

    await user.click(mainNavigationLink('Home'));
    await user.click(mainNavigationLink('Research'));

    const heading = screen.getByRole('heading', { level: 1, name: 'Research' });
    const main = screen.getByRole('main');
    expect(heading).toHaveClass('lv-entrance', 'lv-entrance-2');
    expect(heading).not.toBe(firstHeading);
    expect(within(main).getByText('Discover research')).toHaveClass('lv-entrance-1');
    expect(within(main).getByText('Catalogue preparation').closest('.rounded-panel'))
      .toHaveClass('lv-entrance-3');
  });

  it('renders the Research route directly with its metadata', async () => {
    renderApp('/research');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Research' }),
    ).toBeInTheDocument();

    // The Research view uses the Home's light surface across the full page;
    // the status card uses the same editorial beige as the Home context cards.
    const main = screen.getByRole('main');
    expect(main).toHaveClass('bg-surface');
    expect(main).not.toHaveClass('bg-canvas', 'mx-auto');
    expect(main.firstElementChild).toHaveClass('mx-auto');
    expect(main.querySelector('.rounded-panel')).toHaveClass('bg-editorial-surface');
    expect(main.querySelector('.rounded-panel')).not.toHaveClass('bg-surface');

    await waitFor(() => {
      expect(document.title).toBe('Research | Litervia');
    });

    expect(
      document.querySelector('meta[name="description"]'),
    ).toHaveAttribute(
      'content',
      'The Litervia research catalogue is under development.',
    );

    expect(
      document.querySelector('meta[property="og:title"]'),
    ).toHaveAttribute('content', 'Research | Litervia');
  });

  it('exposes a focusable skip target on both pages', () => {
    const homeView = renderApp();
    const homeMain = screen.getByRole('main');

    expect(homeMain).toHaveAttribute('tabindex', '-1');
    homeMain.focus();
    expect(homeMain).toHaveFocus();

    homeView.unmount();

    renderApp('/research');
    const researchMain = screen.getByRole('main');

    expect(researchMain).toHaveAttribute('tabindex', '-1');
    researchMain.focus();
    expect(researchMain).toHaveFocus();
  });

  it('moves keyboard focus to the new main region after SPA navigation', async () => {
    const user = userEvent.setup();
    renderApp();

    const initialMain = screen.getByRole('main');
    expect(initialMain).not.toHaveFocus();

    const researchLink = mainNavigationLink('Research');
    researchLink.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('heading', { level: 1, name: 'Research' })).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveFocus();
    });

    await user.click(screen.getByRole('link', { name: 'Litervia' }));
    await waitFor(() => {
      expect(screen.getByRole('main')).toHaveFocus();
    });
  });

  it('restores the page top without scrolling the focused main out of context', async () => {
    const user = userEvent.setup();
    const focusSpy = vi.spyOn(HTMLElement.prototype, 'focus');
    renderApp();

    // The initial page load must not force scrolling or focus.
    expect(window.scrollTo).not.toHaveBeenCalled();
    expect(screen.getByRole('main')).not.toHaveFocus();

    const researchLink = mainNavigationLink('Research');
    researchLink.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1, name: 'Research' })).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveFocus();
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });

    vi.mocked(window.scrollTo).mockClear();
    focusSpy.mockClear();

    const homeLink = mainNavigationLink('Home');
    homeLink.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('heading', {
        level: 1,
        name: '40+ years of CHI research in one place.',
      })).toBeInTheDocument();
      expect(screen.getByRole('main')).toHaveFocus();
    });
    expect(window.scrollTo).toHaveBeenCalledWith(0, 0);
    expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });
  });

  it('preserves the noindex directive during client navigation', async () => {
    const user = userEvent.setup();

    renderApp();

    expect(
      document.querySelector('meta[name="robots"]'),
    ).toHaveAttribute('content', 'noindex, nofollow');

    await user.click(mainNavigationLink('Research'));

    await waitFor(() => {
      expect(document.title).toBe('Research | Litervia');
    });

    expect(
      document.querySelector('meta[name="robots"]'),
    ).toHaveAttribute('content', 'noindex, nofollow');

    await user.click(screen.getByRole('link', { name: 'Litervia' }));

    await waitFor(() => {
      expect(document.title).toBe(
        'Litervia - Discover research. Explore knowledge.',
      );
    });

    expect(
      document.querySelector('meta[name="robots"]'),
    ).toHaveAttribute('content', 'noindex, nofollow');
  });
});
