#!/usr/bin/env node
'use strict';

const path = require('node:path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config();

function argValue(args, name) {
  const index = args.indexOf(name);
  return index === -1 ? null : args[index + 1] || null;
}

function printHelp() {
  console.log(`Usage: node scripts/sync-drive-listings.cjs [options]

  --dry-run                  Preview direct child folders without database or storage writes (default)
  --commit                   Commit imports as drafts; never publishes or archives automatically
  --root-folder-id <id>      Override GOOGLE_DRIVE_FOLDER_ID
  --folder-id <id>           Import one property folder
  --batch-id <id>            Prefix import batch IDs
  --actor-id <uuid>          Active admin/owner profile ID required with --commit
`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.includes('--help') || args.includes('-h')) return printHelp();
  if (args.includes('--archive-missing') || args.includes('--no-archive-missing') || args.includes('--skip-media') || args.includes('--skip-docs')) {
    throw new Error('Live reconciliation flags are not supported; Drive is controlled intake only');
  }
  const commit = args.includes('--commit');
  const dryRun = !commit || args.includes('--dry-run');
  if (commit && args.includes('--dry-run')) throw new Error('Choose either --dry-run or --commit');
  const rootFolderId = argValue(args, '--root-folder-id') || process.env.GOOGLE_DRIVE_FOLDER_ID || process.env.GOOGLE_DRIVE_LISTING_FOLDER_ID;
  const folderId = argValue(args, '--folder-id');
  if (!rootFolderId) throw new Error('Missing GOOGLE_DRIVE_FOLDER_ID or --root-folder-id');
  const actorId = argValue(args, '--actor-id') || process.env.DRIVE_IMPORT_ACTOR_ID;
  if (commit && !actorId) throw new Error('--actor-id or DRIVE_IMPORT_ACTOR_ID is required for committed imports');
  const { createDriveClient } = await import('../server/drive/client.js');
  const { createServerSupabase } = await import('../server/config.js');
  const { listDriveChildren, FOLDER_MIME } = await import('../server/drive/client.js');
  const { previewDriveImport, commitDriveImport } = await import('../server/drive/import-service.js');
  const { drive } = createDriveClient(process.env, rootFolderId);
  const supabase = commit ? createServerSupabase() : null;
  if (commit && !supabase) throw new Error('Supabase is not configured for committed imports');
  const folders = folderId
    ? [{ id: folderId, name: folderId }]
    : (await listDriveChildren(drive, rootFolderId)).filter((file) => file.mimeType === FOLDER_MIME);
  const results = [];
  for (const folder of folders) {
    try {
      if (dryRun) results.push(await previewDriveImport({ drive, supabase, rootFolderId, driveFolderUrlOrId: folder.id }));
      else results.push(await commitDriveImport({ drive, supabase, rootFolderId, driveFolderId: folder.id, mode: 'create_draft_or_update_draft', actorId, batchId: argValue(args, '--batch-id') ? `${argValue(args, '--batch-id')}-${folder.id}` : undefined }));
    } catch (error) {
      results.push({ folderId: folder.id, status: 'failed', error: error.message, code: error.code || null });
    }
  }
  const failed = results.filter((result) => result.status === 'failed' || result.validation?.ok === false && result.validation?.errors?.length);
  console.log(JSON.stringify({ dryRun, commit: !dryRun, rootFolderId, folders: folders.length, failed: failed.length, results }, null, 2));
  if (failed.length) process.exitCode = 1;
}

main().catch((error) => {
  console.error(`Drive import failed: ${error.message}`);
  process.exitCode = 1;
});
