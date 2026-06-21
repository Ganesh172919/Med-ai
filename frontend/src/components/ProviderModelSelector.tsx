/**
 * =============================================================================
 * ProviderModelSelector Component
 * =============================================================================
 *
 * PURPOSE:
 * Dual-selector for choosing an AI API provider and model.
 * Used in SoloChat, Projects, and GroupChat for model selection.
 *
 * FEATURES:
 * - Provider dropdown with grouped models
 * - Model dropdown filtered by selected provider
 * - Compact mode for inline use (e.g., in chat composer)
 * - Loading and empty states
 * - Accessible with proper ARIA labels
 *
 * USAGE:
 *   <ProviderModelSelector
 *     selectedProvider="gemini"
 *     selectedModelId="gemini-pro"
 *     groupedModels={groupedModels}
 *     loadingModels={false}
 *     emptyModelMessage=""
 *     onProviderChange={setProvider}
 *     onModelChange={setModelId}
 *   />
 *
 * PATTERN: Controlled Component
 * All state is managed by the parent. This component only renders
 * the UI and calls the onChange callbacks.
 * =============================================================================
 */

import type { AIModelGroup } from '../utils/aiModels';

/**
 * Props for the ProviderModelSelector component.
 *
 * @property selectedProvider - Currently selected provider key
 * @property selectedModelId - Currently selected model ID
 * @property groupedModels - Models grouped by provider
 * @property loadingModels - Whether models are being fetched
 * @property emptyModelMessage - Message when no models are available
 * @property onProviderChange - Callback when provider selection changes
 * @property onModelChange - Callback when model selection changes
 * @property compact - Whether to use compact inline layout
 */
interface ProviderModelSelectorProps {
  selectedProvider: string;
  selectedModelId: string;
  groupedModels: AIModelGroup[];
  loadingModels: boolean;
  emptyModelMessage: string;
  onProviderChange: (provider: string) => void;
  onModelChange: (modelId: string) => void;
  compact?: boolean;
}

/**
 * Dual-selector for AI provider and model.
 *
 * LAYOUT:
 * - Default: Stacked vertical layout with larger touch targets
 * - Compact: Horizontal row layout for inline use in composers
 *
 * ACCESSIBILITY:
 * - Proper ARIA labels on both selectors
 * - Disabled state when models are loading or unavailable
 * - Semantic HTML with select elements
 */
export default function ProviderModelSelector({
  selectedProvider,
  selectedModelId,
  groupedModels,
  loadingModels,
  emptyModelMessage,
  onProviderChange,
  onModelChange,
  compact = false,
}: ProviderModelSelectorProps) {
  const disabled = loadingModels || groupedModels.length === 0;
  const activeGroup = groupedModels.find((g) => g.provider === selectedProvider);
  const modelsForProvider = activeGroup?.models || [];

  return (
    <div className={compact ? 'flex flex-row gap-2' : 'flex flex-col gap-1.5'}>
      {/* Provider selector */}
      <div
        className={`rounded-2xl border border-navy-700/70 bg-navy-800/80 ${
          compact ? 'min-w-0 flex-1 px-2.5 py-1' : 'px-3.5 py-2.5'
        }`}
      >
        <p className="mb-0.5 text-[9px] uppercase tracking-[0.22em] text-gray-500">
          API Provider
        </p>
        <select
          value={selectedProvider}
          onChange={(e) => onProviderChange(e.target.value)}
          disabled={disabled}
          className={`w-full cursor-pointer bg-transparent text-white focus:outline-none ${
            compact ? 'text-xs font-medium' : 'text-sm font-medium'
          }`}
          aria-label="API Provider"
        >
          {groupedModels.length === 0 ? (
            <option value="">No providers available</option>
          ) : (
            groupedModels.map((group) => (
              <option
                key={group.provider}
                value={group.provider}
                className="bg-navy-900 text-white"
              >
                {group.label}
              </option>
            ))
          )}
        </select>
      </div>

      {/* Model selector */}
      <div
        className={`rounded-2xl border border-navy-700/70 bg-navy-800/80 ${
          compact ? 'min-w-0 flex-1 px-2.5 py-1' : 'px-3.5 py-2.5'
        }`}
      >
        <p className="mb-0.5 text-[9px] uppercase tracking-[0.22em] text-gray-500">
          Model
        </p>
        <select
          value={selectedModelId}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={disabled || modelsForProvider.length === 0}
          className={`w-full cursor-pointer bg-transparent text-white focus:outline-none ${
            compact ? 'text-xs font-medium' : 'text-sm font-medium'
          }`}
          aria-label="Model"
        >
          {modelsForProvider.length === 0 ? (
            <option value="">
              {emptyModelMessage || 'No models for this provider'}
            </option>
          ) : (
            modelsForProvider.map((model) => (
              <option
                key={model.id}
                value={model.id}
                className="bg-navy-900 text-white"
              >
                {model.label}
              </option>
            ))
          )}
        </select>
      </div>
    </div>
  );
}
