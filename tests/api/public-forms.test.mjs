// Public submissions: api/inquire.php (inquiries, listing inquiries, newsletter, feedback) and
// api/applicants.php (job applications with resumes). Each accepted submission is checked in the
// admin inbox / applicant list, and (with MAIL_SINK_DIR) in the outgoing mail.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Client, as, formStartedAt, multipart, qaEmail, uid, mailEnabled, waitForMail, PDF_BYTES, PNG_BYTES } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

const web = new Client();
let admin;
const createdApplicants = [];
const createdInquiries = [];

before(async () => { admin = await as('superadmin'); });
after(async () => {
  for (const id of createdApplicants) await admin.delete(`/api/admin/applicants.php?id=${id}`);
  for (const id of createdInquiries) await admin.delete(`/api/admin/inquiries.php?id=${id}`);
});

const inquiry = (over = {}) => ({
  name: 'QA Visitor', email: qaEmail(), phone: '0917 000 0000', message: 'Testing the inquiry form.',
  enterprise: 'corporate', website: '', form_started_at: formStartedAt(), ...over,
});

/** Inbox rows matching an email (admin API). */
async function inboxRows(email) {
  const res = await admin.get(`/api/admin/inquiries.php?q=${encodeURIComponent(email)}`);
  assert.equal(res.status, 200);
  for (const row of res.data.data) if (!createdInquiries.includes(row.id)) createdInquiries.push(row.id);
  return res.data.data;
}

const firstJob = async (enterprise) => (await web.get(`/api/careers.php?enterprise=${enterprise}`)).data.data[0];
const application = (over = {}) => ({
  fullName: 'QA Applicant', email: qaEmail('applicant'), phone: '0917 111 1111', jobTitle: 'General Application',
  enterprise: 'corporate', coverLetter: 'Hello', website: '', form_started_at: formStartedAt(), ...over,
});
async function apply(fields, files = { resume: { name: 'cv.pdf', type: 'application/pdf', data: PDF_BYTES } }) {
  const res = await web.post('/api/applicants.php', { form: multipart(fields, files) });
  if (res.data?.applicant_id) createdApplicants.push(res.data.applicant_id);
  return res;
}

