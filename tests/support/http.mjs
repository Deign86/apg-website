// HTTP + mail helpers for the API suite (node:test + fetch, no dependencies).
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { API, WEB, MAIL_SINK_DIR, QA_ADMIN, ROLE_EMAILS, rolePassword } from './env.mjs';

/** Short unique token for test data (names, titles, emails), so parallel files never collide. */
export const uid = (prefix = 'qa') => `${prefix}-${crypto.randomBytes(5).toString('hex')}`;
export const qaEmail = (tag = 'visitor') => `${uid(tag)}@apg.test`;
/** Public-form timing guard: "form opened 5 s ago" (api/config.php needs >= 3 s). */
export const formStartedAt = () => String(Date.now() - 5000);

/** A cookie-keeping API client. Browser-like: non-GET requests carry the site's Origin. */
export class Client {
  constructor(base = API) {
    this.base = base;
    this.cookies = new Map();
  }

  cookieHeader() {
    return [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; ');
  }

  async request(method, url, { json, form, headers = {}, origin = WEB, redirect = 'manual' } = {}) {
    const h = { ...headers };
    if (this.cookies.size) h.Cookie = this.cookieHeader();
    if (origin && method !== 'GET' && method !== 'HEAD') h.Origin = origin;
    let body;
    if (json !== undefined) {
      h['Content-Type'] = 'application/json';
      body = typeof json === 'string' ? json : JSON.stringify(json);
    } else if (form !== undefined) {
      body = form; // FormData: fetch sets the multipart boundary
    }
    const res = await fetch(new URL(url, this.base), { method, headers: h, body, redirect });
    for (const line of res.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(';');
      const i = pair.indexOf('=');
      const name = pair.slice(0, i).trim();
      const value = pair.slice(i + 1).trim();
      const expired = attrs.some((a) => /^\s*expires=/i.test(a) && Date.parse(a.split('=')[1]) < Date.now())
        || attrs.some((a) => /^\s*max-age=0/i.test(a)) || value === 'deleted' || value === '';
      if (expired) this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
    const buffer = Buffer.from(await res.arrayBuffer());
    const text = buffer.toString('utf8');
    let data = null;
    if ((res.headers.get('content-type') || '').includes('application/json')) {
      try { data = JSON.parse(text); } catch { data = null; }
    }
    return { status: res.status, headers: res.headers, data, text, buffer };
  }

  get(url, opts) { return this.request('GET', url, opts); }
  post(url, opts) { return this.request('POST', url, opts); }
  put(url, opts) { return this.request('PUT', url, opts); }
  patch(url, opts) { return this.request('PATCH', url, opts); }
  delete(url, opts) { return this.request('DELETE', url, opts); }

  async login(email, password) {
    const res = await this.post('/api/admin/auth.php', { json: { email, password } });
    if (res.status !== 200) throw new Error(`login ${email} -> ${res.status} ${res.text.slice(0, 200)}`);
    return res;
  }
}

/** Credentials of a seeded account: superadmin (QA admin from .env.local) or admin/editor/recruiter. */
export function credentials(role) {
  if (role === 'superadmin') return { email: QA_ADMIN.email, password: QA_ADMIN.password };
  return { email: ROLE_EMAILS[role], password: rolePassword() };
}

/** A fresh client signed in as `role`. */
export async function as(role, base = API) {
  const client = new Client(base);
  const { email, password } = credentials(role);
  await client.login(email, password);
  return client;
}

/** Multipart form from a plain object; `files` maps field -> { name, type, data }. */
export function multipart(fields, files = {}) {
  const fd = new FormData();
  for (const [k, v] of Object.entries(fields)) fd.append(k, v);
  for (const [k, f] of Object.entries(files)) fd.append(k, new Blob([f.data], { type: f.type || 'application/octet-stream' }), f.name);
  return fd;
}

/** A small but valid PDF. */
export const PDF_BYTES = Buffer.from('%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj\n2 0 obj<</Type/Pages/Kids[]/Count 0>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n');
/** 1x1 PNG. */
export const PNG_BYTES = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');

// ------------------------------------------------------------------ mail sink

export const mailEnabled = Boolean(MAIL_SINK_DIR);

const decodeWords = (value) => value.replace(/=\?UTF-8\?B\?([^?]*)\?=/gi, (_, b64) => Buffer.from(b64, 'base64').toString('utf8'));

/** Parsed .eml: headers (decoded), plain-text + HTML bodies. */
export function parseMail(raw) {
  const [head] = raw.split(/\r?\n\r?\n/);
  const headers = {};
  for (const line of head.replace(/\r?\n[ \t]+/g, ' ').split(/\r?\n/)) {
    const i = line.indexOf(':');
    if (i > 0) headers[line.slice(0, i).trim().toLowerCase()] = decodeWords(line.slice(i + 1).trim());
  }
  let text = '';
  let html = '';
  const partRe = /Content-Type: text\/(plain|html); charset=UTF-8\r?\nContent-Transfer-Encoding: base64\r?\n\r?\n([A-Za-z0-9+/=\r\n]+)/g;
  for (const m of raw.matchAll(partRe)) {
    const decoded = Buffer.from(m[2].replace(/\s+/g, ''), 'base64').toString('utf8');
    if (m[1] === 'plain') text += decoded; else html += decoded;
  }
  return { headers, subject: headers.subject || '', to: headers.to || '', replyTo: headers['reply-to'] || '', text, html, raw };
}

/** Waits for a sink message (written after `since`) matching `predicate(mail)`. */
export async function waitForMail(predicate, { since = 0, timeout = 15000 } = {}) {
  if (!mailEnabled) throw new Error('MAIL_SINK_DIR is not set');
  const deadline = Date.now() + timeout;
  const seen = new Set();
  while (Date.now() < deadline) {
    for (const name of fs.readdirSync(MAIL_SINK_DIR)) {
      if (!name.endsWith('.eml') || seen.has(name)) continue;
      const file = path.join(MAIL_SINK_DIR, name);
      if (fs.statSync(file).mtimeMs < since - 1000) { seen.add(name); continue; }
      const mail = parseMail(fs.readFileSync(file, 'utf8'));
      if (predicate(mail)) return mail;
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error('No matching email arrived in the sink');
}
