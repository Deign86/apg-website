import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabaseReady = !!(supabaseUrl && supabaseKey);

if (!supabaseReady) {
  console.error(
    'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local.\n' +
    '  Public pages will use fallback content; admin features will not work.'
  );
}

// Use fallback URL/key so createClient never receives undefined (which would throw).
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseKey || 'placeholder'
);

/** Quick connectivity check — returns { ok, error }. */
export async function checkConnection() {
  if (!supabaseReady) return { ok: false, error: 'Supabase not configured (missing env vars)' };
  try {
    const { error } = await supabase.from('offerings').select('id').limit(1);
    return { ok: !error, error: error?.message || null };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

