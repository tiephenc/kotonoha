import { test, expect } from '@playwright/test';
import { isolate, onboard } from './helpers.js';

const PAYLOAD = '0"><img src=x onerror="window.__pwn=1">';

test('sauvegarde piégée : aucun script exécuté à l’import ni au rechargement, types normalisés', async ({ page }) => {
  const errors = await isolate(page);
  await onboard(page);
  await page.evaluate(() => { location.hash = 'profil'; });
  const evil = {
    app: 'kotonoha', format: 2, exported: new Date().toISOString(),
    state: { v: 6, units: { 1: { done: { test: true }, best: PAYLOAD } }, srs: { 'v1-0': { e: 2.5, i: 1, r: 1, d: Date.now(), seen: 1, hz: PAYLOAD } },
      g: { xp: PAYLOAD, goal: 40, days: {} }, rh: { '2026-11-04': PAYLOAD }, prof: { sess: '2027-07', start: 'N4', ok: 1 },
      x: { plan: { days: [1, 2], min: PAYLOAD }, pauses: [{ from: '2026-12-01', to: '2026-12-02', label: '<img src=x onerror="window.__pwn=2">' }] } },
    plus: { lectures: [{ id: 'abcd1234', title: '<b>t</b>', text: '日本語', url: 'javascript:window.__pwn=3', reads: PAYLOAD, added: 1 }, { id: '"><img>', title: 'x' }] },
  };
  await page.setInputFiles('#dimp', { name: 'sauvegarde.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(evil)) });
  await page.click('#dok');
  await page.waitForTimeout(800);
  const st = await page.evaluate(() => ({ xp: S.g.xp, best: S.units[1].best, hz: S.srs['v1-0'].hz, rh: S.rh['2026-11-04'], min: S.x.plan.min, lect: KX.local.get('lectures', []) }));
  expect(st.xp).toBe(0);
  expect(st.best).toBe(0);
  expect(st.hz).toBe(0);
  expect(st.rh).toBe(0);
  expect(st.min).toBe(45);
  expect(st.lect).toHaveLength(1);            // l'élément à identifiant invalide est écarté
  expect(st.lect[0].url).toBe('');            // adresse javascript: neutralisée
  for (const h of ['aujourdhui', 'progres', 'calendrier', 'maitrise', 'lire', 'lire-abcd1234']) {
    await page.evaluate((x) => { location.hash = x; }, h);
    await page.waitForTimeout(250);
  }
  await page.reload();
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => window.__pwn)).toBeUndefined();
  expect(await page.locator('main img[src="x"]').count()).toBe(0);
  expect(errors).toEqual([]);
});

test('en-tête de sécurité : object-src et base-uri bloqués', async ({ page }) => {
  await isolate(page);
  await page.goto('/index.html');
  const csp = await page.locator('meta[http-equiv="Content-Security-Policy"]').getAttribute('content');
  expect(csp).toContain("object-src 'none'");
  expect(csp).toContain("base-uri 'none'");
});
