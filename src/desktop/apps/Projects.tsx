'use client';

import { useState } from 'react';
import type { Project, ProjectsResult } from '@/content/types';

type Props = { projects: ProjectsResult; githubUrl: string };

function Shell({ path, status, children }: { path: string; status: string; children: React.ReactNode }) {
  return (
    <div className="p3d-explorer">
      <div className="p3d-address">
        <span>Endereço</span>
        <div className="p3d-address-field">{path}</div>
      </div>
      <div className="p3d-explorer-view">{children}</div>
      <div className="status-bar">
        <p className="status-bar-field">{status}</p>
      </div>
    </div>
  );
}

function Details({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <Shell path={`C:\\Projetos\\${project.name}`} status={project.name}>
      <div className="p3d-project">
        <button type="button" onClick={onBack}>
          Voltar
        </button>
        {project.coverUrl && <img className="p3d-cover" src={project.coverUrl} alt={`Capa de ${project.name}`} />}
        <h2>{project.name}</h2>
        <p>{project.description}</p>
        <ul className="p3d-tags">
          {project.languages.map((l) => (
            <li key={l}>{l}</li>
          ))}
        </ul>
        <p>★ {project.stars}</p>
        <div className="p3d-project-links">
          <a className="p3d-button-link" href={project.url} target="_blank" rel="noopener">
            Ver no GitHub
          </a>
          {project.demoUrl && (
            <a className="p3d-button-link" href={project.demoUrl} target="_blank" rel="noopener">
              Demo
            </a>
          )}
        </div>
      </div>
    </Shell>
  );
}

export function Projects({ projects, githubUrl }: Props) {
  const [openId, setOpenId] = useState<number | null>(null);

  if (!Array.isArray(projects)) {
    return (
      <Shell path="C:\Projetos" status="Erro">
        <div className="p3d-empty">
          <p>Não foi possível carregar os projetos agora.</p>
          <a href={githubUrl} target="_blank" rel="noopener">
            Ver meu perfil no GitHub
          </a>
        </div>
      </Shell>
    );
  }

  const open = projects.find((p) => p.repoId === openId);
  if (open) return <Details project={open} onBack={() => setOpenId(null)} />;

  return (
    <Shell path="C:\Projetos" status={`${projects.length} objeto(s)`}>
      {projects.length === 0 ? (
        <p className="p3d-empty">Nenhum projeto publicado ainda.</p>
      ) : (
        <ul className="p3d-folders">
          {projects.map((p) => (
            <li key={p.repoId}>
              <button type="button" aria-label={`Abrir ${p.name}`} onClick={() => setOpenId(p.repoId)}>
                <img src="/icons/projects.svg" alt="" width={32} height={32} />
                <span>{p.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Shell>
  );
}
