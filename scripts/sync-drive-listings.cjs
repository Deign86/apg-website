#!/usr/bin/env node
const { google } = require('googleapis');
const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

// ==========================================================
// Config
// ==========================================================

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GOOGLE_SERVICE_ACCOUNT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
const GOOGLE_PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY;
const DRIVE_FOLDER_ID = process.env.GOOGLE_DRIVE_FOLDER_ID || '1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll';

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
const STAGING_BUCKET = 'apr-listing';
const PUBLIC_BUCKET = 'apg-public';

// ==========================================================
// Args
// ==========================================================

const args = process.argv.slice(2);
const batchIdIdx = args.indexOf('--batch-id');
const dryRunIdx = args.indexOf('--dry-run');
const folderIdIdx = args.indexOf('--folder-id');
const categoryIdx = args.indexOf('--category');
const batchId = batchIdIdx !== -1 ? args[batchIdIdx + 1] : null;
const dryRun = dryRunIdx !== -1;
const overrideFolderId = folderIdIdx !== -1 ? args[folderIdIdx + 1] : null;
const categoryFilter = categoryIdx !== -1 ? args[categoryIdx + 1] : null;

if (!batchId) {
      const today = new Date().toISOString().slice(0, 10);
      batchId = 'batch-' + today;
      console.error('[auto] --batch-id not provided, using "' + batchId + '"');
    }

const targetFolderId = overrideFolderId || DRIVE_FOLDER_ID;
// ==========================================================
// Helpers
// ==========================================================

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

function normalizeStr(s) {
  return s.toLowerCase().trim().replace(/[\s\-]+/g, ' ');
}

function assetTypeFromFile(filename, ext) {
  if (ext === '.pdf') {
    const lower = filename.toLowerCase();
    if (lower.includes('floor') || lower.includes('plan') || lower.includes('fp-')) return 'floor_plan';
    return 'brochure';
  }
  return 'image';
}

function mimeTypeFromExt(ext) {
  if (ext === '.pdf') return 'application/pdf';
  return 'image/' + ext.replace('.', '');
}

async function getOfferingMap(supabaseAdmin) {
  const { data, error } = await supabaseAdmin
    .from('offerings')
    .select('id, title, slug')
    .is('deleted_at', null);
  if (error) throw error;
  const map = [];
  for (const o of data || []) {
    const normTitle = normalizeStr(o.title || '');
    const normSlug = normalizeStr(o.slug || '');
    const titleWords = normTitle.split(' ');
    map.push({ id: o.id, titleWords, normSlug, normTitle, rawTitle: o.title || '' });
  }
  return map;
}

function scoreOffering(folderName, offerings) {
  const normFolder = normalizeStr(folderName);
  const folderWords = normFolder.split(' ');
  let best = { score: -1, id: null, title: '' };
  for (const o of offerings) {
    let s = 0;
    if (o.normSlug && normFolder === o.normSlug) s += 2;
    else if (o.normSlug && (normFolder.includes(o.normSlug) || o.normSlug.includes(normFolder))) s += 2;
    for (const fw of folderWords) {
      if (fw.length < 3) continue;
      if (o.titleWords.some(tw => tw.includes(fw) || fw.includes(tw))) s += 1;
    }
    if (s > best.score) best = { score: s, id: o.id, title: o.rawTitle };
  }
  return best;
}

async function alreadyUploaded(supabaseAdmin, sourcePath, checksum) {
  const { data } = await supabaseAdmin
    .from('import_file_mappings')
    .select('id, status')
    .eq('source_path', sourcePath)
    .eq('checksum_sha256', checksum)
    .eq('status', 'uploaded')
    .maybeSingle();
  return !!data;
}
// ==========================================================
// Drive API helpers
// ==========================================================

