import { test, expect } from '@playwright/test';

test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });
test.skip(({ isMobile }) => isMobile, 'intro 3D só no desktop');

const phase = (page: import('@playwright/test').Page) => page.locator('[data-intro-phase]');

test('first visit reaches the desktop without third-party decoders', async ({ page }) => {
  const external: string[] = [];
  page.on('request', (r) => !r.url().startsWith('http://localhost') && !r.url().startsWith('data:') && !r.url().startsWith('blob:') && external.push(r.url()));
  await page.goto('/');
  await expect(phase(page)).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 15_000 });
  expect(external).toEqual([]);
  await expect(page.locator('[data-fallback]')).toHaveCount(0);
});

test('clicking during the BIOS skips to the desktop', async ({ page }) => {
  await page.goto('/');
  await expect(phase(page)).toHaveAttribute('data-intro-phase', 'bios', { timeout: 15_000 });
  await page.mouse.click(10, 10);
  await expect(phase(page)).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 500 });
});

test('second visit skips the intro', async ({ page }) => {
  await page.goto('/');
  await expect(phase(page)).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 15_000 });
  const seen: string[] = [];
  await page.exposeFunction('reportPhase', (p: string) => seen.push(p));
  await page.addInitScript(() => {
    new MutationObserver(() => {
      const p = document.querySelector<HTMLElement>('[data-intro-phase]')?.dataset.introPhase;
      if (p) (window as unknown as { reportPhase: (p: string) => void }).reportPhase(p);
    }).observe(document, { subtree: true, attributes: true, childList: true });
  });
  await page.reload();
  await expect(phase(page)).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 15_000 });
  expect(seen).not.toContain('bios');
});

test.describe('reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });
  test('never goes through the BIOS', async ({ page }) => {
    const seen: string[] = [];
    await page.exposeFunction('reportPhase', (p: string) => seen.push(p));
    await page.addInitScript(() => {
      new MutationObserver(() => {
        const p = document.querySelector<HTMLElement>('[data-intro-phase]')?.dataset.introPhase;
        if (p) (window as unknown as { reportPhase: (p: string) => void }).reportPhase(p);
      }).observe(document, { subtree: true, attributes: true, childList: true });
    });
    await page.goto('/');
    await expect(phase(page)).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 15_000 });
    expect(seen).not.toContain('bios');
  });
});
