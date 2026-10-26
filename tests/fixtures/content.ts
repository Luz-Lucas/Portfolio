// Conteúdo fixo para os testes (independente do conteúdo real do site em src/content/seed.ts).
import type { Project, SiteContent } from '@/content/types';

export const TEST_CONTENT: SiteContent = {
  readme: {
    body:
      'Olá! Eu sou **Seu Nome** [exemplo], desenvolvedor(a) full-stack.\n\n' +
      'Clique nos ícones à esquerda para ver meus projetos, skills e experiência. ' +
      'Prefere ir direto ao ponto? Abra o **Currículo.pdf**.',
  },
  about: {
    name: 'Seu Nome',
    role: 'Desenvolvedor(a) Full-Stack [exemplo]',
    bio:
      'Gosto de construir produtos web rápidos e bem acabados. [exemplo]\n\n' +
      'Trabalho principalmente com TypeScript, React e Node.',
    location: 'Brasil',
    availability: 'Aberto(a) a oportunidades',
    photoUrl: null,
  },
  contact: {
    email: 'voce@exemplo.com',
    linkedin: 'https://www.linkedin.com/',
    github: 'https://github.com/',
  },
  skills: [
    {
      group: 'Frontend',
      items: [
        { name: 'React', level: 4, years: 3 },
        { name: 'TypeScript', level: 4, years: 3 },
        { name: 'Three.js', level: 3, years: 1 },
      ],
    },
    {
      group: 'Backend',
      items: [
        { name: 'Node.js', level: 4, years: 3 },
        { name: 'PostgreSQL', level: 3, years: 2 },
      ],
    },
    {
      group: 'Ferramentas',
      items: [
        { name: 'Git', level: 4 },
        { name: 'Docker', level: 3 },
      ],
    },
  ],
  experience: [
    {
      kind: 'job',
      title: 'Desenvolvedor(a) Full-Stack',
      org: 'Empresa Exemplo',
      start: '2023-01',
      end: null,
      description: 'Desenvolvimento de aplicações web. [exemplo]',
    },
    {
      kind: 'job',
      title: 'Estagiário(a) de Desenvolvimento',
      org: 'Outra Empresa',
      start: '2021-06',
      end: '2022-12',
      description: 'Manutenção de sistemas internos. [exemplo]',
    },
    {
      kind: 'education',
      title: 'Ciência da Computação',
      org: 'Universidade Exemplo',
      start: '2019-02',
      end: '2023-12',
      description: 'Bacharelado. [exemplo]',
    },
  ],
  cvUrl: null,
};

export const TEST_PROJECTS: Project[] = [
  {
    repoId: 1,
    name: 'portfolio-3d',
    description: 'Este portfólio: cena 3D com área de trabalho estilo Windows 95. [exemplo]',
    url: 'https://github.com/',
    demoUrl: null,
    coverUrl: null,
    languages: ['TypeScript', 'threejs'],
    stars: 12,
    updatedAt: '2026-10-26T00:00:00Z',
  },
  {
    repoId: 2,
    name: 'api-tarefas',
    description: 'API REST de tarefas com autenticação. [exemplo]',
    url: 'https://github.com/',
    demoUrl: 'https://example.com/',
    coverUrl: null,
    languages: ['TypeScript', 'node'],
    stars: 4,
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    repoId: 3,
    name: 'dashboard-financas',
    description: 'Dashboard de finanças pessoais. [exemplo]',
    url: 'https://github.com/',
    demoUrl: null,
    coverUrl: null,
    languages: ['JavaScript', 'react'],
    stars: 2,
    updatedAt: '2026-05-10T00:00:00Z',
  },
];
