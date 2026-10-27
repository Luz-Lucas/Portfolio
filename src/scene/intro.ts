export type IntroPhase = 'loading' | 'poweron' | 'bios' | 'boot' | 'desktop';

export type IntroEvent = { type: 'loaded'; now: number } | { type: 'tick'; now: number } | { type: 'skip' };

export type IntroState = { phase: IntroPhase; startedAt: number | null; instant: boolean };

/**
 * O CRT liga logo que a cena carrega e a BIOS roda na tela enquanto a câmera se aproxima;
 * a BIOS termina um pouco depois do movimento. Total 4100 ms, e dá para pular.
 */
export const INTRO_TIMINGS = { poweron: 400, bios: 2800, boot: 900 } as const;

/** Duração da aproximação da câmera, contada do fim do loading (atravessa as fases). */
export const DOLLY_MS = 2400;

const TIMED: { phase: IntroPhase; ms: number }[] = [
  { phase: 'poweron', ms: INTRO_TIMINGS.poweron },
  { phase: 'bios', ms: INTRO_TIMINGS.bios },
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
        : { ...state, phase: 'poweron', startedAt: event.now };
    case 'skip':
      return state.phase === 'loading' ? { ...state, instant: true } : { ...state, phase: 'desktop' };
    case 'tick': {
      if (state.startedAt === null || state.phase === 'desktop') return state;
      const phase = phaseAt(event.now - state.startedAt).phase;
      return phase === state.phase ? state : { ...state, phase };
    }
  }
}

/** Progresso 0..1 dentro da fase atual (flash do CRT, linhas da BIOS, barra de boot). */
export function phaseProgress(state: IntroState, now: number): number {
  if (state.phase === 'desktop') return 1;
  if (state.startedAt === null) return 0;
  const { start, ms } = phaseAt(now - state.startedAt);
  return Math.min(Math.max((now - state.startedAt - start) / ms, 0), 1);
}

/** Progresso 0..1 da aproximação da câmera, independente da fase. */
export function dollyProgress(state: IntroState, now: number): number {
  if (state.phase === 'desktop') return 1;
  if (state.startedAt === null) return 0;
  return Math.min(Math.max((now - state.startedAt) / DOLLY_MS, 0), 1);
}
