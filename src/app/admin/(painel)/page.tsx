import { loadAdminContent } from '@/lib/admin-data';
import { listAdminProjects } from '../actions';
import { AdminTabs } from '../AdminTabs';
import { ProjectsForm } from '../ProjectsForm';
import { AboutForm, ContactForm, ExperienceForm, ReadmeForm, SkillsForm } from '../ContentForms';

export default async function AdminPage() {
  const [content, projects] = await Promise.all([loadAdminContent(), listAdminProjects()]);
  return (
    <AdminTabs
      tabs={[
        {
          id: 'textos',
          label: 'Textos',
          content: (
            <>
              <ReadmeForm initial={content.readme} />
              <AboutForm initial={content.about} />
              <ContactForm initial={content.contact} />
            </>
          ),
        },
        { id: 'projetos', label: 'Projetos', content: <ProjectsForm initial={projects} /> },
        { id: 'skills', label: 'Skills', content: <SkillsForm initial={content.skills} /> },
        { id: 'experiencia', label: 'Experiência', content: <ExperienceForm initial={content.experience} /> },
      ]}
    />
  );
}
