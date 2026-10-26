import type { AppDef } from '@/content/types';

export function DesktopIcon({ app, onOpen }: { app: AppDef; onOpen: () => void }) {
  return (
    <li>
      <button type="button" className="p3d-icon" onClick={onOpen}>
        <img src={app.icon} alt="" width={32} height={32} draggable={false} />
        <span>{app.title}</span>
      </button>
    </li>
  );
}
