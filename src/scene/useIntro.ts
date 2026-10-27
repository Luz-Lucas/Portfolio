'use client';

import { useCallback, useEffect, useReducer, useRef } from 'react';
import { dollyProgress, initialIntro, introReducer, phaseProgress, type IntroPhase } from './intro';

/** A intro (aproximação + BIOS) roda em toda visita; só movimento reduzido abre direto na área de trabalho. */
function startsInstant(): boolean {
  return typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function useIntro() {
  const [state, dispatch] = useReducer(introReducer, false, initialIntro);
  const instantChecked = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Decide no cliente se a intro é instantânea (visita repetida ou movimento reduzido).
  useEffect(() => {
    if (instantChecked.current) return;
    instantChecked.current = true;
    if (startsInstant()) dispatch({ type: 'skip' });
  }, []);

  // Relógio da intro.
  useEffect(() => {
    if (state.phase === 'loading' || state.phase === 'desktop') return;
    let raf = 0;
    const loop = () => {
      dispatch({ type: 'tick', now: performance.now() });
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [state.phase]);

  // Pular com clique ou tecla.
  useEffect(() => {
    if (state.phase === 'desktop') return;
    const skip = () => dispatch({ type: 'skip' });
    window.addEventListener('pointerdown', skip);
    window.addEventListener('keydown', skip);
    return () => {
      window.removeEventListener('pointerdown', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [state.phase]);

  const markLoaded = useCallback(() => dispatch({ type: 'loaded', now: performance.now() }), []);
  const skip = useCallback(() => dispatch({ type: 'skip' }), []);
  const progress = useCallback(() => phaseProgress(stateRef.current, performance.now()), []);
  const dolly = useCallback(() => dollyProgress(stateRef.current, performance.now()), []);

  return { phase: state.phase as IntroPhase, progress, dolly, skip, markLoaded };
}
