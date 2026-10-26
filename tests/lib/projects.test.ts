import { describe, expect, it, vi } from 'vitest';
import type { GithubRepo } from '@/lib/github';
import type { ProjectRow } from '@/lib/projects';

const fetchPublicRepos = vi.fn();
vi.mock('@/lib/github', () => ({ fetchPublicRepos }));
const select = vi.fn();
vi.mock('@/lib/supabase/public', () => ({ createPublicClient: () => ({ from: () => ({ select }) }) }));
vi.mock('next/cache', () => ({ unstable_cache: (fn: () => unknown) => fn }));

const { mergeProjects, getProjects } = await import('@/lib/projects');

const repo = (id: number, extra: Partial<GithubRepo> = {}): GithubRepo => ({
  id,
  name: `repo-${id}`,
  description: `desc ${id}`,
  html_url: `https://github.com/eu/repo-${id}`,
  homepage: null,
  language: 'TypeScript',
  topics: [],
  stargazers_count: id,
  fork: false,
  archived: false,
  pushed_at: '2026-01-01T00:00:00Z',
  ...extra,
});

const row = (repo_id: number, extra: Partial<ProjectRow> = {}): ProjectRow => ({
  repo_id,
  visible: true,
  sort: 0,
  description: null,
  demo_url: null,
  cover_url: null,
  ...extra,
});

describe('mergeProjects', () => {
  it('returns only visible rows ordered by sort', () => {
    const out = mergeProjects([repo(1), repo(2), repo(3)], [row(1, { sort: 2 }), row(2, { visible: false }), row(3, { sort: 1 })]);
    expect(out.map((p) => p.repoId)).toEqual([3, 1]);
  });

  it('row overrides win over the repo; homepage is the demo fallback', () => {
    const [a, b] = mergeProjects(
      [repo(1, { homepage: 'https://home' }), repo(2, { homepage: 'https://home2' })],
      [row(1, { sort: 0 }), row(2, { sort: 1, description: 'minha', demo_url: 'https://demo', cover_url: '/c.png' })],
    );
    expect(a.description).toBe('desc 1');
    expect(a.demoUrl).toBe('https://home');
    expect(b.description).toBe('minha');
    expect(b.demoUrl).toBe('https://demo');
    expect(b.coverUrl).toBe('/c.png');
  });

  it('languages = language + topics, without nulls or duplicates', () => {
    const [p] = mergeProjects([repo(1, { language: 'TypeScript', topics: ['react', 'TypeScript'] })], [row(1)]);
    expect(p.languages).toEqual(['TypeScript', 'react']);
    const [q] = mergeProjects([repo(2, { language: null, topics: ['cli'] })], [row(2)]);
    expect(q.languages).toEqual(['cli']);
  });

  it('drops rows whose repo no longer exists', () => {
    expect(mergeProjects([repo(1)], [row(1), row(99)]).map((p) => p.repoId)).toEqual([1]);
  });
});

describe('getProjects', () => {
  it('returns an error object when GitHub fails', async () => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://x.supabase.co';
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'anon';
    process.env.GITHUB_USERNAME = 'eu';
    fetchPublicRepos.mockRejectedValue(new Error('403 rate limit'));
    select.mockResolvedValue({ data: [], error: null });
    expect(await getProjects()).toEqual({ error: 'github_unavailable' });
  });

  it('merges GitHub repos with the curation rows', async () => {
    fetchPublicRepos.mockResolvedValue([repo(1), repo(2)]);
    select.mockResolvedValue({ data: [row(2)], error: null });
    const out = await getProjects();
    expect(Array.isArray(out) && out.map((p) => p.repoId)).toEqual([2]);
  });
});

describe('getProjects without curation', () => {
  it('shows the top 6 own repos by stars when nothing was curated yet', async () => {
    const { pickDefaultProjects } = await import('@/lib/projects');
    const repos = [
      repo(1, { stargazers_count: 1 }),
      repo(2, { stargazers_count: 9, fork: true }),
      repo(3, { stargazers_count: 8, archived: true }),
      ...[4, 5, 6, 7, 8, 9, 10].map((id) => repo(id, { stargazers_count: id })),
    ];
    expect(pickDefaultProjects(repos).map((p) => p.repoId)).toEqual([10, 9, 8, 7, 6, 5]);
  });

  it('getProjects falls back to the defaults when the curation table is empty', async () => {
    fetchPublicRepos.mockResolvedValue([repo(1, { stargazers_count: 3 }), repo(2, { stargazers_count: 5 })]);
    select.mockResolvedValue({ data: [], error: null });
    const out = await getProjects();
    expect(Array.isArray(out) && out.map((p) => p.repoId)).toEqual([2, 1]);
  });
});
