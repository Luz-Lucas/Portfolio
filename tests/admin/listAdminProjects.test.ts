import { describe, expect, it, vi } from 'vitest';

const rows = [{ repo_id: 7, visible: true, sort: 0, description: null, demo_url: null, cover_url: null }];
vi.mock('@/lib/auth', () => ({ requireAdmin: vi.fn().mockResolvedValue({ id: 'u' }) }));
vi.mock('next/cache', () => ({ revalidateTag: vi.fn(), unstable_cache: (fn: unknown) => fn }));
vi.mock('@/lib/github', () => ({ fetchPublicRepos: vi.fn().mockRejectedValue(new Error('GitHub respondeu 403')) }));
vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: () => ({ from: () => ({ select: () => Promise.resolve({ data: rows, error: null }) }) }),
}));

const { listAdminProjects } = await import('@/app/admin/actions');

describe('listAdminProjects', () => {
  it('keeps the admin usable when GitHub is down: curated rows come back flagged, not an exception', async () => {
    process.env.GITHUB_USERNAME = 'Luz-Lucas';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const result = await listAdminProjects();
    expect(result.githubError).toBe(true);
    expect(result.projects).toEqual([{ repo: null, row: rows[0] }]);
  });
});
