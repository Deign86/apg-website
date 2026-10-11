// The same app on the Vite dev server (unbundled modules + the vite.config.js /api proxy rules).
// A proxy pattern that swallows an imported module (e.g. api/data/content-schema.json) blanks every
// page in dev only; the production-build specs cannot see that, these can.
import { WEB_DEV } from '../support/env.mjs';
import { DEV_ROUTES } from './routes.mjs';
import { expect, expectRendered, test, watchPage } from './helpers.mjs';

test.use({ baseURL: WEB_DEV });

test.beforeEach(async ({ context }) => {
  await context.addCookies([{ name: 'apg_consent', value: 'declined', url: WEB_DEV }]);
});

for (const route of DEV_ROUTES) {
  test(`dev server renders ${route}`, async ({ page }) => {
    const problems = watchPage(page, WEB_DEV);
    await page.goto(route, { waitUntil: 'networkidle' });
    await expectRendered(page);
    expect(problems).toEqual([]);
  });
}

test('dev server renders the admin sign-in form', async ({ page }) => {
  const problems = watchPage(page, WEB_DEV);
  await page.goto('/admin/login', { waitUntil: 'networkidle' });
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  expect(problems).toEqual([]);
});

test('dev proxy: /api/*.php goes to PHP, api/data/ modules are served by Vite', async ({ request }) => {
  const php = await request.get('/api/blogs.php');
  expect(php.status()).toBe(200);
  expect((await php.json()).success).toBe(true);
  const schema = await request.get('/api/data/content-schema.json?import');
  expect(schema.status()).toBe(200);
  expect(schema.headers()['content-type']).toMatch(/javascript/);
  expect(await schema.text()).toContain('announcement_sites');
});
