// Apex blog articles have their own pages (/blogs/:slug): the list links to them, the SPA renders the
// same head as the crawler HTML (api/blog-page.php), and an unknown slug is a noindex notice over the list.
import { API } from '../support/env.mjs';
import { expect, gotoSettled, skipCookieBanner, test } from './helpers.mjs';

const SLUG = 'realty-strategic-leasing-guide-2026'; // seeded by api/schema.sql
const TITLE = 'Strategic Office Leasing in Ortigas CBD: A Tenant Playbook';
const URL = `https://alphapremiergroup.com/blogs/${SLUG}`;

test.beforeEach(async ({ context }) => { await skipCookieBanner(context); });

/** Head as the page has it: title, canonical hrefs, robots, description and the JSON-LD blocks. */
const headOf = (page) => page.evaluate(() => ({
  title: document.title,
  canonicals: [...document.querySelectorAll('link[rel="canonical"]')].map((l) => l.getAttribute('href')),
  robots: document.querySelector('meta[name="robots"]')?.getAttribute('content') ?? null,
  description: document.querySelector('meta[name="description"]')?.getAttribute('content') ?? null,
  jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => JSON.parse(s.textContent)),
}));

/** The crawler page's head values, straight from PHP. */
async function crawlerHead(request) {
  const html = await (await request.get(`${API}/api/blog-page.php?slug=${SLUG}`)).text();
  const decode = (s) => s.replace(/&quot;/g, '"').replace(/&#039;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
  return {
    title: decode(html.match(/<title>([^<]*)<\/title>/)[1]),
    description: decode(html.match(/<meta data-rh="true" name="description" content="([^"]*)" \/>/)[1]),
    jsonLd: JSON.parse(html.match(/<script data-rh="true" type="application\/ld\+json">(.*?)<\/script>/s)[1]),
  };
}

test('list → article in-app: the crawler head exactly, one canonical; Back returns to the list as it was', async ({ page, request }) => {
  await gotoSettled(page, '/blogs');
  await page.evaluate(() => { window.__sameDocument = true; });
  await page.getByLabel('Search articles').fill('Tenant Playbook');
  const link = page.getByRole('link', { name: TITLE });
  await expect(link).toHaveAttribute('href', `/blogs/${SLUG}`);
  await link.click();

  await expect(page).toHaveURL(new RegExp(`/blogs/${SLUG}$`));
  await expect(page.getByRole('heading', { level: 1, name: TITLE })).toBeVisible();
  await expect(page.locator('article').getByText('Alpha Premier Realty', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => window.__sameDocument), 'navigated without a reload').toBe(true);

  const crawler = await crawlerHead(request);
  await expect(page).toHaveTitle(`${TITLE} | Alpha Premier Realty`);
  await expect.poll(async () => (await headOf(page)).jsonLd.length).toBe(1);
  const head = await headOf(page);
  expect(head.title).toBe(crawler.title);
  expect(head.canonicals).toEqual([URL]);
  expect(head.robots).toBeNull();
  expect(head.description).toBe(crawler.description);
  expect(head.jsonLd[0]).toEqual(crawler.jsonLd);
  expect(head.jsonLd[0]['@graph'][0]['@type']).toBe('BlogPosting');
  await expect(page.getByRole('region', { name: 'More articles' }).getByRole('link')).toHaveCount(3);

  await page.goBack();
  await expect(page).toHaveURL(/\/blogs$/);
  await expect(page.getByRole('heading', { level: 1, name: /Alpha Premier\s+Blog/ })).toBeVisible();
  await expect(page.getByLabel('Search articles')).toHaveValue('Tenant Playbook');
  await expect(page).toHaveTitle('Blogs & News | Alpha Premier Group');
  expect((await headOf(page)).canonicals).toEqual(['https://alphapremiergroup.com/blogs']);
  expect(await page.evaluate(() => window.__sameDocument)).toBe(true);
});

test('a modified click on a card opens the article in a new tab', async ({ page, context }) => {
  await gotoSettled(page, '/blogs');
  await page.getByLabel('Search articles').fill('Tenant Playbook');
  const [tab] = await Promise.all([
    context.waitForEvent('page'),
    page.getByRole('link', { name: TITLE }).click({ modifiers: ['ControlOrMeta'] }),
  ]);
  await expect(tab).toHaveURL(new RegExp(`/blogs/${SLUG}$`));
  await expect(page).toHaveURL(/\/blogs$/);
});

test('direct load and the old ?post= link both land on the article page', async ({ page }) => {
  for (const path of [`/blogs/${SLUG}`, `/blogs?post=${SLUG}`]) {
    await gotoSettled(page, path);
    await expect(page, path).toHaveURL(new RegExp(`/blogs/${SLUG}$`));
    await expect(page.getByRole('heading', { level: 1, name: TITLE }), path).toBeVisible();
    await expect(page).toHaveTitle(`${TITLE} | Alpha Premier Realty`);
  }
  await page.getByRole('link', { name: 'All articles' }).click();
  await expect(page).toHaveURL(/\/blogs$/);
});

test("SwiftClear's own article view keeps its UI and points its canonical at the apex article", async ({ page, request }) => {
  const [post] = (await (await request.get('/api/blogs.php?enterprise=swiftclear&summary=1')).json()).data;
  await gotoSettled(page, `/subsidiaries/swiftclear/blogs?post=${post.slug}`);
  await expect(page.getByRole('heading', { level: 1, name: post.title })).toBeVisible();
  await expect.poll(async () => (await headOf(page)).canonicals).toEqual([`https://alphapremiergroup.com/blogs/${post.slug}`]);
});

test('unknown slug: "isn\'t available" notice over the list, noindex, no canonical', async ({ page }) => {
  await gotoSettled(page, '/blogs/no-such-post-qa');
  await expect(page.getByText("This article isn't available")).toBeVisible();
  await expect(page.getByRole('heading', { level: 1, name: /Alpha Premier\s+Blog/ })).toBeVisible();
  await expect(page).toHaveTitle('Article not available | Alpha Premier Group');
  const head = await headOf(page);
  expect(head.robots).toBe('noindex, follow');
  expect(head.canonicals).toEqual([]);
  expect(head.jsonLd).toEqual([]);
  await expect(page.locator('main a[href^="/blogs/"]').first()).toBeVisible();
});
