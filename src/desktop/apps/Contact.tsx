'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SiteContent } from '@/content/types';

type Status = { kind: 'idle' } | { kind: 'sending' } | { kind: 'sent' } | { kind: 'error'; message: string };

export function Contact({ content }: { content: SiteContent }) {
  const { email, linkedin, github } = content.contact;
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus({ kind: 'sending' });
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      if (res.ok) {
        form.reset();
        setStatus({ kind: 'sent' });
      } else if (res.status === 429) {
        setStatus({ kind: 'error', message: 'Muitas mensagens, tente mais tarde.' });
      } else {
        const body = await res.json().catch(() => ({}));
        setStatus({ kind: 'error', message: body.error ?? 'Não foi possível enviar agora.' });
      }
    } catch {
      setStatus({ kind: 'error', message: 'Sem conexão. Tente de novo.' });
    }
  }

  return (
    <div className="p3d-contact">
      <ul className="p3d-contact-links">
        <li>
          <b>E-mail:</b> <a href={`mailto:${email}`}>{email}</a>
        </li>
        <li>
          <a href={linkedin} target="_blank" rel="noopener">
            LinkedIn
          </a>
        </li>
        <li>
          <a href={github} target="_blank" rel="noopener">
            GitHub
          </a>
        </li>
      </ul>
      <form onSubmit={onSubmit}>
        <fieldset>
          <legend>Mandar mensagem</legend>
          <div className="field-row-stacked">
            <label htmlFor="c-name">Nome</label>
            <input id="c-name" name="name" required minLength={2} maxLength={80} />
          </div>
          <div className="field-row-stacked">
            <label htmlFor="c-email">Seu e-mail</label>
            <input id="c-email" name="email" type="email" required />
          </div>
          <div className="field-row-stacked">
            <label htmlFor="c-message">Mensagem</label>
            <textarea id="c-message" name="message" rows={5} required minLength={10} maxLength={2000} />
          </div>
          <div className="p3d-hp" aria-hidden="true">
            <input name="website" tabIndex={-1} autoComplete="off" />
          </div>
          <div className="p3d-contact-actions">
            <button type="submit" disabled={status.kind === 'sending'}>
              Enviar
            </button>
            <span role="status">
              {status.kind === 'sending' && 'Enviando...'}
              {status.kind === 'sent' && 'Mensagem enviada!'}
              {status.kind === 'error' && status.message}
            </span>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
