'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';

export function AdminTabs({ tabs }: { tabs: { id: string; label: string; content: ReactNode }[] }) {
  const [active, setActive] = useState(tabs[0]?.id);
  return (
    <>
      <nav className="admin-tabs" role="tablist">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={active === t.id}
            onClick={() => setActive(t.id)}
          >
            {t.label}
          </button>
        ))}
      </nav>
      {tabs.map((t) => (
        <section key={t.id} role="tabpanel" hidden={active !== t.id}>
          {t.content}
        </section>
      ))}
    </>
  );
}
