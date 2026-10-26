export type GithubRepo = {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics: string[];
  stargazers_count: number;
  fork: boolean;
  archived: boolean;
  pushed_at: string;
};

const PER_PAGE = 100;

/** Repositórios públicos do usuário, cacheados pelo Next (tag 'github', 1 h). */
export async function fetchPublicRepos(username: string): Promise<GithubRepo[]> {
  const headers: Record<string, string> = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;

  const repos: GithubRepo[] = [];
  for (let page = 1; ; page++) {
    const url = `https://api.github.com/users/${encodeURIComponent(username)}/repos?per_page=${PER_PAGE}&sort=pushed&page=${page}`;
    const res = await fetch(url, { headers, next: { tags: ['github'], revalidate: 3600 } } as RequestInit);
    if (!res.ok) throw new Error(`GitHub respondeu ${res.status}`);
    const batch = (await res.json()) as GithubRepo[];
    repos.push(...batch);
    if (batch.length < PER_PAGE) return repos;
  }
}
