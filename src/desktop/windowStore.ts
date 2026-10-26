import { create } from 'zustand';
import { getApp } from '@/content/apps';
import type { AppId } from '@/content/types';

export type WinState = {
  id: AppId;
  x: number;
  y: number;
  w: number;
  h: number;
  z: number;
  minimized: boolean;
  maximized: boolean;
};

type WindowStore = {
  windows: WinState[];
  focusedId: AppId | null;
  /** No mobile toda janela abre maximizada, uma por vez (vale também para o Prompt de comando). */
  mode: 'scene' | 'mobile';
  /** Contador de janelas criadas, para a cascata não empilhar janelas no mesmo ponto. */
  spawned: number;
  setMode(mode: 'scene' | 'mobile'): void;
  open(id: AppId, opts?: { exclusive?: boolean; maximized?: boolean }): void;
  close(id: AppId): void;
  focus(id: AppId): void;
  minimize(id: AppId): void;
  toggleMaximize(id: AppId): void;
  move(id: AppId, x: number, y: number): void;
  reset(): void;
};

const ORIGIN = { x: 110, y: 24 };
const CASCADE = 24;
const CASCADE_STEPS = 8;

function topVisible(windows: WinState[]): AppId | null {
  const visible = windows.filter((w) => !w.minimized);
  if (visible.length === 0) return null;
  return visible.reduce((a, b) => (b.z > a.z ? b : a)).id;
}

const maxZ = (windows: WinState[]) => windows.reduce((m, w) => Math.max(m, w.z), 0);

export const useWindowStore = create<WindowStore>((set, get) => ({
  windows: [],
  focusedId: null,
  mode: 'scene',
  spawned: 0,

  setMode(mode) {
    set({ mode });
  },

  open(id, opts) {
    const { windows, mode, spawned } = get();
    if (mode === 'mobile') opts = { exclusive: true, maximized: true, ...opts };
    const z = maxZ(windows) + 1;
    const isNew = !windows.some((w) => w.id === id);
    let next = windows.some((w) => w.id === id)
      ? windows.map((w) => (w.id === id ? { ...w, minimized: false, z } : w))
      : (() => {
          const { w, h } = getApp(id).defaultSize;
          const offset = (spawned % CASCADE_STEPS) * CASCADE;
          return [...windows, { id, x: ORIGIN.x + offset, y: ORIGIN.y + offset, w, h, z, minimized: false, maximized: false }];
        })();
    if (opts?.maximized) next = next.map((w) => (w.id === id ? { ...w, maximized: true } : w));
    if (opts?.exclusive) next = next.map((w) => (w.id === id ? w : { ...w, minimized: true }));
    set({ windows: next, focusedId: id, spawned: isNew ? spawned + 1 : spawned });
  },

  close(id) {
    const windows = get().windows.filter((w) => w.id !== id);
    set({ windows, focusedId: topVisible(windows) });
  },

  focus(id) {
    const { windows, focusedId } = get();
    if (focusedId === id) return;
    const z = maxZ(windows) + 1;
    set({ windows: windows.map((w) => (w.id === id ? { ...w, z, minimized: false } : w)), focusedId: id });
  },

  minimize(id) {
    const windows = get().windows.map((w) => (w.id === id ? { ...w, minimized: true } : w));
    set({ windows, focusedId: topVisible(windows) });
  },

  toggleMaximize(id) {
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, maximized: !w.maximized } : w)) });
  },

  move(id, x, y) {
    set({ windows: get().windows.map((w) => (w.id === id ? { ...w, x, y } : w)) });
  },

  reset() {
    set({ windows: [], focusedId: null, spawned: 0 });
  },
}));
