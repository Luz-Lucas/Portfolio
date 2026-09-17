/**
 * URL pública do site, consciente do ambiente em vez de um domínio fixo
 * chutado no código. A Vercel expõe `VERCEL_PROJECT_PRODUCTION_URL` (o
 * domínio de produção do projeto) e `VERCEL_URL` (a URL do deployment
 * atual, útil em previews de PR) automaticamente em todo build — nenhuma
 * das duas precisa ser configurada manualmente.
 *
 * `NEXT_PUBLIC_SITE_URL` continua disponível para sobrescrever tudo isso
 * quando um domínio próprio for conectado (ex.: variável de ambiente do
 * projeto na Vercel), sem precisar editar código.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

export const SITE_TITLE = "Lucas Pereira — Desenvolvedor Front-end";

export const SITE_DESCRIPTION =
  "Portfólio de Lucas Pereira, estudante de Engenharia de Software e desenvolvedor front-end em Minas Gerais, Brasil — React, TypeScript e interfaces responsivas.";
