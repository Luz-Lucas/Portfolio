export type IntroPhase = 'loading' | 'dolly' | 'poweron' | 'boot' | 'desktop';

export type IntroEvent = { type: 'loaded'; now: number } | { type: 'tick'; now: number } | { type: 'skip' };

export type IntroState = { phase: IntroPhase; startedAt: number | null; instant: boolean };

/** Total 3500 ms (≤ 4 s). */
export const INTRO_TIMINGS = { dolly: 1600, poweron: 700, boot: 1200 } as const;

const TIMED: { phase: IntroPhase; ms: number }[] = [
  { phase: 'dolly', ms: INTRO_TIMINGS.dolly },
  { phase: 'poweron', ms: INTRO_TIMINGS.poweron },
  { phase: 'boot', ms: INTRO_TIMINGS.boot },
];

export const initialIntro = (instant: boolean): IntroState => ({ phase: 'loading', startedAt: null, instant });

function phaseAt(elapsed: number): { phase: IntroPhase; start: number; ms: number } {
  let start = 0;
  for (const p of TIMED) {
    if (elapsed < start + p.ms) return { phase: p.phase, start, ms: p.ms };
    start += p.ms;
  }
  return { phase: 'desktop', start, ms: 0 };
}

export function introReducer(state: IntroState, event: IntroEvent): IntroState {
  switch (event.type) {
    case 'loaded':
      if (state.phase !== 'loading') return state;
      return state.instant
        ? { ...state, phase: 'desktop', startedAt: event.now }
        : { ...state, phase: 'dolly', startedAt: event.now };
    case 'skip':
      return state.phase === 'loading' ? { ...state, instant: true } : { ...state, phase: 'desktop' };
    case 'tick': {
      if (state.startedAt === null || state.phase === 'desktop') return state;
      const phase = phaseAt(event.now - state.startedAt).phase;
      return phase === state.phase ? state : { ...state, phase };
    }
  }
}

/** Progresso 0..1 dentro da fase atual (para animar dolly, flash do CRT e barra de boot). */
export function phaseProgress(state: IntroState, now: number): number {
  if (state.phase === 'desktop') return 1;
  if (state.startedAt === null) return 0;
  const { start, ms } = phaseAt(now - state.startedAt);
  return Math.min(Math.max((now - state.startedAt - start) / ms, 0), 1);
}
