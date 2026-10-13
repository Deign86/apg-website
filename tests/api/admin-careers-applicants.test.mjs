// api/admin/careers.php + api/admin/applicants.php, and their effect on the public careers feed.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client, as, formStartedAt, multipart, qaEmail, uid, uidName, PDF_BYTES } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

const web = new Client();
let sa;
let recruiter;
let editor;
const jobs = [];
const applicants = [];
before(async () => {
  [sa, recruiter, editor] = await Promise.all([as('superadmin'), as('recruiter'), as('editor')]);
});
after(async () => {
  for (const id of applicants) await sa.delete(`/api/admin/applicants.php?id=${id}`);
  for (const id of jobs) await sa.delete(`/api/admin/careers.php?id=${id}`);
});

const job = (over = {}) => ({ title: `QA Opening ${uid()}`, enterprise_slug: 'luxe-prime', location: 'Pasig', type: 'Full-Time', description: 'QA', requirements: ['a', 'b'], ...over });
const publicJobs = async (enterprise) => (await web.get(`/api/careers.php?enterprise=${enterprise}`)).data.data;

describe('admin careers', () => {
  it('a new opening appears only on its own enterprise\'s public feed, and leaves when closed or deleted', async () => {
    const body = job();
    const res = await recruiter.post('/api/admin/careers.php', { json: body });
    assert.equal(res.status, 201, res.text);
    jobs.push(res.data.id);
    const mine = (await publicJobs('luxe-prime')).find((j) => j.id === res.data.id);
    assert.ok(mine, 'listed for luxe-prime');
    assert.deepEqual(mine.requirements, ['a', 'b']);
    assert.ok(!(await publicJobs('realty')).some((j) => j.id === res.data.id), 'not on another enterprise');
    assert.ok(!(await publicJobs('corporate')).some((j) => j.id === res.data.id), 'not on corporate');

    const closed = await recruiter.put('/api/admin/careers.php', { json: { ...body, id: res.data.id, status: 'closed' } });
    assert.equal(closed.status, 200, closed.text);
    assert.ok(!(await publicJobs('luxe-prime')).some((j) => j.id === res.data.id), 'closed opening hidden');
    const adminList = (await recruiter.get('/api/admin/careers.php?enterprise=luxe-prime&status=closed')).data.data;
    assert.ok(adminList.some((j) => j.id === res.data.id));

    assert.equal((await recruiter.delete(`/api/admin/careers.php?id=${res.data.id}`)).status, 403, 'recruiter cannot delete');
    assert.equal((await sa.delete(`/api/admin/careers.php?id=${res.data.id}`)).status, 200);
    jobs.pop();
    assert.equal((await sa.delete(`/api/admin/careers.php?id=${res.data.id}`)).status, 404);
  });

  it('validates title, enterprise, duplicates, filters and ids', async () => {
    const body = job();
    const first = await sa.post('/api/admin/careers.php', { json: body });
    jobs.push(first.data.id);
    assert.equal((await sa.post('/api/admin/careers.php', { json: { ...body } })).status, 409, 'same title, same enterprise');
    const other = await sa.post('/api/admin/careers.php', { json: { ...body, enterprise_slug: 'realty' } });
    assert.equal(other.status, 201, 'same title on another enterprise is fine');
    jobs.push(other.data.id);
    assert.equal((await sa.post('/api/admin/careers.php', { json: job({ title: '' }) })).status, 400);
    assert.equal((await sa.post('/api/admin/careers.php', { json: job({ enterprise_slug: 'nowhere' }) })).status, 422);
    assert.equal((await sa.put('/api/admin/careers.php', { json: job({ id: 2147483000 }) })).status, 404);
    assert.equal((await sa.put('/api/admin/careers.php', { json: job() })).status, 400, 'no id');
    assert.equal((await sa.get('/api/admin/careers.php?enterprise=nowhere')).status, 422);
    assert.equal((await sa.get('/api/admin/careers.php?status=open')).status, 422);
  });
});