async function listFilesRecursive(drive, folderId, relativePath, sourceFolder) {
  if (relativePath === undefined) relativePath = '';
  if (sourceFolder === undefined) sourceFolder = '';
  const results = [];
  let pageToken = null;
  do {
    const resp = await drive.files.list({
      q: "'" + folderId + "' in parents and trashed=false",
      fields: 'nextPageToken, files(id, name, mimeType, modifiedTime, size, md5Checksum)',
      pageSize: 1000,
      pageToken: pageToken,
      orderBy: 'folder, name',
    });
    const files = resp.data.files || [];
    for (const file of files) {
      if (file.mimeType === 'application/vnd.google-apps.folder') {
        const childRel = relativePath ? relativePath + '/' + file.name : file.name;
        const children = await listFilesRecursive(drive, file.id, childRel, file.name);
        for (const c of children) results.push(c);
      } else {
        const ext = path.extname(file.name).toLowerCase();
        if (!ALLOWED_EXT.has(ext)) continue;
        results.push({
          id: file.id, name: file.name, ext: ext,
          mimeType: file.mimeType || mimeTypeFromExt(ext),
          modifiedTime: file.modifiedTime,
          size: parseInt(file.size || '0', 10),
          md5Checksum: file.md5Checksum || '',
          relativePath: relativePath ? relativePath + '/' + file.name : file.name,
          sourceFolder: sourceFolder || '(root)',
        });
      }
    }
    pageToken = resp.data.nextPageToken || null;
  } while (pageToken);
  return results;
}

async function downloadFile(drive, fileId) {
  const resp = await drive.files.get(
    { fileId: fileId, alt: 'media' },
    { responseType: 'arraybuffer' }
  );
  return Buffer.from(resp.data);
}

// ==========================================================
// Main
// ==========================================================

