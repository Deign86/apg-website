// api/admin/[...path].js — Vercel catch-all serverless function for /api/admin/*
import { createClient } from '@supabase/supabase-js';
import { readBody } from '../../server/http.js';

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

async function verifyAdmin(req, supabase) {
  try {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
    if (error || !user) return null;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return profile;
  } catch { return null; }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase = supabaseUrl && serviceKey
    ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
    : null;
  if (!supabase) return sendJSON(res, 503, { message: 'Supabase not configured' });

  const profile = await verifyAdmin(req, supabase);
  if (!profile) return sendJSON(res, 401, { message: 'Unauthorized' });
  if (profile.role !== 'admin') return sendJSON(res, 403, { message: 'Forbidden' });

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const body = ['POST', 'PUT'].includes(req.method) ? await readBody(req) : null;

  if (req.method === 'GET' && path === '/api/admin/stats') {
    const [listings, leads] = await Promise.all([
      supabase.from('offerings').select('*', { count: 'exact', head: true }).eq('is_published', true).is('deleted_at', null),
      supabase.from('inquiries').select('*'),
    ]);
    return sendJSON(res, 200, { listings: listings.count || 0, leads: (leads.data || []).length, newLeads: (leads.data || []).filter(l => l.status === 'new').length, won: (leads.data || []).filter(l => l.status === 'won').length });
  }

  const roleMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/role$/);
  if (req.method === 'PUT' && roleMatch) {
    if (roleMatch[1] === profile.id) return sendJSON(res, 400, { message: 'Cannot change own role' });
    const { error } = await supabase.from('profiles').update({ role: body.role }).eq('id', roleMatch[1]);
    return sendJSON(res, error ? 500 : 200, error ? { message: error.message } : { success: true });
  }

  const activeMatch = path.match(/^\/api\/admin\/users\/([^\/]+)\/active$/);
  if (req.method === 'PUT' && activeMatch) {
    if (activeMatch[1] === profile.id) return sendJSON(res, 400, { message: 'Cannot change own status' });
    const { error } = await supabase.from('profiles').update({ active: body.active }).eq('id', activeMatch[1]);
    return sendJSON(res, error ? 500 : 200, error ? { message: error.message } : { success: true });
  }

  if (req.method === 'POST' && path === '/api/admin/users/invite') {
    const { error: ie } = await supabase.auth.admin.inviteUserByEmail(body.email);
    if (ie) return sendJSON(res, 500, { message: ie.message });
    const { data: { users } } = await supabase.auth.admin.listUsers();
    const found = users?.find(u => u.email === body.email);
    if (found) {
      await supabase.from('profiles').upsert({ id: found.id, email: body.email, full_name: body.fullName || body.email, role: body.role || 'editor', active: true });
    }
    return sendJSON(res, 200, { success: true });
  }

  if (req.method === 'POST' && path === '/api/admin/seed-content') {
    const seedData = [
      { table: 'chatbot_kb', rows: [
        { trigger: 'ceo,president,founder,leadership,mark anthony,abito-santos,abito', answer: 'Our President and Chief Executive Officer is Mr. Mark Anthony Abito-Santos. He leads Alpha Premier Group of Companies and its real estate operations.', priority: 5, active: true },
        { trigger: 'hello,hi,greetings', answer: 'Greetings! How may I assist you with Alpha Premier?', priority: 1, active: true },
        { trigger: 'properties,listings,real estate', answer: 'We offer premium properties across the Philippines.', priority: 1, active: true },
        { trigger: 'contact,email,phone,address,located,facebook,fb', answer: 'You can reach Alpha Premier at 0915 888 9482 / 02 8 650 2540, or email contact@alphapremier.com. Our office is at Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City. Facebook: https://www.facebook.com/alphapremierRealty', priority: 5, active: true },
        { trigger: 'virtual office,address,workspace', answer: 'Alpha Premier Virtual Office at Ortigas provides premium addresses.', priority: 1, active: true },
        { trigger: 'careers,jobs,apply', answer: 'Check our Careers page for current openings!', priority: 1, active: true },
      ]},
      { table: 'site_settings', rows: [
        { key: 'company_phone', value: '0915 888 9482 / 02 8 650 2540' }, { key: 'company_email', value: 'contact@alphapremier.com' }, { key: 'company_address', value: 'Unit 3104, Philippine Stock Exchange Centre, Tektite East Tower, Exchange Road, Ortigas Center, Pasig City' },
        { key: 'social_facebook', value: 'https://www.facebook.com/alphapremierRealty' }, { key: 'social_instagram', value: '#' }, { key: 'social_linkedin', value: '#' },
      ]},
    ];
    const results = [];
    for (const { table, rows } of seedData) {
      const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (count === 0) {
        const { error } = await supabase.from(table).insert(rows);
        results.push({ table, seeded: !error, count: rows.length, error: error?.message || null });
      } else results.push({ table, skipped: true, count });
    }
    return sendJSON(res, 200, { success: true, results });
  }

  return sendJSON(res, 404, { message: 'Admin route not found' });
}
