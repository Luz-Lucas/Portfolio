import { Desktop } from '@/desktop/Desktop';
import { SEED_PROJECTS } from '@/content/seed';
import { getSiteContent } from '@/lib/content';

export const revalidate = 3600;

export default async function Home() {
  const [content, projects] = await Promise.all([getSiteContent(), Promise.resolve(SEED_PROJECTS)]);
  return (
    <main style={{ height: '100dvh' }}>
      <Desktop content={content} projects={projects} mode="scene" />
    </main>
  );
}
