import { beforeEach, describe, expect, it, vi } from 'vitest';

const limit = vi.fn();
vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => ({ from: () => ({ select: () => ({ limit }) }) }),
}));

const { GET } = await import('@/app/api/keepalive/route');
const req = (auth?: string) => new Request('http://localhost/api/keepalive', { headers: auth ? { authorization: auth } : {} });

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
});
