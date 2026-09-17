"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(min-width: 768px)";

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

/** true a partir do breakpoint `md` do Tailwind (768px). */
export function useIsWideViewport(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
