import { describe, expect, test } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from './ProgressBar';

describe('ProgressBar', () => {
  test('renders correctly', () => {
    const { container } = render(<ProgressBar value={50} />);
    expect(container.firstChild).toBeInTheDocument();
  });

  test('shows label when showLabel is true', () => {
    render(<ProgressBar value={50} max={100} showLabel />);
    expect(screen.getByText('50 / 100')).toBeInTheDocument();
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('hides label by default', () => {
    render(<ProgressBar value={50} />);
    expect(screen.queryByText('50%')).not.toBeInTheDocument();
  });

  test('calculates percentage correctly', () => {
    render(<ProgressBar value={25} max={50} showLabel />);
    expect(screen.getByText('50%')).toBeInTheDocument();
  });

  test('caps at 100%', () => {
    render(<ProgressBar value={150} max={100} showLabel />);
    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  test('applies correct color class', () => {
    const { container } = render(<ProgressBar value={50} color="success" />);
    const bar = container.querySelector('.bg-success');
    expect(bar).toBeInTheDocument();
  });

  test('applies correct size class', () => {
    const { container } = render(<ProgressBar value={50} size="lg" />);
    const bar = container.querySelector('.h-3');
    expect(bar).toBeInTheDocument();
  });
});
