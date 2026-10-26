import type { ReactNode } from 'react';
import type { AppId, ProjectsResult, SiteContent } from '@/content/types';
import { About } from './About';
import { Projects } from './Projects';
import { Terminal } from './Terminal';
import { CvViewer } from './CvViewer';
import { Experience } from './Experience';
import { Readme } from './Readme';
import { Skills } from './Skills';
import { Trash } from './Trash';

export type AppData = { content: SiteContent; projects: ProjectsResult };

export function renderApp(id: AppId, { content, projects }: AppData): ReactNode {
  switch (id) {
    case 'readme':
      return <Readme content={content} />;
    case 'about':
      return <About content={content} />;
    case 'projects':
      return <Projects projects={projects} githubUrl={content.contact.github} />;
    case 'skills':
      return <Skills content={content} />;
    case 'experience':
      return <Experience content={content} />;
    case 'cv':
      return <CvViewer content={content} />;
    case 'terminal':
      return <Terminal content={content} projects={Array.isArray(projects) ? projects : []} />;
    case 'trash':
      return <Trash />;
    default:
      return <p>Em breve.</p>;
  }
}
