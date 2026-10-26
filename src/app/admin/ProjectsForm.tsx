'use client';

import { useState, useTransition } from 'react';
import type { ReactNode } from 'react';
import { moveItem } from '@/lib/list';
import type { AdminProject, ProjectRow } from '@/lib/projects';
import { deleteProjectRow, refreshGithub, saveProjects, type ActionResult } from './actions';

type Item = { repo: AdminProject['repo']; row: ProjectRow };

const toItems = (list: AdminProject[]): Item[] =>
  list.map(({ repo, row }) => ({
    repo,
    row: row ?? { repo_id: repo!.id, visible: false, sort: 0, description: null, demo_url: null, cover_url: null },
  }));

export function ProjectsForm({ initial, coverSlot }: {
  initial: AdminProject[];
  coverSlot?: (set: (url: string) => void) => ReactNode;
}) {
  const [items, setItems] = useState(() => toItems(initial));
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const patch = (i: number, p: Partial<ProjectRow>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, row: { ...it.row, ...p } } : it)));

  const nullable = (v: string) => (v.trim() ? v.trim() : null);

  function save() {
    // Visíveis no topo, mantendo a ordem relativa escolhida.
    const ordered = [...items.filter((i) => i.row.visible && i.repo), ...items.filter((i) => !(i.row.visible && i.repo))];
    setItems(ordered);
    start(async () => setResult(await saveProjects(ordered.filter((i) => i.repo).map((i) => i.row))));
  }

  function remove(i: number) {
    const id = items[i].row.repo_id;
    start(async () => {
      const r = await deleteProjectRow(id);
      setResult(r);
      if (r.ok) setItems((list) => list.filter((it) => it.row.repo_id !== id));
    });
  }

  return (
    <div className="admin-card">
      <h2>Projetos do GitHub</h2>
      <p className="admin-hint">Marque &quot;Exibir&quot;, ordene com ↑ ↓ e salve. Campos vazios usam os dados do GitHub.</p>
      <div className="admin-actions">
        <button type="button" disabled={pending} onClick={() => start(() => refreshGithub().then(() => location.reload()))}>
          Atualizar do GitHub
        </button>
      </div>
      <ul className="admin-projects">
        {items.map((it, i) => (
          <li key={it.row.repo_id} className={it.row.visible ? 'is-visible' : undefined}>
            <div className="admin-project-head">
              {it.repo ? (
                <label>
                  <input type="checkbox" checked={it.row.visible} onChange={(e) => patch(i, { visible: e.target.checked })} />{' '}
                  Exibir <b>{it.repo.name}</b>
                  {it.repo.fork && <span className="admin-badge">fork</span>}
                  {it.repo.archived && <span className="admin-badge">arquivado</span>}
                </label>
              ) : (
                <span className="admin-error">Repositório #{it.row.repo_id} não encontrado no GitHub</span>
              )}
              <span className="admin-row-controls">
                <button type="button" aria-label="Subir" disabled={i === 0} onClick={() => setItems(moveItem(items, i, i - 1))}>
                  ↑
                </button>
                <button
                  type="button"
                  aria-label="Descer"
                  disabled={i === items.length - 1}
                  onClick={() => setItems(moveItem(items, i, i + 1))}
                >
                  ↓
                </button>
                {!it.repo && (
                  <button type="button" onClick={() => remove(i)}>
                    Remover
                  </button>
                )}
              </span>
            </div>
            {it.repo && it.row.visible && (
              <div className="admin-grid">
                <label className="admin-field">
                  <span>Descrição (padrão: {it.repo.description || 'vazia'})</span>
                  <input
                    value={it.row.description ?? ''}
                    onChange={(e) => patch(i, { description: nullable(e.target.value) })}
                  />
                </label>
                <label className="admin-field">
                  <span>Demo (padrão: {it.repo.homepage || 'nenhuma'})</span>
                  <input value={it.row.demo_url ?? ''} onChange={(e) => patch(i, { demo_url: nullable(e.target.value) })} />
                </label>
                <label className="admin-field">
                  <span>URL da capa</span>
                  <input value={it.row.cover_url ?? ''} onChange={(e) => patch(i, { cover_url: nullable(e.target.value) })} />
                </label>
                {coverSlot?.((url) => patch(i, { cover_url: url }))}
              </div>
            )}
          </li>
        ))}
      </ul>
      <div className="admin-actions">
        <button type="button" className="admin-primary" disabled={pending} onClick={save}>
          Salvar
        </button>
        {pending ? (
          <span className="admin-status">Salvando...</span>
        ) : (
          result && <span className={result.ok ? 'admin-ok' : 'admin-error'}>{result.ok ? 'Salvo' : result.error}</span>
        )}
      </div>
    </div>
  );
}
