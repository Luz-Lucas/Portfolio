"use client";

import { memo, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { SectionHeading } from "./ambar/SectionHeading";
import { NumberedStep } from "./ambar/NumberedStep";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";
import { useIsWideViewport } from "@/lib/hooks/useIsWideViewport";

const EXPERIENCES = [
  {
    role: "Desenvolvedor Júnior",
    company: "CP2 Junior Company",
    period: "2024 — atual",
    description:
      "Construindo aplicações web responsivas e voltadas ao cliente com React e TypeScript em times multidisciplinares.",
    highlights: [
      "Desenvolvi mais de 5 projetos de clientes com React e TypeScript",
      "Implementei designs responsivos, melhorando a experiência mobile",
      "Participei de cerimônias ágeis e revisões de código",
    ],
  },
  {
    role: "Estudante de Engenharia de Software",
    company: "Universidade",
    period: "2022 — atual",
    description:
      "Cursando graduação em Engenharia de Software, além de projetos extracurriculares de programação.",
    highlights: [
      "Membro ativo da comunidade de programação",
      "Cursei disciplinas avançadas de algoritmos e estruturas de dados",
      "Liderei projetos em equipe em disciplinas de desenvolvimento ágil",
    ],
  },
] as const;

type Experience = (typeof EXPERIENCES)[number];

/**
 * Fallback vertical — o que o servidor sempre renderiza primeiro, e o que
 * permanece sob `prefers-reduced-motion`, em telas pequenas, ou sem JS.
 * Reaproveita o `NumberedStep` do Âmbar.
 */
function VerticalFallback({ experiences }: { experiences: readonly Experience[] }) {
  return (
    <div className="mx-auto mt-16 w-full max-w-3xl space-y-10">
      {experiences.map((exp, index) => (
        <NumberedStep
          key={exp.company}
          number={String(index + 1).padStart(2, "0")}
          title={`${exp.role} — ${exp.company} · ${exp.period}`}
          description={
            <>
              <span className="block">{exp.description}</span>
              <ul className="mt-3 space-y-1.5">
                {exp.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2">
                    <span aria-hidden="true" className="mt-0.5 text-terracotta">
                      ◆
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </>
          }
        />
      ))}
    </div>
  );
}

/**
 * A faixa horizontal sticky — o segundo dispositivo cinematográfico do
 * redesign. Monta como um componente novo (não uma alternância de branch
 * dentro do mesmo componente) para que `useScroll` sempre encontre o nó do
 * DOM já anexado no seu próprio ciclo de montagem.
 *
 * Nenhum elemento focável dentro do trilho — é a regra que decidiu que
 * Trajetória (texto puro) ganhasse este tratamento, e não Projetos (que
 * tem links).
 */
function HorizontalRail({ experiences }: { experiences: readonly Experience[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["2%", "-62%"]);

  return (
    <div ref={wrapperRef} className="relative mt-16 h-[280vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div
          style={{ x }}
          className="flex gap-10 px-6 will-change-transform md:px-10"
        >
          {experiences.map((exp) => (
            <article
              key={exp.company}
              className="w-[85vw] max-w-xl flex-shrink-0 rounded-sm border border-line bg-surface-raised p-8 shadow-card md:p-10"
            >
              <div className="flex items-center justify-between gap-4">
                <h3 className="font-display text-2xl font-medium text-ink">
                  {exp.role}
                </h3>
                <span className="whitespace-nowrap font-mono text-xs text-ink-muted">
                  {exp.period}
                </span>
              </div>
              <p className="mt-1 font-mono text-xs uppercase tracking-[0.15em] text-terracotta-text">
                {exp.company}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-ink-muted">
                {exp.description}
              </p>
              <ul className="mt-5 space-y-2 border-t border-line pt-5">
                {exp.highlights.map((highlight) => (
                  <li key={highlight} className="flex items-start gap-2 text-sm text-ink-muted">
                    <span aria-hidden="true" className="mt-1 text-terracotta">
                      ◆
                    </span>
                    <span>{highlight}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </motion.div>
      </div>
    </div>
  );
}

function ExperienceComponent() {
  const reducedMotion = usePrefersReducedMotion();
  const isWide = useIsWideViewport();
  const enhanced = isWide && !reducedMotion;

  return (
    <section id="experience" className="relative px-6 py-24 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <SectionHeading
          number="04"
          eyebrow="Trajetória"
          title="Percurso profissional & formação"
        />
      </div>

      {enhanced ? (
        <HorizontalRail experiences={EXPERIENCES} />
      ) : (
        <VerticalFallback experiences={EXPERIENCES} />
      )}
    </section>
  );
}

export const Experience = memo(ExperienceComponent);
