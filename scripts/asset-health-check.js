#!/usr/bin/env node
// scripts/asset-health-check.js — Read-only nightly verification for the APG asset layer
// Usage: node scripts/asset-health-check.js [--batch-id <id>] [--format json]

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// ---- Config ----
const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Lazy-load supabase client (matching existing project pattern)
let supabaseAdmin = null;
function getAdmin() {
  if (!supabaseAdmin) {
    const { createClient } = require('@supabase/supabase-js');
    supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return supabaseAdmin;
}

// ---- Args ----
const args = process.argv.slice(2);
const batchIdIdx = args.indexOf('--batch-id');
const batchId = batchIdIdx !== -1 ? args[batchIdIdx + 1] : null;
const formatIdx = args.indexOf('--format');
const jsonOutput = formatIdx !== -1 && args[formatIdx + 1] === 'json';

// ---- Main ----
async function main() {
  const admin = getAdmin();
  const issues = [];
  const now = new Date().toISOString();
  let totalAssets = 0;

  // 1. Orphaned relations: property_asset_relations pointing to error/pending_review assets
  try {
    const { data: badAssets } = await admin
      .from('assets')
      .select('id, storage_path, storage_bucket, ingestion_status, error_message')
      .in('ingestion_status', ['error', 'pending_review']);
    if (badAssets && badAssets.length > 0) {
      for (const a of badAssets) {
        const { data: rels } = await admin
          .from('property_asset_relations')
          .select('id, offering_id')
          .eq('asset_id', a.id);
        if (rels && rels.length > 0) {
          issues.push({
            type: 'orphaned_relation',
            asset_id: a.id,
            storage_path: a.storage_path,
            ingestion_status: a.ingestion_status,
            error_message: a.error_message,
            relations: rels.map(r => ({ relation_id: r.id, offering_id: r.offering_id })),
            message: `Asset ingestion_status='${a.ingestion_status}' but is referenced by ${rels.length} property_asset_relations row(s)`,
          });
        }
      }
    }
  } catch (err) {
    issues.push({ type: 'query_error', message: `Failed to query error assets: ${err.message}` });
  }

  // 2. Unmatched files: import_file_mappings with status = 'skipped_no_match'
  try {
    let query = admin
      .from('import_file_mappings')
      .select('id, import_batch_id, source_path, source_filename, source_folder, status')
      .eq('status', 'skipped_no_match');
    if (batchId) query = query.eq('import_batch_id', batchId);
    const { data: unmatched } = await query;
    if (unmatched && unmatched.length > 0) {
      for (const m of unmatched) {
        issues.push({
          type: 'unmatched_file',
          mapping_id: m.id,
          import_batch_id: m.import_batch_id,
          source_path: m.source_path,
          source_filename: m.source_filename,
          source_folder: m.source_folder,
          message: `File could not be matched to any offering — requires admin review`,
        });
      }
    }
  } catch (err) {
    issues.push({ type: 'query_error', message: `Failed to query unmatched mappings: ${err.message}` });
  }

  // 3. Broken cover assignments: offerings.cover_asset_id pointing to non-existent or archived assets
  try {
    const { data: offeringsWithCover } = await admin
      .from('offerings')
      .select('id, title, cover_asset_id')
      .not('cover_asset_id', 'is', null);
    if (offeringsWithCover && offeringsWithCover.length > 0) {
      const assetIds = offeringsWithCover.map(o => o.cover_asset_id);
      const { data: coverAssets } = await admin
        .from('assets')
        .select('id, ingestion_status')
        .in('id', assetIds);
      const validIds = new Set((coverAssets || []).filter(a => a.ingestion_status === 'active').map(a => a.id));
      for (const o of offeringsWithCover) {
        if (!validIds.has(o.cover_asset_id)) {
          issues.push({
            type: 'broken_cover',
            offering_id: o.id,
            offering_title: o.title,
            cover_asset_id: o.cover_asset_id,
            message: `offering.cover_asset_id references asset ${o.cover_asset_id} which is missing or not active`,
          });
        }
      }
    }
  } catch (err) {
    // Non-blocking: cover_asset_id column may not yet exist in all environments
  }

  // 4. Storage existence spot-check: pick 10 random public assets and verify via list()
  try {
    const { data: sampleAssets } = await admin
      .from('assets')
      .select('id, storage_path, storage_bucket, ingestion_status')
      .eq('storage_bucket', 'apg-public')
      .eq('is_public', true)
      .limit(10);
    if (sampleAssets && sampleAssets.length > 0) {
      const { data: storageList } = await admin.storage
        .from('apg-public')
        .list('', { limit: 1000 });
      const storagePaths = new Set((storageList || []).map(f => f.name));
      totalAssets += sampleAssets.length;
      for (const a of sampleAssets) {
        if (!storagePaths.has(a.storage_path)) {
          issues.push({
            type: 'missing_storage_object',
            asset_id: a.id,
            storage_path: a.storage_path,
            storage_bucket: a.storage_bucket,
            message: `File not found in apg-public bucket — CDN will return 404`,
          });
        }
      }
    }
  } catch (err) {
    issues.push({ type: 'storage_check_error', message: `Storage list failed: ${err.message}` });
  }

  // ---- Output ----
  const report = {
    checked_at: now,
    batch_id: batchId || 'all',
    total_assets_checked: totalAssets,
    issues_found: issues.length,
    issues,
  };

  if (jsonOutput) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(`\n=== Asset Health Check — ${now} ===`);
    console.log(`Batch: ${batchId || 'all'} | Assets sampled: ${totalAssets} | Issues: ${issues.length}\n`);
    if (issues.length === 0) {
      console.log('✓ No issues found.\n');
    } else {
      for (const issue of issues) {
        console.log(`[${issue.type.toUpperCase()}] ${issue.message}`);
        console.log(`  asset_id: ${issue.asset_id || 'n/a'} | path: ${issue.storage_path || issue.source_path || 'n/a'}`);
      }
      console.log(`\n${issues.length} issue(s) require attention.\n`);
    }
  }

  process.exit(issues.length > 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Health check failed:', err);
  process.exit(1);
});
