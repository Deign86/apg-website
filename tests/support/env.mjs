// Shared test configuration: ports, URLs and the local .env values the suites need.
// Secrets (DB password, QA admin password) are read here and never printed.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

/** KEY=value lines of a dotenv file (same rules as loadEnv() in api/config.php). */
function readDotenv(file) {
  const out = {};
  if (!fs.existsSync(file)) return out;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) continue;
    const i = trimmed.indexOf('=');
    out[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

// Process env wins over .env.local, which wins over .env (mirrors api/config.php).
const fileEnv = { ...readDotenv(path.join(ROOT, '.env')), ...readDotenv(path.join(ROOT, '.env.local')) };
export const env = (key, fallback = '') => process.env[key] ?? fileEnv[key] ?? fallback;

export const PORTS = {
  php: Number(env('APG_TEST_PHP_PORT', '8001')),        // APG_TEST_MODE=1: rate limits lifted
  phpStrict: Number(env('APG_TEST_PHP_STRICT_PORT', '8002')), // production limits, same test DB
  vite: Number(env('APG_TEST_VITE_PORT', '5180')),        // vite preview of the production build
  viteDev: Number(env('APG_TEST_VITE_DEV_PORT', '5181')), // vite dev server
  smtp: Number(env('APG_TEST_SMTP_PORT', '2526')),
};

export const TEST_DB = env('APG_TEST_DB', 'apg_test');
export const API = `http://127.0.0.1:${PORTS.php}`;
export const API_STRICT = `http://127.0.0.1:${PORTS.phpStrict}`;
// "localhost", not 127.0.0.1: Chrome stores the admin session's Secure cookie on http://localhost only.
export const WEB = `http://localhost:${PORTS.vite}`;
export const WEB_DEV = `http://localhost:${PORTS.viteDev}`;
/** Where the stack's SMTP sink writes .eml files; mail assertions are skipped when unset. */
export const MAIL_SINK_DIR = env('MAIL_SINK_DIR');

export const QA_ADMIN = { email: env('LOCAL_QA_ADMIN_EMAIL'), password: env('LOCAL_QA_ADMIN_PASSWORD') };

/** Seeded role accounts (tests/support/reset-db.php). Password is generated per run by the stack. */
export const ROLE_EMAILS = {
  admin: 'qa-admin@apg.test',
  editor: 'qa-editor@apg.test',
  recruiter: 'qa-recruiter@apg.test',
};
export const rolePassword = () => env('APG_TEST_ROLE_PASSWORD');
