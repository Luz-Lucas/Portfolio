'use client';

import { useState, useTransition } from 'react';
import { moveItem } from '@/lib/list';
import type { AdminProject, ProjectRow } from '@/lib/projects';
import { deleteProjectRow, refreshGithub, saveProjects, type ActionResult } from './actions';
import { ImageUpload } from './ImageUpload';

type Item = { repo: AdminProject['repo']; row: ProjectRow };

const toItems = (list: AdminProject[]): Item[] =>
  list.map(({ repo, row }) => ({
    repo,
    row: row ?? { repo_id: repo!.id, visible: false, sort: 0, description: null, demo_url: null, cover_url: null },
  }));

export function ProjectsForm({ initial, githubError = false }: { initial: AdminProject[]; githubError?: boolean }) {
  const [items, setItems] = useState(() => toItems(initial));
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const patch = (i: number, p: Partial<ProjectRow>) =>
    setItems(items.map((it, j) => (j === i ? { ...it, row: { ...it.row, ...p } } : it)));

  // Guarda o texto cru enquanto digita; normaliza só ao salvar.
  const nullable = (v: string | null) => (v?.trim() ? v.trim() : null);
  const clean = (r: ProjectRow): ProjectRow => ({
    ...r,
    description: nullable(r.description),
    demo_url: nullable(r.demo_url),
    cover_url: nullable(r.cover_url),
  });

  function save() {
    // Visíveis no topo, mantendo a ordem relativa escolhida.
    const ordered = [...items.filter((i) => i.row.visible && i.repo), ...items.filter((i) => !(i.row.visible && i.repo))];
    setItems(ordered);
    start(async () => setResult(await saveProjects(ordered.filter((i) => i.repo).map((i) => clean(i.row)))));
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
      {githubError && (
        <p className="admin-error" role="alert">
          O GitHub não respondeu agora. A curadoria salva aparece abaixo; tente &quot;Atualizar do GitHub&quot; em alguns minutos.
        </p>
      )}
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
                <span className="admin-error">
                  Repositório #{it.row.repo_id} {githubError ? '(GitHub indisponível)' : 'não encontrado no GitHub'}
                </span>
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
                {!it.repo && !githubError && (
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
                    onChange={(e) => patch(i, { description: e.target.value })}
                  />
                </label>
                <label className="admin-field">
                  <span>Demo (padrão: {it.repo.homepage || 'nenhuma'})</span>
                  <input value={it.row.demo_url ?? ''} onChange={(e) => patch(i, { demo_url: e.target.value })} />
                </label>
                <label className="admin-field">
                  <span>URL da capa</span>
                  <input value={it.row.cover_url ?? ''} onChange={(e) => patch(i, { cover_url: e.target.value })} />
                </label>
                <ImageUpload purpose="cover" onUploaded={(url) => patch(i, { cover_url: url })} />
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
