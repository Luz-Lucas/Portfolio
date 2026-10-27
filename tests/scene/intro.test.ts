import { describe, expect, it } from 'vitest';
import { DOLLY_MS, INTRO_TIMINGS, dollyProgress, initialIntro, introReducer, phaseProgress, type IntroState } from '@/scene/intro';

const loaded = (instant = false): IntroState => introReducer(initialIntro(instant), { type: 'loaded', now: 1000 });
const tick = (s: IntroState, elapsedMs: number) => introReducer(s, { type: 'tick', now: 1000 + elapsedMs });

describe('introReducer', () => {
  it('loading + loaded → the CRT powers on (camera starts moving)', () => {
    expect(loaded().phase).toBe('poweron');
  });

  it('loaded goes straight to desktop when instant', () => {
    expect(loaded(true).phase).toBe('desktop');
  });

  it('advances through the phases with time: power on, BIOS, boot, desktop', () => {
    const s = loaded();
    const { poweron, bios, boot } = INTRO_TIMINGS;
    expect(tick(s, poweron - 1).phase).toBe('poweron');
    expect(tick(s, poweron).phase).toBe('bios');
    expect(tick(s, poweron + bios - 1).phase).toBe('bios');
    expect(tick(s, poweron + bios).phase).toBe('boot');
    expect(tick(s, poweron + bios + boot).phase).toBe('desktop');
  });

  it('the BIOS runs alongside the camera move and lasts a bit longer', () => {
    const { poweron, bios } = INTRO_TIMINGS;
    expect(poweron).toBeLessThan(DOLLY_MS);
    expect(poweron + bios).toBeGreaterThan(DOLLY_MS);
    expect(poweron + bios - DOLLY_MS).toBeLessThanOrEqual(1500);
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

  it('total intro stays short (at most 4.5 s, skippable)', () => {
    expect(INTRO_TIMINGS.poweron + INTRO_TIMINGS.bios + INTRO_TIMINGS.boot).toBeLessThanOrEqual(4500);
  });
});

describe('phaseProgress', () => {
  it('is 0..1 inside the current phase', () => {
    const s = loaded();
    expect(phaseProgress(s, 1000 + INTRO_TIMINGS.poweron / 2)).toBeCloseTo(0.5);
    expect(phaseProgress(tick(s, 9999), 1000 + 9999)).toBe(1);
  });
});

describe('dollyProgress', () => {
  it('goes 0..1 over DOLLY_MS from the load, across phases', () => {
    const s = loaded();
    expect(dollyProgress(initialIntro(false), 5000)).toBe(0);
    expect(dollyProgress(s, 1000)).toBe(0);
    expect(dollyProgress(tick(s, DOLLY_MS / 2), 1000 + DOLLY_MS / 2)).toBeCloseTo(0.5);
    expect(dollyProgress(tick(s, DOLLY_MS + 100), 1000 + DOLLY_MS + 100)).toBe(1);
    expect(dollyProgress(introReducer(s, { type: 'skip' }), 1000)).toBe(1);
  });
});
