// api/ai/[...path].js — Vercel catch-all serverless function for /api/ai/*
// Routes:
//   POST /api/ai/chat      — PUBLIC conversational chatbot (no auth)
//   POST /api/ai/insights  — ADMIN-only dashboard AI narrative
//   POST /api/ai/lead      — ADMIN-only single-lead analysis
// The NVIDIA API key is read from process.env (server-side) and never exposed to the client.
import { createClient } from '@supabase/supabase-js';
import { handleAiChat, handleAiInsights, handleAiLead, aiHealth } from '../../server/ai.js';

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
  } catch {
    return null;
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') return sendJSON(res, 200, {});

  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const supabase =
    supabaseUrl && serviceKey
      ? createClient(supabaseUrl, serviceKey, {
          auth: { autoRefreshToken: false, persistSession: false },
        })
      : null;

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;
  const body =
    req.method === 'POST' ? (typeof req.body === 'string' ? JSON.parse(req.body) : req.body) : null;

  // HEALTH — no auth, returns AI configuration status
  if (req.method === 'GET' && path === '/api/ai/health') {
    return sendJSON(res, 200, aiHealth(supabase));
  }

  // PUBLIC — conversational chatbot
  if (req.method === 'POST' && path === '/api/ai/chat') {
    const { status, data } = await handleAiChat(supabase, body);
    return sendJSON(res, status, data);
  }

  // ADMIN-ONLY — insights narrative + single-lead analysis
  if (req.method === 'POST' && (path === '/api/ai/insights' || path === '/api/ai/lead')) {
    const profile = await verifyAdmin(req, supabase);
    if (!profile) return sendJSON(res, 401, { message: 'Unauthorized' });
    if (profile.role !== 'admin') return sendJSON(res, 403, { message: 'Forbidden' });
    const { status, data } =
      path === '/api/ai/insights'
        ? await handleAiInsights(supabase, body)
        : await handleAiLead(supabase, body);
    return sendJSON(res, status, data);
  }

  return sendJSON(res, 404, { message: 'AI route not found' });
}
