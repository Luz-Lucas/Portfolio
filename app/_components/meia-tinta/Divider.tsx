/**
 * Filete simples entre seções longas, em vez de uma borda grossa. O
 * glifo central do Divider do Âmbar sai — um corte a mais de ornamento.
 */
export function Divider() {
  return <div role="separator" className="h-px w-full bg-line" />;
}
