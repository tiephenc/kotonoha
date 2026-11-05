import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

const GAMES = ['etang', 'sable', 'musique', 'pinceau', 'ricochets', 'rizieres', 'lucioles', 'souffle'];

test('salle lofi : écran principal, scène, séquenceur, lecture et sauvegarde, sans son automatique', async ({ page }) => {
  const errors = await isolate(page);
  await page.addInitScript(() => { window.__ac = 0; const C = window.AudioContext; if (C) window.AudioContext = class extends C { constructor(...a) { super(...a); window.__ac++; } }; });
  await onboard(page);
  await page.click('nav.main a[data-tab="detente"]');
  await expect(page.locator('#v-x-detente .xlofi-over h1')).toContainText('Salle lofi');
  await expect(page.locator('.xlofi-scene canvas')).toBeVisible();
  await expect(page.locator('.xlcell')).toHaveCount(13 * 16);
  expect(await page.evaluate(() => window.__ac)).toBe(0);
  const c = page.locator('.xlcell[data-r="m0"][data-s="1"]');
  await c.click();
  await expect(c).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => KX.lofi.state().cur.grid.m0[1])).toBe(1);
  await page.click('#xlplay');
  await expect(page.locator('#xlplay')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => document.querySelectorAll('.xlcell.now').length)).toBeGreaterThan(0);
  await page.click('#xlplay');
  await expect(page.locator('#xlplay')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('#v-x-detente [data-bar="0"]').selectOption('Am7');
  await page.click('[data-save="1"]');
  await page.click('#xlclear');
  await expect(page.locator('.xlcell[aria-pressed="true"]')).toHaveCount(0);
  await page.click('[data-load="1"]');
  await expect(page.locator('.xlcell[data-r="m0"][data-s="1"]')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#v-x-detente [data-bar="0"]')).toHaveValue('Am7');
  await page.reload();
  await expect(page.locator('.xlcell[data-r="m0"][data-s="1"]')).toHaveAttribute('aria-pressed', 'true');
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('jeux : un hub simple, sans durée ni chronomètre', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'detente'; });
  await page.click('section.view.on > .xsub a[href="#detente-jeux"]');
  await expect(page.locator('#v-x-detente-jeux .xgame')).toHaveCount(8);
  await expect(page.locator('input[name=xdur]')).toHaveCount(0);
  await page.click('.xgame[data-g="souffle"]');
  await expect(page.locator('#xstage')).toBeVisible();
  await expect(page.locator('.xclock, .xend')).toHaveCount(0);
  await page.click('.xquit');
  await expect(page.locator('#v-x-detente-jeux')).toHaveClass(/\bon\b/);
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
    if (g === 'musique') { const c = page.locator('.xcellm[data-r="0"][data-c="1"]'); await c.click(); await expect(c).toHaveAttribute('aria-pressed', 'true'); await page.click('#xplay'); await expect(page.locator('#xplay')).toHaveAttribute('aria-pressed', 'true'); await page.click('#xplay'); }
    if (g === 'pinceau') { await page.click('#xenso'); await page.mouse.move(box.x + 120, box.y + 220); await page.mouse.down(); await page.mouse.move(box.x + 320, box.y + 260, { steps: 6 }); await page.mouse.up(); }
    if (g === 'etang') { await page.mouse.click(box.x + 200, box.y + 200); }
    if (g === 'ricochets') { await page.locator('#xstage').focus(); await page.keyboard.press('Space'); }
    if (g === 'souffle') { await expect(page.locator('.xphase')).not.toHaveText(''); }
    await noHorizontalOverflow(page);
    await page.keyboard.press('Escape');
    await expect(page.locator('#v-x-detente-jeux')).toHaveClass(/\bon\b/);
    expect(errors).toEqual([]);
  });
}

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
  await page.evaluate(() => { location.hash = 'detente'; }); await page.waitForTimeout(400);
  for (const g of GAMES) { await page.evaluate((x) => { location.hash = 'detente-' + x; }, g); await page.waitForTimeout(300); }
  expect(await page.evaluate(() => window.__ac)).toBe(0);
});

test('salle lofi : une sauvegarde piégée n’injecte rien', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => {
    const evil = '"><img src=x onerror="window.__pwn=1">';
    KX.local.set('lofi-vol', evil);
    KX.local.set('lofi', { cur: { grid: { m0: [evil] }, prog: [evil, 'Am7', 'Dm7', 'G7'], bpm: evil, swing: evil }, slots: [{ grid: {}, prog: [evil], bpm: evil }, null, null] });
    location.hash = 'detente';
  });
  await expect(page.locator('.xlofi-scene canvas')).toBeVisible();
  await page.reload();
  await expect(page.locator('.xlofi-scene canvas')).toBeVisible();
  await page.click('[data-load="0"]');
  expect(await page.locator('#v-x-detente img').count()).toBe(0);
  expect(await page.evaluate(() => window.__pwn)).toBeUndefined();
  await expect(page.locator('#xlvol')).toHaveValue('0');
  await expect(page.locator('#xlbpm')).toHaveValue('78');
  expect(errors).toEqual([]);
});
