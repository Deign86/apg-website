// Staff notification emails are also Bcc'd to ADMIN_NOTIFY_BCC (api/config.php), so they reach the company
// Gmail directly instead of through a Hostinger forwarder Gmail sometimes rejects. Mail to visitors and
// applicants never is. Checks the send points, the config value, and api/lib/Mailer.php against a local
// TLS SMTP server (the production transport) and the mail() fallback.
import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import tls from 'node:tls';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('../../', import.meta.url));
const MAILER = path.join(ROOT, 'api/lib/Mailer.php');
const CONFIG = path.join(ROOT, 'api/config.php');
const hasPhp = spawnSync('php', ['-v']).status === 0;
const hasOpenssl = spawnSync('openssl', ['version']).status === 0;

// The staff notifications: [file, start of the emailSend( call].
const STAFF_SENDS = [
  ['api/inquire.php', 'emailSend($t, inquiryRecipient($slug, $form)'], // every public form (inquiry, listing, Virtual Office, payment, feedback, newsletter)
  ['api/lib/Ats.php', "emailSend($t, atsHrEmail($t['slug'])"], // job application to HR
  ['api/chat/message.php', 'emailSend($chatTheme, MAIL_TO_EMAIL'], // live chat "Visitor waiting"
];

/** Every emailSend(...) call under api/, with its full argument list (parentheses balanced). */
function emailSendCalls() {
  const calls = [];
  const walk = (dir) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) walk(full);
      if (!entry.name.endsWith('.php')) continue;
      const src = fs.readFileSync(full, 'utf8');
      for (const match of src.matchAll(/(?<!function )\bemailSend\(/g)) {
        let depth = 0;
        let end = match.index + match[0].length - 1; // the opening parenthesis
        do {
          if (src[end] === '(') depth += 1;
          if (src[end] === ')') depth -= 1;
          end += 1;
        } while (depth > 0);
        calls.push({ file: path.relative(ROOT, full), code: src.slice(match.index, end) });
      }
    }
  };
  walk(path.join(ROOT, 'api'));
  return calls;
}

/** Runs php asynchronously (the fake SMTP server answers on this event loop). */
function runPhp(args, { input = '', env = {} } = {}) {
  return new Promise((resolve) => {
    const child = spawn('php', args, { env: { ...process.env, ...env } });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (d) => { stdout += d; });
    child.stderr.on('data', (d) => { stderr += d; });
    child.on('close', (status) => resolve({ status, stdout, stderr }));
    child.stdin.end(input);
  });
}

/** Defines the given constants, then sends each [to, subject, html, replyTo, replyName, attachments, bcc] with Mailer. */
const MAILER_PROBE = `<?php
$in = json_decode(stream_get_contents(STDIN), true);
foreach ($in['config'] as $name => $value) define($name, $value);
require ${JSON.stringify(MAILER)};
echo json_encode(array_map(fn($args) => (new Mailer())->send(...$args), $in['sends']));`;

/** Header value from a raw message ('' when missing); encoded words are decoded. */
function header(raw, name) {
  const head = raw.slice(0, raw.indexOf('\r\n\r\n'));
  const value = new RegExp(`^${name}: (.*)$`, 'im').exec(head)?.[1] ?? '';
  return value.replace(/=\?UTF-8\?B\?([^?]+)\?=/g, (_, b64) => Buffer.from(b64, 'base64').toString('utf8'));
}

const HTML = '<p>Inquiry from <strong>Juan</strong></p>';
const STAFF = ['contact@apg.test', '[APG-TEST01] Property inquiry APR-A0A000 — Juan', HTML, 'client@example.test', 'Juan', []];
const CLIENT_ACK = ['client@example.test', "We've received your inquiry [APG-TEST01]", HTML, 'contact@apg.test', 'APG', []];
// Two good copies, one the server refuses, and the To address again (must not be sent twice).
const NOTIFY = 'notify@gmail.test, Contact@APG.test, blocked@gmail.test,second@example.test';

