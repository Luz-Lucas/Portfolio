import type { IntroPhase } from './intro';

/** Na área de trabalho só a fumaça do café se mexe: 24 quadros/s bastam. */
export const IDLE_FPS = 24;

export type FrameMode = 'continuous' | 'idle' | 'off';

/** Quantos quadros a cena precisa: todos na intro, poucos com a área de trabalho, nenhum em tela cheia. */
export function frameMode(phase: IntroPhase, covered: boolean): FrameMode {
  if (phase !== 'desktop') return 'continuous';
  return covered ? 'off' : 'idle';
}
