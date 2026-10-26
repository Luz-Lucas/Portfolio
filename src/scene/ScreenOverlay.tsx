'use client';

import type { CSSProperties, ReactNode } from 'react';
import { DESKTOP_LOGICAL, type ScreenRect } from './stage';

type Props = { rect: ScreenRect; maximized: boolean; children: (scale: number) => ReactNode };

/**
 * Posiciona a área de trabalho sobre a tela do CRT (ou em tela cheia quando maximizada).
 * A árvore é sempre a mesma: alternar a tela cheia só muda estilos, sem remontar a área de trabalho.
 */
export function ScreenOverlay({ rect, maximized, children }: Props) {
  const scale = maximized ? 1 : Math.min(rect.width / DESKTOP_LOGICAL.w, rect.height / DESKTOP_LOGICAL.h);
  const outer: CSSProperties | undefined = maximized
    ? undefined
    : { left: rect.left, top: rect.top, width: rect.width, height: rect.height };
  const stage: CSSProperties = maximized
    ? { left: 0, top: 0, width: '100%', height: '100%', transform: 'none' }
    : { width: DESKTOP_LOGICAL.w, height: DESKTOP_LOGICAL.h, transform: `translate(-50%, -50%) scale(${scale})` };

  return (
    <div className={`p3d-overlay${maximized ? ' is-maximized' : ''}`} data-testid="screen-overlay" style={outer}>
      <div className="p3d-stage" style={stage}>
        {children(scale)}
      </div>
      <div className="p3d-crt" aria-hidden="true" hidden={maximized} />
    </div>
  );
}