describe('api/inquire.php', () => {
  it('accepts an inquiry, stores it in the inbox and answers with a ticket', async () => {
    const since = Date.now();
    const body = inquiry({ enterprise: 'Swift Clear Facility & Cleaning', subject: `QA ${uid()}`, budget: 'Under 50k', custom_field: 'extra' });
    const res = await web.post('/api/inquire.php', { json: body });
    assert.equal(res.status, 200, res.text);
    assert.match(res.data.ticket, /^APG-[0-9A-F]{8}$/);
    const [row] = await inboxRows(body.email);
    assert.equal(row.kind, 'inquiry');
    assert.equal(row.enterprise_slug, 'swiftclear', 'free-text enterprise resolves to its slug');
    assert.equal(row.status, 'new');
    assert.equal(row.meta.ticket, res.data.ticket);
    assert.equal(row.meta.budget, 'Under 50k');
    assert.equal(row.meta.fields['Custom Field'], 'extra');
    if (mailEnabled) {
      const team = await waitForMail((m) => m.subject.includes(res.data.ticket) && m.to.includes('inbox@apg.test'), { since });
      assert.ok(team.replyTo.includes(`<${body.email}>`), `team mail replies to the visitor (Reply-To: ${team.replyTo})`);
      const confirm = await waitForMail((m) => m.to.includes(body.email), { since });
      assert.ok(confirm.subject.includes(res.data.ticket));
      assert.ok(!confirm.text.includes('Testing the inquiry form.'), 'confirmation never echoes the visitor message');
      assert.ok(confirm.html.includes('href="https://g.page/r/CY7qxdHoCHDuEBM/review"'), 'confirmation asks for a review on the group profile');
    }
  });

  it('Virtual Office confirmations link its own review form; newsletter ones ask for none', { skip: !mailEnabled && 'MAIL_SINK_DIR not set' }, async () => {
    const since = Date.now();
    const vo = inquiry({ enterprise: 'virtual-office' });
    assert.equal((await web.post('/api/inquire.php', { json: vo })).status, 200);
    await inboxRows(vo.email);
    const voMail = await waitForMail((m) => m.to.includes(vo.email), { since });
    assert.ok(voMail.html.includes('href="https://g.page/r/Cf--Z4S0aFu0EBM/review"'));
    const news = inquiry({ form: 'newsletter' });
    assert.equal((await web.post('/api/inquire.php', { json: news })).status, 200);
    await inboxRows(news.email);
    const newsMail = await waitForMail((m) => m.to.includes(news.email), { since });
    assert.ok(!newsMail.html.includes('g.page/r/'), 'no review ask in a newsletter confirmation');
  });

  it('accepts multipart form posts too', async () => {
    const body = inquiry();
    const res = await web.post('/api/inquire.php', { form: multipart(body) });
    assert.equal(res.status, 200, res.text);
    assert.equal((await inboxRows(body.email)).length, 1);
  });

  it('a listing ref from the live feed becomes a listing inquiry', { skip: !fs.existsSync(`${ROOT}/api/data/listings.generated.json`) && 'no listings feed' }, async () => {
    const since = Date.now();
    const ref = (await web.get('/api/listings.php')).data.data[0].ref;
    const body = inquiry({ enterprise: 'realty', property: `${ref} — some title` });
    const res = await web.post('/api/inquire.php', { json: body });
    assert.equal(res.status, 200, res.text);
    const [row] = await inboxRows(body.email);
    assert.equal(row.kind, 'listing');
    assert.equal(row.enterprise_slug, 'realty');
    assert.equal(row.meta.listing_ref, ref);
    if (mailEnabled) {
      const confirm = await waitForMail((m) => m.to.includes(body.email), { since });
      assert.ok(confirm.html.includes(`href="https://realty.alphapremiergroup.com/properties/${ref}"`), 'confirmation links the listing page');
    }
    // A made-up ref is just text.
    const fake = inquiry({ property: 'APR-FFFFFF' });
    await web.post('/api/inquire.php', { json: fake });
    const [fakeRow] = await inboxRows(fake.email);
    assert.equal(fakeRow.kind, 'inquiry');
    assert.equal(fakeRow.meta.property, 'APR-FFFFFF');
  });

  it('a job title makes it an application question', async () => {
    const body = inquiry({ jobTitle: 'Site Engineer' });
    assert.equal((await web.post('/api/inquire.php', { json: body })).status, 200);
    assert.equal((await inboxRows(body.email))[0].kind, 'application_question');
  });

  it('newsletter sign-ups are stored once per address', async () => {
    const email = qaEmail('news');
    for (let i = 0; i < 2; i += 1) {
      const res = await web.post('/api/inquire.php', { json: { form: 'newsletter', email, enterprise: 'realty', website: '', form_started_at: formStartedAt() } });
      assert.equal(res.status, 200, res.text);
    }
    const rows = await inboxRows(email);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].kind, 'newsletter');
    assert.equal(rows[0].name, 'Newsletter subscriber');
  });

  it('careers feedback is stored as feedback', async () => {
    const body = inquiry({ form: 'feedback', enterprise: 'construction', message: 'Great process' });
    assert.equal((await web.post('/api/inquire.php', { json: body })).status, 200);
    const [row] = await inboxRows(body.email);
    assert.equal(row.kind, 'feedback');
    assert.equal(row.enterprise_slug, 'construction');
  });

  it('a Pay Online submission with its proof attached is stored as a payment', async () => {
    const since = Date.now();
    const proof = { attachment: { name: 'receipt.png', type: 'image/png', data: PNG_BYTES } };
    const payment = (over = {}) => inquiry({
      form: 'payment', enterprise: 'virtual-office', service: 'Premier Access (₱2,899 / mo)', amount: '₱2,899',
      payment_method: 'GCash', reference_no: 'GC-1234567', message: '', ...over,
    });
    const body = payment();
    const res = await web.post('/api/inquire.php', { form: multipart(body, proof) });
    assert.equal(res.status, 200, res.text);
    const [row] = await inboxRows(body.email);
    assert.equal(row.kind, 'payment');
    assert.equal(row.enterprise_slug, 'virtual-office');
    assert.equal(row.meta.amount, '₱2,899.00');
    assert.equal(row.meta.payment_method, 'GCash');
    assert.equal(row.meta.reference_no, 'GC-1234567');
    assert.equal(row.meta.attachment, 'receipt.png');
    assert.equal(row.subject, 'Payment ₱2,899.00 via GCash — QA Visitor (Premier Access (₱2,899 / mo))');
    if (mailEnabled) {
      const team = await waitForMail((m) => m.subject.includes(res.data.ticket) && !m.to.includes(body.email), { since });
      assert.ok(team.html.includes('Amount paid') && team.html.includes('₱2,899.00'), 'team mail lists the amount');
      const confirm = await waitForMail((m) => m.to.includes(body.email), { since });
      assert.ok(confirm.subject.includes('payment proof'), confirm.subject);
      assert.ok(confirm.html.includes('₱2,899.00') && !confirm.html.includes('GC-1234567'), 'confirmation repeats only the amount');
      assert.ok(!confirm.html.includes('g.page/r/'), 'no review ask in a payment confirmation');
    }
    // Missing proof, a non-numeric amount, no channel, or a non-image proof: rejected and never stored.
    for (const [label, over, files] of [
      ['no proof', {}, {}],
      ['bad amount', { amount: 'two thousand' }, proof],
      ['no channel', { payment_method: '' }, proof],
      ['no purpose', { service: '' }, proof],
      ['proof as .docx', {}, { attachment: { name: 'receipt.docx', data: Buffer.from('PK') } }],
    ]) {
      const bad = payment();
      const r = await web.post('/api/inquire.php', { form: multipart({ ...bad, ...over }, files) });
      assert.equal(r.status, 400, `${label}: ${r.text.slice(0, 160)}`);
      assert.equal((await inboxRows(bad.email)).length, 0, label);
    }
  });

  it('rejects bots and bad input with 4xx and stores nothing', async () => {
    const cases = [
      ['honeypot filled', inquiry({ website: 'http://spam.test' }), 400],
      // A future start time is always "too fast", however long the earlier cases take on a busy server.
      ['submitted too fast', inquiry({ form_started_at: String(Date.now() + 60000) }), 400],
      ['no form timing', inquiry({ form_started_at: undefined }), 400],
      ['stale form (> 4h)', inquiry({ form_started_at: String(Date.now() - 5 * 3600 * 1000) }), 400],
      ['link in name', inquiry({ name: 'Buy http://spam.test' }), 400],
      ['many links', inquiry({ message: 'http://a.test http://b.test http://c.test' }), 400],
      ['missing email', inquiry({ email: '' }), 400],
      ['invalid email', inquiry({ email: 'not-an-email' }), 400],
      ['missing name', inquiry({ name: '' }), 400],
      ['oversized message', inquiry({ message: 'x'.repeat(40001) }), 400],
      ['name as array', inquiry({ name: ['QA'] }), 400],
      ['email as object', inquiry({ email: { a: 1 } }), 400],
    ];
    for (const [label, body, status] of cases) {
      const res = await web.post('/api/inquire.php', { json: JSON.parse(JSON.stringify(body)) });
      assert.equal(res.status, status, `${label}: ${res.text.slice(0, 160)}`);
      assert.equal(res.data?.success, false, label);
      if (typeof body.email === 'string' && body.email.includes('@')) assert.equal((await inboxRows(body.email)).length, 0, label);
    }
    assert.equal((await web.get('/api/inquire.php')).status, 405);
    assert.ok((await web.post('/api/inquire.php', { json: '[1,2]' })).status < 500, 'JSON list body');
    assert.ok((await web.post('/api/inquire.php', { json: '"text"' })).status < 500, 'JSON string body');
  });

  it('Turnstile is off locally: no token needed (and a junk token is ignored)', async () => {
    const body = inquiry({ turnstile_token: 'junk' });
    assert.equal((await web.post('/api/inquire.php', { json: body })).status, 200);
    await inboxRows(body.email);
  });

  it('rejects an attachment with a disallowed extension', async () => {
    const body = inquiry();
    const res = await web.post('/api/inquire.php', { form: multipart(body, { attachment: { name: 'x.exe', data: Buffer.from('MZ') } }) });
    assert.equal(res.status, 400);
    assert.equal((await inboxRows(body.email)).length, 0);
  });
});

