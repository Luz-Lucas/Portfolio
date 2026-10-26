import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { ScreenOverlay } from '@/scene/ScreenOverlay';

const rect = { left: 100, top: 50, width: 640, height: 480 };

describe('ScreenOverlay', () => {
  it('keeps the desktop mounted (and its state) when toggling full screen', () => {
    const ui = (maximized: boolean) => (
      <ScreenOverlay rect={rect} maximized={maximized}>
        {() => <input aria-label="msg" />}
      </ScreenOverlay>
    );
    const { rerender } = render(ui(false));
    fireEvent.change(screen.getByLabelText('msg'), { target: { value: 'meio digitado' } });
    rerender(ui(true));
    expect(screen.getByLabelText('msg')).toHaveValue('meio digitado');
    rerender(ui(false));
    expect(screen.getByLabelText('msg')).toHaveValue('meio digitado');
  });
});
