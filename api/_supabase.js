// api/_supabase.js — Shared Supabase service-role client for Vercel serverless functions
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabase = supabaseUrl && serviceKey
  ? createClient(supabaseUrl, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })
  : null;

export const resend = process.env.RESEND_API_KEY
  ? null // Resend is loaded per-function to avoid top-level init errors
  : null;

export function isConfigured() {
  if (!supabase) {
    console.error('Supabase not configured — missing VITE_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    return false;
  }
  return true;
}
