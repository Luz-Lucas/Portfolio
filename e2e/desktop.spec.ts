import { test, expect } from '@playwright/test';

test.use({ launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });
test.skip(({ isMobile }) => isMobile, 'overlay no monitor só no desktop');

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('p3d:intro-seen', '1');
    localStorage.setItem('p3d:readme-seen', '1');
  });
  await page.goto('/');
  await expect(page.locator('[data-intro-phase]')).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 15_000 });
});

test('desktop sits inside the monitor and covers ≥ 60% of the viewport height', async ({ page }) => {
  const box = await page.getByTestId('screen-overlay').boundingBox();
  expect(box!.height / 900).toBeGreaterThanOrEqual(0.6);
  await page.screenshot({ path: 'e2e/__screenshots__/desktop-in-monitor.png' });
});

test('apps open inside the monitor and "Tela cheia" fills the viewport', async ({ page }) => {
  await page.getByRole('list', { name: 'Área de trabalho' }).getByRole('button', { name: 'Projetos' }).click();
  await expect(page.getByRole('dialog', { name: 'Projetos' })).toBeVisible();
  const userSelect = await page.locator('.p3d-window-body').first().evaluate((el) => getComputedStyle(el).userSelect);
  expect(userSelect).toBe('text');
  await page.getByRole('button', { name: 'Tela cheia' }).click();
  const box = await page.getByTestId('screen-overlay').boundingBox();
  expect(box).toMatchObject({ x: 0, y: 0, width: 1440, height: 900 });
  await page.getByRole('button', { name: 'Voltar ao monitor' }).click();
});

test('mobile-size fallback: no glb and no three.js below 768px', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 } });
  const page = await ctx.newPage();
  const glb: string[] = [];
  const threeChunks: string[] = [];
  page.on('request', (r) => r.url().endsWith('.glb') && glb.push(r.url()));
  page.on('response', async (r) => {
    if (!r.url().endsWith('.js')) return;
    const body = await r.text().catch(() => '');
    if (body.includes('WebGLRenderer') || body.includes('MeshBasicMaterial')) threeChunks.push(r.url());
  });
  await page.goto('/');
  await expect(page.locator('[data-intro-phase]')).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 15_000 });
  await page.waitForLoadState('networkidle');
  expect(glb).toEqual([]);
  expect(threeChunks).toEqual([]);
  await ctx.close();
});
