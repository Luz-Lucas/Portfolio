import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { GithubRepo } from '@/lib/github';
import type { ProjectRow } from '@/lib/projects';

const requireAdmin = vi.fn().mockResolvedValue({ id: 'u' });
const upsert = vi.fn();
const revalidateTag = vi.fn();
vi.mock('@/lib/auth', () => ({ requireAdmin }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: () => ({ from: () => ({ upsert }) }) }));
vi.mock('next/cache', () => ({ revalidateTag, unstable_cache: (fn: unknown) => fn }));

const { combineAdminProjects } = await import('@/lib/projects');
const { saveProjects } = await import('@/app/admin/actions');

const repo = (id: number, extra: Partial<GithubRepo> = {}) =>
  ({ id, name: `r${id}`, description: null, html_url: '', homepage: null, language: null, topics: [], stargazers_count: 0, fork: false, archived: false, pushed_at: '', ...extra }) as GithubRepo;
const row = (repo_id: number, extra: Partial<ProjectRow> = {}): ProjectRow => ({
  repo_id,
  visible: true,
  sort: 0,
  description: null,
  demo_url: null,
  cover_url: null,
  ...extra,
});

describe('combineAdminProjects', () => {
  it('lists every repo (forks and archived included) with its row, plus orphan rows with repo null', () => {
    const out = combineAdminProjects([repo(1), repo(2, { fork: true }), repo(3, { archived: true })], [row(2, { sort: 0 }), row(99, { sort: 1 })]);
    expect(out.map((p) => [p.repo?.id ?? null, p.row?.repo_id ?? null])).toEqual([
      [2, 2],
      [null, 99],
      [1, null],
      [3, null],
    ]);
  });
});

describe('saveProjects', () => {
  beforeEach(() => {
    upsert.mockReset().mockResolvedValue({ error: null });
    revalidateTag.mockReset();
  });

  it('stores sort as the position in the submitted list and revalidates', async () => {
    const r = await saveProjects([row(5, { sort: 9 }), row(3, { sort: 9 })]);
    expect(r).toEqual({ ok: true });
    const saved = upsert.mock.calls[0][0] as ProjectRow[];
    expect(saved.map((p) => [p.repo_id, p.sort])).toEqual([
      [5, 0],
      [3, 1],
    ]);
    expect(revalidateTag).toHaveBeenCalledWith('projects');
  });

  it('rejects an invalid demo url', async () => {
    const r = await saveProjects([row(1, { demo_url: 'nao-e-url' })]);
    expect(r.ok).toBe(false);
    expect(upsert).not.toHaveBeenCalled();
  });
});
