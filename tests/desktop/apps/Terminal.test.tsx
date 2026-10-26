import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { Terminal } from '@/desktop/apps/Terminal';
import { useWindowStore } from '@/desktop/windowStore';
import { TEST_CONTENT as SEED_CONTENT, TEST_PROJECTS as SEED_PROJECTS } from '../../fixtures/content';

const type = (value: string) => {
  const input = screen.getByRole('textbox', { name: 'Comando' });
  fireEvent.change(input, { target: { value } });
  fireEvent.keyDown(input, { key: 'Enter' });
};

describe('Terminal', () => {
  beforeEach(() => {
    useWindowStore.getState().reset();
    render(<Terminal content={SEED_CONTENT} projects={SEED_PROJECTS} />);
  });

  it('focuses the input and prints command output', () => {
    expect(screen.getByRole('textbox', { name: 'Comando' })).toHaveFocus();
    type('whoami');
    expect(screen.getByText(`${SEED_CONTENT.about.name} — ${SEED_CONTENT.about.role}`)).toBeInTheDocument();
  });

  it('abrir opens the app window', () => {
    type('abrir skills');
    expect(useWindowStore.getState().focusedId).toBe('skills');
  });

  it('cls clears the screen', () => {
    type('whoami');
    type('cls');
    expect(screen.queryByText(`${SEED_CONTENT.about.name} — ${SEED_CONTENT.about.role}`)).not.toBeInTheDocument();
  });

  it('arrow up recalls the previous command', () => {
    type('help');
    const input = screen.getByRole('textbox', { name: 'Comando' });
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(input).toHaveValue('help');
  });
});
