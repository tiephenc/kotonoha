import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

const seed = (page) => page.evaluate(() => {
  for (let n = 1; n <= 8; n++) { const s = uState(n); s.done = { grammaire: 1, entrainement: 1, vocabulaire: 1, kanji: 1, lecture: 1, ecoute: 1, test: 1 }; s.best = 85; s.at = Date.now() - n * 864e5; unlockCards(n); }
  S.g.rv = 150; S.rh = { [KX.dayKey(Date.now() - 864e5)]: 120 }; save();
});

test('accueil : carnet du jour, renard, mission, journal, voyage', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await expect(page.locator('.xhero h1')).toHaveText('Carnet du jour');
  await expect(page.locator('.xhero svg.fox')).toBeVisible();
  await expect(page.locator('.xstep')).toHaveCount(3);
  await expect(page.locator('.xjday')).toHaveCount(7);
  await expect(page.locator('.xvoyprev')).toBeVisible();
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('voyage : points réels, destination débloquée, trajet animé, souvenir, pas de malus', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await seed(page);
  await page.evaluate(() => { location.hash = 'voyage'; });
  await expect(page.locator('#xjp')).toBeVisible();
  const pts = await page.evaluate(() => KX.voyage.points().total);
  expect(pts).toBeGreaterThan(80);
  await expect(page.locator('.xplace[data-p="kamakura"]')).toHaveClass(/s-open/);
  await expect(page.locator('.xplace[data-p="sapporo"]')).toHaveClass(/s-locked/);
  await page.locator('.xplace[data-p="kamakura"]').focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#xvinfo h2')).toContainText('Kamakura');
  await page.click('#xgo');
  await expect(page.locator('.xplace[data-p="kamakura"]')).toHaveClass(/s-seen/, { timeout: 15000 });
  const v = await page.evaluate(() => S.x.voyage);
  expect(v.at).toBe('kamakura');
  await expect(page.locator('.xsouvc[data-p="kamakura"]')).toBeVisible();
  expect(await page.evaluate(() => KX.voyage.points().total)).toBeGreaterThanOrEqual(pts);
  await page.reload();
  await expect(page.locator('.xplace[data-p="kamakura"]')).toHaveClass(/s-seen/);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('kamon : migration des anciens badges sans perte, fiche sourcée', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { S.g.badges = { first: 1700000000000, s3: 1700100000000, r100: 1700200000000, m0: 1700300000000 }; delete S.g.kamon; delete S.g.kamonInit; S.g.rv = 120; save(); KX.kamon.sync(); });
  const st = await page.evaluate(() => ({ k: S.g.kamon, b: S.g.badges }));
  expect(st.b).toEqual({ first: 1700000000000, s3: 1700100000000, r100: 1700200000000, m0: 1700300000000 });
  expect(st.k.katabami).toBe(1700000000000);
  expect(st.k.kaji).toBe(1700100000000);
  expect(st.k.tomoe).toBe(1700200000000);
  await page.evaluate(() => { location.hash = 'kamon'; });
  await expect(page.locator('#v-x-kamon .xkmc')).toHaveCount(await page.evaluate(() => KX_KAMON.length));
  await page.evaluate(() => { location.hash = 'kamon-katabami'; });
  await expect(page.locator('.xkmfiche')).toContainText('Contexte historique');
  await expect(page.locator('.xkmfiche .kml').first()).toBeVisible();
  const links = await page.locator('.xkmfiche a[target=_blank]').evaluateAll((as) => as.map((a) => a.rel));
  expect(links.length).toBeGreaterThan(0);
  links.forEach((r) => expect(r).toContain('noopener'));
  const ok = await page.evaluate(() => KX_KAMON.every((k) => k.src.length && k.hist.length && k.recit.length && k.sens.length));
  expect(ok).toBe(true);
  expect(errors).toEqual([]);
});

test('progrès : journal hebdomadaire, visualisations réelles, carte mentale zoomable', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await seed(page);
  await page.evaluate(() => { location.hash = 'progres'; });
  await expect(page.locator('#v-progres .xjournal')).toBeVisible();
  await expect(page.locator('#v-progres [data-xvisu]')).toBeVisible();
  await expect(page.locator('#v-progres .xbars.c-rev .b')).toHaveCount(30);
  await page.click('#v-progres .xjournal [data-w="-1"]');
  await expect(page.locator('#v-progres .xjournal')).toHaveAttribute('data-off', '-1');
  await page.evaluate(() => { location.hash = 'carte'; });
  const vb0 = await page.locator('#v-x-carte .xmap svg').getAttribute('viewBox');
  await page.click('#v-x-carte [data-z="in"]');
  expect(await page.locator('#v-x-carte .xmap svg').getAttribute('viewBox')).not.toBe(vb0);
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('focus : ouverture, lanternes, retour à la séance, fermeture animée', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'unite-1'; });
  await expect(page.locator('#v-unite')).toHaveClass(/\bon\b/);
  await page.click('#focbtn');
  await expect(page.locator('#focpanel')).toHaveClass(/\bon\b/);
  await expect(page.locator('#focpanel .flant')).toBeVisible();
  await expect(page.locator('#focpanel .fside .famb')).toBeVisible();
  await page.click('#fback');
  await expect(page.locator('#focpanel')).not.toHaveClass(/\bon\b/);
  await expect(page.locator('#v-unite')).toHaveClass(/\bon\b/);
  expect(errors).toEqual([]);
});

test('leçon : panneau « Prolonger la leçon » et sujet d’écriture tiré de l’unité', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'unite-56'; });
  await expect(page.locator('#v-unite .xlesson')).toBeVisible();
  await expect(page.locator('#v-unite .xlesson a[href="#labo-u56"]')).toBeVisible();
  await page.click('#v-unite .xlesson a[href="#redaction-unite-56"]');
  await expect(page.locator('#v-x-redaction h1')).toContainText('unité 56');
  await page.fill('#xtxt', '新鮮なうちに食べてください。');
  await page.click('#xchk');
  await expect(page.locator('#xres')).toContainText('Point visé');
  expect(errors).toEqual([]);
});
