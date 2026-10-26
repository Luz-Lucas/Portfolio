import { unstable_cache } from 'next/cache';
import { SEED_CONTENT } from '@/content/seed';
import type { SiteContent } from '@/content/types';
import { isSupabaseConfigured } from './supabase/env';
import { createPublicClient } from './supabase/public';

export const CONTENT_KEYS = ['readme', 'about', 'contact', 'skills', 'experience'] as const;
export type ContentKey = (typeof CONTENT_KEYS)[number];

type Row = { key: string; value: unknown };

export function buildSiteContent(rows: Row[]): SiteContent {
  const byKey = new Map(rows.map((r) => [r.key, r.value]));
  const pick = <K extends ContentKey>(k: K): SiteContent[K] => (byKey.get(k) as SiteContent[K]) ?? SEED_CONTENT[k];
  const cv = byKey.get('cv') as { url?: string } | undefined;
  return {
    readme: pick('readme'),
    about: pick('about'),
    contact: pick('contact'),
    skills: pick('skills'),
    experience: pick('experience'),
    cvUrl: cv?.url ?? null,
  };
}

const loadContent = unstable_cache(
  async () => {
    const { data, error } = await createPublicClient().from('content').select('key, value');
    if (error) throw new Error(`Falha ao ler conteúdo: ${error.message}`);
    return buildSiteContent(data ?? []);
  },
  ['site-content'],
  { tags: ['content'] },
);

export async function getSiteContent(): Promise<SiteContent> {
  if (!isSupabaseConfigured()) return SEED_CONTENT;
  return loadContent();
}
