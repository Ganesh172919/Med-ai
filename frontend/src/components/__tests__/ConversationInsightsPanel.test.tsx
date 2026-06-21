import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ConversationInsightsPanel from '../ConversationInsightsPanel';

describe('ConversationInsightsPanel', () => {
  it('renders heading', () => {
    render(<ConversationInsightsPanel heading="Test Insights" insight={null} />);
    expect(screen.getByText('Test Insights')).toBeInTheDocument();
  });

  it('shows subtitle', () => {
    render(<ConversationInsightsPanel heading="Test" insight={null} />);
    expect(screen.getByText('Live conversation intelligence')).toBeInTheDocument();
  });

  it('shows action buttons', () => {
    render(<ConversationInsightsPanel heading="Test" insight={null} />);
    expect(screen.getByText('Summarize')).toBeInTheDocument();
    expect(screen.getByText('Extract tasks')).toBeInTheDocument();
    expect(screen.getByText('Extract decisions')).toBeInTheDocument();
  });

  it('shows empty state when no insight', () => {
    render(<ConversationInsightsPanel heading="Test" insight={null} />);
    expect(screen.getByText(/Insight will appear after/)).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ConversationInsightsPanel heading="Test" insight={null} loading={true} />);
    expect(screen.getByText('Refreshing insight...')).toBeInTheDocument();
  });

  it('calls onAction when Summarize clicked', () => {
    const onAction = vi.fn();
    render(<ConversationInsightsPanel heading="Test" insight={null} onAction={onAction} />);
    fireEvent.click(screen.getByText('Summarize'));
    expect(onAction).toHaveBeenCalledWith('summarize');
  });

  it('calls onAction when Extract tasks clicked', () => {
    const onAction = vi.fn();
    render(<ConversationInsightsPanel heading="Test" insight={null} onAction={onAction} />);
    fireEvent.click(screen.getByText('Extract tasks'));
    expect(onAction).toHaveBeenCalledWith('extract-tasks');
  });

  it('calls onAction when Extract decisions clicked', () => {
    const onAction = vi.fn();
    render(<ConversationInsightsPanel heading="Test" insight={null} onAction={onAction} />);
    fireEvent.click(screen.getByText('Extract decisions'));
    expect(onAction).toHaveBeenCalledWith('extract-decisions');
  });

  it('shows insight summary when provided', () => {
    const insight = {
      title: 'Test Title',
      summary: 'This is a test summary',
      intent: 'discussion',
      topics: ['test'],
      decisions: ['Decision 1'],
      actionItems: [{ text: 'Task 1', owner: null, done: false }],
    };
    render(<ConversationInsightsPanel heading="Test" insight={insight} />);
    expect(screen.getByText('This is a test summary')).toBeInTheDocument();
  });

  it('shows insight topics when provided', () => {
    const insight = {
      title: 'Test',
      summary: 'Summary',
      intent: 'discussion',
      topics: ['javascript', 'react'],
      decisions: [],
      actionItems: [],
    };
    render(<ConversationInsightsPanel heading="Test" insight={insight} />);
    expect(screen.getByText('javascript')).toBeInTheDocument();
    expect(screen.getByText('react')).toBeInTheDocument();
  });
});
