'use client';

import { useEffect } from 'react';
import { APPS } from '@/content/apps';
import type { AppId } from '@/content/types';

export function StartMenu({ onPick, onClose }: { onPick: (id: AppId) => void; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="p3d-start-menu window">
      <div className="p3d-start-banner" aria-hidden="true">
        Portfólio<b>95</b>
      </div>
      <ul role="menu" aria-label="Menu Iniciar">
        {APPS.map((app) => (
          <li key={app.id} role="none">
            <button type="button" role="menuitem" onClick={() => onPick(app.id)}>
              <img src={app.icon} alt="" width={24} height={24} />
              <span>{app.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
