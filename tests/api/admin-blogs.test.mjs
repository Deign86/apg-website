// api/admin/blogs.php (Blog Manager) and its effect on the public blogs feed.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client, as, multipart, uid, PNG_BYTES } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

const web = new Client();
let editor;
let sa;
const posts = [];
const uploads = [];
before(async () => { [editor, sa] = await Promise.all([as('editor'), as('superadmin')]); });
after(async () => {
  for (const id of posts) await sa.delete(`/api/admin/blogs.php?id=${id}`);
  for (const url of uploads) fs.rmSync(path.join(ROOT, 'public', url), { force: true });
});

const post = (over = {}) => ({ title: `QA Post ${uid()}`, content: 'Body text.', excerpt: 'Short', category: 'QA', enterprise_slug: 'dynamic-tree', status: 'published', ...over });
async function create(body) {
  const res = await editor.post('/api/admin/blogs.php', { json: body });
  if (res.status === 201) posts.push(res.data.id);
  return res;
}
const adminRow = async (id) => (await editor.get('/api/admin/blogs.php')).data.data.find((p) => p.id === id);

describe('admin blogs', () => {
  it('a published post appears on its enterprise feed only; a draft never does', async () => {
    const body = post();
    const res = await create(body);
    assert.equal(res.status, 201, res.text);
    const row = await adminRow(res.data.id);
    assert.match(row.slug, /^qa-post-qa-[0-9a-f]{10}$/, 'slug derived from title');
    assert.ok(row.published_at, 'publish date stamped');
    const feed = (await web.get('/api/blogs.php?enterprise=dynamic-tree')).data.data;
    assert.ok(feed.some((p) => p.id === res.data.id));
    assert.ok(!(await web.get('/api/blogs.php?enterprise=corporate')).data.data.some((p) => p.id === res.data.id));
    assert.equal((await web.get(`/api/blogs.php?slug=${row.slug}`)).status, 200);

    const draft = await create(post({ status: 'draft' }));
    const draftRow = await adminRow(draft.data.id);
    assert.equal(draftRow.published_at, null);
    assert.equal((await web.get(`/api/blogs.php?slug=${draftRow.slug}`)).status, 404);
    assert.ok(!(await web.get('/api/blogs.php')).data.data.some((p) => p.id === draft.data.id));
  });

  it('rejects duplicate slugs on create and on update', async () => {
    const a = await create(post({ slug: `qa-dupe-${uid()}` }));
    const slugA = (await adminRow(a.data.id)).slug;
    assert.equal((await create(post({ slug: slugA }))).status, 409);
    assert.equal((await create(post({ slug: slugA.toUpperCase() }))).status, 409, 'slugs are normalised before the check');
    const b = await create(post());
    const res = await editor.put('/api/admin/blogs.php', { json: { ...post(), id: b.data.id, slug: slugA } });
    assert.equal(res.status, 409);
  });

  it('validates the publish date: invalid is 422, a valid one is stored, unpublishing clears it', async () => {
    assert.equal((await create(post({ published_at: 'not a date' }))).status, 422);
    assert.equal((await create(post({ published_at: '2026-02-30 99:99:99' }))).status, 422);
    const res = await create(post({ published_at: '2025-03-04 05:06:07' }));
    assert.equal(res.status, 201, res.text);
    assert.equal((await adminRow(res.data.id)).published_at, '2025-03-04 05:06:07');
    const patch = await editor.patch('/api/admin/blogs.php', { json: { id: res.data.id, title: 'QA Patched Title' } });
    assert.equal(patch.status, 200, patch.text);
    const patched = await adminRow(res.data.id);
    assert.equal(patched.title, 'QA Patched Title');
    assert.equal(patched.published_at, '2025-03-04 05:06:07', 'PATCH keeps the original publish date');
    assert.equal(patched.content, 'Body text.', 'PATCH keeps omitted fields');
    await editor.patch('/api/admin/blogs.php', { json: { id: res.data.id, status: 'draft' } });
    assert.equal((await adminRow(res.data.id)).published_at, null);
  });

  it('validates required fields, enterprise, status, ids and list filters', async () => {
    assert.equal((await create(post({ title: '' }))).status, 400);
    assert.equal((await create(post({ content: '  ' }))).status, 400);
    assert.equal((await create(post({ title: '!!!' }))).status, 400, 'no slug derivable');
    assert.equal((await create(post({ enterprise_slug: 'nowhere' }))).status, 422);
    assert.equal((await create(post({ status: 'live' }))).status, 422);
    assert.equal((await editor.put('/api/admin/blogs.php', { json: { ...post(), id: 2147483000 } })).status, 404);
    assert.equal((await editor.put('/api/admin/blogs.php', { json: post() })).status, 400);
    assert.equal((await editor.get('/api/admin/blogs.php?enterprise=nowhere')).status, 422);
    assert.equal((await editor.get('/api/admin/blogs.php?status=live')).status, 422);
    const page = await editor.get('/api/admin/blogs.php?per_page=2&page=1');
    assert.equal(page.data.data.length, 2);
    assert.equal(typeof page.data.total, 'number');
  });

  it('editor cannot delete; superadmin can, twice is 404', async () => {
    const res = await create(post());
    assert.equal((await editor.delete(`/api/admin/blogs.php?id=${res.data.id}`)).status, 403);
    assert.equal((await sa.delete(`/api/admin/blogs.php?id=${res.data.id}`)).status, 200);
    posts.splice(posts.indexOf(res.data.id), 1);
    assert.equal((await sa.delete(`/api/admin/blogs.php?id=${res.data.id}`)).status, 404);
  });

  it('cover image upload: images only', async () => {
    const ok = await editor.post('/api/admin/blogs.php?action=upload_image', { form: multipart({}, { image: { name: 'c.png', type: 'image/png', data: PNG_BYTES } }) });
    assert.equal(ok.status, 200, ok.text);
    assert.match(ok.data.url, /^\/uploads\/blogs\/blog_\d{8}_\d{6}_[0-9a-f]{8}\.png$/);
    uploads.push(ok.data.url);
    assert.ok(fs.existsSync(path.join(ROOT, 'public', ok.data.url)));
    const bad = await editor.post('/api/admin/blogs.php?action=upload_image', { form: multipart({}, { image: { name: 'x.png', type: 'image/png', data: Buffer.from('<?php echo 1;') } }) });
    assert.equal(bad.status, 400);
    assert.equal((await editor.post('/api/admin/blogs.php?action=upload_image', { form: multipart({ a: 'b' }) })).status, 400);
  });
});
