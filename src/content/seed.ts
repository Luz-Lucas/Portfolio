import type { Project, SiteContent } from './types';

/**
 * Conteúdo padrão do site (vem do portfólio anterior, Luz-Lucas/Portfolio).
 * Cada seção salva no admin substitui a correspondente daqui.
 */
export const SEED_CONTENT: SiteContent = {
  readme: {
    body:
      'Olá! Eu sou o **Lucas Pereira**, estudante de Engenharia de Software e desenvolvedor front-end em Minas Gerais.\n\n' +
      'Clique nos ícones à esquerda para ver meus projetos, skills e experiência. ' +
      'Prefere ir direto ao ponto? Abra o **Currículo.pdf** ou o **Contato**.',
  },
  about: {
    name: 'Lucas Pereira',
    role: 'Desenvolvedor Front-end',
    bio:
      'Estudante de Engenharia de Software natural de Minas Gerais, atuando como desenvolvedor júnior na CP2. ' +
      'Construo aplicações voltadas ao cliente com React e TypeScript, com foco em interfaces responsivas e performáticas.\n\n' +
      'Domino ferramentas modernas de front-end e venho me expandindo para full-stack. ' +
      'Trabalho bem em times ágeis, valorizando revisões de código e pair programming para entregar um trabalho de qualidade.\n\n' +
      'Português nativo · inglês fluente.',
    location: 'Minas Gerais, Brasil',
    availability: 'Disponível para trabalho',
    photoUrl: '/images/avatar.webp',
  },
  contact: {
    email: 'lucaspmluz@hotmail.com',
    linkedin: 'https://www.linkedin.com/in/lucas-luz-0b0368432/',
    github: 'https://github.com/Luz-Lucas',
  },
  skills: [
    {
      group: 'Front-end',
      items: [
        { name: 'React', level: 4 },
        { name: 'TypeScript', level: 4 },
        { name: 'JavaScript (ES6+)', level: 4 },
        { name: 'HTML5 e CSS3', level: 5 },
      ],
    },
    {
      group: 'Estilização & UI',
      items: [
        { name: 'TailwindCSS', level: 4 },
        { name: 'Styled Components', level: 3 },
        { name: 'Design responsivo', level: 4 },
      ],
    },
    {
      group: 'Estado & Hooks',
      items: [
        { name: 'React Hooks', level: 4 },
        { name: 'Context API', level: 4 },
        { name: 'Redux', level: 3 },
      ],
    },
    {
      group: 'Full-stack',
      items: [
        { name: 'Node.js', level: 3 },
        { name: 'Express e REST APIs', level: 3 },
        { name: 'PostgreSQL', level: 2 },
        { name: 'MongoDB', level: 2 },
      ],
    },
    {
      group: 'Ferramentas & Qualidade',
      items: [
        { name: 'Git', level: 4 },
        { name: 'Figma', level: 3 },
        { name: 'Vite', level: 3 },
        { name: 'Jest / Testing Library', level: 3 },
        { name: 'Lighthouse e Web Vitals', level: 3 },
      ],
    },
  ],
  experience: [
    {
      kind: 'job',
      title: 'Desenvolvedor Júnior',
      org: 'CP2 Junior Company',
      start: '2024-01',
      end: null,
      description:
        'Aplicações web responsivas com React e TypeScript em times multidisciplinares. ' +
        'Mais de 5 projetos de clientes, cerimônias ágeis e revisões de código.',
    },
    {
      kind: 'job',
      title: 'Gestão de Pessoas e Recursos',
      org: 'CP2 Junior Company',
      start: '2024-01',
      end: null,
      description: 'Organização de tarefas, prazos e alocação de recursos entre projetos; ponte entre áreas técnicas e de negócio.',
    },
    {
      kind: 'job',
      title: 'Desenvolvedor Full Stack',
      org: 'Freelancer',
      start: '2023-01',
      end: null,
      description: 'Aplicações web completas para clientes, do design à implantação, integrando React com APIs e bancos de dados.',
    },
    {
      kind: 'education',
      title: 'Engenharia de Software',
      org: 'Graduação',
      start: '2023-01',
      end: null,
      description: 'Algoritmos, estruturas de dados e projetos em equipe com desenvolvimento ágil.',
    },
  ],
  cvUrl: null,
};

/** Usado só quando GITHUB_USERNAME não está configurado (desenvolvimento local). */
export const SEED_PROJECTS: Project[] = [
  {
    repoId: 1,
    name: 'Portfolio',
    description: 'Portfólio anterior em Next.js e Tailwind.',
    url: 'https://github.com/Luz-Lucas/Portfolio',
    demoUrl: 'https://portifolio-one-kohl-87.vercel.app/',
    coverUrl: null,
    languages: ['TypeScript'],
    stars: 0,
    updatedAt: '2026-09-17T15:13:36Z',
  },
];
