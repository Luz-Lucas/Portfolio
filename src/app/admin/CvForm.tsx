'use client';

import { useState, useTransition } from 'react';
import { uploadCv, type ActionResult } from './actions';

export function CvForm({ currentUrl }: { currentUrl: string | null }) {
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  return (
    <form
      className="admin-card"
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        start(async () => {
          const r = await uploadCv(data);
          setResult(r);
          if (r.ok) location.reload();
        });
      }}
    >
      <h2>Currículo (PDF até 5 MB)</h2>
      <p>
        Atual:{' '}
        {currentUrl ? (
          <a href={currentUrl} target="_blank" rel="noopener">
            abrir PDF
          </a>
        ) : (
          'nenhum'
        )}
      </p>
      <input type="file" name="file" accept="application/pdf" required />
      <div className="admin-actions">
        <button type="submit" className="admin-primary" disabled={pending}>
          Enviar
        </button>
        {pending ? (
          <span className="admin-status">Enviando...</span>
        ) : (
          result && <span className={result.ok ? 'admin-ok' : 'admin-error'}>{result.ok ? 'Enviado' : result.error}</span>
        )}
      </div>
    </form>
  );
}
