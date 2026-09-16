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

function NavbarComponent() {
  return (
    <header className="sticky top-0 z-50 bg-black/95 backdrop-blur-lg border-b border-white/10">
      <div className="mx-auto w-full max-w-6xl px-6 py-4 flex items-center justify-between">
        <a 
          href="#home" 
          className="text-lg uppercase tracking-[0.35em] text-white font-bold hover:text-red-700 transition duration-300"
        >
          Lucas
        </a>
        <nav className="hidden md:flex items-center gap-8 text-xs uppercase tracking-widest" aria-label="Main navigation">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-white/70 hover:text-white hover:text-red-700 transition-colors duration-300"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#contact"
          className="text-xs font-semibold uppercase tracking-widest px-6 py-2.5 border border-red-700 text-red-700 hover:bg-red-700 hover:text-white transition-all duration-300 rounded-2xl"
        >
          Contact
        </a>
      </div>
    </header>
  );
}

export const Navbar = memo(NavbarComponent);
