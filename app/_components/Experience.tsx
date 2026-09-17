"use client";

import { memo, useEffect, useRef, useState } from "react";
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
    role: "Especialização em Gestão de Pessoas e Recursos",
    company: "CP2 Junior Company",
    period: "2024 — atual",
    description:
      "Atuação complementar dentro da CP2, organizando pessoas e recursos entre projetos e apoiando o time no dia a dia.",
    highlights: [
      "Apoio na organização de tarefas e prazos entre membros do time",
      "Alinhamento entre áreas técnicas e de negócio",
      "Acompanhamento de entregas e alocação de recursos",
    ],
  },
  {
    role: "Desenvolvedor Full Stack",
    company: "Freelancer",
    period: "2023 — atual",
    description:
      "Desenvolvimento de aplicações web completas para clientes independentes, do front-end ao back-end.",
    highlights: [
      "Entrega de projetos ponta a ponta, do design à implantação",
      "Integração de front-end em React com APIs e bancos de dados",
      "Comunicação direta com clientes para levantar requisitos e prazos",
    ],
  },
  {
    role: "Estudante de Engenharia de Software",
    company: "Universidade",
    period: "2023 — atual",
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
          key={`${exp.company}-${exp.role}`}
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
 * O deslocamento horizontal é medido em pixels a partir da largura real do
 * trilho (`scrollWidth` menos a largura do viewport), não um percentual
 * fixo — assim o número de cards pode mudar sem precisar recalibrar a
 * mão um "-62%" mágico a cada edição de conteúdo.
 *
 * Nenhum elemento focável dentro do trilho — é a regra que decidiu que
 * Trajetória (texto puro) ganhasse este tratamento, e não Projetos (que
 * tem links).
 */
function HorizontalRail({ experiences }: { experiences: readonly Experience[] }) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrollDistance, setScrollDistance] = useState(0);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const updateDistance = () => {
      const viewportWidth = track.parentElement?.clientWidth ?? window.innerWidth;
      setScrollDistance(Math.max(track.scrollWidth - viewportWidth, 0));
    };

    updateDistance();
    const observer = new ResizeObserver(updateDistance);
    observer.observe(track);
    return () => observer.disconnect();
  }, [experiences]);

  const { scrollYProgress } = useScroll({
    target: wrapperRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(scrollYProgress, [0, 1], [0, -scrollDistance]);

  return (
    <div
      ref={wrapperRef}
      className="relative mt-16"
      style={{ height: `${Math.max(experiences.length * 130, 200)}vh` }}
    >
      <div className="sticky top-0 flex h-svh items-center overflow-hidden">
        <motion.div
          ref={trackRef}
          style={{ x }}
          className="flex gap-10 px-6 will-change-transform md:px-10"
        >
          {experiences.map((exp) => (
            <article
              key={`${exp.company}-${exp.role}`}
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
