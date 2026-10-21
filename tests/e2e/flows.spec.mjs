// Key visitor journeys on the production build, each checked end to end: the browser UI, the row the
// API stored (admin API), and the outgoing email when MAIL_SINK_DIR is set.
import { WEB } from '../support/env.mjs';
import { as, mailEnabled, waitForMail, PDF_BYTES, uid } from '../support/http.mjs';
import { expect, skipCookieBanner, test, waitForFormTimer, watchPage } from './helpers.mjs';

let admin;
test.beforeAll(async () => { admin = await as('superadmin'); });
test.beforeEach(async ({ context }) => { await skipCookieBanner(context); });

// php -S answers a form only after its confirmation emails are sent (production flushes first), so
// submissions get a generous timeout.
const inboxRow = async (email) => (await admin.get(`/api/admin/inquiries.php?q=${encodeURIComponent(email)}`)).data.data[0];

test('apex careers: apply to an opening with a resume; enterprise attribution and HR email', async ({ page }) => {
  const problems = watchPage(page);
  const job = (await admin.get('/api/careers.php?enterprise=dynamic-tree')).data.data[0];
  await page.goto(`/careers/apply?job=${job.id}`, { waitUntil: 'networkidle' });
  const opened = Date.now();
  await expect(page.getByRole('combobox', { name: /applying for position/i })).toHaveValue(String(job.id));
  const email = `${uid('e2e-apply')}@apg.test`;
  const form = page.getByRole('main');
  await form.getByRole('textbox', { name: /full name/i }).fill('QA Applicant');
  await form.getByRole('textbox', { name: /email address/i }).fill(email);
  await form.getByRole('textbox', { name: /mobile number/i }).fill('0917 555 0101');
  await form.locator('input[type="file"]').setInputFiles({ name: 'e2e-cv.pdf', mimeType: 'application/pdf', buffer: PDF_BYTES });
  await form.getByRole('textbox', { name: /cover note/i }).fill('Applying via the e2e suite.');
  await waitForFormTimer(opened);
  const since = Date.now();
  await page.getByRole('button', { name: 'SUBMIT APPLICATION' }).click();
  // php -S answers only after the ATS + emails run in its shutdown hook (production flushes first).
  await expect(page.getByRole('heading', { name: 'Application Received!' })).toBeVisible({ timeout: 30000 });
  const applicant = (await admin.get(`/api/admin/applicants.php?search=${encodeURIComponent(email)}`)).data.data[0];
  expect(applicant.enterprise_slug).toBe('dynamic-tree');
  expect(applicant.job_id).toBe(job.id);
  expect(applicant.resume_filename).toBe('e2e-cv.pdf');
  if (mailEnabled) {
    await waitForMail((m) => m.to.includes('hr@apg.test') && m.raw.includes(email), { since, timeout: 30000 });
    await waitForMail((m) => m.to.includes(email), { since, timeout: 30000 });
  }
  await admin.delete(`/api/admin/applicants.php?id=${applicant.id}`);
  expect(problems).toEqual([]);
});

test('apex /inquire: inquiry is stored for the chosen company', async ({ page }) => {
  const problems = watchPage(page);
  await page.goto('/inquire', { waitUntil: 'networkidle' });
  const opened = Date.now();
  const email = `${uid('e2e-inq')}@apg.test`;
  await page.getByRole('textbox', { name: 'Full Name *' }).fill('QA Inquirer');
  await page.getByRole('textbox', { name: 'Email Address *' }).fill(email);
  await page.getByRole('combobox', { name: /Enterprise Division Interest/ }).selectOption({ label: 'Luxe Prime Realty' });
  await page.getByRole('textbox', { name: /Phone/ }).fill('0917 555 0102');
  await page.getByRole('textbox', { name: /Project Details/ }).fill('Looking for a condo unit.');
  await waitForFormTimer(opened);
  await page.getByRole('button', { name: 'Send Message via Email' }).click();
  await expect(page.getByText('Inquiry Submitted Successfully')).toBeVisible({ timeout: 30000 });
  const row = await inboxRow(email);
  expect(row.enterprise_slug).toBe('luxe-prime');
  expect(row.kind).toBe('inquiry');
  await admin.delete(`/api/admin/inquiries.php?id=${row.id}`);
  expect(problems).toEqual([]);
});

