// api/admin/services.php (Services & Packages): kinds, publish flag, uploads, and the Virtual Office
// price round trip (DB -> public services feed -> chat FAQ). Only this file edits Virtual Office rows.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client, as, multipart, uid, PNG_BYTES } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

const web = new Client();
let editor;
let sa;
const items = [];
const uploads = [];
before(async () => { [editor, sa] = await Promise.all([as('editor'), as('superadmin')]); });
after(async () => {
  for (const id of items) await sa.delete(`/api/admin/services.php?id=${id}`);
  for (const url of uploads) fs.rmSync(path.join(ROOT, 'public', url), { force: true });
});

const item = (over = {}) => ({ title: `QA Item ${uid()}`, category: '88prime', kind: 'product', tag: 'QA', summary: 'Bestseller', description: 'Specs', price: '₱1,234', features: ['one', '', 7, 'two'], sort_order: 99, ...over });
async function create(body) {
  const res = await editor.post('/api/admin/services.php', { json: body });
  if (res.status === 201) items.push(res.data.id);
  return res;
}
const publicItems = async (category) => (await web.get(`/api/services.php?category=${category}`)).data.data;

describe('admin services', () => {
  it('a product appears on its enterprise feed with its kind; unpublished items are hidden', async () => {
    const res = await create(item());
    assert.equal(res.status, 201, res.text);
    const row = (await publicItems('88prime')).find((s) => s.id === res.data.id);
    assert.equal(row.kind, 'product');
    assert.deepEqual(row.features, ['one', 'two'], 'empty and non-string features dropped');
    assert.ok(!(await publicItems('corporate')).some((s) => s.id === res.data.id));

    const body = { ...item(), id: res.data.id, title: row.title, is_published: 0 };
    delete body.kind; // omitted kind keeps the stored one
    assert.equal((await editor.put('/api/admin/services.php', { json: body })).status, 200);
    assert.ok(!(await publicItems('88prime')).some((s) => s.id === res.data.id), 'unpublished');
    const adminRow = (await editor.get('/api/admin/services.php?category=88prime')).data.data.find((s) => s.id === res.data.id);
    assert.equal(adminRow.kind, 'product');
    assert.equal(adminRow.is_published, 0);
  });

  it('validates kind, category, title, duplicates and ids', async () => {
    assert.equal((await create(item({ kind: 'bundle' }))).status, 422);
    assert.equal((await create(item({ category: 'nowhere' }))).status, 422);
    assert.equal((await create(item({ title: ' ' }))).status, 400);
    const first = await create(item());
    assert.equal((await create(item({ title: (await editor.get('/api/admin/services.php?category=88prime')).data.data.find((s) => s.id === first.data.id).title }))).status, 409);
    assert.equal((await editor.put('/api/admin/services.php', { json: item({ id: 2147483000 }) })).status, 404);
    assert.equal((await editor.get('/api/admin/services.php?category=nowhere')).status, 422);
    assert.equal((await editor.delete(`/api/admin/services.php?id=${first.data.id}`)).status, 403, 'editor cannot delete');
  });

  it('every kind round-trips (service, product, package)', async () => {
    for (const kind of ['service', 'product', 'package']) {
      const res = await create(item({ kind, category: 'swiftclear' }));
      assert.equal(res.status, 201);
      assert.equal((await publicItems('swiftclear')).find((s) => s.id === res.data.id).kind, kind);
    }
  });

  it('image upload: JPG/PNG/WebP only', async () => {
    const ok = await editor.post('/api/admin/services.php?action=upload_image', { form: multipart({}, { image: { name: 'p.png', type: 'image/png', data: PNG_BYTES } }) });
    assert.equal(ok.status, 200, ok.text);
    assert.match(ok.data.url, /^\/uploads\/services\/service_\d{8}_\d{6}_[0-9a-f]{8}\.png$/);
    uploads.push(ok.data.url);
    const gif = Buffer.from('R0lGODlhAQABAAAAACw=', 'base64');
    assert.equal((await editor.post('/api/admin/services.php?action=upload_image', { form: multipart({}, { image: { name: 'x.gif', type: 'image/gif', data: gif } }) })).status, 400);
    assert.equal((await editor.get('/api/admin/services.php?action=upload_image')).status, 405);
  });

  it('a Virtual Office price edit shows on the public feed and in the chat FAQ, then is restored', async () => {
    const rows = (await editor.get('/api/admin/services.php?category=virtual-office')).data.data;
    const bronze = rows.find((s) => /bronze/i.test(s.title));
    assert.ok(bronze, 'Bronze package exists');
    const newPrice = `₱9,${Math.floor(100 + Math.random() * 899)} / mo`;
    try {
      const res = await editor.put('/api/admin/services.php', { json: { ...bronze, price: newPrice } });
      assert.equal(res.status, 200, res.text);
      assert.equal((await publicItems('virtual-office')).find((s) => s.id === bronze.id).price, newPrice);
      const start = await web.post('/api/chat/start.php', { json: { enterprise_slug: 'virtual-office' } });
      const reply = await web.post('/api/chat/message.php', { json: { session_token: start.data.session.session_token, message: 'What virtual office packages do you have?' } });
      assert.ok(reply.data.reply.includes(newPrice), `FAQ answer uses the live price: ${reply.data.reply}`);
    } finally {
      await editor.put('/api/admin/services.php', { json: bronze });
    }
    assert.equal((await publicItems('virtual-office')).find((s) => s.id === bronze.id).price, bronze.price);
  });
});
