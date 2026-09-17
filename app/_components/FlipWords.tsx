"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

type FlipWordsProps = {
  words: readonly string[];
  className?: string;
  interval?: number;
};

/**
 * Antes um flip 3D em `rotateX` — o clichê visual de portfólio gerado.
 * Agora um crossfade com blur leve em Playfair Display itálico
 * (`font-editorial`) — o único lugar da página com essa família, já que
 * Anton (`font-display`) não tem itálico. Mesma funcionalidade (troca
 * automática de palavra a cada `interval`). `MotionConfig
 * reducedMotion="user"` (montado em SmoothScroll) reduz isto a um corte
 * seco sob reduced-motion.
 */
export const FlipWords: React.FC<FlipWordsProps> = React.memo(
  ({ words, className = "", interval = 2200 }) => {
    const [index, setIndex] = useState(0);

    useEffect(() => {
      if (!words || words.length === 0) return;

      const timer = setInterval(() => {
        setIndex((prev) => (prev + 1) % words.length);
      }, interval);

      return () => clearInterval(timer);
    }, [words, interval]);

    const currentWord = words[index];

    return (
      <span className={`relative inline-block h-[1.2em] align-baseline ${className}`}>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentWord}
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, filter: "blur(8px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-block font-editorial italic"
          >
            {currentWord}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }
);

FlipWords.displayName = "FlipWords";
