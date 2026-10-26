import 'server-only';
import type { SiteContent } from '@/content/types';
import { buildSiteContent } from './content';
import { createAdminClient } from './supabase/admin';

/** Conteúdo atual sem cache, para o painel. */
export async function loadAdminContent(): Promise<SiteContent> {
  const { data, error } = await createAdminClient().from('content').select('key, value');
  if (error) throw new Error(`Falha ao ler conteúdo: ${error.message}`);
  return buildSiteContent(data ?? []);
}
