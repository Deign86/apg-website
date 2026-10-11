// Visual baselines: the first screen of each site's home page at 1280 (desktop project) and 390
// (mobile project). Animations are frozen and moving/time-based regions masked. Update baselines
// with `npm run test:update-snapshots` after an intended design change (see tests/README.md).
import { ENTERPRISE_SITES } from './routes.mjs';
import { expect, skipCookieBanner, test } from './helpers.mjs';

const HOMES = [{ slug: 'apex', base: '/' }, ...ENTERPRISE_SITES];

test.beforeEach(async ({ context }) => { await skipCookieBanner(context); });

for (const site of HOMES) {
  test(`home of ${site.slug} looks the same`, async ({ page }) => {
    await page.goto(site.base, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() => [...document.images].every((img) => img.complete), null, { timeout: 15000 }).catch(() => {});
    await expect(page).toHaveScreenshot(`home-${site.slug}.png`, {
      // Live/time-based text is masked; video, map embeds and animated canvases are hidden (they
      // change every frame), as is the admin-controlled announcement (covered by admin.spec).
      mask: [page.locator('[role="status"], time')],
      style: 'video, iframe, canvas { visibility: hidden !important; } [aria-label="Announcement"] { display: none !important; }',
      timeout: 20000,
    });
  });
}
