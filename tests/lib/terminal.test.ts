import { describe, expect, it } from 'vitest';
import { runCommand } from '@/lib/terminal';
import { TEST_CONTENT as SEED_CONTENT, TEST_PROJECTS as SEED_PROJECTS } from '../fixtures/content';

const ctx = { content: SEED_CONTENT, projects: SEED_PROJECTS };
const run = (input: string) => runCommand(input, ctx);

describe('runCommand', () => {
  it('help lists the commands', () => {
    const out = run('help').output.join('\n');
    for (const c of ['help', 'whoami', 'skills', 'projetos', 'experiencia', 'contato', 'curriculo', 'abrir <app>', 'cls'])
      expect(out).toContain(c);
  });

  it('whoami prints name and role', () => {
    expect(run('whoami').output[0]).toBe(`${SEED_CONTENT.about.name} — ${SEED_CONTENT.about.role}`);
  });

  it('skills prints one line per group', () => {
    expect(run('skills').output).toContain('Frontend: React, TypeScript, Three.js');
  });

  it('projetos prints name and url per project', () => {
    const out = run('projetos').output;
    expect(out).toHaveLength(SEED_PROJECTS.length);
    expect(out[0]).toContain(SEED_PROJECTS[0].name);
    expect(out[0]).toContain(SEED_PROJECTS[0].url);
  });

  it('abrir maps names without accents, case-insensitive', () => {
    expect(run('abrir sobre').action).toEqual({ open: 'about' });
    expect(run('ABRIR Experiência').action).toEqual({ open: 'experience' });
    expect(run('abrir leia-me').action).toEqual({ open: 'readme' });
    expect(run('abrir curriculo').action).toEqual({ open: 'cv' });
    expect(run('abrir lixeira').action).toEqual({ open: 'trash' });
    expect(run('abrir xyz').action).toBeUndefined();
  });

  it('cls clears', () => {
    expect(run('cls').action).toBe('clear');
  });

  it('unknown command shows the Windows-style error', () => {
    expect(run('xyz').output).toEqual(["'xyz' não é reconhecido como um comando interno. Digite help."]);
  });

  it('empty input prints nothing', () => {
    expect(run('   ').output).toEqual([]);
  });
});

describe('runCommand projetos when GitHub failed', () => {
  it('says the list is unavailable instead of "Nenhum projeto publicado."', () => {
    const out = runCommand('projetos', { content: SEED_CONTENT, projects: { error: 'github_unavailable' } }).output;
    expect(out[0]).toContain('indisponíveis');
    expect(out.join(' ')).toContain(SEED_CONTENT.contact.github);
  });
});
