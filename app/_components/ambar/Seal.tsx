/**
 * O selo dourado — o único uso de `gold` em toda a página, por design do
 * Âmbar ("um selo por tela, no máximo"). Anel de filete girando devagar
 * com o texto em mono; a rotação para sozinha sob `prefers-reduced-motion`
 * via o `@media` de segurança em globals.css.
 */
export function Seal({ text = "DISPONÍVEL PARA TRABALHO · " }: { text?: string }) {
  const repeated = text.repeat(2);

  return (
    <div className="relative h-28 w-28" aria-hidden="true">
      <svg viewBox="0 0 100 100" className="h-full w-full animate-spin-slow">
        <defs>
          <path id="seal-circle" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
        </defs>
        <circle cx="50" cy="50" r="47" fill="none" stroke="var(--color-gold)" strokeWidth="0.75" />
        <text fill="var(--color-gold)" fontSize="6.2" letterSpacing="0.15em" fontFamily="var(--font-mono)">
          <textPath href="#seal-circle" startOffset="0%">
            {repeated}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-lg italic text-gold">
        LP
      </span>
    </div>
  );
}
