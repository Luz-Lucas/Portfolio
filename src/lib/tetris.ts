/** Tetris do menu Iniciar: regras puras e imutáveis, a janela só desenha e chama estas funções. */
export const COLS = 10;
export const ROWS = 20;

export type PieceType = 'I' | 'O' | 'T' | 'S' | 'Z' | 'J' | 'L';
type Shape = number[][];

const SHAPES: Record<PieceType, Shape> = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const PIECE_TYPES = Object.keys(SHAPES) as PieceType[];

export type Cell = PieceType | null;
export type Piece = { type: PieceType; shape: Shape; x: number; y: number };
export type Game = {
  board: Cell[][];
  piece: Piece;
  next: PieceType;
  score: number;
  lines: number;
  level: number;
  over: boolean;
  /** Sorteia a próxima peça (injetável para testes). */
  draw: () => PieceType;
};

const LINE_POINTS = [0, 100, 300, 500, 800];

/** Saco de 7: cada peça aparece uma vez a cada sete, como no Tetris moderno. */
export function bag(random = Math.random): () => PieceType {
  let pool: PieceType[] = [];
  return () => {
    if (!pool.length) pool = [...PIECE_TYPES].sort(() => random() - 0.5);
    return pool.pop()!;
  };
}

const spawn = (type: PieceType): Piece => {
  const shape = SHAPES[type];
  return { type, shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0 };
};

const emptyBoard = (): Cell[][] => Array.from({ length: ROWS }, () => Array<Cell>(COLS).fill(null));

function fits(board: Cell[][], { shape, x, y }: Pick<Piece, 'shape' | 'x' | 'y'>): boolean {
  return shape.every((row, r) =>
    row.every((v, c) => {
      if (!v) return true;
      const bx = x + c;
      const by = y + r;
      return bx >= 0 && bx < COLS && by < ROWS && (by < 0 || !board[by][bx]);
    }),
  );
}

export function newGame(draw: () => PieceType = bag()): Game {
  return { board: emptyBoard(), piece: spawn(draw()), next: draw(), score: 0, lines: 0, level: 1, over: false, draw };
}

export function move(g: Game, dx: number): Game {
  if (g.over) return g;
  const piece = { ...g.piece, x: g.piece.x + dx };
  return fits(g.board, piece) ? { ...g, piece } : g;
}

const rotateShape = (s: Shape): Shape => s[0].map((_, c) => s.map((row) => row[c]).reverse());

/** Gira no sentido horário; se bater, tenta empurrar para os lados (wall kick simples). */
export function rotate(g: Game): Game {
  if (g.over) return g;
  const shape = rotateShape(g.piece.shape);
  for (const kick of [0, -1, 1, -2, 2]) {
    const piece = { ...g.piece, shape, x: g.piece.x + kick };
    if (fits(g.board, piece)) return { ...g, piece };
  }
  return g;
}

function lock(g: Game): Game {
  const board = g.board.map((row) => [...row]);
  const { shape, x, y, type } = g.piece;
  shape.forEach((row, r) => row.forEach((v, c) => v && y + r >= 0 && (board[y + r][x + c] = type)));
  const kept = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - kept.length;
  const filled = [...Array.from({ length: cleared }, () => Array<Cell>(COLS).fill(null)), ...kept];
  const lines = g.lines + cleared;
  const piece = spawn(g.next);
  return {
    ...g,
    board: filled,
    piece,
    next: g.draw(),
    score: g.score + LINE_POINTS[cleared] * g.level,
    lines,
    level: Math.floor(lines / 10) + 1,
    over: !fits(filled, piece),
  };
}

/** Um passo da gravidade: desce uma linha ou trava a peça. */
export function tick(g: Game): Game {
  if (g.over) return g;
  const piece = { ...g.piece, y: g.piece.y + 1 };
  return fits(g.board, piece) ? { ...g, piece } : lock(g);
}

export function hardDrop(g: Game): Game {
  if (g.over) return g;
  let piece = g.piece;
  while (fits(g.board, { ...piece, y: piece.y + 1 })) piece = { ...piece, y: piece.y + 1 };
  return lock({ ...g, piece });
}

/** Linha onde a peça cairia (a "sombra"). */
export function ghostY(g: Game): number {
  let y = g.piece.y;
  while (fits(g.board, { ...g.piece, y: y + 1 })) y++;
  return y;
}

/** Milissegundos entre quedas: mais rápido a cada nível, com piso. */
export const dropInterval = (level: number) => Math.max(80, 800 - (level - 1) * 70);

export const previewShape = (type: PieceType): Shape => SHAPES[type].filter((row) => row.some(Boolean));
