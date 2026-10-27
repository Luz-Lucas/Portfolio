import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Taskbar } from '@/desktop/Taskbar';
import { useWindowStore } from '@/desktop/windowStore';

describe('Taskbar clock and calendar', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 26, 14, 5));
    useWindowStore.getState().reset();
  });
  afterEach(() => vi.useRealTimers());

  it('opens a calendar of the current month from the clock', () => {
    render(<Taskbar onOpen={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Relógio 14:05/ }));
    const cal = screen.getByRole('dialog', { name: 'Calendário' });
    expect(cal).toHaveTextContent('Outubro de 2026');
    expect(screen.getByRole('button', { name: '26 de outubro (hoje)' })).toHaveAttribute('aria-current', 'date');
  });

  it('easter egg: clicking today shows the open-to-work notification', () => {
    const onOpen = vi.fn();
    render(<Taskbar onOpen={onOpen} />);
    fireEvent.click(screen.getByRole('button', { name: /Relógio/ }));
    fireEvent.click(screen.getByRole('button', { name: '26 de outubro (hoje)' }));
    expect(screen.getByRole('status')).toHaveTextContent('Aberto para trabalho');
    fireEvent.click(screen.getByRole('button', { name: 'Falar comigo' }));
    expect(onOpen).toHaveBeenCalledWith('contact');
  });

  it('Escape closes the calendar', () => {
    render(<Taskbar onOpen={() => {}} />);
    fireEvent.click(screen.getByRole('button', { name: /Relógio/ }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog', { name: 'Calendário' })).not.toBeInTheDocument();
  });
});
