// Starts the isolated test stack and tears it down again:
//   1. a fresh MySQL database (TEST_DB): api/schema.sql + api/migrate.php (the fresh-install path)
//      + seeded admin accounts; its migrate output is kept in test-results/migrate.log
//   2. PHP built-in servers on that DB: PORTS.php with APG_TEST_MODE=1 (rate limits lifted) and
//      PORTS.phpStrict with production limits; each gets its own temp dir (rate-limit buckets, sessions)
//   3. the SMTP sink (when MAIL_SINK_DIR is set) and, for the browser suite, a production build served
//      by `vite preview` (PORTS.vite) plus a Vite dev server (PORTS.viteDev), both proxying /api to PORTS.php
// Never touches the developer's servers (:5173 / :8000) or their database.
import { spawn, spawnSync } from 'node:child_process';
import crypto from 'node:crypto';
import fs from 'node:fs';
import net from 'node:net';
import os from 'node:os';
import path from 'node:path';
import { ROOT, PORTS, TEST_DB, MAIL_SINK_DIR, env } from './env.mjs';
import { startSmtpSink } from './smtp-sink.mjs';

const PHP = env('PHP_BINARY', 'php');
const RESULTS = path.join(ROOT, 'test-results');

function portOpen(port, host = '127.0.0.1') {
  return new Promise((resolve) => {
    const socket = net.connect(port, host);
    socket.once('connect', () => { socket.destroy(); resolve(true); });
    socket.once('error', () => resolve(false));
  });
}

async function waitForPort(port, label, child, timeoutMs = 60000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    if (child && child.exitCode !== null) throw new Error(`${label} exited early (code ${child.exitCode})`);
    if (await portOpen(port)) return;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`${label} did not open port ${port} within ${timeoutMs} ms`);
}

function php(args, extraEnv) {
  const result = spawnSync(PHP, args, { cwd: ROOT, env: { ...process.env, ...extraEnv }, encoding: 'utf8' });
  if (result.error) throw new Error(`Cannot run PHP (${PHP}): ${result.error.message}. Set PHP_BINARY.`);
  return result;
}

/** Env shared by every PHP process of the stack. Empty values override the developer's .env. */
function phpEnv() {
  return {
    DB_NAME: TEST_DB,
    SMTP_HOST: '127.0.0.1',
    // Without a sink, point mail at a closed port: sends fail fast and nothing ever leaves the machine.
    SMTP_PORT: String(MAIL_SINK_DIR ? PORTS.smtp : 9),
    SMTP_SECURE: 'none',
    SMTP_USER: 'test',
    SMTP_PASS: 'test',
    MAIL_FROM_EMAIL: 'website@apg.test',
    MAIL_TO_EMAIL: 'inbox@apg.test',
    HR_EMAIL: 'hr@apg.test',
    SECURITY_EMAIL: 'security@apg.test',
    GEMINI_API_KEY: '',
    TURNSTILE_SECRET_KEY: '',
    GOOGLE_SA_KEY_B64: '',
    ATS_USE_AI: '0',
  };
}

function resetDatabase() {
  const create = php(['tests/support/reset-db.php', 'create'], phpEnv());
  if (create.status !== 0) throw new Error(`Test DB create failed:\n${create.stderr}${create.stdout}`);
  const migrate = php(['api/migrate.php'], phpEnv());
  fs.mkdirSync(RESULTS, { recursive: true });
  fs.writeFileSync(path.join(RESULTS, 'migrate.log'), `${migrate.stdout}${migrate.stderr}`);
  if (migrate.status !== 0) throw new Error(`api/migrate.php failed (see test-results/migrate.log)`);
  const seed = php(['tests/support/reset-db.php', 'seed'], phpEnv());
  if (seed.status !== 0) throw new Error(`Test DB seed failed:\n${seed.stderr}`);
}

