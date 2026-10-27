import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { BiosScreen } from '@/scene/BiosScreen';

describe('BiosScreen', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('shows the Luz BIOS header right away', () => {
    render(<BiosScreen />);
    expect(screen.getByText(/Luz BIOS v4\.00/)).toBeInTheDocument();
  });

  it('counts memory up and detects the drives over time', () => {
    render(<BiosScreen />);
    expect(screen.queryByText(/React/)).not.toBeInTheDocument();
    act(() => {
      vi.advanceTimersByTime(2800);
    });
    expect(screen.getByText(/65536K OK/)).toBeInTheDocument();
    expect(screen.getByText(/React/)).toBeInTheDocument();
    expect(screen.getByText(/Iniciando Luz 95/)).toBeInTheDocument();
  });
});
