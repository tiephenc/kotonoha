import { test, expect } from '@playwright/test';
import { isolate, onboard, noHorizontalOverflow } from './helpers.js';

const ROUTES = [
  ['aujourdhui', '#v-aujourdhui'],
  ['parcours', '#v-parcours'],
  ['unite-1', '#v-unite'],
  ['revision', '#v-revision'],
  ['vocab', '#v-vocab'],
  ['entrainer', '#v-entrainer'],
  ['ecrire', '#v-ecrire'],
  ['labo', '#v-labo'],
  ['progres', '#v-progres'],
  ['profil', '#v-profil'],
  ['erreurs', '#v-erreurs'],
  ['apropos', '#v-apropos'],
  ['defi', '#v-defi'],
];

test('accueil, toutes les vues principales, sans erreur JS', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  for (const [hash, sel] of ROUTES) {
    await page.evaluate(h => { location.hash = h; }, hash);
    await expect(page.locator(sel), `vue ${hash}`).toHaveClass(/\bon\b/);
    await noHorizontalOverflow(page);
  }
  expect(errors).toEqual([]);
});

test('la progression persiste après rechargement', async ({ page }) => {
  await isolate(page);
  await onboard(page);
  const saved = await page.evaluate(() => localStorage.getItem('kotonoha.progress.v1'));
  expect(saved).toBeTruthy();
  await page.reload();
  await expect(page.locator('#v-aujourdhui')).toHaveClass(/\bon\b/);
  await expect(page.locator('#v-bienvenue')).not.toHaveClass(/\bon\b/);
});
