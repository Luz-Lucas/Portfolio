import { beforeEach, describe, expect, it } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { Window } from '@/desktop/Window';
import { useWindowStore } from '@/desktop/windowStore';

const s = () => useWindowStore.getState();
const win = () => s().windows.find((w) => w.id === 'about')!;

function setup(draggable = true) {
  s().reset();
  s().open('readme');
  s().open('about');
  render(
    <Window id="about" title="Sobre mim" draggable={draggable}>
      conteúdo
    </Window>,
  );
}

describe('Window', () => {
  beforeEach(() => s().reset());

  it('title bar buttons close, minimize and maximize', () => {
    setup();
    fireEvent.click(screen.getByRole('button', { name: 'Maximizar' }));
    expect(win().maximized).toBe(true);
    fireEvent.click(screen.getByRole('button', { name: 'Minimizar' }));
    expect(win().minimized).toBe(true);
    act(() => s().open('about'));
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }));
    expect(s().windows.find((w) => w.id === 'about')).toBeUndefined();
  });

  it('mousedown on the window focuses it', () => {
    setup();
    s().focus('readme');
    fireEvent.mouseDown(screen.getByText('conteúdo'));
    expect(s().focusedId).toBe('about');
  });

  it('dragging the title bar moves the window', () => {
    setup();
    const { x, y } = win();
    const bar = screen.getByText('Sobre mim');
    fireEvent.pointerDown(bar, { clientX: 100, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientX: 150, clientY: 130, pointerId: 1 });
    fireEvent.pointerUp(bar, { clientX: 150, clientY: 130, pointerId: 1 });
    expect([win().x, win().y]).toEqual([x + 50, y + 30]);
  });

  it('does not move when draggable is false', () => {
    setup(false);
    const { x, y } = win();
    const bar = screen.getByText('Sobre mim');
    fireEvent.pointerDown(bar, { clientX: 100, clientY: 100, pointerId: 1, button: 0 });
    fireEvent.pointerMove(bar, { clientX: 150, clientY: 130, pointerId: 1 });
    fireEvent.pointerUp(bar, { pointerId: 1 });
    expect([win().x, win().y]).toEqual([x, y]);
  });
});
