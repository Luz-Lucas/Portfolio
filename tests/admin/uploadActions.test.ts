import { beforeEach, describe, expect, it, vi } from 'vitest';

const requireAdmin = vi.fn().mockResolvedValue({ id: 'u' });
const upload = vi.fn();
const remove = vi.fn();
const upsert = vi.fn();
const maybeSingle = vi.fn();
vi.mock('@/lib/auth', () => ({ requireAdmin }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({
    storage: { from: () => ({ upload, remove, getPublicUrl: (p: string) => ({ data: { publicUrl: `https://cdn/${p}` } }) }) },
    from: () => ({ upsert, select: () => ({ eq: () => ({ maybeSingle }) }) }),
  }),
}));

const { uploadCv } = await import('@/app/admin/actions');

const pdf = (size = 1000) => new File([new Uint8Array([0x25, 0x50, 0x44, 0x46, ...new Array(size).fill(0)])], 'cv.pdf', { type: 'application/pdf' });
const form = (file: File) => {
  const f = new FormData();
  f.set('file', file);
  return f;
};

describe('uploadCv', () => {
  beforeEach(() => {
    upload.mockReset().mockResolvedValue({ error: null });
    remove.mockReset().mockResolvedValue({ error: null });
    upsert.mockReset().mockResolvedValue({ error: null });
    maybeSingle.mockReset().mockResolvedValue({ data: { value: { url: 'https://cdn/curriculo-1.pdf', path: 'curriculo-1.pdf' } }, error: null });
  });

  it('rejects a non-pdf without touching storage or content', async () => {
    const png = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0, 0, 0, 0])], 'x.pdf', { type: 'application/pdf' });
    const r = await uploadCv(form(png));
    expect(r.ok).toBe(false);
    expect(upload).not.toHaveBeenCalled();
    expect(upsert).not.toHaveBeenCalled();
  });

  it('keeps the current cv when the upload fails', async () => {
    upload.mockResolvedValue({ error: { message: 'down' } });
    const r = await uploadCv(form(pdf()));
    expect(r.ok).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
    expect(remove).not.toHaveBeenCalled();
  });

  it('saves the new cv then deletes the previous file', async () => {
    const r = await uploadCv(form(pdf()));
    expect(r.ok).toBe(true);
    expect(upsert).toHaveBeenCalledWith(expect.objectContaining({ key: 'cv' }));
    expect(remove).toHaveBeenCalledWith(['curriculo-1.pdf']);
    expect(upsert.mock.invocationCallOrder[0]).toBeLessThan(remove.mock.invocationCallOrder[0]);
  });
});
