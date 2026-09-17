/** O ícone de chama do "Humankind" — no máximo um por seção. */
function FlameIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="16"
      height="16"
      aria-hidden="true"
      className="flex-shrink-0 text-ember"
    >
      <path
        fill="currentColor"
        d="M12 2c.3 2.6-1.8 4-3 6-1.4 2.3-1.7 5 .3 7 .5-1.6 1.3-2.4 1.3-2.4s.2 2 1.6 3c1.7 1.2 3.8.6 4.8-1 1.3-2 .7-4.6-.6-6.2-.4 1-1 1.6-1 1.6C15 6.6 13.4 4.2 12 2Z"
      />
    </svg>
  );
}

/**
 * Título de seção com o ícone de chama antes do rótulo — o motivo
 * repetido do "Humankind". O numeral "N° 0X" persiste como legenda mono
 * acima do título (a mesma ideia de orientação do Âmbar), mas sem o
 * filete cruzando a tela: o próprio kit Meia-Tinta não usa essa régua.
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
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  return (
    <div className={`flex flex-col gap-3 ${alignClass}`}>
      <div className="flex items-center gap-2">
        <FlameIcon />
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
          N&deg; {number} <span className="text-line">&mdash;</span> {eyebrow}
        </p>
      </div>
      <h2 className="font-display text-4xl uppercase leading-[0.95] text-ink text-balance md:text-5xl">
        {title}
      </h2>
    </div>
  );
}
