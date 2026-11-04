import { defineConfig, devices } from '@playwright/test';

// Navigateurs réellement disponibles sur la machine de développement :
// Chromium, Firefox et WebKit (moteur de Safari) téléchargés par Playwright,
// Google Chrome et Microsoft Edge installés sur Windows.
export default defineConfig({
  testDir: 'tests',
  timeout: 60_000,
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:8765',
    trace: 'retain-on-failure',
    // Le service worker met les fichiers en cache : bloqué pour des tests déterministes
    // (le test hors connexion le réactive explicitement).
    serviceWorkers: 'block',
  },
  webServer: {
    command: 'node tools/serve.mjs 8765',
    url: 'http://127.0.0.1:8765/index.html',
    reuseExistingServer: true,
    stdout: 'ignore',
    stderr: 'ignore',
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
    { name: 'tablette-chromium', use: { ...devices['Galaxy Tab S4'] } },
    // Moteur WebKit (celui de Safari) : sous Windows, le portage de Playwright plante de façon aléatoire
    // sur ce site (voir KOTONOHA_TESTS.md). Lancement explicite : WEBKIT=1 npx playwright test --project=webkit
    ...(process.env.WEBKIT ? [
      { name: 'webkit', use: { ...devices['Desktop Safari'] } },
      { name: 'tablette', use: { ...devices['iPad (gen 7)'] } },
    ] : []),
  ],
});
