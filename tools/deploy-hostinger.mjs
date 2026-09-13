#!/usr/bin/env node
/**
 * Deploy the APG site to Hostinger shared hosting over SFTP.
 *
 * Why not the Hostinger MCP: the official `hostinger-api-mcp` cannot upload
 * arbitrary files to shared/business hosting. Its only upload tool,
 * `agency-hosting_deployNodeStaticWebsite`, is restricted to Agency Plan (h5g)
 * node-static sites and permanently overwrites all existing site contents. It
 * also cannot create MySQL databases or run SQL. SFTP is the supported channel.
 *
 * Uses the system OpenSSH client (ssh/scp/sftp) and PowerShell Compress-Archive.
 * No npm dependencies are added.
 *
 * Usage:
 *   npm run deploy                       build, stage, upload, emit ZIP
 *   npm run deploy -- --dry-run          show what would upload, touch nothing
 *   npm run deploy -- --with-migrations  include setup.php + migrate-blogs.php
 *   npm run deploy -- --purge-migrations delete those two files from the server
 *   npm run deploy -- --zip-only         stage + ZIP, skip upload
 *   npm run deploy -- --skip-build       reuse the existing dist/
 *
 * Requires `.env.deploy` in the repo root. See `.env.deploy.example`.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync, spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const STAGE = path.join(ROOT, 'dist-deploy');
const ZIP = path.join(ROOT, 'dist-deploy.zip');

const MIGRATION_FILES = ['setup.php', 'migrate.php'];

/**
 * Development-only artifacts that must never reach the server. Anything in api/
 * matching these is stripped from the bundle. Files prefixed with `_` are the
 * convention used here for local test harnesses and throwaway scripts.
 */
const API_EXCLUDE_PATTERNS = [
  /^\.env/i,
  /^_/,            // local harnesses, e.g. api/_verify-env.php
  /\.local\.php$/i,
  /\.bak$/i,
  /\.orig$/i,
  /\.tmp$/i,
  /^README\.md$/i,
];

// Files that must exist in the staged bundle or the deploy is aborted.
const REQUIRED_BUNDLE_PATHS = [
  'index.html',
  '.htaccess',
  'api/blogs.php',
  'api/admin/blogs.php',
  'api/config.php',
  'api/migrate.php',
];

// ------------------------------------------------------------------ cli flags

const argv = process.argv.slice(2);
const flag = (name) => argv.includes(`--${name}`);
const OPTIONS = {
  dryRun: flag('dry-run'),
  zipOnly: flag('zip-only'),
  skipBuild: flag('skip-build'),
  withMigrations: flag('with-migrations'),
  purgeMigrations: flag('purge-migrations'),
  skipLegacy: flag('skip-legacy'),
  noZip: flag('no-zip'),
  help: flag('help') || flag('h'),
};

if (OPTIONS.help) {
  console.log(`APG Hostinger deploy

  --dry-run            show the upload plan without touching the server
  --zip-only           stage the bundle and emit dist-deploy.zip, skip upload
  --skip-build         reuse the existing dist/ instead of rebuilding
  --skip-legacy        exclude public/legacy/ (about 152 MB, mostly one video)
  --no-zip             skip creating dist-deploy.zip
  --with-migrations    include api/setup.php and api/migrate-blogs.php
  --purge-migrations   delete those two files from the server
  --help               this message
`);
  process.exit(0);
}

// ------------------------------------------------------------------ utilities

const c = {
  dim: (s) => `\x1b[2m${s}\x1b[0m`,
  bold: (s) => `\x1b[1m${s}\x1b[0m`,
  green: (s) => `\x1b[32m${s}\x1b[0m`,
  red: (s) => `\x1b[31m${s}\x1b[0m`,
  yellow: (s) => `\x1b[33m${s}\x1b[0m`,
  cyan: (s) => `\x1b[36m${s}\x1b[0m`,
};

function step(n, total, msg) {
  console.log(`\n${c.bold(`[${n}/${total}]`)} ${msg}`);
}

function fail(msg, hint) {
  console.error(`\n${c.red('FAILED:')} ${msg}`);
  if (hint) console.error(c.dim(hint));
  process.exit(1);
}

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, { stdio: 'inherit', shell: false, ...opts });
  if (result.error) fail(`Could not run ${cmd}: ${result.error.message}`);
  if (result.status !== 0) fail(`${cmd} exited with code ${result.status}`);
}

