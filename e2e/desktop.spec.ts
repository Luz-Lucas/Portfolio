import { test, expect } from '@playwright/test';

// movimento reduzido: abre direto na área de trabalho, sem a intro
test.use({ reducedMotion: 'reduce', launchOptions: { args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'] } });
test.skip(({ isMobile }) => isMobile, 'overlay no monitor só no desktop');

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-intro-phase]')).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 15_000 });
});

// A câmera final recua um pouco para a luminária e a caneca de café caberem no quadro (easter eggs).
test('desktop sits inside the monitor and covers ≥ 50% of the viewport height', async ({ page }) => {
  const box = await page.getByTestId('screen-overlay').boundingBox();
  expect(box!.height / 900).toBeGreaterThanOrEqual(0.5);
  await page.screenshot({ path: 'e2e/__screenshots__/desktop-in-monitor.png' });
});

test('apps open inside the monitor and "Tela cheia" fills the viewport', async ({ page }) => {
  await page.getByRole('list', { name: 'Área de trabalho' }).getByRole('button', { name: 'Projetos' }).click();
  await expect(page.getByRole('dialog', { name: 'Projetos' })).toBeVisible();
  const userSelect = await page.locator('.p3d-window-body').first().evaluate((el) => getComputedStyle(el).userSelect);
  expect(userSelect).toBe('text');
  for (const name of ['Minimizar', 'Maximizar', 'Fechar']) {
    const bg = await page.getByRole('dialog', { name: 'Projetos' }).getByRole('button', { name }).evaluate((el) => getComputedStyle(el).backgroundImage);
    expect(bg).toContain('data:image/svg+xml');
  }
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

test('portrait tablet: the monitor overlay fits inside the viewport', async ({ browser }) => {
  const ctx = await browser.newContext({ viewport: { width: 820, height: 1180 }, reducedMotion: 'reduce' });
  const page = await ctx.newPage();
  await page.goto('/');
  await expect(page.locator('[data-intro-phase]')).toHaveAttribute('data-intro-phase', 'desktop', { timeout: 30_000 });
  await expect(page.locator('[data-fallback]')).toHaveCount(0);
  const box = (await page.getByTestId('screen-overlay').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(820);
  await ctx.close();
});

test('start menu: "Luz95" sits at the bottom of the side banner', async ({ page }) => {
  await page.getByRole('button', { name: 'Iniciar' }).click();
  const banner = await page.locator('.p3d-start-banner').boundingBox();
  const text = await page.locator('.p3d-start-banner span').boundingBox();
  expect(banner!.y + banner!.height - (text!.y + text!.height)).toBeLessThan(14);
  expect(text!.y - banner!.y).toBeGreaterThan(banner!.height / 2);
});
