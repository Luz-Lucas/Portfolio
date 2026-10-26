'use client';

import type { ReactNode } from 'react';
import type { AppId } from '@/content/types';
import { useBounds } from './bounds';
import { clampPosition } from './clamp';
import { useDrag } from './useDrag';
import { useWindowStore } from './windowStore';

type Props = { id: AppId; title: string; icon?: string; draggable?: boolean; scale?: number; children: ReactNode };

export function Window({ id, title, icon, draggable = true, scale = 1, children }: Props) {
  const win = useWindowStore((s) => s.windows.find((w) => w.id === id));
  const focused = useWindowStore((s) => s.focusedId === id);
  const { close, focus, minimize, toggleMaximize, move } = useWindowStore.getState();
  const bounds = useBounds();

  const drag = useDrag(
    draggable && !win?.maximized,
    () => ({ x: win?.x ?? 0, y: win?.y ?? 0 }),
    (p) => {
      if (!win) return;
      const c = clampPosition(p, win, bounds);
      move(id, c.x, c.y);
    },
    scale,
  );

  if (!win || win.minimized) return null;

  const style = win.maximized
    ? { left: 0, top: 0, width: '100%', height: '100%', zIndex: win.z }
    : { left: win.x, top: win.y, width: win.w, height: win.h, zIndex: win.z };

  return (
    <section
      className={`window p3d-window${focused ? ' is-focused' : ''}`}
      style={style}
      role="dialog"
      aria-label={title}
      onMouseDown={() => focus(id)}
    >
      <div className={`title-bar${focused ? '' : ' inactive'}`} {...drag}>
        <div className="title-bar-text">
          {icon && <img src={icon} alt="" width={16} height={16} />}
          {title}
        </div>
        <div className="title-bar-controls">
          {/* Classes do 98.css desenham os ícones (os seletores por aria-label dele são em inglês). */}
          <button className="minimize" aria-label="Minimizar" onClick={() => minimize(id)} />
          <button
            className={win.maximized ? 'restore' : 'maximize'}
            aria-label={win.maximized ? 'Restaurar' : 'Maximizar'}
            onClick={() => toggleMaximize(id)}
          />
          <button className="close" aria-label="Fechar" onClick={() => close(id)} />
        </div>
      </div>
      <div className="window-body p3d-window-body">{children}</div>
    </section>
  );
}
