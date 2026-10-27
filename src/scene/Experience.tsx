'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProjectsResult, SiteContent } from '@/content/types';
import { Desktop } from '@/desktop/Desktop';
import { BiosScreen } from './BiosScreen';
import { BootScreen } from './BootScreen';
import { LoadingScreen } from './LoadingScreen';
import { PowerOnEffect } from './PowerOnEffect';
import { SceneBoundary } from './SceneBoundary';
import { ScreenOverlay } from './ScreenOverlay';
import type { ScreenRect } from './stage';
import { useDeviceMode } from './useDeviceMode';
import { useIntro } from './useIntro';
import './scene.css';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

type Props = { content: SiteContent; projects: ProjectsResult };

/** Se a cena não carregar nesse tempo, a área de trabalho abre em 2D. */
export const LOAD_TIMEOUT_MS = 20_000;

export function Experience({ content, projects }: Props) {
  const mode = useDeviceMode();
  const { phase, progress, dolly, skip, markLoaded } = useIntro();
  const [rect, setRect] = useState<ScreenRect | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [maximized, setMaximized] = useState(false);
  const [fallback, setFallback] = useState(false);
  const onRect = useCallback((r: ScreenRect) => setRect(r), []);
  const fail = useCallback(() => setFallback(true), []);

  const flat = mode === 'mobile' || fallback;

  // Mobile ou cena com falha: sem 3D — direto para a área de trabalho.
  useEffect(() => {
    if (!flat) return;
    skip();
    markLoaded();
  }, [flat, skip, markLoaded]);

  // Loading travado (rede lenta, decoder bloqueado): desiste do 3D.
  useEffect(() => {
    if (mode !== 'scene' || phase !== 'loading') return;
    const t = setTimeout(fail, LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, [mode, phase, fail]);

  if (flat) {
    return (
      <div className={`p3d-experience${mode === 'mobile' ? ' is-mobile' : ''}`} data-intro-phase={phase} data-fallback={fallback || undefined}>
        {phase === 'desktop' ? (
          <Desktop content={content} projects={projects} mode={mode === 'mobile' ? 'mobile' : 'scene'} />
        ) : (
          <LoadingScreen />
        )}
      </div>
    );
  }

  const screenOn = phase !== 'loading';

  return (
    <div className="p3d-experience" data-intro-phase={phase}>
      {mode === 'scene' && (
        <SceneBoundary onError={fail}>
          <Scene
            phase={phase}
            progress={progress}
            dolly={dolly}
            onReady={markLoaded}
            onProgress={setLoadPct}
            onScreenRect={onRect}
            covered={maximized && phase === 'desktop'}
          />
        </SceneBoundary>
      )}
      {phase === 'loading' && <LoadingScreen progress={mode === 'scene' ? loadPct : undefined} />}
      {rect && screenOn && (
        <ScreenOverlay rect={rect} maximized={maximized && phase === 'desktop'}>
          {(scale) =>
            phase === 'poweron' ? (
              <PowerOnEffect />
            ) : phase === 'bios' ? (
              <BiosScreen />
            ) : phase === 'boot' ? (
              <BootScreen />
            ) : (
              <Desktop content={content} projects={projects} mode="scene" scale={scale} />
            )
          }
        </ScreenOverlay>
      )}
      {phase === 'desktop' && (
        <button type="button" className="p3d-maximize" onClick={() => setMaximized((m) => !m)}>
          {maximized ? 'Voltar ao monitor' : 'Tela cheia'}
        </button>
      )}
    </div>
  );
}
