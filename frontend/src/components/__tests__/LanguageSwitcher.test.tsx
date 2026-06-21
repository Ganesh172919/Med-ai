import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { I18nProvider } from '../../i18n';
import LanguageSwitcher from '../LanguageSwitcher';

function Wrapper({ children }: { children: ReactNode }) {
  return createElement(I18nProvider, null, children);
}

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the globe button', () => {
    render(<LanguageSwitcher />, { wrapper: Wrapper });
    expect(screen.getByLabelText('Change language')).toBeInTheDocument();
  });

  it('shows dropdown on click', () => {
    render(<LanguageSwitcher />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Change language'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    expect(screen.getByText('English')).toBeInTheDocument();
    expect(screen.getByText('Español')).toBeInTheDocument();
    expect(screen.getByText('日本語')).toBeInTheDocument();
  });

  it('marks the current locale as selected', () => {
    render(<LanguageSwitcher />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Change language'));
    const enOption = screen.getByRole('option', { selected: true });
    expect(enOption).toHaveTextContent('English');
  });

  it('switches locale on option click', async () => {
    render(<LanguageSwitcher />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Change language'));
    const spanishOption = screen.getAllByRole('option').find(el => el.textContent?.includes('Español'));
    fireEvent.click(spanishOption!);
    // Dropdown should close (AnimatePresence exit may be async)
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    // Locale should be persisted
    expect(localStorage.getItem('chatsphere-locale')).toBe('es');
  });

  it('closes dropdown when clicking a locale option', async () => {
    render(<LanguageSwitcher />, { wrapper: Wrapper });
    fireEvent.click(screen.getByLabelText('Change language'));
    expect(screen.getByRole('listbox')).toBeInTheDocument();
    const spanishOption = screen.getAllByRole('option').find(el => el.textContent?.includes('Español'));
    fireEvent.click(spanishOption!);
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('has accessible attributes', () => {
    render(<LanguageSwitcher />, { wrapper: Wrapper });
    const button = screen.getByLabelText('Change language');
    expect(button).toHaveAttribute('aria-expanded', 'false');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByRole('listbox')).toHaveAttribute('aria-label', 'Select language');
  });
});
