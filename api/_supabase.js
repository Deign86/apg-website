// api/_supabase.js — Shared Supabase service-role client for Vercel serverless functions
import { createServerSupabase, serverConfigStatus } from '../server/config.js';

export const supabase = createServerSupabase();

export const resend = process.env.RESEND_API_KEY
  ? null // Resend is loaded per-function to avoid top-level init errors
  : null;

export function isConfigured() {
  if (!supabase) {
    console.error('Supabase not configured: required server configuration is missing');
    return false;
  }
  return true;
}

export { serverConfigStatus };
