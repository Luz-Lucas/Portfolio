'use client';

import { useEffect, useState } from 'react';

export type DeviceMode = 'scene' | 'mobile';

export const MOBILE_MAX_WIDTH = 767;

let webglProbe: boolean | null = null;

/** Para testes: força uma nova checagem. */
export function resetWebGLProbe(): void {
  webglProbe = null;
}

/** Checa WebGL uma única vez e libera o contexto de teste (o navegador limita contextos ativos). */
function hasWebGL(): boolean {
  if (webglProbe !== null) return webglProbe;
  try {
    const canvas = document.createElement('canvas');
    const gl = (canvas.getContext('webgl2') ?? canvas.getContext('webgl')) as WebGLRenderingContext | null;
    webglProbe = Boolean(gl);
    gl?.getExtension?.('WEBGL_lose_context')?.loseContext();
  } catch {
    webglProbe = false;
  }
  return webglProbe;
}

export function detectDeviceMode(width: number): DeviceMode {
  if (width <= MOBILE_MAX_WIDTH) return 'mobile';
  return hasWebGL() ? 'scene' : 'mobile';
}

/** `null` até medir no cliente (evita baixar three.js antes de saber o modo). */
export function useDeviceMode(): DeviceMode | null {
  const [mode, setMode] = useState<DeviceMode | null>(null);
  useEffect(() => {
    const update = () => setMode(detectDeviceMode(window.innerWidth));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return mode;
}
