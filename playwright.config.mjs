// Browser regression suite (tests/e2e). Uses the locally installed Google Chrome (no browser
// download) against the isolated stack that tests/e2e/global-setup.mjs boots: fresh test DB, PHP
// test server and a Vite dev server on PORTS.vite proxying /api to it. See tests/README.md.
import { defineConfig } from '@playwright/test';
import { WEB } from './tests/support/env.mjs';

export default defineConfig({
  testDir: 'tests/e2e',
  testMatch: '**/*.spec.mjs',
  globalSetup: './tests/e2e/global-setup.mjs',
  outputDir: 'test-results/e2e',
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}-{projectName}{ext}',
  fullyParallel: true,
  workers: 3, // measured: more workers are slower here (shared single-threaded php -S + CPU)
  retries: 0,
  timeout: 60_000,
  expect: {
    timeout: 10_000,
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', scale: 'css', maxDiffPixelRatio: 0.015 },
  },
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'test-results/e2e-report' }]],
  use: {
    baseURL: WEB,
    channel: 'chrome',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    timezoneId: 'Asia/Manila',
    locale: 'en-PH',
  },
  projects: [
    // Everything runs at 1280; the mobile project repeats only the per-route smoke and the visual baselines.
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    {
      name: 'mobile',
      testMatch: ['**/smoke.spec.mjs', '**/visual.spec.mjs'],
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 1 },
    },
  ],
});
