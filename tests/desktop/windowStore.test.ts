import { beforeEach, describe, expect, it } from 'vitest';
import { useWindowStore } from '@/desktop/windowStore';

const s = () => useWindowStore.getState();

describe('windowStore', () => {
  beforeEach(() => s().reset());

  it('open adds a focused window on top', () => {
    s().open('readme');
    s().open('about');
    const about = s().windows.find((w) => w.id === 'about')!;
    const readme = s().windows.find((w) => w.id === 'readme')!;
    expect(s().focusedId).toBe('about');
    expect(about.z).toBeGreaterThan(readme.z);
  });

  it('opening an already open app focuses and restores it instead of duplicating', () => {
    s().open('about');
    s().minimize('about');
    s().open('readme');
    s().open('about');
    expect(s().windows.filter((w) => w.id === 'about')).toHaveLength(1);
    expect(s().windows.find((w) => w.id === 'about')!.minimized).toBe(false);
    expect(s().focusedId).toBe('about');
  });

  it('close removes the window and focuses the highest remaining', () => {
    s().open('readme');
    s().open('about');
    s().open('skills');
    s().focus('readme');
    s().close('readme');
    expect(s().windows.map((w) => w.id)).not.toContain('readme');
    expect(s().focusedId).toBe('skills');
    s().close('skills');
    s().close('about');
    expect(s().focusedId).toBeNull();
  });

  it('minimize hides the window and moves focus away', () => {
    s().open('readme');
    s().open('about');
    s().minimize('about');
    expect(s().windows.find((w) => w.id === 'about')!.minimized).toBe(true);
    expect(s().focusedId).toBe('readme');
  });

  it('cascades new windows by 24px', () => {
    s().open('readme');
    s().open('about');
    const [a, b] = s().windows;
    expect(b.x - a.x).toBe(24);
    expect(b.y - a.y).toBe(24);
  });

  it('exclusive open minimizes the other windows', () => {
    s().open('readme');
    s().open('about', { exclusive: true });
    expect(s().windows.find((w) => w.id === 'readme')!.minimized).toBe(true);
    expect(s().focusedId).toBe('about');
  });

  it('toggleMaximize and move update the window', () => {
    s().open('about');
    s().toggleMaximize('about');
    s().move('about', 50, 60);
    const w = s().windows[0];
    expect(w.maximized).toBe(true);
    expect([w.x, w.y]).toEqual([50, 60]);
  });
});
