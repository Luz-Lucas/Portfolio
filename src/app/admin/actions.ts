'use server';

import { revalidateTag } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/auth';
import type { ContentKey } from '@/lib/content';
import { contentSchemas } from '@/lib/content-schemas';
import { fetchPublicRepos } from '@/lib/github';
import { checkFile, EXTENSIONS } from '@/lib/uploads';
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

export async function listAdminProjects(): Promise<{ projects: AdminProject[]; githubError: boolean }> {
  await requireAdmin();
  const username = process.env.GITHUB_USERNAME;
  let githubError = false;
  // GitHub fora do ar não pode travar o resto do painel (textos, currículo, skills).
  const reposPromise = (username ? fetchPublicRepos(username) : Promise.resolve([])).catch((err) => {
    console.error('[admin] GitHub indisponível:', err);
    githubError = true;
    return [];
  });
  const [repos, rows] = await Promise.all([
    reposPromise,
    createAdminClient()
      .from('projects')
      .select('repo_id, visible, sort, description, demo_url, cover_url')
      .then(({ data, error }) => {
        if (error) throw new Error(`Falha ao ler projetos: ${error.message}`);
        return (data ?? []) as ProjectRow[];
      }),
  ]);
  return { projects: combineAdminProjects(repos, rows), githubError };
}

export async function uploadCv(form: FormData): Promise<ActionResult> {
  await requireAdmin();
  const checked = await checkFile(form.get('file') as File | null, 'cv');
  if (!checked.ok) return checked;

  const db = createAdminClient();
  const { data: current } = await db.from('content').select('value').eq('key', 'cv').maybeSingle();
  const previousPath = (current?.value as { path?: string } | undefined)?.path;

  const path = `curriculo-${Date.now()}.pdf`;
  const bucket = db.storage.from('cv');
  const { error: upErr } = await bucket.upload(path, checked.bytes, { contentType: 'application/pdf' });
  if (upErr) return { ok: false, error: `Falha no upload: ${upErr.message}` };

  const url = bucket.getPublicUrl(path).data.publicUrl;
  const { error } = await db.from('content').upsert({ key: 'cv', value: { url, path }, updated_at: new Date().toISOString() });
  if (error) {
    await bucket.remove([path]);
    return { ok: false, error: `Erro ao salvar: ${error.message}` };
  }
  if (previousPath && previousPath !== path) await bucket.remove([previousPath]);

  revalidateTag('content');
  return { ok: true };
}

export async function uploadImage(
  form: FormData,
  purpose: 'photo' | 'cover',
): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  await requireAdmin();
  const checked = await checkFile(form.get('file') as File | null, 'image');
  if (!checked.ok) return checked;

  const path = `${purpose}/${Date.now()}.${EXTENSIONS[checked.type]}`;
  const bucket = createAdminClient().storage.from('images');
  const { error } = await bucket.upload(path, checked.bytes, { contentType: checked.type });
  if (error) return { ok: false, error: `Falha no upload: ${error.message}` };
  return { ok: true, url: bucket.getPublicUrl(path).data.publicUrl };
}
