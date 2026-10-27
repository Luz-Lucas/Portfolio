/**
 * URL pública do site. A Vercel expõe VERCEL_PROJECT_PRODUCTION_URL e VERCEL_URL em todo build;
 * NEXT_PUBLIC_SITE_URL sobrescreve quando houver domínio próprio (mesma regra do portfólio anterior).
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : 'http://localhost:3000');

export const SITE_DESCRIPTION =
  'Portfólio de Lucas Luz, estudante de Engenharia de Software e desenvolvedor front-end em Minas Gerais, Brasil — React, TypeScript e interfaces responsivas.';

/** Dono dos repositórios exibidos. NEXT_PUBLIC_GITHUB_USERNAME é o nome usado no portfólio anterior. */
export const githubUsername = () =>
  process.env.GITHUB_USERNAME || process.env.NEXT_PUBLIC_GITHUB_USERNAME || 'Luz-Lucas';
