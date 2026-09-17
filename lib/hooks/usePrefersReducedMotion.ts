"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const media = window.matchMedia(QUERY);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

function getSnapshot() {
  return window.matchMedia(QUERY).matches;
}

function getServerSnapshot() {
  return false;
}

/**
 * Preferência de movimento reduzido do sistema, reativa a mudanças em
 * tempo real. `matchMedia` é um "external store" no sentido do React —
 * `useSyncExternalStore` é o jeito correto de assiná-lo (em vez de ler o
 * valor e empurrá-lo para `useState` dentro de um `useEffect`, que o
 * lint de hooks mais recente já sinaliza como um antipadrão).
 *
 * O `useReducedMotion()` do pacote `motion` instalado aqui não serve para
 * decisões estruturais como esta: ele lê a preferência uma única vez no
 * mount e não reage ao evento `change`.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
