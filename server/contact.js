import 'dotenv/config';
import dotenv from 'dotenv';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { handleContact } from './contact-handler.js';
import { createServerSupabase } from './config.js';
import { readBody, sendJSON, withJsonErrors } from './http.js';
import { health, chat, insights, lead } from './ai-routes.js';
import { stats, updateRole, updateActive, invite, seedContent } from './admin-routes.js';
import { createOffering, updateOffering, lifecycle, drivePreview, driveCommit, driveBatch, uploadIntent, completeUpload, orderAssets, removeAssetRelation } from './listing-routes.js';

dotenv.config({ path: '.env.local', override: true });

export async function handleLocalRequest(req, res) {
  const url = new URL(req.url || '/', 'http://localhost');
  if (req.method === 'OPTIONS') return sendJSON(res, 204, null);
  if (url.pathname === '/') {
    res.writeHead(302, { Location: 'http://localhost:3000/' });
    return res.end();
  }
  if (url.pathname === '/api/contact') {
    if (req.method !== 'POST') return sendJSON(res, 405, { error: { code: 'method_not_allowed', message: 'Method not allowed' } });
    return withJsonErrors(res, async () => {
      const result = await handleContact(await readBody(req));
      return sendJSON(res, result.status, result.data);
    });
  }
  const routes = {
    '/api/ai/health': health,
    '/api/ai/chat': chat,
    '/api/ai/insights': insights,
    '/api/ai/lead': lead,
    '/api/admin/stats': stats,
    '/api/admin/user-role': updateRole,
    '/api/admin/user-active': updateActive,
    '/api/admin/invite': invite,
    '/api/admin/seed-content': seedContent,
  };
  const route = routes[url.pathname];
  if (route) return route(req, res);
  if (url.pathname === '/api/admin/drive-import/preview') return drivePreview(req, res);
  if (url.pathname === '/api/admin/drive-import/commit') return driveCommit(req, res);
  const batch = url.pathname.match(/^\/api\/admin\/drive-import\/([^/]+)$/);
  if (batch) return driveBatch(req, res, { batchId: decodeURIComponent(batch[1]) });
  if (url.pathname === '/api/admin/offerings') return createOffering(req, res);
  const offering = url.pathname.match(/^\/api\/admin\/offerings\/(\d+)(?:\/(.*))?$/);
  if (offering) {
    const id = offering[1]; const action = offering[2] || '';
    if (!action) return updateOffering(req, res, { id });
    if (action === 'assets/upload-intent') return uploadIntent(req, res, { id });
    if (action === 'assets/complete') return completeUpload(req, res, { id });
    if (action === 'assets/order') return orderAssets(req, res, { id });
    const asset = action.match(/^assets\/([^/]+)$/);
    if (asset) return removeAssetRelation(req, res, { id, relationId: asset[1] });
    if (['submit-review', 'publish', 'unpublish', 'unavailable', 'archive', 'restore'].includes(action)) return lifecycle(req, res, { id }, action);
  }
  return sendJSON(res, 404, { error: { code: 'not_found', message: 'Not found' } });
}

export function startLocalServer(port = Number(process.env.PORT || 3001)) {
  const server = http.createServer((req, res) => handleLocalRequest(req, res));
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE' && port < 3010) {
      console.log(`[Backend API] Port ${port} in use, attempting port ${port + 1}...`);
      startLocalServer(port + 1);
    } else {
      console.error('[Backend API] Server error:', err);
    }
  });
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
    if (!createServerSupabase()) console.log('WARN: Supabase is not configured');
  });
  return server;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  startLocalServer();
}
