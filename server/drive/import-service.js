import { getDriveFile, listDriveChildren, listDriveTree, exportGoogleDoc, GOOGLE_DOC_MIME, FOLDER_MIME, downloadDriveFile } from './client.js';
import { parseDisplayNumber, parseListingMetadata, validateListingMetadata } from './metadata.js';
import { checksumFor, chooseCover, isImage, isSupportedMedia, mediaType, mimeTypeFor, orderMedia, stableOfferingStoragePath } from './media.js';

const ROOT_ID_PATTERN = /^[A-Za-z0-9_-]{10,}$/;
const DRAFT_STATUSES = new Set(['draft', 'for_review']);
const IMPORTABLE_FIELDS = new Set(['title', 'status', 'property_type', 'transaction_type', 'price', 'price_unit', 'location', 'floor_area', 'lot_area', 'bedrooms', 'bathrooms', 'parking_slots', 'description']);
const locks = new Map();

export class ImportError extends Error {
  constructor(message, status = 400, code = 'invalid_import') {
    super(message);
    this.statusCode = status;
    this.code = code;
  }
}

export function extractDriveFolderId(value) {
  const raw = String(value || '').trim();
  if (ROOT_ID_PATTERN.test(raw)) return raw;
  let url;
  try { url = new URL(raw); } catch { throw new ImportError('Enter a valid Google Drive folder URL or ID'); }
  if (!/^(?:www\.)?drive\.google\.com$/i.test(url.hostname)) {
    throw new ImportError('Enter a valid Google Drive folder URL or ID');
  }
  const match = url.pathname.match(/\/folders\/([A-Za-z0-9_-]+)/i) || url.searchParams.get('id')?.match(/^([A-Za-z0-9_-]+)$/);
  const id = match?.[1] || null;
  if (!id || !ROOT_ID_PATTERN.test(id)) throw new ImportError('Enter a valid Google Drive folder URL or ID');
  return id;
}

async function withFolderLock(folderId, callback) {
  const previous = locks.get(folderId) || Promise.resolve();
  let release;
  const current = new Promise((resolve) => { release = resolve; });
  const queued = previous.then(() => current);
  locks.set(folderId, queued);
  await previous;
  try { return await callback(); } finally {
    release();
    if (locks.get(folderId) === queued) locks.delete(folderId);
  }
}

async function validateFolder(drive, rootFolderId, folderId) {
  let folder;
  try { folder = await getDriveFile(drive, folderId); } catch { throw new ImportError('Drive folder is inaccessible', 404, 'drive_folder_inaccessible'); }
  if (folder.mimeType !== FOLDER_MIME || folder.trashed) throw new ImportError('Drive item is not an active folder', 400, 'invalid_drive_folder');
  if (folderId === rootFolderId) throw new ImportError('Import a property subfolder, not the configured Drive root', 400, 'root_folder_not_property');
  let root;
  try { root = await getDriveFile(drive, rootFolderId); } catch { throw new ImportError('Configured Drive root is inaccessible', 503, 'drive_root_inaccessible'); }
  if (root.mimeType !== FOLDER_MIME || root.trashed) throw new ImportError('Configured Drive root is not an active folder', 503, 'invalid_drive_root');
  const directChild = (folder.parents || []).includes(rootFolderId)
    || (await listDriveChildren(drive, rootFolderId)).some((candidate) => candidate.id === folderId);
  if (!directChild) throw new ImportError('Folder must be a direct child of the configured Drive root', 403, 'folder_outside_root');
  return folder;
}

async function findExisting(supabase, folderId) {
  if (!supabase) return null;
  const result = await supabase.from('offerings').select('*').eq('drive_folder_id', folderId).maybeSingle();
  if (result.error) throw result.error;
  return result.data || null;
}

function validationFor(parsed, docs) {
  if (docs.length > 1) return { ok: false, publishable: false, missing: [], warnings: ['multiple_metadata_documents'], errors: ['multiple_metadata_documents'] };
  if (!docs.length) return { ok: false, publishable: false, missing: ['metadata_document'], warnings: ['missing_metadata_document'], errors: ['missing_metadata_document'] };
  const result = validateListingMetadata(parsed);
  return { ok: result.publishable, publishable: result.publishable, missing: result.missing, warnings: [...(parsed.warnings || [])], errors: [] };
}

