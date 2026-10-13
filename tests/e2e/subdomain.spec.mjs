// Enterprise-subdomain routing on the production build. The real hostnames are served from the local
// stack by intercepting their requests, so hostEnterprise()/isProductionHost() see production hosts.
import { WEB } from '../support/env.mjs';
import { expect, skipCookieBanner, test } from './helpers.mjs';

const APEX = 'https://alphapremiergroup.com';
const VO = 'https://virtual-office.alphapremiergroup.com';

test.beforeEach(async ({ context }) => {
  await skipCookieBanner(context);
  await context.route(/^https:\/\/([a-z0-9-]+\.)?alphapremiergroup\.com\//, async (route) => {
    const { pathname, search } = new URL(route.request().url());
    await route.fulfill({ response: await route.fetch({ url: `${WEB}${pathname}${search}` }) });
  });
});
test.afterEach(async ({ context }) => { await context.unrouteAll({ behavior: 'ignoreErrors' }); });

// Virtual Office renders inside the apex shell, whose nav targets apex paths ('/', '/careers'). On the
// subdomain those were rewritten onto /virtual-office: Home stayed on the VO page and the rest 404'd.
test('virtual-office subdomain: apex nav leaves the subdomain', async ({ page }) => {
  await page.goto(`${VO}/`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/virtual office/i);

  await page.getByRole('button', { name: 'HOME', exact: true }).click();
  await expect(page).toHaveURL(`${APEX}/`);

  await page.getByRole('button', { name: 'CAREERS', exact: true }).click();
  await expect(page).toHaveURL(`${APEX}/careers`);
  await expect(page.getByText(/page not found|404/i)).toHaveCount(0);
});

test('virtual-office subdomain: footer links leave the subdomain', async ({ page }) => {
  await page.goto(`${VO}/`);
  await page.getByRole('contentinfo').getByRole('button', { name: 'Blogs & Newsroom' }).click();
  await expect(page).toHaveURL(`${APEX}/blogs`);
});

test('virtual-office subdomain: its own inquire page stays on the subdomain', async ({ page }) => {
  await page.goto(`${VO}/inquire`);
  await expect(page).toHaveURL(`${VO}/inquire`);
});

test('virtual-office: package inquire buttons share one baseline', async ({ page }) => {
  await page.goto('/virtual-office');
  const buttons = page.locator('.vo-inquire-btn');
  await expect(buttons).toHaveCount(4);
  const bottoms = await buttons.evaluateAll((els) => els.map((el) => Math.round(el.getBoundingClientRect().bottom)));
  expect(new Set(bottoms).size).toBe(1);
});