async function run() {

  if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
  }
  if ((!GOOGLE_SERVICE_ACCOUNT_EMAIL || !GOOGLE_PRIVATE_KEY) && !process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    console.error('Missing Google credentials. Set GOOGLE_SERVICE_ACCOUNT_EMAIL + GOOGLE_PRIVATE_KEY');
    console.error('  or GOOGLE_APPLICATION_CREDENTIALS in your environment.');
    process.exit(1);
  }

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
  });

  let auth;
  if (GOOGLE_SERVICE_ACCOUNT_JSON) {
    let creds;
    if (GOOGLE_SERVICE_ACCOUNT_JSON.trim().startsWith('{')) {
      creds = JSON.parse(GOOGLE_SERVICE_ACCOUNT_JSON);
    } else {
      const credsPath = path.resolve(GOOGLE_SERVICE_ACCOUNT_JSON);
      if (!fs.existsSync(credsPath)) {
        console.error('GOOGLE_SERVICE_ACCOUNT_JSON file not found:', credsPath);
        process.exit(1);
      }
      creds = JSON.parse(fs.readFileSync(credsPath, 'utf8'));
    }
    auth = new google.auth.JWT(
      creds.client_email, null,
      creds.private_key.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive.readonly'],
      null
    );
  } else if (GOOGLE_SERVICE_ACCOUNT_EMAIL && GOOGLE_PRIVATE_KEY) {
    auth = new google.auth.JWT(
      GOOGLE_SERVICE_ACCOUNT_EMAIL, null,
      GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/drive.readonly'],
      null
    );
  } else {
    const keyFilePath = path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS);
    if (!fs.existsSync(keyFilePath)) {
      console.error('GOOGLE_APPLICATION_CREDENTIALS file not found:', keyFilePath);
      process.exit(1);
    }
    auth = new google.auth.JWT({ keyFile: keyFilePath, scopes: ['https://www.googleapis.com/auth/drive.readonly'] });
  }

  const drive = google.drive({ version: 'v3', auth: auth });
  console.error(!dryRun ? 'LIVE RUN' : 'DRY RUN', 'batch=' + batchId + ' folder=' + targetFolderId);

  const { error: batchErr } = await supabaseAdmin.from('import_batches').upsert({
    id: batchId, source_root: 'drive://' + targetFolderId, status: 'running',
    started_at: new Date().toISOString(),
  }, { onConflict: 'id' }).select().single();
  if (batchErr) { console.error('Batch insert error:', batchErr); process.exit(1); }

  const offerings = await getOfferingMap(supabaseAdmin);
  console.error('Loaded ' + offerings.length + ' offerings for matching.');

  console.error('Listing files from Google Drive (this may take a while)...');
  let files = await listFilesRecursive(drive, targetFolderId);
  console.error('Found ' + files.length + ' allowed files.');

  if (categoryFilter) {
    const f = categoryFilter.toLowerCase().trim();
    files = files.filter(function(x) { return x.relativePath.toLowerCase().includes(f); });
    console.error('After category filter "' + categoryFilter + '": ' + files.length + ' files.');
  }

  const stats = { processed: 0, uploaded: 0, skipped: 0, failed: 0, errors: [] };

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const sourcePath = 'drive://' + targetFolderId + '/' + file.relativePath + '#' + file.id;
    stats.processed += 1;

    if ((i + 1) % 100 === 0 || i === 0 || i === files.length - 1) {
      console.error('[' + (i + 1) + '/' + files.length + '] ' + file.relativePath);
    }

    const already = await alreadyUploaded(supabaseAdmin, sourcePath, file.md5Checksum);
    if (already) {
      stats.skipped += 1;
      if (!dryRun) {
        await supabaseAdmin.from('import_file_mappings').insert({
          import_batch_id: batchId, source_path: sourcePath,
          source_filename: file.name, source_folder: file.sourceFolder,
          file_size_bytes: file.size, mime_type: file.mimeType,
          checksum_sha256: file.md5Checksum, status: 'skipped_duplicate',
          processed_at: new Date().toISOString(),
        }).catch(function() {});
      }
      continue;
    }

    let fileBytes;
    try {
      fileBytes = await downloadFile(drive, file.id);
    } catch (err) {
      stats.failed += 1;
      stats.errors.push({ path: sourcePath, error: err.message });
      if (!dryRun) {
        await supabaseAdmin.from('import_file_mappings').insert({
          import_batch_id: batchId, source_path: sourcePath,
          source_filename: file.name, source_folder: file.sourceFolder,
          file_size_bytes: file.size, mime_type: file.mimeType,
          checksum_sha256: file.md5Checksum, status: 'failed',
          error_message: err.message, processed_at: new Date().toISOString(),
        }).catch(function() {});
      }
      continue;
    }

    const checksum = sha256(fileBytes);
    const type = assetTypeFromFile(file.name, file.ext);
    const assetId = crypto.randomUUID();
    const storagePath = assetId + '-original' + file.ext;
    const mimeType = file.mimeType;
    const fileSize = fileBytes.length;

    if (dryRun) {
      const match = scoreOffering(file.sourceFolder, offerings);
      console.error('[dry-run] ' + file.relativePath + ' -> staging:' + storagePath + ' offering=' + (match.id || 'none'));
      continue;
    }

    // === LIVE ===
    const { error: stagingErr } = await supabaseAdmin.storage
      .from(STAGING_BUCKET)
      .upload(storagePath, fileBytes, { contentType: mimeType, upsert: false });

    if (stagingErr) {
      stats.failed += 1;
      stats.errors.push({ path: sourcePath, error: 'staging: ' + stagingErr.message });
      await supabaseAdmin.from('import_file_mappings').insert({
        import_batch_id: batchId, source_path: sourcePath,
        source_filename: file.name, source_folder: file.sourceFolder,
        file_size_bytes: fileSize, mime_type: mimeType,
        checksum_sha256: checksum, asset_id: assetId, status: 'failed',
        error_message: stagingErr.message, processed_at: new Date().toISOString(),
      }).catch(function() {});
      continue;
    }

    const match = scoreOffering(file.sourceFolder, offerings);
    const matched = match.id && match.score >= 2;
    let publishedTo = STAGING_BUCKET;
    let isPublic = false;

    if (matched) {
      const { error: pubErr } = await supabaseAdmin.storage
        .from(PUBLIC_BUCKET)
        .upload(storagePath, fileBytes, { contentType: mimeType, upsert: false });
      if (pubErr) {
        console.error('Warning: public upload failed for ' + file.name + ': ' + pubErr.message);
      } else {
        publishedTo = PUBLIC_BUCKET;
        isPublic = true;
      }
    }

    const { error: assetErr } = await supabaseAdmin.from('assets').insert({
      id: assetId, asset_type: type, mime_type: mimeType,
      size_bytes: fileSize, original_name: file.name,
      storage_path: storagePath, storage_bucket: publishedTo,
      is_public: isPublic, import_batch_id: batchId,
      source_path: sourcePath, source_folder: file.sourceFolder,
      ingestion_status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (assetErr) {
      stats.failed += 1;
      stats.errors.push({ path: sourcePath, error: 'assets: ' + assetErr.message });
      await supabaseAdmin.from('import_file_mappings').insert({
        import_batch_id: batchId, source_path: sourcePath,
        source_filename: file.name, source_folder: file.sourceFolder,
        file_size_bytes: fileSize, mime_type: mimeType,
        checksum_sha256: checksum, asset_id: assetId,
        status: 'failed', error_message: assetErr.message,
        processed_at: new Date().toISOString(),
      }).catch(function() {});
      continue;
    }

    const mappingStatus = matched ? 'uploaded' : 'skipped_no_match';
    const { error: mapErr } = await supabaseAdmin.from('import_file_mappings').insert({
      import_batch_id: batchId, source_path: sourcePath,
      source_filename: file.name, source_folder: file.sourceFolder,
      file_size_bytes: fileSize, mime_type: mimeType,
      checksum_sha256: checksum, asset_id: assetId,
      status: mappingStatus, processed_at: new Date().toISOString(),
    });
    if (mapErr) console.error('Mapping insert error (non-fatal):', mapErr.message);

    if (matched) {
      const { data: existingRels } = await supabaseAdmin
        .from('property_asset_relations')
        .select('display_order')
        .eq('offering_id', match.id)
        .order('display_order', { ascending: false })
        .limit(1);

      const displayOrder = (existingRels && existingRels[0]) ? (existingRels[0].display_order || 0) + 1 : 0;
      const isCover = displayOrder === 0;

      const { error: relErr } = await supabaseAdmin.from('property_asset_relations').insert({
        offering_id: match.id, asset_id: assetId,
        gallery_role: 'gallery', display_order: displayOrder,
        is_cover: isCover,
      });
      if (relErr) console.error('Relation insert error (non-fatal):', relErr.message);

      const { error: updErr } = await supabaseAdmin
        .from('offerings')
        .update({ gallery_count: displayOrder + 1 })
        .eq('id', match.id);
      if (updErr) console.error('Offering update error (non-fatal):', updErr.message);
    }

    stats.uploaded += 1;
  }

  // --- Finalize batch ---
  const batchStatus = stats.failed > 0 ? (stats.uploaded > 0 ? 'partial_failure' : 'failed') : 'completed';
  await supabaseAdmin.from('import_batches').update({
    status: batchStatus, completed_at: new Date().toISOString(),
    stats: stats,
    error_summary: stats.errors.length > 0 ? stats.errors.map(function(e) { return e.error; }).join('; ') : null,
  }).eq('id', batchId);

  const result = { batchId: batchId, mode: dryRun ? 'dry-run' : 'live' };
  result.processed = stats.processed;
  result.uploaded = stats.uploaded;
  result.skipped = stats.skipped;
  result.failed = stats.failed;
  result.errors = stats.errors;
  console.log(JSON.stringify(result, null, 2));
  process.exit(stats.failed > 0 && !dryRun ? 1 : 0);
}

run().catch(function(err) {
  console.error('Fatal:', err);
  process.exit(1);
});


