import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

const saveProjects = vi.fn().mockResolvedValue({ ok: true });
vi.mock('@/app/admin/actions', () => ({
  saveProjects,
  deleteProjectRow: vi.fn(),
  refreshGithub: vi.fn(),
  uploadImage: vi.fn(),
}));
const { ProjectsForm } = await import('@/app/admin/ProjectsForm');

const repo = { id: 1, name: 'api', description: 'desc', html_url: 'https://github.com/x/api', homepage: null, language: null, topics: [], stargazers_count: 0, fork: false, archived: false, pushed_at: '' };
const row = { repo_id: 1, visible: true, sort: 0, description: null, demo_url: null, cover_url: null };

describe('ProjectsForm', () => {
  it('keeps spaces while typing and trims/nullifies only on save', async () => {
    render(<ProjectsForm initial={[{ repo, row }]} />);
    const input = screen.getByLabelText(/Descrição/);
    fireEvent.change(input, { target: { value: 'Meu ' } });
    expect(input).toHaveValue('Meu ');
    fireEvent.change(input, { target: { value: 'Meu projeto ' } });
    const demo = screen.getByLabelText(/Demo/);
    fireEvent.change(demo, { target: { value: '   ' } });
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await vi.waitFor(() => expect(saveProjects).toHaveBeenCalled());
    expect(saveProjects.mock.calls[0][0][0]).toMatchObject({ description: 'Meu projeto', demo_url: null });
  });
});

const mk = (id: number, name: string, extra: Partial<typeof repo> = {}) => ({ ...repo, id, name, html_url: `https://github.com/x/${name}`, ...extra });

describe('ProjectsForm visibility', () => {
  it('repos without saved settings start visible, except forks and archived', () => {
    render(<ProjectsForm initial={[{ repo: mk(1, 'app'), row: null }, { repo: mk(2, 'fork', { fork: true }), row: null }]} />);
    expect(screen.getByRole('switch', { name: 'Exibir app no site' })).toHaveAttribute('aria-checked', 'true');
    expect(screen.getByRole('switch', { name: 'Exibir fork no site' })).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('1 visível · 1 oculto')).toBeInTheDocument();
  });

  it('filters hidden repos and saves a hidden choice for every repo in order', async () => {
    saveProjects.mockClear();
    render(<ProjectsForm initial={[{ repo: mk(1, 'app'), row: null }, { repo: mk(2, 'site'), row: null }]} />);
    fireEvent.click(screen.getByRole('switch', { name: 'Exibir site no site' }));
    fireEvent.click(screen.getByRole('button', { name: /^Ocultos/ }));
    expect(screen.queryByRole('switch', { name: 'Exibir app no site' })).not.toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'Exibir site no site' })).toHaveAttribute('aria-checked', 'false');
    fireEvent.click(screen.getByRole('button', { name: 'Salvar' }));
    await vi.waitFor(() => expect(saveProjects).toHaveBeenCalled());
    expect(saveProjects.mock.calls[0][0].map((r: { repo_id: number; visible: boolean }) => [r.repo_id, r.visible])).toEqual([
      [1, true],
      [2, false],
    ]);
  });
});
