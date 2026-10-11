// Public read endpoints: blogs, careers, services, listings, content.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { Client } from '../support/http.mjs';
import { ROOT } from '../support/env.mjs';

const web = new Client();
const SLUGS = ['corporate', 'virtual-office', 'realty', 'luxe-prime', 'swiftclear', '88prime', 'alta-venture', 'dynamic-tree', 'construction'];
const FEED = `${ROOT}/api/data/listings.generated.json`;

describe('public read API', () => {
  it('every read endpoint rejects writes with 405', async () => {
    for (const path of ['/api/blogs.php', '/api/careers.php', '/api/services.php', '/api/listings.php', '/api/content.php?page=home']) {
      const res = await web.post(path, { json: {} });
      assert.equal(res.status, 405, path);
    }
  });

  it('blogs: published list, single post by slug, 404 for unknown', async () => {
    const list = await web.get('/api/blogs.php');
    assert.equal(list.status, 200);
    assert.ok(list.data.success && list.data.data.length > 0);
    const post = list.data.data[0];
    for (const key of ['id', 'slug', 'title', 'excerpt', 'category', 'enterprise_slug', 'content', 'published_at']) assert.ok(key in post, key);
    const one = await web.get(`/api/blogs.php?slug=${encodeURIComponent(post.slug)}`);
    assert.equal(one.status, 200);
    assert.equal(one.data.data.slug, post.slug);
    assert.equal((await web.get('/api/blogs.php?slug=no-such-post-qa')).status, 404);
  });

  it('blogs/careers/services: an enterprise-scoped list holds only that enterprise (no corporate fallback)', async () => {
    for (const slug of SLUGS) {
      const blogs = await web.get(`/api/blogs.php?enterprise=${slug}`);
      assert.ok(blogs.data.data.every((p) => p.enterprise_slug === slug), `blogs ${slug}`);
      const careers = await web.get(`/api/careers.php?enterprise=${slug}`);
      assert.ok(careers.data.data.every((j) => j.enterprise_slug === slug), `careers ${slug}`);
      const services = await web.get(`/api/services.php?category=${slug}`);
      assert.ok(services.data.data.every((s) => s.category === slug), `services ${slug}`);
    }
    // An enterprise with nothing of a kind gets an honest empty list, not corporate rows.
    const none = await web.get('/api/blogs.php?enterprise=no-such-enterprise');
    assert.deepEqual(none.data.data, []);
  });

  it('careers: active openings with decoded requirement lists', async () => {
    const res = await web.get('/api/careers.php');
    assert.equal(res.status, 200);
    assert.ok(res.data.data.length > 0);
    for (const job of res.data.data) {
      assert.ok(Array.isArray(job.requirements) && Array.isArray(job.responsibilities), job.title);
    }
  });

  it('services: kinds, 88 Prime catalog and Virtual Office prices from the database', async () => {
    const all = await web.get('/api/services.php');
    assert.ok(all.data.data.every((s) => ['service', 'product', 'package'].includes(s.kind)));
    const prime = (await web.get('/api/services.php?category=88prime')).data.data;
    assert.ok(prime.some((s) => s.kind === 'product'), '88 Prime has catalog products');
    assert.ok(prime.some((s) => s.kind === 'service'), '88 Prime has service pillars');
    const vo = (await web.get('/api/services.php?category=virtual-office')).data.data;
    assert.ok(vo.every((s) => s.kind === 'package'), 'Virtual Office rows are priced packages');
    const prices = vo.map((s) => s.price);
    for (const price of ['₱2,899 / mo', '₱3,499 / mo', '₱4,999 / mo']) assert.ok(prices.includes(price), price);
    assert.ok(vo.every((s) => Array.isArray(s.features) && Array.isArray(s.photos)));
  });

  it('content: public pages return values; _private and malformed slugs are 400 and never leak', async () => {
    const home = await web.get('/api/content.php?page=home');
    assert.equal(home.status, 200);
    assert.equal(home.data.page, 'home');
    for (const page of ['_private', '_PRIVATE', '', '../site', 'site;drop', 'Site', '-x', 'a'.repeat(101)]) {
      const res = await web.get(`/api/content.php?page=${encodeURIComponent(page)}`);
      assert.equal(res.status, 400, `page=${page}`);
      assert.deepEqual(res.data.data, {});
    }
    assert.equal((await web.get('/api/content.php')).status, 400);
    assert.equal((await web.get('/api/content.php?page[]=_private')).status, 400);
  });

  it('listings: the Drive feed without staff-only fields', { skip: !fs.existsSync(FEED) && 'no api/data/listings.generated.json' }, async () => {
    const res = await web.get('/api/listings.php');
    assert.equal(res.status, 200);
    assert.ok(res.data.data.length > 0);
    for (const l of res.data.data) {
      assert.match(l.ref, /^APR-[0-9A-F]{6}$/);
      assert.equal('drive_folder' in l, false, 'drive_folder is staff-only');
      assert.equal(typeof l.featured, 'boolean');
    }
  });

  it('array / odd query input never causes a 500', async () => {
    for (const path of ['/api/blogs.php?slug[]=x', '/api/blogs.php?enterprise[]=realty', '/api/careers.php?enterprise[]=x',
      '/api/services.php?category[]=x', '/api/content.php?page[]=home', '/api/chat/poll.php?session_token[]=x', '/api/chat/poll.php?after_id[]=1&session_token=x']) {
      const res = await web.get(path);
      assert.ok(res.status < 500, `${path} -> ${res.status}`);
    }
  });
});
