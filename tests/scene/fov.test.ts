import { describe, expect, it } from 'vitest';
import { fitFov } from '@/scene/fov';

const hfov = (vfovDeg: number, aspect: number) => (2 * Math.atan(Math.tan((vfovDeg * Math.PI) / 360) * aspect) * 180) / Math.PI;

describe('fitFov', () => {
  it('keeps the authored vertical fov at 16:10 and wider', () => {
    expect(fitFov(35, 16 / 10)).toBeCloseTo(35);
    expect(fitFov(35, 16 / 9)).toBeCloseTo(35);
    expect(fitFov(35, 21 / 9)).toBeCloseTo(35);
  });

  it('keeps the horizontal fov of 16:10 on narrower screens (portrait tablet)', () => {
    const ref = hfov(35, 16 / 10);
    const aspect = 820 / 1180;
    expect(hfov(fitFov(35, aspect), aspect)).toBeCloseTo(ref);
    expect(fitFov(35, aspect)).toBeGreaterThan(35);
  });
});
