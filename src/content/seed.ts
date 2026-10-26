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
    email: 'contato.lucaspmluz@hotmail.com',
    linkedin: 'https://www.linkedin.com/in/lucas-luz-0b0368432/',
    github: 'https://github.com/Luz-Lucas',
  },
  skills: [
    {
      group: 'Desenvolvimento Front-end',
      description: 'Construindo interfaces responsivas com React e TypeScript moderno.',
      items: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'JavaScript (ES6+)' }, { name: 'HTML5' }, { name: 'CSS3' }, { name: 'JSX' }],
    },
    {
      group: 'Estilização & UI',
      description: 'Criando layouts com CSS utilitário e frameworks de interface.',
      items: [{ name: 'TailwindCSS' }, { name: 'Bootstrap' }, { name: 'Styled Components' }, { name: 'CSS Grid' }, { name: 'Flexbox' }, { name: 'Design responsivo' }],
    },
    {
      group: 'Estado & Hooks',
      description: 'Gerenciando estado complexo com paradigmas modernos do React.',
      items: [{ name: 'Redux' }, { name: 'Context API' }, { name: 'React Hooks' }, { name: 'Hooks customizados' }, { name: 'useEffect' }, { name: 'useReducer' }],
    },
    {
      group: 'Fundamentos Full-stack',
      description: 'Expandindo além do front-end via Node.js e bancos de dados.',
      items: [{ name: 'Node.js' }, { name: 'Express' }, { name: 'REST APIs' }, { name: 'MongoDB' }, { name: 'PostgreSQL' }, { name: 'Socket.io' }],
    },
    {
      group: 'Ferramentas & Fluxo',
      description: 'Usando ferramentas modernas para desenvolvimento e deploy eficientes.',
      items: [{ name: 'Git' }, { name: 'VS Code' }, { name: 'Figma' }, { name: 'npm/yarn' }, { name: 'Vite' }, { name: 'Webpack' }],
    },
    {
      group: 'Performance & Qualidade',
      description: 'Garantindo apps rápidos e confiáveis com otimização e testes.',
      items: [{ name: 'React Testing Library' }, { name: 'Jest' }, { name: 'Lighthouse' }, { name: 'Web Vitals' }, { name: 'Acessibilidade' }, { name: 'Otimização de performance' }],
    },
  ],
  experience: [
    {
      kind: 'job',
      title: 'Desenvolvedor Júnior',
      org: 'CP2 Junior Company',
      start: '2024',
      end: null,
      description: 'Construindo aplicações web responsivas e voltadas ao cliente com React e TypeScript em times multidisciplinares.',
      highlights: [
        'Desenvolvi mais de 5 projetos de clientes com React e TypeScript',
        'Implementei designs responsivos, melhorando a experiência mobile',
        'Participei de cerimônias ágeis e revisões de código',
      ],
    },
    {
      kind: 'job',
      title: 'Especialização em Gestão de Pessoas e Recursos',
      org: 'CP2 Junior Company',
      start: '2024',
      end: null,
      description: 'Atuação complementar dentro da CP2, organizando pessoas e recursos entre projetos e apoiando o time no dia a dia.',
      highlights: [
        'Apoio na organização de tarefas e prazos entre membros do time',
        'Alinhamento entre áreas técnicas e de negócio',
        'Acompanhamento de entregas e alocação de recursos',
      ],
    },
    {
      kind: 'job',
      title: 'Desenvolvedor Full Stack',
      org: 'Freelancer',
      start: '2023',
      end: null,
      description: 'Desenvolvimento de aplicações web completas para clientes independentes, do front-end ao back-end.',
      highlights: [
        'Entrega de projetos ponta a ponta, do design à implantação',
        'Integração de front-end em React com APIs e bancos de dados',
        'Comunicação direta com clientes para levantar requisitos e prazos',
      ],
    },
    {
      kind: 'education',
      title: 'Estudante de Engenharia de Software',
      org: 'Universidade',
      start: '2023',
      end: null,
      description: 'Cursando graduação em Engenharia de Software, além de projetos extracurriculares de programação.',
      highlights: [
        'Membro ativo da comunidade de programação',
        'Cursei disciplinas avançadas de algoritmos e estruturas de dados',
        'Liderei projetos em equipe em disciplinas de desenvolvimento ágil',
      ],
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
