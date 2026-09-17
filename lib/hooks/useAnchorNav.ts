"use client";

import { useLenis } from "lenis/react";
import type { MouseEvent } from "react";

const HEADER_OFFSET = 88;

/**
 * Clique de âncora compartilhado por Navbar, Footer e MobileMenu.
 *
 * O Lenis intercepta o scroll da página, então um `href="#about"` comum
 * fica serrilhado ou trava no meio. Quando o Lenis está de fato montado
 * (`useLenis()` retorna uma instância — nada sob reduced-motion, onde o
 * `SmoothScroll` nem o instancia), assumimos o scroll manualmente com
 * `lenis.scrollTo` e atualizamos o hash sem recarregar. Sem Lenis, o
 * `href` continua no markup e o navegador faz o scroll nativo — inclusive
 * sem JS.
 */
export function useAnchorNav() {
  const lenis = useLenis();

  const onNavClick = (event: MouseEvent<HTMLAnchorElement>, href: string) => {
    if (!lenis || !href.startsWith("#")) return;

    event.preventDefault();
    const target = document.querySelector(href);
    if (!target) return;

    lenis.scrollTo(target as HTMLElement, {
      offset: -HEADER_OFFSET,
      duration: 1.1,
    });
    history.replaceState(null, "", href);
  };

  return { onNavClick };
}
