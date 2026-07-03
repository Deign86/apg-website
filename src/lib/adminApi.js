// Admin API wrappers — server-only operations via /api/admin/*
// These HIT the server backend (contact.js extended), NOT the client Supabase client.

const API_BASE = '/api/admin';

async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

export async function updateUserRole(userId, role) {
  return api(`/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) });
}

export async function setUserActive(userId, active) {
  return api(`/users/${userId}/active`, { method: 'PUT', body: JSON.stringify({ active }) });
}

export async function inviteUser(email, role, fullName) {
  return api('/users/invite', { method: 'POST', body: JSON.stringify({ email, role, fullName }) });
}

export async function getStats() {
  return api('/stats');
}

export async function seedFallbackContent() {
  return api('/seed-content', { method: 'POST' });
}
