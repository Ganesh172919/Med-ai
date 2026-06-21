import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useKeyboardNav, useFocusTrap } from '../useKeyboardNav';
import { type KeyboardEvent } from 'react';

function createKeyEvent(key: string, options?: { shiftKey?: boolean }): KeyboardEvent {
  return {
    key,
    shiftKey: options?.shiftKey ?? false,
    preventDefault: vi.fn(),
  } as unknown as KeyboardEvent;
}

describe('useKeyboardNav', () => {
  it('starts with initial index of -1 by default', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5 }));
    expect(result.current.activeIndex).toBe(-1);
  });

  it('starts with custom initial index', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5, initialIndex: 2 }));
    expect(result.current.activeIndex).toBe(2);
  });

  it('navigates down with ArrowDown in vertical mode', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5 }));

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowDown')));
    expect(result.current.activeIndex).toBe(0);

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowDown')));
    expect(result.current.activeIndex).toBe(1);
  });

  it('navigates up with ArrowUp in vertical mode', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5, initialIndex: 2 }));

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowUp')));
    expect(result.current.activeIndex).toBe(1);
  });

  it('navigates right with ArrowRight in horizontal mode', () => {
    const { result } = renderHook(() =>
      useKeyboardNav({ itemCount: 5, orientation: 'horizontal' })
    );

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowRight')));
    expect(result.current.activeIndex).toBe(0);
  });

  it('loops from last to first when loop is true', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3, initialIndex: 2, loop: true }));

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowDown')));
    expect(result.current.activeIndex).toBe(0);
  });

  it('stops at last item when loop is false', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3, initialIndex: 2, loop: false }));

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowDown')));
    expect(result.current.activeIndex).toBe(2);
  });

  it('stops at first item when loop is false and navigating up', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3, initialIndex: 0, loop: false }));

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowUp')));
    expect(result.current.activeIndex).toBe(0);
  });

  it('loops from first to last when navigating up with loop', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 3, initialIndex: 0, loop: true }));

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowUp')));
    expect(result.current.activeIndex).toBe(2);
  });

  it('jumps to first item on Home', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5, initialIndex: 3 }));

    act(() => result.current.handleKeyDown(createKeyEvent('Home')));
    expect(result.current.activeIndex).toBe(0);
  });

  it('jumps to last item on End', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5 }));

    act(() => result.current.handleKeyDown(createKeyEvent('End')));
    expect(result.current.activeIndex).toBe(4);
  });

  it('calls onSelect on Enter', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNav({ itemCount: 5, initialIndex: 2, onSelect })
    );

    act(() => result.current.handleKeyDown(createKeyEvent('Enter')));
    expect(onSelect).toHaveBeenCalledWith(2);
  });

  it('calls onSelect on Space', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNav({ itemCount: 5, initialIndex: 1, onSelect })
    );

    act(() => result.current.handleKeyDown(createKeyEvent(' ')));
    expect(onSelect).toHaveBeenCalledWith(1);
  });

  it('does not call onSelect when index is -1', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNav({ itemCount: 5, onSelect })
    );

    act(() => result.current.handleKeyDown(createKeyEvent('Enter')));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('calls onEscape and resets index on Escape', () => {
    const onEscape = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNav({ itemCount: 5, initialIndex: 3, onEscape })
    );

    act(() => result.current.handleKeyDown(createKeyEvent('Escape')));
    expect(onEscape).toHaveBeenCalled();
    expect(result.current.activeIndex).toBe(-1);
  });

  it('ignores keys when itemCount is 0', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() =>
      useKeyboardNav({ itemCount: 0, onSelect })
    );

    act(() => result.current.handleKeyDown(createKeyEvent('ArrowDown')));
    expect(result.current.activeIndex).toBe(-1);
  });

  it('setActiveIndex can be called manually', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5 }));

    act(() => result.current.setActiveIndex(3));
    expect(result.current.activeIndex).toBe(3);
  });

  it('calls preventDefault on handled keys', () => {
    const { result } = renderHook(() => useKeyboardNav({ itemCount: 5 }));
    const event = createKeyEvent('ArrowDown');

    act(() => result.current.handleKeyDown(event));
    expect(event.preventDefault).toHaveBeenCalled();
  });
});

describe('useFocusTrap', () => {
  it('returns a callback ref', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    expect(typeof result.current).toBe('function');
  });

  it('returns a ref that works with null', () => {
    const { result } = renderHook(() => useFocusTrap(true));
    // Should not throw
    act(() => result.current(null));
  });
});
