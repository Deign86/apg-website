# Plan — Supabase Backend Connectivity & Integration Hardening (Alpha Premier Group)

> **Repo:** `C:\Users\Deign\Downloads\Original APG Website` (branch `main`)
> **Project:** Alpha Premier Group — Vite 5 + React 18 + Supabase website + admin panel
> **Supabase project ref:** `ldtavdybcgwjgticrymz` (linked via `supabase/.temp/linked-project.json`)
> **Goal:** Make the Supabase backend properly and fully connected across the entire system — credentials, schema, auth, public data reads, admin CRUD, storage, server backend, and production deployment — with no silent failures.
> **Golden rule:** Do NOT change public-site behavior or routes. Every public page keeps working, falling back to hardcoded content when Supabase is empty or offline. Fix the plumbing, not the pages.

---

## 0. Mission & Guardrails

1. Preserve the existing stack: Vite 5 + React 18 + React Router 6 + react-helmet-async + AOS + Supabase (data/auth/storage) + Resend (contact email) + pnpm.
2. Never expose the Supabase **service-role key** to the client. It is server-side only (`server/contact.js` and Vercel serverless functions). The client uses the **anon key** with RLS.
3. Public pages (`/`, `/properties`, `/virtual-office`, `/careers`, `/blogs`, `/contact`, `/subsidiaries/*`) must keep working exactly as today, including hardcoded fallbacks when a table is empty or the query fails.
4. Keep `pnpm build` green and the browser console error-free on every route.
5. Keep all legacy reference files (`*.html`, `*.php`, `.old_site/`, `firestore.*`, `storage.rules`) untouched.
6. `plan-admin.md` stays intact (the completed admin-panel build plan).
7. Commit per phase: `fix: supabase connectivity — <phase summary>`.

---

## 1. Current State — System Map (every Supabase touchpoint)

| # | File | Supabase surface | Side | Status |
|---|------|------------------|------|--------|
| 1 | `src/lib/supabase.js` | client (`createClient`) | client | wired, but reads `import.meta.env.VITE_SUPABASE_URL`/`_ANON_KEY` — **keys absent from `.env.local`** → client is `createClient(undefined, undefined)` at runtime |
| 2 | `src/context/AuthContext.jsx` | Auth + `profiles` | client | wired; fails silently when client misconfigured |
| 3 | `src/hooks/useFirestore.js` | `offerings` (read) | client | wired; `Properties`/`VirtualOffice` show "No properties found" instead of "backend offline" |
| 4 | `src/hooks/useAdminCrud.js` | generic CRUD | client | wired (RLS-enforced) |
| 5 | `src/lib/logActivity.js` | `activity_log` (insert) | client | wired |
| 6 | `src/lib/insights.js` | none (heuristic) | client | n/a |
| 7 | `src/components/admin/ImageUploader.jsx` | Storage `listing-images`/`blog-images` | client | wired |
| 8 | `src/routes/Blogs.jsx` | `blog_posts` (read) + fallback | client | wired w/ fallback |
| 9 | `src/routes/Careers.jsx` | `job_openings` (read) + fallback | client | wired w/ fallback |
| 10 | `src/components/Chatbot.jsx` | `chatbot_kb` (read) + fallback | client | wired w/ fallback |
| 11 | `src/routes/Properties.jsx` / `VirtualOffice.jsx` | `offerings` via `useFirestore` | client | no "offline" state |
| 12 | Admin managers (`PropertiesManager`, `Dashboard`, `Leads`, `BlogManager`, `CareerManager`, `ChatbotTrainer`, `Users`, `ActivityLog`, `Settings`) | direct `supabase.from(...)` | client | wired (RLS-enforced) |
| 13 | `src/lib/adminApi.js` | calls `/api/admin/*` | client->server | calls `POST /api/admin/seed-content` which **does not exist** on the server |
| 14 | `server/contact.js` | service-role client, `inquiries` insert, `/api/admin/*` | server | reads `process.env` but `node` **never loads dotenv** -> disconnected in local dev |
| 15 | `scripts/setup-admin.cjs` | service-role, creates owner + seeds | server | reads `process.env` (no dotenv); does **not** run `schema.sql` |
| 16 | `supabase/schema.sql` | full schema + RLS + buckets | DB | manual-only; **assumes `offerings` table pre-exists** (only `ALTER`s it) |
| 17 | `supabase/` | CLI link | infra | linked to ref, but **no `config.toml`**, no `migrations/` |
| 18 | `package.json` | scripts | infra | `migrate-to-supabase` points to `scripts/migrate-to-supabase.cjs` which **does not exist** |
| 19 | `vercel.json` | prod routing | infra | only SPA rewrites; **no serverless functions** -> `/api/contact` + `/api/admin/*` 404 in production |
| 20 | `.env` | secrets template | infra | all values commented out |
| 21 | `.env.local` | real secrets | infra | **exists but contains NO Supabase keys** (root cause of the whole disconnect) |

