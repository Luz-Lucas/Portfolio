"use client";

import { memo, useEffect, useState } from "react";
import { fetchGitHubProjects } from "@/lib/github";
import { Star, GitFork, ExternalLink } from "lucide-react";

interface Project {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
}

function ProjectsComponent() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const data = await fetchGitHubProjects();
        setProjects(data);
      } catch (error) {
        console.error("Failed to load projects:", error);
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  return (
    <section id="projects" className="relative px-6 py-20 bg-black overflow-hidden">
      <div className="absolute right-0 top-1/3 w-96 h-96 bg-red-600/10 rounded-full blur-3xl -z-10" />
      
      {/* Top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />
      
      <div className="mx-auto w-full max-w-5xl space-y-12">
        <div className="space-y-4 text-center">
          <p className="text-xs uppercase tracking-[0.35em] text-red-600 font-black">GitHub Projects</p>
          <h2 className="text-5xl md:text-6xl font-black text-white">My latest<span className="block text-red-600">projects & contributions</span></h2>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-white/60">Loading projects...</p>
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <a
                key={project.id}
                href={project.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative rounded-2xl border-2 border-red-600/30 bg-black/60 backdrop-blur-sm p-6 hover:border-red-600 hover:shadow-lg hover:shadow-red-600/20 transition-all duration-300 overflow-hidden"
              >
                {/* Gradient background on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-red-600/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
                
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-black text-white group-hover:text-red-600 transition-colors duration-300 flex-1 line-clamp-2">
                      {project.name}
                    </h3>
                    <ExternalLink className="w-5 h-5 text-red-600/60 group-hover:text-red-600 transition-all duration-300 flex-shrink-0 mt-1" />
                  </div>

                  {/* Description */}
                  <p className="text-white/70 text-sm line-clamp-3">
                    {project.description}
                  </p>

                  {/* Language badge */}
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-600/10 border border-red-600/30 text-xs font-semibold text-red-600">
                      <span className="w-2 h-2 rounded-full bg-red-600" />
                      {project.language}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4 pt-2 border-t border-red-600/20">
                    <div className="flex items-center gap-1 text-white/60 hover:text-red-600 transition-colors">
                      <Star className="w-4 h-4" />
                      <span className="text-xs font-semibold">{project.stars}</span>
                    </div>
                    <div className="flex items-center gap-1 text-white/60 hover:text-red-600 transition-colors">
                      <GitFork className="w-4 h-4" />
                      <span className="text-xs font-semibold">{project.forks}</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-white/60">No projects found.</p>
          </div>
        )}

        {/* View all button */}
        {projects.length > 0 && (
          <div className="flex justify-center pt-6">
            <a
              href={`https://github.com/Luz-Lucas`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3 rounded-2xl border-2 border-red-600 text-red-600 font-black hover:bg-red-600 hover:text-black transition-all duration-300 flex items-center gap-2"
            >
              View all projects on GitHub
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}
      </div>
    </section>
  );
}

export const Projects = memo(ProjectsComponent);
