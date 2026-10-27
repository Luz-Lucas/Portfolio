import type { SiteContent } from './types';

/**
 * Conteúdo padrão do site (vem do portfólio anterior, Luz-Lucas/Portfolio).
 * Cada seção salva no admin substitui a correspondente daqui.
 */
export const SEED_CONTENT: SiteContent = {
  readme: {
    body:
      'Olá! Eu sou o **Lucas Luz**, estudante de Engenharia de Software e desenvolvedor front-end em Minas Gerais.\n\n' +
      'Clique nos ícones à esquerda para ver meus projetos, skills e experiência. ' +
      'Prefere ir direto ao ponto? Abra o **Currículo.pdf** ou o **Contato**.',
  },
  about: {
    name: 'Lucas Luz',
    role: 'Desenvolvedor Front-end',
    bio:
      'Estudante de Engenharia de Software natural de Minas Gerais, atuando como desenvolvedor júnior na CP2. ' +
      'Construo aplicações voltadas ao cliente com React e TypeScript, com foco em interfaces responsivas e performáticas.\n\n' +
      'Domino ferramentas modernas de front-end e venho me expandindo para full-stack. ' +
      'Trabalho bem em times ágeis, valorizando revisões de código e pair programming para entregar um trabalho de qualidade.\n\n' +
      'Português nativo · inglês fluente.',
    location: 'Minas Gerais, Brasil',
    availability: 'Disponível para trabalho',
    photoUrl: '/images/foto.webp',
  },
  contact: {
    email: 'contato.lucaspmluz@hotmail.com',
    linkedin: 'https://www.linkedin.com/in/lucas-luz-0b0368432/',
    github: 'https://github.com/Luz-Lucas',
  },
  // Visão geral, sem listar cada biblioteca: os detalhes técnicos ficam para a entrevista.
  skills: [
    {
      group: 'Front-end',
      description: 'Interfaces responsivas e acessíveis com React e TypeScript.',
      items: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'JavaScript' }, { name: 'HTML e CSS' }],
    },
    {
      group: 'Interface e design',
      description: 'Do layout no Figma ao componente pronto, em qualquer tela.',
      items: [{ name: 'Tailwind CSS' }, { name: 'Design responsivo' }, { name: 'Figma' }],
    },
    {
      group: 'Back-end',
      description: 'Base para integrar o front-end com APIs e bancos de dados.',
      items: [{ name: 'Node.js' }, { name: 'APIs REST' }, { name: 'Bancos de dados' }],
    },
    {
      group: 'Qualidade e ferramentas',
      description: 'Código testado, rápido e versionado.',
      items: [{ name: 'Testes automatizados' }, { name: 'Performance e acessibilidade' }, { name: 'Git' }],
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
