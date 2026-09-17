// Fonte única dos links de navegação — antes duplicados literalmente em
// Navbar.tsx e Footer.tsx. Os `href` (âncoras) não mudam para não quebrar
// links externos; só os rótulos foram traduzidos.
export const NAV_LINKS = [
  { label: "Sobre", href: "#about" },
  { label: "Projetos", href: "#projects" },
  { label: "Ofício", href: "#skills" },
  { label: "Trajetória", href: "#experience" },
  { label: "Notas", href: "#faq" },
  { label: "Contato", href: "#contact" },
] as const;
