"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

/** Seções observadas para o numeral de margem — mesma ordem da página. */
const SECTIONS = [
  { id: "about", label: "Sobre", number: "01" },
  { id: "projects", label: "Projetos", number: "02" },
  { id: "skills", label: "Ofício", number: "03" },
  { id: "experience", label: "Trajetória", number: "04" },
  { id: "faq", label: "Notas", number: "05" },
  { id: "contact", label: "Contato", number: "06" },
] as const;

function SectionIndicator() {
  const [current, setCurrent] = useState<(typeof SECTIONS)[number] | null>(null);

  useEffect(() => {
    const elements = SECTIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const match = SECTIONS.find((s) => s.id === entry.target.id);
            if (match) setCurrent(match);
          }
        }
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  if (!current) return null;

  return (
    <div
      aria-hidden="true"
      className="hidden lg:block fixed bottom-8 left-8 z-40 font-mono text-[11px] tracking-[0.2em] text-ink-muted"
    >
      N&deg; {current.number} <span className="text-line">&mdash;</span> {current.label}
    </div>
  );
}

function ScrollProgressEdge() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX }}
      className="fixed top-0 left-0 right-0 h-[2px] origin-left bg-ember-deep z-50"
    />
  );
}

/**
 * Barra de progresso de scroll no topo + numeral da seção corrente na
 * margem — o mecanismo de wayfinding que sobrevive do Âmbar (é a peça que
 * o usuário disse ter gostado). A moldura fixa com losangos e o grão de
 * papel do Âmbar saem daqui: preto e branco liso fazem o trabalho pesado
 * no Meia-Tinta, sem papel de parede decorativo.
 */
export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgressEdge />
      <SectionIndicator />
      {children}
    </>
  );
}
