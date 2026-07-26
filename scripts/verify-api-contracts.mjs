import assert from 'node:assert/strict';
import { readBody } from '../server/http.js';
import { readServerConfig, serverConfigStatus } from '../server/config.js';

const parsed = await readBody({ body: JSON.stringify({ ok: true }) });
assert.deepEqual(parsed, { ok: true });
assert.equal(readServerConfig({}).supabaseConfigured, false);
assert.equal(serverConfigStatus({}).supabaseConfigured, false);

const responseShape = (status, data) => ({ status, data });
assert.deepEqual(responseShape(400, { message: 'Message required' }), {
  status: 400,
  data: { message: 'Message required' },
});
console.log('API contract helpers: PASS');
