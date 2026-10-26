import { describe, expect, it } from 'vitest';
import { INTRO_TIMINGS, initialIntro, introReducer, phaseProgress, type IntroState } from '@/scene/intro';

const loaded = (instant = false): IntroState => introReducer(initialIntro(instant), { type: 'loaded', now: 1000 });
const tick = (s: IntroState, elapsedMs: number) => introReducer(s, { type: 'tick', now: 1000 + elapsedMs });

describe('introReducer', () => {
  it('loading + loaded → dolly', () => {
    expect(loaded().phase).toBe('dolly');
  });

  it('loaded goes straight to desktop when instant', () => {
    expect(loaded(true).phase).toBe('desktop');
  });

  it('advances through the phases with time', () => {
    const s = loaded();
    expect(tick(s, INTRO_TIMINGS.dolly - 1).phase).toBe('dolly');
    expect(tick(s, INTRO_TIMINGS.dolly).phase).toBe('poweron');
    expect(tick(s, INTRO_TIMINGS.dolly + INTRO_TIMINGS.poweron).phase).toBe('boot');
    expect(tick(s, 3500).phase).toBe('desktop');
  });

  it('skip jumps to desktop after loading', () => {
    expect(introReducer(loaded(), { type: 'skip' }).phase).toBe('desktop');
    expect(introReducer(tick(loaded(), 2000), { type: 'skip' }).phase).toBe('desktop');
  });

  it('skip during loading marks instant, then loaded goes to desktop', () => {
    const skipped = introReducer(initialIntro(false), { type: 'skip' });
    expect(skipped.phase).toBe('loading');
    expect(introReducer(skipped, { type: 'loaded', now: 5 }).phase).toBe('desktop');
  });

  it('ticks before loading do nothing', () => {
    expect(introReducer(initialIntro(false), { type: 'tick', now: 99999 }).phase).toBe('loading');
  });

  it('total intro is at most 4 seconds', () => {
    expect(INTRO_TIMINGS.dolly + INTRO_TIMINGS.poweron + INTRO_TIMINGS.boot).toBeLessThanOrEqual(4000);
  });
});

describe('phaseProgress', () => {
  it('is 0..1 inside the current phase', () => {
    const s = loaded();
    expect(phaseProgress(s, 1000 + INTRO_TIMINGS.dolly / 2)).toBeCloseTo(0.5);
    expect(phaseProgress(tick(s, 3500), 1000 + 9999)).toBe(1);
  });
});
