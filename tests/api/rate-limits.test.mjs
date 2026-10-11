// Rate limits, against the strict PHP server (production limits, APG_TEST_MODE off) on the same test
// DB. Runs sequentially in one file: every case shares the 127.0.0.1 buckets of that server.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, credentials, formStartedAt, multipart, qaEmail } from '../support/http.mjs';
import { API_STRICT } from '../support/env.mjs';

const strict = new Client(API_STRICT);
const relaxed = new Client();
let admin;
const emails = [];
before(async () => { admin = await as('superadmin'); });
after(async () => {
  for (const email of emails) {
    const rows = (await admin.get(`/api/admin/inquiries.php?q=${encodeURIComponent(email)}`)).data.data;
    for (const row of rows) await admin.delete(`/api/admin/inquiries.php?id=${row.id}`);
  }
});

const inquiry = (over = {}) => {
  const email = qaEmail('rl');
  emails.push(email);
  return { name: 'QA Limit', email, message: 'rate limit test', website: '', form_started_at: formStartedAt(), ...over };
};

describe('rate limits (production settings)', { concurrency: false }, () => {
  it('inquiries: rejected submissions do not count; the 6th accepted one in 10 minutes is a 429', async () => {
    for (let i = 0; i < 3; i += 1) {
      assert.equal((await strict.post('/api/inquire.php', { json: inquiry({ email: 'invalid' }) })).status, 400);
    }
    for (let i = 0; i < 5; i += 1) {
      const res = await strict.post('/api/inquire.php', { json: inquiry() });
      assert.equal(res.status, 200, `accepted #${i + 1}: ${res.text.slice(0, 120)}`);
    }
    const blocked = await strict.post('/api/inquire.php', { json: inquiry() });
    assert.equal(blocked.status, 429);
    assert.equal(blocked.data.success, false);
  });

  it('each form kind has its own budget (newsletter still accepted)', async () => {
    const body = inquiry({ form: 'newsletter' });
    assert.equal((await strict.post('/api/inquire.php', { json: body })).status, 200);
  });

  it('applications: 5 per 10 minutes', async () => {
    const ids = [];
    try {
      for (let i = 0; i < 5; i += 1) {
        const res = await strict.post('/api/applicants.php', { form: multipart({ fullName: 'QA Limit', email: qaEmail('rl'), phone: '0917', website: '', form_started_at: formStartedAt() }) });
        assert.equal(res.status, 200, res.text.slice(0, 120));
        ids.push(res.data.applicant_id);
      }
      const blocked = await strict.post('/api/applicants.php', { form: multipart({ fullName: 'QA Limit', email: qaEmail('rl'), phone: '0917', website: '', form_started_at: formStartedAt() }) });
      assert.equal(blocked.status, 429);
    } finally {
      for (const id of ids) await admin.delete(`/api/admin/applicants.php?id=${id}`);
    }
  });

  it('the test-mode server lifts the caps (APG_TEST_MODE=1 on php -S only)', async () => {
    for (let i = 0; i < 7; i += 1) {
      assert.equal((await relaxed.post('/api/inquire.php', { json: inquiry() })).status, 200);
    }
  });

  it('admin login: 5 failures lock the account and IP for 15 minutes, even with the right password', async () => {
    const { email, password } = credentials('editor');
    for (let i = 0; i < 5; i += 1) {
      const res = await strict.post('/api/admin/auth.php', { json: { email, password: 'wrong-password-qa' } });
      assert.equal(res.status, 401);
    }
    const locked = await strict.post('/api/admin/auth.php', { json: { email, password } });
    assert.equal(locked.status, 429);
    // The relaxed server keeps its own buckets: the account itself still works there.
    assert.equal((await relaxed.post('/api/admin/auth.php', { json: { email, password } })).status, 200);
  });
});
