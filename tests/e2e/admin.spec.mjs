// Admin console in the browser: every page per role, the editing round trips (admin UI -> public
// site -> restore), the CSV download, the announcement banner, and session expiry.
// Edits touch only things no other spec asserts on (Contact page title, Alpha Premier plan price, the last
// listing, the announcement banner, which visual.spec hides), and each is restored in `finally`.
import fs from 'node:fs';
import { as, credentials, uid } from '../support/http.mjs';
import { WEB } from '../support/env.mjs';
import { expect, signIn, skipCookieBanner, test, watchPage } from './helpers.mjs';

const ADMIN_PAGES = [
  ['/admin', 'Welcome'],
  ['/admin/live-chat', 'Live Chat & Concierge Queue'],
  ['/admin/inquiries', 'Inquiries'],
  ['/admin/content', 'Content Editor'],
  ['/admin/services', 'Services & Packages'],
  ['/admin/listings', 'Property Listings'],
  ['/admin/careers', null],
  ['/admin/applicants', null],
  ['/admin/blogs', null],
  ['/admin/users', null],
];
// Capability each page needs (src/routes/admin/AdminShell.jsx).
const PAGE_CAPABILITY = {
  '/admin/live-chat': 'chat', '/admin/inquiries': 'inquiries', '/admin/content': 'content', '/admin/services': 'services',
  '/admin/listings': 'listings', '/admin/careers': 'careers', '/admin/applicants': 'applicants', '/admin/blogs': 'blogs', '/admin/users': 'users',
};
const ROLE_CAPS = {
  editor: ['blogs', 'content', 'services', 'listings'],
  recruiter: ['careers', 'applicants', 'chat'],
};

let sa;
test.beforeAll(async () => { sa = await as('superadmin'); });
test.beforeEach(async ({ context }) => { await skipCookieBanner(context); });

test('sign in through the form, then sign out', async ({ page }) => {
  const { email, password } = credentials('editor');
  await page.goto('/admin/blogs');
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByRole('textbox', { name: 'Email' }).fill(email);
  await page.getByRole('textbox', { name: 'Password' }).fill('definitely-wrong');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText(/invalid email or password/i)).toBeVisible();
  await page.getByRole('textbox', { name: 'Password' }).fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/admin(\/blogs)?$/);
  await page.getByRole('button', { name: 'Log out' }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
});

test('superadmin: every admin page renders without console errors or failed requests', async ({ page }) => {
  await signIn(page, 'superadmin');
  const problems = watchPage(page);
  for (const [path, heading] of ADMIN_PAGES) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(new RegExp(`${path}(\\?.*)?$`));
    const h1 = page.getByRole('heading', { level: 1 }).first();
    await expect(h1, path).toBeVisible();
    if (heading) await expect(h1).toContainText(heading);
    await expect(page.getByRole('alert').filter({ hasText: 'Something went wrong' })).toHaveCount(0);
  }
  expect(problems).toEqual([]);
});

for (const role of ['editor', 'recruiter']) {
  test(`${role}: allowed pages render, the rest redirect to the dashboard and are not in the menu`, async ({ page }) => {
    await signIn(page, role);
    const problems = watchPage(page);
    for (const [path, capability] of Object.entries(PAGE_CAPABILITY)) {
      await page.goto(path, { waitUntil: 'networkidle' });
      const nav = page.getByRole('navigation', { name: 'Admin sections' });
      const link = nav.locator(`a[href="${path}"]`);
      if (ROLE_CAPS[role].includes(capability)) {
        await expect(page, `${role} ${path}`).toHaveURL(new RegExp(`${path}(\\?.*)?$`));
        await expect(link).toHaveCount(1);
      } else {
        await expect(page, `${role} ${path}`).toHaveURL(/\/admin\/?$/);
        await expect(link).toHaveCount(0);
      }
    }
    expect(problems, 'no 403s or console errors from pages the role can open').toEqual([]);
  });
}

test('Content Editor: an edit shows on the public page; reset brings the default back', async ({ page }) => {
  await signIn(page, 'editor');
  const title = `E2E Contact ${uid()}`;
  try {
    await page.goto('/admin/content?page=contact', { waitUntil: 'networkidle' });
    const field = page.getByRole('textbox', { name: 'Title', exact: true });
    await expect(field).toHaveValue(/contact us/i);
    await field.fill(title);
    await page.getByRole('button', { name: /^save/i }).first().click();
    await expect(page.getByText(/saved/i).first()).toBeVisible();
    await page.goto('/contact', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(new RegExp(title, 'i'));
  } finally {
    await sa.delete('/api/admin/content.php?page=contact&key=hero_title');
  }
  await page.goto('/contact', { waitUntil: 'networkidle' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/contact us/i);
});

test('Announcement banner: enabled for one site shows only there and can be dismissed', async ({ page }) => {
  await signIn(page, 'admin');
  const text = `E2E announcement ${uid()}`;
  try {
    await page.goto('/admin/content?page=site', { waitUntil: 'networkidle' });
    const region = page.getByRole('region').filter({ has: page.getByRole('heading', { name: 'Announcement banner' }) });
    await region.getByRole('checkbox', { name: /Show the announcement banner/ }).check();
    await region.getByRole('textbox', { name: 'Announcement text' }).fill(text);
    await region.getByRole('checkbox', { name: 'Alta Venture' }).check();
    await page.getByRole('button', { name: /^save/i }).first().click();
    await expect(page.getByText(/saved/i).first()).toBeVisible();

    await page.goto('/subsidiaries/alta-venture/inquire', { waitUntil: 'networkidle' });
    const banner = page.getByRole('region', { name: 'Announcement' });
    await expect(banner).toContainText(text);
    for (const other of ['/', '/subsidiaries/construction/inquire']) {
      await page.goto(other, { waitUntil: 'networkidle' });
      await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0);
    }
    await page.goto('/subsidiaries/alta-venture/inquire', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: 'Dismiss announcement' }).click();
    await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0);
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page.getByRole('region', { name: 'Announcement' })).toHaveCount(0);
  } finally {
    for (const key of ['announcement_enabled', 'announcement_text', 'announcement_sites']) {
      await sa.delete(`/api/admin/content.php?page=site&key=${key}`);
    }
  }
});

