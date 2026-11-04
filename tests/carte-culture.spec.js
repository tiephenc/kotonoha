import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

test('carte : vue d’ensemble complète, version texte, accès par Progrès', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'progres'; });
  await page.click('[data-xtile="carte"]');
  await expect(page.locator('#v-x-carte h1')).toHaveText('Carte du parcours');
  const n = await page.evaluate(() => ['N4', 'N3', 'N2'].flatMap(regularOf).length);
  await expect(page.locator('#v-x-carte svg a.un')).toHaveCount(n);
  await noHorizontalOverflow(page);
  await page.locator('#v-x-carte svg a.un').first().click();
  await expect(page.locator('#v-x-carte-unite')).toHaveClass(/\bon\b/);
  expect(errors).toEqual([]);
});

test('carte d’une unité : grammaire, kanji, prérequis, liens, popup kanji', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'carte-60'; });
  await expect(page.locator('#v-x-carte-unite h1')).toBeVisible();
  const g = await page.evaluate(() => UNITS[60].grammar.length), k = await page.evaluate(() => UNITS[60].kanji.length);
  await expect(page.locator('.xfocus .nd.g')).toHaveCount(g);
  await expect(page.locator('.xfocus .nd.k')).toHaveCount(k);
  await expect(page.locator('#v-x-carte-unite')).toContainText('Avant : unité 59');
  await expect(page.locator('#v-x-carte-unite')).toContainText('Après : unité 61');
  await page.locator('.xfocus .nd.k').first().click();
  await expect(page.locator('#wpop')).toHaveClass(/\bon\b/);
  await page.keyboard.press('Escape');
  await page.setViewportSize({ width: 390, height: 844 });
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('culture : jours fériés calculés selon la loi, sources', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  const h = await page.evaluate(() => {
    const a = KX.culture.holidays(2026), b = KX.culture.holidays(2027), p = (m, k) => (m.get(k) || {}).j || null;
    return { seijin: p(a, '2026-01-12'), furikae: p(a, '2026-05-06'), kokumin: p(a, '2026-09-22'), keiro: p(a, '2026-09-21'), shubun27: p(b, '2027-03-21'), furikae27: p(b, '2027-03-22'), umi27: p(b, '2027-07-19'), n26: a.size };
  });
  expect(h.seijin).toContain('成人');
  expect(h.furikae).toContain('振替');
  expect(h.kokumin).toContain('国民');
  expect(h.keiro).toContain('敬老');
  expect(h.shubun27).toContain('春分');
  expect(h.furikae27).toContain('振替');
  expect(h.umi27).toContain('海');
  expect(h.n26).toBe(18);
  await page.evaluate(() => { location.hash = 'culture'; });
  await expect(page.locator('#v-x-culture h1')).toBeVisible();
  const links = await page.locator('#v-x-culture a[target=_blank]').evaluateAll((as) => as.map((a) => a.rel));
  expect(links.length).toBeGreaterThan(6);
  links.forEach((r) => expect(r).toContain('noopener'));
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});
