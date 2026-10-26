import { Desktop } from '@/desktop/Desktop';
import { getProjects } from '@/lib/projects';
import { getSiteContent } from '@/lib/content';

export const revalidate = 3600;

export default async function Home() {
  const [content, projects] = await Promise.all([getSiteContent(), getProjects()]);
  return (
    <main style={{ height: '100dvh' }}>
      <Desktop content={content} projects={projects} mode="scene" />
    </main>
  );
}
