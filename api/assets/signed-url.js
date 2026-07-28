// api/assets/signed-url.js — Vercel serverless function
// POST { asset_id, expires_in?, purpose? }
// Returns a signed URL for apg-private assets (staff only)
import { createServerSupabase } from '../../server/config.js';
import { readBody, sendJSON } from '../../server/http.js';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});
  if (req.method !== 'POST') return sendJSON(res, 405, { error: 'Method not allowed' });

  const body = (await readBody(req)) || {};
  const { asset_id, expires_in = 300, purpose } = body;
  if (!asset_id) return sendJSON(res, 400, { error: 'asset_id is required' });
  if (expires_in && (expires_in < 60 || expires_in > 3600)) {
    return sendJSON(res, 400, { error: 'expires_in must be between 60 and 3600 seconds' });
  }

  const admin = createServerSupabase();
  if (!admin) return sendJSON(res, 503, { error: 'Server misconfigured' });

  try {
    // Auth: verify bearer token
    const auth = req.headers['authorization'];
    if (!auth || !auth.startsWith('Bearer ')) return sendJSON(res, 401, { error: 'Unauthorized' });
    const { data: { user }, error: authErr } = await admin.auth.getUser(auth.slice(7));
    if (authErr || !user) return sendJSON(res, 401, { error: 'Unauthorized' });

    // Staff check
    const { data: profile, error: profErr } = await admin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    if (profErr || !profile || profile.active === false || !['owner', 'admin', 'editor', 'staff'].includes(profile.role)) {
      return sendJSON(res, 403, { error: 'Forbidden — staff only' });
    }

    // Lookup asset
    const { data: asset, error: assetErr } = await admin
      .from('assets')
      .select('id, asset_type, storage_path, storage_bucket, original_name, mime_type')
      .eq('id', asset_id)
      .single();
    if (assetErr || !asset) return sendJSON(res, 404, { error: 'Asset not found' });

    // Only apg-private requires signed URLs
    if (asset.storage_bucket !== 'apg-private') {
      // For public assets, just return the public URL (no signing needed)
      const { data: pub } = admin.storage.from(asset.storage_bucket || 'apg-public').getPublicUrl(asset.storage_path);
      return sendJSON(res, 200, { url: pub.publicUrl, expires_in: 0, asset: { id: asset.id, asset_type: asset.asset_type, original_name: asset.original_name, mime_type: asset.mime_type } });
    }

    const { data: signed, error: signErr } = await admin.storage
      .from(asset.storage_bucket)
      .createSignedUrl(asset.storage_path, expires_in);

    if (signErr) throw signErr;

    return sendJSON(res, 200, {
      url: signed.signedUrl,
      expires_in,
      asset: { id: asset.id, asset_type: asset.asset_type, original_name: asset.original_name, mime_type: asset.mime_type },
    });
  } catch (err) {
    console.error('signed-url error:', err);
    return sendJSON(res, 500, { error: err.message || 'Internal error' });
  }
}
