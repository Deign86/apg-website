import { sendError } from '../../server/http.js';
import { health, chat, insights, lead } from '../../server/ai-routes.js';

const routes = {
  '/api/ai/health': health,
  '/api/ai/chat': chat,
  '/api/ai/insights': insights,
  '/api/ai/lead': lead,
};

export default async function handler(req, res) {
  const path = new URL(req.url || '/', 'http://localhost').pathname;
  const route = routes[path];
  if (!route) return sendError(res, 404, 'AI route not found', 'not_found');
  return route(req, res);
}
