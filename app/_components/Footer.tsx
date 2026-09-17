"use client";

import { memo } from "react";
import { NAV_LINKS } from "@/lib/nav";
import { useAnchorNav } from "@/lib/hooks/useAnchorNav";
import { Divider } from "./ambar/Divider";

/**
 * O verso do cartão de visita — monograma, filete com o nome espaçado em
 * mono, os mesmos links da navbar (fonte única em `lib/nav.ts`, antes
 * duplicados literalmente aqui).
 */
function FooterComponent() {
  const { onNavClick } = useAnchorNav();

  return (
    <footer className="relative px-6 pb-12 pt-4 md:px-10">
      <div className="mx-auto w-full max-w-6xl">
        <Divider />
        <div className="flex flex-col items-center gap-8 py-10 text-center">
          <span className="flex h-10 w-10 items-center justify-center rounded-full border border-line font-display text-sm font-medium text-terracotta-text">
            LP
          </span>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-ink">
            Lucas Pereira
          </p>
          <nav
            className="flex flex-wrap justify-center gap-x-6 gap-y-2 font-mono text-xs uppercase tracking-[0.15em]"
            aria-label="Navegação do rodapé"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(event) => onNavClick(event, link.href)}
                className="focus-ambar text-ink-muted transition-colors hover:text-terracotta-text"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-muted">
            © 2026 Lucas Pereira
          </p>
        </div>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterComponent);
