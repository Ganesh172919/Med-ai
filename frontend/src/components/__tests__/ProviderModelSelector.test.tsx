/**
 * =============================================================================
 * ProviderModelSelector Component Tests
 * =============================================================================
 *
 * Tests for the dual AI provider/model selector component.
 *
 * WHY THESE TESTS MATTER:
 * - Model selection is a critical user flow in SoloChat and GroupChat
 * - Provider/model state must be correctly communicated to parent
 * - Loading and empty states must be handled gracefully
 * - Accessibility: proper ARIA labels on selectors
 * =============================================================================
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProviderModelSelector from '../ProviderModelSelector';
import type { AIModelGroup } from '../../utils/aiModels';

const mockGroups: AIModelGroup[] = [
  {
    provider: 'gemini',
    label: 'Gemini',
    models: [
      { id: 'gemini-pro', label: 'Gemini Pro', provider: 'gemini' },
      { id: 'gemini-flash', label: 'Gemini Flash', provider: 'gemini' },
    ],
  },
  {
    provider: 'openrouter',
    label: 'OpenRouter',
    models: [
      { id: 'gpt-4', label: 'GPT-4', provider: 'openrouter' },
    ],
  },
];

describe('ProviderModelSelector', () => {
  it('renders provider and model selectors', () => {
    render(
      <ProviderModelSelector
        selectedProvider="gemini"
        selectedModelId="gemini-pro"
        groupedModels={mockGroups}
        loadingModels={false}
        emptyModelMessage=""
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('API Provider')).toBeInTheDocument();
    expect(screen.getByLabelText('Model')).toBeInTheDocument();
  });

  it('displays all providers in the provider dropdown', () => {
    render(
      <ProviderModelSelector
        selectedProvider="gemini"
        selectedModelId="gemini-pro"
        groupedModels={mockGroups}
        loadingModels={false}
        emptyModelMessage=""
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
      />
    );

    const providerSelect = screen.getByLabelText('API Provider');
    expect(providerSelect).toBeInTheDocument();
    // Check that both providers are in the dropdown
    expect(screen.getByText('Gemini')).toBeInTheDocument();
    expect(screen.getByText('OpenRouter')).toBeInTheDocument();
  });

  it('displays models for the selected provider', () => {
    render(
      <ProviderModelSelector
        selectedProvider="gemini"
        selectedModelId="gemini-pro"
        groupedModels={mockGroups}
        loadingModels={false}
        emptyModelMessage=""
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
      />
    );

    expect(screen.getByText('Gemini Pro')).toBeInTheDocument();
    expect(screen.getByText('Gemini Flash')).toBeInTheDocument();
  });

  it('calls onProviderChange when provider is changed', async () => {
    const onProviderChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ProviderModelSelector
        selectedProvider="gemini"
        selectedModelId="gemini-pro"
        groupedModels={mockGroups}
        loadingModels={false}
        emptyModelMessage=""
        onProviderChange={onProviderChange}
        onModelChange={vi.fn()}
      />
    );

    await user.selectOptions(screen.getByLabelText('API Provider'), 'openrouter');
    expect(onProviderChange).toHaveBeenCalledWith('openrouter');
  });

  it('calls onModelChange when model is changed', async () => {
    const onModelChange = vi.fn();
    const user = userEvent.setup();

    render(
      <ProviderModelSelector
        selectedProvider="gemini"
        selectedModelId="gemini-pro"
        groupedModels={mockGroups}
        loadingModels={false}
        emptyModelMessage=""
        onProviderChange={vi.fn()}
        onModelChange={onModelChange}
      />
    );

    await user.selectOptions(screen.getByLabelText('Model'), 'gemini-flash');
    expect(onModelChange).toHaveBeenCalledWith('gemini-flash');
  });

  it('disables selectors when loading', () => {
    render(
      <ProviderModelSelector
        selectedProvider="gemini"
        selectedModelId="gemini-pro"
        groupedModels={mockGroups}
        loadingModels={true}
        emptyModelMessage=""
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
      />
    );

    expect(screen.getByLabelText('API Provider')).toBeDisabled();
    expect(screen.getByLabelText('Model')).toBeDisabled();
  });

  it('shows empty message when no models available', () => {
    render(
      <ProviderModelSelector
        selectedProvider=""
        selectedModelId=""
        groupedModels={[]}
        loadingModels={false}
        emptyModelMessage="No AI models configured"
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
      />
    );

    expect(screen.getByText('No providers available')).toBeInTheDocument();
    expect(screen.getByText('No AI models configured')).toBeInTheDocument();
  });

  it('applies compact layout when compact prop is true', () => {
    const { container } = render(
      <ProviderModelSelector
        selectedProvider="gemini"
        selectedModelId="gemini-pro"
        groupedModels={mockGroups}
        loadingModels={false}
        emptyModelMessage=""
        onProviderChange={vi.fn()}
        onModelChange={vi.fn()}
        compact
      />
    );

    // Compact mode uses flex-row instead of flex-col
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.className).toContain('flex-row');
  });
});
