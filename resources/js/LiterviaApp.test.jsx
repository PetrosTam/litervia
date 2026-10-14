import { beforeEach, describe, expect, it } from 'vitest';
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
  document.head.innerHTML = `
    <meta name="description" content="">
    <meta name="robots" content="noindex, nofollow">
    <meta property="og:title" content="">
    <meta property="og:description" content="">
  `;
});

describe('Litervia frontend', () => {
  it('renders the home page with accessible navigation', () => {
    renderApp();

    expect(
      screen.getByRole('heading', { level: 1, name: 'Litervia' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('navigation', { name: 'Main navigation' }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole('link', { name: 'Litervia' }),
    ).toHaveAttribute('aria-current', 'page');

    expect(
      screen.getByRole('link', { name: 'Skip to main content' }),
    ).toHaveAttribute('href', '#main-content');
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

    await waitFor(() => {
      expect(document.title).toBe('Research | Litervia');
    });

    await user.click(screen.getByRole('link', { name: 'Litervia' }));

    expect(
      screen.getByRole('heading', { level: 1, name: 'Litervia' }),
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
