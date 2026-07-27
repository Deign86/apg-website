# Supabase + Vercel End-to-End Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the APG Website’s public site, admin panel, contact workflow, AI workflow, asset workflow, and Supabase data layer work end to end locally and on the production Vercel deployment.

**Architecture:** Supabase is the single source of truth for PostgreSQL, Auth, RLS, and Storage. The browser uses only the anon key for public reads and RLS-protected admin CRUD; server-only Vercel functions use the service-role key for contact persistence/email, AI context, invitations, and private asset URLs. Local development and Vercel must execute the same route handlers so behavior cannot drift.

**Tech Stack:** Vite 5, React 18, React Router 6, Node ESM serverless handlers, `@supabase/supabase-js`, Supabase migrations/RLS/Storage, Vercel Functions, Resend, NVIDIA NIM, Node’s built-in test runner.

---

## Current Evidence and Constraints

- The repository contains both the legacy Firebase files and the active Supabase implementation. Do not re-enable Firebase; remove only dead references after the Supabase path is verified.
- Client configuration is read from `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `src/lib/supabase.js`. Server functions read `VITE_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` from `process.env`; the service key must never enter `src/` or `dist/`.
- Local API execution is `server/contact.js` on port `3001`, proxied by `vite.config.js`. Production execution is split across `api/contact.js`, `api/admin/[...path].js`, `api/ai/[...path].js`, and `api/assets/*`.
- The production build currently succeeds (`719` modules transformed). Keep the existing Vite stack and avoid adding a test framework unless the built-in Node runner cannot cover a required case.
- The documented URL `https://apg-website-alpha-deign86s-projects.vercel.app` currently returns Vercel’s `Login – Vercel` HTML and Next.js assets for `/` and `/api/*`, so it is not currently serving this Vite deployment or its API functions. Treat deployment protection/project aliasing as an explicit blocker to resolve and verify.
- The shared Supabase project reference documented by the repo is `ldtavdybcgwjgticrymz`. Confirm it against the Vercel project before changing data or applying migrations.

## Implementation Changes

### Task 1: Establish a single runtime configuration contract

**Files:**
- Modify: `src/lib/supabase.js`
- Create: `server/config.js`
- Modify: `api/_supabase.js`, `server/contact.js`, `api/contact.js`, `api/admin/[...path].js`, `api/ai/[...path].js`, `api/assets/signed-url.js`, `api/assets/public-meta.js`
- Modify: `.env.example`

- [ ] Define one server configuration reader that validates `VITE_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and optional `RESEND_API_KEY`, `COMPANY_EMAIL`, `NVIDIA_API_KEY`, and `NVIDIA_MODEL`. It must return configuration status without logging secret values and must fail closed for privileged routes.
- [ ] Make all Vercel handlers import the shared Supabase client/config module. Keep `VITE_SUPABASE_ANON_KEY` client-only and reject any service key accidentally exposed through Vite build inputs.
- [ ] Preserve the existing local `.env.local` override behavior, but document that Vercel variables must be set independently for Production, Preview, and Development.
- [ ] Add a non-secret configuration report used by health checks: Supabase URL host, whether anon/service keys are present, whether Resend/NVIDIA are configured, and the selected model.
- [ ] Add a guard script that scans `src/` and built assets for `SUPABASE_SERVICE_ROLE_KEY`, JWT service-role markers, `NVIDIA_API_KEY`, and `nvapi-`; the expected result is zero matches.

### Task 2: Make local and Vercel route behavior identical

**Files:**
- Modify: `server/http.js`, `server/contact.js`, `server/ai.js`
- Modify: `api/contact.js`, `api/admin/[...path].js`, `api/ai/[...path].js`
- Modify: `vite.config.js`
- Create: `scripts/verify-api-contracts.mjs`

- [ ] Extract shared request parsing, JSON response headers, CORS policy, auth/profile verification, and error serialization so local and Vercel handlers use the same code paths.
- [ ] Normalize admin authorization to the canonical roles from migration `015_unified_roles.sql`: `owner` and `admin` can administer users; `editor`/`staff` can use only the RLS-protected operations intended for them; inactive profiles are rejected.
- [ ] Ensure every privileged route returns consistent status codes: `400` invalid input, `401` missing/invalid bearer token, `403` insufficient role, `404` unknown route/resource, `503` missing server configuration, and `500` unexpected dependency failure.
- [ ] Ensure the contact endpoint always validates input before persistence, reports Supabase insert failures instead of silently claiming success, and treats email delivery as a separate observable result.
- [ ] Ensure `/api/ai/health` is implemented in local and Vercel runtimes and returns only non-secret status. Ensure `/api/ai/chat`, `/api/ai/insights`, and `/api/ai/lead` use the same NVIDIA/Supabase context and authorization rules.
- [ ] Ensure `/api/assets/signed-url` requires an authenticated staff/admin session and `/api/assets/public-meta` only returns metadata for public assets.
- [ ] Add contract checks that invoke each route with valid, invalid, and missing-auth requests against the local handler and assert matching status/body shapes.

### Task 3: Reconcile and verify the Supabase schema, RLS, and Storage

**Files:**
- Review/modify: `supabase/migrations/*.sql`
- Review/modify: `supabase/schema.sql`
- Create: `supabase/migrations/0025_e2e_backend_guards.sql`
- Create: `scripts/verify-supabase.mjs`

- [ ] Link the repository to project ref `ldtavdybcgwjgticrymz` and run the migration status command before applying changes. Do not run destructive drops.
- [ ] Verify all tables used by the UI/API exist: `profiles`, `offerings`, `inquiries`, `job_openings`, `blog_posts`, `site_settings`, `chatbot_kb`, `chat_logs`, `activity_log`, `assets`, `property_asset_relations`, `import_batches`, `import_file_mappings`, and the shared posting-desk tables.
- [ ] Verify the migrations that create `chat_logs` and public-read policies for active `chatbot_kb` and `site_settings` are applied to the remote database, not merely present locally.
- [ ] Verify RLS policies for public reads, authenticated admin/editor writes, staff asset access, owner/admin user management, and inquiry confidentiality. Add only the missing policies in `0025_e2e_backend_guards.sql` with idempotent `create policy`/guarded SQL.
- [ ] Verify Storage buckets `apg-public` and `apg-private`, object path conventions, public-read policy, and staff-only private access. Confirm no client page requires a service-role key to render a public asset.
- [ ] Run `scripts/verify-supabase.mjs` with service-role credentials. It must check schema tables, policy presence, bucket presence, representative read/write permissions, and row counts without printing secrets.
- [ ] Seed or confirm the minimum production data needed for an E2E run: one published offering with a public asset relation, one active job, one published blog, contact settings, one active chatbot KB row, and one test admin profile. Use existing seed scripts; do not hard-code credentials in the repository.

### Task 4: Close frontend-to-backend gaps

**Files:**
- Review/modify: `src/context/AuthContext.jsx`, `src/lib/adminApi.js`, `src/hooks/useFirestore.js`, `src/hooks/usePropertyGallery.js`
- Review/modify: `src/routes/Properties.jsx`, `src/routes/VirtualOffice.jsx`, `src/routes/Contact.jsx`, `src/routes/Careers.jsx`, `src/routes/Blogs.jsx`
- Review/modify: `src/routes/admin/*.jsx`, `src/components/Chatbot.jsx`, `src/lib/ai.js`, `src/lib/logActivity.js`

- [ ] Replace silent query failures with a shared error/loading contract that renders an actionable state and logs a correlation-safe error. Do not fall back to fake success for writes.
- [ ] Confirm auth session restoration, sign-in, sign-out, password reset, inactive-profile rejection, and route protection all use the same Supabase project and canonical roles.
- [ ] Confirm every public query has a matching anon RLS policy and every admin mutation either uses RLS directly or the authenticated server API; remove any route that assumes Firebase collections or legacy JSON fields as its only data source.
- [ ] Confirm property gallery reads canonical asset relations first, gracefully handles missing/archived assets, and uses signed URLs only for private objects.
- [ ] Confirm contact form success is shown only after the API returns a successful persistence result; expose the returned ticket ID for support follow-up.
- [ ] Confirm admin CRUD pages refresh after mutations, surface Supabase errors, and write activity-log records where the schema requires them.
- [ ] Confirm chatbot fallback is deliberate: API/configuration failures may use the public KB fallback, but admin AI actions must show an error rather than fabricate analysis.

### Task 5: Repair Vercel project wiring and environment

**Files:**
- Modify: `vercel.json`
- Review/modify: `package.json`, `vite.config.js`
- Create: `scripts/verify-vercel.mjs`

- [ ] Inspect the Vercel project linked by `.vercel/project.json` (`apg-website-alpha`) and identify whether the documented URL is protected, points to the wrong deployment, or is an alias for another project. Production traffic must resolve to the Vite build from this repository.
- [ ] Configure the production domain/alias to serve this project and either disable deployment protection for the public production domain or document the authenticated probe required for protected previews. A public health check must never receive `Login – Vercel` HTML.
- [ ] Keep API functions ahead of the SPA fallback. Verify `/api/contact`, `/api/ai/health`, `/api/ai/chat`, `/api/admin/stats`, and `/api/assets/public-meta` reach functions and never return `index.html`.
- [ ] Set Vercel environment variables for all required scopes: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `COMPANY_EMAIL`, `NVIDIA_API_KEY`, `NVIDIA_MODEL`, and `VITE_INSIGHTS_API_URL=/api/ai/insights`. Keep Google/Drive credentials out of the browser and out of Vercel unless a server job explicitly needs them.
- [ ] Redeploy after environment changes and record the resulting production deployment URL and commit SHA in the verification output.
- [ ] `scripts/verify-vercel.mjs` must fetch the production root and API endpoints, assert the root contains the Vite app (not Vercel login HTML), assert JSON content types for APIs, validate health status shape, and run unauthenticated negative tests without exposing response secrets.

### Task 6: Add end-to-end verification and release gates

**Files:**
- Create: `scripts/e2e-smoke.mjs`
- Create: `scripts/verify-env.mjs`
- Modify: `package.json`
- Modify: `MANUAL_TESTING.md`

- [ ] Add scripts:
  - `pnpm verify:env` — validates required variable names/presence and scans for secret exposure.
  - `pnpm verify:supabase` — validates remote schema/RLS/Storage/data prerequisites.
  - `pnpm verify:api` — runs local route contract tests.
  - `pnpm verify:vercel` — probes the production deployment.
  - `pnpm verify:e2e` — runs the complete smoke sequence.
- [ ] Run `pnpm build` and the secret scan; expected build is green and secret scan has zero matches.
- [ ] Run the local workflow against `http://localhost:3000`: public home/properties/careers/blog pages load data from Supabase; contact creates an inquiry; chatbot health/chat works or shows the documented fallback; admin login protects `/admin`; admin dashboard, CRUD, asset upload, and logout work.
- [ ] Run the production workflow against the corrected Vercel URL: repeat the same public/API/auth checks, verify inquiry row creation and ticket response, verify asset URLs, verify AI health/chat behavior, and verify admin-only endpoints reject anonymous calls.
- [ ] Add negative tests for missing client env, missing service key, expired bearer token, inactive profile, invalid contact payload, private asset access, unknown API route, and Vercel SPA/API rewrite regression.
- [ ] Update `MANUAL_TESTING.md` with the exact environment setup, test account requirements, expected status codes, and cleanup steps for test inquiries/assets.

Run the release gate from PowerShell in this order; each command must exit `0` before the next one runs:

```powershell
pnpm install --frozen-lockfile
pnpm build
pnpm verify:env
pnpm verify:supabase
pnpm verify:api
pnpm verify:vercel
pnpm verify:e2e
```

Expected results are: Vite reports a successful production build; the secret scan reports zero matches; Supabase verification reports the canonical project ref and all required tables/buckets/policies; API verification reports matching local contracts; Vercel verification reports the Vite app and JSON API content types; and the E2E script reports successful public, contact, auth, admin, asset, and AI checks.

## Acceptance Criteria

- `pnpm build`, `pnpm verify:env`, `pnpm verify:supabase`, `pnpm verify:api`, and `pnpm verify:e2e` pass from a clean checkout with documented environment variables.
- The production root serves this Vite app, not Vercel’s login page, and every `/api/*` probe returns the intended JSON response rather than `index.html`.
- Supabase URL/project ref is identical for local client, local server, Vercel client build, and Vercel server functions; the browser bundle contains no service-role or AI secret.
- Public reads work with the anon key; admin writes and private assets enforce RLS/auth; contact inquiries persist; AI context/logging works; and failures are visible and actionable.
- The E2E run records deployment URL, commit SHA, Supabase project ref/host, endpoint status codes, and data verification results without recording secret values.

## Rollout and Rollback

- Apply additive SQL migrations first, verify with the Supabase script, then deploy the application. Keep old columns/buckets until the canonical asset path has passed one production verification cycle.
- Deploy to a Vercel preview, run the full smoke suite, then promote to production and repeat the probes. Do not change Supabase keys and deploy code in an unverified single step.
- If a production probe fails, roll back the Vercel deployment to the last known-good build. Revert only additive application/config changes; do not roll back applied database migrations destructively. Disable new feature paths through environment/configuration while investigating.

## Essential Files

- `src/lib/supabase.js`, `src/context/AuthContext.jsx`, `src/lib/adminApi.js`
- `server/config.js`, `server/http.js`, `server/contact.js`, `server/ai.js`
- `api/contact.js`, `api/admin/[...path].js`, `api/ai/[...path].js`, `api/assets/signed-url.js`, `api/assets/public-meta.js`
- `supabase/migrations/*.sql`, `supabase/config.toml`, `.env.example`, `vercel.json`, `vite.config.js`

## Execution Record (2026-07-26)

- Implemented shared server configuration and explicit Vercel API entrypoints for AI and admin routes; removed non-working catch-all function routing.
- Applied `supabase/migrations/0025_e2e_backend_guards.sql` to project `ldtavdybcgwjgticrymz` through `supabase db query --linked` and repaired only migration version `0025` as applied. The remote database already contained the earlier policies/buckets; the migration also reconciles the legacy `inquiries` schema with the fields used by the application.
- Deployed production `apg-website-alpha` and removed project SSO protection that was returning Vercel login HTML. The public aliases now serve the Vite app and JSON API responses.
- Passing gates: `pnpm build`, `pnpm verify:env`, `pnpm verify:api`, `pnpm verify:supabase`, `pnpm verify:vercel`, and `pnpm verify:e2e` against both local and production URLs. A real production contact inquiry was persisted and cleaned up; a real CEO chatbot request returned successfully and produced `chat_logs` rows.
- Final production deployment: `https://apg-website-alpha-mfxrxx2u5-deign86s-projects.vercel.app` (Ready). Public alias verification also confirms the flat admin endpoints return the expected unauthenticated `401` responses.
- Operational caveat: the Supabase project still has historical migration versions (`001`, `002`, `005`, etc.) whose old filenames do not exist locally. Future `supabase db push` runs will require a deliberate migration-history reconciliation; do not mark those versions reverted or re-run them automatically.
