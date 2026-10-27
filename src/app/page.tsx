import type { Metadata } from 'next';
import { Experience } from '@/scene/Experience';
import { getProjects } from '@/lib/projects';
import { getSiteContent } from '@/lib/content';
import { SITE_DESCRIPTION } from '@/lib/site';

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const { about } = await getSiteContent();
  const title = `Luz 95 · ${about.name} — ${about.role}`;
  const description = SITE_DESCRIPTION;
  return {
    title,
    description,
    openGraph: { title, description, type: 'website', locale: 'pt_BR', images: ['/images/og.png'] },
    twitter: { card: 'summary_large_image', title, description, images: ['/images/og.png'] },
  };
}

export default async function Home() {
  const [content, projects] = await Promise.all([getSiteContent(), getProjects()]);
  const { about, contact } = content;
  return (
    <main style={{ height: '100dvh' }}>
      {/* Resumo em texto para buscadores e leitores de tela. */}
      <section className="sr-only">
        <h1>
          {about.name} — {about.role}
        </h1>
        <p>{about.bio}</p>
        <ul>
          <li>
            <a href={`mailto:${contact.email}`}>{contact.email}</a>
          </li>
          <li>
            <a href={contact.linkedin}>LinkedIn</a>
          </li>
          <li>
            <a href={contact.github}>GitHub</a>
          </li>
        </ul>
      </section>
      <Experience content={content} projects={projects} />
    </main>
  );
}
