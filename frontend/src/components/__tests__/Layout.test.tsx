import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { I18nProvider } from '../../i18n';
import Layout from '../Layout';

function renderLayout(children = <p>Test content</p>) {
  return render(
    <MemoryRouter>
      <I18nProvider>
        <Layout>{children}</Layout>
      </I18nProvider>
    </MemoryRouter>
  );
}

describe('Layout', () => {
  it('renders children', () => {
    renderLayout(<p>Child content</p>);
    expect(screen.getByText('Child content')).toBeInTheDocument();
  });

  it('renders navbar', () => {
    renderLayout();
    expect(document.querySelector('nav')).toBeInTheDocument();
  });

  it('has skip to content link', () => {
    renderLayout();
    expect(screen.getByText('Skip to content')).toBeInTheDocument();
  });

  it('has main content area', () => {
    renderLayout();
    expect(document.getElementById('main-content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <MemoryRouter>
        <I18nProvider>
          <Layout className="custom-class">Test</Layout>
        </I18nProvider>
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('has min-h-screen layout', () => {
    const { container } = render(
      <MemoryRouter>
        <I18nProvider>
          <Layout>Test</Layout>
        </I18nProvider>
      </MemoryRouter>
    );
    expect(container.firstChild).toHaveClass('min-h-screen');
  });
});
