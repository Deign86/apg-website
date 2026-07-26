import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import { createServerSupabase, readServerConfig } from '../server/config.js';

dotenv.config({ path: '.env.local' });

const config = readServerConfig();
if (!config.supabaseConfigured) {
  console.error('Supabase verification requires VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.');
  process.exit(1);
}
const admin = createServerSupabase();
const tables = ['profiles', 'offerings', 'inquiries', 'job_openings', 'blog_posts', 'site_settings', 'chatbot_kb', 'chat_logs', 'activity_log', 'assets', 'property_asset_relations', 'import_batches', 'import_file_mappings'];
const result = {};
for (const table of tables) {
  const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true });
  result[table] = error ? { ok: false, error: error.message } : { ok: true, count };
}
const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
result.buckets = bucketError ? { ok: false, error: bucketError.message } : { ok: true, names: buckets.map((b) => b.name).filter((name) => ['apg-public', 'apg-private', 'apr-listing'].includes(name)) };
console.log(JSON.stringify({ projectHost: new URL(config.supabaseUrl).host, result }, null, 2));
const missing = tables.filter((table) => !result[table].ok);
assert.equal(missing.length, 0, `Missing/unreadable tables: ${missing.join(', ')}`);
assert.equal(result.buckets.ok, true, result.buckets.error || 'Storage bucket check failed');
