export type SkillGroup = {
  group: string;
  items: { name: string; level: 1 | 2 | 3 | 4 | 5; years?: number }[];
};

export type ExperienceItem = {
  kind: 'job' | 'education';
  title: string;
  org: string;
  start: string;
  end: string | null;
  description: string;
};

export type SiteContent = {
  readme: { body: string };
  about: {
    name: string;
    role: string;
    bio: string;
    location: string;
    availability: string;
    photoUrl: string | null;
  };
  contact: { email: string; linkedin: string; github: string };
  skills: SkillGroup[];
  experience: ExperienceItem[];
  cvUrl: string | null;
};

export type Project = {
  repoId: number;
  name: string;
  description: string;
  url: string;
  demoUrl: string | null;
  coverUrl: string | null;
  languages: string[];
  stars: number;
  updatedAt: string;
};

export type ProjectsResult = Project[] | { error: string };

export type AppId =
  | 'readme'
  | 'about'
  | 'projects'
  | 'skills'
  | 'experience'
  | 'cv'
  | 'contact'
  | 'terminal'
  | 'trash';

export type AppDef = {
  id: AppId;
  title: string;
  icon: string;
  defaultSize: { w: number; h: number };
};