function startPhp(port, testMode) {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), `apg-php-${port}-`));
  const child = spawn(PHP, [
    '-d', 'variables_order=EGPCS',
    // Production limits (.user.ini): resumes up to 15 MB reach the script.
    '-d', 'upload_max_filesize=16M', '-d', 'post_max_size=20M',
    '-d', `session.save_path=${tmp}`, '-d', `sys_temp_dir=${tmp}`, '-d', `upload_tmp_dir=${tmp}`,
    '-S', `127.0.0.1:${port}`, '-t', ROOT,
  ], {
    cwd: ROOT,
    env: { ...process.env, ...phpEnv(), TMP: tmp, TEMP: tmp, APG_TEST_MODE: testMode ? '1' : '0' },
    stdio: ['ignore', 'ignore', 'pipe'],
  });
  const log = fs.createWriteStream(path.join(RESULTS, `php-${port}.log`));
  child.stderr.pipe(log);
  child.tmp = tmp;
  return child;
}

const VITE = path.join(ROOT, 'node_modules/vite/bin/vite.js');
const VITE_CONFIG = ['--config', 'tests/support/vite.config.mjs'];

// Mode "test": .env.production (the live Turnstile site key) stays out of the test bundle, so forms
// submit without a Cloudflare challenge, exactly like local dev.
function buildSite() {
  const result = spawnSync(process.execPath, [VITE, 'build', ...VITE_CONFIG, '--mode', 'test', '--logLevel', 'warn'], { cwd: ROOT, encoding: 'utf8' });
  fs.writeFileSync(path.join(RESULTS, 'vite-build.log'), `${result.stdout}${result.stderr}`);
  if (result.status !== 0) throw new Error('vite build failed (see test-results/vite-build.log)');
}

function startVite(mode) {
  const child = spawn(process.execPath, [VITE, ...(mode === 'preview' ? ['preview'] : []), ...VITE_CONFIG], {
    cwd: ROOT,
    env: { ...process.env },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  const log = fs.createWriteStream(path.join(RESULTS, `vite-${mode}.log`));
  child.stdout.pipe(log);
  child.stderr.pipe(log);
  return child;
}

function kill(child) {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') spawnSync('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
  else child.kill('SIGTERM');
}

/**
 * Boots the stack; resolves to a stop() function. Sets process.env.APG_TEST_ROLE_PASSWORD (random per
 * run) so test processes spawned afterwards can log in as the seeded role accounts.
 */
export async function startStack({ vite = false } = {}) {
  for (const port of [PORTS.php, PORTS.phpStrict, ...(vite ? [PORTS.vite, PORTS.viteDev] : []), ...(MAIL_SINK_DIR ? [PORTS.smtp] : [])]) {
    if (await portOpen(port)) throw new Error(`Port ${port} is already in use; stop that process or set APG_TEST_*_PORT.`);
  }
  process.env.APG_TEST_ROLE_PASSWORD ||= `Qa-${crypto.randomBytes(12).toString('hex')}`;
  fs.mkdirSync(RESULTS, { recursive: true });
  resetDatabase();

  const children = [];
  let sink = null;
  try {
    if (MAIL_SINK_DIR) sink = await startSmtpSink(PORTS.smtp, MAIL_SINK_DIR);
    const main = startPhp(PORTS.php, true);
    const strict = startPhp(PORTS.phpStrict, false);
    children.push(main, strict);
    await waitForPort(PORTS.php, 'PHP test server', main);
    await waitForPort(PORTS.phpStrict, 'PHP strict server', strict);
    if (vite) {
      buildSite();
      const preview = startVite('preview');
      const dev = startVite('dev');
      children.push(preview, dev);
      await waitForPort(PORTS.vite, 'vite preview', preview, 60000);
      await waitForPort(PORTS.viteDev, 'vite dev server', dev, 120000);
    }
  } catch (error) {
    children.forEach(kill);
    sink?.close();
    throw error;
  }

  return async function stop() {
    children.forEach(kill);
    sink?.close();
    for (const child of children) {
      if (child.tmp) fs.rmSync(child.tmp, { recursive: true, force: true });
    }
  };
}
