import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Projects } from '@/desktop/apps/Projects';
import { SEED_PROJECTS } from '@/content/seed';

const github = 'https://github.com/eu';

describe('Projects', () => {
  it('lists projects as folder items in the given order', () => {
    render(<Projects projects={SEED_PROJECTS} githubUrl={github} />);
    expect(screen.getAllByRole('button', { name: /^Abrir / }).map((b) => b.textContent)).toEqual(
      SEED_PROJECTS.map((p) => p.name),
    );
    expect(screen.getByText('3 objeto(s)')).toBeInTheDocument();
  });

  it('opens details with links, then goes back', () => {
    render(<Projects projects={SEED_PROJECTS} githubUrl={github} />);
    const p = SEED_PROJECTS[1];
    fireEvent.click(screen.getByRole('button', { name: `Abrir ${p.name}` }));
    expect(screen.getByText(p.description)).toBeInTheDocument();
    expect(screen.getByText(`★ ${p.stars}`)).toBeInTheDocument();
    for (const lang of p.languages) expect(screen.getByText(lang)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Ver no GitHub' })).toHaveAttribute('href', p.url);
    expect(screen.getByRole('link', { name: 'Demo' })).toHaveAttribute('href', p.demoUrl);
    expect(screen.getByText(`C:\\Projetos\\${p.name}`)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Voltar' }));
    expect(screen.getAllByRole('button', { name: /^Abrir / })).toHaveLength(3);
  });

  it('hides demo and cover when absent, shows cover when present', () => {
    const p = { ...SEED_PROJECTS[0], demoUrl: null, coverUrl: null };
    const { unmount } = render(<Projects projects={[p]} githubUrl={github} />);
    fireEvent.click(screen.getByRole('button', { name: `Abrir ${p.name}` }));
    expect(screen.queryByRole('link', { name: 'Demo' })).not.toBeInTheDocument();
    expect(screen.queryByRole('img', { name: `Capa de ${p.name}` })).not.toBeInTheDocument();
    unmount();
    render(<Projects projects={[{ ...p, coverUrl: '/capa.png' }]} githubUrl={github} />);
    fireEvent.click(screen.getByRole('button', { name: `Abrir ${p.name}` }));
    expect(screen.getByRole('img', { name: `Capa de ${p.name}` })).toHaveAttribute('src', '/capa.png');
  });

  it('shows a friendly message and the GitHub profile when loading failed', () => {
    render(<Projects projects={{ error: 'github_unavailable' }} githubUrl={github} />);
    expect(screen.getByText('Não foi possível carregar os projetos agora.')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /GitHub/ })).toHaveAttribute('href', github);
  });

  it('shows an empty state', () => {
    render(<Projects projects={[]} githubUrl={github} />);
    expect(screen.getByText('Nenhum projeto publicado ainda.')).toBeInTheDocument();
  });
});
