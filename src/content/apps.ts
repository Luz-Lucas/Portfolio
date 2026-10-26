import type { AppDef } from './types';

export const APPS: readonly AppDef[] = [
  { id: 'readme', title: 'Leia-me.txt', icon: '/icons/readme.svg', defaultSize: { w: 420, h: 300 } },
  { id: 'about', title: 'Sobre mim', icon: '/icons/about.svg', defaultSize: { w: 460, h: 380 } },
  { id: 'projects', title: 'Projetos', icon: '/icons/projects.svg', defaultSize: { w: 560, h: 400 } },
  { id: 'skills', title: 'Skills', icon: '/icons/skills.svg', defaultSize: { w: 440, h: 380 } },
  { id: 'experience', title: 'Experiência', icon: '/icons/experience.svg', defaultSize: { w: 480, h: 400 } },
  { id: 'cv', title: 'Currículo.pdf', icon: '/icons/cv.svg', defaultSize: { w: 560, h: 440 } },
  { id: 'contact', title: 'Contato', icon: '/icons/contact.svg', defaultSize: { w: 420, h: 420 } },
  { id: 'terminal', title: 'Prompt de comando', icon: '/icons/terminal.svg', defaultSize: { w: 520, h: 320 } },
  { id: 'trash', title: 'Lixeira', icon: '/icons/trash.svg', defaultSize: { w: 380, h: 260 } },
];

export function getApp(id: AppDef['id']): AppDef {
  const app = APPS.find((a) => a.id === id);
  if (!app) throw new Error(`App desconhecido: ${id}`);
  return app;
}
