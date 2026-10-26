import { loadAdminContent } from '@/lib/admin-data';
import { AdminTabs } from '../AdminTabs';
import { AboutForm, ContactForm, ExperienceForm, ReadmeForm, SkillsForm } from '../ContentForms';

export default async function AdminPage() {
  const content = await loadAdminContent();
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
        { id: 'skills', label: 'Skills', content: <SkillsForm initial={content.skills} /> },
        { id: 'experiencia', label: 'Experiência', content: <ExperienceForm initial={content.experience} /> },
      ]}
    />
  );
}
