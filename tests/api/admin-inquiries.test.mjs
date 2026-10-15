// api/admin/inquiries.php: list/filter/detail/status/delete and the CSV export.
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, formStartedAt, uid } from '../support/http.mjs';

const web = new Client();
let admin;
const tag = uid('inq');
const ids = [];
before(async () => {
  admin = await as('admin');
  const submissions = [
    { name: "-Dash O'Neil", email: `${tag}-formula@apg.test`, phone: '+63 917 000', subject: '-2 subject', message: '@SUM(A1)\nsecond line, "quoted"', enterprise: 'luxe-prime', company: 'ACME' },
    { form: 'newsletter', email: `${tag}-news@apg.test`, enterprise: 'realty' },
    { form: 'feedback', name: 'QA Feedback', email: `${tag}-feedback@apg.test`, message: 'ñ ₱ ü', enterprise: 'alta-venture' },
  ];
  for (const s of submissions) {
    const res = await web.post('/api/inquire.php', { json: { website: '', form_started_at: formStartedAt(), ...s } });
    assert.equal(res.status, 200, res.text);
  }
  const rows = (await admin.get(`/api/admin/inquiries.php?q=${tag}`)).data.data;
  ids.push(...rows.map((r) => r.id));
  assert.equal(ids.length, 3);
});
after(async () => { for (const id of ids) await admin.delete(`/api/admin/inquiries.php?id=${id}`); });

/** RFC 4180 CSV -> rows of cells. */
function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { cell += '"'; i += 1; } else if (ch === '"') quoted = false; else cell += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ',') { row.push(cell); cell = ''; } else if (ch === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; } else if (ch !== '\r') cell += ch;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

describe('admin inquiries inbox', () => {
  it('filters by kind, enterprise, status, date and search', async () => {
    const q = `q=${tag}`;
    const get = async (qs) => (await admin.get(`/api/admin/inquiries.php?${q}&${qs}`)).data;
    assert.equal((await get('kind=newsletter')).data.length, 1);
    assert.equal((await get('exclude=newsletter')).data.length, 2);
    assert.equal((await get('enterprise=luxe-prime')).data[0].kind, 'inquiry');
    assert.equal((await get('status=new')).total, 3);
    const today = (await get('')).data[0].created_at.slice(0, 10); // the DB's own date for these rows
    assert.equal((await get(`from=${today}&to=${today}`)).total, 3);
    assert.equal((await get('to=2000-01-01')).total, 0);
    const page = await get('limit=1&offset=1');
    assert.equal(page.data.length, 1, 'older rows are reachable a page at a time');
    assert.equal(page.total, 3);
    assert.notEqual(page.data[0].id, (await get('limit=1')).data[0].id);
    for (const bad of ['limit=0', 'limit=201', 'offset=-1']) {
      assert.equal((await admin.get(`/api/admin/inquiries.php?${q}&${bad}`)).status, 400, bad);
    }
    for (const bad of ['kind=spam', 'enterprise=nowhere', 'status=done', 'from=2026-13-01', 'to=yesterday', `q=${'x'.repeat(201)}`]) {
      assert.equal((await admin.get(`/api/admin/inquiries.php?${bad}`)).status, 400, bad);
    }
    assert.ok((await admin.get('/api/admin/inquiries.php?kind[]=x')).status < 500);
  });

  it('detail, status changes and the unread summary', async () => {
    const [id] = ids;
    const one = await admin.get(`/api/admin/inquiries.php?id=${id}`);
    assert.equal(one.status, 200);
    assert.equal(typeof one.data.data.meta, 'object');
    const put = await admin.put('/api/admin/inquiries.php', { json: { id, status: 'replied' } });
    assert.equal(put.status, 200, put.text);
    assert.equal(put.data.data.status, 'replied');
    assert.equal((await admin.put('/api/admin/inquiries.php', { json: { id, status: 'spam' } })).status, 400);
    assert.equal((await admin.put('/api/admin/inquiries.php', { json: { id: [id], status: 'read' } })).status, 400);
    assert.equal((await admin.put('/api/admin/inquiries.php', { json: { id: 2147483000, status: 'read' } })).status, 404);
    assert.equal((await admin.get('/api/admin/inquiries.php?id=abc')).status, 400);
    assert.equal((await admin.get('/api/admin/inquiries.php?id=2147483000')).status, 404);
    const summary = (await admin.get('/api/admin/inquiries.php?action=summary')).data.summary;
    const byKind = summary.by_kind;
    assert.deepEqual(Object.keys(byKind).sort(), ['application_question', 'feedback', 'inquiry', 'listing', 'newsletter']);
    assert.equal(summary.unread, Object.values(byKind).reduce((a, b) => a + b, 0) - byKind.newsletter);
    assert.ok(summary.subscribers >= 1);
  });

  it('CSV export: BOM, header, formula-injection safe cells, filters applied', async () => {
    const res = await admin.get(`/api/admin/inquiries.php?action=export&q=${tag}`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type'), /^text\/csv/);
    assert.match(res.headers.get('content-disposition'), /attachment; filename="inquiries-\d{8}-\d{4}\.csv"/);
    assert.deepEqual([...res.buffer.subarray(0, 3)], [0xef, 0xbb, 0xbf], 'UTF-8 BOM');
    const rows = parseCsv(res.text.slice(1));
    assert.deepEqual(rows[0], ['ID', 'Received', 'Last activity', 'Kind', 'Company', 'Status', 'Name', 'Email', 'Phone', 'Subject', 'Message', 'Reference', 'Listing', 'Details']);
    assert.equal(rows.length, 4, 'header + the 3 filtered rows');
    const formula = rows.find((r) => r[7] === `${tag}-formula@apg.test`);
    assert.equal(formula[6], "'-Dash O'Neil");
    assert.equal(formula[8], "'+63 917 000");
    assert.equal(formula[10], `'@SUM(A1)\nsecond line, "quoted"`);
    assert.ok(formula[13].includes('Company: ACME'));
    const feedback = rows.find((r) => r[3] === 'feedback');
    assert.equal(feedback[10], 'ñ ₱ ü');
    for (const row of rows.slice(1)) for (const cell of row) assert.doesNotMatch(cell, /^[=+\-@\t\r]/, `unsafe cell ${cell}`);
    const csvOnlyNews = await admin.get(`/api/admin/inquiries.php?action=export&q=${tag}&kind=newsletter`);
    assert.equal(parseCsv(csvOnlyNews.text.slice(1)).length, 2);
  });

  it('delete needs the delete capability', async () => {
    const res = await web.post('/api/inquire.php', { json: { name: 'QA Del', email: `${tag}-del@apg.test`, message: 'Testing the delete flow.', website: '', form_started_at: formStartedAt() } });
    assert.equal(res.status, 200);
    const [row] = (await admin.get(`/api/admin/inquiries.php?q=${tag}-del`)).data.data;
    assert.equal((await admin.delete(`/api/admin/inquiries.php?id=${row.id}`)).status, 200);
    assert.equal((await admin.delete(`/api/admin/inquiries.php?id=${row.id}`)).status, 404);
    assert.equal((await admin.delete('/api/admin/inquiries.php?id=x')).status, 400);
  });
});