**Root-cause summary:** The code is fully wired to Supabase, but the runtime is disconnected because (a) `.env.local` has no keys, (b) the Node server never loads dotenv, (c) the schema is never applied automatically, and (d) production has no API backend. Phases 1-4 fix these end to end.

---

## 2. Required Environment Variables

| Variable | Used by | Purpose | Exposure |
|----------|---------|---------|----------|
| `VITE_SUPABASE_URL` | client (`import.meta.env`) + server (`process.env`) | Project URL | public (safe) |
| `VITE_SUPABASE_ANON_KEY` | client | anon key (RLS-scoped) | public (safe with RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | server only | bypasses RLS — admin/user mgmt | **NEVER in client** |
| `RESEND_API_KEY` | server | contact email | server only |
| `COMPANY_EMAIL` | server | inbound contact recipient | server only (optional) |
| `VITE_INSIGHTS_API_URL` | client (optional) | future LLM seam | public (optional) |

**Rule:** `VITE_`-prefixed vars are bundled into the client. The service-role key must **not** be `VITE_`-prefixed and must never be imported by any file under `src/`.

---

## Phase 1 — Environment & Secrets (root cause fix)

**Problem:** `.env.local` exists but has no Supabase keys; `.env` is a fully-commented template; the Node server reads `process.env` that Vite never populates for it.

### Deliverables

1. **`.env.local`** — add the required vars with real values from the Supabase dashboard (Project Settings -> API):
   ```
   VITE_SUPABASE_URL=https://ldtavdybcgwjgticrymz.supabase.co
   VITE_SUPABASE_ANON_KEY=<anon key>
   SUPABASE_SERVICE_ROLE_KEY=<service role key>
   RESEND_API_KEY=<resend key>
   COMPANY_EMAIL=alphapremierrealty@gmail.com
   ```
   (Already git-ignored via `.gitignore`.)

2. **`.env.example`** (committed, not ignored) — a safe template with placeholders and a note that `.env.local` holds real values. Ensure `.gitignore` does **not** ignore `.env.example`.

3. **Server dotenv bootstrap** — add `dotenv` to `package.json` and load it at the top of `server/contact.js`:
   ```js
   import 'dotenv/config';   // loads .env + .env.local
   ```
   Point it at `.env.local` (`DOTENV_CONFIG_PATH=.env.local`) so the Node server reads the same file Vite uses. Do the same in `scripts/setup-admin.cjs` (CommonJS: `require('dotenv').config({ path: '.env.local' })`).

4. **Guard rails** — in `src/lib/supabase.js`, export a `supabaseReady` boolean and log a clear error if keys are missing (instead of silently creating a client with `undefined`).

### Acceptance
- `node server/contact.js` starts with `Supabase configured` (no WARN).
- `pnpm dev` reads `offerings`/`blog_posts`/`job_openings` (or shows fallback) with no `Missing VITE_SUPABASE_URL` console error.
- No secret key appears in `dist/` (grep the build for the service key -> 0 hits).

---

## Phase 2 — Schema Deployment Automation

**Problem:** `supabase/schema.sql` is run manually; it only `ALTER`s `offerings` (assumes it exists); there's no `config.toml` or migrations dir; `setup-admin.cjs` never applies it.

### Deliverables

1. **`supabase/config.toml`** — minimal valid config so `supabase db push` and `supabase link` work against the linked project (`project_id = "ldtavdybcgwjgticrymz"`).

2. **Base-table safety** — prepend a guarded `CREATE TABLE IF NOT EXISTS public.offerings (...)` to the schema, with the columns the public site reads (`title`, `location`, `property_type`, `status`, `price`, `price_unit`, `floor_area`, `lot_area`, `description`, `email`, `phone`, `images` jsonb, `created_at`, `updated_at`), so the schema runs cleanly on a fresh database. Keep the existing idempotent `ALTER`s.

3. **Migration file** — create `supabase/migrations/0001_init.sql` containing the full schema (source of truth). `schema.sql` can remain as a convenience copy.

4. **`setup-admin.cjs` runs the schema** — before creating the owner, apply the migration (via `supabase db push`, or the `pg` pooler URL in `supabase/.temp/pooler-url`). At minimum, detect missing tables and print the exact command to run.

5. **Fix the broken script** — `package.json` references `scripts/migrate-to-supabase.cjs` which doesn't exist. Either create it (thin wrapper around `supabase db push`) or remove the script entry.

### Acceptance
- `supabase db push` applies the schema with no errors on a fresh linked project.
- `pnpm setup-admin` creates the owner and seeds content without a manual SQL-editor step.
- `offerings`, `inquiries`, `blog_posts`, `job_openings`, `chatbot_kb`, `activity_log`, `site_settings`, `profiles` all exist; `listing-images` and `blog-images` buckets exist.

---
## Phase 3 — Server Backend Hardening

**Problem:** `server/contact.js` reads `process.env` that's never loaded (fixed in Phase 1); `adminApi.js` calls `POST /api/admin/seed-content` which the server doesn't implement; `adminApi.js` doesn't attach the user's session token.

### Deliverables

1. **dotenv** (from Phase 1) — confirmed loaded; the server `supabase` client is non-null when keys are present.

2. **Implement `/api/admin/seed-content`** — in `server/contact.js` `handleAdminRoute`, add a `POST /api/admin/seed-content` branch that inserts fallback `blog_posts`/`job_openings`/`chatbot_kb`/`site_settings` rows when those tables are empty (mirror the seed rows in `scripts/setup-admin.cjs`).

3. **Audit all `/api/admin/*` routes** against `src/lib/adminApi.js`:
   - `GET /api/admin/stats` — exists
   - `PUT /api/admin/users/:id/role` — exists
   - `PUT /api/admin/users/:id/active` — exists
   - `POST /api/admin/users/invite` — exists
   - `POST /api/admin/seed-content` — add (this phase)

4. **Attach the session token** — `adminApi.js` sets headers but does **not** send the user's Supabase access token, so `verifyAdmin()` can't authenticate. Inject `Authorization: Bearer <token>` from the current Supabase session before each admin server call.

### Acceptance
- `pnpm dev:all` -> contact form submission creates an `inquiries` row AND sends email.
- Admin Settings "Seed fallback content" returns `{ success: true }` and populates empty tables.
- All `/api/admin/*` routes return 401 without a valid staff token (not 500).

---

## Phase 4 — Production Deployment (Vercel)

**Problem:** `vercel.json` only contains SPA rewrites (`/(.*) -> /index.html`), so in production `/api/contact` and `/api/admin/*` are rewritten to the SPA and 404. There are no serverless functions.

### Deliverables

1. **Serverless functions** — create `api/` (Vercel convention):
   - `api/contact.js` — `export default async function handler(req, res)` wrapping the existing `handleContact` logic.
   - `api/admin/[...path].js` — catch-all handler wrapping `handleAdminRoute`.
   Both reuse a shared `api/_supabase.js` that builds the service-role client from `process.env` (Vercel injects env vars at runtime).

2. **`vercel.json` rewrites** — API routes must NOT be caught by the SPA catch-all. Functions in `api/` take precedence over rewrites for `/api/*`; keep the SPA rewrite for everything else and verify `/api/*` is excluded.

3. **Vercel project env vars** — set in the dashboard (Project -> Settings -> Environment Variables): `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (exposed to build), `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `COMPANY_EMAIL` (runtime only, **not** exposed to the client).

4. **Build still green** — `pnpm build` produces `dist/`; Vercel serves it statically; API calls hit the functions.

### Acceptance
- Deployed URL: contact form posts to `/api/contact` -> 200 + email + `inquiries` row.
- Admin login + CRUD work against the deployed backend.
- Direct `GET /api/admin/stats` without auth -> 401 JSON, not SPA HTML.

---

## Phase 5 — Resilience & Error UX

**Problem:** When the backend is misconfigured/offline, public pages show "No properties found" (looks like a data problem) and admin pages show empty tables with no explanation.

### Deliverables

1. **`src/lib/supabase.js` health flag** — export `supabaseReady` and a `checkConnection()` helper that does a trivial `supabase.from('offerings').select('id').limit(1)` and returns `{ ok, error }`.

2. **Public-page offline state** — in `useFirestore.js`, distinguish "empty table" from "query failed": on error, set an `offline` state so `Properties`/`VirtualOffice` show a small "Listing temporarily unavailable" notice while still rendering gracefully. Keep current fallback behavior for empty-but-successful reads.

3. **Admin "not configured" banner** — in `AdminLayout`, if `!supabaseReady`, render a dismissible red banner: "Supabase backend not configured — set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local`." So a fresh checkout self-diagnoses.

4. **Chatbot/Blogs/Careers error safety** — `Blogs.jsx`/`Careers.jsx` use `.then()` without `.catch()`; add `.catch(() => {})` so a network error leaves state null and the hardcoded fallback renders instead of an unhandled rejection.

### Acceptance
- With keys removed from `.env.local`, `pnpm dev` shows the admin banner and public pages still render with fallback content (no uncaught promise rejections).
- With keys present and DB reachable, everything loads live data.
- Console remains error-free in both states.

---

## Phase 6 — Verification & Acceptance

Per-touchpoint connectivity checklist (after Phases 1-5):

- [ ] `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` present in `.env.local`; service key present but **not** in any `src/` file.
- [ ] `node server/contact.js` logs `Supabase configured` (no WARN).
- [ ] `supabase db push` succeeds; all 8 tables + 2 buckets exist.
- [ ] `pnpm setup-admin` creates an owner and seeds content.
- [ ] Public `/properties` reads `offerings` live; empty table -> empty grid (not error); DB down -> fallback/offline notice.
- [ ] Public `/blogs`, `/careers`, chatbot read live with hardcoded fallback on empty/error.
- [ ] `/admin/login` -> sign in -> dashboard shows real KPIs from Supabase.
- [ ] Properties CRUD: create/edit/archive/restore reflected on the public site.
- [ ] Contact form -> `inquiries` row + email.
- [ ] Leads pipeline, Blogs/Jobs/Chatbot managers, Users (role/active/invite), Activity Log, Settings all read/write Supabase.
- [ ] Image upload to `listing-images`/`blog-images` returns a public URL that renders.
- [ ] **RLS security test:** logged out, `supabase.from('inquiries').select()` returns empty/error; `supabase.from('activity_log').select()` returns empty; cannot write any admin table.
- [ ] **Service-key leak test:** grep the `dist/` build for the service key -> 0 hits; no `VITE_`-prefixed service key anywhere.
- [ ] Vercel deploy: `/api/contact` + `/api/admin/*` work; SPA routing intact.
- [ ] `pnpm build` green; no console errors on any route.

---

## Appendix

### A. Commands
```bash
pnpm install                 # install dotenv if added
cp .env.example .env.local   # then fill in real values
supabase link --project-ref ldtavdybcgwjgticrymz
supabase db push             # apply schema / migrations
pnpm setup-admin             # create owner + seed fallback content
pnpm dev:all                 # Vite :3000 + API server :3001
# open http://localhost:3000  and  http://localhost:3000/admin/login
```

### B. Troubleshooting
| Symptom | Likely cause | Fix |
|----------|--------------|-----|
| `Missing VITE_SUPABASE_URL` in console | keys not in `.env.local` | add vars (Phase 1) |
| `Supabase not configured` server WARN | Node not loading env | add `dotenv` (Phase 1) |
| `/api/admin/seed-content` 404 | route missing | implement (Phase 3) |
| Contact works locally, 404 on Vercel | no serverless fn | add `api/` functions (Phase 4) |
| Public page "No properties" but DB has rows | RLS `is_published`/`deleted_at` filter | check row flags |
| Admin 401 on server calls | token not sent | inject Bearer token in `adminApi.js` (Phase 3) |
| `setup-admin` fails: relation missing | schema not applied | run `supabase db push` (Phase 2) |

---

## Out of Scope (follow-ups, not now)
- Consuming `site_settings` inside public `Home.jsx`/`Footer.jsx`.
- LLM-backed insights (the `VITE_INSIGHTS_API_URL` seam stays ready).
- Realtime subscriptions for leads (currently one-shot reads).
- Drag-and-drop kanban / WYSIWYG blog editor.
