// Hiring pipeline in the browser: an opening that requires a 2x2 photo and asks for portfolio links
// (Careers Manager flags), the apply form's inline validation and photo check, the admin's view of
// the photo/links, and accepting the applicant for an interview. Also the inquiry forms' validation.
import { as, pngOf, uid } from '../support/http.mjs';
import { expect, signIn, skipCookieBanner, test, waitForFormTimer, watchPage } from './helpers.mjs';

let sa;
const jobIds = [];
const applicantEmails = [];
test.beforeAll(async () => { sa = await as('superadmin'); });
test.beforeEach(async ({ context }) => { await skipCookieBanner(context); });
test.afterAll(async () => {
  for (const email of applicantEmails) {
    const rows = (await sa.get(`/api/admin/applicants.php?search=${encodeURIComponent(email)}`)).data.data;
    for (const row of rows) await sa.delete(`/api/admin/applicants.php?id=${row.id}`);
  }
  for (const id of jobIds) await sa.delete(`/api/admin/careers.php?id=${id}`);
});

test('apply with a 2x2 photo and portfolio links, then the admin accepts the applicant for an interview', async ({ page }) => {
  const problems = watchPage(page);
  const title = `QA Hiring Intern ${uid()}`;
  const job = await sa.post('/api/admin/careers.php', { json: {
    title, enterprise_slug: 'realty', type: 'Internship', tag: 'Marketing', location: 'Ortigas Center, Pasig City',
    description: 'Social media content and listing copywriting.', requirements: ['Marketing student'], require_photo: true, ask_portfolio: true,
  } });
  expect(job.status, job.text).toBe(201);
  jobIds.push(job.data.id);

  await page.goto(`/careers/apply?job=${job.data.id}`, { waitUntil: 'networkidle' });
  const opened = Date.now();
  const form = page.getByRole('main');
  const photo = form.getByLabel('2x2 Photo *');
  await expect(photo).toBeVisible();
  await expect(form.getByLabel('Portfolio Links (optional)')).toBeVisible();

  // Inline validation: nothing is sent while fields are invalid.
  let posted = false;
  page.on('request', (req) => { if (req.url().includes('/api/applicants.php')) posted = true; });
  await form.getByRole('textbox', { name: /full name/i }).fill('J');
  await form.getByRole('textbox', { name: /mobile number/i }).fill('call me');
  await page.getByRole('button', { name: 'SUBMIT APPLICATION' }).click();
  await expect(form.getByText('Name must be at least 2 characters.')).toBeVisible();
  await expect(form.getByText('Phone number can only contain digits, spaces, +, (, ), - and periods.')).toBeVisible();
  await expect(form.getByText('A 2x2 photo is required for this position.')).toBeVisible();
  await expect(form.getByRole('textbox', { name: /full name/i })).toBeFocused();
  expect(posted).toBe(false);

  // A non-square photo is refused with its size; a 600x600 one is accepted.
  await photo.setInputFiles({ name: 'wide.png', mimeType: 'image/png', buffer: pngOf(800, 600) });
  await expect(form.getByText(/square 2x2 ID photo; this one is 800x600/)).toBeVisible();
  await photo.setInputFiles({ name: 'me.png', mimeType: 'image/png', buffer: pngOf(600, 600) });
  await expect(form.getByText(/this one is 800x600/)).toHaveCount(0);

  const email = `${uid('hire')}@apg.test`;
  applicantEmails.push(email);
  await form.getByRole('textbox', { name: /full name/i }).fill('Maria Santos');
  await expect(form.getByText('Name must be at least 2 characters.')).toHaveCount(0);
  await form.getByRole('textbox', { name: /email address/i }).fill(email);
  await form.getByRole('textbox', { name: /mobile number/i }).fill('0917 555 0101');
  await form.getByLabel('Portfolio Links (optional)').fill('https://github.com/maria\nhttps://maria.example.com');
  await form.locator('input[name="resume"]').setInputFiles({ name: 'cv.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4\n%%EOF\n') });
  await form.getByRole('textbox', { name: /cover note/i }).fill('Marketing student with social media content experience.');
  await waitForFormTimer(opened);
  await page.getByRole('button', { name: 'SUBMIT APPLICATION' }).click();
  await expect(page.getByRole('heading', { name: 'Application Received!' })).toBeVisible({ timeout: 30000 });

  const [row] = (await sa.get(`/api/admin/applicants.php?search=${encodeURIComponent(email)}`)).data.data;
  expect(row.photo_path).toMatch(/^uploads\/photos\//);
  expect(row.portfolio_links).toEqual(['https://github.com/maria', 'https://maria.example.com']);

  // Admin: photo + links in the detail view, then accept for an interview.
  await signIn(page, 'recruiter');
  await page.goto('/admin/applicants', { waitUntil: 'networkidle' });
  await page.getByRole('button', { name: 'Review Maria Santos' }).click();
  await expect(page.getByRole('img', { name: '2x2 photo of Maria Santos' })).toBeVisible();
  await expect(page.getByRole('link', { name: /github\.com\/maria/ })).toHaveAttribute('href', 'https://github.com/maria');
  await page.getByRole('button', { name: 'Accept for Interview' }).click();
  const when = new Date(Date.now() + 2 * 86400000);
  const pad = (n) => String(n).padStart(2, '0');
  await page.getByLabel('Interview date & time').fill(`${when.getFullYear()}-${pad(when.getMonth() + 1)}-${pad(when.getDate())}T14:00`);
  await page.getByLabel('Note to the applicant (optional)').fill('Ask for HR at the reception.');
  await page.getByRole('button', { name: 'Send Invitation' }).click();
  await expect(page.getByText(/Interview scheduled for .*2:00/)).toBeVisible();
  const after = (await sa.get(`/api/admin/applicants.php?id=${row.id}`)).data.data;
  expect(after.status).toBe('interviewing');
  expect(after.interview_note).toBe('Ask for HR at the reception.');
  expect(problems.filter((p) => !p.includes('/api/admin/applicants.php?action=invite'))).toEqual([]);
});

