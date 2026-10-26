import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SEED_CONTENT } from '@/content/seed';

const requireAdmin = vi.fn();
const upsert = vi.fn();
const revalidateTag = vi.fn();
vi.mock('@/lib/auth', () => ({ requireAdmin }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: () => ({ upsert }) }) }));
vi.mock('next/cache', () => ({ revalidateTag, unstable_cache: (fn: unknown) => fn }));

const { saveContent } = await import('@/app/admin/actions');

describe('saveContent', () => {
  beforeEach(() => {
    requireAdmin.mockReset().mockResolvedValue({ id: 'u' });
    upsert.mockReset().mockResolvedValue({ error: null });
    revalidateTag.mockReset();
  });

  it('refuses non-admins without writing', async () => {
    requireAdmin.mockRejectedValue(new Error('NEXT_REDIRECT'));
    await expect(saveContent('readme', { body: 'x' })).rejects.toThrow();
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects an about without a name', async () => {
    const r = await saveContent('about', { ...SEED_CONTENT.about, name: '' });
    expect(r).toEqual({ ok: false, error: expect.stringMatching(/nome/i) });
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects a LinkedIn that is not a URL', async () => {
    const r = await saveContent('contact', { ...SEED_CONTENT.contact, linkedin: 'meu-linkedin' });
    expect(r.ok).toBe(false);
  });

  it('rejects a skill level of 6', async () => {
    const skills = [{ group: 'X', items: [{ name: 'Y', level: 6 }] }];
    expect((await saveContent('skills', skills)).ok).toBe(false);
  });

  it('upserts valid content and revalidates the site', async () => {
    const r = await saveContent('readme', { body: 'Olá' });
    expect(r).toEqual({ ok: true });
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ key: 'readme', value: { body: 'Olá' } }));
    expect(revalidateTag).toHaveBeenCalledWith('content');
  });

  it('reports a database error', async () => {
    upsert.mockResolvedValue({ error: { message: 'boom' } });
    expect(await saveContent('readme', { body: 'Olá' })).toEqual({ ok: false, error: expect.any(String) });
  });
});

describe('saveContent hardening', () => {
  beforeEach(() => {
    requireAdmin.mockReset().mockResolvedValue({ id: 'u' });
    upsert.mockReset().mockResolvedValue({ error: null });
  });

  it('rejects javascript: and data: URLs in links and photo', async () => {
    expect((await saveContent('contact', { ...SEED_CONTENT.contact, linkedin: 'javascript:alert(1)' })).ok).toBe(false);
    expect((await saveContent('about', { ...SEED_CONTENT.about, photoUrl: 'data:text/html,x' })).ok).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });

  it('rejects an unknown content key instead of throwing', async () => {
    expect(await saveContent('hack' as never, {})).toEqual({ ok: false, error: expect.any(String) });
  });
});

describe('saveContent photo path', () => {
  it('accepts the bundled avatar path so the About section saves unchanged', async () => {
    requireAdmin.mockReset().mockResolvedValue({ id: 'u' });
    upsert.mockReset().mockResolvedValue({ error: null });
    expect(await saveContent('about', { ...SEED_CONTENT.about, photoUrl: '/images/avatar.webp' })).toEqual({ ok: true });
    expect((await saveContent('about', { ...SEED_CONTENT.about, photoUrl: '//evil.com/x.png' })).ok).toBe(false);
  });
});

describe('saveContent with the previous portfolio data shape', () => {
  it('accepts skills without level, group descriptions, year-only periods and highlights', async () => {
    requireAdmin.mockReset().mockResolvedValue({ id: 'u' });
    upsert.mockReset().mockResolvedValue({ error: null });
    expect(await saveContent('skills', [{ group: 'X', description: 'd', items: [{ name: 'React' }] }])).toEqual({ ok: true });
    expect(
      await saveContent('experience', [{ kind: 'job', title: 'T', org: 'O', start: '2024', end: null, description: 'd', highlights: ['a'] }]),
    ).toEqual({ ok: true });
  });
});
