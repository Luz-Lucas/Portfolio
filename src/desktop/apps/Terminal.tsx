'use client';

import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import type { ProjectsResult, SiteContent } from '@/content/types';
import { runCommand } from '@/lib/terminal';
import { useWindowStore } from '../windowStore';

const BANNER = ['Luz 95 [Versão 4.00.950]', '(C) Copyright 1981-1995. Digite help para ver os comandos.', ''];

export function Terminal({ content, projects }: { content: SiteContent; projects: ProjectsResult }) {
  const [lines, setLines] = useState<string[]>(BANNER);
  const [value, setValue] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [cursor, setCursor] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  // Corpo em bloco: no Chrome atual scrollIntoView devolve uma Promise, que o React trataria como cleanup.
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  useEffect(() => {
    endRef.current?.scrollIntoView?.({ block: 'end' });
  }, [lines]);

  function submit() {
    const result = runCommand(value, { content, projects });
    if (result.action === 'clear') setLines([]);
    else setLines((l) => [...l, `C:\\>${value}`, ...result.output, '']);
    if (result.action && result.action !== 'clear') useWindowStore.getState().open(result.action.open);
    if (value.trim()) setHistory((h) => [value, ...h]);
    setCursor(-1);
    setValue('');
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') submit();
    else if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.min(Math.max(cursor + (e.key === 'ArrowUp' ? 1 : -1), -1), history.length - 1);
      setCursor(next);
      setValue(next === -1 ? '' : history[next]);
    }
  }

  return (
    <div className="p3d-terminal" onClick={() => inputRef.current?.focus()}>
      {lines.map((l, i) => (
        <pre key={i}>{l || ' '}</pre>
      ))}
      <label className="p3d-prompt">
        <span>C:\&gt;</span>
        <input
          ref={inputRef}
          aria-label="Comando"
          value={value}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={onKeyDown}
        />
      </label>
      <div ref={endRef} />
    </div>
  );
}
