"use client";

import { useEffect, useState } from "react";

/**
 * Índice do elemento (por `id`) atualmente cruzando o centro da viewport.
 * Generaliza o padrão de scroll-spy usado pelo numeral de margem da
 * `PageFrame` para qualquer lista de seções/cartões — hoje usado pelo
 * indicador de posição do carrossel de Projetos.
 */
export function useSectionIndex(ids: readonly string[]): number {
  const [active, setActive] = useState(0);
  const key = ids.join("|");

  useEffect(() => {
    const list = key.split("|").filter(Boolean);
    const elements = list
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const index = list.indexOf(entry.target.id);
            if (index !== -1) setActive(index);
          }
        }
      },
      { rootMargin: "-45% 0px -45% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [key]);

  return active;
}