function runCapture(cmd, args) {
  return execFileSync(cmd, args, { encoding: 'utf8', shell: false });
}

function rmrf(target) {
  fs.rmSync(target, { recursive: true, force: true });
}

function walk(dir, base = dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, base, out);
    else out.push(path.relative(base, full).split(path.sep).join('/'));
  }
  return out;
}

function copyRecursive(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    fs.mkdirSync(dest, { recursive: true });
    for (const entry of fs.readdirSync(src)) copyRecursive(path.join(src, entry), path.join(dest, entry));
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
  }
}

// ------------------------------------------------------------- .env.deploy

function loadDeployEnv() {
  const envPath = path.join(ROOT, '.env.deploy');
  if (!fs.existsSync(envPath)) {
    fail(
      'Missing .env.deploy',
      'Copy .env.deploy.example to .env.deploy and fill in SFTP_HOST, SFTP_USER and SFTP_PATH.',
    );
  }

  const config = {};
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 0) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    config[key] = value;
  }

  const missing = ['SFTP_HOST', 'SFTP_USER', 'SFTP_PATH'].filter((k) => !config[k]);
  if (missing.length) {
    fail(
      `.env.deploy is missing required keys: ${missing.join(', ')}`,
      'See .env.deploy.example for the expected format.',
    );
  }

  config.SFTP_PORT = config.SFTP_PORT || '65002';
  return config;
}

function sshTarget(config) {
  return `${config.SFTP_USER}@${config.SFTP_HOST}`;
}

/**
 * Shared OpenSSH options. accept-new avoids an interactive host-key prompt on
 * first connect while still refusing a changed key.
 */
function sshArgs(config) {
  const args = [
    '-P', config.SFTP_PORT,
    '-o', 'StrictHostKeyChecking=accept-new',
    '-o', 'ConnectTimeout=20',
  ];
  if (config.SFTP_KEY) args.push('-i', config.SFTP_KEY);
  return args;
}

// ------------------------------------------------------------------ stages

function build() {
  if (OPTIONS.skipBuild) {
    if (!fs.existsSync(path.join(ROOT, 'dist', 'index.html'))) {
      fail('--skip-build was passed but dist/index.html does not exist.');
    }
    console.log(c.dim('  skipped (--skip-build)'));
    return;
  }

  // Invoke Vite through the current Node binary rather than shelling out to
  // `npm`. `npm` is a .cmd shim on Windows and is not reliably resolvable from
  // a spawned child process, and this avoids depending on PATH or a shell.
  const viteBin = path.join(ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  if (!fs.existsSync(viteBin)) {
    fail(
      'Local Vite binary not found at node_modules/vite/bin/vite.js',
      'Run `npm install` first, or pass --skip-build to deploy the existing dist/.',
    );
  }

  console.log(c.dim('  running: vite build'));
  const result = spawnSync(process.execPath, [viteBin, 'build'], {
    cwd: ROOT,
    stdio: 'inherit',
    shell: false,
  });
  if (result.error) fail(`Could not run Vite: ${result.error.message}`);
  if (result.status !== 0) fail(`vite build exited with code ${result.status}`);
}

function dirSize(dir) {
  let bytes = 0;
  let files = 0;
  const stack = [dir];
  while (stack.length) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else { bytes += fs.statSync(full).size; files++; }
    }
  }
  return { bytes, files };
}

function mb(bytes) {
  return (bytes / 1024 / 1024).toFixed(1);
}

function reportBreakdown() {
  const rows = [];
  for (const entry of fs.readdirSync(STAGE, { withFileTypes: true })) {
    const full = path.join(STAGE, entry.name);
    const { bytes, files } = entry.isDirectory()
      ? dirSize(full)
      : { bytes: fs.statSync(full).size, files: 1 };
    rows.push({ name: entry.name + (entry.isDirectory() ? '/' : ''), bytes, files });
  }
  rows.sort((a, b) => b.bytes - a.bytes);

  console.log(c.dim('  bundle breakdown:'));
  for (const row of rows) {
    if (row.bytes < 1024) continue;
    console.log(c.dim(`    ${row.name.padEnd(20)} ${mb(row.bytes).padStart(8)} MB  ${String(row.files).padStart(5)} files`));
  }
  return rows;
}

