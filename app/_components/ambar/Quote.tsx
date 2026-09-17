/**
 * Nota de margem — uma frase curta em Fraunces itálico, como o
 * "Free forever. Unsubscribe anytime." da referência Dispatch.
 */
export function Quote({
  children,
  attribution,
}: {
  children: React.ReactNode;
  attribution?: React.ReactNode;
}) {
  return (
    <figure className="max-w-xs">
      <blockquote className="font-display text-lg italic leading-snug text-ink">
        {children}
      </blockquote>
      {attribution && (
        <figcaption className="mt-3 font-mono text-[11px] font-semibold uppercase tracking-[0.1em] text-terracotta-text">
          {attribution}
        </figcaption>
      )}
    </figure>
  );
}
