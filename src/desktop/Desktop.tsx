'use client';

import { useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { APPS } from '@/content/apps';
import type { AppId, ProjectsResult, SiteContent } from '@/content/types';
import { SCENE_MESSAGE_EVENT, type SceneMessage } from '@/lib/easterEggs';
import { BoundsContext, type Bounds } from './bounds';
import { clampPosition, fitInside } from './clamp';
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

  // Easter eggs da cena 3D (luminária, café, Clean Code): mensagem "Luz 95", às vezes com a tela piscando.
  const [flicker, setFlicker] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => {
    let t: ReturnType<typeof setTimeout>;
    const onMessage = (e: Event) => {
      const { text, flicker } = (e as CustomEvent<SceneMessage>).detail;
      setMessage(text);
      if (!flicker) return;
      setFlicker(true);
      clearTimeout(t);
      t = setTimeout(() => setFlicker(false), 900);
    };
    window.addEventListener(SCENE_MESSAGE_EVENT, onMessage);
    return () => {
      window.removeEventListener(SCENE_MESSAGE_EVENT, onMessage);
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

  // Janela recém-aberta cabe inteira na área de trabalho; depois o usuário pode arrastá-la para onde quiser.
  const fitted = useRef(new Set<AppId>());
  useEffect(() => {
    const open = new Set(windows.map((w) => w.id));
    for (const id of fitted.current) if (!open.has(id)) fitted.current.delete(id);
    for (const w of windows) {
      if (fitted.current.has(w.id)) continue;
      fitted.current.add(w.id);
      const c = fitInside(w, w, bounds);
      if (c.x !== w.x || c.y !== w.y) useWindowStore.getState().move(w.id, c.x, c.y);
    }
  }, [windows, bounds]);

  return (
    <div className={`p3d-desktop${mobile ? ' is-mobile' : ''}${flicker ? ' is-flicker' : ''}`}>
      <div className="p3d-area" ref={areaRef}>
        <ul className="p3d-icons" aria-label="Área de trabalho" role="list">
          {APPS.filter((app) => !app.startMenuOnly).map((app) => (
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
        {message && (
          <div className="p3d-msgbox window" role="alertdialog" aria-label="Luz 95" aria-describedby="p3d-scene-message">
            <div className="title-bar">
              <div className="title-bar-text">Luz 95</div>
            </div>
            <div className="window-body">
              <p id="p3d-scene-message">
                <img src="/icons/start.svg" alt="" width={32} height={32} />
                {message}
              </p>
              <div className="p3d-msgbox-actions">
                <button type="button" autoFocus onClick={() => setMessage(null)}>
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
