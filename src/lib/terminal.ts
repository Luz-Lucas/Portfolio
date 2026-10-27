import type { AppId, ProjectsResult, SiteContent } from '@/content/types';

export type CommandResult = { output: string[]; action?: { open: AppId } | 'clear' };
type Ctx = { content: SiteContent; projects: ProjectsResult };

const OPEN_NAMES: Record<string, AppId> = {
  'leia-me': 'readme',
  sobre: 'about',
  projetos: 'projects',
  skills: 'skills',
  experiencia: 'experience',
  curriculo: 'cv',
  contato: 'contact',
  lixeira: 'trash',
};

const HELP = [
  'Comandos disponíveis:',
  '  help          mostra esta ajuda',
  '  whoami        quem sou eu',
  '  skills        minhas tecnologias',
  '  projetos      lista de projetos',
  '  experiencia   experiência e formação',
  '  contato       como falar comigo',
  '  curriculo     link do currículo',
  '  abrir <app>   abre um app (' + Object.keys(OPEN_NAMES).join(', ') + ')',
  '  cls, clear    limpa a tela',
];

const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();

export function runCommand(input: string, { content, projects }: Ctx): CommandResult {
  const [cmd = '', ...args] = normalize(input.trim()).split(/\s+/).filter(Boolean);
  const { about, contact } = content;

  switch (cmd) {
    case '':
      return { output: [] };
    case 'help':
      return { output: HELP };
    case 'whoami':
      return { output: [`${about.name} — ${about.role}`, about.location] };
    case 'skills':
      return { output: content.skills.map((g) => `${g.group}: ${g.items.map((i) => i.name).join(', ')}`) };
    case 'projetos':
      if (!Array.isArray(projects))
        return { output: ['Projetos indisponíveis agora (GitHub fora do ar).', `Veja direto: ${contact.github}`] };
      return {
        output: projects.length ? projects.map((p) => `${p.name.padEnd(24)} ${p.url}`) : ['Nenhum projeto publicado.'],
      };
    case 'experiencia':
      return { output: content.experience.map((e) => `${e.start} – ${e.end ?? 'Atual'}  ${e.title} @ ${e.org}`) };
    case 'contato':
      return { output: [`E-mail:   ${contact.email}`, `LinkedIn: ${contact.linkedin}`, `GitHub:   ${contact.github}`] };
    case 'curriculo':
      return content.cvUrl
        ? { output: [`Currículo: ${content.cvUrl}`], action: { open: 'cv' } }
        : { output: ['Currículo em breve.'] };
    case 'abrir': {
      const id = OPEN_NAMES[args[0] ?? ''];
      return id
        ? { output: [`Abrindo ${args[0]}...`], action: { open: id } }
        : { output: [`App não encontrado. Use: ${Object.keys(OPEN_NAMES).join(', ')}`] };
    }
    case 'cls':
    case 'clear':
      return { output: [], action: 'clear' };
    default:
      return { output: [`'${input.trim().split(/\s+/)[0]}' não é reconhecido como um comando interno. Digite help.`] };
  }
}
