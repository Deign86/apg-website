// Role x capability matrix. Expected results come from adminCapabilities() in api/config.php (parsed),
// so a capability change in PHP without the matching client mirror is caught by the unit suite and
// any endpoint that stops enforcing its capability is caught here.
import { before, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { Client, as } from '../support/http.mjs';
import { phpCapabilities } from '../support/php-capabilities.mjs';

const ROLES = ['superadmin', 'admin', 'editor', 'recruiter'];
const CAPS = phpCapabilities();

// One probe per capability. Allowed => the request gets past the capability check (2xx, or the
// endpoint's own 400/404 for the deliberately incomplete payload); denied => 403.
const PROBES = {
  blogs: ['POST', '/api/admin/blogs.php', {}, [400]],
  content: ['GET', '/api/admin/content.php?page=home', undefined, [200]],
  services: ['POST', '/api/admin/services.php', {}, [400]],
  careers: ['POST', '/api/admin/careers.php', {}, [400]],
  applicants: ['GET', '/api/admin/applicants.php', undefined, [200]],
  chat: ['GET', '/api/admin/chat.php', undefined, [200]],
  delete: ['DELETE', '/api/admin/blogs.php?id=2147483000', undefined, [404]],
  users: ['GET', '/api/admin/users.php', undefined, [200]],
  listings: ['GET', '/api/admin/listings.php', undefined, [200]],
  inquiries: ['GET', '/api/admin/inquiries.php', undefined, [200]],
  private_settings: ['GET', '/api/admin/content.php?page=_private', undefined, [200]],
};

const clients = {};
before(async () => {
  for (const role of ROLES) clients[role] = await as(role);
});

describe('admin RBAC matrix', () => {
  it('every server capability has a probe', () => {
    assert.deepEqual(Object.keys(PROBES).sort(), Object.keys(CAPS).sort());
  });

  for (const [cap, [method, url, json, okStatuses]] of Object.entries(PROBES)) {
    for (const role of ROLES) {
      const allowed = CAPS[cap]?.includes(role);
      it(`${role} ${allowed ? 'can' : 'cannot'} ${cap} (${method} ${url})`, async () => {
        const res = await clients[role].request(method, url, { json });
        if (allowed) assert.ok(okStatuses.includes(res.status), `expected ${okStatuses} got ${res.status}: ${res.text.slice(0, 160)}`);
        else assert.equal(res.status, 403, res.text.slice(0, 160));
      });
    }
    it(`anonymous ${method} ${url} -> 401`, async () => {
      const res = await new Client().request(method, url, { json });
      assert.equal(res.status, 401);
    });
  }

  it('every role may read the shared lists (blogs, careers, services, content)', async () => {
    for (const role of ROLES) {
      for (const url of ['/api/admin/blogs.php', '/api/admin/careers.php', '/api/admin/services.php', '/api/admin/content.php']) {
        assert.equal((await clients[role].get(url)).status, 200, `${role} GET ${url}`);
      }
    }
  });

  it('roles without private_settings never see _private rows in the all-pages list', async () => {
    for (const role of ROLES) {
      const rows = (await clients[role].get('/api/admin/content.php')).data.data;
      const hasPrivate = rows.some((r) => r.page_slug === '_private');
      if (!CAPS.private_settings.includes(role)) assert.equal(hasPrivate, false, role);
    }
  });

  it('only superadmin may use the raw (Advanced) content save', async () => {
    for (const role of ['admin', 'editor']) {
      const res = await clients[role].post('/api/admin/content.php', { json: { page_slug: 'home', raw: { section_key: 'qa_raw', type: 'text', value: 'x' } } });
      assert.equal(res.status, 403, role);
    }
  });
});
