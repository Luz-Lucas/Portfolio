"use client";

import { memo } from "react";

const EXPERIENCES = [
  {
    role: "Junior Developer",
    company: "CP2 Junior Company",
    period: "2024 - Present",
    description:
      "Building responsive, client-facing web applications using React and TypeScript in cross-functional teams.",
    highlights: [
      "Developed 5+ client projects using React and TypeScript",
      "Implemented responsive designs improving mobile UX",
      "Participated in Agile ceremonies and code reviews",
    ],
  },
  {
    role: "Software Engineering Student",
    company: "University",
    period: "2022 - Present",
    description:
      "Pursuing a Software Engineering degree alongside extracurricular coding projects.",
    highlights: [
      "Active member of programming community",
      "Completed advanced coursework in algorithms and data structures",
      "Led team projects in Agile development courses",
    ],
  },
] as const;

function ExperienceComponent() {
  return (
    <section
      id="experience"
      className="relative overflow-hidden bg-black px-6 py-20"
    >
      <div className="absolute bottom-1/4 right-0 -z-10 h-96 w-96 rounded-full bg-red-600/10 blur-3xl" />

      <div className="absolute left-0 right-0 top-0 h-1 bg-gradient-to-r from-transparent via-red-600 to-transparent" />

      <div className="mx-auto w-full max-w-6xl space-y-12">
        <div className="space-y-4 text-center lg:text-left">
          <p className="text-xs font-black uppercase tracking-[0.35em] text-red-600">
            Experience
          </p>
          <h2 className="text-5xl font-black text-white md:text-6xl">
            Professional journey &<span className="block text-red-600">education</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/70 lg:mx-0">
            Combining academic knowledge with real-world experience at CP2.
          </p>
        </div>

        <div className="space-y-6">
          {EXPERIENCES.map((exp) => (
            <article
              key={`${exp.company}-${exp.role}`}
              className="space-y-3 rounded-2xl border-2 border-red-700 bg-transparent p-6 transition duration-300 hover:border-red-600"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">{exp.role}</h3>
                  <p className="font-medium text-red-700">{exp.company}</p>
                </div>
                <span className="whitespace-nowrap text-xs text-white/50">
                  {exp.period}
                </span>
              </div>

              <p className="text-sm leading-relaxed text-white/70">
                {exp.description}
              </p>

              <ul className="space-y-1 pt-2">
                {exp.highlights.map((highlight) => (
                  <li
                    key={highlight}
                    className="flex items-start gap-2 text-xs text-white/60"
                  >
                    <span className="mt-0.5 font-bold text-red-700">•</span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Experience = memo(ExperienceComponent);