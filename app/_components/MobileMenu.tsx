"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NAV_LINKS } from "@/lib/nav";
import { useAnchorNav } from "@/lib/hooks/useAnchorNav";

/**
 * Menu mobile em tela cheia — hoje inexistente (a navbar é `hidden md:flex`
 * sem alternativa, então em telas pequenas só a logo e o botão de Contato
 * apareciam).
 */
export function MobileMenu({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { onNavClick } = useAnchorNav();
  const firstLinkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;

    document.body.style.overflow = "hidden";
    firstLinkRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[70] flex flex-col bg-surface md:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu de navegação"
        >
          <div className="flex items-center justify-between border-b border-line px-6 py-5">
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-ink-muted">
              Menu
            </span>
            <button
              type="button"
              onClick={onClose}
              className="focus-ambar rounded-sm p-2 font-mono text-xs uppercase tracking-[0.2em] text-ink"
            >
              Fechar &times;
            </button>
          </div>
          <nav className="flex flex-1 flex-col justify-center gap-2 px-8">
            {NAV_LINKS.map((link, index) => (
              <a
                key={link.href}
                ref={index === 0 ? firstLinkRef : undefined}
                href={link.href}
                onClick={(event) => {
                  onNavClick(event, link.href);
                  onClose();
                }}
                className="focus-ambar group flex items-baseline gap-4 border-b border-line py-4"
              >
                <span className="font-mono text-xs text-terracotta-text">
                  0{index + 1}
                </span>
                <span className="font-display text-3xl font-medium text-ink transition-colors group-hover:text-terracotta-text">
                  {link.label}
                </span>
              </a>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
