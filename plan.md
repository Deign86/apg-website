# Plan — Restore the Chatbot LLM Integration (NVIDIA NIM) After Supabase Migration

> **Repo:** `C:\Users\Deign\Downloads\Original APG Website` (branch `main`)
> **Sibling repo (shares the same Supabase project):** `C:\Users\Deign\Downloads\APG Prototype System for Automated Posting`
> **Scope:** Bring back the LLM-powered chatbot in the public site chat widget. The chatbot currently
> only returns canned keyword replies because the NVIDIA NIM call is being short-circuited.
> **Symptom:** Chatbot answers, but with keyword fallback instead of LLM responses — started right
> after the Supabase project was migrated.

---

## 0. Root Cause

The chatbot LLM path is intact in code. It is **gated off at runtime** because `NVIDIA_API_KEY`
is no longer visible to the server:

`server/ai.js` → `handleAiChat()`:
```js
if (!nvidiaConfigured()) {                       // !!process.env.NVIDIA_API_KEY
  return { status: 503, data: { message: 'AI not configured', fallback: true } };
}
```
`src/components/Chatbot.jsx`:
```js
const result = await aiChat(txt, history, { sessionId });
if (result.content) { /* show LLM reply */ }
else { /* keyword fallback — what we are seeing now */ }
```

Contributing factors, in order of likelihood:
1. **`NVIDIA_API_KEY` missing in the server runtime** (Vercel env vars + local `.env.local`).
   `.env.local` was overwritten by the Vercel CLI and now holds only `VERCEL_OIDC_TOKEN`.
2. **Supabase URL/keys not updated** to the new migrated project (affects live context quality).
3. **New Supabase project has no schema/data** — migrations not re-applied; `chatbot_kb`,
   `site_settings`, `offerings` empty.
4. **`chat_logs` table not in `supabase/migrations/`** (only in `scripts/migrate.sql`) →
   admin chat-log panel is empty after a fresh DB.
5. **Possible stale `NVIDIA_MODEL`** (`stepfun-ai/step-3.7-flash`) → 404 → fallback.

---

## 1. Call Flow (reference)

```
Browser (Chatbot.jsx) -- aiChat() -- POST /api/ai/chat -------------------------+
                                                                                |
   Vercel prod: api/ai/[...path].js -+                                          |
   Local dev:    server/contact.js  -+-- handleAiChat() in server/ai.js         |
                                           |                                   |
                                           +- nvidiaConfigured()? -- NO -- 503 fallback
                                           +- buildBusinessContext(supabase)  (service-role, bypasses RLS)
                                           +- nvidiaChat() -- integrate.api.nvidia.com/v1/chat/completions
                                           +- insert chat_logs (fire-and-forget)
```

### Shared server module: `server/ai.js`
- `nvidiaConfigured()` — checks `process.env.NVIDIA_API_KEY` exists
- `nvidiaChat(messages, opts)` — raw NVIDIA call via `fetch`, returns content string
- `buildBusinessContext(supabase)` — fetches live Supabase data (settings, offerings, jobs, blogs, KB)
- `formatBusinessContext(ctx)` — assembles the system prompt
- `handleAiChat()` — public chatbot; `handleAiInsights()` — admin dashboard narrative; `handleAiLead()` — admin lead analysis

### Files in the current call path (already correct, no rewrite needed)
| File | Role |
|---|---|
| `src/components/Chatbot.jsx` | Public chat widget; calls `aiChat()`; falls back to keyword reply |
| `src/lib/ai.js` | Client wrappers: `aiChat()`, `aiInsights()`, `aiLead()` (admin routes attach Bearer token) |
| `api/ai/[...path].js` | Vercel serverless catch-all for `/api/ai/*` |
| `server/ai.js` | Shared NVIDIA NIM helpers + three route handlers (server-only) |
| `server/contact.js` | Local dev Node http server on `:3001`; proxies `/api/ai/*` to `server/ai.js` |
| `vite.config.js` | Dev proxy: `/api/ai` -> `http://localhost:3001` |

---
## 2. Phase 1 — Diagnose (confirm before fixing)

