import { sendError, sendJSON } from './http.js';

export { sendError, sendJSON };

export async function verifyProfile(req, supabase, roles = []) {
  if (!supabase) return null;
  const auth = req.headers?.authorization || req.headers?.Authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.active === false || (roles.length && !roles.includes(profile.role))) return null;
  return profile;
}

export async function verifyAdmin(req, supabase, roles = ['owner', 'admin']) {
  return verifyProfile(req, supabase, roles);
}

export async function verifyStaff(req, supabase) {
  return verifyProfile(req, supabase, ['owner', 'admin', 'editor', 'staff']);
}

export async function verifyOwner(req, supabase) {
  return verifyAdmin(req, supabase, ['owner']);
}
