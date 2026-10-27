import { beforeEach, describe, expect, it, vi } from 'vitest';

const limit = vi.fn();
vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => ({ from: () => ({ select: () => ({ limit }) }) }),
}));

const { GET } = await import('@/app/api/keepalive/route');
const req = (auth?: string, ua?: string) =>
  new Request('http://localhost/api/keepalive', {
    headers: { ...(auth ? { authorization: auth } : {}), ...(ua ? { 'user-agent': ua } : {}) },
  });

describe('GET /api/keepalive', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'segredo';
    limit.mockReset().mockResolvedValue({ data: [], error: null });
  });

  it('rejects requests without the cron secret', async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req('Bearer errado'))).status).toBe(401);
    expect(limit).not.toHaveBeenCalled();
  });

  it('pings Supabase with the right secret', async () => {
    const res = await GET(req('Bearer segredo'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true });
    expect(limit).toHaveBeenCalledWith(1);
  });

  it('reports a Supabase failure', async () => {
    limit.mockResolvedValue({ data: null, error: { message: 'paused' } });
    expect((await GET(req('Bearer segredo'))).status).toBe(502);
  });

  describe('without CRON_SECRET configured', () => {
    beforeEach(() => {
      delete process.env.CRON_SECRET;
    });

    it('accepts the Vercel cron scheduler', async () => {
      const res = await GET(req(undefined, 'vercel-cron/1.0'));
      expect(res.status).toBe(200);
      expect(limit).toHaveBeenCalledWith(1);
    });

    it('still rejects anyone else', async () => {
      expect((await GET(req(undefined, 'curl/8.0'))).status).toBe(401);
      expect(limit).not.toHaveBeenCalled();
    });
  });

  it('with CRON_SECRET set, the cron user-agent alone is not enough', async () => {
    expect((await GET(req(undefined, 'vercel-cron/1.0'))).status).toBe(401);
  });
});
