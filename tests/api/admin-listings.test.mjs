// api/admin/listings.php (Property Listings control) -> api/listings.php public feed.
// Uses refs from the end of the feed so other files' "first listing" stays stable.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Client, as } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

const FEED = `${ROOT}/api/data/listings.generated.json`;
const skip = !fs.existsSync(FEED) && 'api/data/listings.generated.json not present';
const web = new Client();
let editor;
let refs = [];
const DEFAULTS = { hidden: false, featured: false, sort_order: null, price_override: null, note: null };
before(async () => {
  if (skip) return;
  editor = await as('editor');
  refs = JSON.parse(fs.readFileSync(FEED, 'utf8')).listings.map((l) => l.ref).slice(-3);
});
after(async () => {
  for (const ref of refs) await editor?.put('/api/admin/listings.php', { json: { ref, ...DEFAULTS } });
});
const feed = async () => (await web.get('/api/listings.php')).data.data;

describe('admin listings control', { skip }, () => {
  it('admin view has every listing with its Drive folder, overrides and sync status', async () => {
    const res = await editor.get('/api/admin/listings.php');
    assert.equal(res.status, 200);
    assert.ok(res.data.data.every((l) => 'drive_folder' in l));
    assert.equal(typeof res.data.overrides, 'object');
    for (const k of ['last_run', 'ok', 'error', 'count', 'synced_at']) assert.ok(k in res.data.status, k);
    assert.equal(typeof res.data.status.ok, 'boolean');
    assert.equal(typeof res.data.drive_folder, 'string');
  });

  it('hide removes a listing from the public feed; unhide brings it back', async () => {
    const [ref] = refs;
    assert.equal((await editor.put('/api/admin/listings.php', { json: { ref, ...DEFAULTS, hidden: true } })).status, 200);
    assert.ok(!(await feed()).some((l) => l.ref === ref));
    assert.ok((await editor.get('/api/admin/listings.php')).data.data.some((l) => l.ref === ref), 'still in the admin view');
    assert.equal((await editor.put('/api/admin/listings.php', { json: { ref, ...DEFAULTS } })).status, 200);
    assert.ok((await feed()).some((l) => l.ref === ref));
  });

  it('price override, featured and order are reflected publicly', async () => {
    const [, a, b] = refs;
    const res = await editor.put('/api/admin/listings.php', { json: { ref: a, ...DEFAULTS, price_override: '₱1 / mo (QA)', note: 'qa' } });
    assert.equal(res.status, 200, res.text);
    assert.equal(res.data.data.price_override, '₱1 / mo (QA)');
    assert.equal((await feed()).find((l) => l.ref === a).price, '₱1 / mo (QA)');
    await editor.put('/api/admin/listings.php', { json: { ref: b, ...DEFAULTS, featured: true, sort_order: -5 } });
    const list = await feed();
    assert.equal(list[0].ref, b, 'featured with the lowest order comes first');
    assert.equal(list[0].featured, true);
  });

  it('validates the payload', async () => {
    const [ref] = refs;
    const cases = [
      [{ ref: 'APR-12' }, 400],
      [{ ref: ['APR-A0A000'] }, 400],
      [{ ref: 'APR-FFFFFF' }, 404],
      [{ ref, hidden: 'yes' }, 400],
      [{ ref, featured: 2 }, 400],
      [{ ref, sort_order: 'first' }, 400],
      [{ ref, sort_order: 10000 }, 400],
      [{ ref, price_override: ['x'] }, 400],
      [{ ref, note: 'x'.repeat(501) }, 400],
    ];
    for (const [body, status] of cases) {
      const res = await editor.put('/api/admin/listings.php', { json: body });
      assert.equal(res.status, status, JSON.stringify(body).slice(0, 80));
    }
    assert.equal((await editor.put('/api/admin/listings.php', { json: '[]' })).status, 400);
    assert.equal((await editor.post('/api/admin/listings.php', { json: { ref } })).status, 405);
  });
});
