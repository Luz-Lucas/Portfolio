export const TITLE_BAR_H = 28;
// 120 px: os três botões da barra ocupam ~52 px; sobra área para agarrar a janela de volta.
export const MIN_VISIBLE_X = 120;

type Pos = { x: number; y: number };
type Size = { w: number; h: number };

/** Mantém a barra de título alcançável dentro da área de trabalho. */
export function clampPosition(pos: Pos, win: Size, bounds: Size): Pos {
  const x = Math.min(Math.max(pos.x, -win.w + MIN_VISIBLE_X), bounds.w - MIN_VISIBLE_X);
  const y = Math.min(Math.max(pos.y, 0), bounds.h - TITLE_BAR_H);
  return { x, y };
}
