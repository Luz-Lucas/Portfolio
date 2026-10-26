'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import type { ContentKey } from '@/lib/content';
import { contentSchemas } from '@/lib/content-schemas';
import { fetchPublicRepos } from '@/lib/github';
import { combineAdminProjects, type AdminProject, type ProjectRow } from '@/lib/projects';
import { createAdminClient } from '@/lib/supabase/admin';

export type ActionResult = { ok: true } | { ok: false; error: string };

export async function saveContent(key: ContentKey, value: unknown): Promise<ActionResult> {
  await requireAdmin();
  const parsed = contentSchemas[key].safeParse(value);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };

  const { error } = await createAdminClient()
    .from('content')
    .upsert({ key, value: parsed.data, updated_at: new Date().toISOString() });
  if (error) return { ok: false, error: `Erro ao salvar: ${error.message}` };

  revalidateTag('content');
  return { ok: true };
}

const projectRowSchema = z.object({
  repo_id: z.number().int().positive(),
  visible: z.boolean(),
  sort: z.number().int(),
  description: z.string().trim().max(500).nullable(),
  demo_url: z.string().trim().url('Link de demo inválido (use https://).').nullable(),
  cover_url: z.string().trim().url('URL da capa inválida.').nullable(),
});

export async function saveProjects(rows: ProjectRow[]): Promise<ActionResult> {
  await requireAdmin();
  const parsed = z.array(projectRowSchema).safeParse(rows.map((r, i) => ({ ...r, sort: i })));
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0]?.message ?? 'Dados inválidos.' };

  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from('projects')
    .upsert(parsed.data.map((r) => ({ ...r, updated_at: now })));
  if (error) return { ok: false, error: `Erro ao salvar: ${error.message}` };

  revalidateTag('projects');
  return { ok: true };
}

export async function deleteProjectRow(repoId: number): Promise<ActionResult> {
  await requireAdmin();
  const { error } = await createAdminClient().from('projects').delete().eq('repo_id', repoId);
  if (error) return { ok: false, error: `Erro ao remover: ${error.message}` };
  revalidateTag('projects');
  return { ok: true };
}

export async function refreshGithub(): Promise<void> {
  await requireAdmin();
  revalidateTag('github');
}

export async function listAdminProjects(): Promise<AdminProject[]> {
  await requireAdmin();
  const username = process.env.GITHUB_USERNAME;
  const [repos, rows] = await Promise.all([
    username ? fetchPublicRepos(username) : Promise.resolve([]),
    createAdminClient()
      .from('projects')
      .select('repo_id, visible, sort, description, demo_url, cover_url')
      .then(({ data, error }) => {
        if (error) throw new Error(`Falha ao ler projetos: ${error.message}`);
        return (data ?? []) as ProjectRow[];
      }),
  ]);
  return combineAdminProjects(repos, rows);
}
