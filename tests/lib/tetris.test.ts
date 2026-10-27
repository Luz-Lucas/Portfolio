import { describe, expect, it } from 'vitest';
import { COLS, ROWS, dropInterval, hardDrop, move, newGame, rotate, tick, type Game } from '@/lib/tetris';

/** Sempre a mesma peça: deixa os testes determinísticos. */
const only = (type: 'I' | 'O' | 'T') => () => type;

const cellsOf = (g: Game) => g.board.flat().filter(Boolean).length;

describe('tetris', () => {
  it('starts with an empty 10x20 board and a piece at the top', () => {
    const g = newGame(only('T'));
    expect(g.board).toHaveLength(ROWS);
    expect(g.board[0]).toHaveLength(COLS);
    expect(cellsOf(g)).toBe(0);
    expect(g.piece.y).toBe(0);
    expect(g.score).toBe(0);
    expect(g.over).toBe(false);
  });

  it('moves sideways until the wall', () => {
    let g = newGame(only('O'));
    for (let i = 0; i < 20; i++) g = move(g, -1);
    expect(g.piece.x).toBe(0);
    for (let i = 0; i < 20; i++) g = move(g, 1);
    expect(g.piece.x).toBe(COLS - 2);
  });

  it('hard drop locks the piece on the floor and spawns the next one', () => {
    const g = hardDrop(newGame(only('O')));
    expect(g.board[ROWS - 1].filter(Boolean)).toHaveLength(2);
    expect(g.board[ROWS - 2].filter(Boolean)).toHaveLength(2);
    expect(g.piece.y).toBe(0);
  });

  it('tick moves down one row, then locks when it cannot', () => {
    let g = newGame(only('O'));
    g = tick(g);
    expect(g.piece.y).toBe(1);
    for (let i = 0; i < ROWS; i++) g = tick(g);
    expect(cellsOf(g)).toBeGreaterThanOrEqual(4);
  });

  it('clears full lines and scores them (two lines at level 1 = 300)', () => {
    // 5 quadrados lado a lado completam as duas linhas de baixo
    let g = newGame(only('O'));
    for (let x = 0; x < COLS; x += 2) {
      while (g.piece.x > x) g = move(g, -1);
      while (g.piece.x < x) g = move(g, 1);
      g = hardDrop(g);
    }
    expect(g.lines).toBe(2);
    expect(g.score).toBe(300);
    expect(cellsOf(g)).toBe(0);
  });

  it('rotates, kicking off the wall when needed', () => {
    let g = newGame(only('I'));
    const before = g.piece.shape;
    g = rotate(g);
    expect(g.piece.shape).not.toEqual(before);
    for (let i = 0; i < 20; i++) g = move(g, 1);
    const rotated = rotate(g);
    expect(rotated.piece.shape).not.toEqual(g.piece.shape);
    expect(rotated.piece.x + rotated.piece.shape[0].length).toBeLessThanOrEqual(COLS);
  });

  it('ends the game when a new piece has no room', () => {
    let g = newGame(only('O'));
    for (let i = 0; i < ROWS; i++) g = hardDrop(g);
    expect(g.over).toBe(true);
    const frozen = move(tick(g), 1);
    expect(frozen).toBe(g);
  });

  it('speeds up with the level, with a floor', () => {
    expect(dropInterval(1)).toBeGreaterThan(dropInterval(5));
    expect(dropInterval(99)).toBeGreaterThanOrEqual(80);
  });
});