test('company inquiry page (Construction) stores a construction inquiry', async ({ page }) => {
  await page.goto('/subsidiaries/construction/inquire', { waitUntil: 'networkidle' });
  const opened = Date.now();
  const email = `${uid('e2e-co')}@apg.test`;
  await page.getByPlaceholder('Juan Dela Cruz').fill('QA Builder');
  await page.getByPlaceholder('juan@company.com').fill(email);
  await page.getByPlaceholder('0917 123 4567').fill('0917 555 0103');
  await page.getByPlaceholder('How can we assist your business?').fill('Office fit-out');
  await page.getByPlaceholder(/Tell us about your project/).fill('Fit-out for 200 sqm.');
  await waitForFormTimer(opened);
  await page.getByRole('button', { name: 'Submit Inquiry' }).click();
  await expect(page.getByRole('heading', { name: 'Inquiry Received!' })).toBeVisible({ timeout: 30000 });
  const row = await inboxRow(email);
  expect(row.enterprise_slug).toBe('construction');
  await admin.delete(`/api/admin/inquiries.php?id=${row.id}`);
});

test('Virtual Office: a plan\'s Inquire link carries the plan into the stored inquiry', async ({ page }) => {
  await page.goto('/virtual-office', { waitUntil: 'networkidle' });
  // The 2026 plans (fix:virtual-office-2026-plans): Premier Prestige was the Silver plan.
  await expect(page.getByRole('heading', { name: 'Premier Prestige' })).toBeVisible();
  await page.locator('a[href*="package=Premier%20Prestige"]').first().click();
  await expect(page).toHaveURL(/package=Premier%20Prestige/);
  const form = page.getByRole('main');
  await expect(form.getByRole('textbox', { name: /full name/i })).toBeVisible();
  const opened = Date.now();
  const email = `${uid('e2e-vo')}@apg.test`;
  await form.getByRole('textbox', { name: /full name/i }).fill('QA Office');
  await form.getByRole('textbox', { name: /email/i }).first().fill(email);
  await form.getByRole('textbox', { name: /phone|mobile|viber/i }).first().fill('0917 555 0104');
  await form.getByRole('textbox', { name: /details|requirements|message|assist/i }).last().fill('Need a business address.');
  await waitForFormTimer(opened);
  await form.getByRole('button', { name: /submit|send/i }).click();
  await expect(page.getByText(/Inquiry (Received|Submitted)/i).first()).toBeVisible({ timeout: 30000 });
  const row = await inboxRow(email);
  expect(row.enterprise_slug).toBe('virtual-office');
  expect(JSON.stringify(row.meta)).toContain('Premier Prestige');
  await admin.delete(`/api/admin/inquiries.php?id=${row.id}`);
});

test('Realty properties: filters, listing detail deep link, and a listing inquiry with its ref', async ({ page }) => {
  const problems = watchPage(page);
  await page.goto('/subsidiaries/realty/properties', { waitUntil: 'networkidle' });
  const cards = page.getByRole('region', { name: 'Listings' }).getByRole('article');
  const total = await cards.count();
  expect(total).toBeGreaterThan(3);
  const forSale = page.getByRole('group', { name: 'Lease or sale' }).getByRole('button', { name: 'For Sale', exact: true });
  await forSale.click();
  await expect(forSale).toHaveAttribute('aria-pressed', 'true');
  const sale = await cards.count();
  expect(sale).toBeGreaterThan(0);
  expect(sale).toBeLessThan(total);
  await page.getByRole('group', { name: 'Lease or sale' }).getByRole('button', { name: 'All', exact: true }).click();
  await page.getByRole('group', { name: 'Property type' }).getByRole('button', { name: /^Warehouse/ }).click();
  await expect(cards.first()).toContainText('Warehouse');
  await page.getByRole('searchbox', { name: 'Search properties' }).fill('Valenzuela');
  await expect(cards).toHaveCount(1);
  // The card is a real link to the listing's own page; a plain click opens it in the app (no reload).
  const card = cards.first().getByRole('link');
  const href = await card.getAttribute('href');
  expect(href).toMatch(/^\/subsidiaries\/realty\/properties\/APR-[0-9A-F]{6}$/);
  const ref = href.split('/').pop();
  await page.evaluate(() => { window.sameDocument = true; });
  await card.click();
  const dialog = page.getByRole('dialog', { name: 'Warehouse for Lease in Valenzuela' });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`${href}\\?type=warehouse&q=Valenzuela$`));
  expect(await page.evaluate(() => window.sameDocument)).toBe(true);

  // Its own head metadata: exactly one title / canonical / description, plus the listing JSON-LD.
  await expect(page).toHaveTitle('Warehouse for Lease in Valenzuela (1,000 sqm) | Alpha Premier Realty');
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', `https://realty.alphapremiergroup.com/properties/${ref}`);
  await expect(page.locator('head title')).toHaveCount(1);
  await expect(page.locator('head meta[name="description"]')).toHaveCount(1);
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', `https://realty.alphapremiergroup.com/properties/${ref}`);
  expect(await page.locator('head script[type="application/ld+json"]').allTextContents()).toEqual([expect.stringContaining('"RealEstateListing"')]);

  // Closing replaces the listing's entry with the filtered list; Ctrl/Cmd-click opens the listing in a new tab.
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\?type=warehouse&q=Valenzuela$/);
  await expect(page).toHaveTitle('Available Properties for Lease & Sale | Alpha Premier Realty');
  const [tab] = await Promise.all([page.context().waitForEvent('page'), card.click({ modifiers: ['ControlOrMeta'] })]);
  await expect(tab).toHaveURL(new RegExp(`${href}$`));
  await expect(tab.getByRole('dialog', { name: 'Warehouse for Lease in Valenzuela' })).toBeVisible();
  await tab.close();
  await expect(dialog).toBeHidden();

  // The deep link reopens the same listing on a fresh load.
  await card.click();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('dialog', { name: 'Warehouse for Lease in Valenzuela' })).toBeVisible();

  await page.getByRole('button', { name: 'Inquire about this property' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\?type=warehouse&q=Valenzuela$/);
  const form = page.getByRole('dialog').filter({ has: page.locator('#realty-inq-name') });
  await expect(form).toBeVisible();
  const opened = Date.now();
  const email = `${uid('e2e-listing')}@apg.test`;
  await form.getByLabel('Your Name').fill('QA Tenant');
  await form.getByLabel('Email Address').fill(email);
  await form.getByLabel('Viber Number').fill('0917 555 0105');
  await form.getByLabel('Your Inquiry Notes').fill('Is it still available?');
  const consent = form.getByRole('checkbox');
  if (await consent.count()) await consent.check();
  await waitForFormTimer(opened);
  await form.getByRole('button', { name: /send|submit/i }).click();
  await expect(form).toBeHidden({ timeout: 30000 });
  const row = await inboxRow(email);
  expect(row.kind).toBe('listing');
  expect(row.enterprise_slug).toBe('realty');
  expect(row.meta.listing_ref).toBe(ref);
  await admin.delete(`/api/admin/inquiries.php?id=${row.id}`);
  expect(problems).toEqual([]);
});