test('Careers Manager saves the photo and portfolio options', async ({ page }) => {
  const title = `QA Options ${uid()}`;
  const job = await sa.post('/api/admin/careers.php', { json: { title, enterprise_slug: 'realty', description: 'QA', requirements: [] } });
  jobIds.push(job.data.id);
  await signIn(page, 'recruiter');
  await page.goto('/admin/careers', { waitUntil: 'networkidle' });
  await page.getByRole('row', { name: new RegExp(title) }).getByRole('button', { name: /edit/i }).click();
  await page.getByLabel(/Require a 2x2 photo/).check();
  await page.getByLabel(/Ask for portfolio links/).check();
  await expect(page.getByLabel('Employment Type').locator('option[value="Internship"]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save Opening' }).click();
  await expect.poll(async () => {
    const saved = (await sa.get('/api/admin/careers.php?enterprise=realty')).data.data.find((j) => j.id === job.data.id);
    return [Number(saved.require_photo), Number(saved.ask_portfolio)];
  }).toEqual([1, 1]);
});

test('inquiry forms block invalid input inline and send nothing', async ({ page }) => {
  let posted = false;
  page.on('request', (req) => { if (req.url().includes('/api/inquire.php')) posted = true; });
  await page.goto('/contact', { waitUntil: 'networkidle' });
  const form = page.locator('form').filter({ has: page.getByRole('button', { name: /send/i }) }).first();
  await form.getByRole('textbox', { name: /name/i }).first().fill('1');
  await form.getByRole('textbox', { name: /email/i }).first().fill('not-an-email');
  await form.getByRole('button', { name: /send/i }).click();
  await expect(form.getByText('Name must be at least 2 characters.')).toBeVisible();
  await expect(form.getByText('Enter a valid email address, e.g. name@example.com.')).toBeVisible();
  await expect(form.locator('[aria-invalid="true"]').first()).toBeFocused();
  expect(posted).toBe(false);
});

test('the footer links to the contact page', async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.getByRole('contentinfo').getByRole('button', { name: 'Contact Us' }).click();
  await expect(page).toHaveURL(/\/contact$/);
  await expect(page.getByRole('heading', { name: 'Send us a message' })).toBeVisible();
});

test('Realty careers: the photo field shows for photo openings, portfolio for portfolio openings', async ({ page }) => {
  const make = async (title, flags) => {
    const res = await sa.post('/api/admin/careers.php', { json: { title, enterprise_slug: 'realty', type: 'Internship', description: 'QA', requirements: [], ...flags } });
    expect(res.status, res.text).toBe(201);
    jobIds.push(res.data.id);
  };
  const photoTitle = `QA Realty Photo ${uid()}`;
  const linksTitle = `QA Realty Links ${uid()}`;
  await make(photoTitle, { require_photo: true });
  await make(linksTitle, { ask_portfolio: true });

  const openApply = async (title) => {
    await page.goto('/subsidiaries/realty/careers', { waitUntil: 'networkidle' });
    await page.locator('div').filter({ hasText: title }).filter({ has: page.getByRole('button', { name: /APPLY NOW/ }) }).last()
      .getByRole('button', { name: /APPLY NOW/ }).click();
  };
  await openApply(photoTitle);
  await expect(page.getByLabel('2x2 Photo *')).toBeVisible();
  await expect(page.getByLabel('Portfolio Links (optional)')).toHaveCount(0);
  await page.getByRole('button', { name: /submit application/i }).click();
  await expect(page.getByText('A 2x2 photo is required for this position.')).toBeVisible();

  await openApply(linksTitle);
  await expect(page.getByLabel('Portfolio Links (optional)')).toBeVisible();
  await expect(page.getByLabel('2x2 Photo *')).toHaveCount(0);
});
