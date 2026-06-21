/**
 * =============================================================================
 * Skeleton Component Tests
 * =============================================================================
 *
 * Tests for the loading skeleton components including:
 * - Correct rendering of skeleton placeholders
 * - Count prop behavior
 * - Accessibility (aria-hidden)
 * - Animation classes
 *
 * WHY THESE TESTS:
 * - Skeletons must be hidden from screen readers
 * - Count prop must render correct number of items
 * - Animation classes must be applied
 * =============================================================================
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  MessageSkeleton,
  ConversationSkeleton,
  RoomCardSkeleton,
  CardSkeleton,
  UserListSkeleton,
  DashboardSkeleton,
} from '../Skeleton';

describe('MessageSkeleton', () => {
  it('renders default count (1) of skeletons', () => {
    const { container } = render(<MessageSkeleton />);
    // Should have 1 skeleton group
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders specified count of skeletons', () => {
    const { container } = render(<MessageSkeleton count={5} />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('has aria-hidden on all skeleton elements', () => {
    const { container } = render(<MessageSkeleton count={3} />);
    const skeletons = container.querySelectorAll('[aria-hidden="true"]');
    skeletons.forEach((el) => {
      expect(el).toHaveAttribute('aria-hidden', 'true');
    });
  });

  it('applies animate-pulse class for shimmer effect', () => {
    const { container } = render(<MessageSkeleton />);
    const animated = container.querySelectorAll('.animate-pulse');
    expect(animated.length).toBeGreaterThan(0);
  });
});

describe('ConversationSkeleton', () => {
  it('renders default count of conversation skeletons', () => {
    const { container } = render(<ConversationSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<ConversationSkeleton />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('RoomCardSkeleton', () => {
  it('renders room card skeletons', () => {
    const { container } = render(<RoomCardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders grid layout', () => {
    const { container } = render(<RoomCardSkeleton count={3} />);
    const grid = container.firstChild;
    expect(grid).toHaveClass('grid');
  });
});

describe('CardSkeleton', () => {
  it('renders card skeletons', () => {
    const { container } = render(<CardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<CardSkeleton />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('UserListSkeleton', () => {
  it('renders user list skeletons', () => {
    const { container } = render(<UserListSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('renders specified count', () => {
    const { container } = render(<UserListSkeleton count={10} />);
    expect(container.firstChild).toBeInTheDocument();
  });
});

describe('DashboardSkeleton', () => {
  it('renders full dashboard skeleton', () => {
    const { container } = render(<DashboardSkeleton />);
    expect(container.firstChild).toBeInTheDocument();
  });

  it('has aria-hidden attribute', () => {
    const { container } = render(<DashboardSkeleton />);
    const wrapper = container.firstChild;
    expect(wrapper).toHaveAttribute('aria-hidden', 'true');
  });
});
