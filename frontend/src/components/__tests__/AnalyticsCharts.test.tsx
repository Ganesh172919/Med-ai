import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BarChart, MiniStat, TopRoomsTable } from '../AnalyticsCharts';

describe('BarChart', () => {
  it('renders chart with data', () => {
    const data = [
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 20 },
    ];
    render(<BarChart data={data} />);
    expect(document.querySelector('.flex.items-end')).toBeInTheDocument();
  });

  it('renders x-axis labels', () => {
    const data = [
      { date: '2024-01-01', count: 10 },
      { date: '2024-01-02', count: 20 },
    ];
    render(<BarChart data={data} />);
    // Labels show every other item (i % 2 === 0)
    expect(screen.getByText('01')).toBeInTheDocument();
  });

  it('renders label', () => {
    const data = [{ date: '2024-01-01', count: 10 }];
    render(<BarChart data={data} label="Messages" />);
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });

  it('limits to 14 items', () => {
    const data = Array.from({ length: 20 }, (_, i) => ({
      date: `2024-01-${String(i + 1).padStart(2, '0')}`,
      count: i * 10,
    }));
    const { container } = render(<BarChart data={data} />);
    const bars = container.querySelectorAll('.flex-1.flex.flex-col.items-center');
    expect(bars.length).toBe(14);
  });
});

describe('MiniStat', () => {
  it('renders label', () => {
    render(<MiniStat label="Total Users" value={100} />);
    expect(screen.getByText('Total Users')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<MiniStat label="Total Users" value={100} />);
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<MiniStat label="Status" value="Active" />);
    expect(screen.getByText('Active')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    render(<MiniStat label="Users" value={50} icon="👥" />);
    expect(screen.getByText('👥')).toBeInTheDocument();
  });

  it('renders up trend', () => {
    render(<MiniStat label="Growth" value={25} trend="up" />);
    expect(screen.getByText('↑')).toBeInTheDocument();
  });

  it('renders down trend', () => {
    render(<MiniStat label="Growth" value={-5} trend="down" />);
    expect(screen.getByText('↓')).toBeInTheDocument();
  });

  it('renders neutral trend', () => {
    render(<MiniStat label="Growth" value={0} trend="neutral" />);
    expect(screen.getByText('–')).toBeInTheDocument();
  });
});

describe('TopRoomsTable', () => {
  it('renders room names', () => {
    const rooms = [
      { roomId: '1', name: 'General', messageCount: 100, lastActivity: '2024-01-01' },
      { roomId: '2', name: 'Random', messageCount: 50, lastActivity: '2024-01-01' },
    ];
    render(<TopRoomsTable rooms={rooms} />);
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Random')).toBeInTheDocument();
  });

  it('renders message counts', () => {
    const rooms = [
      { roomId: '1', name: 'General', messageCount: 1234, lastActivity: '2024-01-01' },
    ];
    render(<TopRoomsTable rooms={rooms} />);
    expect(screen.getByText('1,234')).toBeInTheDocument();
  });

  it('renders row numbers', () => {
    const rooms = [
      { roomId: '1', name: 'Room A', messageCount: 100, lastActivity: '2024-01-01' },
      { roomId: '2', name: 'Room B', messageCount: 50, lastActivity: '2024-01-01' },
    ];
    render(<TopRoomsTable rooms={rooms} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
  });

  it('shows empty state when no rooms', () => {
    render(<TopRoomsTable rooms={[]} />);
    expect(screen.getByText('No data yet')).toBeInTheDocument();
  });

  it('renders table headers', () => {
    render(<TopRoomsTable rooms={[]} />);
    expect(screen.getByText('Room')).toBeInTheDocument();
    expect(screen.getByText('Messages')).toBeInTheDocument();
  });
});
