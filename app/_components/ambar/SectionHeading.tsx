/**
 * Cabeçalho de seção sobre filete — o "— PRIMARY LOGO —" da identidade
 * de marca do Âmbar: filete de ponta a ponta com o rótulo centralizado
 * em mono caixa-alta, mais o numeral de seção (`N° 02`) e o título em
 * Fraunces por baixo.
 */
export function SectionHeading({
  number,
  eyebrow,
  title,
  align = "center",
}: {
  number: string;
  eyebrow: string;
  title: React.ReactNode;
  align?: "center" | "left";
}) {
  return (
    <div className={align === "center" ? "text-center" : "text-left"}>
      <div className="flex items-center gap-4">
        <span className="h-px flex-1 bg-line" />
        <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-terracotta-text whitespace-nowrap">
          N&deg; {number} <span className="text-ink-muted">&mdash;</span> {eyebrow}
        </p>
        <span className="h-px flex-1 bg-line" />
      </div>
      <h2 className="mt-6 font-display text-4xl md:text-5xl font-medium text-ink text-balance">
        {title}
      </h2>
    </div>
  );
}
