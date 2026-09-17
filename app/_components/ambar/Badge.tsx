/**
 * Categoria ou status curto — ex. a linguagem de um repositório. `gold`
 * é raro por design: reservado para um destaque por tela.
 */
export function Badge({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "terracotta" | "gold";
  children: React.ReactNode;
}) {
  const toneClass = {
    neutral: "bg-surface-raised text-ink-muted border-line",
    terracotta: "bg-terracotta-soft text-terracotta-text border-transparent",
    gold: "bg-gold-soft text-ink border-transparent",
  }[tone];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 font-mono text-[11px] font-medium uppercase tracking-[0.06em] leading-5 ${toneClass}`}
    >
      {children}
    </span>
  );
}
