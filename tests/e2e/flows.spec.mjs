// Key visitor journeys on the production build, each checked end to end: the browser UI, the row the
// API stored (admin API), and the outgoing email when MAIL_SINK_DIR is set.
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
  await cards.first().getByRole('button').click();
  const dialog = page.getByRole('dialog', { name: 'Warehouse for Lease in Valenzuela' });
  await expect(dialog).toBeVisible();
  await expect(page).toHaveURL(/[?&]ref=APR-[0-9A-F]{6}$/);
  const ref = new URL(page.url()).searchParams.get('ref');

  // The ?ref deep link reopens the same listing on a fresh load.
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('dialog', { name: 'Warehouse for Lease in Valenzuela' })).toBeVisible();

  await page.getByRole('button', { name: 'Inquire about this property' }).click();
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

test('apex blog: open an article, deep link ?post= survives reload, close returns to the list', async ({ page }) => {
  await page.goto('/blogs', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'READ FULL ARTICLE' }).first().click();
  await expect(page).toHaveURL(/\/blogs\?post=[\w-]+/);
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  const title = (await dialog.getByRole('heading').first().innerText()).trim();
  await page.reload({ waitUntil: 'networkidle' });
  await expect(page.getByRole('dialog').getByRole('heading', { name: title })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page).toHaveURL(/\/blogs$/);
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
