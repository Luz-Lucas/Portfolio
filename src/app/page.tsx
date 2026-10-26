import { Desktop } from '@/desktop/Desktop';
import { SEED_PROJECTS } from '@/content/seed';
import { getSiteContent } from '@/lib/content';

export default async function Home() {
  const content = await getSiteContent();
  return (
    <main style={{ height: '100dvh' }}>
      <Desktop content={content} projects={SEED_PROJECTS} mode="scene" />
    </main>
  );
}