test('Realty listing URLs: legacy ?ref links move to the path; an unavailable ref shows the list with a notice', async ({ page }) => {
  const problems = watchPage(page);
  await page.goto('/subsidiaries/realty/properties?ref=APR-A0A001&type=office', { waitUntil: 'networkidle' });
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/APR-A0A001\?type=office$/);
  await expect(page.getByRole('dialog', { name: 'Office Space for Lease in Pasig' })).toBeVisible();

  await page.goto('/subsidiaries/realty/properties/APR-FFFFFF', { waitUntil: 'networkidle' });
  await expect(page.getByText('This property (Ref APR-FFFFFF) is no longer available. Here are our current listings.')).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Listings' }).getByRole('article').first()).toBeVisible();
  await expect(page.locator('head meta[name="robots"][content*="noindex"]')).toHaveCount(1);
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
  // Any other path is a browse page; one the feed has no hub for shows every listing, noindex.
  for (const path of ['foo', 'warehouse-for-lease/nowhere', 'apr-a0a001', 'APR-A0A001/photos']) {
    await page.goto(`/subsidiaries/realty/properties/${path}`, { waitUntil: 'networkidle' });
    await expect(page.getByText("We don't have listings for this search right now. Here are all available properties."), path).toBeVisible();
    await expect(page.getByRole('dialog')).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Available Properties');
    await expect(page.getByRole('group', { name: 'Lease or sale' })).toBeVisible();
    await expect(page).toHaveTitle('Available Properties for Lease & Sale | Alpha Premier Realty');
    await expect(page.locator('head meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
  }
  expect(problems).toEqual([]);

  // A feed that fails to load keeps the error state rather than calling the listing unavailable.
  await page.route('**/api/listings.php', (route) => route.fulfill({ status: 500, body: '' }));
  await page.goto('/subsidiaries/realty/properties/APR-A0A001', { waitUntil: 'networkidle' });
  await expect(page.getByText("We couldn't load the listings right now.", { exact: false })).toBeVisible();
  await expect(page.getByText(/no longer available/)).toHaveCount(0);
});

test('Realty listings feed: rows without a valid ref or with off-site photos are not rendered', async ({ page }) => {
  await page.route('**/api/listings.php', (route) => route.fulfill({
    json: {
      success: true,
      synced_at: new Date().toISOString(),
      data: [
        { ref: 'APR-0E2E01', title: 'E2E Valid Listing', type: 'office', type_label: 'Office Space', deal: 'lease', photos: ['https://evil.test/x.jpg'], terms: [] },
        { ref: 'NOT-A-REF', title: 'E2E Invalid Ref', type: 'office', type_label: 'Office Space', deal: 'lease', photos: [], terms: [] },
        { title: 'E2E Missing Ref' },
      ],
    },
  }));
  await page.goto('/subsidiaries/realty/properties', { waitUntil: 'networkidle' });
  const listings = page.getByRole('region', { name: 'Listings' });
  await expect(listings.getByRole('heading', { name: 'E2E Valid Listing' })).toBeVisible();
  await expect(listings.getByRole('article')).toHaveCount(1);
  expect(await page.locator('img[src*="evil.test"]').count()).toBe(0);
});

// Browse pages ("hubs", listingHubs() in api/lib/Listings.php): /properties/{type}-for-{deal}[/{area}].
const REALTY = 'https://realty.alphapremiergroup.com';
/** Loads a Realty properties URL and returns the hubs of the feed that page received. */
async function gotoProperties(page, path) {
  const [res] = await Promise.all([
    page.waitForResponse((r) => r.url().endsWith('/api/listings.php')),
    page.goto(`/subsidiaries/realty/properties${path}`, { waitUntil: 'networkidle' }),
  ]);
  return (await res.json()).hubs;
}
/** The `@graph` of each JSON-LD block in <head>. */
const jsonLd = async (page) => (await page.locator('head script[type="application/ld+json"]').allTextContents()).map((t) => JSON.parse(t)['@graph']);
const crumb = (position, name, path) => ({ '@type': 'ListItem', position, name, item: `${REALTY}${path}` });

test('Realty browse page: only its listings, its own head tags and breadcrumb; a listing opened from it closes back to it', async ({ page }) => {
  const problems = watchPage(page);
  const hubs = await gotoProperties(page, '/warehouse-for-lease');
  const hub = hubs.find((h) => h.path === '/properties/warehouse-for-lease');
  expect(hub).toMatchObject({ h1: 'Warehouses for Lease', count: 2, indexable: false }); // QA feed: Valenzuela + Cavite
  const cards = page.getByRole('region', { name: 'Listings' }).getByRole('article');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Warehouses for Lease');
  await expect(page.getByText(hub.description)).toBeVisible();
  await expect(cards.getByRole('heading')).toHaveText(['Warehouse for Lease in Valenzuela', 'Warehouse for Lease in Cavite']);
  // The hub fixes type and deal; the search box still narrows it.
  await expect(page.getByRole('group', { name: 'Lease or sale' })).toHaveCount(0);
  await expect(page.getByRole('group', { name: 'Property type' })).toHaveCount(0);

  // Head: the hub's own title and description, noindex below 3 listings (so no canonical / og:url), the
  // default share image, and the breadcrumb JSON-LD.
  await expect(page).toHaveTitle('Warehouses for Lease | Alpha Premier Realty');
  await expect(page.locator('head meta[name="description"]')).toHaveAttribute('content', hub.description);
  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('head link[rel="canonical"]')).toHaveCount(0);
  await expect(page.locator('head meta[property="og:url"]')).toHaveCount(0);
  await expect(page.locator('head meta[property="og:image"]')).toHaveAttribute('content', 'https://alphapremiergroup.com/og-image.jpg');
  await expect.poll(() => jsonLd(page)).toEqual([[{
    '@type': 'BreadcrumbList',
    itemListElement: [crumb(1, 'Alpha Premier Realty', '/'), crumb(2, 'Available Properties', '/properties'), crumb(3, 'Warehouses for Lease', '/properties/warehouse-for-lease')],
  }]]);
  const breadcrumb = page.getByRole('navigation', { name: 'Breadcrumb' });
  await expect(breadcrumb.getByRole('link')).toHaveText(['Available Properties']);
  await expect(breadcrumb.getByRole('link')).toHaveAttribute('href', '/subsidiaries/realty/properties');

  // Search within the hub and open a listing: the hub's list stays behind the dialog ...
  await page.getByRole('searchbox', { name: 'Search properties' }).fill('Cavite');
  await expect(cards).toHaveCount(1);
  await page.evaluate(() => { window.sameDocument = true; });
  await cards.first().getByRole('link').click();
  const dialog = page.getByRole('dialog', { name: 'Warehouse for Lease in Cavite' });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/APR-A0A008\?q=Cavite$/);
  await expect(page).toHaveTitle('Warehouse for Lease in Cavite (3,200 sqm) | Alpha Premier Realty');
  await expect(page.locator('h1')).toHaveText('Warehouses for Lease');
  // ... its Cavite hub has 1 listing (noindex), so "More" leads to the type + deal hub ...
  await expect(dialog.getByRole('link', { name: 'More Warehouses for Lease' })).toHaveAttribute('href', '/subsidiaries/realty/properties/warehouse-for-lease');
  // ... and closing returns to the hub, search kept, without a reload.
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/warehouse-for-lease\?q=Cavite$/);
  await expect(page).toHaveTitle('Warehouses for Lease | Alpha Premier Realty');
  await expect(cards).toHaveCount(1);
  expect(await page.evaluate(() => window.sameDocument)).toBe(true);

  // An area hub: breadcrumb (and JSON-LD) through its type + deal hub, which is also its related search.
  await gotoProperties(page, '/warehouse-for-lease/cavite');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Warehouses for Lease in Cavite');
  await expect(cards).toHaveCount(1);
  await expect(page).toHaveTitle('Warehouses for Lease in Cavite | Alpha Premier Realty');
  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect.poll(async () => (await jsonLd(page))[0]?.[0]?.itemListElement).toEqual([
    crumb(1, 'Alpha Premier Realty', '/'), crumb(2, 'Available Properties', '/properties'),
    crumb(3, 'Warehouses for Lease', '/properties/warehouse-for-lease'), crumb(4, 'Warehouses for Lease in Cavite', '/properties/warehouse-for-lease/cavite'),
  ]);
  await expect(breadcrumb.getByRole('link')).toHaveText(['Available Properties', 'Warehouses for Lease']);
  await expect(page.getByRole('navigation', { name: 'Related searches' }).getByRole('link')).toHaveText(['Warehouses for Lease 2']);

  // "Inquire about this property" also returns to the hub before the inquiry form opens.
  await cards.first().getByRole('link').click();
  await page.getByRole('button', { name: 'Inquire about this property' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/warehouse-for-lease\/cavite$/);
  const form = page.getByRole('dialog').filter({ has: page.locator('#realty-inq-name') });
  await expect(form).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(form).toBeHidden();

  // Breadcrumb links are real links that navigate in the app.
  await page.evaluate(() => { window.sameDocument = true; });
  await breadcrumb.getByRole('link', { name: 'Warehouses for Lease' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/warehouse-for-lease$/);
  await expect(cards).toHaveCount(2);
  expect(await page.evaluate(() => window.sameDocument)).toBe(true);

  // A direct visit to the listing still has every listing behind it and closes to /properties.
  await page.goto('/subsidiaries/realty/properties/APR-A0A008', { waitUntil: 'networkidle' });
  await expect(page.locator('h1')).toHaveText('Available Properties');
  await page.getByRole('dialog').getByRole('button', { name: 'Close' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties$/);
  expect(problems).toEqual([]);
});

test('Realty /properties: "Browse by type" links every type + deal hub; hidden while searching', async ({ page }) => {
  const problems = watchPage(page);
  const hubs = await gotoProperties(page, '');
  const typeHubs = hubs.filter((h) => h.area_slug === '');
  expect(typeHubs.length).toBeGreaterThan(3);
  const browse = page.getByRole('navigation', { name: 'Browse properties' });
  const byType = browse.getByRole('list', { name: 'Browse by type' }).getByRole('link');
  await expect(byType).toHaveText(typeHubs.map((h) => `${h.h1} ${h.count}`));
  expect(await byType.evaluateAll((links) => links.map((a) => a.getAttribute('href')))).toEqual(typeHubs.map((h) => `/subsidiaries/realty${h.path}`));
  // Every QA area hub has 1 listing: none is indexable, so there are no popular searches.
  await expect(browse.getByRole('heading', { name: 'Popular searches' })).toHaveCount(0);

  const search = page.getByRole('searchbox', { name: 'Search properties' });
  await search.fill('Cavite');
  await expect(browse).toHaveCount(0);
  await search.fill('');
  await page.evaluate(() => { window.sameDocument = true; });
  await browse.getByRole('link', { name: 'Warehouses for Lease 2' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/warehouse-for-lease$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Warehouses for Lease');
  expect(await page.evaluate(() => window.sameDocument)).toBe(true);
  // Nothing of the list page's head is left behind on the (noindex) hub.
  await expect(page).toHaveTitle('Warehouses for Lease | Alpha Premier Realty');
  await expect(page.locator('head meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow');
  await expect(page.locator('head link[rel="canonical"], head meta[property="og:url"]')).toHaveCount(0);
  expect(problems).toEqual([]);
});

test('Realty browse links on a large feed: popular searches with "Show all", related hubs, indexable head tags, malformed hubs dropped', async ({ page }) => {
  const problems = watchPage(page);
  const listing = (n, type, type_label, deal, area) => ({
    ref: `APR-0E2E0${n}`, title: `E2E ${type_label} ${n} in ${area}`, type, type_label, deal, area, area_slug: area.toLowerCase(), photos: [], terms: [],
  });
  const hub = (path, type, deal, area, plural, count) => {
    const h1 = `${plural} for ${deal === 'lease' ? 'Lease' : 'Sale'}${area ? ` in ${area}` : ''}`;
    return {
      path, type, deal, area, area_slug: path.split('/')[3] ?? '', count, indexable: count >= 3,
      h1, title: `${h1} | Alpha Premier Realty`, description: `${count} listings: ${h1}. Inquire for a viewing.`,
    };
  };
  const fillers = Array.from({ length: 28 }, (_, i) => hub(`/properties/office-space-for-lease/area-${i}`, 'office', 'lease', `Area ${i}`, 'Office Spaces', 60 - i));
  const feed = {
    success: true,
    synced_at: new Date().toISOString(),
    data: [
      ...[1, 2, 3].map((n) => listing(n, 'warehouse', 'Warehouse', 'lease', 'Cavite')),
      listing(4, 'warehouse', 'Warehouse', 'lease', 'Laguna'),
      ...[5, 6, 7].map((n) => listing(n, 'lot', 'Lot', 'sale', 'Cavite')),
    ],
    hubs: [
      hub('/properties/warehouse-for-lease', 'warehouse', 'lease', '', 'Warehouses', 4),
      hub('/properties/lot-for-sale', 'lot', 'sale', '', 'Lots', 3),
      hub('/properties/residential-for-lease/san-fernando-pampanga', 'residential', 'lease', 'San Fernando Pampanga', 'Residential Properties', 70),
      ...fillers,
      hub('/properties/warehouse-for-lease/cavite', 'warehouse', 'lease', 'Cavite', 'Warehouses', 3),
      hub('/properties/lot-for-sale/cavite', 'lot', 'sale', 'Cavite', 'Lots', 3),
      hub('/properties/warehouse-for-lease/laguna', 'warehouse', 'lease', 'Laguna', 'Warehouses', 1),
      // Malformed: never rendered.
      hub('/properties/Warehouse-For-Lease', 'warehouse', 'lease', '', 'Warehouses', 9),
      hub('https://evil.test/properties/x', 'lot', 'sale', '', 'Lots', 9),
      hub('/properties/a/b/c', 'lot', 'sale', '', 'Lots', 9),
      { ...hub('/properties/hall-for-rent', 'hall', 'lease', '', 'Halls', 9), deal: 'rent' },
      { ...hub('/properties/no-heading', 'lot', 'sale', '', 'Lots', 9), h1: '' },
      { ...hub('/properties/no-type', 'lot', 'sale', '', 'Lots', 9), type: '' },
    ],
  };
  await page.route('**/api/listings.php', (route) => route.fulfill({ json: feed }));

  await page.goto('/subsidiaries/realty/properties', { waitUntil: 'networkidle' });
  const browse = page.getByRole('navigation', { name: 'Browse properties' });
  await expect(browse.getByRole('list', { name: 'Browse by type' }).getByRole('link')).toHaveText(['Warehouses for Lease 4', 'Lots for Sale 3']);
  const popular = browse.getByRole('list', { name: 'Popular searches' }).getByRole('link');
  await expect(popular).toHaveCount(24);
  await expect(popular.first()).toHaveText('Residential Properties for Lease in San Fernando Pampanga 70');
  const showAll = browse.getByRole('button', { name: 'Show all 31' });
  await expect(showAll).toHaveAttribute('aria-expanded', 'false');
  await showAll.click();
  await expect(popular).toHaveCount(31);
  await expect(popular.last()).toHaveText('Lots for Sale in Cavite 3'); // the 1-listing Laguna hub is not indexable
  await expect(browse.getByRole('button', { name: 'Show fewer' })).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('a[href*="evil"], a[href*="Warehouse-For-Lease"], a[href*="for-rent"], a[href*="no-heading"], a[href*="no-type"], a[href$="/a/b/c"]')).toHaveCount(0);
  // Long chip labels wrap instead of widening the page.
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
  await page.setViewportSize({ width: 1280, height: 800 });

  // An indexable type + deal hub: canonical + og:url, no robots; its indexable areas as links.
  await browse.getByRole('link', { name: 'Warehouses for Lease 4' }).click();
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/warehouse-for-lease$/);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', `${REALTY}/properties/warehouse-for-lease`);
  await expect(page.locator('head meta[property="og:url"]')).toHaveAttribute('content', `${REALTY}/properties/warehouse-for-lease`);
  await expect(page.locator('head meta[name="robots"]')).toHaveCount(0);
  await expect(page.getByRole('region', { name: 'Listings' }).getByRole('article')).toHaveCount(4);
  const related = page.getByRole('navigation', { name: 'Related searches' });
  await expect(related.getByRole('list', { name: 'Browse by area' }).getByRole('link')).toHaveText(['Cavite 3']);

  // An area hub: its type + deal hub plus the area's other indexable hubs.
  await related.getByRole('link', { name: 'Cavite 3' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Warehouses for Lease in Cavite');
  await expect(page.getByRole('region', { name: 'Listings' }).getByRole('article')).toHaveCount(3);
  await expect(related.getByRole('link')).toHaveText(['Warehouses for Lease 4', 'Lots for Sale in Cavite 3']);
  await expect(page.locator('head link[rel="canonical"]')).toHaveAttribute('href', `${REALTY}/properties/warehouse-for-lease/cavite`);

  // The listing dialog links to its area hub when that is indexable, else to its type + deal hub.
  await page.getByRole('region', { name: 'Listings' }).getByRole('link').first().click();
  const more = page.getByRole('dialog').getByRole('link', { name: 'More Warehouses for Lease in Cavite' });
  await expect(more).toHaveAttribute('href', '/subsidiaries/realty/properties/warehouse-for-lease/cavite');
  await page.goto('/subsidiaries/realty/properties/APR-0E2E04', { waitUntil: 'networkidle' });
  await page.getByRole('dialog').getByRole('link', { name: 'More Warehouses for Lease' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(page).toHaveURL(/\/subsidiaries\/realty\/properties\/warehouse-for-lease$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Warehouses for Lease');
  expect(problems).toEqual([]);
});

test('Realty subdomain: browse and listing links use clean paths; a listing opened from a hub closes back to it', async ({ page, context }) => {
  await context.addCookies([{ name: 'apg_consent', value: 'declined', url: REALTY }]);
  await context.route(/^https:\/\/realty\.alphapremiergroup\.com\//, async (route) => {
    const { pathname, search } = new URL(route.request().url());
    await route.fulfill({ response: await route.fetch({ url: `${WEB}${pathname}${search}` }) });
  });
  await page.goto(`${REALTY}/properties/warehouse-for-lease`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Warehouses for Lease');
  await expect(page.getByRole('navigation', { name: 'Breadcrumb' }).getByRole('link', { name: 'Available Properties' })).toHaveAttribute('href', '/properties');
  const card = page.getByRole('region', { name: 'Listings' }).getByRole('link', { name: /Warehouse for Lease in Cavite/ });
  await expect(card).toHaveAttribute('href', '/properties/APR-A0A008');
  await card.click();
  await expect(page).toHaveURL(`${REALTY}/properties/APR-A0A008`);
  const dialog = page.getByRole('dialog', { name: 'Warehouse for Lease in Cavite' });
  await expect(dialog.getByRole('link', { name: 'More Warehouses for Lease' })).toHaveAttribute('href', '/properties/warehouse-for-lease');
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(page).toHaveURL(`${REALTY}/properties/warehouse-for-lease`);
  await expect(page.getByRole('region', { name: 'Listings' }).getByRole('article')).toHaveCount(2);
});

test('Realty share links: Facebook share and Copy link use the public URL on listing and browse pages', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  const facebook = (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
  await page.goto('/subsidiaries/realty/properties/APR-A0A000', { waitUntil: 'networkidle' });
  const dialog = page.getByRole('dialog');
  const share = dialog.getByRole('link', { name: /^Share on Facebook/ });
  await expect(share).toHaveAttribute('href', facebook(`${REALTY}/properties/APR-A0A000`));
  await expect(share).toHaveAttribute('target', '_blank');
  await dialog.getByRole('button', { name: 'Copy link' }).click();
  await expect(dialog.getByRole('button', { name: 'Link copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(`${REALTY}/properties/APR-A0A000`);

  await page.goto('/subsidiaries/realty/properties/warehouse-for-lease', { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: /^Share on Facebook/ })).toHaveAttribute('href', facebook(`${REALTY}/properties/warehouse-for-lease`));
  await page.goto('/subsidiaries/realty/properties', { waitUntil: 'networkidle' });
  await expect(page.getByRole('link', { name: /^Share on Facebook/ })).toHaveCount(0);
});

test('enterprise blog (Dynamic Tree): ?post= opens the article; Back closes it', async ({ page }) => {
  await page.goto('/subsidiaries/dynamic-tree/blogs', { waitUntil: 'networkidle' });
  const link = page.getByRole('link', { name: /^Read Full Article/ });
  const href = await link.getAttribute('href');
  await link.click();
  await expect(page).toHaveURL(new RegExp(`\\${href.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`));
  await expect(page.getByRole('heading', { level: 1, name: 'The Creative Journal' })).toBeHidden();
  await page.goBack();
  await expect(page).toHaveURL(/\/subsidiaries\/dynamic-tree\/blogs$/);
  await expect(page.getByRole('heading', { level: 1, name: 'The Creative Journal' })).toBeVisible();
  await page.goto(`/subsidiaries/dynamic-tree/blogs${href}`, { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1, name: 'The Creative Journal' })).toBeHidden();
});

for (const site of [
  { name: 'Realty', base: '/subsidiaries/realty', section: 'Services', heading: null },
  { name: '88 Prime', base: '/subsidiaries/88prime', section: 'Careers', heading: 'Build Your Career With 88 Prime.' },
  { name: 'SwiftClear', base: '/subsidiaries/swiftclear', section: 'Services', heading: 'Our Services' },
]) {
  test(`${site.name}: in-page nav updates the URL; Back and refresh restore the section`, async ({ page }) => {
    await page.goto(site.base, { waitUntil: 'networkidle' });
    const homeH1 = (await page.locator('h1:visible').first().innerText()).replace(/\s+/g, '');
    await page.getByRole('banner').getByRole('button', { name: site.section, exact: true }).first().click();
    const sectionUrl = `${site.base}/${site.section.toLowerCase()}`;
    await expect(page).toHaveURL(new RegExp(`${sectionUrl}$`));
    if (site.heading) await expect(page.getByRole('heading', { level: 1, name: site.heading })).toBeVisible();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(new RegExp(`${sectionUrl}$`));
    if (site.heading) await expect(page.getByRole('heading', { level: 1, name: site.heading })).toBeVisible();
    await page.goBack();
    await expect(page).toHaveURL(new RegExp(`${site.base}$`));
    await expect.poll(async () => (await page.locator('h1:visible').first().innerText()).replace(/\s+/g, '')).toBe(homeH1);
    await page.goForward();
    await expect(page).toHaveURL(new RegExp(`${sectionUrl}$`));
  });
}

test('chat widget opens and the FAQ bot answers from live data (Gemini off)', async ({ page }) => {
  const problems = watchPage(page);
  const silver = (await admin.get('/api/services.php?category=virtual-office')).data.data.find((s) => s.title === 'Premier Prestige'); // 2026 name of Silver
  await page.goto('/', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Open Concierge Chat' }).click();
  const input = page.getByRole('textbox', { name: 'Ask Alpha Premier Group...' });
  await expect(input).toBeVisible();
  await input.fill('What virtual office packages do you have?');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByText(silver.price, { exact: false }).last()).toBeVisible({ timeout: 15000 });
  await page.getByRole('button', { name: 'Close Chat' }).click();
  await expect(input).toBeHidden();
  expect(problems).toEqual([]);
});

for (const choice of ['Decline', 'Accept All']) {
  test(`cookie banner: "${choice}" is remembered across sites and reloads`, async ({ browser }) => {
    const context = await browser.newContext(); // no consent cookie: the banner must show
    const page = await context.newPage();
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const banner = page.getByRole('dialog', { name: 'Cookie consent' });
      await expect(banner).toBeVisible();
      await banner.getByRole('button', { name: choice }).click();
      await expect(banner).toBeHidden();
      const cookie = (await context.cookies()).find((c) => c.name === 'apg_consent');
      expect(cookie?.value).toBe(choice === 'Decline' ? 'declined' : 'accepted');
      await page.goto('/subsidiaries/swiftclear', { waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      await expect(page.getByRole('dialog', { name: 'Cookie consent' })).toBeHidden();
      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible();
      await expect(page.getByRole('dialog', { name: 'Cookie consent' })).toBeHidden();
    } finally {
      await context.close();
    }
  });
}

test('a lazy route chunk that fails once (stale deploy) reloads the page instead of breaking it', async ({ page }) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  let failed = 0;
  // The Contact page is its own lazy chunk; fail its first fetch like a chunk deleted by a deploy.
  await page.route(/\/assets\/Contact-[\w-]+\.js$/, (route) => (failed++ === 0 ? route.fulfill({ status: 404, body: '' }) : route.continue()));
  // Client-side navigation (what a link click does), so the app itself has to load the chunk.
  await page.evaluate(() => { window.history.pushState({}, '', '/contact'); window.dispatchEvent(new PopStateEvent('popstate')); });
  await expect(page.getByRole('heading', { level: 1, name: 'CONTACT US' })).toBeVisible({ timeout: 15000 });
  expect(failed).toBeGreaterThan(0);
  await expect(page.getByRole('alert').filter({ hasText: 'Something went wrong' })).toHaveCount(0);
});
