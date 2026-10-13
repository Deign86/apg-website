// Hiring pipeline additions: per-opening 2x2 photo / portfolio links (api/applicants.php), ATS
// auto-reject + deferred rejection email (api/cron/ats-digest.php), and accept-for-interview
// (api/admin/applicants.php?action=invite).
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client, as, formStartedAt, mailEnabled, multipart, pngOf, qaEmail, uid, uidName, waitForMail, PDF_BYTES } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';
import { phpCli } from '../support/stack.mjs';

const web = new Client();
let sa;
let recruiter;
let editor;
const jobIds = [];
const applicantIds = [];
before(async () => {
  [sa, recruiter, editor] = await Promise.all([as('superadmin'), as('recruiter'), as('editor')]);
});
after(async () => {
  for (const id of applicantIds) await sa.delete(`/api/admin/applicants.php?id=${id}`);
  for (const id of jobIds) await sa.delete(`/api/admin/careers.php?id=${id}`);
});

async function createJob(over = {}) {
  const body = {
    title: `QA Role ${uid()}`, enterprise_slug: 'realty', location: 'Pasig', type: 'Internship', tag: 'Marketing',
    description: 'Social media content, listing copywriting and campaign reporting for property listings.',
    requirements: ['Marketing or Communications student', 'Canva and social media content'], ...over,
  };
  const res = await sa.post('/api/admin/careers.php', { json: body });
  assert.equal(res.status, 201, res.text);
  jobIds.push(res.data.id);
  return { ...body, id: res.data.id };
}

/** POSTs an application; returns the raw response (status/data) without asserting success. */
function apply(job, fields = {}, files = {}) {
  return web.post('/api/applicants.php', {
    form: multipart({
      fullName: uidName('QA Applicant'), email: qaEmail('ats'), phone: '0917 555 0101',
      jobTitle: job.title, jobId: String(job.id), enterprise: job.enterprise_slug, website: '', form_started_at: formStartedAt(),
      coverLetter: 'Marketing student with social media content, Canva and listing copywriting experience.', ...fields,
    }, { resume: { name: 'cv.pdf', type: 'application/pdf', data: PDF_BYTES }, ...files }),
  });
}
async function applyOk(job, fields, files) {
  const res = await apply(job, fields, files);
  assert.equal(res.status, 200, res.text);
  applicantIds.push(res.data.applicant_id);
  return res.data.applicant_id;
}
const photo = (w, h, name = 'me.png') => ({ photo: { name, type: 'image/png', data: pngOf(w, h) } });
const row = async (id) => (await sa.get(`/api/admin/applicants.php?id=${id}`)).data.data;
/** Runs SQL against the test DB (for backdating timestamps). */
function sql(statement) {
  const run = phpCli(['-r', `require 'api/config.php'; require 'api/db.php'; getDbConnection()->exec(${JSON.stringify(statement)});`]);
  assert.equal(run.status, 0, run.stderr + run.stdout);
}

describe('per-opening extras', () => {
  it('careers admin saves the photo/portfolio flags and the public feed exposes them', async () => {
    const job = await createJob({ require_photo: true, ask_portfolio: true });
    const listed = (await web.get('/api/careers.php?enterprise=realty')).data.data.find((j) => j.id === job.id);
    assert.equal(Number(listed.require_photo), 1);
    assert.equal(Number(listed.ask_portfolio), 1);
    const upd = await sa.put('/api/admin/careers.php', { json: { ...job, require_photo: false } });
    assert.equal(upd.status, 200, upd.text);
    const after = (await sa.get('/api/admin/careers.php?enterprise=realty')).data.data.find((j) => j.id === job.id);
    assert.equal(Number(after.require_photo), 0);
    assert.equal(Number(after.ask_portfolio), 1);
  });

  it('a photo-required opening accepts only a square JPG/PNG of at least 600x600', async () => {
    const job = await createJob({ require_photo: true });
    const cases = [
      [{}, /2x2 photo is required/],
      [photo(800, 600), /square 2x2 ID photo; this one is 800x600/],
      [photo(300, 300), /at least 600x600 pixels; this one is 300x300/],
      [{ photo: { name: 'fake.png', type: 'image/png', data: PDF_BYTES } }, /JPG or PNG/],
    ];
    for (const [files, message] of cases) {
      const res = await apply(job, {}, files);
      assert.equal(res.status, 400, res.text);
      assert.match(res.data.error, message);
    }
    const id = await applyOk(job, {}, photo(612, 600));
    const saved = await row(id);
    assert.match(saved.photo_path, /^uploads\/photos\/photo_.+\.png$/);
    assert.ok(fs.existsSync(path.join(ROOT, saved.photo_path)));

    const img = await recruiter.get(`/api/admin/applicants.php?action=photo&id=${id}`);
    assert.equal(img.status, 200);
    assert.equal(img.headers.get('content-type'), 'image/png');
    assert.equal((await editor.get(`/api/admin/applicants.php?action=photo&id=${id}`)).status, 403);
    assert.equal((await new Client().get(`/api/admin/applicants.php?action=photo&id=${id}`)).status, 401);

    assert.equal((await sa.delete(`/api/admin/applicants.php?id=${id}`)).status, 200);
    applicantIds.splice(applicantIds.indexOf(id), 1);
    assert.equal(fs.existsSync(path.join(ROOT, saved.photo_path)), false, 'photo deleted with the applicant');
  });

  it('openings without the flags ignore a photo and links', async () => {
    const job = await createJob();
    const id = await applyOk(job, { portfolioLinks: 'https://example.com' }, photo(600, 600));
    const saved = await row(id);
    assert.equal(saved.photo_path, null);
    assert.deepEqual(saved.portfolio_links, []);
  });

  it('portfolio links are optional, validated, capped at 5 and returned as a list', async () => {
    const job = await createJob({ ask_portfolio: true, tag: 'IT' });
    assert.equal((await apply(job, { portfolioLinks: 'ftp://files.example.com' })).status, 400);
    const six = Array.from({ length: 6 }, (_, i) => `https://site${i}.example.com`).join('\n');
    const tooMany = await apply(job, { portfolioLinks: six });
    assert.equal(tooMany.status, 400);
    assert.match(tooMany.data.error, /at most 5/);
    const id = await applyOk(job, { portfolioLinks: 'https://github.com/qa, https://qa.example.com/work\nhttps://github.com/qa' });
    assert.deepEqual((await row(id)).portfolio_links, ['https://github.com/qa', 'https://qa.example.com/work']);
    const none = await applyOk(job, { portfolioLinks: '' });
    assert.deepEqual((await row(none)).portfolio_links, []);
  });
});

