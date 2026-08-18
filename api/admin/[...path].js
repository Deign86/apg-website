import { sendError } from '../../server/http.js';
import { stats, updateRole, updateActive, invite, seedContent } from '../../server/admin-routes.js';
import { createOffering, updateOffering, lifecycle, uploadIntent, completeUpload, orderAssets, removeAssetRelation } from '../../server/listing-routes.js';

const routes = {
  '/api/admin/stats': stats,
  '/api/admin/user-role': updateRole,
  '/api/admin/user-active': updateActive,
  '/api/admin/invite': invite,
  '/api/admin/seed-content': seedContent,
};

export default async function handler(req, res) {
  const path = new URL(req.url || '/', 'http://localhost').pathname;
  const route = routes[path];
  if (route) return route(req, res);
  if (path === '/api/admin/offerings') return createOffering(req, res);
  const offering = path.match(/^\/api\/admin\/offerings\/(\d+)(?:\/(.*))?$/);
  if (offering) {
    const id = offering[1];
    const action = offering[2] || '';
    if (!action) return updateOffering(req, res, { id });
    if (action === 'assets/upload-intent') return uploadIntent(req, res, { id });
    if (action === 'assets/complete') return completeUpload(req, res, { id });
    if (action === 'assets/order') return orderAssets(req, res, { id });
    const asset = action.match(/^assets\/([^/]+)$/);
    if (asset) return removeAssetRelation(req, res, { id, relationId: asset[1] });
    if (['submit-review', 'publish', 'unpublish', 'unavailable', 'archive', 'restore'].includes(action)) return lifecycle(req, res, { id }, action);
  }
  return sendError(res, 404, 'Admin route not found', 'not_found');
}
