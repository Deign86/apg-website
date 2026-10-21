// Job opening pages on the production build (/careers/{id}-{title-slug}): the opening with its own head (title,
// one canonical, JobPosting JSON-LD) equal to the crawler HTML of api/careers-page.php, links from the careers list,
// the canonical slug replacing a wrong one, a noindex notice for a closed or unknown opening, and Apply opening the
// existing application form. Openings are created through the admin API and deleted afterwards.
import { Client, as, uid } from '../support/http.mjs';
import { expect, gotoSettled, skipCookieBanner, test, watchPage } from './helpers.mjs';

const SITE = 'https://alphapremiergroup.com';
let admin;
const created = [];

test.beforeAll(async () => { admin = await as('superadmin'); });
test.afterAll(async () => { for (const id of created) await admin.delete(`/api/admin/careers.php?id=${id}`); });
test.beforeEach(async ({ context }) => { await skipCookieBanner(context); });

/** Creates an active opening; resolves to it with its id, path segment and canonical URL. */
async function opening(over = {}) {
  const body = {
    title: `QA Marketing Intern ${uid()}`, enterprise_slug: 'realty', location: 'Ortigas Center, Pasig City', type: 'Internship',
    description: 'Support the Alpha Premier Realty marketing team.', responsibilities: ['Create social media posts'], requirements: ['Good written English'], ...over,
  };
  const res = await admin.post('/api/admin/careers.php', { json: body });
  expect(res.status, res.text).toBe(201);
  created.push(res.data.id);
  const segment = `${res.data.id}-${body.title.replace(/[^A-Za-z0-9]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase()}`;
  return { ...body, id: res.data.id, segment, path: `/careers/${segment}`, url: `${SITE}/careers/${segment}` };
}

const canonical = (page) => page.locator('head link[rel="canonical"]');
const jsonLd = (page) => page.locator('head script[type="application/ld+json"]');
const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');

/** Title, description, canonical and JSON-LD of the crawler HTML (api/careers-page.php, straight from PHP). */
async function crawlerHead(segment) {
  const html = (await new Client().get(`/api/careers-page.php?job=${segment}`)).text;
  return {
    title: decode(html.match(/<title>([^<]*)<\/title>/)[1]),
    description: decode(html.match(/<meta data-rh="true" name="description" content="([^"]*)" \/>/)[1]),
    canonical: html.match(/<link data-rh="true" rel="canonical" href="([^"]*)" \/>/)[1],
    jsonLd: [JSON.parse(html.match(/<script data-rh="true" type="application\/ld\+json">(.*?)<\/script>/s)[1])],
  };
}

/** Widths at which the page scrolls sideways (as smoke.spec.mjs checks every route). */
async function horizontalOverflow(page) {
  const found = [];
  for (const width of [360, 768, 1280]) {
    await page.setViewportSize({ width, height: 800 });
    await page.waitForTimeout(150);
    if (await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth > 1)) found.push(width);
  }
  return found;
}

