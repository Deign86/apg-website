import { createServerSupabase } from './config.js';
import { readBody } from './http.js';
import { handleAiChat, handleAiInsights, handleAiLead, aiHealth } from './ai.js';
import { sendJSON, verifyAdmin } from './route-utils.js';

export async function health(req, res) {
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});
  if (req.method !== 'GET') return sendJSON(res, 405, { message: 'Method not allowed' });
  return sendJSON(res, 200, aiHealth(createServerSupabase()));
}

export async function chat(req, res) {
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});
  if (req.method !== 'POST') return sendJSON(res, 405, { message: 'Method not allowed' });
  const { status, data } = await handleAiChat(createServerSupabase(), await readBody(req));
  return sendJSON(res, status, data);
}

async function adminAi(req, res, handler) {
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});
  if (req.method !== 'POST') return sendJSON(res, 405, { message: 'Method not allowed' });
  const supabase = createServerSupabase();
  const profile = await verifyAdmin(req, supabase);
  if (!profile) return sendJSON(res, 401, { message: 'Unauthorized' });
  const { status, data } = await handler(supabase, await readBody(req));
  return sendJSON(res, status, data);
}

export const insights = (req, res) => adminAi(req, res, handleAiInsights);
export const lead = (req, res) => adminAi(req, res, handleAiLead);
