/**
 * =============================================================================
 * useKeyboardNav Hook
 * =============================================================================
 *
 * PURPOSE:
 * Provides keyboard navigation support for lists, menus, and other
 * interactive collections. Enables arrow key navigation, Enter/Space
 * selection, and Home/End jumping.
 *
 * WHY THIS EXISTS:
 * Keyboard navigation is essential for accessibility:
 * - Users with motor disabilities rely on keyboard
 * - Screen reader users navigate with keyboard
 * - Power users prefer keyboard for speed
 * - WCAG 2.1 requires keyboard accessibility (Level A)
 *
 * USAGE:
 *   const { activeIndex, setActiveIndex, handleKeyDown } = useKeyboardNav({
 *     itemCount: items.length,
 *     onSelect: (index) => handleSelect(items[index]),
 *     orientation: 'vertical',
 *   });
 *
 *   <ul onKeyDown={handleKeyDown}>
 *     {items.map((item, i) => (
 *       <li
 *         key={item.id}
 *         className={i === activeIndex ? 'active' : ''}
 *         onMouseEnter={() => setActiveIndex(i)}
 *       >
 *         {item.name}
 *       </li>
 *     ))}
 *   </ul>
 *
 * KEYBOARD SHORTCUTS:
 * - ArrowDown/ArrowRight: Next item
 * - ArrowUp/ArrowLeft: Previous item
 * - Home: First item
 * - End: Last item
 * - Enter/Space: Select current item
 * - Escape: Deselect / close
 *
 * LEARNING NOTES:
 * - This follows the WAI-ARIA design pattern for composite widgets
 * - The "roving tabindex" pattern is used for focus management
 * - Active index tracks which item is visually highlighted
 * - Only the active item has tabIndex={0}, others have tabIndex={-1}
 * =============================================================================
 */

import { useState, useCallback, type KeyboardEvent } from 'react';

/**
 * Configuration options for the keyboard navigation hook.
 *
 * @property itemCount - Total number of navigable items
 * @property onSelect - Callback when an item is selected (Enter/Space)
 * @property onEscape - Callback when Escape is pressed (optional)
 * @property orientation - Navigation direction: 'vertical' or 'horizontal'
 * @property loop - Whether navigation wraps around at boundaries (default: true)
 * @property initialIndex - Starting active index (default: -1, no selection)
 */
interface UseKeyboardNavOptions {
  itemCount: number;
  onSelect?: (index: number) => void;
  onEscape?: () => void;
  orientation?: 'vertical' | 'horizontal';
  loop?: boolean;
  initialIndex?: number;
}

/**
 * Return value from the keyboard navigation hook.
 *
 * @property activeIndex - Currently highlighted item index (-1 if none)
 * @property setActiveIndex - Manually set the active index
 * @property handleKeyDown - Keyboard event handler to attach to the container
 */
interface UseKeyboardNavReturn {
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  handleKeyDown: (event: KeyboardEvent) => void;
}

/**
 * Keyboard navigation hook for list-like components.
 *
 * PATTERN: Roving Tabindex
 * Instead of making every item focusable, only the "active" item has
 * tabIndex={0}. All others have tabIndex={-1}. Arrow keys move the
 * active item, which effectively moves focus.
 *
 * WHY THIS PATTERN:
 * - Reduces Tab stops (users don't have to Tab through every item)
 * - Arrow keys are expected for list navigation
 * - Screen readers announce the active item
 * - Matches native <select> and <menu> behavior
 *
 * COMPLEXITY:
 * - Time: O(1) for all operations
 * - Space: O(1) - only stores active index
 *
 * EDGE CASES:
 * - Empty list (itemCount === 0): No navigation, onSelect never fires
 * - Single item: Can select but not navigate
 * - Loop disabled: Arrow keys stop at boundaries
 *
 * @param options - Configuration options
 * @returns Navigation state and handlers
 */
export function useKeyboardNav({
  itemCount,
  onSelect,
  onEscape,
  orientation = 'vertical',
  loop = true,
  initialIndex = -1,
}: UseKeyboardNavOptions): UseKeyboardNavReturn {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  /**
   * Handle keyboard events on the container.
   *
   * KEY MAPPING:
   * - Vertical: ArrowUp/ArrowDown for navigation
   * - Horizontal: ArrowLeft/ArrowRight for navigation
   * - Both: Home/End for jumping, Enter/Space for selection
   *
   * WHY PREVENT DEFAULT:
   * Arrow keys scroll the page by default. We prevent this when
   * we handle the key ourselves to avoid unexpected scrolling.
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (itemCount === 0) return;

      const isVertical = orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

      switch (event.key) {
        case nextKey: {
          event.preventDefault();
          setActiveIndex((prev) => {
            if (prev >= itemCount - 1) {
              return loop ? 0 : prev;
            }
            return prev + 1;
          });
          break;
        }

        case prevKey: {
          event.preventDefault();
          setActiveIndex((prev) => {
            if (prev <= 0) {
              return loop ? itemCount - 1 : prev;
            }
            return prev - 1;
          });
          break;
        }

        case 'Home': {
          event.preventDefault();
          setActiveIndex(0);
          break;
        }

        case 'End': {
          event.preventDefault();
          setActiveIndex(itemCount - 1);
          break;
        }

        case 'Enter':
        case ' ': {
          event.preventDefault();
          if (activeIndex >= 0 && activeIndex < itemCount) {
            onSelect?.(activeIndex);
          }
          break;
        }

        case 'Escape': {
          event.preventDefault();
          setActiveIndex(-1);
          onEscape?.();
          break;
        }
      }
    },
    [itemCount, orientation, loop, activeIndex, onSelect, onEscape]
  );

  return {
    activeIndex,
    setActiveIndex,
    handleKeyDown,
  };
}

/**
 * Hook for managing focus trap within a container.
 *
 * WHY FOCUS TRAP:
 * When a modal or dialog is open, Tab should cycle within the dialog
 * only, not escape to the page behind. This is required for WCAG compliance.
 *
 * USAGE:
 *   const trapRef = useFocusTrap(isOpen);
 *   <div ref={trapRef}>...</div>
 *
 * @param active - Whether the trap is active
 * @returns Ref to attach to the trapping container
 */
export function useFocusTrap(active: boolean) {
  const containerRef = useCallback(
    (node: HTMLElement | null) => {
      if (!node || !active) return;

      const focusable = node.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (focusable.length === 0) return;

      const firstFocusable = focusable[0];
      const lastFocusable = focusable[focusable.length - 1];

      // Focus first element
      firstFocusable.focus();

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;

        if (e.shiftKey) {
          // Shift+Tab: If at first, go to last
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab: If at last, go to first
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      };

      node.addEventListener('keydown', handleKeyDown as EventListener);
      return () => node.removeEventListener('keydown', handleKeyDown as EventListener);
    },
    [active]
  );

  return containerRef;
}
