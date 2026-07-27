import assert from 'node:assert/strict';
import dotenv from 'dotenv';
import { createDriveClient } from '../server/drive/client.js';
import { createServerSupabase, readServerConfig } from '../server/config.js';
import { listDriveChildren, GOOGLE_DOC_MIME, FOLDER_MIME } from '../server/drive/client.js';
import { isSupportedMedia } from '../server/drive/media.js';

dotenv.config({ path: '.env.local' });
dotenv.config();

const config = readServerConfig();
const missing = [];
if (!config.driveRootFolderId) missing.push('GOOGLE_DRIVE_FOLDER_ID');
if (!config.driveConfigured) missing.push('GOOGLE_CREDENTIALS');
if (!config.supabaseConfigured) missing.push('SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY');
if (missing.length) {
  console.error(`Drive import verification cannot run; missing configuration: ${missing.join(', ')}`);
  process.exit(1);
}

const { drive } = createDriveClient();
const supabase = createServerSupabase();
async function fetchAll(table, columns, filterColumn) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const result = await supabase.from(table).select(columns).not(filterColumn, 'is', null).range(offset, offset + 999);
    if (result.error) return result;
    rows.push(...(result.data || []));
    if ((result.data || []).length < 1000) return { data: rows, error: null };
  }
}
const root = await drive.files.get({ fileId: config.driveRootFolderId, fields: 'id,name,mimeType,trashed', supportsAllDrives: true });
assert.equal(root.data.mimeType, FOLDER_MIME, 'GOOGLE_DRIVE_FOLDER_ID must identify a folder');
assert.equal(root.data.trashed, false, 'Configured Drive root is trashed');
const folders = (await listDriveChildren(drive, config.driveRootFolderId)).filter((file) => file.mimeType === FOLDER_MIME);
const samples = [];
for (const folder of folders.slice(0, 10)) {
  const files = await listDriveChildren(drive, folder.id);
  const docs = files.filter((file) => file.mimeType === GOOGLE_DOC_MIME);
  samples.push({ folder: folder.name, id: folder.id, metadataDocs: docs.length, media: files.filter(isSupportedMedia).length });
}
const [offerings, assets, batches] = await Promise.all([
  fetchAll('offerings', 'id,drive_folder_id,listing_status', 'drive_folder_id'),
  fetchAll('assets', 'id,drive_file_id,source_type', 'drive_file_id'),
  supabase.from('import_batches').select('id,status,source_type').eq('source_type', 'drive_import').order('started_at', { ascending: false }).limit(10),
]);
for (const result of [offerings, assets, batches]) assert.equal(result.error, null, result.error?.message || 'Supabase verification query failed');
const folderIds = new Set();
const duplicateFolders = new Set();
for (const row of offerings.data || []) {
  if (folderIds.has(row.drive_folder_id)) duplicateFolders.add(row.drive_folder_id);
  folderIds.add(row.drive_folder_id);
}
const fileIds = new Set();
const duplicateFiles = new Set();
for (const row of assets.data || []) {
  if (fileIds.has(row.drive_file_id)) duplicateFiles.add(row.drive_file_id);
  fileIds.add(row.drive_file_id);
}
assert.equal(duplicateFolders.size, 0, 'Duplicate Drive folder IDs found');
assert.equal(duplicateFiles.size, 0, 'Duplicate Drive file IDs found');
const buckets = await supabase.storage.listBuckets();
assert.equal(buckets.error, null, buckets.error?.message || 'Storage listing failed');
const bucketNames = new Set((buckets.data || []).map((bucket) => bucket.name));
assert.ok(bucketNames.has('apg-public'), 'Missing apg-public bucket');
assert.ok(bucketNames.has('apg-private'), 'Missing apg-private bucket');
console.log(JSON.stringify({
  rootFolder: root.data.name,
  propertyFolders: folders.length,
  sampleFolders: samples,
  driveLinkedOfferings: offerings.data?.length || 0,
  driveLinkedAssets: assets.data?.length || 0,
  recentBatches: batches.data || [],
  liveSync: false,
}, null, 2));
