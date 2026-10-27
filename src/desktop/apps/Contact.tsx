'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import type { SiteContent } from '@/content/types';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending' }
  | { kind: 'sent' }
  | { kind: 'error'; message: string; mailto?: string };

/** Plano B quando o envio falha: abre o e-mail do visitante com a mensagem já escrita. */
const mailtoFor = (to: string, data: Record<string, FormDataEntryValue>) =>
  `mailto:${to}?subject=${encodeURIComponent(String(data.subject || `Contato pelo portfólio — ${data.name}`))}&body=${encodeURIComponent(String(data.message ?? ''))}`;

type SendResult = { ok: boolean; status: number; error?: string };

/**
 * Com NEXT_PUBLIC_WEB3FORMS_KEY, envia direto do navegador ao Web3Forms (o plano gratuito não aceita envio
 * pelo servidor; a chave é pública por design). Sem a chave, usa a rota /api/contact (FormSubmit/Resend).
 */
async function send(data: Record<string, FormDataEntryValue>): Promise<SendResult> {
  const key = process.env.NEXT_PUBLIC_WEB3FORMS_KEY;
  if (!key) {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(data),
    });
    const body = res.ok ? {} : await res.json().catch(() => ({}));
    return { ok: res.ok, status: res.status, error: body.error };
  }
  const res = await fetch('https://api.web3forms.com/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({
      access_key: key,
      from_name: 'Luz 95 — portfólio',
      name: data.name,
      email: data.email,
      subject: String(data.subject || `Contato pelo portfólio — ${data.name}`),
      message: data.message,
      botcheck: '',
    }),
  });
  const body = await res.json().catch(() => ({}));
  const ok = res.ok && body.success === true;
  if (!ok) console.error('[contato] Web3Forms recusou o envio:', res.status, body.message ?? '');
  return { ok, status: res.status };
}

export function Contact({ content }: { content: SiteContent }) {
  const { email, linkedin, github } = content.contact;
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    // Honeypot: só robôs preenchem o campo escondido; finge que enviou e descarta.
    if (data.website) {
      form.reset();
      setStatus({ kind: 'sent' });
      return;
    }
    setStatus({ kind: 'sending' });
    try {
      const res = await send(data);
      if (res.ok) {
        form.reset();
        setStatus({ kind: 'sent' });
      } else if (res.status === 429) {
        setStatus({ kind: 'error', message: 'Muitas mensagens, tente mais tarde.' });
      } else {
        setStatus({ kind: 'error', message: res.error ?? 'Não foi possível enviar agora.', mailto: mailtoFor(email, data) });
      }
    } catch {
      setStatus({ kind: 'error', message: 'Sem conexão. Tente de novo.', mailto: mailtoFor(email, data) });
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
            <label htmlFor="c-subject">Assunto</label>
            <input id="c-subject" name="subject" maxLength={120} placeholder="Ex.: vaga de front-end" />
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
              {status.kind === 'error' && status.mailto && (
                <>
                  {' '}
                  Você pode <a href={status.mailto}>enviar pelo seu e-mail</a>.
                </>
              )}
            </span>
          </div>
        </fieldset>
      </form>
    </div>
  );
}
