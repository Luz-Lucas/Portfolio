"use client";

import { useMemo } from "react";
import type { GitHubProject } from "@/lib/github";
import { useSectionIndex } from "@/lib/hooks/useSectionIndex";
import { ProjectCard } from "./ProjectCard";

export function ProjectsRail({ projects }: { projects: GitHubProject[] }) {
  const ids = useMemo(
    () => projects.map((project) => `project-${project.id}`),
    [projects]
  );
  const activeIndex = useSectionIndex(ids);

  return (
    <div className="mx-auto mt-16 flex w-full max-w-6xl gap-8 px-6 md:px-10">
      <div
        aria-hidden="true"
        className="hidden flex-col items-center gap-4 pt-28 lg:flex"
      >
        {projects.map((_, index) => (
          <span
            key={ids[index]}
            className={`font-mono text-[11px] transition-colors ${
              index === activeIndex ? "text-ember-text" : "text-line"
            }`}
          >
            {index === activeIndex ? "◆" : "○"}
          </span>
        ))}
      </div>

      <div className="min-w-0 flex-1">
        {projects.map((project, index) => (
          <ProjectCard
            key={project.id}
            id={ids[index]}
            project={project}
            index={index}
          />
        ))}
      </div>
    </div>
  );
}
