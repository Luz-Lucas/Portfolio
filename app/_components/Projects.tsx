import { ExternalLink } from "lucide-react";
import { GITHUB_USERNAME, type GitHubProject } from "@/lib/github";
import { SectionHeading } from "./meia-tinta/SectionHeading";
import { ProjectsRail } from "./ProjectsRail";

/**
 * Server component: os dados chegam já resolvidos de `app/page.tsx`
 * (busca no servidor, com `revalidate` de fato efetivo). A coreografia de
 * scroll fica isolada em `ProjectsRail`, o único filho client.
 */
export function Projects({ projects }: { projects: GitHubProject[] }) {
  return (
    <section id="projects" className="relative py-24">
      <div className="mx-auto w-full max-w-6xl px-6 md:px-10">
        <SectionHeading number="02" eyebrow="Projetos" title="Trabalho selecionado" />
      </div>

      {projects.length > 0 ? (
        <ProjectsRail projects={projects} />
      ) : (
        <p className="mx-auto mt-16 max-w-6xl px-6 text-center text-ink-muted md:px-10">
          Nenhum projeto encontrado no momento.
        </p>
      )}

      <div className="mx-auto mt-4 flex w-full max-w-6xl justify-center px-6 md:px-10">
        <a
          href={`https://github.com/${GITHUB_USERNAME}`}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ember inline-flex items-center gap-2 rounded-full border border-line px-6 py-3 font-mono text-xs uppercase tracking-[0.2em] text-ink-muted transition-colors hover:border-ember-text hover:text-ember-text"
        >
          Ver todos os projetos no GitHub
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </div>
    </section>
  );
}
