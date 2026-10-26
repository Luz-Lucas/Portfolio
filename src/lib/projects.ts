import { unstable_cache } from 'next/cache';
import type { Project, ProjectsResult } from '@/content/types';
import { fetchPublicRepos, type GithubRepo } from './github';
import { githubUsername } from './site';
import { isSupabaseConfigured } from './supabase/env';
import { createPublicClient } from './supabase/public';

export type ProjectRow = {
  repo_id: number;
  visible: boolean;
  sort: number;
  description: string | null;
  demo_url: string | null;
  cover_url: string | null;
};

export function mergeProjects(repos: GithubRepo[], rows: ProjectRow[]): Project[] {
  const byId = new Map(repos.map((r) => [r.id, r]));
  return rows
    .filter((row) => row.visible && byId.has(row.repo_id))
    .sort((a, b) => a.sort - b.sort)
    .map((row) => {
      const repo = byId.get(row.repo_id)!;
      return {
        repoId: repo.id,
        name: repo.name,
        description: row.description ?? repo.description ?? '',
        url: repo.html_url,
        demoUrl: row.demo_url ?? (repo.homepage || null),
        coverUrl: row.cover_url,
        languages: [...new Set([repo.language, ...repo.topics].filter((l): l is string => Boolean(l)))],
        stars: repo.stargazers_count,
        updatedAt: repo.pushed_at,
      };
    });
}

const DEFAULT_COUNT = 6;

/** Sem curadoria salva: os repositórios próprios (sem forks/arquivados) com mais estrelas. */
export function pickDefaultProjects(repos: GithubRepo[]): Project[] {
  const top = repos
    .filter((r) => !r.fork && !r.archived)
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .slice(0, DEFAULT_COUNT);
  return mergeProjects(
    top,
    top.map((r, i) => ({ repo_id: r.id, visible: true, sort: i, description: null, demo_url: null, cover_url: null })),
  );
}

const loadRows = unstable_cache(
  async (): Promise<ProjectRow[]> => {
    const { data, error } = await createPublicClient().from('projects').select('*');
    if (error) throw new Error(`Falha ao ler projetos: ${error.message}`);
    return (data ?? []) as ProjectRow[];
  },
  ['project-rows'],
  { tags: ['projects'] },
);

export async function getProjects(): Promise<ProjectsResult> {
  const username = githubUsername();

  const rows = isSupabaseConfigured() ? await loadRows() : [];
  try {
    const repos = await fetchPublicRepos(username);
    return rows.length ? mergeProjects(repos, rows) : pickDefaultProjects(repos);
  } catch (err) {
    console.error('[projects] GitHub indisponível:', err);
    return { error: 'github_unavailable' };
  }
}

export type AdminProject = { repo: GithubRepo | null; row: ProjectRow | null };

/** Linhas curadas primeiro (pela ordem salva, incluindo as órfãs), depois os repos ainda não curados. */
export function combineAdminProjects(repos: GithubRepo[], rows: ProjectRow[]): AdminProject[] {
  const byId = new Map(repos.map((r) => [r.id, r]));
  const curated = [...rows].sort((a, b) => a.sort - b.sort).map((row) => ({ repo: byId.get(row.repo_id) ?? null, row }));
  const rowIds = new Set(rows.map((r) => r.repo_id));
  const rest = repos.filter((r) => !rowIds.has(r.id)).map((repo) => ({ repo, row: null }));
  return [...curated, ...rest];
}
