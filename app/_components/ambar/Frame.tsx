/**
 * Cantoneiras — quatro cantos em L de 1px em volta de uma imagem, em vez
 * de uma borda fechada. O motivo gráfico do portfólio "Panel Craft".
 */
export function Frame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const corner = "absolute h-5 w-5 border-terracotta";
  return (
    <div className={`relative ${className}`}>
      <span aria-hidden="true" className={`${corner} top-0 left-0 border-t border-l`} />
      <span aria-hidden="true" className={`${corner} top-0 right-0 border-t border-r`} />
      <span aria-hidden="true" className={`${corner} bottom-0 left-0 border-b border-l`} />
      <span aria-hidden="true" className={`${corner} bottom-0 right-0 border-b border-r`} />
      {children}
    </div>
  );
}
