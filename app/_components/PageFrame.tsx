"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useSpring } from "motion/react";

const DIAMOND_POSITIONS = [
  "top-0 left-0 -translate-x-1/2 -translate-y-1/2",
  "top-0 right-0 translate-x-1/2 -translate-y-1/2",
  "bottom-0 left-0 -translate-x-1/2 translate-y-1/2",
  "bottom-0 right-0 translate-x-1/2 translate-y-1/2",
] as const;

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
      className="fixed top-0 left-0 right-0 h-[2px] origin-left bg-terracotta-deep z-50"
    />
  );
}

/**
 * Moldura fixa da página: filete de 1px recuado da borda com losangos nos
 * cantos, aresta superior virando terracota conforme o progresso de
 * scroll, e o numeral da seção corrente na margem — o cabeçalho de revista.
 * Puramente decorativo: `pointer-events-none` em tudo.
 */
export function PageFrame({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ScrollProgressEdge />
      <div
        aria-hidden="true"
        className="hidden md:block fixed inset-7 z-40 pointer-events-none border border-line"
      >
        {DIAMOND_POSITIONS.map((position) => (
          <span
            key={position}
            className={`absolute ${position} text-terracotta text-[10px] leading-none bg-surface px-[3px]`}
          >
            &#9670;
          </span>
        ))}
      </div>
      <SectionIndicator />
      {children}
    </>
  );
}
