'use client';

import { useRef, useState, useTransition } from 'react';
import { validateUpload } from '@/lib/uploads';
import { uploadImage } from './actions';

/** "Enviar imagem" que preenche o campo de URL ao lado. */
export function ImageUpload({ purpose, onUploaded }: { purpose: 'photo' | 'cover'; onUploaded: (url: string) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function onChange() {
    const file = input.current?.files?.[0];
    if (!file) return;
    const check = validateUpload(file, 'image');
    if (!check.ok) {
      setError(check.error);
      if (input.current) input.current.value = '';
      return;
    }
    const data = new FormData();
    data.set('file', file);
    start(async () => {
      try {
        const r = await uploadImage(data, purpose);
        if (r.ok) {
          setError(null);
          onUploaded(r.url);
        } else setError(r.error);
      } catch {
        setError('Não foi possível enviar. Tente de novo.');
      }
      if (input.current) input.current.value = '';
    });
  }

  return (
    <span className="admin-upload">
      <button type="button" disabled={pending} onClick={() => input.current?.click()}>
        {pending ? 'Enviando...' : 'Enviar imagem'}
      </button>
      <input ref={input} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={onChange} />
      {error && <span className="admin-error">{error}</span>}
    </span>
  );
}
