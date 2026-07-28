import crypto from 'node:crypto';
import { createServerSupabase } from './config.js';
import { readBody, sendError, sendJSON, withJsonErrors } from './http.js';
import { verifyAdmin, verifyProfile, verifyStaff } from './route-utils.js';
import { commitDriveImport, previewDriveImport, ImportError } from './drive/import-service.js';

const IMAGE_MIMES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const FILE_MIMES = new Set([...IMAGE_MIMES, 'application/pdf']);
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_FILE_BYTES = 25 * 1024 * 1024;
const EDITABLE_FIELDS = new Set(['title', 'slug', 'status', 'property_type', 'transaction_type_id', 'price', 'price_unit', 'location', 'address', 'floor_area', 'lot_area', 'bedrooms', 'bathrooms', 'parking_slots', 'beds', 'baths', 'garage', 'description', 'email', 'phone', 'featured']);

function context(req, roles) {
  const supabase = createServerSupabase();
  return { supabase, profilePromise: supabase ? verifyProfile(req, supabase, roles) : Promise.resolve(null) };
}

async function guard(req, res, roles) {
  const { supabase, profilePromise } = context(req, roles);
  if (!supabase) { sendError(res, 503, 'Supabase is not configured', 'config_missing'); return null; }
  const profile = await profilePromise;
  if (!profile) { sendError(res, 401, 'Authentication required', 'unauthorized'); return null; }
  return { supabase, profile };
}

function idOf(value) {
  const id = String(value || '').trim();
  if (!/^\d+$/.test(id)) throw new ImportError('Offering id must be numeric', 400, 'invalid_offering_id');
  return id;
}

function cleanPatch(body) {
  const patch = {};
  for (const [key, value] of Object.entries(body || {})) if (EDITABLE_FIELDS.has(key)) patch[key] = value === '' ? null : value;
  if (patch.price != null && (!Number.isFinite(Number(patch.price)) || Number(patch.price) < 0)) throw new ImportError('Price must be a non-negative number', 400, 'invalid_price');
  for (const field of ['bedrooms', 'bathrooms', 'parking_slots', 'beds', 'baths', 'garage']) {
    if (patch[field] != null && (!Number.isInteger(Number(patch[field])) || Number(patch[field]) < 0)) throw new ImportError(`${field} must be a non-negative integer`, 400, `invalid_${field}`);
    if (patch[field] != null) patch[field] = Number(patch[field]);
  }
  if (patch.price != null) patch.price = Number(patch.price);
  if (patch.address && !patch.location) patch.location = patch.address;
  return patch;
}

async function offering(supabase, id) {
  const result = await supabase.from('offerings').select('*').eq('id', id).single();
  if (result.error) throw new ImportError('Offering not found', 404, 'offering_not_found');
  return result.data;
}

async function activity(supabase, profile, action, entityId, meta = {}) {
  const result = await supabase.from('activity_log').insert({ user_id: profile?.id || null, action, entity: 'offering', entity_id: String(entityId || ''), meta });
  if (result.error) console.error('Activity log failed:', result.error.message);
}

function requiredForReview(row) {
  return ['title', 'property_type', 'transaction_type_id', 'location'].filter((field) => !String(row?.[field] || '').trim());
}

function requiredForPublish(row, gallery) {
  const missing = requiredForReview(row);
  if (!String(row?.description || '').trim()) missing.push('description');
  if (!(gallery || []).some((relation) => relation.asset?.asset_type === 'image' && relation.asset.ingestion_status === 'active')) missing.push('image');
  if (!(gallery || []).some((relation) => relation.is_cover && relation.asset?.asset_type === 'image')) missing.push('cover_image');
  return missing;
}

async function relations(supabase, id) {
  const result = await supabase.from('property_asset_relations').select('*, asset:assets(*)').eq('offering_id', id).order('display_order', { ascending: true });
  if (result.error) throw result.error;
  return result.data || [];
}

