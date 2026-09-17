"use client";

import { memo, useState } from "react";
import { NAV_LINKS } from "@/lib/nav";
import { useAnchorNav } from "@/lib/hooks/useAnchorNav";
import { MobileMenu } from "./MobileMenu";

function NavbarComponent() {
  const { onNavClick } = useAnchorNav();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-surface/90 backdrop-blur-sm">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 md:px-10">
        <a
          href="#home"
          onClick={(event) => onNavClick(event, "#home")}
          className="focus-ember flex h-9 w-9 items-center justify-center rounded-sm border border-line font-display text-sm text-ember-text"
        >
          LP
        </a>

        <nav
          className="hidden md:flex items-center gap-8 font-mono text-xs uppercase tracking-[0.2em]"
          aria-label="Navegação principal"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => onNavClick(event, link.href)}
              className="focus-ember relative py-1 text-ink-muted transition-colors hover:text-ink after:absolute after:-bottom-1 after:left-0 after:h-px after:w-0 after:bg-ember after:transition-all hover:after:w-full"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href="#contact"
          onClick={(event) => onNavClick(event, "#contact")}
          className="focus-ember hidden md:inline-flex items-center rounded-full border border-ember-deep px-6 py-2.5 font-mono text-xs uppercase tracking-[0.2em] text-ember-text transition-colors hover:bg-ember-deep hover:text-on-ember"
        >
          Contato
        </a>

        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="focus-ember flex flex-col gap-1.5 p-2 md:hidden"
          aria-label="Abrir menu"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
        >
          <span className="h-px w-6 bg-ink" />
          <span className="h-px w-6 bg-ink" />
        </button>
      </div>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </header>
  );
}

export const Navbar = memo(NavbarComponent);
