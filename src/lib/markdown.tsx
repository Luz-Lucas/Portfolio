import type { ReactNode } from 'react';

const INLINE = /\*\*(.+?)\*\*|\[([^\]]+)\]\((https?:\/\/[^)\s]+|mailto:[^)\s]+|\/[^)\s]*)\)/g;

function inline(text: string, keyPrefix: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(INLINE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    const key = `${keyPrefix}-${m.index}`;
    if (m[1] !== undefined) out.push(<strong key={key}>{m[1]}</strong>);
    else
      out.push(
        <a key={key} href={m[3]} target="_blank" rel="noopener">
          {m[2]}
        </a>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

/** Markdown mínimo: parágrafos, quebras de linha, **negrito** e [links](url). Nunca injeta HTML. */
export function renderMarkdown(text: string): ReactNode {
  return text
    .split(/\n{2,}/)
    .filter((p) => p.trim())
    .map((p, i) => (
      <p key={i}>
        {p.split('\n').flatMap((line, j) => [...(j ? [<br key={`br${j}`} />] : []), ...inline(line, `${i}-${j}`)])}
      </p>
    ));
}
