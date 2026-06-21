/**
 * ThemeContext Tests
 * Tests theme management, localStorage persistence, and context values.
 */

import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

import { ThemeProvider, useTheme } from '../ThemeContext';

// Test component that uses the theme context
function ThemeConsumer() {
  const {
    theme,
    themeMode,
    customTheme,
    accentColor,
    contrastMode,
    toggleTheme,
    setThemeMode,
    setCustomTheme,
    setAccentColor,
    setContrastMode,
    toggleHighContrast,
  } = useTheme();

  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <span data-testid="themeMode">{themeMode}</span>
      <span data-testid="customTheme">{customTheme}</span>
      <span data-testid="accentColor">{accentColor}</span>
      <span data-testid="contrastMode">{contrastMode}</span>
      <button onClick={toggleTheme}>Toggle Theme</button>
      <button onClick={() => setThemeMode('light')}>Set Light</button>
      <button onClick={() => setThemeMode('system')}>Set System</button>
      <button onClick={() => setCustomTheme('midnight')}>Set Midnight</button>
      <button onClick={() => setAccentColor('#FF0000')}>Set Red</button>
      <button onClick={() => setContrastMode('high')}>Set High Contrast</button>
      <button onClick={toggleHighContrast}>Toggle Contrast</button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.style.cssText = '';
  });

  it('provides default theme values', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('themeMode').textContent).toBe('dark');
    expect(screen.getByTestId('customTheme').textContent).toBe('default');
    expect(screen.getByTestId('accentColor').textContent).toBe('#A855F7');
  });

  it('toggles theme between dark and light', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('themeMode').textContent).toBe('dark');

    await userEvent.click(screen.getByText('Toggle Theme'));
    expect(screen.getByTestId('themeMode').textContent).toBe('light');

    await userEvent.click(screen.getByText('Toggle Theme'));
    expect(screen.getByTestId('themeMode').textContent).toBe('dark');
  });

  it('sets theme mode to light', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Light'));
    expect(screen.getByTestId('themeMode').textContent).toBe('light');
    expect(localStorage.getItem('themeMode')).toBe('light');
  });

  it('sets theme mode to system', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set System'));
    expect(screen.getByTestId('themeMode').textContent).toBe('system');
    expect(localStorage.getItem('themeMode')).toBe('system');
  });

  it('sets custom theme', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Midnight'));
    expect(screen.getByTestId('customTheme').textContent).toBe('midnight');
    expect(localStorage.getItem('customTheme')).toBe('midnight');
  });

  it('sets accent color', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Red'));
    expect(screen.getByTestId('accentColor').textContent).toBe('#FF0000');
    expect(localStorage.getItem('accentColor')).toBe('#FF0000');
  });

  it('sets contrast mode', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set High Contrast'));
    expect(screen.getByTestId('contrastMode').textContent).toBe('high');
    expect(localStorage.getItem('contrastMode')).toBe('high');
  });

  it('toggles high contrast mode', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('contrastMode').textContent).toBe('normal');

    await userEvent.click(screen.getByText('Toggle Contrast'));
    expect(screen.getByTestId('contrastMode').textContent).toBe('high');

    await userEvent.click(screen.getByText('Toggle Contrast'));
    expect(screen.getByTestId('contrastMode').textContent).toBe('normal');
  });

  it('reads themeMode from localStorage', () => {
    localStorage.setItem('themeMode', 'light');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('themeMode').textContent).toBe('light');
  });

  it('reads customTheme from localStorage', () => {
    localStorage.setItem('customTheme', 'aurora');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('customTheme').textContent).toBe('aurora');
  });

  it('reads accentColor from localStorage', () => {
    localStorage.setItem('accentColor', '#00FF00');

    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(screen.getByTestId('accentColor').textContent).toBe('#00FF00');
  });

  it('persists toggleTheme to localStorage', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Toggle Theme'));
    expect(localStorage.getItem('themeMode')).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('applies dark class to document', () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('applies light class when theme is light', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set Light'));
    expect(document.documentElement.classList.contains('light')).toBe(true);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('applies high-contrast class when contrast mode is high', async () => {
    render(
      <ThemeProvider>
        <ThemeConsumer />
      </ThemeProvider>
    );

    await userEvent.click(screen.getByText('Set High Contrast'));
    expect(document.documentElement.classList.contains('high-contrast')).toBe(true);
  });
});
