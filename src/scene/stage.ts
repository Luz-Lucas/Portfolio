// Constantes e tipos do palco da área de trabalho — sem three.js, para não puxá-lo no bundle inicial.

export type ScreenRect = { left: number; top: number; width: number; height: number };

/** Palco lógico da área de trabalho dentro do monitor (escalado para caber no retângulo projetado). */
export const DESKTOP_LOGICAL = { w: 800, h: 600 } as const;