function manifestFor(files) {
  return orderMedia(files.filter(isSupportedMedia)).map((file, displayOrder) => ({
    fileId: file.id,
    name: file.name,
    mimeType: mimeTypeFor(file),
    sizeBytes: Number(file.size || 0) || null,
    modifiedTime: file.modifiedTime || null,
    inferredType: mediaType(file),
    displayOrder,
    selected: true,
  }));
}

function fieldDiff(existing, metadata) {
  const pairs = {
    title: metadata.title || existing?.title || null,
    status: metadata.availability_status,
    property_type: metadata.property_type,
    price: metadata.price,
    location: metadata.location,
    bedrooms: metadata.bedrooms,
    bathrooms: metadata.bathrooms,
    floor_area: metadata.floor_area,
    lot_area: metadata.lot_area,
    description: metadata.description,
  };
  return Object.entries(pairs)
    .filter(([field, incoming]) => incoming != null && String(incoming) !== String(existing?.[field] ?? ''))
    .map(([field, incoming]) => ({ field, current: existing?.[field] ?? null, incoming }));
}

async function readFolder({ drive, supabase, rootFolderId, driveFolderUrlOrId }) {
  if (!rootFolderId) throw new ImportError('Drive import is not configured', 503, 'config_missing');
  const folderId = extractDriveFolderId(driveFolderUrlOrId);
  const folder = await validateFolder(drive, rootFolderId, folderId);
  const files = await listDriveTree(drive, folderId);
  const docs = files.filter((file) => file.mimeType === GOOGLE_DOC_MIME);
  let parsed = {};
  if (docs.length === 1) {
    const text = await exportGoogleDoc(drive, docs[0].id);
    parsed = parseListingMetadata(text);
  }
  const existing = await findExisting(supabase, folderId);
  return { folderId, folder, files, docs, parsed, existing };
}

export async function previewDriveImport(args = {}) {
  const snapshot = await readFolder(args);
  const validation = validationFor(snapshot.parsed, snapshot.docs);
  const manifest = manifestFor(snapshot.files);
  const cover = chooseCover(manifest.map((file) => ({ ...file, id: file.fileId, name: file.name })), snapshot.existing?.cover_drive_file_id || null);
  const existingStatus = snapshot.existing?.listing_status || (snapshot.existing?.is_published ? 'published' : 'draft');
  const operation = !snapshot.existing
    ? 'create_draft'
    : DRAFT_STATUSES.has(existingStatus) ? 'update_draft'
      : 'requires_published_confirmation';
  return {
    folder: { id: snapshot.folder.id, name: snapshot.folder.name, webViewLink: snapshot.folder.webViewLink || null },
    metadata: {
      ...snapshot.parsed,
      listing_status: 'draft',
      price: snapshot.parsed.price ?? null,
    },
    validation,
    existing: snapshot.existing ? {
      id: snapshot.existing.id,
      listingStatus: existingStatus,
      title: snapshot.existing.title,
      fieldDiff: fieldDiff(snapshot.existing, snapshot.parsed),
    } : null,
    operation,
    mediaManifest: manifest,
    proposedGalleryOrder: manifest.map((file) => file.fileId),
    proposedCoverFileId: cover?.id || null,
  };
}

function pickOverrides(overrides = {}) {
  return Object.fromEntries(Object.entries(overrides).filter(([key]) => IMPORTABLE_FIELDS.has(key)));
}

async function resolveTransactionType(supabase, name, fallbackId = null) {
  if (!name) return fallbackId;
  const existing = await supabase.from('transaction_types').select('id').eq('name', name).maybeSingle();
  if (existing.error) throw existing.error;
  if (existing.data?.id) return existing.data.id;
  const created = await supabase.from('transaction_types').insert({ name, label: name[0].toUpperCase() + name.slice(1) }).select('id').single();
  if (created.error) throw created.error;
  return created.data.id;
}

