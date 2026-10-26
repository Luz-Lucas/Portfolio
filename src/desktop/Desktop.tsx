'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { APPS } from '@/content/apps';
import type { AppId, ProjectsResult, SiteContent } from '@/content/types';
import { BoundsContext, type Bounds } from './bounds';
import { clampPosition } from './clamp';
import { renderApp } from './apps';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar } from './Taskbar';
import { Window } from './Window';
import { useWindowStore } from './windowStore';
import './desktop.css';

export type DesktopMode = 'scene' | 'mobile';

type Props = {
  content: SiteContent;
  projects: ProjectsResult;
  mode: DesktopMode;
  /** Escala do palco (overlay dentro do monitor) — usada para converter o arrastar. */
  scale?: number;
  renderBody?: (id: AppId) => ReactNode;
};

const README_KEY = 'p3d:readme-seen';

function readmeSeen(): boolean {
  try {
    if (localStorage.getItem(README_KEY)) return true;
    localStorage.setItem(README_KEY, '1');
  } catch {}
  return false;
}



export function Desktop({ content, projects, mode, scale = 1, renderBody }: Props) {
  const body = renderBody ?? ((id: AppId) => renderApp(id, { content, projects }));
  const areaRef = useRef<HTMLDivElement>(null);
  const [bounds, setBounds] = useState<Bounds>({ w: 800, h: 600 });
  const windows = useWindowStore((s) => s.windows);
  const mobile = mode === 'mobile';

  const openApp = (id: AppId) => useWindowStore.getState().open(id);

  // Antes do Leia-me automático, para o modo já valer na primeira janela.
  useEffect(() => {
    useWindowStore.getState().setMode(mode);
  }, [mode]);

  useEffect(() => {
    if (!readmeSeen()) openApp('readme');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = areaRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(() => setBounds({ w: el.clientWidth, h: el.clientHeight }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    const { windows, move } = useWindowStore.getState();
    for (const w of windows) {
      const c = clampPosition(w, w, bounds);
      if (c.x !== w.x || c.y !== w.y) move(w.id, c.x, c.y);
    }
  }, [bounds]);

  return (
    <div className={`p3d-desktop${mobile ? ' is-mobile' : ''}`}>
      <div className="p3d-area" ref={areaRef}>
        <ul className="p3d-icons" aria-label="Área de trabalho" role="list">
          {APPS.map((app) => (
            <DesktopIcon key={app.id} app={app} onOpen={() => openApp(app.id)} />
          ))}
        </ul>
        <BoundsContext.Provider value={bounds}>
          {windows.map((w) => {
            const app = APPS.find((a) => a.id === w.id)!;
            return (
              <Window key={w.id} id={w.id} title={app.title} icon={app.icon} draggable={!mobile} scale={scale}>
                {body(w.id)}
              </Window>
            );
          })}
        </BoundsContext.Provider>
      </div>
      <Taskbar onOpen={openApp} />
    </div>
  );
}
