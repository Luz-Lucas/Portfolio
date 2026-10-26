import { describe, expect, it } from 'vitest';
import { APPS } from '@/content/apps';

describe('APPS', () => {
  it('lists the nine fixed apps in order', () => {
    expect(APPS.map((a) => a.title)).toEqual([
      'Leia-me.txt',
      'Sobre mim',
      'Projetos',
      'Skills',
      'Experiência',
      'Currículo.pdf',
      'Contato',
      'Prompt de comando',
      'Lixeira',
    ]);
  });

  it('has unique ids', () => {
    const ids = APPS.map((a) => a.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('SEED_CONTENT', () => {
  it('has no profile photo', async () => {
    const { SEED_CONTENT } = await import('@/content/seed');
    expect(SEED_CONTENT.about.photoUrl).toBeNull();
  });
});
