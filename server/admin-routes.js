import { createServerSupabase } from './config.js';
import { readBody } from './http.js';
import { sendJSON, verifyAdmin } from './route-utils.js';

async function guard(req, res) {
  const supabase = createServerSupabase();
  if (!supabase) { sendJSON(res, 503, { message: 'Supabase not configured' }); return null; }
  const profile = await verifyAdmin(req, supabase);
  if (!profile) { sendJSON(res, 401, { message: 'Unauthorized' }); return null; }
  return { supabase, profile };
}

export async function stats(req, res) {
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});
  if (req.method !== 'GET') return sendJSON(res, 405, { message: 'Method not allowed' });
  const context = await guard(req, res); if (!context) return;
  const { supabase } = context;
  const [listings, leads] = await Promise.all([
    supabase.from('offerings').select('*', { count: 'exact', head: true }).eq('is_published', true).is('deleted_at', null),
    supabase.from('inquiries').select('*'),
  ]);
  return sendJSON(res, 200, {
    listings: listings.count || 0,
    leads: (leads.data || []).length,
    newLeads: (leads.data || []).filter((l) => l.status === 'new').length,
    won: (leads.data || []).filter((l) => l.status === 'won').length,
  });
}

export async function updateRole(req, res) {
  if (req.method !== 'PUT') return sendJSON(res, 405, { message: 'Method not allowed' });
  const context = await guard(req, res); if (!context) return;
  const parsedUrl = new URL(req.url, 'http://localhost');
  const id = parsedUrl.searchParams.get('id') || parsedUrl.pathname.split('/').at(-2);
  if (id === context.profile.id) return sendJSON(res, 400, { message: 'Cannot change own role' });
  const body = await readBody(req);
  if (!['owner', 'admin', 'editor', 'staff', 'viewer'].includes(body?.role)) return sendJSON(res, 400, { message: 'Invalid role' });
  const { error } = await context.supabase.from('profiles').update({ role: body.role }).eq('id', id);
  return sendJSON(res, error ? 500 : 200, error ? { message: error.message } : { success: true });
}

export async function updateActive(req, res) {
  if (req.method !== 'PUT') return sendJSON(res, 405, { message: 'Method not allowed' });
  const context = await guard(req, res); if (!context) return;
  const parsedUrl = new URL(req.url, 'http://localhost');
  const id = parsedUrl.searchParams.get('id') || parsedUrl.pathname.split('/').at(-2);
  if (id === context.profile.id) return sendJSON(res, 400, { message: 'Cannot change own status' });
  const body = await readBody(req);
  if (typeof body?.active !== 'boolean') return sendJSON(res, 400, { message: 'active must be boolean' });
  const { error } = await context.supabase.from('profiles').update({ active: body.active }).eq('id', id);
  return sendJSON(res, error ? 500 : 200, error ? { message: error.message } : { success: true });
}

export async function invite(req, res) {
  if (req.method !== 'POST') return sendJSON(res, 405, { message: 'Method not allowed' });
  const context = await guard(req, res); if (!context) return;
  const body = await readBody(req);
  if (!body?.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return sendJSON(res, 400, { message: 'Valid email is required' });
  const { error } = await context.supabase.auth.admin.inviteUserByEmail(body.email, { data: { full_name: body.fullName || body.email } });
  if (error) return sendJSON(res, 500, { message: error.message });
  return sendJSON(res, 200, { success: true });
}

export async function seedContent(req, res) {
  if (req.method !== 'POST') return sendJSON(res, 405, { message: 'Method not allowed' });
  const context = await guard(req, res); if (!context) return;
  const seedData = [
    { table: 'chatbot_kb', rows: [
      { trigger: 'hello,hi,greetings', answer: 'Greetings! How may I assist you with Alpha Premier?', priority: 1, active: true },
      { trigger: 'properties,listings,real estate', answer: 'We offer premium properties across the Philippines.', priority: 1, active: true },
    ] },
    { table: 'site_settings', rows: [
      { key: 'company_phone', value: '0915 888 9482 / 02 8 650 2540' },
      { key: 'company_email', value: 'contact@alphapremier.com' },
    ] },
  ];
  const results = [];
  for (const { table, rows } of seedData) {
    const { count } = await context.supabase.from(table).select('*', { count: 'exact', head: true });
    if (count === 0) {
      const { error } = await context.supabase.from(table).insert(rows);
      results.push({ table, seeded: !error, error: error?.message || null });
    } else results.push({ table, skipped: true, count });
  }
  return sendJSON(res, 200, { success: true, results });
}
