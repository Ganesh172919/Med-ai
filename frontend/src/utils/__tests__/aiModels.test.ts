/**
 * =============================================================================
 * aiModels Utility Tests
 * =============================================================================
 *
 * Tests for the AI model grouping and sorting logic.
 * These tests verify that models are correctly grouped by provider and sorted
 * in a consistent, user-friendly order.
 *
 * WHY THESE TESTS MATTER:
 * - Model grouping affects the UI dropdown display
 * - Provider ordering affects user experience (most popular first)
 * - Edge cases (empty arrays, unknown providers) must be handled gracefully
 * =============================================================================
 */

import { describe, it, expect } from 'vitest';
import { getModelGroups } from '../aiModels';
import type { AIModel } from '../../api/ai';

// ---------------------------------------------------------------------------
// Test helpers
// ---------------------------------------------------------------------------

/** Create a mock AI model with sensible defaults */
function createMockModel(overrides: Partial<AIModel> = {}): AIModel {
  return {
    id: 'test-model',
    provider: 'openrouter',
    label: 'Test Model',
    supportsFiles: false,
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getModelGroups
// ---------------------------------------------------------------------------

describe('getModelGroups', () => {
  it('returns empty array for empty input', () => {
    expect(getModelGroups([])).toEqual([]);
  });

  it('groups models by provider', () => {
    const models: AIModel[] = [
      createMockModel({ id: 'gpt-4', provider: 'openrouter', label: 'GPT-4' }),
      createMockModel({ id: 'gpt-3.5', provider: 'openrouter', label: 'GPT-3.5' }),
      createMockModel({ id: 'gemini-pro', provider: 'gemini', label: 'Gemini Pro' }),
    ];

    const groups = getModelGroups(models);

    expect(groups).toHaveLength(2);
    expect(groups[0].provider).toBe('gemini');
    expect(groups[0].models).toHaveLength(1);
    expect(groups[1].provider).toBe('openrouter');
    expect(groups[1].models).toHaveLength(2);
  });

  it('sorts providers in defined order (gemini first)', () => {
    const models: AIModel[] = [
      createMockModel({ provider: 'groq', label: 'Groq Model' }),
      createMockModel({ provider: 'gemini', label: 'Gemini Model' }),
      createMockModel({ provider: 'openrouter', label: 'OpenRouter Model' }),
    ];

    const groups = getModelGroups(models);

    expect(groups[0].provider).toBe('gemini');
    expect(groups[1].provider).toBe('openrouter');
    expect(groups[2].provider).toBe('groq');
  });

  it('sorts models alphabetically within each provider', () => {
    const models: AIModel[] = [
      createMockModel({ provider: 'openrouter', label: 'Zeta Model' }),
      createMockModel({ provider: 'openrouter', label: 'Alpha Model' }),
      createMockModel({ provider: 'openrouter', label: 'Beta Model' }),
    ];

    const groups = getModelGroups(models);
    const openrouterGroup = groups.find((g) => g.provider === 'openrouter');

    expect(openrouterGroup?.models[0].label).toBe('Alpha Model');
    expect(openrouterGroup?.models[1].label).toBe('Beta Model');
    expect(openrouterGroup?.models[2].label).toBe('Zeta Model');
  });

  it('uses friendly label for known providers', () => {
    const models: AIModel[] = [
      createMockModel({ provider: 'gemini', label: 'Gemini' }),
      createMockModel({ provider: 'openrouter', label: 'OpenRouter' }),
      createMockModel({ provider: 'groq', label: 'Groq' }),
    ];

    const groups = getModelGroups(models);

    expect(groups.find((g) => g.provider === 'gemini')?.label).toBe('Gemini Direct');
    expect(groups.find((g) => g.provider === 'openrouter')?.label).toBe('OpenRouter');
    expect(groups.find((g) => g.provider === 'groq')?.label).toBe('Groq');
  });

  it('uses provider name as label for unknown providers', () => {
    const models: AIModel[] = [
      createMockModel({ provider: 'custom-provider', label: 'Custom' }),
    ];

    const groups = getModelGroups(models);

    expect(groups[0].label).toBe('custom-provider');
  });

  it('places unknown providers after known ones', () => {
    const models: AIModel[] = [
      createMockModel({ provider: 'unknown', label: 'Unknown' }),
      createMockModel({ provider: 'gemini', label: 'Gemini' }),
    ];

    const groups = getModelGroups(models);

    expect(groups[0].provider).toBe('gemini');
    expect(groups[1].provider).toBe('unknown');
  });

  it('handles single model', () => {
    const models: AIModel[] = [
      createMockModel({ id: 'only-one', provider: 'groq', label: 'Only One' }),
    ];

    const groups = getModelGroups(models);

    expect(groups).toHaveLength(1);
    expect(groups[0].models).toHaveLength(1);
  });

  it('does not mutate input array', () => {
    const models: AIModel[] = [
      createMockModel({ provider: 'groq', label: 'Z' }),
      createMockModel({ provider: 'groq', label: 'A' }),
    ];
    const originalOrder = [...models];

    getModelGroups(models);

    expect(models[0].label).toBe(originalOrder[0].label);
    expect(models[1].label).toBe(originalOrder[1].label);
  });
});
