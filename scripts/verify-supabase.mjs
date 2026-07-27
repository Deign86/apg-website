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
const tables = ['profiles', 'offerings', 'inquiries', 'job_openings', 'blog_posts', 'site_settings', 'chatbot_kb', 'chat_logs', 'activity_log', 'assets', 'property_asset_relations', 'import_batches', 'import_file_mappings', 'offering_drive_sync', 'drive_asset_sync'];
const result = {};
for (const table of tables) {
  const { count, error } = await admin.from(table).select('*', { count: 'exact', head: true });
  result[table] = error ? { ok: false, error: error.message } : { ok: true, count };
}
const { data: buckets, error: bucketError } = await admin.storage.listBuckets();
result.buckets = bucketError ? { ok: false, error: bucketError.message } : { ok: true, names: buckets.map((b) => b.name).filter((name) => ['apg-public', 'apg-private', 'apr-listing'].includes(name)) };
const columnChecks = {
  offerings: 'listing_status,drive_folder_id,drive_doc_id,imported_at,imported_by,published_at,archived_at,bedrooms,bathrooms,parking_slots',
  assets: 'source_type,drive_file_id,drive_folder_id,checksum_sha256,storage_bucket,storage_path',
  import_batches: 'source_type,source_folder_id,source_doc_id,offering_id,imported_by,stats',
};
result.columns = {};
for (const [table, columns] of Object.entries(columnChecks)) {
  const probe = await admin.from(table).select(columns).limit(0);
  result.columns[table] = probe.error ? { ok: false, error: probe.error.message } : { ok: true };
}
console.log(JSON.stringify({ projectHost: new URL(config.supabaseUrl).host, result }, null, 2));
const missing = tables.filter((table) => !result[table].ok);
assert.equal(missing.length, 0, `Missing/unreadable tables: ${missing.join(', ')}`);
assert.equal(result.buckets.ok, true, result.buckets.error || 'Storage bucket check failed');
assert.ok(result.buckets.names.includes('apg-public'), 'Missing apg-public storage bucket');
assert.ok(result.buckets.names.includes('apg-private'), 'Missing apg-private storage bucket');
const missingColumns = Object.entries(result.columns).filter(([, value]) => !value.ok).map(([table, value]) => `${table}: ${value.error}`);
assert.equal(missingColumns.length, 0, `Drive schema is incomplete: ${missingColumns.join('; ')}`);
