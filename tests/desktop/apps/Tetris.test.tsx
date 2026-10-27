import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Tetris } from '@/desktop/apps/Tetris';

describe('Tetris', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });
  afterEach(() => vi.useRealTimers());

  const board = () => screen.getByRole('application', { name: 'Tetris' });
  const filled = () => board().querySelectorAll('.p3d-tetris-board [data-cell]:not([data-cell=""])').length;

  it('starts paused until the player presses Jogar', () => {
    render(<Tetris />);
    expect(screen.getByText('0', { selector: '[data-stat="score"]' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    expect(filled()).toBe(4);
  });

  it('gravity moves the piece down over time', () => {
    render(<Tetris />);
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    const top = () => Math.min(...[...board().querySelectorAll('.p3d-tetris-board [data-active]')].map((c) => Number(c.getAttribute('data-row'))));
    const before = top();
    act(() => {
      vi.advanceTimersByTime(1700);
    });
    expect(top()).toBeGreaterThan(before);
  });

  it('keyboard controls move and drop the piece', () => {
    render(<Tetris />);
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    const cols = () => [...board().querySelectorAll('.p3d-tetris-board [data-active]')].map((c) => Number(c.getAttribute('data-col')));
    const left = Math.min(...cols());
    fireEvent.keyDown(board(), { key: 'ArrowLeft' });
    expect(Math.min(...cols())).toBe(left - 1);
    fireEvent.keyDown(board(), { key: ' ' });
    // a peça travou no fundo e uma nova apareceu no topo
    expect(filled()).toBe(8);
  });

  it('keeps playing when focus moves inside the game, pauses when it leaves', () => {
    render(
      <>
        <Tetris />
        <button type="button">fora</button>
      </>,
    );
    const play = screen.getByRole('button', { name: 'Jogar' });
    play.focus();
    fireEvent.click(play);
    fireEvent.blur(play, { relatedTarget: board() });
    expect(screen.queryByText('Pausado')).not.toBeInTheDocument();
    fireEvent.blur(board(), { relatedTarget: screen.getByRole('button', { name: 'fora' }) });
    expect(screen.getByText('Pausado')).toBeInTheDocument();
  });

  it('P pauses and resumes', () => {
    render(<Tetris />);
    fireEvent.click(screen.getByRole('button', { name: 'Jogar' }));
    fireEvent.keyDown(board(), { key: 'p' });
    expect(screen.getByText('Pausado')).toBeInTheDocument();
    fireEvent.keyDown(board(), { key: 'p' });
    expect(screen.queryByText('Pausado')).not.toBeInTheDocument();
  });

  it('has touch buttons for phones', () => {
    render(<Tetris />);
    for (const name of ['Esquerda', 'Girar', 'Direita', 'Descer', 'Soltar']) {
      expect(screen.getByRole('button', { name })).toBeInTheDocument();
    }
  });
});
