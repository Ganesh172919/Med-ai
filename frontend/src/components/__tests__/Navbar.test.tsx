/**
 * =============================================================================
 * Navbar Component Tests
 * =============================================================================
 *
 * Tests for the main navigation component including:
 * - Rendering navigation links
 * - Active state highlighting
 * - Accessibility attributes
 * - Logo and branding
 *
 * WHY THESE TESTS:
 * - Navigation is critical for user experience
 * - Active states must be visually clear
 * - Accessibility compliance (WCAG 2.1)
 * - Links must point to correct routes
 * =============================================================================
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Navbar from '../Navbar';

/**
 * Helper to render Navbar with a specific route.
 *
 * WHY MEMORYROUTER:
 * Navbar uses React Router's useLocation hook.
 * MemoryRouter provides a fake router for testing
 * without needing a real browser URL.
 *
 * @param initialRoute - The route to simulate (default: '/dashboard')
 */
function renderNavbar(initialRoute = '/dashboard') {
  return render(
    <I18nProvider>
      <MemoryRouter initialEntries={[initialRoute]}>
        <Navbar />
      </MemoryRouter>
    </I18nProvider>
  );
}

describe('Navbar', () => {
  it('renders the ChatSphere logo/brand', () => {
    renderNavbar();
    expect(screen.getByText('ChatSphere')).toBeInTheDocument();
  });

  it('renders all navigation links', () => {
    renderNavbar();

    // Check that all nav links exist
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Search')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('has navigation landmark with aria-label', () => {
    renderNavbar();
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveAttribute('aria-label', 'Main navigation');
  });

  it('marks active page with aria-current', () => {
    renderNavbar('/dashboard');
    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('aria-current', 'page');
  });

  it('does not mark inactive pages with aria-current', () => {
    renderNavbar('/dashboard');
    const searchLink = screen.getByText('Search').closest('a');
    expect(searchLink).not.toHaveAttribute('aria-current', 'page');
  });

  it('links to correct routes', () => {
    renderNavbar();

    const dashboardLink = screen.getByText('Dashboard').closest('a');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');

    const searchLink = screen.getByText('Search').closest('a');
    expect(searchLink).toHaveAttribute('href', '/search');

    const settingsLink = screen.getByText('Settings').closest('a');
    expect(settingsLink).toHaveAttribute('href', '/settings');
  });

  it('highlights correct active link for nested routes', () => {
    renderNavbar('/chat');
    const chatLink = screen.getByText('Clinical AI').closest('a');
    expect(chatLink).toHaveAttribute('aria-current', 'page');
  });

  it('renders without errors on different routes', () => {
    const routes = ['/dashboard', '/chat', '/rooms', '/projects', '/memory', '/search'];

    routes.forEach((route) => {
      const { unmount } = renderNavbar(route);
      expect(screen.getByRole('navigation')).toBeInTheDocument();
      unmount();
    });
  });
});
