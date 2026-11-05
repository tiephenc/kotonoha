import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

// Modules 1 et 2 terminés (unités 1 à 12), le module 3 commencé : l'étape en cours est la 3e.
const seed = (page) => page.evaluate(() => {
  for (let n = 1; n <= 14; n++) { const s = uState(n); s.done = { grammaire: true, entrainement: true, vocabulaire: true, kanji: true, lecture: true, ecoute: true, test: true }; s.best = 88; s.at = Date.now() - (20 - n) * 864e5; }
  save();
});

test('chemin : carte, trois états, historique, leçon en cours, étapes verrouillées inertes', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await seed(page);
  await page.evaluate(() => { location.hash = 'chemin'; });
  await expect(page.locator('.xch-st')).toHaveCount(32);
  await expect(page.locator('.xch-st.s-done')).toHaveCount(2);
  await expect(page.locator('.xch-st.s-cur')).toHaveCount(1);
  await expect(page.locator('.xch-st.s-cur')).toHaveAttribute('data-i', '2');
  await expect(page.locator('.xch-st.s-lock')).toHaveCount(29);
  await expect(page.locator('.xch-hero canvas')).toBeVisible();
  await expect(page.locator('section.view.on > .xsub a[aria-current="page"]')).toHaveText('Le chemin');
  // Étape terminée : historique
  await page.click('.xch-st[data-i="0"]');
  await expect(page.locator('#xchinfo h2')).toHaveText('Fondations');
  await expect(page.locator('#xchinfo')).toContainText('Terminée');
  await expect(page.locator('#xchinfo .xch-units li.ok')).toHaveCount(6);
  // Étape verrouillée : aucune navigation
  await expect(page.locator('.xch-st[data-i="10"]')).toBeDisabled();
  await page.locator('.xch-st[data-i="10"]').dispatchEvent('click');
  await expect(page.locator('#xchinfo h2')).toHaveText('Encore dans la brume');
  await expect(page.locator('#v-x-chemin')).toHaveClass(/\bon\b/);
  // Étape en cours : accès à la leçon
  await page.click('.xch-st[data-i="2"]');
  await page.click('#xchinfo .btn');
  await expect(page.locator('#v-unite')).toHaveClass(/\bon\b/);
  expect(page.url()).toMatch(/#unite-1[3-8]/);
  await page.evaluate(() => { location.hash = 'chemin'; });
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('chemin : XP réelle, jamais comptée deux fois, jamais en baisse', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await seed(page);
  const r1 = await page.evaluate(() => KX.chemin.syncXP());
  expect(r1.total).toBeGreaterThan(0);
  // Recalculer ne rapporte rien
  const r2 = await page.evaluate(() => KX.chemin.syncXP());
  expect(r2.total).toBe(r1.total); expect(r2.added).toBe(0);
  // Rejouer une section déjà faite ne rapporte rien
  const r3 = await page.evaluate(() => { markDone(1, 'grammaire'); markDone(1, 'test'); return KX.chemin.syncXP(); });
  expect(r3.total).toBe(r1.total);
  // Exercices : au plus 20 bonnes réponses comptées par unité et par compétence
  const r4 = await page.evaluate(() => { S.log = S.log || []; for (let i = 0; i < 50; i++) S.log.push([Date.now(), 5, 'grammaire', 1]); save(); return KX.chemin.syncXP(); });
  expect(r4.total - r3.total).toBeLessThanOrEqual(20);
  // Journal tronqué : le total ne baisse pas
  const r5 = await page.evaluate(() => { S.log = []; save(); return KX.chemin.syncXP(); });
  expect(r5.total).toBe(r4.total);
  // Révisions régulières : une seule fois par jour
  const r6 = await page.evaluate(() => { S.rh[KX.dayKey()] = 25; save(); const a = KX.chemin.syncXP(); S.rh[KX.dayKey()] = 60; save(); const b = KX.chemin.syncXP(); return [a.total, b.total]; });
  expect(r6[0] - r5.total).toBe(15); expect(r6[1]).toBe(r6[0]);
  // Le niveau suit le barème annoncé : 100 × N XP pour passer du niveau N au suivant
  const lv = await page.evaluate(() => [KX.chemin.level(0).l, KX.chemin.level(99).l, KX.chemin.level(100).l, KX.chemin.level(300).l]);
  expect(lv).toEqual([1, 1, 2, 3]);
  // Persistance du registre
  await page.reload();
  expect(await page.evaluate(() => KX.chemin.syncXP().total)).toBe(r6[1]);
  expect(errors).toEqual([]);
});

test('chemin : le voyageur avance jusqu’à l’étape en cours et sa position est enregistrée', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await seed(page);
  await page.evaluate(() => { KX.st().chemin = { at: 0 }; save(); location.hash = 'chemin'; });
  await expect(page.locator('.xch-hero')).toHaveClass(/walking/);
  await expect.poll(() => page.evaluate(() => KX.st().chemin.at), { timeout: 10000 }).toBe(2);
  await expect(page.locator('.xch-hero')).not.toHaveClass(/walking/);
  await page.reload();
  expect(await page.evaluate(() => KX.st().chemin.at)).toBe(2);
  await expect(page.locator('.xch-hero')).not.toHaveClass(/walking/);
  expect(errors).toEqual([]);
});
