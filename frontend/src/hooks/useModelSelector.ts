/**
 * =============================================================================
 * useModelSelector Hook
 * =============================================================================
 *
 * PURPOSE:
 * Shared hook for AI model/provider selection across SoloChat, GroupChat,
 * and Projects pages. Eliminates ~50 lines of duplicated logic per page.
 *
 * FEATURES:
 * - Fetches available models on mount
 * - Restores last-selected model from localStorage
 * - Persists selection changes to localStorage
 * - Computes derived state (activeModel, groupedModels)
 * - Handles loading and error states
 *
 * USAGE:
 * ```tsx
 * const { availableModels, selectedModelId, setSelectedModelId,
 *         activeModel, groupedModels, loadingModels, emptyModelMessage
 * } = useModelSelector('chatsphere.solo');
 * ```
 *
 * WHY THIS EXISTS:
 * SoloChat, GroupChat, and Projects all had identical model-loading logic:
 * fetch → filter → restore from localStorage → set state → persist on change.
 * This hook centralizes that pattern with configurable storage keys and options.
 * =============================================================================
 */

import { useEffect, useMemo, useState } from 'react';
import { fetchAvailableModels, type AIModel } from '../api/ai';
import { getModelGroups, type AIModelGroup } from '../utils/aiModels';

interface UseModelSelectorOptions {
  /** Whether to include the 'auto' model in the list (default: false) */
  includeAuto?: boolean;
}

interface UseModelSelectorReturn {
  /** All available AI models (filtered by includeAuto) */
  availableModels: AIModel[];
  /** Currently selected model ID */
  selectedModelId: string;
  /** Update the selected model ID */
  setSelectedModelId: (id: string) => void;
  /** The currently active model object (or first available, or null) */
  activeModel: AIModel | null;
  /** Models grouped by provider, sorted for display */
  groupedModels: AIModelGroup[];
  /** Whether models are still loading */
  loadingModels: boolean;
  /** Message to show when no models are available */
  emptyModelMessage: string;
}

/**
 * Custom hook for AI model selection with localStorage persistence.
 *
 * WHY: Three pages shared identical model-fetching and persistence logic.
 * Extracting this hook reduces duplication from ~50 lines per page to 1 line.
 *
 * PATTERN: Data-fetching hook with localStorage sync.
 * Similar to a "controlled select" pattern — the hook owns the state
 * and persistence, the component just renders the selector.
 *
 * @param storageKey - Base localStorage key (e.g., 'chatsphere.solo')
 *   The hook appends '.model' to create the full key.
 * @param options - Configuration options
 * @returns Model selection state and setters
 */
export function useModelSelector(
  storageKey: string,
  options: UseModelSelectorOptions = {}
): UseModelSelectorReturn {
  const { includeAuto = false } = options;
  const modelStorageKey = `${storageKey}.model`;

  const [availableModels, setAvailableModels] = useState<AIModel[]>([]);
  const [selectedModelId, setSelectedModelId] = useState('');
  const [loadingModels, setLoadingModels] = useState(true);
  const [emptyModelMessage, setEmptyModelMessage] = useState('');

  // Derive the active model object from the selected ID
  // Falls back to the first available model, then null
  const activeModel = useMemo(
    () => availableModels.find((m) => m.id === selectedModelId) || availableModels[0] || null,
    [availableModels, selectedModelId]
  );

  // Group models by provider for the selector UI
  const groupedModels = useMemo(() => getModelGroups(availableModels), [availableModels]);

  // Fetch models on mount and restore from localStorage
  useEffect(() => {
    let cancelled = false;

    const loadModels = async () => {
      setLoadingModels(true);
      try {
        const result = await fetchAvailableModels();
        if (cancelled) return;

        // Filter out 'auto' unless explicitly included
        const visibleModels = includeAuto
          ? result.models
          : result.models.filter((m) => m.id !== 'auto');

        setAvailableModels(visibleModels);
        setEmptyModelMessage(result.emptyStateMessage || '');

        // Restore from localStorage or use default
        const stored = localStorage.getItem(modelStorageKey);
        const isValid = visibleModels.some((m) => m.id === stored);
        const preferred =
          result.defaultModelId && result.defaultModelId !== 'auto'
            ? result.defaultModelId
            : visibleModels[0]?.id || '';

        setSelectedModelId(isValid ? String(stored) : preferred);
      } catch (error) {
        console.error('Failed to load AI models', error);
        if (cancelled) return;
        setAvailableModels([]);
        setSelectedModelId('');
        setEmptyModelMessage('No AI models are configured. Add provider API keys in backend/.env.');
      } finally {
        if (!cancelled) setLoadingModels(false);
      }
    };

    void loadModels();
    return () => { cancelled = true; };
  }, [modelStorageKey, includeAuto]); // eslint-disable-line react-hooks/exhaustive-deps

  // Persist selection to localStorage on change
  useEffect(() => {
    if (selectedModelId) {
      localStorage.setItem(modelStorageKey, selectedModelId);
    }
  }, [selectedModelId, modelStorageKey]);

  return {
    availableModels,
    selectedModelId,
    setSelectedModelId,
    activeModel,
    groupedModels,
    loadingModels,
    emptyModelMessage,
  };
}
