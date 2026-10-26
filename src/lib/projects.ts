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

/** Repositório sem configuração salva: aparece, a menos que seja fork ou arquivado. */
export const visibleByDefault = (repo: GithubRepo) => !repo.fork && !repo.archived;

/**
 * Todo repositório aparece, exceto os ocultados no admin (forks e arquivados começam ocultos).
 * Ordem: os que têm linha salva, pela ordem salva; depois os demais, por estrelas.
 */
export function mergeProjects(repos: GithubRepo[], rows: ProjectRow[]): Project[] {
  const rowById = new Map(rows.map((r) => [r.repo_id, r]));
  const shown = repos.filter((repo) => rowById.get(repo.id)?.visible ?? visibleByDefault(repo));
  const saved = shown.filter((r) => rowById.has(r.id)).sort((a, b) => rowById.get(a.id)!.sort - rowById.get(b.id)!.sort);
  const rest = shown.filter((r) => !rowById.has(r.id)).sort((a, b) => b.stargazers_count - a.stargazers_count);
  return [...saved, ...rest].map((repo) => {
    const row = rowById.get(repo.id);
    return {
      repoId: repo.id,
      name: repo.name,
      description: row?.description ?? repo.description ?? '',
      url: repo.html_url,
      demoUrl: row?.demo_url ?? (repo.homepage || null),
      coverUrl: row?.cover_url ?? null,
      languages: [...new Set([repo.language, ...repo.topics].filter((l): l is string => Boolean(l)))],
      stars: repo.stargazers_count,
      updatedAt: repo.pushed_at,
    };
  });
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
    return mergeProjects(repos, rows);
  } catch (err) {
    console.error('[projects] GitHub indisponível:', err);
    return { error: 'github_unavailable' };
  }
}

export type AdminProject = { repo: GithubRepo | null; row: ProjectRow | null };

/** Mesma ordem do site: linhas salvas (pela ordem salva, incluindo as órfãs), depois os demais por estrelas. */
export function combineAdminProjects(repos: GithubRepo[], rows: ProjectRow[]): AdminProject[] {
  const byId = new Map(repos.map((r) => [r.id, r]));
  const curated = [...rows].sort((a, b) => a.sort - b.sort).map((row) => ({ repo: byId.get(row.repo_id) ?? null, row }));
  const rowIds = new Set(rows.map((r) => r.repo_id));
  const rest = repos
    .filter((r) => !rowIds.has(r.id))
    .sort((a, b) => b.stargazers_count - a.stargazers_count)
    .map((repo) => ({ repo, row: null }));
  return [...curated, ...rest];
}
