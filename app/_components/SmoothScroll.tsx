"use client";

import { ReactLenis } from "lenis/react";
import { MotionConfig } from "motion/react";
import { usePrefersReducedMotion } from "@/lib/hooks/usePrefersReducedMotion";

/**
 * Scroll suave global (Lenis) + configuração central de reduced-motion.
 *
 * Sob `prefers-reduced-motion: reduce` o Lenis nem é instanciado — o
 * scroll volta a ser o nativo do navegador — e o `MotionConfig` avisa
 * toda a árvore `motion.*` para pular transform/layout e manter só
 * opacidade. Nenhum componente animado precisa checar a preferência de
 * novo: a Navbar e o Footer ainda chamam `useLenis()` para interceptar
 * as âncoras quando o Lenis está de fato montado.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reducedMotion = usePrefersReducedMotion();

  if (reducedMotion) {
    return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
  }

  return (
    <MotionConfig reducedMotion="user">
      <ReactLenis
        root
        options={{ lerp: 0.1, smoothWheel: true, syncTouch: false }}
      >
        {children}
      </ReactLenis>
    </MotionConfig>
  );
}
