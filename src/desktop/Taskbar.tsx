'use client';

import { useEffect, useState } from 'react';
import { getApp } from '@/content/apps';
import type { AppId } from '@/content/types';
import { StartMenu } from './StartMenu';
import { useWindowStore } from './windowStore';

const formatTime = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 15_000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="p3d-clock status-bar-field" aria-label="Relógio">
      {formatTime(now)}
    </div>
  );
}

export function Taskbar({ onOpen }: { onOpen: (id: AppId) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const windows = useWindowStore((s) => s.windows);
  const focusedId = useWindowStore((s) => s.focusedId);
  const { focus, minimize } = useWindowStore.getState();

  return (
    <div className="p3d-taskbar" role="toolbar" aria-label="Barra de tarefas">
      <button
        type="button"
        className={`p3d-start${menuOpen ? ' active' : ''}`}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((o) => !o)}
      >
        <img src="/icons/start.svg" alt="" width={16} height={16} />
        Iniciar
      </button>
      {menuOpen && (
        <StartMenu
          onClose={() => setMenuOpen(false)}
          onPick={(id) => {
            setMenuOpen(false);
            onOpen(id);
          }}
        />
      )}
      <div className="p3d-task-buttons">
        {windows.map((w) => {
          const app = getApp(w.id);
          const active = focusedId === w.id && !w.minimized;
          return (
            <button
              key={w.id}
              type="button"
              className={active ? 'active' : undefined}
              aria-pressed={active}
              onClick={() => (active ? minimize(w.id) : focus(w.id))}
            >
              <img src={app.icon} alt="" width={16} height={16} />
              <span>{app.title}</span>
            </button>
          );
        })}
      </div>
      <Clock />
    </div>
  );
}
