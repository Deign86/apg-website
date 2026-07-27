export function sendJSON(res, status, data) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
}

export async function verifyAdmin(req, supabase, roles = ['owner', 'admin']) {
  if (!supabase) return null;
  const auth = req.headers?.authorization;
  if (!auth?.startsWith('Bearer ')) return null;
  const { data: { user }, error } = await supabase.auth.getUser(auth.slice(7));
  if (error || !user) return null;
  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single();
  if (!profile || profile.active === false || !roles.includes(profile.role)) return null;
  return profile;
}
