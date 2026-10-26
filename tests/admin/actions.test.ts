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