async function promoteAssets(supabase, id) {
  const rows = await relations(supabase, id);
  const promoted = [];
  try {
    for (const relation of rows) {
      const asset = relation.asset;
      if (!asset || asset.storage_bucket === 'apg-public') continue;
      const downloaded = await supabase.storage.from(asset.storage_bucket).download(asset.storage_path);
      if (downloaded.error) throw downloaded.error;
      const uploaded = await supabase.storage.from('apg-public').upload(asset.storage_path, downloaded.data, { contentType: asset.mime_type, upsert: true, cacheControl: '31536000' });
      if (uploaded.error) throw uploaded.error;
      const updated = await supabase.from('assets').update({ storage_bucket: 'apg-public', is_public: true }).eq('id', asset.id);
      if (updated.error) throw updated.error;
      promoted.push(asset);
    }
  } catch (error) {
    for (const asset of promoted.reverse()) {
      const publicCopy = await supabase.storage.from('apg-public').download(asset.storage_path);
      if (!publicCopy.error) await supabase.storage.from(asset.storage_bucket).upload(asset.storage_path, publicCopy.data, { contentType: asset.mime_type, upsert: true, cacheControl: '31536000' });
      await supabase.storage.from('apg-public').remove([asset.storage_path]);
      await supabase.from('assets').update({ storage_bucket: asset.storage_bucket, is_public: false }).eq('id', asset.id);
    }
    throw error;
  }
}

async function demoteAssets(supabase, id) {
  const rows = await relations(supabase, id);
  for (const relation of rows) {
    const asset = relation.asset;
    if (!asset || asset.storage_bucket !== 'apg-public') continue;
    const downloaded = await supabase.storage.from('apg-public').download(asset.storage_path);
    if (downloaded.error) throw downloaded.error;
    const copied = await supabase.storage.from('apg-private').upload(asset.storage_path, downloaded.data, { contentType: asset.mime_type, upsert: true, cacheControl: '31536000' });
    if (copied.error) throw copied.error;
    const removed = await supabase.storage.from('apg-public').remove([asset.storage_path]);
    if (removed.error) throw removed.error;
    const updated = await supabase.from('assets').update({ storage_bucket: 'apg-private', is_public: false }).eq('id', asset.id);
    if (updated.error) throw updated.error;
  }
}

export async function drivePreview(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin']); if (!auth) return;
    const body = await readBody(req);
    if (!body?.driveFolderUrlOrId) return sendError(res, 400, 'driveFolderUrlOrId is required', 'invalid_input');
    const { createDriveClient } = await import('./drive/client.js');
    const { drive, config } = createDriveClient();
    const result = await previewDriveImport({ drive, supabase: auth.supabase, rootFolderId: config.driveRootFolderId, driveFolderUrlOrId: body.driveFolderUrlOrId });
    return sendJSON(res, 200, result);
  });
}

export async function driveCommit(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin']); if (!auth) return;
    const body = await readBody(req);
    if (!body?.driveFolderId) return sendError(res, 400, 'driveFolderId is required', 'invalid_input');
    const { createDriveClient } = await import('./drive/client.js');
    const { drive, config } = createDriveClient();
    const result = await commitDriveImport({ drive, supabase: auth.supabase, rootFolderId: config.driveRootFolderId, ...body, actorId: auth.profile.id });
    return sendJSON(res, 200, result);
  });
}

export async function driveBatch(req, res, params) {
  if (req.method !== 'GET') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    const result = await auth.supabase.from('import_batches').select('*, import_file_mappings(*)').eq('id', params.batchId).single();
    if (result.error) return sendError(res, 404, 'Import batch not found', 'batch_not_found');
    return sendJSON(res, 200, result.data);
  });
}

export async function createOffering(req, res) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    const body = await readBody(req);
    const patch = cleanPatch(body);
    if (!String(patch.title || '').trim()) return sendError(res, 400, 'Title is required', 'invalid_title');
    const values = { ...patch, listing_status: 'draft', is_published: false, slug: patch.slug || `listing-${crypto.randomUUID()}` };
    delete values.address;
    const result = await auth.supabase.from('offerings').insert(values).select('*').single();
    if (result.error) throw result.error;
    await activity(auth.supabase, auth.profile, 'offering.create', result.data.id, { listing_status: 'draft' });
    return sendJSON(res, 201, result.data);
  });
}

export async function updateOffering(req, res, params) {
  if (!['PATCH', 'PUT'].includes(req.method)) return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    const id = idOf(params.id);
    const current = await offering(auth.supabase, id);
    if (!['owner', 'admin'].includes(auth.profile.role) && !['draft', 'for_review'].includes(current.listing_status)) return sendError(res, 403, 'Only draft or review listings may be edited by staff', 'forbidden');
    const patch = cleanPatch(await readBody(req));
    delete patch.address; delete patch.listing_status; delete patch.is_published; delete patch.deleted_at; delete patch.archived_at;
    const result = await auth.supabase.from('offerings').update(patch).eq('id', id).select('*').single();
    if (result.error) throw result.error;
    await activity(auth.supabase, auth.profile, 'offering.update', id, { fields: Object.keys(patch) });
    return sendJSON(res, 200, result.data);
  });
}

