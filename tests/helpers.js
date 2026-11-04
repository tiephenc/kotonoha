import { expect } from '@playwright/test';

// Les tests ne doivent jamais joindre de service distant (Firebase, Supabase, YouTube, Spotify, polices…).
export async function isolate(page) {
  const errors = [];
  // Le WebKit de Playwright sous Windows plante dès que la page touche speechSynthesis
  // (limite du portage Windows, pas de Safari). On retire l'API pour ce seul moteur :
  // la lecture à voix haute n'est donc pas testée sous WebKit.
  if (page.context().browser()?.browserType().name() === 'webkit') {
    await page.addInitScript(() => {
      const stub = { speaking: false, pending: false, paused: false, onvoiceschanged: null,
        getVoices: () => [], speak() {}, cancel() {}, pause() {}, resume() {}, addEventListener() {}, removeEventListener() {} };
      try { delete window.speechSynthesis; } catch (e) {}
      try { delete Window.prototype.speechSynthesis; } catch (e) {}
      try { Object.defineProperty(window, 'speechSynthesis', { value: stub, configurable: true }); } catch (e) {}
    });
  }
  page.on('pageerror', e => errors.push(`pageerror: ${e.message}`));
  page.on('console', m => { if (m.type() === 'error' && !/Failed to load resource|ERR_FAILED|net::/i.test(m.text())) errors.push(`console: ${m.text()}`); });
  await page.route(url => !/^https?:\/\/127\.0\.0\.1(:\d+)?\//.test(url.toString()), r => r.abort());
  return errors;
}

// Premier passage : le formulaire d'accueil choisit une date, un niveau et un rythme.
export async function onboard(page) {
  await page.goto('/index.html#aujourdhui');
  // Le premier rendu a lieu juste après le chargement des modules : on attend l'un des deux écrans.
  await expect(page.locator('#v-bienvenue.on, #v-aujourdhui.on')).toBeVisible({ timeout: 20_000 });
  const go = page.locator('#v-bienvenue button[type=submit]');
  if (await go.isVisible().catch(() => false)) {
    await go.click();
  }
  await expect(page.locator('#v-aujourdhui')).toHaveClass(/\bon\b/);
}

export async function noHorizontalOverflow(page) {
  const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(over, 'défilement horizontal').toBeLessThanOrEqual(1);
}
