'use client';

import { useEffect, useState } from 'react';

export type DeviceMode = 'scene' | 'mobile';

export const MOBILE_MAX_WIDTH = 767;

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
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
