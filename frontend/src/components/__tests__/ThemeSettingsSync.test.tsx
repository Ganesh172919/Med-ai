import { render, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../api/settings', () => ({
  fetchSettings: vi.fn(),
}));

vi.mock('../../context/ThemeContext', () => ({
  useTheme: vi.fn(),
}));

vi.mock('../../store/authStore', () => ({
  useAuthStore: vi.fn(),
}));

import ThemeSettingsSync from '../ThemeSettingsSync';
import { fetchSettings } from '../../api/settings';
import { useTheme } from '../../context/ThemeContext';
import { useAuthStore } from '../../store/authStore';

const mockSetAccentColor = vi.fn();
const mockSetCustomTheme = vi.fn();
const mockSetThemeMode = vi.fn();

describe('ThemeSettingsSync', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useTheme as any).mockReturnValue({
      setAccentColor: mockSetAccentColor,
      setCustomTheme: mockSetCustomTheme,
      setThemeMode: mockSetThemeMode,
    });
  });

  it('renders nothing (returns null)', () => {
    (useAuthStore as any).mockReturnValue({ user: null, isAuthenticated: false });
    const { container } = render(<ThemeSettingsSync />);
    expect(container.innerHTML).toBe('');
  });

  it('does not fetch settings when not authenticated', () => {
    (useAuthStore as any).mockReturnValue({ user: null, isAuthenticated: false });
    render(<ThemeSettingsSync />);
    expect(fetchSettings).not.toHaveBeenCalled();
  });

  it('fetches and applies settings when authenticated', async () => {
    (useAuthStore as any).mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });
    (fetchSettings as any).mockResolvedValue({
      theme: { mode: 'dark', customTheme: { primary: '#fff' } },
      accentColor: '#A855F7',
    });

    render(<ThemeSettingsSync />);

    await waitFor(() => {
      expect(fetchSettings).toHaveBeenCalled();
      expect(mockSetThemeMode).toHaveBeenCalledWith('dark');
      expect(mockSetCustomTheme).toHaveBeenCalledWith({ primary: '#fff' });
      expect(mockSetAccentColor).toHaveBeenCalledWith('#A855F7');
    });
  });

  it('does not re-sync for same user', async () => {
    (useAuthStore as any).mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });
    (fetchSettings as any).mockResolvedValue({
      theme: { mode: 'dark', customTheme: null },
      accentColor: '#A855F7',
    });

    const { rerender } = render(<ThemeSettingsSync />);
    await waitFor(() => {
      expect(fetchSettings).toHaveBeenCalledTimes(1);
    });

    // Re-render with same user
    rerender(<ThemeSettingsSync />);
    // Should not fetch again
    expect(fetchSettings).toHaveBeenCalledTimes(1);
  });

  it('handles fetch error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    (useAuthStore as any).mockReturnValue({ user: { id: 'u1' }, isAuthenticated: true });
    (fetchSettings as any).mockRejectedValue(new Error('Network error'));

    render(<ThemeSettingsSync />);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith('Failed to sync theme settings', expect.any(Error));
    });
    consoleSpy.mockRestore();
  });
});
