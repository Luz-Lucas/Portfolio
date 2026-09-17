"use client";

import { memo } from "react";
import { SectionHeading } from "./meia-tinta/SectionHeading";
import { StatBadge } from "./meia-tinta/StatBadge";
import { Reveal } from "./meia-tinta/Reveal";

const STATS = [
  { value: "2024", label: "Início na CP2" },
  { value: "100", label: "Lighthouse" },
  { value: "2023", label: "Início da graduação" },
] as const;

/**
 * A foto do retrato aparece só uma vez no site (no Hero). Aqui, no lugar
 * do retrato duplicado, uma fileira de `StatBadge` com fatos que já
 * existem no conteúdo do site — nada inventado.
 */
function AboutComponent() {
  return (
    <section id="about" className="relative px-6 py-24 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading number="01" eyebrow="Sobre" title="Nota do autor" align="left" />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-8">
            <Reveal>
              <p className="text-lg leading-relaxed text-ink-muted">
                Estudante de Engenharia de Software natural de Minas Gerais,
                atuando como desenvolvedor júnior na CP2. Construo aplicações
                voltadas ao cliente com React e TypeScript, com foco em
                interfaces responsivas e performáticas.
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-lg leading-relaxed text-ink-muted">
                Domino ferramentas modernas de front-end e venho me
                expandindo para full-stack. Trabalho bem em times ágeis,
                valorizando revisões de código e pair programming para
                entregar um trabalho de qualidade.
              </p>
            </Reveal>
          </div>

          <div className="lg:col-span-4">
            <Reveal delay={0.15} className="flex flex-wrap gap-8 lg:flex-col lg:items-start lg:gap-6">
              {STATS.map((stat) => (
                <StatBadge key={stat.label} value={stat.value} label={stat.label} />
              ))}
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export const About = memo(AboutComponent);
