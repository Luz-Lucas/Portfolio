import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { detectDeviceMode, useDeviceMode } from '@/scene/useDeviceMode';

const withWebGL = (ok: boolean) =>
  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation((() => (ok ? {} : null)) as never);

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
