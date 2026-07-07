// scripts/check-asset-guardrails.cjs
// CI guardrails for the shared Supabase asset architecture (apg-website x apg-posting-desk).
//   1. No client source references the SUPABASE_SERVICE_ROLE_KEY (it is server-only).
//   2. The built bundle (dist/) must not contain a service-role JWT literal.
//   3. .env.example must mark the service role key as server-only.
//   (Storage-path lint is handled in SQL via v_assets_noncanonical_path — migration 016.)
// Run: node scripts/check-asset-guardrails.cjs
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const SRC = path.join(ROOT, 'src');
const SERVICE_KEY_RE = /SUPABASE_SERVICE_ROLE_KEY/i;
const SERVICE_ROLE_LITERAL_RE = /service_role/; // role claim in a leaked JWT
let fail = 0;

function checkClientFile(p) {
  const txt = fs.readFileSync(p, 'utf8');
  if (SERVICE_KEY_RE.test(txt)) {
    console.error(`\u2717 ${path.relative(ROOT, p)}: references SUPABASE_SERVICE_ROLE_KEY (must be server-only).`);
    fail++;
  }
  if (SERVICE_ROLE_LITERAL_RE.test(txt) && /eyJ[A-Za-z0-9_-]{20,}/.test(txt)) {
    console.error(`\u2717 ${path.relative(ROOT, p)}: possible service-role JWT literal in client code.`);
    fail++;
  }
}

function walk(d, fn) {
  if (!fs.existsSync(d)) return;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const full = path.join(d, e.name);
    if (e.isDirectory()) walk(full, fn);
    else fn(full);
  }
}

// 1. Client source
walk(SRC, (full) => { if (/\.(js|jsx|ts|tsx)$/.test(full)) checkClientFile(full); });

// 2. Built bundle
if (fs.existsSync(DIST)) {
  walk(DIST, (full) => { if (/\.(js)$/.test(full)) checkClientFile(full); });
} else {
  console.log('\u2022 dist/ not found - skipping bundle leak check (run `pnpm build` for full coverage).');
}

// 3. .env.example server-only marker
const envExample = path.join(ROOT, '.env.example');
if (fs.existsSync(envExample)) {
  const t = fs.readFileSync(envExample, 'utf8');
  if (/SUPABASE_SERVICE_ROLE_KEY/.test(t) && !/never|server|NEVER/i.test(t)) {
    console.error('\u2717 .env.example: SUPABASE_SERVICE_ROLE_KEY is not marked server-only.');
    fail++;
  } else {
    console.log('\u2713 .env.example marks the service role key as server-only.');
  }
}

if (fail) { console.error(`\n${fail} guardrail check(s) failed.`); process.exit(1); }
console.log('\n\u2713 All asset guardrail checks passed.');