describe('admin notification Bcc (ADMIN_NOTIFY_BCC)', () => {
  let dir;
  before(() => { dir = fs.mkdtempSync(path.join(os.tmpdir(), 'apg-notify-bcc-')); });
  after(() => fs.rmSync(dir, { recursive: true, force: true }));

  it('every staff notification send point passes bcc: ADMIN_NOTIFY_BCC', () => {
    const calls = emailSendCalls();
    for (const [file, start] of STAFF_SENDS) {
      const matches = calls.filter((c) => c.file === file && c.code.startsWith(start));
      assert.equal(matches.length, 1, `${file}: ${start}`);
      assert.match(matches[0].code, /, bcc: ADMIN_NOTIFY_BCC\)$/, `${file}: ${start}`);
    }
  });

  it('emails to visitors and applicants (acknowledgements, replies, ATS decisions) get no Bcc', () => {
    const others = emailSendCalls().filter((c) => !STAFF_SENDS.some(([file, start]) => c.file === file && c.code.startsWith(start)));
    for (const start of [
      'emailSend($t, $email, $subject, $confirmHtml', // inquiry confirmation
      'emailSend($t, $email, "We\'ve received your application', // application confirmation
      'emailSend($t, $email, "Your application for', // rejection
      'emailSend($t, (string)$applicant[\'email\'], "Interview invitation', // interview invite
      'emailSend($t, (string)$row[\'email\'], $subject', // admin reply to an inquiry
    ]) {
      assert.ok(others.some((c) => c.code.startsWith(start)), `client email not found: ${start}`);
    }
    for (const call of others) {
      assert.doesNotMatch(call.code, /bcc|ADMIN_NOTIFY_BCC/i, `${call.file}: ${call.code.slice(0, 80)}`);
    }
  });

  it('defaults to the company Gmail only, and takes a comma-separated list from the environment', { skip: !hasPhp && 'php CLI not available' }, async () => {
    const probe = path.join(dir, 'config.php');
    fs.writeFileSync(probe, `<?php require ${JSON.stringify(CONFIG)}; require ${JSON.stringify(MAILER)};
      echo json_encode([ADMIN_NOTIFY_BCC, Mailer::bccRecipients(ADMIN_NOTIFY_BCC, ['contact@alphapremiergroup.com'])]);`);
    // An empty value in the environment wins over any developer .env and falls back to the default.
    const byDefault = await runPhp([probe], { env: { ADMIN_NOTIFY_BCC: '' } });
    assert.equal(byDefault.status, 0, byDefault.stderr);
    assert.deepEqual(JSON.parse(byDefault.stdout), ['thealphapremiergroup@gmail.com', ['thealphapremiergroup@gmail.com']]);

    const configured = await runPhp([probe], { env: { ADMIN_NOTIFY_BCC: 'thealphapremiergroup@gmail.com, ops@example.test' } });
    assert.equal(configured.status, 0, configured.stderr);
    assert.deepEqual(JSON.parse(configured.stdout)[1], ['thealphapremiergroup@gmail.com', 'ops@example.test']);
  });

  it('Mailer::bccRecipients keeps valid addresses once and drops any already in To', { skip: !hasPhp && 'php CLI not available' }, () => {
    const cases = [
      // [bcc, to, expected]
      ['notify@gmail.test', ['contact@apg.test'], ['notify@gmail.test']],
      ['a@gmail.test, b@example.test,c@example.test', ['contact@apg.test'], ['a@gmail.test', 'b@example.test', 'c@example.test']],
      ['Contact@APG.test, notify@gmail.test', ['contact@apg.test'], ['notify@gmail.test']],
      [' notify@gmail.test ,, NOTIFY@gmail.test, not-an-address', ['contact@apg.test'], ['notify@gmail.test']],
      [['x@example.test', 'contact@apg.test'], ['contact@apg.test'], ['x@example.test']],
      ['', ['contact@apg.test'], []],
    ];
    const run = spawnSync('php', ['-r', `require ${JSON.stringify(MAILER)};
      echo json_encode(array_map(fn($c) => Mailer::bccRecipients($c[0], $c[1]), json_decode(stream_get_contents(STDIN), true)));`],
    { input: JSON.stringify(cases), encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(JSON.parse(run.stdout), cases.map((c) => c[2]));
    assert.match(run.stderr, /skipping invalid Bcc address "not-an-address"/);
  });

  it('SMTP: Bcc goes in the envelope only, a refused copy is logged and the To delivery still succeeds', { skip: (!hasPhp && 'php CLI not available') || (!hasOpenssl && 'openssl CLI not available') }, async () => {
    const key = path.join(dir, 'key.pem');
    const cert = path.join(dir, 'cert.pem');
    const gen = spawnSync('openssl', ['req', '-x509', '-newkey', 'ec', '-pkeyopt', 'ec_paramgen_curve:prime256v1', '-nodes',
      '-keyout', key, '-out', cert, '-days', '1', '-subj', '/CN=127.0.0.1', '-addext', 'subjectAltName=IP:127.0.0.1'], { encoding: 'utf8' });
    assert.equal(gen.status, 0, gen.stderr);

    // Implicit-TLS SMTP server (like Hostinger on 465) that refuses blocked@ recipients the way Gmail did.
    const sessions = [];
    const server = tls.createServer({ key: fs.readFileSync(key), cert: fs.readFileSync(cert) }, (socket) => {
      const session = { accepted: [], refused: [], data: '' };
      sessions.push(session);
      let buffer = '';
      let inData = false;
      let authSteps = 0;
      const say = (line) => socket.write(`${line}\r\n`);
      socket.setEncoding('utf8');
      socket.on('error', () => {});
      say('220 fake-smtp ESMTP');
      socket.on('data', (chunk) => {
        buffer += chunk;
        for (let i = buffer.indexOf('\r\n'); i !== -1; i = buffer.indexOf('\r\n')) {
          const line = buffer.slice(0, i);
          buffer = buffer.slice(i + 2);
          const rcpt = /^RCPT TO: ?<(.+)>$/i.exec(line);
          if (inData) {
            if (line === '.') { inData = false; say('250 queued'); } else session.data += `${line}\r\n`;
          } else if (authSteps > 0) {
            authSteps -= 1;
            say(authSteps > 0 ? '334 UGFzc3dvcmQ6' : '235 ok');
          } else if (/^EHLO /i.test(line)) {
            say('250-fake-smtp');
            say('250 AUTH LOGIN');
          } else if (/^AUTH LOGIN$/i.test(line)) {
            authSteps = 2;
            say('334 VXNlcm5hbWU6');
          } else if (rcpt?.[1].startsWith('blocked@')) {
            session.refused.push(rcpt[1]);
            say('550 5.7.1 [SS] Blocked');
          } else if (rcpt) {
            session.accepted.push(rcpt[1]);
            say('250 ok');
          } else if (line === 'DATA') {
            inData = true;
            say('354 end with .');
          } else if (line === 'QUIT') {
            say('221 bye');
            socket.end();
          } else {
            say('250 ok');
          }
        }
      });
    });
    await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
    try {
      const config = {
        SMTP_HOST: '127.0.0.1', SMTP_PORT: server.address().port, SMTP_SECURE: 'ssl', SMTP_USER: 'website@apg.test',
        SMTP_PASS: 'secret', MAIL_FROM_EMAIL: 'website@apg.test', MAIL_FROM_NAME: 'Alpha Premier Group',
      };
      const run = await runPhp(['-d', `openssl.cafile=${cert}`, '-r', MAILER_PROBE.slice('<?php'.length)], {
        input: JSON.stringify({ config, sends: [[...STAFF, NOTIFY], CLIENT_ACK] }),
      });
      assert.equal(run.status, 0, run.stderr);
      assert.deepEqual(JSON.parse(run.stdout), [true, true], run.stderr);
      assert.doesNotMatch(run.stderr, /SMTP Send failed/, 'SMTP was used, no mail() fallback');
      assert.match(run.stderr, /SMTP Bcc <blocked@gmail\.test> refused: SMTP Error \[550\]/);

      const [staff, ack] = sessions;
      // Staff notification: To once, every other notify address directly, the refused one skipped.
      assert.deepEqual(staff.accepted, ['contact@apg.test', 'notify@gmail.test', 'second@example.test']);
      assert.deepEqual(staff.refused, ['blocked@gmail.test']);
      assert.equal(header(staff.data, 'To'), '<contact@apg.test>');
      assert.equal(header(staff.data, 'Bcc'), '', 'Bcc never appears in the headers');
      assert.equal(header(staff.data, 'Reply-To'), 'Juan <client@example.test>');
      assert.equal(header(staff.data, 'Subject'), STAFF[1]);
      assert.ok(!Number.isNaN(Date.parse(header(staff.data, 'Date'))), 'Date header');
      assert.match(header(staff.data, 'Message-ID'), /^<[0-9a-f]{24}@apg\.test>$/);
      assert.match(header(staff.data, 'Content-Type'), /^multipart\/alternative;/);
      assert.match(staff.data, /Content-Type: text\/plain; charset=UTF-8/);
      assert.match(staff.data, /Content-Type: text\/html; charset=UTF-8/);

      // Client acknowledgement: only the visitor.
      assert.deepEqual(ack.accepted, ['client@example.test']);
      assert.deepEqual(ack.refused, []);
      assert.notEqual(header(ack.data, 'Message-ID'), header(staff.data, 'Message-ID'));
    } finally {
      server.close();
    }
  });

  it('mail() fallback: Bcc header for sendmail, plus Date, Message-ID and a plain-text part', { skip: !hasPhp && 'php CLI not available' }, async () => {
    const out = path.join(dir, 'sendmail.eml');
    const config = {
      SMTP_HOST: '', SMTP_PORT: 465, SMTP_SECURE: 'ssl', SMTP_USER: '', SMTP_PASS: '',
      MAIL_FROM_EMAIL: 'website@apg.test', MAIL_FROM_NAME: 'Alpha Premier Group',
    };
    const run = await runPhp(['-d', `sendmail_path=cat > ${out}`, '-r', MAILER_PROBE.slice('<?php'.length)], {
      input: JSON.stringify({ config, sends: [[...STAFF, NOTIFY]] }),
    });
    assert.equal(run.status, 0, run.stderr);
    assert.deepEqual(JSON.parse(run.stdout), [true]);
    const raw = fs.readFileSync(out, 'utf8').replace(/\r?\n/g, '\r\n');
    assert.equal(header(raw, 'To'), 'contact@apg.test');
    assert.equal(header(raw, 'Bcc'), 'notify@gmail.test, blocked@gmail.test, second@example.test');
    assert.equal(header(raw, 'Reply-To'), 'Juan <client@example.test>');
    assert.ok(!Number.isNaN(Date.parse(header(raw, 'Date'))), 'Date header');
    assert.match(header(raw, 'Message-ID'), /^<[0-9a-f]{24}@apg\.test>$/);
    assert.match(raw, /Content-Type: text\/plain; charset=UTF-8/);
  });
});
