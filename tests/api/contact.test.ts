import { beforeEach, describe, expect, it, vi } from 'vitest';

const send = vi.fn().mockResolvedValue({ data: { id: '1' }, error: null });
vi.mock('resend', () => ({ Resend: vi.fn().mockImplementation(() => ({ emails: { send } })) }));

const { POST } = await import('@/app/api/contact/route');

const req = (body: unknown, ip = '9.9.9.9') =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  });

const valid = { name: 'Ana', email: 'ana@exemplo.com', message: 'Olá, vi seu portfólio!' };

describe('POST /api/contact', () => {
  beforeEach(() => {
    send.mockClear();
    process.env.CONTACT_TO_EMAIL = 'dono@exemplo.com';
    process.env.RESEND_API_KEY = 're_test';
  });

  it('silently accepts honeypot submissions without sending', async () => {
    const res = await POST(req({ ...valid, website: 'http://spam' }, '1.0.0.1'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(send).not.toHaveBeenCalled();
  });

  it('sends valid messages through Resend to the owner', async () => {
    const res = await POST(req(valid, '1.0.0.2'));
    expect(res.status).toBe(200);
    expect(send).toHaveBeenCalledWith(
      expect.objectContaining({
        from: 'Portfólio <onboarding@resend.dev>',
        to: 'dono@exemplo.com',
        replyTo: 'ana@exemplo.com',
      }),
    );
  });

  it('returns 400 for invalid input', async () => {
    const res = await POST(req({ ...valid, email: 'x' }, '1.0.0.3'));
    expect(res.status).toBe(400);
  });

  it('returns 429 after 3 messages from the same IP', async () => {
    for (let i = 0; i < 3; i++) await POST(req(valid, '1.0.0.4'));
    const res = await POST(req(valid, '1.0.0.4'));
    expect(res.status).toBe(429);
  });
});
