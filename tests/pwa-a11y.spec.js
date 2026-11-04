import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { isolate, onboard } from './helpers.js';

test.describe('hors connexion', () => {
  test.use({ serviceWorkers: 'allow' });
  test('le site et ses modules fonctionnent sans réseau après une première visite', async ({ page, context, browserName }) => {
    test.skip(browserName === 'webkit', 'Service worker non pris en charge par le WebKit de Playwright sous Windows');
    test.skip(browserName === 'firefox', 'Firefox piloté par Playwright ne fait pas répondre le service worker hors ligne (NS_ERROR_OFFLINE)');
    await isolate(page);
    await onboard(page);
    await page.evaluate(async () => { const r = await navigator.serviceWorker.ready; return !!r.active; });
    await page.reload(); // la page est désormais contrôlée par le service worker
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await context.setOffline(true);
    await page.reload();
    await expect(page.locator('#v-aujourdhui')).toHaveClass(/\bon\b/);
    await page.evaluate(() => { location.hash = 'detente'; });
    await expect(page.locator('#v-x-detente .xgame')).toHaveCount(8);
    await page.evaluate(() => { location.hash = 'calendrier'; });
    await expect(page.locator('#v-x-calendrier h1')).toHaveText('Calendrier');
    await context.setOffline(false);
  });
});

const VIEWS = ['aujourdhui', 'parcours', 'unite-1', 'revision', 'entrainer', 'progres', 'calendrier', 'maitrise', 'detente', 'detente-rizieres', 'lire', 'atelier', 'redaction-n3-conseil', 'conversation-medecin', 'carte', 'carte-60', 'culture', 'voyage', 'kamon', 'kamon-katabami', 'detente-musique', 'detente-pinceau', 'carnet'];

test('accessibilité (axe-core, WCAG 2 A/AA) : écrans principaux et nouveaux espaces', async ({ page }) => {
  test.setTimeout(180_000);
  await isolate(page);
  await onboard(page);
  const report = [];
  for (const v of VIEWS) {
    await page.evaluate((h) => { location.hash = h; }, v);
    await page.waitForTimeout(400);
    const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).include('main').analyze();
    for (const x of r.violations) report.push(`${v} · ${x.id} (${x.impact}) · ${x.nodes.length} élément(s) · ${x.nodes[0].target.join(' ')}`);
  }
  console.log('AXE\n' + (report.join('\n') || 'aucune violation'));
  test.info().annotations.push({ type: 'axe', description: report.join(' | ') || 'aucune violation' });
  // Les violations des nouveaux espaces (préfixe v-x-) doivent être nulles ; celles de l'existant sont rapportées.
  const mine = report.filter((l) => /^(aujourdhui|calendrier|maitrise|detente|lire|atelier|redaction|conversation|carte|culture|voyage|kamon|carnet|progres)/.test(l));
  expect(mine, mine.join('\n')).toEqual([]);
});
