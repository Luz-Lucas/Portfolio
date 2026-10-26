'use client';

import { useState, useTransition } from 'react';
import { moveItem } from '@/lib/list';
import { visibleByDefault, type AdminProject, type ProjectRow } from '@/lib/projects';
import { deleteProjectRow, refreshGithub, saveProjects, type ActionResult } from './actions';
import { ImageUpload } from './ImageUpload';

type Item = { repo: AdminProject['repo']; row: ProjectRow };
type Filter = 'todos' | 'visiveis' | 'ocultos';

const toItems = (list: AdminProject[]): Item[] =>
  list.map(({ repo, row }) => ({
    repo,
    row: row ?? {
      repo_id: repo!.id,
      visible: visibleByDefault(repo!),
      sort: 0,
      description: null,
      demo_url: null,
      cover_url: null,
    },
  }));

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export function ProjectsForm({ initial, githubError = false }: { initial: AdminProject[]; githubError?: boolean }) {
  const [items, setItems] = useState(() => toItems(initial));
  const [filter, setFilter] = useState<Filter>('todos');
  const [pending, start] = useTransition();
  const [result, setResult] = useState<ActionResult | null>(null);

  const patch = (id: number, p: Partial<ProjectRow>) =>
    setItems((list) => list.map((it) => (it.row.repo_id === id ? { ...it, row: { ...it.row, ...p } } : it)));

  // Guarda o texto cru enquanto digita; normaliza só ao salvar.
  const nullable = (v: string | null) => (v?.trim() ? v.trim() : null);
  const clean = (r: ProjectRow): ProjectRow => ({
    ...r,
    description: nullable(r.description),
    demo_url: nullable(r.demo_url),
    cover_url: nullable(r.cover_url),
  });

  function save() {
    start(async () => setResult(await saveProjects(items.filter((i) => i.repo).map((i) => clean(i.row)))));
  }

  function remove(id: number) {
    start(async () => {
      const r = await deleteProjectRow(id);
      setResult(r);
      if (r.ok) setItems((list) => list.filter((it) => it.row.repo_id !== id));
    });
  }

  const repos = items.filter((i) => i.repo);
  const visibleCount = repos.filter((i) => i.row.visible).length;
  const hiddenCount = repos.length - visibleCount;
  const shown = items.filter((i) =>
    filter === 'todos' ? true : filter === 'visiveis' ? i.repo && i.row.visible : !i.repo || !i.row.visible,
  );

  return (
    <div className="admin-card">
      <div className="admin-card-head">
        <div>
          <h2>Projetos do GitHub</h2>
          <p className="admin-hint">
            Todos os seus repositórios aparecem no site, exceto os ocultos. Forks e arquivados começam ocultos. Use ↑ ↓
            para escolher a ordem; o resto segue por estrelas.
          </p>
        </div>
        <button
          type="button"
          className="admin-secondary"
          disabled={pending}
          onClick={() => start(() => refreshGithub().then(() => location.reload()))}
        >
          ⟳ Atualizar do GitHub
        </button>
      </div>

      {githubError && (
        <p className="admin-error" role="alert">
          O GitHub não respondeu agora. A curadoria salva aparece abaixo; tente &quot;Atualizar do GitHub&quot; em alguns minutos.
        </p>
      )}

      <div className="admin-toolbar">
        <div className="admin-segmented" role="group" aria-label="Filtrar repositórios">
          {(
            [
              ['todos', `Todos (${repos.length})`],
              ['visiveis', `Visíveis (${visibleCount})`],
              ['ocultos', `Ocultos (${hiddenCount})`],
            ] as const
          ).map(([value, label]) => (
            <button key={value} type="button" aria-pressed={filter === value} onClick={() => setFilter(value)}>
              {label}
            </button>
          ))}
        </div>
        <span className="admin-count">
          {plural(visibleCount, 'visível', 'visíveis')} · {plural(hiddenCount, 'oculto', 'ocultos')}
        </span>
      </div>

      {shown.length === 0 && <p className="admin-empty">Nenhum repositório neste filtro.</p>}

      <ul className="admin-projects">
        {shown.map((it) => {
          const index = items.indexOf(it);
          const id = it.row.repo_id;
          return (
            <li key={id} className={it.row.visible && it.repo ? 'is-visible' : 'is-hidden'}>
              <div className="admin-project-head">
                {it.repo ? (
                  <div className="admin-project-title">
                    <button
                      type="button"
                      role="switch"
                      aria-checked={it.row.visible}
                      aria-label={`Exibir ${it.repo.name} no site`}
                      className="admin-switch"
                      onClick={() => patch(id, { visible: !it.row.visible })}
                    >
                      <span aria-hidden="true" />
                    </button>
                    <div>
                      <a href={it.repo.html_url} target="_blank" rel="noopener" className="admin-project-name">
                        {it.repo.name}
                      </a>
                      <div className="admin-project-meta">
                        <span>{it.row.visible ? 'Aparece no site' : 'Oculto'}</span>
                        <span>★ {it.repo.stargazers_count}</span>
                        {it.repo.language && <span>{it.repo.language}</span>}
                        {it.repo.fork && <span className="admin-badge">fork</span>}
                        {it.repo.archived && <span className="admin-badge">arquivado</span>}
                      </div>
                    </div>
                  </div>
                ) : (
                  <span className="admin-error">
                    Repositório #{id} {githubError ? '(GitHub indisponível)' : 'não encontrado no GitHub'}
                  </span>
                )}
                <span className="admin-row-controls">
                  <button
                    type="button"
                    aria-label="Subir"
                    title="Subir"
                    disabled={index === 0}
                    onClick={() => setItems(moveItem(items, index, index - 1))}
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    aria-label="Descer"
                    title="Descer"
                    disabled={index === items.length - 1}
                    onClick={() => setItems(moveItem(items, index, index + 1))}
                  >
                    ↓
                  </button>
                  {!it.repo && !githubError && (
                    <button type="button" onClick={() => remove(id)}>
                      Remover
                    </button>
                  )}
                </span>
              </div>
              {it.repo && it.row.visible && (
                <details className="admin-details">
                  <summary>Personalizar texto, demo e capa</summary>
                  <div className="admin-grid">
                    <label className="admin-field">
                      <span>Descrição (padrão: {it.repo.description || 'vazia'})</span>
                      <input value={it.row.description ?? ''} onChange={(e) => patch(id, { description: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span>Demo (padrão: {it.repo.homepage || 'nenhuma'})</span>
                      <input value={it.row.demo_url ?? ''} onChange={(e) => patch(id, { demo_url: e.target.value })} />
                    </label>
                    <label className="admin-field">
                      <span>URL da capa</span>
                      <input value={it.row.cover_url ?? ''} onChange={(e) => patch(id, { cover_url: e.target.value })} />
                    </label>
                    <ImageUpload purpose="cover" onUploaded={(url) => patch(id, { cover_url: url })} />
                  </div>
                </details>
              )}
            </li>
          );
        })}
      </ul>

      <div className="admin-actions admin-sticky">
        <button type="button" className="admin-primary" disabled={pending} onClick={save}>
          Salvar
        </button>
        {pending ? (
          <span className="admin-status">Salvando...</span>
        ) : (
          result && (
            <span className={result.ok ? 'admin-ok' : 'admin-error'} role="status">
              {result.ok ? '✓ Salvo — o site atualiza em alguns segundos' : result.error}
            </span>
          )
        )}
      </div>
    </div>
  );
}
