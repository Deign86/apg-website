// API route: /api/admin/invite
// Server-side admin invite — uses SUPABASE_SERVICE_ROLE_KEY (never exposed to client)

import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import http from 'http';

const PORT = process.env.PORT || 3001;
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

async function verifyAdmin(req) {
  if (!supabase) return null;
  try {
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return null;
    const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
    if (error || !user) return null;
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
    return profile;
  } catch { return null; }
}

const server = http.createServer(async (req, res) => {
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});

  // POST /api/admin/invite — invite new admin user
  if (req.url === '/api/admin/invite' && req.method === 'POST') {
    if (!supabase) return sendJSON(res, 503, { message: 'Supabase not configured' });

    const profile = await verifyAdmin(req);
    if (!profile) return sendJSON(res, 401, { message: 'Unauthorized' });
    if (!['owner', 'admin'].includes(profile.role)) return sendJSON(res, 403, { message: 'Forbidden — admin role required' });

    let body;
    try { body = await new Promise((resolve) => { let b = ''; req.on('data', c => b += c); req.on('end', () => resolve(JSON.parse(b))); }); } catch { return sendJSON(res, 400, { message: 'Invalid JSON body' }); }

    const { email, role = 'editor', fullName } = body;
    if (!email) return sendJSON(res, 400, { message: 'Email is required' });

    try {
      const { error: inviteError } = await supabase.auth.admin.inviteUserByEmail(email, {
        data: { full_name: fullName || email },
      });
      if (inviteError) return sendJSON(res, 500, { message: inviteError.message });

      // Upsert profile with role
      const { data: { users } } = await supabase.auth.admin.listUsers();
      const found = users?.find(u => u.email === email);
      if (found) {
        await supabase.from('profiles').upsert({
          id: found.id,
          email,
          full_name: fullName || email,
          role,
          active: true,
        });
      }

      return sendJSON(res, 200, { success: true, message: `Invitation sent to ${email}` });
    } catch (err) {
      return sendJSON(res, 500, { message: err.message || 'Invite failed' });
    }
  }

  // POST /api/admin/users/:id/toggle — enable/disable user
  const toggleMatch = req.url.match(/^\/api\/admin\/users\/([^\/]+)\/toggle$/);
  if (toggleMatch && req.method === 'POST') {
    if (!supabase) return sendJSON(res, 503, { message: 'Supabase not configured' });

    const profile = await verifyAdmin(req);
    if (!profile) return sendJSON(res, 401, { message: 'Unauthorized' });
    if (!['owner', 'admin'].includes(profile.role)) return sendJSON(res, 403, { message: 'Forbidden' });

    const targetId = toggleMatch[1];
    if (targetId === profile.id) return sendJSON(res, 400, { message: 'Cannot change own status' });

    // Fetch current state
    const { data: target } = await supabase.from('profiles').select('active').eq('id', targetId).single();
    if (!target) return sendJSON(res, 404, { message: 'User not found' });

    const newActive = !target.active;
    const { error } = await supabase.from('profiles').update({ active: newActive }).eq('id', targetId);
    if (error) return sendJSON(res, 500, { message: error.message });

    return sendJSON(res, 200, { success: true, active: newActive });
  }

  sendJSON(res, 404, { message: 'Not found' });
});

server.listen(PORT, () => console.log(`Admin API server running on http://localhost:${PORT}`));
