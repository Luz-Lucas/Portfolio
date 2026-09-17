"use client";

import { memo } from "react";
import { SectionHeading } from "./ambar/SectionHeading";
import { Reveal } from "./ambar/Reveal";

const SKILL_GROUPS = [
  {
    title: "Desenvolvimento Front-end",
    description: "Construindo interfaces responsivas com React e TypeScript moderno.",
    items: ["React", "TypeScript", "JavaScript (ES6+)", "HTML5", "CSS3", "JSX"],
  },
  {
    title: "Estilização & UI",
    description: "Criando layouts com CSS utilitário e frameworks de interface.",
    items: ["TailwindCSS", "Bootstrap", "Styled Components", "CSS Grid", "Flexbox", "Design responsivo"],
  },
  {
    title: "Estado & Hooks",
    description: "Gerenciando estado complexo com paradigmas modernos do React.",
    items: ["Redux", "Context API", "React Hooks", "Hooks customizados", "useEffect", "useReducer"],
  },
  {
    title: "Fundamentos Full-stack",
    description: "Expandindo além do front-end via Node.js e bancos de dados.",
    items: ["Node.js", "Express", "REST APIs", "MongoDB", "PostgreSQL", "Socket.io"],
  },
  {
    title: "Ferramentas & Fluxo",
    description: "Usando ferramentas modernas para desenvolvimento e deploy eficientes.",
    items: ["Git", "VS Code", "Figma", "npm/yarn", "Vite", "Webpack"],
  },
  {
    title: "Performance & Qualidade",
    description: "Garantindo apps rápidos e confiáveis com otimização e testes.",
    items: ["React Testing Library", "Jest", "Lighthouse", "Web Vitals", "Acessibilidade", "Otimização de performance"],
  },
] as const;

const MARQUEE_TEXT =
  "React · TypeScript · Node.js · Tailwind · Git · Figma · ";

function SkillsComponent() {
  return (
    <section id="skills" className="relative overflow-hidden px-6 py-24 md:px-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center overflow-hidden opacity-[0.06]"
      >
        <div className="marquee-track flex whitespace-nowrap font-display text-[14vw] font-medium text-ink">
          <span className="pr-16">{MARQUEE_TEXT}</span>
          <span className="pr-16">{MARQUEE_TEXT}</span>
        </div>
      </div>

      <div className="relative mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading number="03" eyebrow="Ofício" title="Do que sou feito" />
        </Reveal>

        <div className="mt-16 divide-y divide-line border-y border-line">
          {SKILL_GROUPS.map((group, index) => (
            <Reveal key={group.title} delay={index * 0.04}>
              <div className="grid grid-cols-1 gap-3 py-8 md:grid-cols-12 md:items-baseline md:gap-8">
                <span className="font-mono text-sm text-terracotta-text md:col-span-1">
                  0{index + 1}
                </span>
                <div className="md:col-span-4">
                  <h3 className="font-display text-2xl font-medium text-ink">
                    {group.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                    {group.description}
                  </p>
                </div>
                <div className="flex flex-wrap gap-x-5 gap-y-2 md:col-span-7">
                  {group.items.map((item) => (
                    <span
                      key={item}
                      className="font-mono text-xs uppercase tracking-[0.06em] text-ink-muted"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Skills = memo(SkillsComponent);
