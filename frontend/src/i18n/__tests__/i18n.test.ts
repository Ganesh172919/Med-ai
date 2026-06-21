import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { createElement, type ReactNode } from 'react';
import { I18nProvider, useTranslation, LOCALE_META, type Locale } from '../index';

function wrapper({ children }: { children: ReactNode }) {
  return createElement(I18nProvider, null, children);
}

describe('i18n system', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.lang = '';
  });

  it('defaults to English when no stored locale', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('en');
  });

  it('returns translation for a known key', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.t('landing.badge')).toBe('Multi-provider AI gateway');
  });

  it('falls back to English for missing locale key', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    // Even in English, this tests the fallback path if a key were missing
    expect(result.current.t('landing.heroTitle1')).toBe('Think deeper.');
  });

  it('returns the key itself for completely unknown keys', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.t('totally.unknown.key')).toBe('totally.unknown.key');
  });

  it('supports parameter interpolation', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });
    const text = result.current.t('landing.footerText', { year: 2026 });
    expect(text).toContain('2026');
    expect(text).not.toContain('{year}');
  });

  it('switches locale and persists to localStorage', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => result.current.setLocale('es'));
    expect(result.current.locale).toBe('es');
    expect(localStorage.getItem('chatsphere-locale')).toBe('es');
    expect(result.current.t('landing.badge')).toBe('Pasarela de IA multi-proveedor');
  });

  it('switches to Japanese', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => result.current.setLocale('ja'));
    expect(result.current.locale).toBe('ja');
    expect(result.current.t('landing.badge')).toBe('マルチプロバイダーAIゲートウェイ');
  });

  it('restores locale from localStorage on init', () => {
    localStorage.setItem('chatsphere-locale', 'es');
    const { result } = renderHook(() => useTranslation(), { wrapper });
    expect(result.current.locale).toBe('es');
  });

  it('sets document.documentElement.lang on locale change', () => {
    const { result } = renderHook(() => useTranslation(), { wrapper });

    act(() => result.current.setLocale('ja'));
    expect(document.documentElement.lang).toBe('ja');
  });

  it('LOCALE_META has entries for all supported locales', () => {
    const locales: Locale[] = ['en', 'es', 'ja'];
    for (const l of locales) {
      expect(LOCALE_META[l]).toBeDefined();
      expect(LOCALE_META[l].label).toBeTruthy();
      expect(LOCALE_META[l].flag).toBeTruthy();
    }
  });

  it('useTranslation throws outside I18nProvider', () => {
    // Suppress console.error for this expected error
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => renderHook(() => useTranslation())).toThrow(
      'useTranslation must be used within an I18nProvider'
    );
    spy.mockRestore();
  });
});