- [ ] **Prod endpoint probe:**
  `curl -X POST https://<site-url>/api/ai/chat -H "Content-Type: application/json" -d "{\"message\":\"hello\",\"history\":[]}"`
  - `503 {"message":"AI not configured"}` -> confirms #1 (NVIDIA key missing on Vercel).
  - `502 {"message":"AI request failed"}` -> key present but NVIDIA call fails (#5 model, or network).
  - `200 {"content":"..."}` -> LLM actually works; issue is elsewhere (client/RLS).
- [ ] **Vercel env audit:** Project -> Settings -> Environment Variables. Confirm presence + correct
  values of: `NVIDIA_API_KEY`, `NVIDIA_MODEL`, `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `RESEND_API_KEY`, `COMPANY_EMAIL`, `VITE_INSIGHTS_API_URL`.
- [ ] **Supabase project audit:** new project URL/keys; run in SQL editor:
  `select table_name from information_schema.tables where table_schema='public' order by table_name;`
  — expect `offerings, profiles, inquiries, blog_posts, job_openings, chatbot_kb, site_settings,
  activity_log, chat_logs, ...`. Note any missing.
- [ ] **KB/seed audit:** `select count(*) from chatbot_kb; select count(*) from site_settings;`
- [ ] **Local repro:** `pnpm dev:all`, open chatbot, watch `server/contact.js` console for
  `AI not configured` vs `NVIDIA API 4xx`.

---

## 3. Phase 2 — Restore environment variables

### Production (Vercel) — BOTH repos share the Supabase project, so update both Vercel projects
- [ ] Website Vercel project: set/replace
  - `NVIDIA_API_KEY` = valid key from https://build.nvidia.com (regenerate if lost)
  - `NVIDIA_MODEL` = `stepfun-ai/step-3.7-flash` (or a known-good NIM model; see Phase 5)
  - `VITE_SUPABASE_URL` = new project URL
  - `VITE_SUPABASE_ANON_KEY` = new project anon key
  - `SUPABASE_SERVICE_ROLE_KEY` = new project service-role key (SENSITIVE — never `VITE_` prefix)
  - `VITE_INSIGHTS_API_URL` = `/api/ai/insights`
  - `RESEND_API_KEY`, `COMPANY_EMAIL` (if used)
  - Apply to **Production**, **Preview**, and **Development** scopes; redeploy.
- [ ] Posting Desk Vercel project: update `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY` to the new project (desk tables live in the same DB).

### Local
- [ ] Rebuild `C:\Users\Deign\Downloads\Original APG Website\.env.local` from `.env.example`
  with real values for ALL keys above (do NOT commit — it is git-ignored).
- [ ] Rebuild the Desk repo's `.env.local` similarly.

> **Security:** `NVIDIA_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` must NEVER have a `VITE_` prefix
> and must NEVER be committed. Verify `.gitignore` already covers `.env`, `.env.local`, `.env*.local`
> (it does).

### Env vars reference
| Variable | Where | Purpose |
|---|---|---|
| `NVIDIA_API_KEY` | `.env.local` / Vercel | Server-side NVIDIA NIM key. NO `VITE_` prefix. |
| `NVIDIA_MODEL` | `.env.local` / Vercel | Optional override. Default: `stepfun-ai/step-3.7-flash` |
| `VITE_SUPABASE_URL` | `.env.local` / Vercel | New migrated project URL (client + server) |
| `VITE_SUPABASE_ANON_KEY` | `.env.local` / Vercel | New project anon key (client) |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` / Vercel | New project service-role key (server only) |
| `VITE_INSIGHTS_API_URL` | `.env.local` / Vercel | `/api/ai/insights` |
| `RESEND_API_KEY` | `.env.local` / Vercel | Contact form email (server only) |
| `COMPANY_EMAIL` | `.env.local` / Vercel | Inbound contact destination |

---
## 4. Phase 3 — Restore Supabase schema + seed data (shared DB)

- [ ] Apply all migrations to the new project from the Website repo:
  `supabase db push` (or run `0001`->`017` + `1000/1001` in order via SQL editor).
  This recreates `offerings, profiles, inquiries, blog_posts, job_openings, chatbot_kb,
  site_settings, activity_log, chat_sessions, chat_messages`, RLS, triggers, buckets, storage policies.
- [ ] **Promote `chat_logs` into a real migration** (currently only in `scripts/migrate.sql`).
  New file `supabase/migrations/0018_chat_logs.sql` containing the `chat_logs` DDL + indexes + RLS
  policy from `scripts/migrate.sql:161-176`, so `db push` creates it and the admin ChatbotTrainer
  log panel works:
  ```sql
  create table if not exists public.chat_logs (
    id uuid primary key default gen_random_uuid(),
    session_id text,
    user_identifier text,
    role text not null check (role in ('user','assistant','system')),
    content text not null,
    model text,
    created_at timestamptz not null default now()
  );
  create index if not exists idx_chat_logs_created_at on public.chat_logs(created_at desc);
  create index if not exists idx_chat_logs_session on public.chat_logs(session_id);
  alter table public.chat_logs enable row level security;
  create policy "chat_logs_admin_read" on public.chat_logs
    for select using (public.is_admin());
  -- service-role inserts bypass RLS
  ```
- [ ] Seed required tables (run `node scripts/setup-admin.cjs` or hit `POST /api/admin/seed`):
  `chatbot_kb`, `site_settings`, `offerings`, `job_openings`, `blog_posts`, and an admin user.
- [ ] **RLS gap fix:** `chatbot_kb` and `site_settings` have no public SELECT policy in
  `003/005_rls_*.sql`. The client `loadKB()` reads `chatbot_kb` with the anon key. Add to a new
  migration `supabase/migrations/0019_public_read_kb_settings.sql`:
  ```sql
  create policy "chatbot_kb_public_read" on public.chatbot_kb
    for select using (active = true);
  create policy "site_settings_public_read" on public.site_settings
    for select using (true);
  ```
  (Server context build uses the service role and bypasses RLS, so the LLM works regardless —
  but this fixes the keyword-fallback KB load and the admin Settings page.)

---

## 5. Phase 4 — Harden so this can not silently regress

- [ ] Add `GET /api/ai/health` to `api/ai/[...path].js` + `server/contact.js` returning
  `{ nvidiaConfigured: bool, model, supabase: bool }` (no secrets). Lets the admin see WHY the
  LLM is off without digging through logs.
- [ ] In `src/routes/admin/ChatbotTrainer.jsx`, surface an "AI status" badge (configured / not
  configured / last error) by calling `/api/ai/health`.
- [ ] In `server/ai.js` `nvidiaChat()`, on a 404/400 model error, retry once with a documented
  fallback model (e.g. `meta/llama-3.1-8b-instruct`) before giving up — protects against model
  deprecation (#5).
- [ ] In `handleAiChat()`, log `chat_logs` insert failures to console (currently fully swallowed
  by `.catch(() => {})`) so a missing table is visible.
- [ ] Confirm `vercel.json` rewrite `"/(.*)"` -> `/index.html` does **not** shadow `/api/ai/*`
  (Vercel serves `api/` functions before rewrites — verify with the Phase 1 curl).

---
## 6. Phase 5 — Verify

- [ ] `pnpm install && pnpm build` green.
- [ ] `pnpm dev:all` -> chatbot: type "Do you have any properties in Makati?" -> expect an LLM
  answer referencing live listings, NOT the canned keyword reply.
- [ ] `server/contact.js` console shows no `AI not configured` / `NVIDIA API 4xx`.
- [ ] Admin -> ChatbotTrainer "Test" works in AI mode; "AI status" badge = configured.
- [ ] Admin -> ChatbotTrainer log panel shows rows in `chat_logs` after a chat.
- [ ] Admin -> Dashboard "AI Analysis" narrative loads; Leads -> "AI Analysis" returns
  `{summary, nextAction, suggestedReply}`.
- [ ] Prod deploy -> repeat the curl + live chatbot test on the deployed URL.
- [ ] **Negative test:** temporarily remove `NVIDIA_API_KEY` -> chatbot gracefully falls back to
  keyword replies; no console errors; no crash.
- [ ] No `nvapi-` / `NVIDIA_API_KEY` string in `dist/assets/*.js` (key stays server-side):
  `Select-String -Path dist\assets\*.js -Pattern "nvapi-|NVIDIA_API_KEY"` -> 0 hits.

---

## 7. Files Touched

| File | Change |
|---|---|
| `.env.local` (git-ignored) | Restore all real secrets (local dev) |
| Vercel project env vars (Website + Desk) | Add/update `NVIDIA_API_KEY`, `NVIDIA_MODEL`, Supabase keys |
| `supabase/migrations/0018_chat_logs.sql` | NEW — promote `chat_logs` DDL into migrations |
| `supabase/migrations/0019_public_read_kb_settings.sql` | NEW — anon SELECT policies for `chatbot_kb` + `site_settings` |
| `api/ai/[...path].js` | Add `GET /api/ai/health`; keep routes |
| `server/contact.js` | Add `/api/ai/health` route (dev parity) |
| `server/ai.js` | Export `aiHealth()`; fallback-model retry; surface log-insert errors |
| `src/routes/admin/ChatbotTrainer.jsx` | Add "AI status" badge via `/api/ai/health` |
| `scripts/migrate.sql` | (Optional) leave as-is or note it is superseded by `0018` |

No client-side change to `Chatbot.jsx` / `src/lib/ai.js` is required — the call path is correct.

---

## 8. Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| Chatbot returns canned keyword replies (LLM "disappeared") | `NVIDIA_API_KEY` missing in server runtime | Set it in Vercel env + `.env.local`; redeploy / restart `dev:all` |
| `503 {"message":"AI not configured"}` from `/api/ai/chat` | Same as above | Same as above |
| `502 {"message":"AI request failed"}` | NVIDIA API call rejected (bad key / model / network) | Check server logs for `NVIDIA API 4xx`; rotate key; verify model name |
| LLM answers but with no property/KB context | Supabase URL/key wrong or service-role missing | Re-check `VITE_SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` in server env |
| Admin ChatbotTrainer log panel empty | `chat_logs` table missing in new DB | Run new `0018_chat_logs.sql` migration |
| `chatbot_kb` returns nothing to the browser | No public SELECT RLS policy on `chatbot_kb` | Run new `0019_public_read_kb_settings.sql` migration |
| `NVIDIA API 404` in server logs | Model name deprecated | Set a known-good `NVIDIA_MODEL` (Phase 4 fallback retry covers this) |
| Dashboard "Unauthorized" on AI section | Auth session expired | Log out and back into admin |

---

## 9. Out of Scope (future)
- Streaming chat responses
- Multi-model fallback chain / cost controls
- Thumbs-up/down feedback on AI replies
- Migrating chat history from the old Supabase project (if any existed)
