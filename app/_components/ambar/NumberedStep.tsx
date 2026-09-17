/**
 * O painel "01 → 02 → …" de processo — numeral em círculo de filete
 * terracota, título em mono caixa-alta, descrição em corpo.
 */
export function NumberedStep({
  number,
  title,
  description,
}: {
  number: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-4 py-2">
      <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-terracotta font-display text-sm font-medium text-terracotta-text">
        {number}
      </span>
      <div>
        <h4 className="font-mono text-[13px] font-semibold uppercase tracking-[0.06em] text-ink">
          {title}
        </h4>
        {description && (
          <div className="mt-0.5 text-sm leading-5 text-ink-muted">{description}</div>
        )}
      </div>
    </div>
  );
}
