import { describe, expect, it } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { renderApp } from '@/desktop/apps';
import { TEST_CONTENT as SEED_CONTENT, TEST_PROJECTS as SEED_PROJECTS } from '../../fixtures/content';
import type { SiteContent } from '@/content/types';

const show = (id: Parameters<typeof renderApp>[0], content: SiteContent = SEED_CONTENT) =>
  render(<>{renderApp(id, { content, projects: SEED_PROJECTS })}</>);

describe('content apps', () => {
  it('Readme renders paragraphs, bold and links from the body', () => {
    show('readme', { ...SEED_CONTENT, readme: { body: 'Olá **mundo**\n\nVeja [GitHub](https://github.com/x)' } });
    expect(screen.getByText('mundo').tagName).toBe('STRONG');
    const link = screen.getByRole('link', { name: 'GitHub' });
    expect(link).toHaveAttribute('href', 'https://github.com/x');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener');
  });

  it('Readme does not inject raw HTML', () => {
    const { container } = show('readme', { ...SEED_CONTENT, readme: { body: '<img src=x onerror=alert(1)>' } });
    expect(container.querySelector('img')).toBeNull();
    expect(screen.getByText('<img src=x onerror=alert(1)>')).toBeInTheDocument();
  });

  it('About shows name, role, location, availability and a placeholder avatar', () => {
    show('about');
    const { name, role, location, availability } = SEED_CONTENT.about;
    for (const text of [name, role, location, availability]) expect(screen.getByText(text)).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Avatar' })).toBeInTheDocument();
  });

  it('About shows the photo when there is one', () => {
    show('about', { ...SEED_CONTENT, about: { ...SEED_CONTENT.about, photoUrl: '/foto.jpg' } });
    expect(screen.getByRole('img', { name: `Foto de ${SEED_CONTENT.about.name}` })).toHaveAttribute('src', '/foto.jpg');
  });

  it('Skills groups by area and shows the level as 5 blocks', () => {
    show('skills');
    expect(screen.getByRole('heading', { name: 'Frontend' })).toBeInTheDocument();
    const meter = screen.getByLabelText('React: nível 4 de 5');
    expect(meter.querySelectorAll('.is-on')).toHaveLength(4);
    expect(meter.children).toHaveLength(5);
  });

  it('Experience lists jobs first (newest first), then education, with "Atual" for open ends', () => {
    show('experience');
    const items = screen.getAllByRole('listitem').map((li) => within(li).getByRole('heading').textContent);
    expect(items).toEqual([
      'Desenvolvedor(a) Full-Stack',
      'Estagiário(a) de Desenvolvimento',
      'Ciência da Computação',
    ]);
    expect(screen.getByText(/2023-01 – Atual/)).toBeInTheDocument();
  });

  it('CvViewer embeds the pdf with a download link', () => {
    show('cv', { ...SEED_CONTENT, cvUrl: '/cv.pdf' });
    expect(screen.getByTitle('Currículo')).toHaveAttribute('src', '/cv.pdf');
    expect(screen.getByRole('link', { name: 'Baixar' })).toHaveAttribute('download');
  });

  it('CvViewer without a file says it is coming soon', () => {
    show('cv');
    expect(screen.getByText('Currículo em breve')).toBeInTheDocument();
  });

  it('Trash shows its fixed items', () => {
    show('trash');
    expect(screen.getAllByRole('listitem').length).toBeGreaterThanOrEqual(2);
  });
});
