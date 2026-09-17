/**
 * O selo circular de estatística da referência do jogo chinês ("93",
 * "1–4 jogadores"). Empilhado em linha, substitui o `NumberedStep` do
 * Âmbar como marcador numerado da Trajetória e como o fato rápido que a
 * foto duplicada cumpria em Sobre.
 */
export function StatBadge({
  value,
  label,
}: {
  value: React.ReactNode;
  label: React.ReactNode;
}) {
  return (
    <div className="inline-flex w-[88px] flex-col items-center gap-1">
      <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-ember-deep font-display text-xl text-ink">
        {value}
      </div>
      <p className="text-center font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-muted">
        {label}
      </p>
    </div>
  );
}