function copyApiTree(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (API_EXCLUDE_PATTERNS.some((re) => re.test(entry.name))) {
      continue;
    }
    const from = path.join(src, entry.name);
    const to = path.join(dest, entry.name);
    if (entry.isDirectory()) copyApiTree(from, to);
    else fs.copyFileSync(from, to);
  }
}

function stage() {
  const distDir = path.join(ROOT, 'dist');
  const apiDir = path.join(ROOT, 'api');
  const htaccess = path.join(ROOT, '.htaccess');

  if (!fs.existsSync(path.join(distDir, 'index.html'))) {
    fail('dist/index.html not found. Run `npm run build` first.');
  }
  if (!fs.existsSync(htaccess)) {
    fail('.htaccess not found in the repo root. It is required for SPA routing.');
  }

  rmrf(STAGE);
  fs.mkdirSync(STAGE, { recursive: true });

  // Frontend build output.
  copyRecursive(distDir, STAGE);

  // The legacy archive is a large static copy of the old site. Its hero video
  // alone is ~146 MB, which dominates upload time on shared hosting.
  if (OPTIONS.skipLegacy) {
    rmrf(path.join(STAGE, 'legacy'));
  }

  // Backend: the entire api/ tree minus dev-only artifacts, then drop the
  // migration utilities unless they were explicitly requested.
  copyApiTree(apiDir, path.join(STAGE, 'api'));
  if (!OPTIONS.withMigrations) {
    for (const file of MIGRATION_FILES) {
      rmrf(path.join(STAGE, 'api', file));
    }
  }

  // Apache rewrite rules.
  fs.copyFileSync(htaccess, path.join(STAGE, '.htaccess'));

  // Never ship local secrets. public_html/.env is created on the server by hand
  // (see DEPLOY.md); uploading a developer's .env would overwrite production
  // database and SMTP credentials with local ones.
  for (const secret of ['.env', '.env.local', '.env.production']) {
    rmrf(path.join(STAGE, secret));
  }

  // Refuse to ship a bundle that is missing something critical.
  const missing = REQUIRED_BUNDLE_PATHS.filter((rel) => {
    if (rel === 'api/migrate.php' && !OPTIONS.withMigrations) return false;
    return !fs.existsSync(path.join(STAGE, rel));
  });
  if (missing.length) {
    fail(`Staged bundle is missing required files: ${missing.join(', ')}`);
  }

  const files = walk(STAGE);
  const bytes = files.reduce((sum, rel) => sum + fs.statSync(path.join(STAGE, rel)).size, 0);

  reportBreakdown();
  console.log(`  staged ${c.bold(files.length)} files, ${c.bold(mb(bytes))} MB into dist-deploy/`);
  console.log(c.dim('  excluded: .env (create it on the server instead)'));
  if (bytes > 200 * 1024 * 1024) {
    const hints = [];
    if (!OPTIONS.skipLegacy && fs.existsSync(path.join(STAGE, 'legacy'))) {
      hints.push('--skip-legacy drops about 152 MB (the archived old site)');
    }
    hints.push('--no-zip skips the local ZIP archive');
    console.log(
      c.yellow(
        '  NOTE: this bundle is large for shared hosting.\n' +
        hints.map((h) => `        ${h}`).join('\n'),
      ),
    );
  }
  if (!OPTIONS.withMigrations) {
    console.log(c.dim('  excluded: api/setup.php, api/migrate.php'));
  }
  return { fileCount: files.length, bytes };
}

function makeZip() {
  if (OPTIONS.noZip) {
    console.log(c.dim('  skipped (--no-zip)'));
    return;
  }
  rmrf(ZIP);
  if (process.platform === 'win32') {
    runCapture('powershell', [
      '-NoProfile', '-NonInteractive', '-Command',
      `Compress-Archive -Path '${STAGE}\\*' -DestinationPath '${ZIP}' -Force`,
    ]);
  } else {
    run('zip', ['-rq', ZIP, '.'], { cwd: STAGE });
  }
  console.log(`  wrote dist-deploy.zip (${mb(fs.statSync(ZIP).size)} MB) — fallback for hPanel File Manager`);
}

