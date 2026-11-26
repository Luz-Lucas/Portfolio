import { beforeEach, describe, expect, it, vi } from 'vitest';

const limit = vi.fn();
const list = vi.fn();
const upsert = vi.fn();
vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => ({
    from: () => ({ select: () => ({ limit }) }),
    storage: { from: () => ({ list }) },
  }),
}));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ upsert }) }),
}));

const { GET } = await import('@/app/api/keepalive/route');
const req = (auth?: string, ua?: string) =>
  new Request('http://localhost/api/keepalive', {
    headers: { ...(auth ? { authorization: auth } : {}), ...(ua ? { 'user-agent': ua } : {}) },
  });

describe('GET /api/keepalive', () => {
  beforeEach(() => {
    process.env.CRON_SECRET = 'segredo';
    process.env.SUPABASE_SERVICE_ROLE_KEY = 'service';
    limit.mockReset().mockResolvedValue({ data: [], error: null });
    list.mockReset().mockResolvedValue({ data: [], error: null });
    upsert.mockReset().mockResolvedValue({ error: null });
  });

  it('rejects requests without the cron secret', async () => {
    expect((await GET(req())).status).toBe(401);
    expect((await GET(req('Bearer errado'))).status).toBe(401);
    expect(limit).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });

  it('reads content, touches storage and writes the heartbeat', async () => {
    const res = await GET(req('Bearer segredo', 'vercel-cron/1.0'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, wrote: true });
    expect(limit).toHaveBeenCalledWith(1);
    expect(list).toHaveBeenCalled();
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ id: 1, source: 'vercel-cron/1.0' }));
  });

  it('still pings with reads when the service role key is missing', async () => {
    delete process.env.SUPABASE_SERVICE_ROLE_KEY;
    const res = await GET(req('Bearer segredo'));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ ok: true, wrote: false });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('reports a Supabase failure', async () => {
    limit.mockResolvedValue({ data: null, error: { message: 'paused' } });
    const res = await GET(req('Bearer segredo'));
    expect(res.status).toBe(502);
    expect(await res.json()).toEqual({ ok: false, errors: ['content: paused'] });
  });

  it('reports a heartbeat write failure', async () => {
    upsert.mockResolvedValue({ error: { message: 'relation "keepalive" does not exist' } });
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

    it('accepts the GitHub Actions keepalive workflow', async () => {
      expect((await GET(req(undefined, 'portfolio-keepalive/1.0'))).status).toBe(200);
    });

    it('still rejects anyone else', async () => {
      expect((await GET(req(undefined, 'curl/8.0'))).status).toBe(401);
      expect(limit).not.toHaveBeenCalled();
    });
  });

  it('with CRON_SECRET set, a scheduler user-agent alone is not enough', async () => {
    expect((await GET(req(undefined, 'vercel-cron/1.0'))).status).toBe(401);
    expect((await GET(req(undefined, 'portfolio-keepalive/1.0'))).status).toBe(401);
  });
});