function offeringValues(metadata, folderId, doc, actorId, existing, transactionTypeId) {
  return {
    title: metadata.title,
    status: metadata.availability_status || metadata.status || existing?.status || 'Available',
    property_type: metadata.property_type || existing?.property_type || null,
    transaction_type_id: transactionTypeId || existing?.transaction_type_id || null,
    price: metadata.price ?? existing?.price ?? null,
    price_unit: metadata.price_unit || existing?.price_unit || 'PHP',
    location: metadata.location || existing?.location || null,
    bedrooms: metadata.bedrooms ?? existing?.bedrooms ?? existing?.beds ?? null,
    bathrooms: metadata.bathrooms ?? existing?.bathrooms ?? existing?.baths ?? null,
    beds: metadata.bedrooms ?? existing?.beds ?? null,
    baths: metadata.bathrooms ?? existing?.baths ?? null,
    parking_slots: metadata.parking_slots ?? existing?.parking_slots ?? existing?.garage ?? null,
    garage: metadata.parking_slots ?? existing?.garage ?? null,
    floor_area: metadata.floor_area != null ? (parseDisplayNumber(metadata.floor_area) ?? existing?.floor_area ?? null) : (existing?.floor_area ?? null),
    lot_area: metadata.lot_area != null ? (parseDisplayNumber(metadata.lot_area) ?? existing?.lot_area ?? null) : (existing?.lot_area ?? null),
    description: metadata.description || existing?.description || null,
    listing_status: existing?.listing_status || 'draft',
    is_published: false,
    drive_folder_id: folderId,
    drive_doc_id: doc?.id || existing?.drive_doc_id || null,
    drive_doc_modified_time: doc?.modifiedTime || existing?.drive_doc_modified_time || null,
    imported_at: new Date().toISOString(),
    imported_by: actorId || null,
    archived_at: null,
    deleted_at: null,
  };
}

async function createOrUpdateOffering(supabase, values, existing, folderId) {
  if (existing) {
    const result = await supabase.from('offerings').update(values).eq('id', existing.id).select('*').single();
    if (result.error) throw result.error;
    return result.data;
  }
  const result = await supabase.from('offerings').insert({ ...values, slug: `drive-${folderId}` }).select('*').single();
  if (result.error) throw result.error;
  return result.data;
}

async function uploadAsset(supabase, offering, folderId, file, buffer, checksum, batchId, existingAsset = null, staged = false) {
  const canonicalPath = stableOfferingStoragePath(offering.id, file.id, file.name);
  const path = staged ? canonicalPath.replace(`properties/${offering.id}/`, `properties/${offering.id}/staging/${batchId}/`) : canonicalPath;
  const bucket = 'apg-private';
  const upload = await supabase.storage.from(bucket).upload(path, buffer, { contentType: mimeTypeFor(file), upsert: true, cacheControl: '31536000' });
  if (upload.error) throw upload.error;
  const values = {
    asset_type: mediaType(file), mime_type: mimeTypeFor(file), size_bytes: buffer.length,
    original_name: file.name, storage_path: path, storage_bucket: bucket,
    is_public: false, import_batch_id: batchId, source_type: 'drive_import',
    source_path: `drive://${folderId}/${file.id}`, ingestion_status: 'active', error_message: null,
    drive_file_id: staged ? null : file.id, drive_folder_id: folderId,
    drive_md5_checksum: checksum.md5, drive_modified_time: file.modifiedTime || null,
    checksum_sha256: checksum.sha256,
  };
  const result = existingAsset
    ? await supabase.from('assets').update(values).eq('id', existingAsset.id).select('*').single()
    : await supabase.from('assets').insert(values).select('*').single();
  if (result.error) throw result.error;
  return result.data;
}

