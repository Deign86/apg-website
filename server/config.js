// Shared server-only runtime configuration for local Node and Vercel functions.
import { createClient } from '@supabase/supabase-js';

const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct';

function value(env, name) {
  return String(env?.[name] || '').trim();
}

function validHttpUrl(raw) {
  try {
    const url = new URL(raw);
    return url.protocol === 'https:' && Boolean(url.hostname);
  } catch {
    return false;
  }
}

export function readServerConfig(env = process.env) {
  const supabaseUrl = value(env, 'SUPABASE_URL') || value(env, 'VITE_SUPABASE_URL');
  const serviceRoleKey = value(env, 'SUPABASE_SERVICE_ROLE_KEY');
  const appUrl = value(env, 'VITE_APP_URL') || (value(env, 'VERCEL_URL') ? `https://${value(env, 'VERCEL_URL')}` : '');
  return {
    supabaseUrl,
    serviceRoleKey,
    nvidiaApiKey: value(env, 'NVIDIA_API_KEY'),
    nvidiaModel: value(env, 'NVIDIA_MODEL') || DEFAULT_MODEL,
    resendApiKey: value(env, 'RESEND_API_KEY'),
    companyEmail: value(env, 'COMPANY_EMAIL') || 'thealphapremiergroup@gmail.com',
    appUrl,
    validSupabaseUrl: validHttpUrl(supabaseUrl),
    supabaseConfigured: validHttpUrl(supabaseUrl) && Boolean(serviceRoleKey),
  };
}

export function requireServerConfig(names, env = process.env) {
  const config = readServerConfig(env);
  const missing = names.filter((name) => {
    if (name === 'SUPABASE_URL') return !config.validSupabaseUrl;
    if (name === 'SUPABASE_SERVICE_ROLE_KEY') return !config.serviceRoleKey;
    return !value(env, name);
  });
  if (missing.length) {
    const error = new Error(`Missing server configuration: ${missing.join(', ')}`);
    error.code = 'CONFIG_MISSING';
    error.missing = missing;
    throw error;
  }
  return config;
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
