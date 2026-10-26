import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Contact } from '@/desktop/apps/Contact';
import { SEED_CONTENT } from '@/content/seed';

function fill() {
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Seu e-mail'), { target: { value: 'ana@exemplo.com' } });
  fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Olá, vi seu portfólio!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
}

describe('Contact', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('shows the contact links', () => {
    render(<Contact content={SEED_CONTENT} />);
    expect(screen.getByRole('link', { name: SEED_CONTENT.contact.email })).toHaveAttribute(
      'href',
      `mailto:${SEED_CONTENT.contact.email}`,
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toHaveAttribute('href', SEED_CONTENT.contact.linkedin);
    expect(screen.getByRole('link', { name: 'GitHub' })).toHaveAttribute('href', SEED_CONTENT.contact.github);
  });

  it('confirms a sent message', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 })));
    render(<Contact content={SEED_CONTENT} />);
    fill();
    expect(await screen.findByText('Mensagem enviada!')).toBeInTheDocument();
  });

  it('explains the rate limit', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'x' }), { status: 429 })),
    );
    render(<Contact content={SEED_CONTENT} />);
    fill();
    expect(await screen.findByText('Muitas mensagens, tente mais tarde.')).toBeInTheDocument();
  });

  it('keeps the honeypot out of the tab order', () => {
    render(<Contact content={SEED_CONTENT} />);
    const hp = document.querySelector('input[name="website"]')!;
    expect(hp).toHaveAttribute('tabindex', '-1');
    expect(hp.closest('[aria-hidden="true"]')).not.toBeNull();
  });
});