export async function lifecycle(req, res, params, action) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    if (action !== 'submit-review' && !['owner', 'admin'].includes(auth.profile.role)) {
      return sendError(res, 403, 'Only admins and owners may change publication state', 'forbidden');
    }
    const id = idOf(params.id);
    const current = await offering(auth.supabase, id);
    const gallery = await relations(auth.supabase, id);
    if (action === 'submit-review') {
      const missing = requiredForReview(current);
      if (missing.length) return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`, 'validation_failed');
      const result = await auth.supabase.from('offerings').update({ listing_status: 'for_review', is_published: false }).eq('id', id).select('*').single();
      if (result.error) throw result.error;
      await activity(auth.supabase, auth.profile, 'offering.submit_review', id);
      return sendJSON(res, 200, result.data);
    }
    if (action === 'publish') {
      const missing = requiredForPublish(current, gallery);
      if (missing.length) return sendError(res, 400, `Missing required fields: ${missing.join(', ')}`, 'validation_failed');
      await promoteAssets(auth.supabase, id);
      const result = await auth.supabase.from('offerings').update({ listing_status: 'published', is_published: true, published_at: new Date().toISOString(), archived_at: null, deleted_at: null }).eq('id', id).select('*').single();
      if (result.error) throw result.error;
      await activity(auth.supabase, auth.profile, 'offering.publish', id);
      return sendJSON(res, 200, result.data);
    }
    const next = {
      unpublish: { listing_status: 'draft', is_published: false },
      unavailable: { listing_status: 'unavailable', is_published: false },
      archive: { listing_status: 'archived', is_published: false, archived_at: new Date().toISOString(), deleted_at: new Date().toISOString() },
      restore: { listing_status: 'draft', is_published: false, archived_at: null, deleted_at: null },
    }[action];
    if (!next) return sendError(res, 404, 'Unknown lifecycle action', 'not_found');
    if (['unpublish', 'unavailable', 'archive'].includes(action)) await demoteAssets(auth.supabase, id);
    const result = await auth.supabase.from('offerings').update(next).eq('id', id).select('*').single();
    if (result.error) throw result.error;
    await activity(auth.supabase, auth.profile, `offering.${action}`, id);
    return sendJSON(res, 200, result.data);
  });
}

function validateFileRequest(body) {
  const name = String(body?.fileName || '').trim();
  const mime = String(body?.mimeType || '').toLowerCase();
  const size = Number(body?.sizeBytes);
  if (!name || !FILE_MIMES.has(mime) || !Number.isInteger(size) || size <= 0) throw new ImportError('Valid fileName, mimeType, and sizeBytes are required', 400, 'invalid_file');
  if (size > (mime === 'application/pdf' ? MAX_FILE_BYTES : MAX_IMAGE_BYTES)) throw new ImportError('File exceeds the allowed size limit', 413, 'file_too_large');
  return { name, mime, size };
}

export async function uploadIntent(req, res, params) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    const id = idOf(params.id); const row = await offering(auth.supabase, id);
    if (!['owner', 'admin'].includes(auth.profile.role) && !['draft', 'for_review'].includes(row.listing_status)) return sendError(res, 403, 'Assets may only be added to drafts or review listings', 'forbidden');
    const file = validateFileRequest(await readBody(req));
    const assetId = crypto.randomUUID();
    const ext = file.name.includes('.') ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase() : '';
    const path = `properties/${id}/uploads/${assetId}${ext}`;
    const signed = await auth.supabase.storage.from('apg-private').createSignedUploadUrl(path);
    if (signed.error) throw signed.error;
    return sendJSON(res, 200, { assetId, bucket: 'apg-private', path, token: signed.data?.token || null, signedUrl: signed.data?.signedUrl || null, resumable: file.size > 6 * 1024 * 1024, maxBytes: file.mime === 'application/pdf' ? MAX_FILE_BYTES : MAX_IMAGE_BYTES });
  });
}

function validSignature(buffer, mime) {
  if (mime === 'application/pdf') return buffer.subarray(0, 5).toString() === '%PDF-';
  if (mime === 'image/jpeg') return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  if (mime === 'image/png') return buffer.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (mime === 'image/webp') return buffer.subarray(0, 4).toString() === 'RIFF' && buffer.subarray(8, 12).toString() === 'WEBP';
  return false;
}

export async function completeUpload(req, res, params) {
  if (req.method !== 'POST') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    const id = idOf(params.id); const row = await offering(auth.supabase, id); const body = await readBody(req); const file = validateFileRequest(body);
    if (!String(body?.path || '').startsWith(`properties/${id}/uploads/`)) return sendError(res, 400, 'Invalid upload path', 'invalid_upload_path');
    const downloaded = await auth.supabase.storage.from('apg-private').download(body.path);
    if (downloaded.error) throw new ImportError('Uploaded object could not be read', 400, 'upload_not_found');
    const buffer = Buffer.from(await downloaded.data.arrayBuffer());
    if (buffer.length !== file.size || !validSignature(buffer, file.mime)) throw new ImportError('Uploaded bytes do not match the declared file', 400, 'upload_validation_failed');
    const publishImmediately = row.listing_status === 'published' && ['owner', 'admin'].includes(auth.profile.role);
    if (publishImmediately) {
      const copied = await auth.supabase.storage.from('apg-public').upload(body.path, downloaded.data, { contentType: file.mime, upsert: true, cacheControl: '31536000' });
      if (copied.error) throw copied.error;
      await auth.supabase.storage.from('apg-private').remove([body.path]);
    }
    const asset = await auth.supabase.from('assets').insert({ id: body.assetId || crypto.randomUUID(), asset_type: file.mime === 'application/pdf' ? (/floor|plan|fp-/i.test(file.name) ? 'floor_plan' : 'brochure') : 'image', mime_type: file.mime, size_bytes: buffer.length, original_name: file.name, storage_path: body.path, storage_bucket: publishImmediately ? 'apg-public' : 'apg-private', is_public: publishImmediately, source_type: 'direct_upload', ingestion_status: 'active', checksum_sha256: crypto.createHash('sha256').update(buffer).digest('hex'), created_by: auth.profile.id }).select('*').single();
    if (asset.error) throw asset.error;
    const orderResult = await auth.supabase.from('property_asset_relations').select('display_order').eq('offering_id', id).order('display_order', { ascending: false }).limit(1).maybeSingle();
    const relation = await auth.supabase.from('property_asset_relations').insert({ offering_id: id, asset_id: asset.data.id, gallery_role: file.mime === 'application/pdf' ? (/floor|plan|fp-/i.test(file.name) ? 'floor_plan' : 'brochure') : 'gallery', display_order: Number(orderResult.data?.display_order || -1) + 1, is_cover: false });
    if (relation.error) throw relation.error;
    await activity(auth.supabase, auth.profile, 'asset.upload', id, { asset_id: asset.data.id, source_type: 'direct_upload' });
    return sendJSON(res, 201, asset.data);
  });
}

export async function orderAssets(req, res, params) {
  if (req.method !== 'PATCH') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    const id = idOf(params.id); const row = await offering(auth.supabase, id);
    if (!['owner', 'admin'].includes(auth.profile.role) && !['draft', 'for_review'].includes(row.listing_status)) return sendError(res, 403, 'Only draft or review listings may change gallery order', 'forbidden');
    const body = await readBody(req); const items = Array.isArray(body?.items) ? body.items : [];
    await auth.supabase.from('property_asset_relations').update({ is_cover: false }).eq('offering_id', id);
    for (const [index, item] of items.entries()) {
      const update = await auth.supabase.from('property_asset_relations').update({ display_order: index, is_cover: Boolean(item.isCover), gallery_role: item.isCover ? 'hero' : 'gallery' }).eq('offering_id', id).eq('asset_id', item.assetId);
      if (update.error) throw update.error;
    }
    await activity(auth.supabase, auth.profile, 'gallery.reorder', id, { count: items.length });
    return sendJSON(res, 200, { success: true });
  });
}

export async function removeAssetRelation(req, res, params) {
  if (req.method !== 'DELETE') return sendError(res, 405, 'Method not allowed', 'method_not_allowed');
  return withJsonErrors(res, async () => {
    const auth = await guard(req, res, ['owner', 'admin', 'editor', 'staff']); if (!auth) return;
    const id = idOf(params.id); const row = await offering(auth.supabase, id);
    if (!['owner', 'admin'].includes(auth.profile.role) && !['draft', 'for_review'].includes(row.listing_status)) return sendError(res, 403, 'Only draft or review listings may change gallery relations', 'forbidden');
    const result = await auth.supabase.from('property_asset_relations').delete().eq('offering_id', id).eq('id', params.relationId);
    if (result.error) throw result.error;
    await activity(auth.supabase, auth.profile, 'gallery.unlink', id, { relation_id: params.relationId });
    return sendJSON(res, 200, { success: true });
  });
}
