'use client';

import { useEffect, useState } from 'react';
import { INTRO_TIMINGS } from './intro';

const MEMORY_KB = 65536;

/** Linhas do POST, cada uma com o instante (ms desde o início da BIOS) em que aparece. */
const LINES: { at: number; text: string }[] = [
  { at: 1250, text: '' },
  { at: 1300, text: 'Detectando IDE Primário Mestre ...... Front-end' },
  { at: 1550, text: 'Detectando IDE Primário Escravo ..... React' },
  { at: 1800, text: 'Detectando IDE Secundário Mestre .... TypeScript' },
  { at: 2050, text: 'Detectando IDE Secundário Escravo ... Café quente' },
  { at: 2350, text: '' },
  { at: 2400, text: 'Iniciando Luz 95...' },
];

/** POST da BIOS na tela do CRT enquanto a câmera se aproxima. */
export function BiosScreen() {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    const start = Date.now();
    const t = setInterval(() => {
      const ms = Date.now() - start;
      setElapsed(ms);
      if (ms >= INTRO_TIMINGS.bios) clearInterval(t);
    }, 50);
    return () => clearInterval(t);
  }, []);

  // memória contando de 0 até 64 MB no primeiro segundo
  const memory = Math.min(MEMORY_KB, Math.round((elapsed / 1000) * MEMORY_KB / 1024) * 1024);

  return (
    <div className="p3d-bios" role="status" aria-label="BIOS">
      <div className="p3d-bios-head">
        <img src="/icons/start.svg" alt="" width={32} height={32} />
        <div>
          <p>Luz BIOS v4.00PG, An Energy Star Ally</p>
          <p>Copyright (C) 1984-95, Luz Software, Inc.</p>
        </div>
      </div>
      <p>&nbsp;</p>
      <p>Processador Pentium(R) a 133 MHz</p>
      <p>
        Teste de memória: {memory}K{memory === MEMORY_KB ? ' OK' : ''}
      </p>
      {LINES.filter((l) => elapsed >= l.at).map((l, i) => (
        <p key={i}>{l.text || ' '}</p>
      ))}
      <p className="p3d-bios-foot">Pressione DEL para entrar no SETUP · clique para pular</p>
    </div>
  );
}