describe('api/applicants.php', () => {
  it('accepts a PDF application; enterprise comes from the matched opening; HR + applicant are emailed', async () => {
    const job = await firstJob('construction');
    assert.ok(job, 'construction has an opening');
    const since = Date.now();
    const fields = application({ jobTitle: job.title, jobId: String(job.id), enterprise: 'Construction division' });
    const res = await apply(fields);
    assert.equal(res.status, 200, res.text);
    assert.match(res.data.ticket, /^APG-APP-[0-9A-F]{8}$/);
    const row = (await admin.get(`/api/admin/applicants.php?id=${res.data.applicant_id}`)).data.data;
    assert.equal(row.enterprise_slug, 'construction');
    assert.equal(row.job_id, job.id);
    assert.equal(row.resume_filename, 'cv.pdf');
    assert.match(row.resume_path, /^uploads\/resumes\/resume_\d{8}_\d{6}_[0-9a-f]{16}\.pdf$/);
    if (mailEnabled) {
      await waitForMail((m) => m.to.includes('hr@apg.test') && m.raw.includes(fields.email), { since, timeout: 30000 });
      await waitForMail((m) => m.to.includes(fields.email) && m.subject.includes(res.data.ticket), { since, timeout: 30000 });
    }
  });

  it('an apex "division" label resolves to the opening\'s enterprise (no corporate attribution)', async () => {
    const job = await firstJob('luxe-prime');
    const res = await apply(application({ jobTitle: job.title, enterprise: 'Logistics' }));
    assert.equal(res.status, 200, res.text);
    const row = (await admin.get(`/api/admin/applicants.php?id=${res.data.applicant_id}`)).data.data;
    assert.equal(row.enterprise_slug, 'luxe-prime');
  });

  it('accepts a general application without a resume', async () => {
    const res = await apply(application({ enterprise: 'alta-venture' }), {});
    assert.equal(res.status, 200, res.text);
    const row = (await admin.get(`/api/admin/applicants.php?id=${res.data.applicant_id}`)).data.data;
    assert.equal(row.enterprise_slug, 'alta-venture');
    assert.equal(row.resume_path, '');
  });

  it('rejects wrong-type, empty, oversized and missing-field submissions', async () => {
    const reject = async (label, fields, files, status) => {
      const res = await apply(fields, files);
      assert.equal(res.status, status, `${label}: ${res.text.slice(0, 200)}`);
      assert.equal(res.data?.success, false, label);
    };
    await reject('exe resume', application(), { resume: { name: 'cv.exe', data: Buffer.from('MZ') } }, 400);
    await reject('double extension', application(), { resume: { name: 'cv.pdf.php', data: Buffer.from('<?php') } }, 400);
    await reject('empty resume', application(), { resume: { name: 'cv.pdf', data: Buffer.alloc(0) } }, 400);
    await reject('15 MB + 1 byte', application(), { resume: { name: 'cv.pdf', data: Buffer.alloc(15 * 1024 * 1024 + 1) } }, 400);
    await reject('over post_max_size', application(), { resume: { name: 'cv.pdf', data: Buffer.alloc(21 * 1024 * 1024) } }, 413);
    await reject('missing name', application({ fullName: '' }), undefined, 400);
    await reject('bad email', application({ email: 'nope' }), undefined, 400);
    await reject('missing phone', application({ phone: '' }), undefined, 400);
    await reject('too fast', application({ form_started_at: String(Date.now()) }), undefined, 400);
    await reject('honeypot', application({ website: 'x' }), undefined, 400);
  });

  it('JSON bodies with array fields are a 4xx, never a 500', async () => {
    const res = await web.post('/api/applicants.php', { json: { ...application(), fullName: ['x'], email: ['a@b.c'] } });
    assert.ok(res.status >= 400 && res.status < 500, `${res.status}`);
  });
});
