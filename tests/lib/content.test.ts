import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SEED_CONTENT } from '@/content/seed';

const select = vi.fn();
vi.mock('@/lib/supabase/public', () => ({
  createPublicClient: () => ({ from: () => ({ select }) }),
}));
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }));

const { buildSiteContent, getSiteContent } = await import('@/lib/content');

describe('buildSiteContent', () => {
  it('maps rows into SiteContent, cv.url → cvUrl', () => {
    const about = { ...SEED_CONTENT.about, name: 'Lucas' };
    const c = buildSiteContent([
      { key: 'about', value: about },
      { key: 'cv', value: { url: 'https://x/cv.pdf' } },
    ]);
    expect(c.about.name).toBe('Lucas');
    expect(c.cvUrl).toBe('https://x/cv.pdf');
  });

  it('falls back to the seed for missing keys', () => {
    const c = buildSiteContent([]);
    expect(c.skills).toEqual(SEED_CONTENT.skills);
    expect(c.cvUrl).toBeNull();
  });
});

describe('getSiteContent', () => {
  const env = { ...process.env };
  beforeEach(() => {
    select.mockReset();
  });
  afterEach(() => {
    process.env = { ...env };
  });

  it('returns the seed without network when Supabase is not configured', async () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    delete process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    expect(await getSiteContent()).toEqual(SEED_CONTENT);
    expect(select).not.toHaveBeenCalled();
  });

  it('throws when Supabase errors so the last good page keeps being served', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    select.mockResolvedValue({ data: null, error: { message: 'paused' } });
    await expect(getSiteContent()).rejects.toThrow('paused');
  });

  it('reads rows from Supabase when configured', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    select.mockResolvedValue({ data: [{ key: 'readme', value: { body: 'oi' } }], error: null });
    expect((await getSiteContent()).readme.body).toBe('oi');
  });
});