test('an opening\'s page: the role, its own head, the same as the crawler HTML', async ({ page }) => {
  const problems = watchPage(page);
  const job = await opening({ salary: 'PHP 15,000 monthly allowance' });
  await gotoSettled(page, job.path);
  await expect(page.getByRole('heading', { level: 1, name: job.title })).toBeVisible();
  const main = page.getByRole('main');
  for (const text of ['Alpha Premier Realty', 'Ortigas Center, Pasig City', 'Internship', 'PHP 15,000 monthly allowance', job.description, 'Create social media posts', 'Good written English']) {
    await expect(main.getByText(text, { exact: true }), text).toBeVisible();
  }
  await expect(main.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Careers' })).toHaveAttribute('href', '/careers');

  await expect(page).toHaveTitle(`${job.title} – Alpha Premier Realty | Careers`);
  await expect(page.locator('head title')).toHaveCount(1);
  await expect(canonical(page)).toHaveCount(1);
  await expect(canonical(page)).toHaveAttribute('href', job.url);
  await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', job.url);
  await expect(jsonLd(page)).toHaveCount(1);
  const [ld] = (await jsonLd(page).allTextContents()).map((t) => JSON.parse(t));
  expect(ld['@graph'].map((n) => n['@type'])).toEqual(['JobPosting']);
  expect(ld['@graph'][0].identifier.value).toBe(String(job.id));

  // Crawlers get exactly this head from the server.
  expect(await crawlerHead(job.segment)).toEqual({
    title: await page.title(),
    description: await page.locator('head meta[name="description"]').getAttribute('content'),
    canonical: await canonical(page).getAttribute('href'),
    jsonLd: [ld],
  });
  expect(await horizontalOverflow(page), 'horizontal overflow at 360/768/1280').toEqual([]);
  expect(problems).toEqual([]);
});

test('the careers list links each opening to its page, which opens in the app', async ({ page }) => {
  const problems = watchPage(page);
  const job = await opening();
  await gotoSettled(page, '/careers');
  // Off-screen sections skip rendering (content-visibility: auto) until scrolled to.
  await page.locator('#open-positions').scrollIntoViewIfNeeded();
  const link = page.locator('#open-positions').getByRole('link', { name: job.title, exact: true });
  await expect(link).toHaveAttribute('href', job.path);
  await page.evaluate(() => { window.sameDocument = true; });
  await link.click();
  await expect(page).toHaveURL(new RegExp(`${job.path}$`));
  await expect(page.getByRole('heading', { level: 1, name: job.title })).toBeVisible();
  expect(await page.evaluate(() => window.sameDocument)).toBe(true);
  await expect(canonical(page)).toHaveAttribute('href', job.url);

  await page.goBack();
  await expect(page).toHaveURL(/\/careers$/);
  await expect(page).toHaveTitle('Careers | Alpha Premier Group');
  await expect(canonical(page)).toHaveAttribute('href', `${SITE}/careers`);
  await expect(jsonLd(page)).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('a missing or outdated slug is replaced by the opening\'s own URL', async ({ page }) => {
  const job = await opening();
  let entries = 0;
  for (const path of [`/careers/${job.id}`, `/careers/${job.id}-old-title`, `${job.path}/`, `/careers/0${job.segment}`]) {
    await page.goto(path);
    await expect(page, path).toHaveURL(new RegExp(`${job.path}$`));
    await expect(page.getByRole('heading', { level: 1, name: job.title })).toBeVisible();
    await expect(canonical(page)).toHaveAttribute('href', job.url);
    // One history entry per visit: the canonical URL replaced the visited one.
    const length = await page.evaluate(() => history.length);
    if (entries) expect(length, path).toBe(entries + 1);
    entries = length;
  }
});

test('a closed or unknown opening: noindex notice that lists the open positions', async ({ page }) => {
  const problems = watchPage(page);
  const [open, closed] = [await opening(), await opening()];
  const res = await admin.put('/api/admin/careers.php', { json: { ...closed, status: 'closed' } });
  expect(res.status, res.text).toBe(200);
  for (const path of [closed.path, '/careers/2147483000-no-such-role']) {
    await gotoSettled(page, path);
    await expect(page.getByRole('heading', { level: 1, name: 'This position is no longer open' }), path).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
    await expect(canonical(page)).toHaveCount(0);
    await expect(jsonLd(page)).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('link', { name: open.title, exact: true })).toHaveAttribute('href', open.path);
    await expect(page.getByRole('link', { name: closed.title, exact: true })).toHaveCount(0);
    await expect(page.getByRole('main').getByRole('link', { name: 'Send a general application' })).toHaveAttribute('href', '/careers/apply?job=general');
  }
  expect(await horizontalOverflow(page), 'horizontal overflow at 360/768/1280').toEqual([]);
  expect(problems).toEqual([]);
});

test('Apply opens the existing application form with the opening selected', async ({ page }) => {
  const problems = watchPage(page);
  const job = await opening();
  await gotoSettled(page, job.path);
  await page.getByRole('link', { name: 'Apply now' }).click();
  await expect(page).toHaveURL(new RegExp(`/careers/apply\\?job=${job.id}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Job Application Portal');
  await expect(page.getByRole('combobox', { name: /applying for position/i })).toHaveValue(String(job.id));
  await expect(page.getByRole('textbox', { name: /full name/i })).toBeVisible();
  expect(problems).toEqual([]);
});

test('openings that fail to load: no "no longer open" claim, the careers page metadata', async ({ page }) => {
  const job = await opening();
  await page.route('**/api/careers.php', (route) => route.fulfill({ status: 500, body: '' }));
  await gotoSettled(page, job.path);
  await expect(page.getByRole('heading', { level: 1, name: "We couldn't load this position" })).toBeVisible();
  await expect(page.getByText(/no longer open/)).toHaveCount(0);
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
  await expect(canonical(page)).toHaveAttribute('href', `${SITE}/careers`);
});
