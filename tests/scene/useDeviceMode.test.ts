import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { detectDeviceMode, resetWebGLProbe, useDeviceMode } from '@/scene/useDeviceMode';

const withWebGL = (ok: boolean) => {
  resetWebGLProbe();
  return vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => (ok ? {} : null)) as never);
};

describe('detectDeviceMode', () => {
  afterEach(() => vi.restoreAllMocks());

  it('is mobile below 768px', () => {
    withWebGL(true);
    expect(detectDeviceMode(767)).toBe('mobile');
  });

  it('is scene on wide screens with WebGL', () => {
    withWebGL(true);
    expect(detectDeviceMode(1280)).toBe('scene');
  });

  it('is mobile on wide screens without WebGL', () => {
    withWebGL(false);
    expect(detectDeviceMode(1280)).toBe('mobile');
  });
});

describe('useDeviceMode', () => {
  afterEach(() => vi.restoreAllMocks());

  it('measures after mount', () => {
    withWebGL(true);
    vi.stubGlobal('innerWidth', 1440);
    const { result } = renderHook(() => useDeviceMode());
    expect(result.current).toBe('scene');
    vi.unstubAllGlobals();
  });
});

describe('WebGL probe', () => {
  afterEach(() => vi.restoreAllMocks());

  it('probes WebGL once and releases the probe context, even across many resizes', async () => {
    const { resetWebGLProbe } = await import('@/scene/useDeviceMode');
    resetWebGLProbe();
    const loseContext = vi.fn();
    const spy = vi
      .spyOn(HTMLCanvasElement.prototype, 'getContext')
      .mockImplementation((() => ({ getExtension: () => ({ loseContext }) })) as never);
    vi.stubGlobal('innerWidth', 1440);
    renderHook(() => useDeviceMode());
    for (let i = 0; i < 20; i++) window.dispatchEvent(new Event('resize'));
    expect(spy).toHaveBeenCalledTimes(1);
    expect(loseContext).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });
});
