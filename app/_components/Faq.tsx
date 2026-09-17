"use client";

import { memo } from "react";
import { Disclosure, DisclosureButton, DisclosurePanel } from "@headlessui/react";
import { SectionHeading } from "./meia-tinta/SectionHeading";
import { Reveal } from "./meia-tinta/Reveal";

const NOTES = [
  {
    question: "Como você concilia a faculdade com o trabalho na CP2?",
    answer:
      "Uso metodologias ágeis, gestão rígida de tempo e planejamento de sprints para lidar com as disciplinas e os projetos reais de forma eficiente.",
  },
  {
    question: "Qual sua experiência com React?",
    answer:
      "Tenho domínio de hooks, Context API e Redux, demonstrado em projetos complexos como dashboards de e-commerce e gerenciadores de tarefas.",
  },
  {
    question: "Qual sua abordagem para full-stack?",
    answer:
      "Meu foco é front-end, mas integro React com Node.js/Express e bancos de dados (MongoDB/PostgreSQL) para construir aplicações completas.",
  },
  {
    question: "Como você alcançou 100/100 no Lighthouse?",
    answer:
      "Priorizando code splitting, lazy loading, imagens otimizadas, CSS eficiente e animações suaves, sempre respeitando os padrões de acessibilidade.",
  },
] as const;

/**
 * Ex-FAQ, agora um acordeão de filetes ("Notas de margem"). Usa o
 * `Disclosure` do `@headlessui/react` (já instalado) diretamente — sem
 * depender do wrapper em `components/animate-ui`, que é código morto e
 * sai na limpeza. `static` no painel mantém o conteúdo sempre no DOM para
 * a transição de altura em CSS puro (`grid-template-rows`) funcionar sem
 * medir alturas em JS.
 */
function FaqComponent() {
  return (
    <section id="faq" className="relative px-6 py-24 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Reveal>
          <SectionHeading number="05" eyebrow="Notas" title="Perguntas de margem" />
        </Reveal>

        <div className="mx-auto mt-16 max-w-3xl divide-y divide-line border-y border-line">
          {NOTES.map((note, index) => (
            <Disclosure key={note.question} as="div">
              {({ open }) => (
                <>
                  <DisclosureButton className="focus-ember flex w-full items-start justify-between gap-6 py-5 text-left">
                    <span className="flex items-baseline gap-4">
                      <span className="font-mono text-xs text-ember-text">
                        0{index + 1}
                      </span>
                      <span className="font-sans text-lg font-semibold text-ink">
                        {note.question}
                      </span>
                    </span>
                    <span
                      aria-hidden="true"
                      className={`flex-shrink-0 font-mono text-lg text-ink-muted transition-transform duration-300 ${
                        open ? "rotate-45" : ""
                      }`}
                    >
                      +
                    </span>
                  </DisclosureButton>
                  <DisclosurePanel
                    static
                    className="grid transition-[grid-template-rows] duration-300 ease-in-out"
                    style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
                  >
                    <div className="overflow-hidden">
                      <p className="max-w-2xl pb-6 pl-9 text-sm leading-relaxed text-ink-muted">
                        {note.answer}
                      </p>
                    </div>
                  </DisclosurePanel>
                </>
              )}
            </Disclosure>
          ))}
        </div>
      </div>
    </section>
  );
}

export const Faq = memo(FaqComponent);
