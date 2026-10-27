#!/usr/bin/env node
/**
 * Make the Hostinger server pull a GitHub release (the "no SSH" production route, DEPLOY.md
 * "Current production route"). Drives Hostinger's public REST API (https://developers.hostinger.com):
 *
 *   1. create a one-minute cron job that downloads tools/hostinger-update.sh from the release and runs it
 *   2. poll public_html/.deploy.log until the script logs "== <tag> done" (or exits without it)
 *   3. delete the cron job, whatever happened
 *   4. clear the website cache (server + CDN) on success
 *
 *   HOSTINGER_API_TOKEN=... node tools/hostinger-release-deploy.mjs --tag deploy-2026-10-26-123
 *   node tools/hostinger-release-deploy.mjs --tag <tag> --dry-run     print the API calls, call nothing
 *
 * Options: --timeout-minutes N (default 15), --poll-seconds N (default 20).
 * Env: HOSTINGER_API_TOKEN (hPanel → API), HOSTINGER_USERNAME, HOSTINGER_DOMAIN, GITHUB_REPOSITORY.
 * Run by .github/workflows/deploy.yml after the release is created; no npm dependencies.
 */
import { pathToFileURL } from 'node:url';

export const API = 'https://developers.hostinger.com';
export const DEFAULTS = {
  username: 'u501100418',
  domain: 'alphapremiergroup.com',
  repository: 'Deign86/apg-website',
  logPath: '.deploy.log', // relative to public_html
};

// Hostinger limits a cron command to 255 characters and rejects `%` (crontab newline), pipes and
// redirections; its Cloudflare WAF also rejects raw.githubusercontent.com URLs. The release asset
// URL on github.com is the only download form known to pass (DEPLOY.md).
const CRON_COMMAND_MAX = 255;
const TAG_RE = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

export function buildCronCommand(tag, { username = DEFAULTS.username, repository = DEFAULTS.repository } = {}) {
  if (!TAG_RE.test(tag)) throw new Error(`Release tag ${JSON.stringify(tag)} must match ${TAG_RE}`);
  const script = `/home/${username}/hostinger-update.sh`;
  const asset = `https://github.com/${repository}/releases/download/${tag}/hostinger-update.sh`;
  const command = `curl -fsSL -o ${script} ${asset} && /bin/bash ${script} ${tag}`;
  if (command.length > CRON_COMMAND_MAX) {
    throw new Error(`Cron command is ${command.length} characters; Hostinger allows ${CRON_COMMAND_MAX}. Shorten the tag.`);
  }
  if (/[%|<>]/.test(command)) throw new Error('Cron command must not contain %, |, < or >');
  return command;
}

/**
 * Reads public_html/.deploy.log for one tag. tools/hostinger-update.sh writes it only when it exits,
 * so a stale log from the previous deploy stays in place until this run finishes: anything without
 * "== <tag> start" is "not yet". With the tag present, "== <tag> done" is success, "already deployed"
 * (a re-run of a tag the server already has) is success too, and anything else means the script
 * exited early (set -e), which is a failure.
 */
export function classifyLog(log, tag) {
  if (typeof log !== 'string' || !log.includes(`== ${tag} start`)) return { state: 'pending' };
  const warnings = log.split('\n').filter((line) => /backup failed|data-fixes failed/.test(line));
  if (log.includes(`== ${tag} done`)) return { state: 'done', warnings };
  if (/^already deployed$/m.test(log)) return { state: 'done', warnings, note: 'already deployed' };
  return { state: 'failed', warnings };
}

function parseArgs(argv) {
  const opts = { tag: '', dryRun: false, timeoutMinutes: 15, pollSeconds: 20 };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') opts.dryRun = true;
    else if (arg === '--tag') opts.tag = argv[++i] ?? '';
    else if (arg === '--timeout-minutes') opts.timeoutMinutes = Number(argv[++i]);
    else if (arg === '--poll-seconds') opts.pollSeconds = Number(argv[++i]);
    else if (arg === '--help' || arg === '-h') opts.help = true;
    else throw new Error(`Unknown argument: ${arg}`);
  }
  if (!(opts.timeoutMinutes > 0) || !(opts.pollSeconds > 0)) throw new Error('--timeout-minutes and --poll-seconds must be positive numbers');
  return opts;
}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

class HttpError extends Error {
  constructor(status, body) {
    super(`HTTP ${status}: ${body}`);
    this.status = status;
  }
}

function createClient({ token, dryRun }) {
  return async function call(method, route, { query, body } = {}) {
    const url = new URL(route, API);
    for (const [key, value] of Object.entries(query ?? {})) url.searchParams.set(key, String(value));
    const line = `${method} ${url.pathname}${url.search}${body ? ' ' + JSON.stringify(body) : ''}`;
    if (dryRun) {
      console.log(`  [dry-run] ${line}`);
      return null;
    }
    const res = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    const text = await res.text();
    if (!res.ok) throw new HttpError(res.status, text.slice(0, 500));
    return text ? JSON.parse(text) : null;
  };
}

