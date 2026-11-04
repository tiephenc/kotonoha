import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

test('atelier : hub, sujets par niveau, scénarios', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'entrainer'; });
  await page.click('[data-xtile="atelier"]');
  await expect(page.locator('#v-x-atelier h1')).toHaveText('Atelier');
  await expect(page.locator('a.xsujet[href^="#redaction-"]')).toHaveCount(12);
  await expect(page.locator('a.xsujet[href^="#conversation-"]')).toHaveCount(6);
  // pas d'assistant intégré hors artefact : la consigne de jeu de rôle est proposée
  await page.fill('#xrp [name=sit]', 'au guichet d’une gare');
  await page.click('#xrp button[type=submit]');
  await expect(page.locator('#xrpout textarea')).toContainText('au guichet d’une gare');
  await noHorizontalOverflow(page);
  expect(errors).toEqual([]);
});

test('rédaction : vérifications de forme honnêtes, brouillon, enregistrement, correction collée', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'redaction-n4-journee'; });
  await page.fill('#xtxt', '毎朝七時に起きます. 朝ご飯を食べてから、会社に行く。週末は本を読んだり、映画を見たりしますを を');
  await page.click('#xchk');
  const res = page.locator('#xres');
  await expect(res).toContainText('Registre');
  await expect(res).toContainText('Ponctuation');
  await expect(res).toContainText('Point visé « 〜てから » : utilisé');
  await expect(res).toContainText('Point visé « 〜たり » : utilisé');
  await expect(res).toContainText('ne corrigent ni la grammaire ni le sens');
  // brouillon conservé
  await page.waitForTimeout(800);
  await page.reload();
  await expect(page.locator('#xtxt')).toHaveValue(/毎朝七時/);
  await page.click('#xsav');
  await expect(page.locator('#xmsg')).toContainText('Enregistré');
  await page.click('#xprm');
  await expect(page.locator('#xprmout textarea')).toContainText('Distingue clairement les ERREURS');
  await page.fill('#xcorr', 'Correction de test : 行く → 行きます (registre).');
  await page.click('#xsavc');
  await expect(page.locator('#xmsg2')).toContainText('Correction enregistrée');
  const r = await page.evaluate(() => KX.local.get('redactions', []));
  expect(r).toHaveLength(1);
  expect(r[0].corr).toContain('行きます');
  await page.evaluate(() => { location.hash = 'atelier'; });
  await expect(page.locator('.xhist')).toContainText('Ma journée type');
  expect(errors).toEqual([]);
});

test('conversation guidée : quatre tours, explications, bilan, rejouer', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { localStorage.removeItem('kotonoha.atelier.mode'); location.hash = 'conversation-resto'; });
  for (let i = 0; i < 4; i++) {
    await expect(page.locator('.xopt').first()).toBeVisible();
    await page.locator('.xopt').first().click();
    await expect(page.locator('.xb.me')).toHaveCount(i + 1);
    await expect(page.locator('.xb.me').nth(i).locator('.xfb')).toBeVisible();
  }
  await expect(page.locator('.xrecap')).toBeVisible();
  await expect(page.locator('.xrecap > ol > li')).toHaveCount(4);
  await noHorizontalOverflow(page);
  await page.click('#xagain');
  await expect(page.locator('.xb.me')).toHaveCount(0);
  expect((await page.evaluate(() => KX.local.get('conversations', []))).length).toBe(1);
  expect(errors).toEqual([]);
});

test('conversation libre : réponse tapée échappée, registre signalé, suggestions', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { window.__pwn = 0; location.hash = 'conversation-retard'; });
  await page.click('[data-m="libre"]');
  await page.fill('.xfree textarea', '<img src=x onerror="window.__pwn=1">電車が遅れたから、遅れるよ');
  await page.click('.xfree button[type=submit]');
  await expect(page.locator('.xb.me').first()).toContainText('Réponses naturelles possibles');
  await expect(page.locator('.xb.me').first()).toContainText('Registre');
  expect(await page.evaluate(() => window.__pwn)).toBe(0);
  expect(errors).toEqual([]);
});
