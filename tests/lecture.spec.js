import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

test('Lire : textes du parcours recensés par niveau', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'entrainer'; });
  await page.click('[data-xtile="lire"]');
  await expect(page.locator('#v-x-lire h1')).toHaveText('Lire');
  const total = await page.locator('.xtexts li').count();
  expect(total).toBe(await page.evaluate(() => ['N4', 'N3', 'N2'].flatMap(regularOf).filter((n) => UNITS[n] && UNITS[n].reading).length));
  await page.locator('.xread[open] .xtexts a').first().click();
  await expect(page.locator('#v-unite')).toHaveClass(/\bon\b/);
  expect(errors).toEqual([]);
});

test('lecture personnelle : analyse, dictionnaire, résumé, persistance, suppression', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'lire'; });
  await page.fill('#xlf [name=title]', '経済のニュース');
  await page.fill('#xlf [name=source]', 'Test');
  await page.fill('#xlf [name=pub]', '2026-11-03');
  await page.fill('#xlf [name=text]', '経済の回復は予想より遅れている。雨が降っていたので、家で本を読んでいた。');
  await page.check('#xlf [name=news]');
  await page.click('#xlf button[type=submit]');
  await expect(page.locator('.xrtitle')).toHaveText('経済のニュース');
  await expect(page.locator('.xmeta').filter({ hasText: 'Actualité' })).toBeVisible();
  // un mot conjugué renvoie à sa forme de dictionnaire
  await expect(page.locator('.xtextbox .w[data-w="遅れる"]')).toBeVisible();
  await page.locator('.xtextbox .w[data-w="遅れる"]').click();
  await expect(page.locator('#wpop')).toHaveClass(/\bon\b/);
  await expect(page.locator('#wpop .pw')).toHaveText('遅れる');
  await page.keyboard.press('Escape');
  await page.fill('#xsum', 'La reprise économique est plus lente que prévu.');
  await page.click('#xsave');
  await expect(page.locator('#xmsg')).toHaveText('Enregistré.');
  await noHorizontalOverflow(page);
  await page.reload();
  await expect(page.locator('#xsum')).toHaveValue('La reprise économique est plus lente que prévu.');
  await page.click('#xdel');
  await page.click('#xdy');
  await expect(page.locator('#v-x-lire')).toHaveClass(/\bon\b/);
  expect(await page.evaluate(() => KX.local.get('lectures', []).length)).toBe(0);
  expect(errors).toEqual([]);
});

test('lecture : aucun HTML injecté par le titre, le texte ou l’adresse', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { window.__pwn = 0; location.hash = 'lire'; });
  await page.fill('#xlf [name=title]', '<img src=x onerror="window.__pwn=1">');
  await page.fill('#xlf [name=text]', '日本{<img src=x onerror="window.__pwn=2">}語の<script>window.__pwn=3</script>本');
  await page.fill('#xlf [name=url]', 'javascript:alert(1)');
  await page.click('#xlf button[type=submit]');
  await expect(page.locator('#v-x-lire')).toHaveClass(/\bon\b/);   // adresse refusée
  await page.fill('#xlf [name=url]', 'https://example.com/"><img src=x onerror="window.__pwn=4">');
  await page.click('#xlf button[type=submit]');
  await expect(page.locator('.xtextbox')).toBeVisible();
  await page.waitForTimeout(300);
  expect(await page.evaluate(() => window.__pwn)).toBe(0);
  expect(await page.locator('.xtextbox img, .xtextbox script, .xrtitle img').count()).toBe(0);
  expect(errors).toEqual([]);
});
