"use client";

import { motion } from "motion/react";

/**
 * Wrapper de entrada por scroll — opacidade + leve deslocamento vertical.
 * Sob reduced-motion, o `MotionConfig reducedMotion="user"` (montado uma
 * vez em SmoothScroll) desativa a parte de transform e mantém só o fade,
 * então nenhum uso deste componente precisa checar a preferência de novo.
 */
export function Reveal({
  children,
  delay = 0,
  y = 18,
  className,
}: {
  children: React.ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
