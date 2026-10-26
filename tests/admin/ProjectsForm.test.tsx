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
