'use server';

import { revalidateTag } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import type { ContentKey } from '@/lib/content';
import { contentSchemas } from '@/lib/content-schemas';
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