function annotate(level, message) {
  // GitHub Actions turns these into job annotations; harmless elsewhere.
  console.log(process.env.GITHUB_ACTIONS ? `::${level}::${message}` : `${level.toUpperCase()}: ${message}`);
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help || !opts.tag) {
    console.log('usage: HOSTINGER_API_TOKEN=... node tools/hostinger-release-deploy.mjs --tag <release-tag> [--dry-run] [--timeout-minutes 15] [--poll-seconds 20]');
    process.exit(opts.help ? 0 : 1);
  }
  const token = process.env.HOSTINGER_API_TOKEN ?? '';
  if (!token && !opts.dryRun) {
    throw new Error('HOSTINGER_API_TOKEN is not set. Create a token in hPanel (Account → API) and export it, or pass --dry-run.');
  }
  const username = process.env.HOSTINGER_USERNAME || DEFAULTS.username;
  const domain = process.env.HOSTINGER_DOMAIN || DEFAULTS.domain;
  const repository = process.env.GITHUB_REPOSITORY || DEFAULTS.repository;
  const command = buildCronCommand(opts.tag, { username, repository });
  const api = createClient({ token, dryRun: opts.dryRun });
  const cronBase = `/api/hosting/v1/accounts/${username}/cron-jobs`;

  console.log(`Deploying ${opts.tag} to ${domain} (account ${username})${opts.dryRun ? ' — DRY RUN' : ''}`);
  console.log(`  cron command (${command.length} chars): ${command}`);

  // A deploy cron job left behind by an interrupted run would keep firing every minute.
  const existing = (await api('GET', cronBase)) ?? [];
  for (const job of existing) {
    if (typeof job.command === 'string' && job.command.includes('hostinger-update.sh')) {
      console.log(`  removing leftover deploy cron job ${job.uid}: ${job.command}`);
      await api('DELETE', `${cronBase}/${job.uid}`);
    }
  }

  const created = await api('POST', cronBase, { body: { time: '* * * * *', command } });
  const uid = created?.uid ?? (opts.dryRun ? 'CRON_UID' : '');
  if (!uid) throw new Error(`Cron job created without a uid: ${JSON.stringify(created)}`);
  console.log(`  created cron job ${uid}; the server will pick it up within a few minutes`);

  let result;
  let log = '';
  try {
    if (opts.dryRun) {
      await api('GET', `/api/hosting/v1/accounts/${username}/domains/${domain}/files/content`, { query: { path: DEFAULTS.logPath } });
      console.log(`  [dry-run] ... repeated every ${opts.pollSeconds}s for up to ${opts.timeoutMinutes} min until the log says "== ${opts.tag} done"`);
      result = { state: 'done', warnings: [] };
    } else {
      result = await waitForLog();
    }
  } finally {
    console.log(`  deleting cron job ${uid}`);
    await api('DELETE', `${cronBase}/${uid}`);
  }

  if (result.state !== 'done') {
    annotate('error', `Deploy ${opts.tag} ${result.state}. See the log and cron output above.`);
    process.exit(1);
  }
  for (const warning of result.warnings) annotate('warning', `${opts.tag}: ${warning} (files are live; re-run by hand, see DEPLOY.md)`);
  if (result.note) console.log(`  server reported "${result.note}"`);

  await api('DELETE', `/api/hosting/v1/accounts/${username}/websites/${domain}/cache/clear`);
  console.log(`  website cache cleared\nDeploy ${opts.tag} done.`);

  async function waitForLog() {
    const deadline = Date.now() + opts.timeoutMinutes * 60_000;
    const started = Date.now();
    while (Date.now() < deadline) {
      await sleep(opts.pollSeconds * 1000);
      let state = { state: 'pending' };
      try {
        const file = await api('GET', `/api/hosting/v1/accounts/${username}/domains/${domain}/files/content`, {
          query: { path: DEFAULTS.logPath, max_lines: 5000 },
        });
        log = file?.content ?? '';
        state = classifyLog(log, opts.tag);
      } catch (err) {
        // 404: no log yet (first deploy ever). Anything else is treated as transient until the deadline.
        if (!(err instanceof HttpError && err.status === 404)) console.log(`  poll error (retrying): ${err.message}`);
      }
      const elapsed = Math.round((Date.now() - started) / 1000);
      if (state.state === 'pending') {
        console.log(`  ${elapsed}s: waiting for the server (log does not mention ${opts.tag} yet)`);
        continue;
      }
      console.log(`\n--- public_html/${DEFAULTS.logPath} ---\n${log.trim()}\n---`);
      if (state.state === 'failed') await printCronOutput();
      return state;
    }
    console.log(`\n--- public_html/${DEFAULTS.logPath} (last read) ---\n${log.trim() || '<empty>'}\n---`);
    await printCronOutput();
    return { state: `timed out after ${opts.timeoutMinutes} min`, warnings: [] };
  }

  async function printCronOutput() {
    // curl/bash errors that happen before the update script redirects its own output land here.
    try {
      const out = await api('GET', `${cronBase}/${uid}/output`);
      console.log(`--- cron job output ---\n${(out?.output ?? '').trim() || '<empty>'}\n---`);
    } catch (err) {
      console.log(`  could not read cron job output: ${err.message}`);
    }
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    annotate('error', err.message);
    process.exit(1);
  });
}
