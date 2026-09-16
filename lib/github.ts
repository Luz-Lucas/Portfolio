interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface GitHubProject {
  id: number;
  name: string;
  description: string;
  url: string;
  language: string;
  stars: number;
  forks: number;
}

const GITHUB_USERNAME = process.env.NEXT_PUBLIC_GITHUB_USERNAME || "Luz-Lucas";

export async function fetchGitHubProjects(): Promise<GitHubProject[]> {
  try {
    const response = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=stars&order=desc&per_page=6`,
      {
        headers: {
          Accept: "application/vnd.github.v3+json",
        },
        next: { revalidate: 3600 }, // Cache for 1 hour
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch GitHub projects");
    }

    const repos: GitHubRepo[] = await response.json();

    return repos.map((repo) => ({
      id: repo.id,
      name: repo.name,
      description: repo.description || "No description available",
      url: repo.html_url,
      language: repo.language || "Unknown",
      stars: repo.stargazers_count,
      forks: repo.forks_count,
    }));
  } catch (error) {
    console.error("Error fetching GitHub projects:", error);
    return [];
  }
}
