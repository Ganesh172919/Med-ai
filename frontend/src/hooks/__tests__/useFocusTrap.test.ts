import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFocusTrap } from '../useKeyboardNav';

describe('useFocusTrap', () => {
  it('returns a callback ref', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    expect(typeof result.current).toBe('function');
  });

  it('returns a callback ref when inactive', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    expect(typeof result.current).toBe('function');
  });

  it('does nothing when node is null', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    // Should not throw when called with null
    expect(() => result.current(null)).not.toThrow();
  });

  it('does nothing when inactive', () => {
    const { result } = renderHook(() => useFocusTrap(false));
    const node = document.createElement('div');
    // Should not throw when called with a node while inactive
    expect(() => result.current(node)).not.toThrow();
  });

  it('focuses first element when active', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    const container = document.createElement('div');
    const button1 = document.createElement('button');
    const button2 = document.createElement('button');
    container.appendChild(button1);
    container.appendChild(button2);
    document.body.appendChild(container);

    const focusSpy = vi.spyOn(button1, 'focus');
    result.current(container);

    expect(focusSpy).toHaveBeenCalled();

    document.body.removeChild(container);
  });

  it('does nothing when no focusable elements', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Should not throw
    expect(() => result.current(container)).not.toThrow();

    document.body.removeChild(container);
  });
});
