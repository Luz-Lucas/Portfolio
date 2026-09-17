"use client";

import { memo, useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { FlipWords } from "./FlipWords";
import { Frame } from "./ambar/Frame";
import { Seal } from "./ambar/Seal";
import { useAnchorNav } from "@/lib/hooks/useAnchorNav";

const WORDS = ["intuitivas", "responsivas", "performáticas"] as const;

const MICRO_COLUMNS = [
  {
    label: "Estudante",
    description: "Engenharia de Software, foco em interfaces web.",
  },
  {
    label: "Ágil",
    description: "Sprints, code review e pair programming.",
  },
  {
    label: "Idiomas",
    description: "Português nativo · inglês fluente.",
  },
] as const;

function HeroComponent() {
  const { onNavClick } = useAnchorNav();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const portraitY = useTransform(scrollYProgress, [0, 1], ["0%", "16%"]);

  return (
    <section
      id="home"
      ref={sectionRef}
      className="relative min-h-screen overflow-hidden pt-28 pb-20 md:pt-36"
    >
      {/* Retrato — sangra pela borda direita, duotone, parallaxe leve */}
      <motion.div
        style={{ y: portraitY }}
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[38%] md:block"
        aria-hidden="true"
      >
        <Frame className="relative h-full w-full">
          <Image
            src="/aboutimg.png"
            alt=""
            fill
            sizes="38vw"
            priority
            className="object-cover object-top grayscale contrast-125"
          />
          <div className="absolute inset-0 bg-terracotta-deep/25 mix-blend-color" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface via-surface/10 to-transparent" />
        </Frame>
        <div className="absolute -left-9 top-10 z-10 hidden lg:block">
          <Seal />
        </div>
      </motion.div>

      <div className="relative mx-auto w-full max-w-6xl px-6 md:px-10">
        <div className="max-w-2xl space-y-8">
          <div className="flex items-center gap-4">
            <span className="h-px w-10 bg-line" aria-hidden="true" />
            <p className="font-mono text-[11px] uppercase tracking-[0.35em] text-ink-muted">
              Portfólio · Minas Gerais · Brasil
            </p>
          </div>

          <div className="space-y-4">
            <h1
              className="font-display font-medium leading-[0.95] text-ink text-balance"
              style={{ fontSize: "clamp(2.75rem, 8vw, 6rem)" }}
            >
              Desenvolvedor <em className="text-terracotta-text italic">front-end</em>
            </h1>
            <p className="font-display text-2xl text-ink-muted md:text-3xl">
              Construindo experiências <FlipWords words={WORDS} />
            </p>
          </div>

          <p className="max-w-xl text-base leading-relaxed text-ink-muted md:text-lg">
            Estudante de Engenharia de Software construindo experiências web
            centradas no usuário. Equilibro os estudos com desenvolvimento
            real na CP2 Junior Company, a caminho de me tornar um
            desenvolvedor full-stack.
          </p>

          <div className="flex flex-col gap-4 pt-2 sm:flex-row">
            <a
              href="#projects"
              onClick={(event) => onNavClick(event, "#projects")}
              className="focus-ambar inline-flex items-center justify-center rounded-full bg-terracotta-deep px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-on-terracotta transition-colors hover:bg-terracotta"
            >
              Ver projetos
            </a>
            <a
              href="#contact"
              onClick={(event) => onNavClick(event, "#contact")}
              className="focus-ambar inline-flex items-center justify-center rounded-full border border-line px-8 py-3.5 font-mono text-xs uppercase tracking-[0.2em] text-ink transition-colors hover:border-terracotta-text hover:text-terracotta-text"
            >
              Entrar em contato
            </a>
          </div>

          <div className="grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
            {MICRO_COLUMNS.map((column) => (
              <div key={column.label}>
                <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-terracotta-text">
                  <span aria-hidden="true">◆</span>
                  {column.label}
                </p>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                  {column.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Indicador de scroll — filete que se desenha, em vez do chevron pulando */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-8 hidden flex-col items-center gap-3 sm:flex"
      >
        <span
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-ink-muted"
          style={{ writingMode: "vertical-rl" }}
        >
          Role
        </span>
        <motion.span
          className="h-12 w-px origin-top bg-terracotta"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>
    </section>
  );
}

export const Hero = memo(HeroComponent);
