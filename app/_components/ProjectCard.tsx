"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { ExternalLink, Star, GitFork } from "lucide-react";
import type { GitHubProject } from "@/lib/github";

/**
 * Uma "spread" do carrossel vertical de projetos: fixa em `sticky` dentro
 * de um wrapper alto, para que o próximo card suba por cima ao rolar. O
 * link do repositório permanece um `<a>` normal e focável — é por isso
 * que este carrossel foi dirigido pelo scroll da própria página (nada
 * aninhado, nada com transform no eixo em que o usuário tabula).
 */
export function ProjectCard({
  id,
  project,
  index,
}: {
  id: string;
  project: GitHubProject;
  index: number;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.94]);
  const opacity = useTransform(scrollYProgress, [0, 0.75, 1], [1, 1, 0.5]);

  const number = String(index + 1).padStart(2, "0");

  return (
    <div id={id} ref={wrapperRef} className="relative h-[125vh] md:h-[115vh]">
      <motion.article
        style={{ scale, opacity, zIndex: index + 1 }}
        className="sticky top-24 mx-auto flex max-w-3xl flex-col gap-6 rounded-sm border border-line bg-surface-raised p-8 shadow-card md:top-28 md:p-12"
      >
        <div className="flex items-start justify-between gap-6">
          <span
            aria-hidden="true"
            className="font-display text-6xl font-medium leading-none text-terracotta-text/35 md:text-8xl"
          >
            {number}
          </span>
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${project.name} no GitHub`}
            className="focus-ambar flex-shrink-0 rounded-full border border-line p-3 text-ink-muted transition-colors hover:border-terracotta-text hover:text-terracotta-text"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>

        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="focus-ambar w-fit font-display text-3xl font-medium text-ink transition-colors hover:text-terracotta-text md:text-4xl"
        >
          {project.name}
        </a>

        <p className="max-w-xl text-base leading-relaxed text-ink-muted">
          {project.description}
        </p>

        <div className="mt-2 flex flex-wrap items-center gap-6 border-t border-line pt-5 font-mono text-xs uppercase tracking-[0.15em] text-ink-muted">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-terracotta" />
            {project.language}
          </span>
          <span className="flex items-center gap-1.5">
            <Star className="h-3.5 w-3.5" aria-hidden="true" />
            {project.stars}
          </span>
          <span className="flex items-center gap-1.5">
            <GitFork className="h-3.5 w-3.5" aria-hidden="true" />
            {project.forks}
          </span>
        </div>
      </motion.article>
    </div>
  );
}
