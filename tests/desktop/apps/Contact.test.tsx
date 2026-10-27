import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Contact } from '@/desktop/apps/Contact';
import { SEED_CONTENT } from '@/content/seed';

function fill() {
  fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'Ana' } });
  fireEvent.change(screen.getByLabelText('Seu e-mail'), { target: { value: 'ana@exemplo.com' } });
  fireEvent.change(screen.getByLabelText('Assunto'), { target: { value: 'Vaga' } });
  fireEvent.change(screen.getByLabelText('Mensagem'), { target: { value: 'Olá, vi seu portfólio!' } });
  fireEvent.click(screen.getByRole('button', { name: 'Enviar' }));
}

describe('Contact', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

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

  it('offers a pre-filled e-mail when sending fails', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(new Response(JSON.stringify({ error: 'Não foi possível enviar agora.' }), { status: 502 })),
    );
    render(<Contact content={SEED_CONTENT} />);
    fill();
    const link = await screen.findByRole('link', { name: 'enviar pelo seu e-mail' });
    const href = link.getAttribute('href')!;
    expect(href.startsWith(`mailto:${SEED_CONTENT.contact.email}?`)).toBe(true);
    expect(decodeURIComponent(href)).toContain('Olá, vi seu portfólio!');
  });

  it('keeps the honeypot out of the tab order', () => {
    render(<Contact content={SEED_CONTENT} />);
    const hp = document.querySelector('input[name="website"]')!;
    expect(hp).toHaveAttribute('tabindex', '-1');
    expect(hp.closest('[aria-hidden="true"]')).not.toBeNull();
  });

  describe('with a Web3Forms key', () => {
    it('sends straight from the browser to Web3Forms', async () => {
      vi.stubEnv('NEXT_PUBLIC_WEB3FORMS_KEY', 'chave-publica-teste');
      const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: true }), { status: 200 }));
      vi.stubGlobal('fetch', fetchMock);
      render(<Contact content={SEED_CONTENT} />);
      fill();
      expect(await screen.findByText('Mensagem enviada!')).toBeInTheDocument();
      const [url, init] = fetchMock.mock.calls[0];
      expect(url).toBe('https://api.web3forms.com/submit');
      expect(JSON.parse(init.body)).toMatchObject({
        access_key: 'chave-publica-teste',
        name: 'Ana',
        email: 'ana@exemplo.com',
        subject: 'Vaga',
        message: 'Olá, vi seu portfólio!',
        botcheck: '',
      });
    });

    it('shows the service error with the e-mail fallback', async () => {
      vi.stubEnv('NEXT_PUBLIC_WEB3FORMS_KEY', 'chave-publica-teste');
      vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ success: false, message: 'Invalid access key' }), { status: 400 })));
      render(<Contact content={SEED_CONTENT} />);
      fill();
      expect(await screen.findByRole('link', { name: 'enviar pelo seu e-mail' })).toBeInTheDocument();
    });

    it('drops bot submissions (honeypot filled) without sending', async () => {
      vi.stubEnv('NEXT_PUBLIC_WEB3FORMS_KEY', 'chave-publica-teste');
      const fetchMock = vi.fn();
      vi.stubGlobal('fetch', fetchMock);
      render(<Contact content={SEED_CONTENT} />);
      fireEvent.change(document.querySelector('input[name="website"]')!, { target: { value: 'spam' } });
      fill();
      expect(await screen.findByText('Mensagem enviada!')).toBeInTheDocument();
      expect(fetchMock).not.toHaveBeenCalled();
    });
  });
});
