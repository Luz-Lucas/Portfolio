import { describe, expect, it } from 'vitest';
import { frameMode, IDLE_FPS } from '@/scene/frames';

describe('frameMode', () => {
  it('renders every frame while the intro animates', () => {
    for (const p of ['loading', 'dolly', 'poweron', 'boot'] as const) expect(frameMode(p, false)).toBe('continuous');
  });

  it('drops to a low idle rate on the desktop (only the steam moves)', () => {
    expect(frameMode('desktop', false)).toBe('idle');
    expect(IDLE_FPS).toBeLessThanOrEqual(30);
  });

  it('stops rendering when the desktop covers the scene (full screen)', () => {
    expect(frameMode('desktop', true)).toBe('off');
  });
});
