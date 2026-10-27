'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import {
  COLS,
  dropInterval,
  ghostY,
  hardDrop,
  move,
  newGame,
  previewShape,
  rotate,
  tick,
  type Cell,
  type Game,
} from '@/lib/tetris';

type Status = 'idle' | 'playing' | 'paused' | 'over';

const BEST_KEY = 'p3d:tetris-best';

function readBest(): number {
  try {
    return Number(localStorage.getItem(BEST_KEY)) || 0;
  } catch {
    return 0;
  }
}

function saveBest(score: number) {
  try {
    localStorage.setItem(BEST_KEY, String(score));
  } catch {}
}

/** Tabuleiro com a peça ativa e a sombra de onde ela vai cair. */
function compose(g: Game) {
  const cells = g.board.map((row) => row.map((type) => ({ type, active: false, ghost: false })));
  const gy = ghostY(g);
  g.piece.shape.forEach((row, r) =>
    row.forEach((v, c) => {
      const x = g.piece.x + c;
      if (!v) return;
      if (cells[gy + r]?.[x] && !cells[gy + r][x].type) cells[gy + r][x].ghost = true;
      if (cells[g.piece.y + r]?.[x]) cells[g.piece.y + r][x] = { type: g.piece.type, active: true, ghost: false };
    }),
  );
  return cells;
}

export function Tetris() {
  const [game, setGame] = useState<Game>(() => newGame());
  const [status, setStatus] = useState<Status>('idle');
  const [best, setBest] = useState(0);
  const boardRef = useRef<HTMLDivElement>(null);

  useEffect(() => setBest(readBest()), []);

  // Gravidade: um passo a cada intervalo do nível atual.
  useEffect(() => {
    if (status !== 'playing') return;
    const t = setTimeout(() => setGame(tick), dropInterval(game.level));
    return () => clearTimeout(t);
  }, [status, game]);

  useEffect(() => {
    if (!game.over || status !== 'playing') return;
    setStatus('over');
    if (game.score > best) {
      setBest(game.score);
      saveBest(game.score);
    }
  }, [game.over, game.score, status, best]);

  const start = () => {
    setGame(newGame());
    setStatus('playing');
    boardRef.current?.focus();
  };

  const act = useCallback(
    (fn: (g: Game) => Game) => {
      if (status === 'playing') setGame(fn);
      boardRef.current?.focus();
    },
    [status],
  );

  const togglePause = () => setStatus((s) => (s === 'playing' ? 'paused' : s === 'paused' ? 'playing' : s));

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const actions: Record<string, (g: Game) => Game> = {
      ArrowLeft: (g) => move(g, -1),
      ArrowRight: (g) => move(g, 1),
      ArrowDown: tick,
      ArrowUp: rotate,
      x: rotate,
      ' ': hardDrop,
    };
    const fn = actions[e.key];
    if (fn) {
      e.preventDefault();
      act(fn);
    } else if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') {
      e.preventDefault();
      togglePause();
    } else if (e.key === 'Enter' && (status === 'idle' || status === 'over')) {
      start();
    }
  }

  const cells = compose(game);
  const showPiece = status !== 'idle';

  return (
    <div
      className="p3d-tetris"
      role="application"
      aria-label="Tetris"
      tabIndex={0}
      ref={boardRef}
      onKeyDown={onKeyDown}
      // pausa só quando o foco sai do jogo (não ao passar de um botão interno para o tabuleiro)
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) setStatus((s) => (s === 'playing' ? 'paused' : s));
      }}
    >
      <div className="p3d-tetris-well">
        <div className="p3d-tetris-board" style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}>
          {cells.map((row, r) =>
            row.map((cell, c) => {
              const type: Cell = showPiece || !cell.active ? cell.type : null;
              return (
                <i
                  key={`${r}-${c}`}
                  data-row={r}
                  data-col={c}
                  data-cell={type ?? ''}
                  data-active={showPiece && cell.active ? '' : undefined}
                  data-ghost={showPiece && cell.ghost ? '' : undefined}
                />
              );
            }),
          )}
        </div>
        {status !== 'playing' && (
          <div className="p3d-tetris-overlay">
            {status === 'paused' && <p>Pausado</p>}
            {status === 'over' && <p>Fim de jogo</p>}
            {status === 'paused' ? (
              <button
                type="button"
                onClick={() => {
                  setStatus('playing');
                  boardRef.current?.focus();
                }}
              >
                Continuar
              </button>
            ) : (
              <button type="button" onClick={start}>
                {status === 'over' ? 'Jogar de novo' : 'Jogar'}
              </button>
            )}
          </div>
        )}
      </div>

      <aside className="p3d-tetris-side">
        <fieldset>
          <legend>Próxima</legend>
          <div className="p3d-tetris-next">
            {previewShape(game.next).map((row, r) => (
              <div key={r}>
                {row.map((v, c) => (
                  <i key={c} data-cell={v ? game.next : ''} />
                ))}
              </div>
            ))}
          </div>
        </fieldset>
        <dl className="p3d-tetris-stats">
          <dt>Pontos</dt>
          <dd data-stat="score">{game.score}</dd>
          <dt>Linhas</dt>
          <dd>{game.lines}</dd>
          <dt>Nível</dt>
          <dd>{game.level}</dd>
          <dt>Recorde</dt>
          <dd>{best}</dd>
        </dl>
        <p className="p3d-tetris-help">
          ← → mover · ↑ girar
          <br />↓ descer · espaço soltar
          <br />P pausar
        </p>
        <div className="p3d-tetris-pad">
          <button type="button" aria-label="Esquerda" onClick={() => act((g) => move(g, -1))}>
            ◀
          </button>
          <button type="button" aria-label="Girar" onClick={() => act(rotate)}>
            ⟳
          </button>
          <button type="button" aria-label="Direita" onClick={() => act((g) => move(g, 1))}>
            ▶
          </button>
          <button type="button" aria-label="Descer" onClick={() => act(tick)}>
            ▼
          </button>
          <button type="button" aria-label="Soltar" onClick={() => act(hardDrop)}>
            ⤓
          </button>
        </div>
      </aside>
    </div>
  );
}
