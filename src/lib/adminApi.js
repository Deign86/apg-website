// Admin API wrappers — server-only operations via /api/admin/*
// These HIT the server backend (contact.js extended), NOT the client Supabase client.
// The current user's Supabase auth token is automatically attached.

import { supabase } from './supabase';

const API_BASE = '/api/admin';

async function api(path, options = {}) {
  // Automatically attach the current user's Supabase access token
  const { data: { session } } = await supabase.auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error?.message || data.message || 'Request failed');
  return data;
}

export { api };

export async function updateUserRole(userId, role) {
  return api(`/user-role?id=${encodeURIComponent(userId)}`, { method: 'PUT', body: JSON.stringify({ role }) });
}

export async function setUserActive(userId, active) {
  return api(`/user-active?id=${encodeURIComponent(userId)}`, { method: 'PUT', body: JSON.stringify({ active }) });
}

export async function inviteUser(email, role, fullName) {
  return api('/invite', { method: 'POST', body: JSON.stringify({ email, role, fullName }) });
}

export async function getStats() {
  return api('/stats');
}

export async function seedFallbackContent() {
  return api('/seed-content', { method: 'POST' });
}

export async function createOffering(values) {
  return api('/offerings', { method: 'POST', body: JSON.stringify(values) });
}

export async function updateOffering(id, values) {
  return api(`/offerings/${encodeURIComponent(id)}`, { method: 'PATCH', body: JSON.stringify(values) });
}

export async function lifecycleOffering(id, action) {
  return api(`/offerings/${encodeURIComponent(id)}/${action}`, { method: 'POST' });
}

export async function previewDriveImport(driveFolderUrlOrId) {
  return api('/drive-import/preview', { method: 'POST', body: JSON.stringify({ driveFolderUrlOrId }) });
}

export async function commitDriveImport(payload) {
  return api('/drive-import/commit', { method: 'POST', body: JSON.stringify(payload) });
}

export async function getDriveImportBatch(batchId) {
  return api(`/drive-import/${encodeURIComponent(batchId)}`);
}

export async function createAssetUploadIntent(offeringId, file) {
  return api(`/offerings/${encodeURIComponent(offeringId)}/assets/upload-intent`, { method: 'POST', body: JSON.stringify({ fileName: file.name, mimeType: file.type, sizeBytes: file.size }) });
}

export async function completeAssetUpload(offeringId, values) {
  return api(`/offerings/${encodeURIComponent(offeringId)}/assets/complete`, { method: 'POST', body: JSON.stringify(values) });
}

export async function orderOfferingAssets(offeringId, items) {
  return api(`/offerings/${encodeURIComponent(offeringId)}/assets/order`, { method: 'PATCH', body: JSON.stringify({ items }) });
}

export async function removeOfferingAssetRelation(offeringId, relationId) {
  return api(`/offerings/${encodeURIComponent(offeringId)}/assets/${encodeURIComponent(relationId)}`, { method: 'DELETE' });
}
