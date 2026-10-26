import { SEED_CONTENT } from '@/content/seed';
import type { SiteContent } from '@/content/types';

export async function getSiteContent(): Promise<SiteContent> {
  return SEED_CONTENT;
}