async function copyStagedAsset(supabase, stagedAsset) {
  const downloaded = await supabase.storage.from('apg-private').download(stagedAsset.storage_path);
  if (downloaded.error) throw downloaded.error;
  const publicPath = stagedAsset.storage_path.replace(`/staging/${stagedAsset.import_batch_id}/`, '/');
  const uploaded = await supabase.storage.from('apg-public').upload(publicPath, downloaded.data, {
    contentType: stagedAsset.mime_type,
    upsert: true,
    cacheControl: '31536000',
  });
  if (uploaded.error) throw uploaded.error;
  return publicPath;
}

async function finalizeStagedAsset(supabase, stagedAsset, publicPath, existingAsset = null, driveFileId = null) {
  if (existingAsset) {
    const updated = await supabase.from('assets').update({
      asset_type: stagedAsset.asset_type,
      mime_type: stagedAsset.mime_type,
      size_bytes: stagedAsset.size_bytes,
      original_name: stagedAsset.original_name,
      storage_path: publicPath,
      storage_bucket: 'apg-public',
      is_public: true,
      import_batch_id: stagedAsset.import_batch_id,
      source_type: 'drive_import',
      source_path: stagedAsset.source_path,
      ingestion_status: 'active',
      error_message: null,
      drive_file_id: driveFileId || stagedAsset.drive_file_id,
      drive_folder_id: stagedAsset.drive_folder_id,
      drive_md5_checksum: stagedAsset.drive_md5_checksum,
      drive_modified_time: stagedAsset.drive_modified_time,
      checksum_sha256: stagedAsset.checksum_sha256,
    }).eq('id', existingAsset.id).select('*').single();
    if (updated.error) throw updated.error;
    await supabase.from('assets').delete().eq('id', stagedAsset.id);
    await supabase.storage.from('apg-private').remove([stagedAsset.storage_path]);
    return updated.data;
  }
  const updated = await supabase.from('assets').update({ storage_bucket: 'apg-public', storage_path: publicPath, is_public: true, drive_file_id: driveFileId || stagedAsset.drive_file_id }).eq('id', stagedAsset.id).select('*').single();
  if (updated.error) throw updated.error;
  await supabase.storage.from('apg-private').remove([stagedAsset.storage_path]);
  return updated.data;
}

async function getExistingAsset(supabase, driveFileId) {
  const result = await supabase.from('assets').select('*').eq('drive_file_id', driveFileId).maybeSingle();
  if (result.error) throw result.error;
  return result.data || null;
}

async function saveRelation(supabase, offeringId, assetId, displayOrder, isCover) {
  const existing = await supabase.from('property_asset_relations').select('id').eq('offering_id', offeringId).eq('asset_id', assetId).maybeSingle();
  if (existing.error) throw existing.error;
  const values = { gallery_role: isCover ? 'hero' : 'gallery', display_order: displayOrder, is_cover: isCover };
  const result = existing.data
    ? await supabase.from('property_asset_relations').update(values).eq('id', existing.data.id)
    : await supabase.from('property_asset_relations').insert({ offering_id: offeringId, asset_id: assetId, ...values });
  if (result.error) throw result.error;
}

async function recordMapping(supabase, batchId, folderId, file, checksum, assetId, status, errorMessage = null) {
  const values = {
    import_batch_id: batchId, source_path: `drive://${folderId}/${file.id}`, source_filename: file.name,
    source_folder: folderId, source_drive_file_id: file.id, source_modified_time: file.modifiedTime || null,
    file_size_bytes: Number(file.size || 0) || null, mime_type: mimeTypeFor(file),
    checksum_sha256: checksum.sha256 || checksum.md5 || null, asset_id: assetId, status,
    error_message: errorMessage, processed_at: new Date().toISOString(),
  };
  const prior = await supabase.from('import_file_mappings').select('id').eq('import_batch_id', batchId).eq('source_drive_file_id', file.id).maybeSingle();
  if (prior.error) throw prior.error;
  const result = prior.data
    ? await supabase.from('import_file_mappings').update(values).eq('id', prior.data.id)
    : await supabase.from('import_file_mappings').insert(values);
  if (result.error) throw result.error;
}