describe('auto-reject and decisions', () => {
  it('a clear mismatch is auto-rejected; the cron emails it only after an hour, and an overturn cancels it', async () => {
    const job = await createJob({ title: `QA Structural Engineer ${uid()}`, tag: 'Engineering', description: 'Structural design and AutoCAD drafting.', requirements: ['Licensed civil engineer', 'AutoCAD', '5 years structural design'] });
    const mismatch = { coverLetter: 'I enjoy baking cakes.' };
    const rejected = await applyOk(job, mismatch, {});
    const overturned = await applyOk(job, mismatch, {});
    for (const id of [rejected, overturned]) {
      const r = await row(id);
      assert.equal(r.ats_details.recommendation, 'reject', `score ${r.ats_score}`);
      assert.equal(r.status, 'rejected');
      assert.ok(r.auto_rejected_at);
      assert.equal(r.decision_emailed_at, null);
    }
    assert.equal((await recruiter.put('/api/admin/applicants.php', { json: { id: overturned, status: 'reviewed' } })).status, 200);

    // Fresh rejections wait at least an hour (HR's window to overturn).
    phpCli(['api/cron/ats-digest.php']);
    assert.equal((await row(rejected)).decision_emailed_at, null);

    sql(`UPDATE job_applicants SET auto_rejected_at = NOW() - INTERVAL 2 HOUR WHERE id IN (${rejected}, ${overturned})`);
    const since = Date.now();
    const cron = phpCli(['api/cron/ats-digest.php']);
    assert.match(cron.stdout, /rejection email\(s\) sent/);
    const r = await row(rejected);
    if (mailEnabled) {
      assert.ok(r.decision_emailed_at, 'rejection email recorded');
      const mail = await waitForMail((m) => m.to.includes(r.email) && /Your application for/.test(m.subject), { since });
      assert.match(mail.text, /not to move forward/);
    }
    assert.equal((await row(overturned)).decision_emailed_at, null, 'overturned: no email');
  });

  it('a good match is not auto-rejected', async () => {
    const job = await createJob();
    const id = await applyOk(job, { coverLetter: 'Bachelor of Science in Marketing and Communications student with 2 years of social media content experience: Canva graphics, listing copywriting and campaign reporting for property listings at a real estate role.' });
    const r = await row(id);
    assert.notEqual(r.ats_details.recommendation, 'reject', `score ${r.ats_score}`);
    assert.equal(r.status, 'new');
    assert.equal(r.auto_rejected_at, null);
  });

  it('accept for interview: validates, sets Interviewing + schedule, clears auto-reject and emails the applicant', async () => {
    const job = await createJob();
    const id = await applyOk(job);
    sql(`UPDATE job_applicants SET status = 'rejected', auto_rejected_at = NOW() WHERE id = ${id}`);
    const future = new Date(Date.now() + 3 * 86400000);
    const pad = (n) => String(n).padStart(2, '0');
    const when = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())}T10:30`;
    const invite = (body, client = recruiter) => client.post('/api/admin/applicants.php?action=invite', { json: { id, ...body } });

    assert.equal((await invite({ interview_at: '2020-01-01T10:00' })).status, 400, 'past');
    assert.equal((await invite({ interview_at: 'next tuesday' })).status, 400, 'format');
    assert.equal((await invite({ interview_at: when, note: 'x'.repeat(1001) })).status, 400, 'note too long');
    assert.equal((await invite({ interview_at: when }, editor)).status, 403);
    assert.equal((await invite({ interview_at: when }, new Client())).status, 401);
    assert.equal((await recruiter.post('/api/admin/applicants.php?action=invite', { json: { id: 2147483000, interview_at: when } })).status, 404);

    const since = Date.now();
    const res = await invite({ interview_at: when, note: 'Ask for Ms. Santos at the reception.' });
    assert.equal(res.status, 200, res.text);
    assert.equal(res.data.data.status, 'interviewing');
    const r = await row(id);
    assert.equal(r.status, 'interviewing');
    assert.equal(r.interview_at, `${when.replace('T', ' ')}:00`);
    assert.equal(r.interview_note, 'Ask for Ms. Santos at the reception.');
    assert.equal(r.auto_rejected_at, null);
    if (mailEnabled) {
      assert.equal(res.data.emailed, true);
      assert.ok(r.decision_emailed_at);
      const mail = await waitForMail((m) => m.to.includes(r.email) && /Interview invitation/.test(m.subject), { since });
      assert.match(mail.text, /Tektite East Tower/);
      assert.match(mail.text, /10:30 AM/);
      assert.match(mail.text, /Ms\. Santos/);
    }
  });
});
