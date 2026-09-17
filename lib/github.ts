interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  fork: boolean;
}

export interface GitHubProject {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
}

export const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "Luz-Lucas";

/**
 * Busca os repositórios em destaque do GitHub. Chamada no servidor
 * (`app/page.tsx`), então `next.revalidate` de fato tem efeito — antes
 * este fetch acontecia dentro de um `useEffect` no navegador, onde o cache
 * do Next não existe e cada visitante batia direto na API pública
 * (limite de 60 req/h por IP, sem HTML no SSR e um "Loading..." visível).
 *
 * A API `/users/:user/repos` não aceita `sort=stars` — a versão anterior
 * pedia isso e recebia silenciosamente a ordenação padrão (por atualização).
 * Aqui buscamos por `updated`, tiramos os forks e ordenamos por estrelas
 * no próprio servidor antes de cortar para as 6 melhores.
 */
export async function fetchGitHubProjects(): Promise<GitHubProject[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=100`,
      {
        headers: { Accept: "application/vnd.github.v3+json" },
        next: { revalidate: 3600 },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub projects");
    }

    const repos: GitHubRepo[] = await response.json();

    return repos
      .filter((repo) => !repo.fork)
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 6)
      .map((repo) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description || "Sem descrição disponível.",
        url: repo.html_url,
        language: repo.language || "—",
        stars: repo.stargazers_count,
        forks: repo.forks_count,
      }));
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    return [];
  }
}
