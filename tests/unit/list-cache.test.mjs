// src/lib/listCache.ts: one request per public list URL per session, failures never cached.
import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

const mod = await import('../../src/lib/listCache.ts');
const { fetchList, peekList, clearListCache } = mod;

let calls = [];
let responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [] }) });
globalThis.fetch = async (url) => { calls.push(url); return responder(url); };

beforeEach(() => { calls = []; clearListCache(); });

describe('listCache', () => {
  it('caches a successful list and serves revisits without a request', async () => {
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [{ id: 1 }] }) });
    assert.equal(peekList('/a'), undefined);
    const first = await fetchList('/a');
    assert.deepEqual(first, [{ id: 1 }]);
    assert.deepEqual(peekList('/a'), [{ id: 1 }]);
    const second = await fetchList('/a');
    assert.equal(second, first);
    assert.equal(calls.length, 1);
  });

  it('shares one in-flight request', async () => {
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [1] }) });
    const [x, y] = await Promise.all([fetchList('/b'), fetchList('/b')]);
    assert.equal(x, y);
    assert.equal(calls.length, 1);
  });

  it('keeps a successful empty list', async () => {
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [] }) });
    assert.deepEqual(await fetchList('/e'), []);
    assert.deepEqual(peekList('/e'), []);
  });

  it('does not cache HTTP errors or unsuccessful bodies, and retries', async () => {
    responder = () => ({ ok: false, status: 500, json: async () => ({}) });
    await assert.rejects(fetchList('/c'), /HTTP 500/);
    assert.equal(peekList('/c'), undefined);
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: false, data: [] }) });
    await assert.rejects(fetchList('/c'), /List unavailable/);
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: { not: 'array' } }) });
    await assert.rejects(fetchList('/c'), /List unavailable/);
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [7] }) });
    assert.deepEqual(await fetchList('/c'), [7]);
    assert.equal(calls.length, 4);
  });

  it('rejects on a network error and retries afterwards', async () => {
    responder = () => { throw new TypeError('Failed to fetch'); };
    await assert.rejects(fetchList('/d'), /Failed to fetch/);
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [1] }) });
    assert.deepEqual(await fetchList('/d'), [1]);
  });

  it('clearListCache forgets loaded lists', async () => {
    responder = () => ({ ok: true, status: 200, json: async () => ({ success: true, data: [1] }) });
    await fetchList('/f');
    clearListCache();
    assert.equal(peekList('/f'), undefined);
    await fetchList('/f');
    assert.equal(calls.length, 2);
  });
});
