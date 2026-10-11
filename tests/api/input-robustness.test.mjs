// Array/object values where an endpoint expects text must be a validation error (422, or the
// endpoint's 400), never a PHP TypeError 500 and never a silent success that stores "Array".
import { after, before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as, formStartedAt } from '../support/http.mjs';

let sa;
let blogId;
let serviceId;
let jobId;
let adminId;
let chatId;
before(async () => {
  sa = await as('superadmin');
  blogId = (await sa.get('/api/admin/blogs.php?per_page=1')).data.data[0].id;
  serviceId = (await sa.get('/api/admin/services.php?category=swiftclear')).data.data[0].id;
  jobId = (await sa.get('/api/admin/careers.php?enterprise=construction')).data.data[0].id;
  adminId = (await sa.get('/api/admin/users.php')).data.data.find((u) => u.email === 'qa-editor@apg.test').id;
  chatId = (await new Client().post('/api/chat/start.php', { json: { enterprise_slug: 'realty' } })).data.session.id;
});

// Anything a (buggy) endpoint accepted is removed again.
after(async () => {
  for (const [list, del] of [['/api/admin/careers.php', '/api/admin/careers.php'], ['/api/admin/blogs.php', '/api/admin/blogs.php'], ['/api/admin/services.php', '/api/admin/services.php']]) {
    for (const row of (await sa.get(list)).data.data.filter((r) => r.title === 'QA arr')) await sa.delete(`${del}?id=${row.id}`);
  }
});

const VALIDATION = [400, 422];

describe('array input robustness', () => {
  const cases = () => [
    ['POST careers title[]', 'POST', '/api/admin/careers.php', { title: ['x'] }],
    ['POST careers location[]', 'POST', '/api/admin/careers.php', { title: 'QA arr', location: ['x'] }],
    ['POST careers enterprise_slug[]', 'POST', '/api/admin/careers.php', { title: 'QA arr', enterprise_slug: ['realty'] }],
    ['PUT careers description{}', 'PUT', '/api/admin/careers.php', { id: jobId, title: 'QA arr', description: { a: 1 } }],
    ['POST blogs title[]', 'POST', '/api/admin/blogs.php', { title: ['x'], content: 'y' }],
    ['POST blogs excerpt[]', 'POST', '/api/admin/blogs.php', { title: 'QA arr', content: 'y', excerpt: ['x'] }],
    ['POST blogs status[]', 'POST', '/api/admin/blogs.php', { title: 'QA arr', content: 'y', status: ['published'] }],
    ['PATCH blogs category[]', 'PATCH', '/api/admin/blogs.php', { id: blogId, category: ['x'] }],
    ['POST services title[]', 'POST', '/api/admin/services.php', { title: ['x'] }],
    ['POST services price[]', 'POST', '/api/admin/services.php', { title: 'QA arr', category: 'swiftclear', price: ['1'] }],
    ['POST services kind[]', 'POST', '/api/admin/services.php', { title: 'QA arr', category: 'swiftclear', kind: ['product'] }],
    ['PUT services summary[]', 'PUT', '/api/admin/services.php', { id: serviceId, title: 'QA arr', category: 'swiftclear', summary: ['x'] }],
    ['PUT users name[]', 'PUT', '/api/admin/users.php', { id: adminId, name: ['x'] }],
    ['PUT users email[]', 'PUT', '/api/admin/users.php', { id: adminId, email: ['qa@apg.test'] }],
    ['PUT applicants internal_notes[]', 'PUT', '/api/admin/applicants.php', { id: 1, internal_notes: ['x'] }],
    ['POST chat action[]', 'POST', '/api/admin/chat.php', { action: ['claim'], session_id: 2147483000 }],
    ['POST chat body[]', 'POST', '/api/admin/chat.php', { action: 'message', session_id: chatId, body: ['x'] }],
    ['PUT inquiries status[]', 'PUT', '/api/admin/inquiries.php', { id: 1, status: ['read'] }],
    ['POST content values{key:[]}', 'POST', '/api/admin/content.php', { page_slug: 'home', values: { hero_heading: ['x'] } }],
    ['PUT listings note[]', 'PUT', '/api/admin/listings.php', { ref: 'APR-A0A000', note: ['x'] }],
  ];

  it('admin endpoints answer array fields with a validation error', async () => {
    const failures = [];
    for (const [label, method, url, json] of cases()) {
      const res = await sa.request(method, url, { json });
      if (!VALIDATION.includes(res.status)) failures.push(`${label} -> ${res.status} ${res.text.slice(0, 120).replace(/\s+/g, ' ')}`);
    }
    // A failed run must not leave "Array" behind on the seeded editor account.
    const editor = (await sa.get('/api/admin/users.php')).data.data.find((u) => u.id === adminId);
    if (editor.name !== 'QA Editor') {
      await sa.put('/api/admin/users.php', { json: { id: adminId, name: 'QA Editor' } });
      failures.push(`PUT users name[] stored "${editor.name}"`);
    }
    assert.deepEqual(failures, []);
  });

  it('public endpoints answer array fields with a 4xx', async () => {
    const web = new Client();
    const failures = [];
    const posts = [
      ['/api/inquire.php', { name: ['x'], email: 'a@apg.test', website: '', form_started_at: formStartedAt() }],
      ['/api/inquire.php', { name: 'x', email: 'a@apg.test', website: [''], form_started_at: [formStartedAt()] }],
      ['/api/applicants.php', { fullName: ['x'], email: 'a@apg.test', phone: '1', website: '', form_started_at: formStartedAt() }],
      ['/api/chat/start.php', { session_token: ['x'], enterprise_slug: ['realty'], visitor_name: ['x'] }],
      ['/api/chat/message.php', { session_token: ['x'], message: ['hi'] }],
      ['/api/chat/poll.php', { session_token: ['x'] }],
    ];
    for (const [url, json] of posts) {
      const res = await web.post(url, { json });
      if (res.status >= 500) failures.push(`${url} ${JSON.stringify(json).slice(0, 60)} -> ${res.status}`);
    }
    assert.deepEqual(failures, []);
  });
});
