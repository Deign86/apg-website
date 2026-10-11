// api/admin/auth.php: login / check / logout, origin checks, password reset by emailed code, and
// session_version invalidation when a password changes. Uses throwaway accounts for anything that
// changes a password, so parallel files keep working with the seeded ones.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, credentials, uid, mailEnabled, waitForMail } from '../support/http.mjs';

let superadmin;
const created = [];
before(async () => { superadmin = await as('superadmin'); });
after(async () => {
  for (const id of created) await superadmin.delete(`/api/admin/users.php?id=${id}`);
});

async function throwawayAdmin(role = 'editor') {
  const email = `${uid('pw')}@apg.test`;
  const password = `Pw-${uid()}`;
  const res = await superadmin.post('/api/admin/users.php', { json: { email, name: 'QA Throwaway', role, password } });
  assert.equal(res.status, 201, res.text);
  created.push(res.data.id);
  return { id: res.data.id, email, password };
}

describe('admin auth', () => {
  it('check is unauthenticated without a session', async () => {
    const res = await new Client().get('/api/admin/auth.php?action=check');
    assert.equal(res.status, 200);
    assert.deepEqual(res.data, { authenticated: false, user: null });
  });

  it('login returns the user with role, rotates the session id, and check sees it', async () => {
    const c = new Client();
    await c.get('/api/admin/auth.php?action=check');
    const before = c.cookies.get('PHPSESSID');
    const { email, password } = credentials('recruiter');
    const res = await c.login(email, password);
    assert.equal(res.data.user.role, 'recruiter');
    assert.equal('password_hash' in res.data.user, false);
    assert.notEqual(c.cookies.get('PHPSESSID'), before, 'session id regenerated on login');
    assert.match(res.headers.getSetCookie().join(';'), /HttpOnly/i);
    const check = await c.get('/api/admin/auth.php?action=check');
    assert.equal(check.data.authenticated, true);
    assert.equal(check.data.user.email, email);
  });

  it('wrong password 401, missing fields 400, non-string fields 400', async () => {
    const c = new Client();
    const { email } = credentials('editor');
    assert.equal((await c.post('/api/admin/auth.php', { json: { email, password: 'nope-nope-nope' } })).status, 401);
    assert.equal((await c.post('/api/admin/auth.php', { json: { email: 'ghost@apg.test', password: 'nope-nope-nope' } })).status, 401);
    assert.equal((await c.post('/api/admin/auth.php', { json: { email } })).status, 400);
    assert.equal((await c.post('/api/admin/auth.php', { json: { email: [email], password: ['x'] } })).status, 400);
    assert.equal((await c.get('/api/admin/auth.php?action=nonsense')).status, 400);
  });

  it('logout is POST-only, same-origin, and ends the session', async () => {
    const c = await as('editor');
    assert.equal((await c.get('/api/admin/auth.php?action=logout')).status, 405);
    assert.equal((await c.post('/api/admin/auth.php?action=logout', { origin: 'https://evil.example' })).status, 403);
    assert.equal((await c.get('/api/admin/auth.php?action=check')).data.authenticated, true, 'cross-site logout ignored');
    assert.equal((await c.post('/api/admin/auth.php?action=logout')).status, 200);
    assert.equal((await c.get('/api/admin/auth.php?action=check')).data.authenticated, false);
    assert.equal((await c.get('/api/admin/blogs.php')).status, 401);
  });

  it('rejects cross-origin state changes but allows the production, local and own origins', async () => {
    const { email, password } = credentials('editor');
    for (const origin of ['https://evil.example', 'https://alphapremiergroup.com.evil.example', 'null', 'http://localhost.evil.example']) {
      const res = await new Client().post('/api/admin/auth.php', { json: { email, password }, origin });
      assert.equal(res.status, 403, origin);
    }
    for (const origin of ['https://alphapremiergroup.com', 'http://localhost:5173', 'http://127.0.0.1:8001']) {
      const res = await new Client().post('/api/admin/auth.php', { json: { email, password }, origin });
      assert.equal(res.status, 200, origin);
    }
    const editor = await as('editor');
    const write = await editor.post('/api/admin/blogs.php', { json: { title: 'x', content: 'y' }, origin: 'https://evil.example' });
    assert.equal(write.status, 403, 'admin writes are origin-checked too');
  });

  it('an admin write with neither Origin nor Referer is refused; a same-site Referer is enough', async () => {
    const editor = await as('editor');
    const bare = await editor.post('/api/admin/blogs.php', { json: { title: '', content: '' }, origin: null });
    assert.equal(bare.status, 403);
    const viaReferer = await editor.post('/api/admin/blogs.php', { json: { title: '', content: '' }, origin: null, headers: { Referer: 'http://localhost:5180/admin/blogs' } });
    assert.equal(viaReferer.status, 400, 'passes the origin check, then fails validation');
    const evilReferer = await editor.post('/api/admin/blogs.php', { json: { title: '', content: '' }, origin: null, headers: { Referer: 'https://evil.example/admin' } });
    assert.equal(evilReferer.status, 403);
  });

  it('reset-code answers identically for unknown emails; a wrong code is rejected', async () => {
    const c = new Client();
    const unknown = await c.post('/api/admin/auth.php?action=reset-code', { json: { email: 'nobody@apg.test' } });
    const known = await new Client().post('/api/admin/auth.php?action=reset-code', { json: { email: credentials('editor').email } });
    assert.equal(unknown.status, 200);
    assert.equal(known.status, 200);
    assert.equal(unknown.data.message, known.data.message);
    const wrong = await c.post('/api/admin/auth.php?action=reset', { json: { code: '000000', new_password: 'Whatever-123456' } });
    assert.equal(wrong.status, 403);
    assert.equal((await c.post('/api/admin/auth.php?action=reset-code', { json: {} })).status, 400);
    assert.equal((await new Client().post('/api/admin/auth.php?action=reset', { json: { code: '1', new_password: 'x' } })).status, 400, 'no pending code');
  });

  it('password reset via the emailed code; old sessions of that admin end', { skip: !mailEnabled && 'MAIL_SINK_DIR not set' }, async () => {
    const acct = await throwawayAdmin();
    const oldSession = new Client();
    await oldSession.login(acct.email, acct.password);
    const resetter = new Client();
    const since = Date.now();
    assert.equal((await resetter.post('/api/admin/auth.php?action=reset-code', { json: { email: acct.email } })).status, 200);
    const mail = await waitForMail((m) => m.to.includes('security@apg.test') && m.text.includes(acct.email), { since });
    const code = mail.text.match(/\b(\d{6})\b/)[1];
    const newPassword = `New-${uid()}`;
    assert.equal((await resetter.post('/api/admin/auth.php?action=reset', { json: { code, new_password: 'short' } })).status, 400);
    const ok = await resetter.post('/api/admin/auth.php?action=reset', { json: { code, new_password: newPassword } });
    assert.equal(ok.status, 200, ok.text);
    assert.equal((await oldSession.get('/api/admin/blogs.php')).status, 401, 'session issued before the reset is rejected');
    assert.equal((await new Client().post('/api/admin/auth.php', { json: { email: acct.email, password: acct.password } })).status, 401);
    await new Client().login(acct.email, newPassword);
  });

  it('own password change (code to the security inbox) signs out every other session of that admin', { skip: !mailEnabled && 'MAIL_SINK_DIR not set' }, async () => {
    const acct = await throwawayAdmin('recruiter');
    const me = new Client();
    await me.login(acct.email, acct.password);
    const otherDevice = new Client();
    await otherDevice.login(acct.email, acct.password);
    assert.equal((await me.post('/api/admin/auth.php?action=password-code', { json: { current_password: 'wrong' } })).status, 403);
    const since = Date.now();
    assert.equal((await me.post('/api/admin/auth.php?action=password-code', { json: { current_password: acct.password } })).status, 200);
    const mail = await waitForMail((m) => m.to.includes('security@apg.test') && m.subject.includes('password change code') && m.text.includes(acct.email), { since });
    const code = mail.text.match(/\b(\d{6})\b/)[1];
    assert.equal((await me.post('/api/admin/auth.php?action=password', { json: { code, new_password: acct.password } })).status, 400, 'must differ');
    const res = await me.post('/api/admin/auth.php?action=password', { json: { code, new_password: `Chg-${uid()}` } });
    assert.equal(res.status, 200, res.text);
    assert.equal((await me.get('/api/admin/applicants.php')).status, 200, 'the changing session stays signed in');
    assert.equal((await otherDevice.get('/api/admin/applicants.php')).status, 401, 'other sessions end');
    assert.equal((await otherDevice.get('/api/admin/auth.php?action=check')).data.authenticated, false);
  });

  it('a superadmin password reset in Users signs that admin out everywhere', async () => {
    const acct = await throwawayAdmin();
    const session = new Client();
    await session.login(acct.email, acct.password);
    const res = await superadmin.put('/api/admin/users.php', { json: { id: acct.id, password: `Reset-${uid()}` } });
    assert.equal(res.status, 200, res.text);
    assert.equal((await session.get('/api/admin/blogs.php')).status, 401);
  });

  it('a deleted admin loses access on the next request', async () => {
    const acct = await throwawayAdmin();
    const session = new Client();
    await session.login(acct.email, acct.password);
    assert.equal((await superadmin.delete(`/api/admin/users.php?id=${acct.id}`)).status, 200);
    created.splice(created.indexOf(acct.id), 1);
    assert.equal((await session.get('/api/admin/blogs.php')).status, 401);
  });

  it('a demoted admin loses capabilities immediately (role re-read per request)', async () => {
    const acct = await throwawayAdmin('admin');
    const session = new Client();
    await session.login(acct.email, acct.password);
    assert.equal((await session.get('/api/admin/inquiries.php')).status, 200);
    assert.equal((await superadmin.put('/api/admin/users.php', { json: { id: acct.id, role: 'editor' } })).status, 200);
    assert.equal((await session.get('/api/admin/inquiries.php')).status, 403);
  });
});
