// Every public route on the apex and the 8 enterprise sites renders real content with no console
// errors and no failed same-origin requests (desktop project at 1280, mobile project at 390), and
// has no horizontal page scroll at 360 / 768 / 1280 (checked once, in the desktop project).
// Catches blank-page regressions such as a lazy chunk that fails to load or a crashing route.
import { PUBLIC_ROUTES, NOT_FOUND_ROUTES } from './routes.mjs';
import { expect, expectRendered, gotoSettled, skipCookieBanner, test, watchPage } from './helpers.mjs';

const OVERFLOW_WIDTHS = [360, 768, 1280];

test.beforeEach(async ({ context }) => { await skipCookieBanner(context); });

/** Widths at which the page scrolls sideways, with the first offending elements. */
async function horizontalOverflow(page) {
  const found = {};
  for (const width of OVERFLOW_WIDTHS) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(150);
    const extra = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (extra > 1) {
      found[width] = await page.evaluate(() => [...document.querySelectorAll('body *')]
        .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1)
        .slice(0, 3)
        .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).split(' ').slice(0, 2).join('.')}`)
        .concat(`+${document.documentElement.scrollWidth - window.innerWidth}px`));
    }
  }
  return found;
}

for (const route of [...PUBLIC_ROUTES, ...NOT_FOUND_ROUTES]) {
  test(`renders ${route}`, async ({ page }, testInfo) => {
    const problems = watchPage(page);
    await gotoSettled(page, route);
    if (NOT_FOUND_ROUTES.includes(route)) {
      await expect(page.getByRole('heading', { level: 1, name: '404' })).toBeVisible();
      await expect(page.getByRole('link', { name: /home|back/i }).first()).toBeVisible();
    } else {
      await expectRendered(page);
    }
    expect(problems, 'console errors / failed requests').toEqual([]);
    if (testInfo.project.name === 'desktop') {
      expect(await horizontalOverflow(page), 'horizontal overflow at 360/768/1280').toEqual({});
    }
  });
}

test('apex /properties redirects to Realty properties; listing links land on the listing page', async ({ page }) => {
  await page.goto('/properties', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Available Properties' })).toBeVisible();
  for (const link of ['/properties/APR-A0A001', '/properties?ref=APR-A0A001']) {
    await page.goto(link, { waitUntil: 'networkidle' });
    await expect(page, link).toHaveURL(/\/subsidiaries\/realty\/properties\/APR-A0A001$/);
    await expect(page.getByRole('dialog', { name: 'Office Space for Lease in Pasig' })).toBeVisible();
  }
});
