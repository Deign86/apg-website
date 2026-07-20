// api/assets/public-meta.js — Vercel serverless function
// GET /api/assets/public/:id
// Returns { public_url, mime_type, size_bytes, original_name } for apg-public assets
import { createClient } from '@supabase/supabase-js';

function sendJSON(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});
  if (req.method !== 'GET') return sendJSON(res, 405, { error: 'Method not allowed' });

  const parsedUrl = new URL(req.url, 'http://localhost');
  let assetId = parsedUrl.searchParams.get('id');
  if (!assetId) {
    const urlParts = parsedUrl.pathname.split('/');
    assetId = urlParts[urlParts.length - 1];
  }
  if (!assetId) return sendJSON(res, 400, { error: 'asset_id required (use ?id=<uuid> or path segment)' });

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) return sendJSON(res, 503, { error: 'Server misconfigured' });

  const admin = createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });

  try {
    const { data: asset, error: assetErr } = await admin
      .from('assets')
      .select('id, storage_path, storage_bucket, mime_type, size_bytes, original_name, is_public')
      .eq('id', assetId)
      .single();

    if (assetErr || !asset) return sendJSON(res, 404, { error: 'Asset not found' });
    if (!asset.is_public) return sendJSON(res, 403, { error: 'Asset is not public' });

    const { data: pub } = admin.storage.from(asset.storage_bucket || 'apg-public').getPublicUrl(asset.storage_path);

    return sendJSON(res, 200, {
      public_url: pub.publicUrl,
      mime_type: asset.mime_type,
      size_bytes: asset.size_bytes,
      original_name: asset.original_name,
    });
  } catch (err) {
    console.error('public-meta error:', err);
    return sendJSON(res, 500, { error: err.message || 'Internal error' });
  }
}
