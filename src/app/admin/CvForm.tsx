'use client';

import { useState, useTransition } from 'react';
import { validateUpload } from '@/lib/uploads';
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
        const file = (e.currentTarget.elements.namedItem('file') as HTMLInputElement | null)?.files?.[0];
        // Checa no navegador: arquivos grandes nem chegam ao servidor (a Vercel recusa corpos > 4,5 MB).
        if (file) {
          const check = validateUpload(file, 'cv');
          if (!check.ok) return setResult(check);
        }
        start(async () => {
          try {
            const r = await uploadCv(data);
            setResult(r);
            if (r.ok) location.reload();
          } catch {
            setResult({ ok: false, error: 'Não foi possível enviar. Tente de novo.' });
          }
        });
      }}
    >
      <h2>Currículo (PDF até 4 MB)</h2>
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
