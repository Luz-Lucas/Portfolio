'use client';

import type { ReactNode } from 'react';
import { DESKTOP_LOGICAL, type ScreenRect } from './stage';

type Props = { rect: ScreenRect; maximized: boolean; children: (scale: number) => ReactNode };

/** Posiciona a área de trabalho sobre a tela do CRT (ou em tela cheia quando maximizada). */
export function ScreenOverlay({ rect, maximized, children }: Props) {
  if (maximized) {
    return (
      <div className="p3d-overlay is-maximized" data-testid="screen-overlay">
        {children(1)}
      </div>
    );
  }
  const scale = Math.min(rect.width / DESKTOP_LOGICAL.w, rect.height / DESKTOP_LOGICAL.h);
  return (
    <div
      className="p3d-overlay"
      data-testid="screen-overlay"
      style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}
    >
      <div
        className="p3d-stage"
        style={{ width: DESKTOP_LOGICAL.w, height: DESKTOP_LOGICAL.h, transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children(scale)}
      </div>
      <div className="p3d-crt" aria-hidden="true" />
    </div>
  );
}
