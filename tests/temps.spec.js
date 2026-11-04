import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

const state = (page) => page.evaluate(() => JSON.parse(localStorage.getItem('kotonoha.progress.v1')));

test('temps actif : compté seulement avec interaction, distinct de la présence', async ({ page }) => {
  await page.clock.install();
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'unite-1'; });
  await expect(page.locator('#v-unite')).toHaveClass(/\bon\b/);
  const before = await page.evaluate(() => { const t = (S.x && S.x.t) || {}; return Object.values(t)[0] || [0, 0]; });
  await page.evaluate(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Shift', bubbles: true })));
  await page.clock.runFor(40_000);          // 40 s dont ~40 actives (dernière action < 60 s)
  await page.clock.runFor(120_000);         // 2 min sans action : présence seulement
  await page.evaluate(() => dispatchEvent(new Event('pagehide')));
  const now = await page.evaluate(() => Object.values(S.x.t)[0]);
  const active = now[0] - before[0], presence = now[1] - before[1];
  expect((await state(page)).x.t).toBeTruthy();   // enregistré dans la sauvegarde locale
  expect(active).toBeGreaterThanOrEqual(55);
  expect(active).toBeLessThanOrEqual(110);
  expect(presence).toBeGreaterThanOrEqual(150);
  expect(errors).toEqual([]);
});

test('calendrier : jours habituels, report, repos, pause, persistance', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'progres'; });
  await expect(page.locator('[data-xtile="cal"]')).toBeVisible();
  await page.click('[data-xtile="cal"]');
  await expect(page.locator('#v-x-calendrier h1')).toHaveText('Calendrier');
  // samedi devient un jour d'étude
  await page.check('[data-wd="6"]');
  expect((await state(page)).x.plan.days).toContain(6);
  // ajoute une pause
  await page.fill('#xpf input[name=from]', '2026-12-20');
  await page.fill('#xpf input[name=to]', '2027-01-03');
  await page.fill('#xpf input[name=label]', 'Vacances <b>');
  await page.click('#xpf button[type=submit]');
  await expect(page.locator('.xpauses li').first()).toContainText('Vacances <b>');
  // repos sur le premier jour cliquable du mois affiché
  const day = page.locator('.xc[data-k]').first();
  const k = await day.getAttribute('data-k');
  await day.click();
  await page.click('#xday [data-a="repos"]');
  expect((await state(page)).x.cal[k]).toBe('repos');
  await noHorizontalOverflow(page);
  await page.reload();
  await expect(page.locator('#v-x-calendrier')).toHaveClass(/\bon\b/);
  await expect(page.locator(`.xc[data-k="${k}"]`)).toHaveClass(/st-repos|st-faite/);
  expect(errors).toEqual([]);
});

test('maîtrise : états et réglage des hésitations', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'maitrise'; });
  await expect(page.locator('#v-x-maitrise .xmgrid').first()).toBeVisible();
  await expect(page.locator('#v-x-maitrise .xm')).toHaveCount(await page.evaluate(() => ['N4', 'N3', 'N2'].flatMap(regularOf).length));
  await page.uncheck('#xhes');
  expect((await state(page)).hes).toBe(false);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('révision : une longue hésitation raccourcit l’intervalle', async ({ page }) => {
  await page.clock.install();
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { unlockCards(1); save(); location.hash = 'revision'; });
  await expect(page.locator('#reveal')).toBeVisible();
  await page.clock.runFor(15_000);
  await page.click('#reveal');
  const id = await page.evaluate(() => queue[qi].id);
  await page.click('#back button[data-q="4"]');
  await page.clock.runFor(1000);
  const s = await page.evaluate((i) => S.srs[i], id);
  expect(s.hz).toBe(1);
  expect(s.t).toBeGreaterThan(14);
  expect(s.e).toBeCloseTo(2.35, 2); // « Bien » traité comme « Difficile » : facilité 2,5 → 2,35
  expect(errors).toEqual([]);
});
