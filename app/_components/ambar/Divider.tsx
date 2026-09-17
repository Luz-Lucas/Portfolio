/**
 * O filete fino com o glifo central — a divisória entre seções longas,
 * em vez de uma borda grossa. Espelha o `Divider` do sistema Âmbar
 * (components/bundle.css / guidelines/02-react.md).
 */
export function Divider({ glyph = "◆" }: { glyph?: string | null }) {
  return (
    <div className="flex items-center gap-3 py-2" role="separator">
      <span className="h-px flex-1 bg-line" />
      {glyph && (
        <span aria-hidden="true" className="text-xs text-terracotta">
          {glyph}
        </span>
      )}
      <span className="h-px flex-1 bg-line" />
    </div>
  );
}