async function updateBatch(supabase, batchId, values) {
  const result = await supabase.from('import_batches').update(values).eq('id', batchId);
  if (result.error) throw result.error;
}

export async function commitDriveImport({ drive, supabase, rootFolderId, driveFolderId, mode = 'create_draft_or_update_draft', selectedFileIds, coverFileId, metadataOverrides, actorId, batchId: requestedBatchId } = {}) {
  if (!supabase) throw new ImportError('Supabase is not configured', 503, 'config_missing');
  const validatedFolderId = extractDriveFolderId(driveFolderId);
  return withFolderLock(validatedFolderId, async () => {
    const snapshot = await readFolder({ drive, supabase, rootFolderId, driveFolderUrlOrId: validatedFolderId });
    if (snapshot.docs.length > 1) throw new ImportError('Folder contains more than one metadata Google Doc', 400, 'multiple_metadata_documents');
    if (snapshot.docs.length === 0) throw new ImportError('Folder must contain exactly one metadata Google Doc', 400, 'missing_metadata_document');
    const existingStatus = snapshot.existing?.listing_status || (snapshot.existing?.is_published ? 'published' : 'draft');
    const publishedUpdate = mode === 'update_published_listing';
    if (snapshot.existing && !DRAFT_STATUSES.has(existingStatus) && !publishedUpdate) {
      throw new ImportError('Published or archived listing requires explicit update_published_listing confirmation', 409, 'published_update_confirmation_required');
    }
    if (publishedUpdate && existingStatus !== 'published') throw new ImportError('update_published_listing is only valid for published listings', 409, 'invalid_published_update');
    const manifest = manifestFor(snapshot.files);
    const selected = new Set(selectedFileIds?.length ? selectedFileIds : manifest.map((file) => file.fileId));
    const files = manifest.filter((file) => selected.has(file.fileId)).map((file) => snapshot.files.find((candidate) => candidate.id === file.fileId)).filter(Boolean);
    const unknown = [...selected].filter((id) => !manifest.some((file) => file.fileId === id));
    if (unknown.length) throw new ImportError(`Selected Drive files are not supported: ${unknown.join(', ')}`, 400, 'invalid_selected_files');
    const cover = chooseCover(files.filter(Boolean), coverFileId || null);
    if (coverFileId && (!cover || cover.id !== coverFileId || !isImage(cover))) throw new ImportError('Cover must be a selected image file', 400, 'invalid_cover_file');
    const parsed = { ...snapshot.parsed, ...pickOverrides(metadataOverrides) };
    const validation = validationFor(parsed, snapshot.docs);
    if (!parsed.title && !snapshot.existing?.title) throw new ImportError('Metadata must include a title for a new listing', 400, 'missing_title');
    if (publishedUpdate && !validation.publishable) throw new ImportError(`Published update metadata is incomplete: ${validation.missing.join(', ')}`, 400, 'metadata_validation_failed');
    const transactionTypeId = await resolveTransactionType(supabase, parsed.transaction_type, snapshot.existing?.transaction_type_id);
    const batchId = requestedBatchId || `drive-${snapshot.folderId}-${Date.now()}`;
    const startedAt = new Date().toISOString();
    const batchInsert = await supabase.from('import_batches').insert({
      id: batchId, source_root: `drive://${rootFolderId}`, source_type: 'drive_import',
      source_folder_id: snapshot.folderId, source_doc_id: snapshot.docs[0]?.id || null,
      offering_id: publishedUpdate ? snapshot.existing.id : null, imported_by: actorId || null,
      status: 'running', stats: {}, started_at: startedAt,
    });
    if (batchInsert.error) throw batchInsert.error;
    let offering = snapshot.existing;
    if (!publishedUpdate) offering = await createOrUpdateOffering(supabase, offeringValues(parsed, snapshot.folderId, snapshot.docs[0], actorId, snapshot.existing, transactionTypeId), snapshot.existing, snapshot.folderId);
    const result = { batchId, offeringId: offering?.id || snapshot.existing?.id || null, discovered: files.length, imported: 0, skipped: 0, failed: 0, warnings: [...(snapshot.parsed.warnings || [])], failedFiles: [] };
    const saved = [];
    for (const file of files) {
      try {
        const buffer = await downloadDriveFile(drive, file.id);
        const checksum = checksumFor(buffer, file.md5Checksum);
        const existingAsset = await getExistingAsset(supabase, file.id);
        const unchanged = existingAsset && existingAsset.ingestion_status === 'active'
          && ((checksum.md5 && existingAsset.drive_md5_checksum === checksum.md5) || (checksum.sha256 && existingAsset.checksum_sha256 === checksum.sha256));
        const asset = unchanged
          ? existingAsset
          : await uploadAsset(supabase, offering, snapshot.folderId, file, buffer, checksum, batchId, publishedUpdate ? null : existingAsset, publishedUpdate);
        await recordMapping(supabase, batchId, snapshot.folderId, file, checksum, asset.id, unchanged ? 'skipped_duplicate' : 'uploaded');
        unchanged ? result.skipped++ : result.imported++;
        saved.push({ file, asset, checksum, existingAsset, unchanged });
      } catch (error) {
        result.failed++;
        result.failedFiles.push({ fileId: file.id, name: file.name, error: error.message });
        try { await recordMapping(supabase, batchId, snapshot.folderId, file, { sha256: null, md5: null }, null, 'failed', error.message); } catch {}
      }
    }
    if (publishedUpdate && result.failed === 0) {
      const copied = [];
      for (const item of saved) {
        if (item.unchanged) continue;
        try { copied.push({ item, publicPath: await copyStagedAsset(supabase, item.asset) }); } catch (error) {
          result.failed++;
          result.failedFiles.push({ fileId: item.file.id, name: item.file.name, error: `Promotion failed: ${error.message}` });
          break;
        }
      }
      if (result.failed) {
        for (const { publicPath } of copied) await supabase.storage.from('apg-public').remove([publicPath]);
      } else {
        for (const { item, publicPath } of copied) item.asset = await finalizeStagedAsset(supabase, item.asset, publicPath, item.existingAsset, item.file.id);
      }
    }
    if (publishedUpdate && result.failed === 0) {
      const values = offeringValues(parsed, snapshot.folderId, snapshot.docs[0], actorId, snapshot.existing, transactionTypeId);
      values.listing_status = 'published'; values.is_published = true; values.published_at = snapshot.existing.published_at || new Date().toISOString();
      offering = await createOrUpdateOffering(supabase, values, snapshot.existing, snapshot.folderId);
      result.offeringId = offering.id;
      for (const [index, item] of saved.entries()) await saveRelation(supabase, offering.id, item.asset.id, index, item.file.id === (cover?.id || saved[0]?.file.id));
    } else if (!publishedUpdate && offering) {
      await supabase.from('property_asset_relations').update({ is_cover: false }).eq('offering_id', offering.id);
      for (const [index, item] of saved.entries()) await saveRelation(supabase, offering.id, item.asset.id, index, item.file.id === (cover?.id || saved[0]?.file.id));
      await supabase.from('offerings').update({ cover_asset_id: saved.find((item) => item.file.id === (cover?.id || saved[0]?.file.id))?.asset.id || null, gallery_count: saved.filter((item) => isImage(item.file)).length, import_batch_id: batchId }).eq('id', offering.id);
    }
    const status = result.failed ? (result.imported || result.skipped ? 'partial_failure' : 'failed') : 'completed';
    await updateBatch(supabase, batchId, { status, stats: result, completed_at: new Date().toISOString(), error_summary: result.failedFiles.length ? JSON.stringify(result.failedFiles) : null });
    await supabase.from('activity_log').insert({ user_id: actorId || null, action: 'drive_import.commit', entity: 'offering', entity_id: String(result.offeringId || ''), meta: { batch_id: batchId, status, counts: { discovered: result.discovered, imported: result.imported, skipped: result.skipped, failed: result.failed } } });
    return { ...result, status, warnings: result.warnings };
  });
}

export { DRAFT_STATUSES };
