import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

const GAMES = ['sable', 'carillon', 'rizieres', 'lucioles', 'souffle'];

test('salon : accès depuis l’en-tête, durées, cinq expériences', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.click('#xdetbtn');
  await expect(page.locator('#v-x-detente h1')).toHaveText('Faire une vraie pause');
  await expect(page.locator('.xgame')).toHaveCount(5);
  await page.click('label:has(input[name=xdur][value=micro])');
  await expect(page.locator('input[name=xdur][value=micro]')).toBeChecked();
  expect(await page.evaluate(() => localStorage.getItem('kotonoha.detente.dur'))).toBe('"micro"');
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

for (const g of GAMES) {
  test(`expérience ${g} : s’ouvre, réagit, se quitte`, async ({ page }) => {
    const errors = await isolate(page);
    await onboard(page);
    await page.evaluate((x) => { location.hash = 'detente-' + x; }, g);
    const stage = page.locator('#xstage');
    await expect(stage).toBeVisible();
    const box = await stage.boundingBox();
    expect(box.height).toBeGreaterThan(300);
    if (g === 'sable') { await page.mouse.move(box.x + 100, box.y + 200); await page.mouse.down(); await page.mouse.move(box.x + 300, box.y + 260, { steps: 8 }); await page.mouse.up(); }
    if (g === 'carillon') { await page.click('.xrod[data-i="3"]'); await expect(page.locator('.xrod[data-i="3"]')).toHaveClass(/swing/); }
    if (g === 'souffle') { await expect(page.locator('.xphase')).not.toHaveText(''); }
    await noHorizontalOverflow(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#v-x-detente')).toHaveClass(/\bon\b/);
    expect(errors).toEqual([]);
  });
}

test('fin de durée : trois choix, prolonger, ressenti facultatif, retour à la séance', async ({ page }) => {
  await page.clock.install();
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'unite-1'; });
  await expect(page.locator('#v-unite')).toHaveClass(/\bon\b/);
  await page.evaluate(() => { localStorage.setItem('kotonoha.detente.dur', '"micro"'); location.hash = 'detente'; });
  await page.click('.xgame[data-g="souffle"]');
  await expect(page.locator('.xend')).toBeHidden();
  await page.clock.runFor(61_000);
  await expect(page.locator('.xend')).toBeVisible();
  await expect(page.locator('.xend')).toContainText('Retour à la séance');
  await expect(page.locator('.xend')).toContainText('Prolonger la pause');
  await expect(page.locator('.xend')).toContainText('Quitter');
  await page.click('#xmore');
  await expect(page.locator('.xend')).toBeHidden();
  await page.clock.runFor(61_000);
  await page.click('[data-feel="mieux"]');
  expect((await page.evaluate(() => KX.local.get('ressenti', []))).length).toBe(1);
  await page.click('#xback');
  await expect(page.locator('#v-unite')).toHaveClass(/\bon\b/);
  expect(errors).toEqual([]);
});

test('rizières : chaque grille générée est soluble (coups de pouce)', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'detente-rizieres'; });
  for (const n of [4, 6]) {
    await page.click(`[data-n="${n}"]`);
    await expect(page.locator('.xcell')).toHaveCount(n * n);
    for (let i = 0; i < n * n && !(await page.locator('.xriz.done').count()); i++) await page.click('#xhintb');
    await expect(page.locator('.xriz')).toHaveClass(/done/);
    await expect(page.locator('.xstatus')).toHaveText('Toutes les parcelles sont irriguées.');
  }
  // clavier : flèche puis Entrée tourne la parcelle voisine
  await page.click('#xnew');
  await page.locator('.xcell[data-i="0"]').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('.xcell[data-i="1"]')).toBeFocused();
  expect(errors).toEqual([]);
});

test('aucun son ne démarre sans action', async ({ page }) => {
  await isolate(page);
  await page.addInitScript(() => { window.__ac = 0; const C = window.AudioContext; if (C) window.AudioContext = class extends C { constructor(...a) { super(...a); window.__ac++; } }; });
  await onboard(page);
  for (const g of GAMES) { await page.evaluate((x) => { location.hash = 'detente-' + x; }, g); await page.waitForTimeout(300); }
  expect(await page.evaluate(() => window.__ac)).toBe(0);
});