test('Property Listings: hiding a listing removes it from the Realty site; unhiding restores it', async ({ page }) => {
  await signIn(page, 'editor');
  const listings = (await sa.get('/api/admin/listings.php')).data.data;
  const target = listings[listings.length - 1];
  try {
    await page.goto('/admin/listings', { waitUntil: 'networkidle' });
    const row = page.getByRole('row').filter({ hasText: target.ref });
    await row.getByRole('button', { name: 'Hidden' }).click();
    await expect.poll(async () => (await sa.get('/api/admin/listings.php')).data.overrides[target.ref]?.hidden).toBe(true);
    await page.goto('/subsidiaries/realty/properties', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 3, name: target.title })).toHaveCount(0);
    await page.goto('/admin/listings', { waitUntil: 'networkidle' });
    await page.getByRole('row').filter({ hasText: target.ref }).getByRole('button', { name: 'Hidden' }).click();
    await expect.poll(async () => (await sa.get('/api/admin/listings.php')).data.overrides[target.ref]?.hidden).toBe(false);
    await page.goto('/subsidiaries/realty/properties', { waitUntil: 'networkidle' });
    await expect(page.getByRole('heading', { level: 3, name: target.title })).toBeVisible();
  } finally {
    await sa.put('/api/admin/listings.php', { json: { ref: target.ref, hidden: false, featured: false, sort_order: null, price_override: null, note: null } });
  }
});

test('Services & Packages: a Virtual Office price edit shows on /virtual-office, then is restored', async ({ page }) => {
  await signIn(page, 'editor');
  // The 2026 plans (fix:virtual-office-2026-plans): Alpha Premier was the Gold suite.
  const gold = (await sa.get('/api/admin/services.php?category=virtual-office')).data.data.find((s) => s.title === 'Alpha Premier');
  const price = `₱7,${Math.floor(100 + Math.random() * 899)} / mo`;
  try {
    await page.goto('/admin/services', { waitUntil: 'networkidle' });
    await page.getByRole('button', { name: `Edit ${gold.title}` }).click();
    // The "Price Display" label is not tied to its input, so the field is found by its placeholder.
    const priceField = page.getByPlaceholder('e.g. ₱5,500 / mo or Contact for Price');
    await expect(priceField).toHaveValue(gold.price);
    await priceField.fill(price);
    await page.getByRole('button', { name: 'Save Service' }).click();
    await expect(priceField).toBeHidden();
    await expect(page.getByRole('row').filter({ has: page.getByRole('cell', { name: gold.title, exact: true }) })).toContainText(price);
    await page.goto('/virtual-office', { waitUntil: 'networkidle' });
    await expect(page.getByText(price).first()).toBeVisible();
  } finally {
    await sa.put('/api/admin/services.php', { json: gold });
  }
});

test('Inquiries: CSV export downloads a BOM-prefixed spreadsheet', async ({ page }) => {
  await signIn(page, 'admin');
  await page.goto('/admin/inquiries', { waitUntil: 'networkidle' });
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('link', { name: 'Export CSV' }).click()]);
  const bytes = fs.readFileSync(await download.path());
  expect(download.suggestedFilename(), bytes.toString('utf8').slice(0, 300)).toMatch(/^inquiries-\d{8}-\d{4}\.csv$/);
  expect([...bytes.subarray(0, 3)]).toEqual([0xef, 0xbb, 0xbf]);
  expect(bytes.toString('utf8')).toContain('ID,Received,"Last activity",Kind,Company,Status,Name,Email');
});

test('a session ended elsewhere (password reset) sends the admin back to the sign-in page', async ({ page }) => {
  const email = `${uid('e2e-session')}@apg.test`;
  const password = `Pw-${uid()}`;
  const created = await sa.post('/api/admin/users.php', { json: { email, password, name: 'E2E Session', role: 'editor' } });
  expect(created.status).toBe(201);
  try {
    const res = await page.request.post('/api/admin/auth.php', { data: { email, password }, headers: { Origin: WEB } });
    expect(res.status()).toBe(200);
    await page.goto('/admin/blogs', { waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/admin\/blogs$/);
    await sa.put('/api/admin/users.php', { json: { id: created.data.id, password: `Reset-${uid()}` } });
    await page.reload({ waitUntil: 'networkidle' });
    await expect(page).toHaveURL(/\/admin\/login/);
  } finally {
    await sa.delete(`/api/admin/users.php?id=${created.data.id}`);
  }
});
