'use client';

import { useEffect, useState } from 'react';
import type { AppId } from '@/content/types';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];
const monthName = (d: Date) => d.toLocaleDateString('pt-BR', { month: 'long' });
const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Calendário do relógio. Easter egg: clicar em "hoje" mostra a notificação de disponibilidade. */
export function Calendar({ onClose, onOpen }: { onClose: () => void; onOpen: (id: AppId) => void }) {
  const [notice, setNotice] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  const offset = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [...Array<null>(offset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const name = monthName(today);

  return (
    <>
      <div className="p3d-calendar window" role="dialog" aria-label="Calendário">
        <div className="title-bar">
          <div className="title-bar-text">Data/Hora</div>
          <div className="title-bar-controls">
            <button type="button" className="close" aria-label="Fechar" onClick={onClose} />
          </div>
        </div>
        <div className="window-body">
          <p className="p3d-calendar-month">
            {capitalize(name)} de {year}
          </p>
          <div className="p3d-calendar-grid">
            {WEEKDAYS.map((w, i) => (
              <span key={`w${i}`} className="p3d-calendar-weekday" aria-hidden="true">
                {w}
              </span>
            ))}
            {cells.map((day, i) =>
              day === null ? (
                <span key={`e${i}`} />
              ) : day === today.getDate() ? (
                <button
                  key={day}
                  type="button"
                  className="p3d-calendar-today"
                  aria-current="date"
                  aria-label={`${day} de ${name} (hoje)`}
                  title="Hoje"
                  onClick={() => setNotice(true)}
                >
                  {day}
                </button>
              ) : (
                <span key={day}>{day}</span>
              ),
            )}
          </div>
        </div>
      </div>
      {notice && (
        <div className="p3d-notice window" role="status">
          <div className="window-body">
            <b>Aberto para trabalho</b>
            <p>Hoje é um ótimo dia para conversarmos sobre uma vaga.</p>
            <div className="p3d-notice-actions">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpen('contact');
                }}
              >
                Falar comigo
              </button>
              <button type="button" onClick={() => setNotice(false)}>
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
