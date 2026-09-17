"use client";

import { memo } from "react";
import Image from "next/image";
import { SectionHeading } from "./ambar/SectionHeading";
import { Frame } from "./ambar/Frame";
import { Quote } from "./ambar/Quote";
import { Reveal } from "./ambar/Reveal";

function AboutComponent() {
  return (
    <section id="about" className="relative px-6 py-24 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading number="01" eyebrow="Sobre" title="Nota do autor" align="left" />
        </Reveal>

        <div className="mt-12 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="space-y-6 lg:col-span-7">
            <Reveal>
              <p className="text-lg leading-relaxed text-ink-muted first-letter:float-left first-letter:mr-3 first-letter:font-display first-letter:text-7xl first-letter:font-medium first-letter:leading-[0.75] first-letter:text-terracotta-text">
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
            <Reveal delay={0.2} className="pt-4">
              <Quote>Prefiro código revisado a código apressado.</Quote>
            </Reveal>
          </div>

          <div className="lg:col-span-5">
            <Reveal delay={0.15}>
              <Frame className="relative mx-auto aspect-[4/5] w-full max-w-sm lg:mx-0">
                <Image
                  src="/aboutimg.png"
                  alt="Lucas Pereira trabalhando em um notebook"
                  fill
                  sizes="(max-width: 1024px) 80vw, 30vw"
                  className="object-cover grayscale contrast-125"
                />
                <div className="absolute inset-0 bg-terracotta-deep/20 mix-blend-color" />
                <span
                  aria-hidden="true"
                  className="absolute inset-y-0 left-1/3 w-px bg-line/70"
                />
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 top-1/2 h-px bg-line/70"
                />
              </Frame>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

export const About = memo(AboutComponent);
