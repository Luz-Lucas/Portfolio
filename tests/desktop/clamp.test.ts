import { describe, expect, it } from 'vitest';
import { clampPosition, fitInside } from '@/desktop/clamp';

const win = { w: 300, h: 200 };
const bounds = { w: 800, h: 600 };

describe('clampPosition', () => {
  it('keeps 120px of title bar (past the 3 buttons) reachable when dragged off the left', () => {
    const p = clampPosition({ x: -500, y: -50 }, win, bounds);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeGreaterThanOrEqual(-300 + 120);
  });

  it('keeps the title bar reachable when dragged off the bottom-right', () => {
    const p = clampPosition({ x: 2000, y: 2000 }, win, bounds);
    expect(p.x).toBeLessThanOrEqual(800 - 120);
    expect(p.y).toBeLessThanOrEqual(600 - 28);
  });

  it('leaves positions inside the bounds untouched', () => {
    expect(clampPosition({ x: 100, y: 120 }, win, bounds)).toEqual({ x: 100, y: 120 });
  });
});

describe('clampPosition grab area', () => {
  it('leaves at least 120px of title bar on screen at the left limit', () => {
    const p = clampPosition({ x: -1000, y: 10 }, { w: 300, h: 200 }, { w: 800, h: 600 });
    expect(p.x + 300).toBeGreaterThanOrEqual(120);
    expect(p.x + 300).toBeLessThanOrEqual(121);
  });
});

describe('fitInside', () => {
  it('pulls a new window back so it fits entirely when it can', () => {
    expect(fitInside({ x: 134, y: 48 }, { w: 560, h: 400 }, { w: 680, h: 480 })).toEqual({ x: 120, y: 48 });
    expect(fitInside({ x: 134, y: 120 }, { w: 360, h: 440 }, { w: 680, h: 480 })).toEqual({ x: 134, y: 40 });
  });

  it('pins to the top-left when the window is larger than the desktop', () => {
    expect(fitInside({ x: 50, y: 50 }, { w: 900, h: 700 }, { w: 680, h: 480 })).toEqual({ x: 0, y: 0 });
  });
});
