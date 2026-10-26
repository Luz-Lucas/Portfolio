import { describe, expect, it } from 'vitest';
import { clampPosition } from '@/desktop/clamp';

const win = { w: 300, h: 200 };
const bounds = { w: 800, h: 600 };

describe('clampPosition', () => {
  it('keeps the title bar reachable when dragged off the top-left', () => {
    const p = clampPosition({ x: -500, y: -50 }, win, bounds);
    expect(p.y).toBeGreaterThanOrEqual(0);
    expect(p.x).toBeGreaterThanOrEqual(-300 + 64);
  });

  it('keeps the title bar reachable when dragged off the bottom-right', () => {
    const p = clampPosition({ x: 2000, y: 2000 }, win, bounds);
    expect(p.x).toBeLessThanOrEqual(800 - 64);
    expect(p.y).toBeLessThanOrEqual(600 - 28);
  });

  it('leaves positions inside the bounds untouched', () => {
    expect(clampPosition({ x: 100, y: 120 }, win, bounds)).toEqual({ x: 100, y: 120 });
  });
});
