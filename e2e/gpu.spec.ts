import { test, expect } from '@playwright/test';
import sharp from 'sharp';

// Precisa de GPU de verdade (o SwiftShader não reproduz). Rode com: E2E_GPU=1 npx playwright test gpu
test.skip(!process.env.E2E_GPU, 'só com GPU real (E2E_GPU=1)');
test.skip(({ isMobile }) => isMobile, 'cena 3D só no desktop');
test.use({ launchOptions: { args: ['--use-angle=d3d11', '--enable-gpu', '--ignore-gpu-blocklist'] } });

for (const dsf of [1, 1.25, 1.5])
  test(`the whole scene renders on a real GPU (device scale ${dsf})`, async ({ browser }) => {
    const ctx = await browser.newContext({ baseURL: 'http://localhost:3000', viewport: { width: 1755, height: 966 }, deviceScaleFactor: dsf });
    const page = await ctx.newPage();
    await page.goto('/');
    await expect(page.locator('[data-intro-phase="desktop"]')).toBeVisible({ timeout: 40_000 });
    await page.waitForTimeout(1500);
    const { data, info } = await sharp(await page.screenshot()).raw().toBuffer({ resolveWithObject: true });
    const lum = (fx: number, fy: number) => {
      const i = (Math.floor(info.height * fy) * info.width + Math.floor(info.width * fx)) * info.channels;
      return data[i] + data[i + 1] + data[i + 2];
    };
    // estante (direita) e moldura do monitor (embaixo): com o bug, tudo à direita da faixa esquerda saía preto
    expect(Math.max(lum(0.8, 0.3), lum(0.55, 0.9), lum(0.7, 0.88))).toBeGreaterThan(60);
    await ctx.close();
  });
