import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { SEED_CONTENT } from '@/content/seed';
import { TEST_PROJECTS as SEED_PROJECTS } from '../fixtures/content';
import { useWindowStore } from '@/desktop/windowStore';

let sceneBehaviour: 'throw' | 'hang' = 'hang';
vi.mock('next/dynamic', () => ({
  default: () =>
    function FakeScene() {
      if (sceneBehaviour === 'throw') throw new Error('WebGL context lost');
      return null;
    },
}));
vi.mock('@/scene/useDeviceMode', () => ({ useDeviceMode: () => 'scene' }));

const { Experience, LOAD_TIMEOUT_MS } = await import('@/scene/Experience');

describe('Experience fallback', () => {
  beforeEach(() => {
    useWindowStore.getState().reset();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('shows the flat desktop when the 3D scene throws', () => {
    sceneBehaviour = 'throw';
    render(<Experience content={SEED_CONTENT} projects={SEED_PROJECTS} />);
    expect(screen.getByRole('list', { name: 'Área de trabalho' })).toBeInTheDocument();
    expect(document.querySelector('[data-fallback="true"]')).not.toBeNull();
  });

  it('falls back to the flat desktop when loading takes too long', () => {
    sceneBehaviour = 'hang';
    vi.useFakeTimers();
    render(<Experience content={SEED_CONTENT} projects={SEED_PROJECTS} />);
    expect(screen.queryByRole('list', { name: 'Área de trabalho' })).not.toBeInTheDocument();
    act(() => vi.advanceTimersByTime(LOAD_TIMEOUT_MS + 10));
    expect(screen.getByRole('list', { name: 'Área de trabalho' })).toBeInTheDocument();
  });
});
