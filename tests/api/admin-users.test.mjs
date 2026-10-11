// api/admin/users.php (superadmin only).
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, uid } from '../support/http.mjs';

let sa;
const created = [];
before(async () => { sa = await as('superadmin'); });
after(async () => { for (const id of created) await sa.delete(`/api/admin/users.php?id=${id}`); });

const newUser = (over = {}) => ({ email: `${uid('user')}@apg.test`, name: 'QA User', role: 'editor', password: `Pw-${uid()}`, ...over });

describe('admin users', () => {
  it('lists accounts without password hashes', async () => {
    const res = await sa.get('/api/admin/users.php');
    assert.equal(res.status, 200);
    assert.ok(res.data.data.length >= 4);
    for (const u of res.data.data) {
      assert.deepEqual(Object.keys(u).sort(), ['created_at', 'email', 'id', 'name', 'role']);
    }
  });

  it('creates, updates and deletes an account; the new account can sign in', async () => {
    const body = newUser();
    const res = await sa.post('/api/admin/users.php', { json: body });
    assert.equal(res.status, 201, res.text);
    created.push(res.data.id);
    const login = await new Client().post('/api/admin/auth.php', { json: { email: body.email, password: body.password } });
    assert.equal(login.data.user.role, 'editor');
    const upd = await sa.put('/api/admin/users.php', { json: { id: res.data.id, name: 'QA Renamed', role: 'recruiter' } });
    assert.equal(upd.status, 200, upd.text);
    const row = (await sa.get('/api/admin/users.php')).data.data.find((u) => u.id === res.data.id);
    assert.equal(row.name, 'QA Renamed');
    assert.equal(row.role, 'recruiter');
    assert.equal((await sa.delete(`/api/admin/users.php?id=${res.data.id}`)).status, 200);
    created.pop();
    assert.equal((await sa.delete(`/api/admin/users.php?id=${res.data.id}`)).status, 404);
  });

  it('validates input: email, name, role, password length, duplicates', async () => {
    const existing = newUser();
    const first = await sa.post('/api/admin/users.php', { json: existing });
    created.push(first.data.id);
    const cases = [
      [newUser({ email: 'nope' }), 400],
      [newUser({ name: '' }), 400],
      [newUser({ role: 'owner' }), 422],
      [newUser({ password: 'short' }), 400],
      [newUser({ email: existing.email }), 409],
      [newUser({ email: ['a@apg.test'] }), 400],
      [newUser({ role: ['editor'] }), 422],
    ];
    for (const [body, status] of cases) {
      const res = await sa.post('/api/admin/users.php', { json: body });
      assert.equal(res.status, status, JSON.stringify(body));
    }
    assert.equal((await sa.put('/api/admin/users.php', { json: { id: 2147483000, name: 'x' } })).status, 404);
    assert.equal((await sa.put('/api/admin/users.php', { json: { name: 'x' } })).status, 400);
  });

  it('protects the last superadmin and the caller', async () => {
    const me = (await sa.get('/api/admin/auth.php?action=check')).data.user;
    const supers = (await sa.get('/api/admin/users.php')).data.data.filter((u) => u.role === 'superadmin');
    if (supers.length === 1) {
      const demote = await sa.put('/api/admin/users.php', { json: { id: Number(me.id), role: 'admin' } });
      assert.equal(demote.status, 403);
    }
    assert.equal((await sa.delete(`/api/admin/users.php?id=${me.id}`)).status, 403, 'cannot delete own account');
  });
});
