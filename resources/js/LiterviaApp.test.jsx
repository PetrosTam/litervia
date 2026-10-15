import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  vi.restoreAllMocks();
});

describe('Litervia frontend', () => {
  it('renders the editorial home page with accessible navigation', () => {
    renderApp();

    expect(
      screen.getByRole('heading', {
        level: 1,
        name: '40+ years of CHI research, in one place.',
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Litervia' }),
    ).not.toHaveAttribute('aria-current');

    expect(
      screen.getByRole('link', { name: 'Home' }),
    ).toHaveAttribute('aria-current', 'page');

    expect(
      screen.getByRole('link', { name: 'Skip to main content' }),
    ).toHaveAttribute('href', '#main-content');
  });

  it('marks only the active navigation link with a persistent rounded border', async () => {
    const user = userEvent.setup();
    renderApp();

    const home = screen.getByRole('link', { name: 'Home' });
    const research = screen.getByRole('link', { name: 'Research' });

    expect(home).toHaveAttribute('aria-current', 'page');
    expect(home).toHaveClass('border-2', 'border-current');
    expect(home).toHaveClass('focus-visible:outline-2', 'focus-visible:outline-offset-4');
    expect(research).not.toHaveAttribute('aria-current');
    expect(research).toHaveClass('border-2', 'border-transparent');
    expect(research).toHaveClass('focus-visible:outline-2', 'focus-visible:outline-offset-4');

    await user.click(research);

    expect(home).not.toHaveAttribute('aria-current');
    expect(home).toHaveClass('border-transparent');
    expect(research).toHaveAttribute('aria-current', 'page');
    expect(research).toHaveClass('border-current');
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

    await user.click(screen.getByRole('link', { name: 'Research' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Research' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Research' }),
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
        name: '40+ years of CHI research, in one place.',
      }),
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(document.title).toBe(
        'Litervia — Discover research. Explore knowledge.',
      );
    });
  });

  it('renders the Research route directly with its metadata', async () => {
    renderApp('/research');

    expect(
      screen.getByRole('heading', { level: 1, name: 'Research' }),
    ).toBeInTheDocument();

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

    const researchLink = screen.getByRole('link', { name: 'Research' });
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

    const researchLink = screen.getByRole('link', { name: 'Research' });
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

    const homeLink = screen.getByRole('link', { name: 'Home' });
    homeLink.focus();
    await user.keyboard('{Enter}');

    await waitFor(() => {
      expect(screen.getByRole('heading', {
        level: 1,
        name: '40+ years of CHI research, in one place.',
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

    await user.click(screen.getByRole('link', { name: 'Research' }));

    await waitFor(() => {
      expect(document.title).toBe('Research | Litervia');
    });

    expect(
      document.querySelector('meta[name="robots"]'),
    ).toHaveAttribute('content', 'noindex, nofollow');

    await user.click(screen.getByRole('link', { name: 'Litervia' }));

    await waitFor(() => {
      expect(document.title).toBe(
        'Litervia — Discover research. Explore knowledge.',
      );
    });

    expect(
      document.querySelector('meta[name="robots"]'),
    ).toHaveAttribute('content', 'noindex, nofollow');
  });
});
