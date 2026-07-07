#!/usr/bin/env node
// scripts/ingest-apg-listings.js
// Usage:
//   node scripts/ingest-apg-listings.js --source-root "<path>" --batch-id "<id>" [--dry-run]
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}
const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ---- Args ----
const args = process.argv.slice(2);
const srcRootIdx = args.indexOf('--source-root');
const batchIdIdx = args.indexOf('--batch-id');
const dryRunIdx = args.indexOf('--dry-run');
const sourceRoot = srcRootIdx !== -1 ? args[srcRootIdx + 1] : null;
const batchId = batchIdIdx !== -1 ? args[batchIdIdx + 1] : null;
const dryRun = dryRunIdx !== -1;

if (!sourceRoot || !batchId) {
  console.log(JSON.stringify({
    error: 'Missing required arguments',
    usage: 'node scripts/ingest-apg-listings.js --source-root "<path>" --batch-id "<id>" [--dry-run]',
  }, null, 2));
  process.exit(1);
}

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.pdf']);
const ASSET_BUCKET = 'apg-public';

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

async function getOfferingMap() {
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

async function alreadyUploaded(sourcePath, checksum) {
  const { data } = await supabaseAdmin
    .from('import_file_mappings')
    .select('id, status')
    .eq('source_path', sourcePath)
    .eq('checksum_sha256', checksum)
    .eq('status', 'uploaded')
    .maybeSingle();
  return !!data;
}

async function run() {
  console.error(!dryRun ? 'LIVE RUN' : 'DRY RUN', `batch=${batchId} source=${sourceRoot}`);

  // Register batch
  const { data: batchRow, error: batchErr } = await supabaseAdmin
    .from('import_batches')
    .upsert({ id: batchId, source_root: sourceRoot, status: 'running', started_at: new Date().toISOString() }, { onConflict: 'id' })
    .select()
    .single();
  if (batchErr) { console.error('Batch insert error:', batchErr); process.exit(1); }

  if (!fs.existsSync(sourceRoot)) {
    await supabaseAdmin.from('import_batches').update({ status: 'failed', error_summary: 'source_root does not exist' }).eq('id', batchId);
    console.error('Source root does not exist:', sourceRoot);
    process.exit(1);
  }

  const offerings = await getOfferingMap();
  const stats = { processed: 0, uploaded: 0, skipped: 0, failed: 0, errors: [] };

  const entries = fs.readdirSync(sourceRoot, { withFileTypes: true });
  const subfolders = entries.filter(e => e.isDirectory());

  for (const sf of subfolders) {
    const folderPath = path.join(sourceRoot, sf.name);
    const files = fs.readdirSync(folderPath, { withFileTypes: true });
    const imageFiles = files.filter(f => {
      const ext = path.extname(f.name).toLowerCase();
      return f.isFile() && ALLOWED_EXT.has(ext);
    });

    for (const file of imageFiles) {
      const absPath = path.join(folderPath, file.name);
      const ext = path.extname(file.name).toLowerCase();
      const sourceFilename = file.name;
      const sourceFolder = sf.name;

      stats.processed += 1;

      // Read + checksum
      let fileBytes, checksum, fileSize;
      try {
        fileBytes = fs.readFileSync(absPath);
        checksum = sha256(fileBytes);
        fileSize = fileBytes.length;
      } catch (err) {
        stats.failed += 1;
        stats.errors.push({ path: absPath, error: err.message });
        await supabaseAdmin.from('import_file_mappings').insert({
          import_batch_id: batchId, source_path: absPath, source_filename: sourceFilename,
          source_folder: sourceFolder, status: 'failed', error_message: err.message,
          processed_at: new Date().toISOString(),
        });
        continue;
      }

      // Idempotency check
      const already = await alreadyUploaded(absPath, checksum);
      if (already) {
        stats.skipped += 1;
        if (!dryRun) {
          await supabaseAdmin.from('import_file_mappings').insert({
            import_batch_id: batchId, source_path: absPath, source_filename: sourceFilename,
            source_folder: sourceFolder, file_size_bytes: fileSize, mime_type: ext.replace('.', ''),
            checksum_sha256: checksum, status: 'skipped_duplicate', processed_at: new Date().toISOString(),
          });
        }
        continue;
      }

      const assetType = assetTypeFromFile(sourceFilename, ext);
      const assetId = crypto.randomUUID();
      const storagePath = `${assetId}-original${ext}`;
      const mimeType = ext === '.pdf' ? 'application/pdf' : `image/${ext.replace('.', '')}`;

      if (dryRun) {
        const match = scoreOffering(sourceFolder, offerings);
        console.error(`[dry-run] would upload ${sourceFilename} → ${storagePath} offering=${match.id || 'none'}`);
      } else {
        // Upload
        try {
          const { error: uploadErr } = await supabaseAdmin.storage
            .from(ASSET_BUCKET)
            .upload(storagePath, fileBytes, { contentType: mimeType, upsert: false });
          if (uploadErr) throw uploadErr;
        } catch (err) {
          stats.failed += 1;
          stats.errors.push({ path: absPath, error: err.message });
          await supabaseAdmin.from('import_file_mappings').insert({
            import_batch_id: batchId, source_path: absPath, source_filename: sourceFilename,
            source_folder: sourceFolder, file_size_bytes: fileSize, mime_type: mimeType,
            checksum_sha256: checksum, asset_id: assetId, status: 'failed',
            error_message: err.message, processed_at: new Date().toISOString(),
          });
          continue;
        }

        // Insert assets row
        const { error: assetErr } = await supabaseAdmin.from('assets').insert({
          id: assetId,
          asset_type: assetType,
          mime_type: mimeType,
          size_bytes: fileSize,
          original_name: sourceFilename,
          storage_path: storagePath,
          storage_bucket: ASSET_BUCKET,
          is_public: true,
          import_batch_id: batchId,
          source_path: absPath,
          source_folder: sourceFolder,
          ingestion_status: 'active',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
        if (assetErr) {
          stats.failed += 1;
          stats.errors.push({ path: absPath, error: assetErr.message });
          await supabaseAdmin.from('import_file_mappings').insert({
            import_batch_id: batchId, source_path: absPath, source_filename: sourceFilename,
            source_folder: sourceFolder, file_size_bytes: fileSize, mime_type: mimeType,
            checksum_sha256: checksum, asset_id: assetId, status: 'failed',
            error_message: assetErr.message, processed_at: new Date().toISOString(),
          });
          continue;
        }

        // Map
        const match = scoreOffering(sourceFolder, offerings);
        const mappingStatus = match.score >= 2 ? 'uploaded' : 'skipped_no_match';
        const { error: mapErr } = await supabaseAdmin.from('import_file_mappings').insert({
          import_batch_id: batchId, source_path: absPath, source_filename: sourceFilename,
          source_folder: sourceFolder, file_size_bytes: fileSize, mime_type: mimeType,
          checksum_sha256: checksum, asset_id: assetId, status: mappingStatus,
          processed_at: new Date().toISOString(),
        });
        if (mapErr) console.error('Mapping insert error (non-fatal):', mapErr.message);

        // Relations if matched
        if (match.id && match.score >= 2) {
          const { data: existingRels } = await supabaseAdmin
            .from('property_asset_relations')
            .select('display_order')
            .eq('offering_id', match.id)
            .order('display_order', { ascending: false })
            .limit(1);
          const displayOrder = (existingRels && existingRels[0]) ? (existingRels[0].display_order || 0) + 1 : 0;
          const isCover = displayOrder === 0;

          const { error: relErr } = await supabaseAdmin.from('property_asset_relations').insert({
            offering_id: match.id,
            asset_id: assetId,
            gallery_role: 'gallery',
            display_order: displayOrder,
            is_cover: isCover,
          });
          if (relErr) console.error('Relation insert error (non-fatal):', relErr.message);

          const { error: updErr } = await supabaseAdmin
            .from('offerings')
            .update({ gallery_count: (displayOrder + 1) })
            .eq('id', match.id);
          if (updErr) console.error('Offering update error (non-fatal):', updErr.message);
        }

        stats.uploaded += 1;
      }
    }
  }

  // Finalize batch
  const batchStatus = stats.failed > 0 ? (stats.uploaded > 0 ? 'partial_failure' : 'failed') : 'completed';
  await supabaseAdmin.from('import_batches').update({
    status: batchStatus,
    completed_at: new Date().toISOString(),
    stats,
    error_summary: stats.errors.length > 0 ? stats.errors.map(e => e.error).join('; ') : null,
  }).eq('id', batchId);

  const result = { batchId, mode: dryRun ? 'dry-run' : 'live', ...stats };
  console.log(JSON.stringify(result, null, 2));
  process.exit(stats.failed > 0 && !dryRun ? 1 : 0);
}

run().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
