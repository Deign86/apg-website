// Shared server-only runtime configuration for local Node and Vercel functions.
import { createClient } from '@supabase/supabase-js';

const DEFAULT_MODEL = 'meta/llama-3.1-70b-instruct';
const DRIVE_READONLY_SCOPE = 'https://www.googleapis.com/auth/drive.readonly';

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
  const driveRootFolderId = value(env, 'GOOGLE_DRIVE_FOLDER_ID') || value(env, 'GOOGLE_DRIVE_LISTING_FOLDER_ID');
  const driveCredentialJson = value(env, 'GOOGLE_SERVICE_ACCOUNT_JSON');
  const driveCredentialFile = value(env, 'GOOGLE_APPLICATION_CREDENTIALS');
  const driveEmail = value(env, 'GOOGLE_SERVICE_ACCOUNT_EMAIL');
  const drivePrivateKey = value(env, 'GOOGLE_PRIVATE_KEY');
  const hasDriveCredentials = Boolean(driveCredentialJson || driveCredentialFile || (driveEmail && drivePrivateKey));
  return {
    supabaseUrl,
    serviceRoleKey,
    nvidiaApiKey: value(env, 'NVIDIA_API_KEY'),
    nvidiaModel: value(env, 'NVIDIA_MODEL') || DEFAULT_MODEL,
    resendApiKey: value(env, 'RESEND_API_KEY'),
    companyEmail: value(env, 'COMPANY_EMAIL') || 'alphapremierrealty@gmail.com',
    driveRootFolderId,
    driveCredentialJson,
    driveCredentialFile,
    driveServiceAccountEmail: driveEmail,
    drivePrivateKey,
    appUrl,
    validSupabaseUrl: validHttpUrl(supabaseUrl),
    supabaseConfigured: validHttpUrl(supabaseUrl) && Boolean(serviceRoleKey),
    driveConfigured: hasDriveCredentials && Boolean(driveRootFolderId),
    driveReadonlyScope: DRIVE_READONLY_SCOPE,
  };
}

export function requireServerConfig(names, env = process.env) {
  const config = readServerConfig(env);
  const missing = names.filter((name) => {
    if (name === 'SUPABASE_URL') return !config.validSupabaseUrl;
    if (name === 'SUPABASE_SERVICE_ROLE_KEY') return !config.serviceRoleKey;
    if (name === 'GOOGLE_DRIVE_FOLDER_ID') return !config.driveRootFolderId;
    if (name === 'GOOGLE_CREDENTIALS') return !config.driveConfigured;
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
    driveConfigured: config.driveConfigured,
    driveRootConfigured: !!config.driveRootFolderId,
  };
}

export { DEFAULT_MODEL };
