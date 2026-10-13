// api/admin/content.php (guided Content Editor + Advanced raw save) against the registry, the public
// api/content.php, site settings, and the private `_private` page (inboxes) that must never leak.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { Client, as, formStartedAt, multipart, qaEmail, uid, mailEnabled, waitForMail, PNG_BYTES } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

const web = new Client();
let editor;
let admin;
let sa;
const resets = new Set(); // "page|key" rows to delete afterwards
before(async () => { [editor, admin, sa] = await Promise.all([as('editor'), as('admin'), as('superadmin')]); });
after(async () => {
  for (const entry of resets) {
    const [page, key] = entry.split('|');
    await sa.delete(`/api/admin/content.php?page=${page}&key=${encodeURIComponent(key)}`);
  }
});

async function save(client, page, values) {
  for (const key of Object.keys(values)) resets.add(`${page}|${key}`);
  return client.post('/api/admin/content.php', { json: { page_slug: page, values } });
}
const publicContent = async (page) => (await web.get(`/api/content.php?page=${page}`)).data.data;

describe('admin content editor', () => {
  it('a saved field is served publicly; reset to default removes it', async () => {
    const heading = `QA heading ${uid()}`;
    const res = await save(editor, 'home', { hero_heading: heading });
    assert.equal(res.status, 200, res.text);
    assert.equal((await publicContent('home')).hero_heading, heading);
    const stored = (await editor.get('/api/admin/content.php?page=home')).data.data.find((r) => r.section_key === 'hero_heading');
    assert.equal(stored.type, 'text');
    assert.equal((await editor.delete('/api/admin/content.php?page=home&key=hero_heading')).status, 200);
    assert.equal('hero_heading' in (await publicContent('home')), false);
  });

  it('JSON-backed fields (repeater, toggle, choices, list) round-trip as JSON', async () => {
    const values = {
      announcement_enabled: true,
      announcement_text: `QA announcement ${uid()}`,
      announcement_sites: ['realty', 'construction'],
      co_realty_socials: [{ platform: 'Facebook', url: ' https://www.facebook.com/qa ' }],
    };
    const res = await save(editor, 'site', values);
    assert.equal(res.status, 200, res.text);
    const site = await publicContent('site');
    assert.equal(site.announcement_enabled, true);
    assert.equal(site.announcement_text, values.announcement_text);
    assert.deepEqual(site.announcement_sites, ['realty', 'construction']);
    assert.equal(site.co_realty_socials[0].url, 'https://www.facebook.com/qa', 'url fields are trimmed');
    await save(editor, 'site', { announcement_enabled: false });
  });

  it('validates every save and writes nothing when one field fails', async () => {
    const good = `QA keep ${uid()}`;
    const cases = [
      ['unknown field', 'home', { no_such_key: 'x' }],
      ['unknown page', 'nope', { hero_heading: 'x' }],
      ['bad email', 'site', { email: 'not-an-email' }],
      ['javascript: url', 'site', { facebook: 'javascript:alert(1)' }],
      ['protocol-relative url', 'site', { facebook: '//evil.test' }],
      ['bad phone', 'site', { phone: 'call me <b>' }],
      ['toggle as string', 'site', { announcement_enabled: 'true' }],
      ['unknown choice', 'site', { announcement_sites: ['mars'] }],
      ['choices as string', 'site', { announcement_sites: 'realty' }],
      ['repeater bad url', 'site', { co_realty_socials: [{ platform: 'Facebook', url: 'javascript:x' }] }],
      ['text as array', 'home', { hero_heading: ['x'] }],
      ['too long', 'home', { hero_heading: 'x'.repeat(20001) }],
      ['all-or-nothing', 'home', { cta_heading: good, hero_heading: ['x'] }],
    ];
    for (const [label, page, values] of cases) {
      const res = await editor.post('/api/admin/content.php', { json: { page_slug: page, values } });
      assert.equal(res.status, 400, `${label}: ${res.text.slice(0, 160)}`);
      assert.equal(res.data.success, false, label);
    }
    assert.notEqual((await publicContent('home')).cta_heading, good, 'nothing written by the failed batch');
    for (const body of [{ page_slug: 'home', values: [] }, { page_slug: 'home', values: ['a'] }, { page_slug: 'home' }, '{not json', { page_slug: ['home'], values: { hero_heading: 'x' } }]) {
      const res = await editor.post('/api/admin/content.php', { json: body });
      assert.ok(res.status === 400 || res.status === 422, `${JSON.stringify(body)} -> ${res.status}`);
    }
    const tooMany = Object.fromEntries(Array.from({ length: 301 }, (_, i) => [`k${i}`, 'x']));
    assert.equal((await editor.post('/api/admin/content.php', { json: { page_slug: 'home', values: tooMany } })).status, 400);
    assert.equal((await editor.delete('/api/admin/content.php?page=home')).status, 400, 'key required');
    assert.equal((await editor.get('/api/admin/content.php?page=nope')).status, 400);
  });

  it('_private (inboxes, chat notes) needs private_settings and never reaches the public API', async () => {
    const secret = `qa-secret-${uid()}@apg.test`;
    assert.equal((await save(editor, '_private', { hr_inbox: secret })).status, 403, 'editor cannot write');
    assert.equal((await editor.get('/api/admin/content.php?page=_private')).status, 403, 'editor cannot read');
    assert.equal((await editor.delete('/api/admin/content.php?page=_private&key=hr_inbox')).status, 403);
    const res = await save(admin, '_private', { hr_inbox: secret, chat_notes: `QA note ${uid()}` });
    assert.equal(res.status, 200, res.text);
    assert.ok((await admin.get('/api/admin/content.php?page=_private')).data.data.some((r) => r.value === secret));
    const pub = await web.get('/api/content.php?page=_private');
    assert.equal(pub.status, 400);
    assert.ok(!pub.text.includes(secret));
    for (const page of ['site', 'home', 'careers', 'contact']) {
      assert.ok(!(await web.get(`/api/content.php?page=${page}`)).text.includes(secret), `not on ${page}`);
    }
    assert.ok(!(await editor.get('/api/admin/content.php')).text.includes(secret), 'not in the editor\'s all-pages list');
  });

  it('a private per-company inquiry inbox receives that company\'s inquiries', { skip: !mailEnabled && 'MAIL_SINK_DIR not set' }, async () => {
    const inbox = `qa-88-inbox-${uid()}@apg.test`;
    assert.equal((await save(admin, '_private', { 'inquiry_inbox_88prime': inbox })).status, 200);
    const since = Date.now();
    const email = qaEmail('inq88');
    const res = await web.post('/api/inquire.php', { json: { name: 'QA', email, message: 'Hello, testing the inbox.', enterprise: '88prime', website: '', form_started_at: formStartedAt() } });
    assert.equal(res.status, 200, res.text);
    await waitForMail((m) => m.to.includes(inbox) && m.subject.includes(res.data.ticket), { since });
    const rows = (await admin.get(`/api/admin/inquiries.php?q=${encodeURIComponent(email)}`)).data.data;
    for (const row of rows) await admin.delete(`/api/admin/inquiries.php?id=${row.id}`);
  });

  it('Advanced raw save: superadmin only, type must match a registered field', async () => {
    const key = `qa_raw_${uid().replace(/-/g, '_')}`;
    resets.add(`home|${key}`);
    const ok = await sa.post('/api/admin/content.php', { json: { page_slug: 'home', raw: { section_key: key, type: 'text', value: 'raw value' } } });
    assert.equal(ok.status, 200, ok.text);
    assert.equal((await publicContent('home'))[key], 'raw value');
    const wrongType = await sa.post('/api/admin/content.php', { json: { page_slug: 'home', raw: { section_key: 'core_values', type: 'text', value: 'x' } } });
    assert.equal(wrongType.status, 400, 'core_values is a repeater (card)');
    const badKey = await sa.post('/api/admin/content.php', { json: { page_slug: 'home', raw: { section_key: 'bad key!', type: 'text', value: 'x' } } });
    assert.equal(badKey.status, 400);
    const badJson = await sa.post('/api/admin/content.php', { json: { page_slug: 'home', raw: { section_key: key, type: 'card', value: '{oops' } } });
    assert.equal(badJson.status, 400);
  });

  it('content image upload: images only', async () => {
    const ok = await editor.post('/api/admin/content.php?action=upload_image', { form: multipart({}, { image: { name: 'i.png', type: 'image/png', data: PNG_BYTES } }) });
    assert.equal(ok.status, 200, ok.text);
    assert.match(ok.data.url, /^\/uploads\/content\/content_\d{8}_\d{6}_[0-9a-f]{8}\.png$/);
    fs.rmSync(path.join(ROOT, 'public', ok.data.url), { force: true });
    const bad = await editor.post('/api/admin/content.php?action=upload_image', { form: multipart({}, { image: { name: 'x.svg', type: 'image/svg+xml', data: Buffer.from('<svg/>') } }) });
    assert.equal(bad.status, 400);
  });
});
