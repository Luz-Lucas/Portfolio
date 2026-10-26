import { useRef } from 'react';
import type { PointerEvent as ReactPointerEvent } from 'react';

type Point = { x: number; y: number };

/** Arrasta a partir de uma posição inicial; `onMove` recebe a nova posição (já em pixels lógicos). */
export function useDrag(enabled: boolean, getStart: () => Point, onMove: (p: Point) => void, scale = 1) {
  const origin = useRef<{ px: number; py: number; start: Point } | null>(null);

  return {
    onPointerDown(e: ReactPointerEvent<HTMLElement>) {
      if (!enabled || e.button !== 0) return;
      if ((e.target as HTMLElement).closest('button')) return;
      origin.current = { px: e.clientX, py: e.clientY, start: getStart() };
      e.currentTarget.setPointerCapture?.(e.pointerId);
    },
    onPointerMove(e: ReactPointerEvent<HTMLElement>) {
      const o = origin.current;
      if (!o) return;
      onMove({ x: o.start.x + (e.clientX - o.px) / scale, y: o.start.y + (e.clientY - o.py) / scale });
    },
    onPointerUp(e: ReactPointerEvent<HTMLElement>) {
      origin.current = null;
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    },
  };
}
