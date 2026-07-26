import fs from 'node:fs';
import path from 'node:path';
import dotenv from 'dotenv';
import { readServerConfig } from '../server/config.js';

dotenv.config({ path: '.env.local' });

const required = ['VITE_SUPABASE_URL', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'];
const config = readServerConfig();
const missing = required.filter((name) => !String(process.env[name] || '').trim());
const sourceRoots = ['src', 'dist'];
const forbidden = /SUPABASE_SERVICE_ROLE_KEY|NVIDIA_API_KEY|service_role|nvapi-/i;
const leaks = [];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (/\.(js|jsx|mjs|cjs|html|css)$/.test(entry.name)) {
      const text = fs.readFileSync(file, 'utf8');
      if (forbidden.test(text)) leaks.push(file);
    }
  }
}
for (const root of sourceRoots) walk(root);

console.log(JSON.stringify({
  supabaseHost: config.supabaseUrl ? new URL(config.supabaseUrl).host : null,
  requiredPresent: missing.length === 0,
  serverSupabaseConfigured: config.supabaseConfigured,
  missing,
  secretLeakFiles: leaks,
}, null, 2));

if (missing.length || leaks.length) process.exitCode = 1;
