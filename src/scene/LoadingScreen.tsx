'use client';

export function LoadingScreen({ progress }: { progress?: number }) {
  const pct = progress === undefined ? null : Math.round(progress);
  return (
    <div className="p3d-loading" aria-live="polite">
      <div className="p3d-loading-text">
        <p>Portfólio BIOS v4.00 — (C) 1995</p>
        <p>Verificando memória... OK</p>
        <p>Carregando cena{pct === null ? '...' : ` ${pct}%`}</p>
        <p className="p3d-loading-hint">Clique ou pressione qualquer tecla para pular a intro</p>
      </div>
    </div>
  );
}
