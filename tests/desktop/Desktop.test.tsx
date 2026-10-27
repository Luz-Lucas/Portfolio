import { beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen, within } from '@testing-library/react';
import { Desktop } from '@/desktop/Desktop';
import { useWindowStore } from '@/desktop/windowStore';
import { SEED_CONTENT } from '@/content/seed';
import { MORE_LIGHT_EVENT } from '@/lib/lamp';
import { TEST_PROJECTS as SEED_PROJECTS } from '../fixtures/content';

const TITLES = [
  'Leia-me.txt',
  'Sobre mim',
  'Projetos',
  'Skills',
  'Experiência',
  'Currículo.pdf',
  'Contato',
  'Prompt de comando',
  'Lixeira',
];

function renderDesktop(mode: 'scene' | 'mobile' = 'scene') {
  return render(<Desktop content={SEED_CONTENT} projects={SEED_PROJECTS} mode={mode} />);
}

const icons = () => within(screen.getByRole('list', { name: 'Área de trabalho' }));
const taskbar = () => within(screen.getByRole('toolbar', { name: 'Barra de tarefas' }));

describe('Desktop', () => {
  beforeEach(() => {
    useWindowStore.getState().reset();
    localStorage.setItem('p3d:readme-seen', '1');
  });

  it('renders the nine icons in order as buttons', () => {
    renderDesktop();
    expect(icons().getAllByRole('button').map((b) => b.textContent)).toEqual(TITLES);
  });

  it('opens an app with a single click', () => {
    renderDesktop();
    fireEvent.click(icons().getByRole('button', { name: 'Sobre mim' }));
    expect(screen.getByRole('dialog', { name: 'Sobre mim' })).toBeInTheDocument();
  });

  it('taskbar buttons minimize the focused window and restore a minimized one', () => {
    renderDesktop();
    fireEvent.click(icons().getByRole('button', { name: 'Sobre mim' }));
    const tb = taskbar().getByRole('button', { name: 'Sobre mim' });
    fireEvent.click(tb);
    expect(screen.queryByRole('dialog', { name: 'Sobre mim' })).not.toBeInTheDocument();
    fireEvent.click(tb);
    expect(screen.getByRole('dialog', { name: 'Sobre mim' })).toBeInTheDocument();
  });

  it('start menu lists the apps, opens one and closes; Escape closes it', () => {
    renderDesktop();
    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    const menu = within(screen.getByRole('menu'));
    expect(menu.getAllByRole('menuitem').map((m) => m.textContent)).toEqual(TITLES);
    fireEvent.click(menu.getByRole('menuitem', { name: 'Skills' }));
    expect(screen.getByRole('dialog', { name: 'Skills' })).toBeInTheDocument();
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Iniciar' }));
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
  });

  it('opens the readme on first visit and remembers it', () => {
    localStorage.removeItem('p3d:readme-seen');
    renderDesktop();
    expect(screen.getByRole('dialog', { name: 'Leia-me.txt' })).toBeInTheDocument();
    expect(localStorage.getItem('p3d:readme-seen')).toBe('1');
  });

  it('does not open the readme when already seen', () => {
    renderDesktop();
    expect(screen.queryByRole('dialog', { name: 'Leia-me.txt' })).not.toBeInTheDocument();
  });

  it('shows the clock as HH:MM', () => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(new Date(2026, 9, 26, 9, 5));
    renderDesktop();
    expect(screen.getByRole('button', { name: /Relógio/ })).toHaveTextContent('09:05');
    vi.useRealTimers();
  });

  it('mobile mode opens maximized, one window at a time, not draggable', () => {
    renderDesktop('mobile');
    fireEvent.click(icons().getByRole('button', { name: 'Sobre mim' }));
    fireEvent.click(icons().getByRole('button', { name: 'Skills' }));
    expect(screen.queryByRole('dialog', { name: 'Sobre mim' })).not.toBeInTheDocument();
    const skills = useWindowStore.getState().windows.find((w) => w.id === 'skills')!;
    expect(skills.maximized).toBe(true);
    const before = { x: skills.x, y: skills.y };
    const bar = within(screen.getByRole('dialog', { name: 'Skills' })).getByText('Skills');
    fireEvent.pointerDown(bar, { clientX: 10, clientY: 10, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientX: 90, clientY: 90, pointerId: 1 });
    const after = useWindowStore.getState().windows.find((w) => w.id === 'skills')!;
    expect({ x: after.x, y: after.y }).toEqual(before);
  });
});

describe('Desktop with GitHub unavailable', () => {
  it('still renders and the Projects window shows the friendly message', () => {
    useWindowStore.getState().reset();
    localStorage.setItem('p3d:readme-seen', '1');
    render(<Desktop content={SEED_CONTENT} projects={{ error: 'github_unavailable' }} mode="scene" />);
    fireEvent.click(icons().getByRole('button', { name: 'Projetos' }));
    expect(screen.getByText('Não foi possível carregar os projetos agora.')).toBeInTheDocument();
  });
});

describe('Desktop mobile first visit', () => {
  it('opens the readme maximized on mobile', () => {
    useWindowStore.getState().reset();
    localStorage.removeItem('p3d:readme-seen');
    render(<Desktop content={SEED_CONTENT} projects={SEED_PROJECTS} mode="mobile" />);
    expect(useWindowStore.getState().windows.find((w) => w.id === 'readme')?.maximized).toBe(true);
    useWindowStore.getState().setMode('scene');
  });

  it('lamp easter egg: flickers the screen and suggests a bit more Luz', () => {
    renderDesktop();
    act(() => {
      window.dispatchEvent(new Event(MORE_LIGHT_EVENT));
    });
    expect(document.querySelector('.p3d-desktop')).toHaveClass('is-flicker');
    const box = screen.getByRole('alertdialog', { name: 'Luz 95' });
    expect(box).toHaveTextContent('Talvez você precise de um pouco mais de Luz');
    fireEvent.click(within(box).getByRole('button', { name: 'OK' }));
    expect(screen.queryByRole('alertdialog', { name: 'Luz 95' })).not.toBeInTheDocument();
  });
});
