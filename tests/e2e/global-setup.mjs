// Playwright global setup: boots the isolated stack (fresh test DB, PHP test servers, SMTP sink when
// MAIL_SINK_DIR is set, a production build on `vite preview` and a Vite dev server) and warms the
// dev server's module graph so the dev-only spec does not pay Vite's cold start. Returns the teardown.
import { chromium } from '@playwright/test';
import { startStack } from '../support/stack.mjs';
import { WEB_DEV } from '../support/env.mjs';
import { DEV_ROUTES } from './routes.mjs';

export default async function globalSetup() {
  const stop = await startStack({ vite: true });
  try {
    const browser = await chromium.launch({ channel: 'chrome' });
    const page = await browser.newPage();
    for (const path of DEV_ROUTES) {
      await page.goto(`${WEB_DEV}${path}`, { waitUntil: 'networkidle', timeout: 120000 }).catch(() => {});
    }
    await browser.close();
  } catch (error) {
    await stop();
    throw error;
  }
  return stop;
}
