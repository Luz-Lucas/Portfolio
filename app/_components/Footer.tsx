"use client";

import { memo } from "react";

const LINKS = [
  { label: "About", href: "#about" },
  { label: "Projects", href: "#projects" },
  { label: "Skills", href: "#skills" },
  { label: "Experience", href: "#experience" },
  { label: "FAQ", href: "#faq" },
  { label: "Contact", href: "#contact" },
] as const;

function FooterComponent() {
  return (
    <footer className="relative px-6 py-12 border-t border-white/10 bg-black">
      <div className="mx-auto w-full max-w-6xl flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-xs text-white/60 uppercase tracking-widest font-semibold">
          © 2026 Lucas Pereira
        </div>
        <nav className="flex flex-wrap justify-center md:justify-end gap-6 text-xs">
          {LINKS.map((link) => (
            <a 
              key={link.href} 
              href={link.href} 
              className="text-white/60 hover:text-white hover:text-red-700 transition-colors duration-300 uppercase tracking-widest"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}

export const Footer = memo(FooterComponent);
