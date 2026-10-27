'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { APPS } from '@/content/apps';
import type { AppId, ProjectsResult, SiteContent } from '@/content/types';
import { MORE_LIGHT_EVENT } from '@/lib/lamp';
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
    if (!readmeSeen()) useWindowStore.getState().open('readme');
  }, []);

  // Easter egg da luminária (liga/desliga 3 vezes na cena 3D): a tela pisca e sugere mais Luz.
  const [flicker, setFlicker] = useState(false);
  const [moreLight, setMoreLight] = useState(false);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onEgg = () => {
      setFlicker(true);
      setMoreLight(true);
      clearTimeout(t);
      t = setTimeout(() => setFlicker(false), 900);
    };
    window.addEventListener(MORE_LIGHT_EVENT, onEgg);
    return () => {
      window.removeEventListener(MORE_LIGHT_EVENT, onEgg);
      clearTimeout(t);
    };
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
    <div className={`p3d-desktop${mobile ? ' is-mobile' : ''}${flicker ? ' is-flicker' : ''}`}>
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
        {moreLight && (
          <div className="p3d-msgbox window" role="alertdialog" aria-label="Luz 95" aria-describedby="p3d-more-light">
            <div className="title-bar">
              <div className="title-bar-text">Luz 95</div>
            </div>
            <div className="window-body">
              <p id="p3d-more-light">
                <img src="/icons/start.svg" alt="" width={32} height={32} />
                Talvez você precise de um pouco mais de Luz.
              </p>
              <div className="p3d-msgbox-actions">
                <button type="button" autoFocus onClick={() => setMoreLight(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <Taskbar onOpen={openApp} />
    </div>
  );
}
