'use client';

import { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { ProjectsResult, SiteContent } from '@/content/types';
import { Desktop } from '@/desktop/Desktop';
import { BootScreen } from './BootScreen';
import { LoadingScreen } from './LoadingScreen';
import { PowerOnEffect } from './PowerOnEffect';
import { ScreenOverlay } from './ScreenOverlay';
import type { ScreenRect } from './stage';
import { useDeviceMode } from './useDeviceMode';
import { useIntro } from './useIntro';
import './scene.css';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

type Props = { content: SiteContent; projects: ProjectsResult };

export function Experience({ content, projects }: Props) {
  const mode = useDeviceMode();
  const { phase, progress, skip, markLoaded } = useIntro();
  const [rect, setRect] = useState<ScreenRect | null>(null);
  const [loadPct, setLoadPct] = useState(0);
  const [maximized, setMaximized] = useState(false);
  const onRect = useCallback((r: ScreenRect) => setRect(r), []);

  // Mobile: sem cena — direto para a área de trabalho depois do loading.
  useEffect(() => {
    if (mode !== 'mobile') return;
    skip();
    markLoaded();
  }, [mode, skip, markLoaded]);

  if (mode === 'mobile') {
    return (
      <div className="p3d-experience is-mobile" data-intro-phase={phase}>
        {phase === 'desktop' ? <Desktop content={content} projects={projects} mode="mobile" /> : <LoadingScreen />}
      </div>
    );
  }

  const screenOn = phase === 'poweron' || phase === 'boot' || phase === 'desktop';

  return (
    <div className="p3d-experience" data-intro-phase={phase}>
      {mode === 'scene' && (
        <Scene phase={phase} progress={progress} onReady={markLoaded} onProgress={setLoadPct} onScreenRect={onRect} />
      )}
      {phase === 'loading' && <LoadingScreen progress={mode === 'scene' ? loadPct : undefined} />}
      {rect && screenOn && (
        <ScreenOverlay rect={rect} maximized={maximized && phase === 'desktop'}>
          {(scale) =>
            phase === 'poweron' ? (
              <PowerOnEffect />
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
