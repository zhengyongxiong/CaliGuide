import { describe, expect, test, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import ToastContainer, { showToast } from './Toast';

describe('Toast', () => {
  test('renders without crashing', () => {
    render(<ToastContainer />);
  });

  test('shows toast when showToast is called', async () => {
    render(<ToastContainer />);

    act(() => {
      showToast('success', 'Operation successful');
    });

    expect(screen.getByText('Operation successful')).toBeInTheDocument();
  });

  test('shows different toast types', async () => {
    render(<ToastContainer />);

    act(() => {
      showToast('error', 'Error message');
    });

    expect(screen.getByText('Error message')).toBeInTheDocument();
  });

  test.skip('auto-removes toast after duration', async () => {
    vi.useFakeTimers();
    render(<ToastContainer />);

    act(() => {
      showToast('info', 'Temporary message', 1000);
    });

    expect(screen.getByText('Temporary message')).toBeInTheDocument();

    await act(async () => {
      vi.advanceTimersByTime(1500);
    });

    expect(screen.queryByText('Temporary message')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
