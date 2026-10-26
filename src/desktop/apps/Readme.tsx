import type { SiteContent } from '@/content/types';
import { renderMarkdown } from '@/lib/markdown';

export function Readme({ content }: { content: SiteContent }) {
  return <div className="p3d-notepad">{renderMarkdown(content.readme.body)}</div>;
}