function upload(config, stats) {
  const remote = config.SFTP_PATH.replace(/\/+$/, '');
  const target = `${sshTarget(config)}:${remote}/`;

  const plan = [];
  // Frontend: each top-level entry in the build output, except the two handled
  // explicitly below.
  for (const entry of fs.readdirSync(STAGE)) {
    if (entry === 'api' || entry === '.htaccess') continue;
    plan.push({ src: path.join(STAGE, entry), label: entry });
  }
  // Backend: the api/ directory as a whole.
  plan.push({ src: path.join(STAGE, 'api'), label: 'api/' });
  // Rewrite rules last.
  plan.push({ src: path.join(STAGE, '.htaccess'), label: '.htaccess' });

  console.log(c.dim(`  target: ${target}`));
  for (const item of plan) console.log(c.dim(`    -> ${item.label}`));

  if (OPTIONS.dryRun) {
    console.log(c.yellow('  dry run: nothing was uploaded'));
    return;
  }

  if (!config.SFTP_KEY) {
    console.log(
      c.yellow(
        '\n  Password auth is interactive — you will be prompted once per upload below.\n' +
        '  For unattended deploys, set SFTP_KEY in .env.deploy instead.',
      ),
    );
  }

  for (const item of plan) {
    console.log(`\n  uploading ${c.cyan(item.label)} ...`);
    run('scp', [...sshArgs(config), '-r', item.src, target]);
  }

  console.log(c.green(`\n  uploaded ${stats.fileCount} files`));
}

function purgeMigrations(config) {
  const remote = config.SFTP_PATH.replace(/\/+$/, '');
  const batch = MIGRATION_FILES.map((f) => `rm ${remote}/api/${f}`).join('\n');

  console.log(c.dim(`  target: ${sshTarget(config)}`));
  for (const file of MIGRATION_FILES) console.log(c.dim(`    rm api/${file}`));

  if (OPTIONS.dryRun) {
    console.log(c.yellow('  dry run: nothing was deleted'));
    return;
  }

  // `rm` on a missing file makes sftp exit non-zero; tolerate that.
  const result = spawnSync('sftp', [...sshArgs(config), '-b', '-', sshTarget(config)], {
    input: batch,
    stdio: ['pipe', 'inherit', 'inherit'],
  });
  if (result.error) fail(`Could not run sftp: ${result.error.message}`);
  console.log(
    result.status === 0
      ? c.green('  migration endpoints removed from the server')
      : c.yellow('  sftp reported an error (a file may already have been absent)'),
  );
}

// ------------------------------------------------------------------ main

const TOTAL_STEPS = OPTIONS.purgeMigrations ? 2 : 4;

console.log(c.bold('\nAPG -> Hostinger deploy'));
if (OPTIONS.dryRun) console.log(c.yellow('DRY RUN — no server changes will be made'));

const config = loadDeployEnv();

if (OPTIONS.purgeMigrations) {
  step(1, TOTAL_STEPS, 'Purging migration endpoints');
  purgeMigrations(config);
  step(2, TOTAL_STEPS, 'Done');
  console.log(c.green('\nMigration endpoints purged.\n'));
  process.exit(0);
}

step(1, TOTAL_STEPS, 'Building production assets');
build();

step(2, TOTAL_STEPS, 'Staging deploy bundle');
const stats = stage();

step(3, TOTAL_STEPS, 'Creating ZIP fallback');
makeZip();

step(4, TOTAL_STEPS, OPTIONS.zipOnly ? 'Skipping upload (--zip-only)' : 'Uploading over SFTP');
if (OPTIONS.zipOnly) {
  console.log(c.dim('  skipped'));
} else {
  upload(config, stats);
}

console.log(c.green(c.bold('\nDeploy complete.')));
console.log(c.dim(`
Next steps on the server:
  1. Ensure public_html/.env exists with DB_* , SMTP_* and SETUP_TOKEN.
  2. Run the schema + blog migration (see DEPLOY.md).
  3. Delete api/setup.php and api/migrate.php once the migration succeeds:
       npm run deploy -- --purge-migrations
`));
