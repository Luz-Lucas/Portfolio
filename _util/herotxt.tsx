"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

type FlipWordsProps = {
  words: readonly string[];
  className?: string;
  interval?: number;
};

export const FlipWords: React.FC<FlipWordsProps> = React.memo(({
  words,
  className = "",
  interval = 2000,
}) => {
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
    <span className={`inline-block relative h-[1.2em] align-baseline perspective-1000 ${className}`}>
      <AnimatePresence mode="wait">
        <motion.span
          key={currentWord}
          initial={{ rotateX: -90, opacity: 0, y: 20 }}
          animate={{ rotateX: 0, opacity: 1, y: 0 }}
          exit={{ rotateX: 90, opacity: 0, y: -20 }}
          transition={{
            duration: 0.4,
            ease: [0.175, 0.885, 0.32, 1.275],
          }}
          className="inline-block origin-bottom"
          style={{
            transformStyle: "preserve-3d",
            backfaceVisibility: "hidden",
          }}
        >
          {currentWord}
        </motion.span>
      </AnimatePresence>
    </span>
  );
});

FlipWords.displayName = "FlipWords";
