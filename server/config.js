// Shared server-only runtime configuration for local Node and Vercel functions.
import { createClient } from '@supabase/supabase-js';

const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct';

export function readServerConfig(env = process.env) {
  const supabaseUrl = String(env.VITE_SUPABASE_URL || '').trim();
  const serviceRoleKey = String(env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
  const validUrl = /^https:\/\/[^\s/]+\.supabase\.co(?:\/.*)?$/i.test(supabaseUrl);
  return {
    supabaseUrl,
    serviceRoleKey,
    nvidiaApiKey: String(env.NVIDIA_API_KEY || '').trim(),
    nvidiaModel: String(env.NVIDIA_MODEL || '').trim() || DEFAULT_MODEL,
    resendApiKey: String(env.RESEND_API_KEY || '').trim(),
    companyEmail: String(env.COMPANY_EMAIL || '').trim() || 'alphapremierrealty@gmail.com',
    validSupabaseUrl: validUrl,
    supabaseConfigured: validUrl && !!serviceRoleKey,
  };
}

export function createServerSupabase(env = process.env) {
  const config = readServerConfig(env);
  if (!config.supabaseConfigured) return null;
  return createClient(config.supabaseUrl, config.serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

export function serverConfigStatus(env = process.env) {
  const config = readServerConfig(env);
  let supabaseHost = null;
  try { supabaseHost = config.supabaseUrl ? new URL(config.supabaseUrl).host : null; } catch {}
  return {
    supabaseHost,
    supabaseUrlConfigured: !!config.supabaseUrl,
    supabaseServiceRoleConfigured: !!config.serviceRoleKey,
    supabaseConfigured: config.supabaseConfigured,
    nvidiaConfigured: !!config.nvidiaApiKey,
    model: config.nvidiaModel,
    resendConfigured: !!config.resendApiKey,
    companyEmailConfigured: !!env.COMPANY_EMAIL,
  };
}

export { DEFAULT_MODEL };