describe('admin applicants', () => {
  async function submit(fields = {}, withResume = true) {
    const res = await web.post('/api/applicants.php', {
      form: multipart(
        { fullName: uidName(), email: qaEmail('app'), phone: '0917 222 2222', jobTitle: 'General Application', enterprise: 'dynamic-tree', website: '', form_started_at: formStartedAt(), ...fields },
        withResume ? { resume: { name: 'QA Resume.pdf', type: 'application/pdf', data: PDF_BYTES } } : {},
      ),
    });
    assert.equal(res.status, 200, res.text);
    applicants.push(res.data.applicant_id);
    return res.data.applicant_id;
  }

  it('lists with filters/search, shows one, updates status and notes', async () => {
    const name = uidName('QA Search');
    const id = await submit({ fullName: name });
    const list = await recruiter.get(`/api/admin/applicants.php?enterprise=dynamic-tree&status=new&search=${encodeURIComponent(name)}`);
    assert.equal(list.status, 200);
    assert.deepEqual(list.data.data.map((a) => a.id), [id]);
    for (const k of ['total', 'new', 'interviewing', 'hired']) assert.equal(typeof list.data.summary[k], 'number');
    const upd = await recruiter.put('/api/admin/applicants.php', { json: { id, status: 'interviewing', internal_notes: 'Call Monday' } });
    assert.equal(upd.status, 200, upd.text);
    const one = (await recruiter.get(`/api/admin/applicants.php?id=${id}`)).data.data;
    assert.equal(one.status, 'interviewing');
    assert.equal(one.internal_notes, 'Call Monday');
    assert.equal((await recruiter.put('/api/admin/applicants.php', { json: { id, status: 'promoted' } })).status, 400);
    assert.equal((await recruiter.put('/api/admin/applicants.php', { json: { id } })).status, 400, 'nothing to update');
    assert.equal((await recruiter.put('/api/admin/applicants.php', { json: { id: 2147483000, status: 'new' } })).status, 404);
    assert.equal((await recruiter.get('/api/admin/applicants.php?id=2147483000')).status, 404);
  });

  it('streams the resume to hiring roles only, with its original name; 404 when missing', async () => {
    const id = await submit();
    const res = await recruiter.get(`/api/admin/applicants.php?action=resume&id=${id}`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'application/pdf');
    assert.match(res.headers.get('content-disposition'), /filename="QA Resume\.pdf"/);
    assert.ok(res.buffer.equals(PDF_BYTES), 'byte-identical');
    assert.equal((await editor.get(`/api/admin/applicants.php?action=resume&id=${id}`)).status, 403);
    assert.equal((await new Client().get(`/api/admin/applicants.php?action=resume&id=${id}`)).status, 401);
    assert.equal((await recruiter.get('/api/admin/applicants.php?action=resume&id=2147483000')).status, 404);
    assert.equal((await recruiter.get('/api/admin/applicants.php?action=resume&id=0')).status, 400);
    const noResume = await submit({}, false);
    assert.equal((await recruiter.get(`/api/admin/applicants.php?action=resume&id=${noResume}`)).status, 404);
  });

  it('re-screens with the keyword ATS (Gemini off)', async () => {
    const id = await submit({ coverLetter: 'Video production, casting and talent management experience.' });
    const res = await recruiter.post('/api/admin/applicants.php?action=rescreen', { json: { id } });
    assert.equal(res.status, 200, res.text);
    assert.equal(typeof res.data.data.ats_score, 'number');
    assert.notEqual(res.data.data.ats_method, 'ai');
    assert.equal((await recruiter.post('/api/admin/applicants.php?action=rescreen', { json: { id: 0 } })).status, 400);
  });

  it('delete removes the row and the resume file (delete capability only)', async () => {
    const id = await submit();
    const row = (await sa.get(`/api/admin/applicants.php?id=${id}`)).data.data;
    const file = path.join(ROOT, row.resume_path);
    assert.ok(fs.existsSync(file), 'resume stored on disk');
    assert.equal((await recruiter.delete(`/api/admin/applicants.php?id=${id}`)).status, 403);
    assert.equal((await sa.delete(`/api/admin/applicants.php?id=${id}`)).status, 200);
    applicants.splice(applicants.indexOf(id), 1);
    assert.equal(fs.existsSync(file), false, 'resume deleted');
    assert.equal((await sa.get(`/api/admin/applicants.php?id=${id}`)).status, 404);
    assert.equal((await sa.delete(`/api/admin/applicants.php?id=${id}`)).status, 404);
  });
});
