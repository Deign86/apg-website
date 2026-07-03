# Plan — Alpha Premier Group Admin Panel (CMS + AI-Powered Sales Dashboard)

> **Executor:** DeepSeek V4 Flash
> **Repo:** `C:\Users\Deign\Downloads\Original APG Website` (branch `main`)
> **Goal:** Build a complete, secure admin panel for the Alpha Premier Group website — content management for property listings, blogs, careers, and leads, plus an AI-powered analytics/sales dashboard — using the existing Vite + React + Supabase stack.
> **Golden rule:** Do NOT touch the public site's behavior or routes. The admin panel lives under `/admin/*` with its own layout (no public Header/Footer/Chatbot). Public pages may gain Supabase data sources but must keep working with their current hardcoded fallbacks.

---

## 0. Mission & Guardrails

1. Preserve the existing stack: Vite 5 + React 18 + React Router 6 + react-helmet-async + AOS + Supabase (data) + Resend (contact email) + pnpm.
2. **ONE** new dependency allowed: `recharts` (`^2`, React-friendly charts for the dashboard). Do not add any other library.
3. Admin routes use a separate `AdminLayout` (sidebar + topbar, dark/gold theme) — NOT the public `Layout` (no site Header/Footer/Chatbot on admin pages).
4. Never expose the Supabase service-role key to the client. Admin writes go through Supabase RLS policies enforced by the authenticated user's role. The service-role key is used **server-side only** (`server/contact.js` + `server/admin-api.js`).
5. Match the brand: dark (`#0a0a0a`/`#000`) + gold (`#c5a059`), Poppins/Orbitron, Font Awesome 6. Admin panels may use a slightly lighter dark surface (`#111`/`#1a1a1a`) — keep gold accents.
6. Every change keeps `pnpm build` green and the browser console error-free.
7. Commit per phase: `feat: admin — <phase summary>` (e.g. `feat: admin — auth + protected routes`).
8. Keep all legacy reference files (`*.html`, `*.php`, `.old_site/`) untouched.
9. Public pages (`/`, `/properties`, `/virtual-office`, `/careers`, `/blogs`, `/contact`, `/subsidiaries/*`) must keep working exactly as today. Where a public page is wired to new Supabase data (Blogs, Careers, Chatbot), keep the current hardcoded content as a fallback when the table is empty or the query fails.

---

## 1. Tech Stack (preserve + 1 addition)

- Build/runtime: unchanged (Vite, React 18, RR6 BrowserRouter, react-helmet-async, AOS, pnpm). Alias `@` -> `./src`.
- Data: Supabase — extend the schema (Section 4). Public read; admin write via RLS keyed on `profiles.role`.
- Auth: Supabase Auth (email/password) + a `profiles` table holding `role` (`owner` | `admin` | `editor`).
- Charts: `recharts@^2` — the single allowed new dependency. Compatible with React 18 + Vite 5.
- Storage: Supabase Storage buckets `listing-images` and `blog-images` for uploads.
- Server: extend `server/contact.js` so every inquiry is also persisted to the new `inquiries` table (server-side, service-role key). Add `server/admin-api.js` for any server-side admin action that must use the service key (e.g. user role changes).
- Scripts: implement `scripts/setup-admin.cjs` (already wired in `package.json` as `pnpm setup-admin`) to create the first admin user + run `supabase/schema.sql` notes + seed fallback content.

---

## 2. Architecture & Route Map

`src/App.jsx` gets a second top-level route branch (NOT nested under the public `<Layout/>`). Public routes stay exactly as they are today.

```
/admin/login              -> admin/Login.jsx            (public, no guard)
/admin                   -> AdminLayout + <ProtectedRoute>
  index                  -> admin/Dashboard.jsx
  /admin/properties      -> admin/PropertiesManager.jsx
  /admin/leads           -> admin/Leads.jsx
  /admin/blogs           -> admin/BlogManager.jsx
  /admin/careers         -> admin/CareerManager.jsx
  /admin/chatbot         -> admin/ChatbotTrainer.jsx
  /admin/users           -> admin/Users.jsx            (owner|admin only)
  /admin/activity        -> admin/ActivityLog.jsx
  /admin/settings        -> admin/Settings.jsx
```

The public `Header.jsx` does **not** get an Admin link — admin is reached by direct URL (`/admin/login`). Unknown `/admin/*` paths render an on-brand admin 404.

### File/folder layout to create

```
src/
  context/
    AuthContext.jsx
  components/
    admin/
      AdminLayout.jsx
      Sidebar.jsx
      Topbar.jsx
      ProtectedRoute.jsx
      StatCard.jsx
      DataTable.jsx
      ImageUploader.jsx
      Toast.jsx
      ConfirmDialog.jsx
      StatusPill.jsx
      EmptyState.jsx
  lib/
    supabase.js              # existing client (anon) — keep
    adminApi.js              # fetch helpers to /api/admin/* (server-side service-key ops)
    insights.js              # AI Insights heuristic engine (client-side)
  hooks/
    useFirestore.js          # existing — extend with useBlogs, useJobs, useInquiries, useChatbotKB, useActivity, useSettings, useProfile
    useAdminCrud.js          # generic CRUD wrapper for an admin table
  routes/
    admin/
      admin.css
      Login.jsx
      Dashboard.jsx
      PropertiesManager.jsx
      Leads.jsx
      BlogManager.jsx
      CareerManager.jsx
      ChatbotTrainer.jsx
      Users.jsx
      ActivityLog.jsx
      Settings.jsx
      NotFound.jsx
supabase/
  schema.sql
server/
  contact.js                 # extend to persist inquiries
  admin-api.js               # new: service-key admin endpoints
scripts/
  setup-admin.cjs            # new: bootstrap first admin + schema notes
```

---

## 3. Design System (admin)

Reuse `src/styles/global.css` tokens. Add `src/routes/admin/admin.css`:

- Extra tokens: `--admin-surface:#111; --admin-surface-2:#1a1a1a; --admin-border:#2a2a2a;` alongside existing `--accent:#c5a059` etc.
- **Sidebar:** fixed left, 240px, dark surface, gold active-state bar, Font Awesome icon + label per item, logo at top, logout at bottom; collapses to a drawer below 900px (hamburger in topbar).
- **Topbar:** current page title, global search (filters current table), admin avatar + role badge, "View site" link (opens `/` in new tab), logout button.
- **Cards/tables:** dark surface, gold header text, hover row highlight, status pills (gold=featured, green=available/active/won, blue=contacted, red=closed/inactive/lost, grey=draft/new).
- **Forms:** dark inputs with gold focus ring, gold primary buttons, consistent 16px spacing, inline validation.
- **Responsive:** sidebar -> drawer under 900px; tables -> stacked cards under 640px.
---

## 4. Data Model & Schema (`supabase/schema.sql`)

Create `supabase/schema.sql` — idempotent, runnable in the Supabase SQL editor or via `pnpm setup-admin`. The existing `offerings` table (migrated from legacy MySQL `offerings_cards`) is NOT recreated; only extended. Its current columns are: `id, title, location, property_type, status, price, price_unit, floor_area, lot_area, description, images (JSON array of URL strings), email, phone, admin_id, created_at, updated_at`.

```sql
-- supabase/schema.sql — Alpha Premier Group admin schema (idempotent)

-- ============ PROFILES (auth roles) ============
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  full_name text,
  avatar_url text,
  role text not null default 'editor' check (role in ('owner','admin','editor')),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- Auto-create a profile row whenever a new auth user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', new.email))
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============ EXTEND offerings (existing table) ============
alter table public.offerings
  add column if not exists slug text,
  add column if not exists beds int,
  add column if not exists baths int,
  add column if not exists garage int,
  add column if not exists featured boolean not null default false,
  add column if not exists is_published boolean not null default true,
  add column if not exists deleted_at timestamptz;

-- ============ INQUIRIES (leads pipeline) ============
create table if not exists public.inquiries (
  id uuid primary key default gen_random_uuid(),
  ticket text unique,
  name text not null,
  email text not null,
  phone text,
  subject text,
  message text,
  source text default 'contact_form',
  property_id text,  -- references offerings.id (kept as text to avoid id-type mismatch)
  status text not null default 'new' check (status in ('new','contacted','qualified','won','lost','archived')),
  assigned_to uuid references public.profiles(id) on delete set null,
  notes text,
  lead_score int default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ BLOG POSTS ============
create table if not exists public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  content text,
  category text,
  cover_image text,
  author text,
  status text not null default 'draft' check (status in ('draft','published','archived')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ JOB OPENINGS ============
create table if not exists public.job_openings (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  location text,
  type text,
  tag text,
  description text,
  status text not null default 'active' check (status in ('active','closed','draft')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ CHATBOT KB ============
create table if not exists public.chatbot_kb (
  id uuid primary key default gen_random_uuid(),
  trigger text not null,
  answer text not null,
  keywords text,
  priority int default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ============ ACTIVITY LOG (audit) ============
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity text,
  entity_id text,
  meta jsonb,
  created_at timestamptz not null default now()
);

-- ============ SITE SETTINGS (key/value) ============
create table if not exists public.site_settings (
  key text primary key,
  value text,
  updated_at timestamptz not null default now(),
  updated_by uuid references public.profiles(id) on delete set null
);

-- ============ updated_at trigger for all content tables ============
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

do $$
declare t text;
begin
  foreach t in array array['offerings','inquiries','blog_posts','job_openings','chatbot_kb','site_settings']
  loop
    execute format('drop trigger if exists set_updated_at on public.%I', t);
    execute format('create trigger set_updated_at before update on public.%I for each row execute function public.handle_updated_at()', t);
  end loop;
end $$;

-- ============ STORAGE BUCKETS (public read, staff write) ============
insert into storage.buckets (id, name, public) values ('listing-images','listing-images', true) on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('blog-images','blog-images', true) on conflict (id) do nothing;

-- ============ ROW LEVEL SECURITY ============
alter table public.profiles enable row level security;
alter table public.offerings enable row level security;
alter table public.inquiries enable row level security;
alter table public.blog_posts enable row level security;
alter table public.job_openings enable row level security;
alter table public.chatbot_kb enable row level security;
alter table public.activity_log enable row level security;
alter table public.site_settings enable row level security;

-- Role helpers (security definer, stable)
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('owner','admin') and active);
$$;

create or replace function public.is_staff()
returns boolean language sql stable security definer set search_path = public as $$
  select exists(select 1 from public.profiles where id = auth.uid() and role in ('owner','admin','editor') and active);
$$;

-- PUBLIC READ (the public site reads these without auth)
create policy "public read offerings" on public.offerings for select using (is_published and deleted_at is null);
create policy "public read published blogs" on public.blog_posts for select using (status = 'published');
create policy "public read active jobs" on public.job_openings for select using (status = 'active');
create policy "public read active kb" on public.chatbot_kb for select using (active);
create policy "public read settings" on public.site_settings for select using (true);

-- STAFF READ (sees drafts / soft-deleted / all leads)
create policy "staff read offerings" on public.offerings for select to authenticated using (public.is_staff());
create policy "staff read inquiries" on public.inquiries for select to authenticated using (public.is_staff());
create policy "staff read blogs" on public.blog_posts for select to authenticated using (public.is_staff());
create policy "staff read jobs" on public.job_openings for select to authenticated using (public.is_staff());
create policy "staff read kb" on public.chatbot_kb for select to authenticated using (public.is_staff());
create policy "staff read activity" on public.activity_log for select to authenticated using (public.is_staff());
create policy "staff read profiles" on public.profiles for select to authenticated using (public.is_staff());
create policy "staff read settings" on public.site_settings for select to authenticated using (public.is_staff());

-- STAFF WRITE (content tables)
create policy "staff write offerings" on public.offerings for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff write inquiries" on public.inquiries for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff write blogs" on public.blog_posts for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff write jobs" on public.job_openings for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff write kb" on public.chatbot_kb for all to authenticated using (public.is_staff()) with check (public.is_staff());
create policy "staff write activity" on public.activity_log for insert to authenticated with check (public.is_staff());
create policy "staff write settings" on public.site_settings for all to authenticated using (public.is_staff()) with check (public.is_staff());

-- PROFILES: a user reads/updates only their own; role/active changes go through server/admin-api.js (service key)
create policy "user read own profile" on public.profiles for select to authenticated using (id = auth.uid());
create policy "user update own profile" on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

-- STORAGE policies
create policy "public read listing images" on storage.objects for select using (bucket_id = 'listing-images');
create policy "staff write listing images" on storage.objects for insert to authenticated with check (bucket_id = 'listing-images' and public.is_staff());
create policy "staff delete listing images" on storage.objects for delete to authenticated using (bucket_id = 'listing-images' and public.is_staff());
create policy "public read blog images" on storage.objects for select using (bucket_id = 'blog-images');
create policy "staff write blog images" on storage.objects for insert to authenticated with check (bucket_id = 'blog-images' and public.is_staff());
create policy "staff delete blog images" on storage.objects for delete to authenticated using (bucket_id = 'blog-images' and public.is_staff());
```

### Tables added / changed

| Table | Purpose | Public read | Staff write |
|---|---|---|---|
| `profiles` | auth users + role (owner/admin/editor) | no | self-update; role changes via `server/admin-api.js` |
| `offerings` (extended) | + slug/beds/baths/garage/featured/is_published/deleted_at | published & not deleted | is_staff |
| `inquiries` | leads pipeline (status, assignee, score, notes) | no | is_staff |
| `blog_posts` | blog CMS | published only | is_staff |
| `job_openings` | careers CMS | active only | is_staff |
| `chatbot_kb` | chatbot Q&A trainer | active only | is_staff |
| `activity_log` | audit trail | no | insert only |
| `site_settings` | editable company info / hero copy / socials | yes | is_staff |

### Notes
- The service-role key (`SUPABASE_SERVICE_ROLE_KEY`) is added to `.env.local` (gitignored) and used ONLY in `server/contact.js` and `server/admin-api.js` — never imported by any `src/` file.
- `property_id` on `inquiries` is `text` (not a hard FK) so it works whether the existing `offerings.id` is `uuid` or `int`.
- `images` on `offerings` stays a JSON array of URL strings (already what `Properties.jsx` reads via `p.images[0]`).
---

## 5. AI Insights Engine (`src/lib/insights.js`) — client-side, no API key required

A deterministic heuristic engine that powers the dashboard's "AI Insights" panel and lead scoring. It works out of the box with zero config, and exposes a single async seam (`getInsights`) that can later route to an LLM endpoint via `VITE_INSIGHTS_API_URL` without changing call sites.

### Exported functions

- `scoreLead(inquiry): number` — 0-100. Points: +20 has phone, +15 message length >40 words, +20 inquired about a specific property (`property_id` set), +15 return/known email domain, +10 per buying-intent keyword (`budget`, `urgent`, `invest`, `cash`, `loan`, `schedule`, `viewing`, `down payment`), +10 if `source` is a property detail page. Cap 100.
- `listingStaleness(property): { days, stale }` — days since `updated_at`; `stale` true if >60 days.
- `priceAnomaly(property, allOfSameType): { overpriced, underpriced, z }` — z-score of `price` vs same-`property_type` mean/std; flag if |z| > 2 (and the type has >=4 comps).
- `generateDashboardInsights({ properties, inquiries, since }): Insight[]` — ordered array of `{ id, severity: 'good'|'info'|'warn', icon, title, body }`. Includes: stale listings count, un-contacted leads older than 7 days, top lead highlight, pipeline value of `qualified`+`contacted`, win rate (won/(won+lost)) for the window, inventory-vs-lead share mismatch per `property_type`, fastest-moving type (avg days new->contacted), and any price anomalies.
- `forecastNextMonth(inquiries): { leads, wins }` — simple 3-month moving average of lead volume and wins.
- `async getInsights(state): Promise<{ insights, scored, forecast }>` — if `import.meta.env.VITE_INSIGHTS_API_URL` is set, POST a compact summary (`counts`, `topLead`, `staleIds`, `priceFlags`, `window`) to that endpoint and return its JSON; otherwise return the heuristic result. This is the ONLY function Dashboard.jsx calls.

### Why heuristic-first

No external API key or cost; deterministic and testable; ships immediately. The LLM seam is a one-line env switch later (the posted payload is already LLM-friendly). Document this clearly in a comment at the top of `insights.js`.

---

## 6. Shared Admin Components (`src/components/admin/`)

All brand-styled via `src/routes/admin/admin.css`. Reusable across managers.

| Component | Responsibility | Key props |
|---|---|---|
| `AdminLayout.jsx` | Shell: `<Sidebar/>` + `<Topbar/>` + `<main><Outlet/></main>`; mobile drawer state; renders `<Toast/>` portal. | — (uses `<Outlet/>`) |
| `Sidebar.jsx` | Nav items filtered by `profile.role`; gold active bar; logout at bottom; logo top. | `items`, `onNavigate` |
| `Topbar.jsx` | Page title (from route meta), global search input (filters active table), role badge, avatar, "View site" (`/` new tab), logout. | `title`, `search`, `onSearch` |
| `ProtectedRoute.jsx` | Reads `AuthContext`; if no session -> redirect `/admin/login`; if `requiredRole` not satisfied -> render admin 403. | `requiredRole?: 'owner'|'admin'` |
| `StatCard.jsx` | KPI tile: icon, label, value, optional delta (up/down %). | `icon`, `label`, `value`, `delta` |
| `DataTable.jsx` | Generic table: column config (`key, header, render?, sortable?`), rows, client sort, search, pagination (10/25/50), row action buttons, empty state. | `columns`, `rows`, `actions`, `search` |
| `ImageUploader.jsx` | Drag-drop multi-upload to Supabase Storage (`listing-images`/`blog-images`); preview grid; remove; returns `string[]` of public URLs. | `bucket`, `value`, `onChange`, `max` |
| `Toast.jsx` | Context + portal; `toast.success/error/info(msg)`; auto-dismiss 4s. | provided via `ToastProvider` |
| `ConfirmDialog.jsx` | Modal confirm for destructive actions. | `open`, `message`, `onConfirm`, `onCancel` |
| `StatusPill.jsx` | Maps status string -> color (gold/green/blue/red/grey). | `status`, `map?` |
| `EmptyState.jsx` | Icon + title + subtitle + optional CTA. | `icon`, `title`, `subtitle`, `action?` |

---

## 7. Data Layer & Hooks

### `src/context/AuthContext.jsx`
`AuthProvider` wraps the admin branch (NOT the public `<Layout/>`). Exposes `{ session, profile, loading, signIn(email,password), signOut(), refreshProfile(), hasRole(...roles) }`. On mount, `supabase.auth.getSession()` + `onAuthStateChanged`; after session, fetch `profiles` row for the user. `signIn` uses `supabase.auth.signInWithPassword`. Profile fetch is retried once (the `handle_new_user` trigger may lag a few ms).

### `src/hooks/useFirestore.js` (extend existing — keep `useProperties`/`useVirtualOffices` intact)
Add: `useBlogs({ publishedOnly })`, `useJobs({ activeOnly })`, `useInquiries()`, `useChatbotKB({ activeOnly })`, `useActivity({ limit })`, `useSettings()`, `useProfile(uid)`, and a generic `useAdminList(table, { select, order, eq, limit })`. Each returns `{ data, loading, error, refresh }` and subscribes to relevant Supabase realtime channels where cheap (inquiries, offerings) so the dashboard updates live.

### `src/hooks/useAdminCrud.js`
Generic CRUD for an admin table: `create(table, row)`, `update(table, id, patch)`, `softDelete(table, id)` (sets `deleted_at`/`status` per table), `remove(table, id)` (hard delete). Each: optimistic where sensible, writes an `activity_log` row via `logActivity`, fires a toast, and calls `refresh()`. Returns `{ saving, error, create, update, softDelete, remove }`.

### `src/lib/adminApi.js`
Thin `fetch` wrappers for the few operations that need the service-role key (server-side): `updateUserRole(userId, role)`, `setUserActive(userId, active)`, `inviteUser(email, role, fullName)`, `seedFallbackContent()`. All hit `/api/admin/*` (proxied to `server/admin-api.js`). Never imports the service key on the client.

### Activity logging helper (`src/lib/logActivity.js`)
`logActivity(action, entity, entityId, meta)` — inserts into `public.activity_log` using the existing anon `supabase` client (RLS permits staff inserts). Used by `useAdminCrud` and any direct manager action. Best-effort (never blocks the UI on failure).
---

## 8. Phase 1 — Foundations, Auth & Protected Routes

1. Add the one allowed dependency: `pnpm add recharts`. Confirm it lands in `package.json` and `pnpm build` stays green.
2. Create `supabase/schema.sql` exactly per Section 4 (idempotent). Run it once in the Supabase SQL editor (or have `scripts/setup-admin.cjs` print the instruction).
3. Add `SUPABASE_SERVICE_ROLE_KEY` to `.env.local` (gitignored) only. Keep `.env` as a template with `# SUPABASE_SERVICE_ROLE_KEY=your-service-key`. Confirm `.gitignore` ignores `.env.local` (add it if missing). Never import the service key in any `src/` file.
4. Implement `scripts/setup-admin.cjs` (CommonJS, uses `@supabase/supabase-js` + `pg` already present): reads `SUPABASE_SERVICE_ROLE_KEY` + `VITE_SUPABASE_URL` from env; creates the first auth user (email + password from CLI args or interactive prompts); sets that user's `profiles.role = 'owner'` via the service client; seeds `site_settings` defaults (company phone/email/address/socials/hero copy), a few `chatbot_kb` rows mirroring the current `Chatbot.jsx` greeting + FAQ, and a couple of `blog_posts`/`job_openings` rows matching the current hardcoded `Blogs.jsx`/`Careers.jsx` content ONLY if those tables are empty. Print the login URL `/admin/login` and the credentials. Wire it to the existing `pnpm setup-admin` script.
5. Build `src/context/AuthContext.jsx` (Section 7) and `src/components/admin/{ProtectedRoute,AdminLayout,Sidebar,Topbar}.jsx` + `src/routes/admin/admin.css` (Sections 3 & 6). Nav items and role gating:
   - everyone (staff): Dashboard, Properties, Leads, Blogs, Careers, Chatbot, Activity, Settings
   - owner|admin additionally: Users
6. `src/routes/admin/Login.jsx`: brand-styled email/password form; error alert on failure; on success redirect to `/admin`; if already authed, redirect away to `/admin`. Uses `AuthContext.signIn`.
7. `src/routes/admin/NotFound.jsx`: on-brand admin 404 (gold/dark).
8. Wire `src/App.jsx`: add a SECOND top-level branch (do NOT nest under public `<Layout/>`):
   - `<Route path="admin/login" element={<Login/>} />`
   - `<Route path="admin" element={<ProtectedRoute><AdminLayout/></ProtectedRoute>}>` with `index -> Dashboard` (placeholder KPI cards in Phase 1; full dashboard in Phase 5) and child routes for properties/leads/blogs/careers/chatbot/users/activity/settings — each rendering a minimal stub (`<section className="admin-page"><h1>…</h1><p>Coming soon</p></section>`) replaced in later phases. `users` wrapped in `<ProtectedRoute requiredRole="admin">`.
   - Keep the public `<Route element={<Layout/>}>…</Route>` block byte-for-byte unchanged.
9. Security: confirm no secrets in `.env`; confirm `.env.local` is gitignored.
10. Commit: `feat: admin — foundations, auth & protected routes`.

**Acceptance:** `/admin/login` renders on-brand; logging in with the `pnpm setup-admin` owner creds lands on `/admin` with sidebar + topbar; an unauthenticated visit to `/admin` redirects to `/admin/login`; logout returns to login; `/admin/users` is blocked for `editor`; `pnpm build` is green; every public route (`/`, `/properties`, `/virtual-office`, `/careers`, `/blogs`, `/contact`, `/subsidiaries/*`) is unchanged and console-error-free.

---

## 9. Phase 2 — Properties Manager (CRUD + image uploads)

1. Implement `src/hooks/useAdminCrud.js`, `src/lib/logActivity.js`, and the generic `useAdminList` in `useFirestore.js` (Section 7).
2. Implement `src/components/admin/ImageUploader.jsx` (drag-drop, multi-file, upload to Supabase Storage `listing-images`, public URLs returned, preview grid, remove). Filename path: `listings/{uuid}-{original}`.
3. Implement `src/routes/admin/PropertiesManager.jsx`:
   - `<DataTable/>` columns: thumbnail, title, type, location, price (formatted `price_unit price`), status pill, featured star, updated_at. Client sort + search + filter (type, status, featured, published/soft-deleted toggle).
   - Row actions: Edit, Duplicate, Soft-delete (archive), Restore (if soft-deleted), Hard-delete (owner|admin only, ConfirmDialog).
   - Create/Edit form (slide-over or modal): title*, property_type (select with the exact values used by `Properties.jsx` filters — `warehouse`, `commercial_spaces`, `office_spaces`, `condominium`, `house`, `virtual_office`, plus `Lot`), status (`FOR_SALE`/`FOR_LEASE`/`Available`/`Sold`/`Closed`), price (numeric) + price_unit (`₱`/`per sqm`/`per month`), floor_area, lot_area, beds/baths/garage, description (textarea), email, phone, images (`<ImageUploader bucket="listing-images"/>`), featured (toggle), is_published (toggle), slug (auto from title if blank, kebab-case, uniqueness check).
   - Validation: title required; price numeric >= 0. On save → `useAdminCrud.create/update`; toast; refresh; `logActivity('property.create'|'property.update', 'offerings', id, {title})`.
4. Public pages UNCHANGED. Verify `Properties.jsx`/`VirtualOffice.jsx` still resolve data: the new `is_published` defaults `true` and `deleted_at` defaults null on existing rows, so the `public read offerings` policy (is_published and deleted_at is null) returns the same set the public site showed before. If the public `useProperties` query ever returns empty due to RLS, fall back is NOT needed for properties (they already depend on Supabase) — instead ensure the policy/migration keeps existing rows visible.
5. Commit: `feat: admin — properties manager CRUD + image uploads`.

**Acceptance:** create, edit, duplicate, soft-delete, restore, and (as owner) hard-delete a listing; multi-image upload + remove works and shows on the public Properties modal; featured/publish toggles reflect on the public site; an archived (soft-deleted) listing disappears from the public site but remains in the manager; activity log records each action; `pnpm build` green.

---

## 10. Phase 3 — Leads / Sales Pipeline + inquiry persistence

1. Extend `server/contact.js`: create a service-role Supabase client (`createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY)`) used SERVER-SIDE ONLY. After the email is queued (or in parallel, non-blocking), INSERT into `public.inquiries` (`ticket`, name, email, phone, subject, message, source='contact_form', status='new', property_id/property_title if the request body included them). If the insert fails, log it but DO NOT fail the response — the email is the primary deliverable; the user still sees their ticket. Add `@supabase/supabase-js` import to the server file (it is already a dependency).
2. Extend the same `:3001` server to handle `/api/admin/*` (add to the existing `http.createServer` router) — avoids a new process. Implement `src/lib/adminApi.js` targets:
   - `GET  /api/admin/stats` — server-side aggregates for the dashboard (counts by status/type, pipeline value, 30-day lead series) using the service key; returns JSON. (Optional: the dashboard can also compute client-side from `useInquiries`+`useProperties`; provide this for scale.)
   - `PUT  /api/admin/users/:id/role` — body `{ role }`; verify caller JWT via `supabase.auth.getUser(token)` and that caller profile role is owner|admin; update `profiles.role` with the service client.
   - `PUT  /api/admin/users/:id/active` — same guard; set `profiles.active`.
   - `POST /api/admin/users/invite` — body `{ email, role, fullName }`; owner|admin only; `supabase.auth.admin.inviteUserByEmail` + upsert profile role.
   - `POST /api/admin/seed-content` — re-run the seed fallback from setup-admin on demand.
   All `/api/admin/*` responses: CORS for the Vite origin, JSON, and a 401/403 on bad/missing role. Add the vite proxy entry `/api/admin` -> `http://localhost:3001` in `vite.config.js`.
3. Implement `src/routes/admin/Leads.jsx`:
   - Pipeline view: columns New / Contacted / Qualified / Won / Lost (Archived behind a toggle). Each lead card: name, property (if any), age ("2d ago"), AI score pill (`scoreLead`), assignee avatar. Status change via a dropdown on the card (deliberately NO drag-drop library — keep to the one-dependency rule). 
   - Lead detail drawer: original message, contact info, `mailto:` reply button, status select, assignee select (from `profiles`), notes (append-only log), lead score (recompute on save), created/updated timestamps.
   - Toolbar: filter by status/assignee/date-range, search, CSV export of the current filtered set (client-side `Blob` download — no new dep).
   - `useInquiries()` with realtime so a new public contact-form submission appears live with a toast.
   - `logActivity('lead.update'|'lead.status_change'|'lead.assign', 'inquiries', id, {status, assigned_to})`.
4. Public `Contact.jsx` UNCHANGED — it still POSTs to `/api/contact` and shows the ticket. The only behavioral addition is the server now also stores the lead; the user sees no difference.
5. Commit: `feat: admin — leads pipeline + inquiry persistence`.

**Acceptance:** a public contact-form submission both sends the Resend email AND creates an `inquiries` row visible in Leads with an AI score; moving a lead through statuses persists and logs; assigning a lead works; CSV export downloads the filtered set; realtime shows a new lead without refresh; the public Contact flow still returns the ticket and shows the success alert; `pnpm build` green.
---

## 11. Phase 4 — AI-Powered Dashboard

1. Implement `src/lib/insights.js` in full per Section 5 (heuristic-first, LLM seam via `VITE_INSIGHTS_API_URL`).
2. Replace the Phase 1 placeholder `src/routes/admin/Dashboard.jsx`:
   - **KPI row (4 `<StatCard/>`):** Active Listings (published, not soft-deleted), New Leads (last 30d), Pipeline Value (sum of `price` of distinct properties tied to `contacted`+`qualified` leads; fallback: count of those leads), Win Rate (last 30d = won/(won+lost)).
   - **Charts (recharts, dark/gold themed — custom tooltip, grid `#2a2a2a`, gold series):** `AreaChart` leads over last 30 days; `BarChart` listings by `property_type`; `Donut`/`PieChart` lead-status distribution; `BarChart` pipeline funnel (new→contacted→qualified→won counts).
   - **AI Insights panel:** calls `getInsights({ properties, inquiries, since })`; renders an ordered feed of insight cards (severity color + Font Awesome icon + title + body). "Regenerate" button re-runs; skeleton while pending; each insight that targets a record includes a link to the relevant manager (e.g. stale listing -> `/admin/properties?id=…`).
   - **Recent activity widget:** last 5 `activity_log` rows (who / action / entity / time).
   - **Stale listings mini-list:** top 5 by `listingStaleness`, each with an Edit link.
   - Data from `useProperties` + `useInquiries` + `useActivity({ limit: 5 })`; optionally `adminApi.getStats()` for server-side aggregates.
3. Commit: `feat: admin — AI dashboard + insights`.

**Acceptance:** dashboard loads with live data; KPIs compute correctly; all four charts render with zero console errors; AI Insights shows >=3 insights and re-runs on Regenerate; insights update when a lead/listing changes; insight links navigate to the right manager; `pnpm build` green.

---

## 12. Phases 5–9 — Content managers, Users, Activity, Settings

### Phase 5 — Blogs
1. `useBlogs({ publishedOnly })` in `useFirestore.js`; `src/routes/admin/BlogManager.jsx`: `<DataTable/>` (title, category, status pill, author, published_at, updated); Create/Edit form (title*, slug* with auto-kebab + uniqueness check, category, excerpt, content textarea, cover_image via `<ImageUploader bucket="blog-images"/>`, author, status `draft`/`published`/`archived`, `published_at` auto-set on first publish). Delete = set `status='archived'`; hard-delete option for owner|admin. "Preview" opens `/blogs` in a new tab. `logActivity('blog.*')`.
2. Wire the public `Blogs.jsx` to `useBlogs({ publishedOnly: true })` with the **current hardcoded `posts` array as fallback** when the query returns empty or errors (guardrail #9). Keep visual parity exactly.
3. Commit: `feat: admin — blogs manager + public data wiring`.

### Phase 6 — Careers
1. `useJobs({ activeOnly })`; `src/routes/admin/CareerManager.jsx`: `<DataTable/>` (title, location, type, tag, status); CRUD for `job_openings`; status `active`/`closed`/`draft`. `logActivity('job.*')`.
2. Wire public `Careers.jsx` to `useJobs({ activeOnly: true })` with the **current hardcoded `jobs` + `benefits` arrays as fallback**. `benefits` stays hardcoded (evergreen marketing copy).
3. Commit: `feat: admin — careers manager + public data wiring`.

### Phase 7 — Chatbot Trainer
1. `useChatbotKB({ activeOnly })`; `src/routes/admin/ChatbotTrainer.jsx`: `<DataTable/>` (trigger, answer, keywords, priority, active toggle); CRUD; a **Test panel** that takes a message and shows which KB entry matches using the same matcher the public chatbot uses. `logActivity('kb.*')`.
2. Refactor public `Chatbot.jsx` to: load KB from `useChatbotKB({ activeOnly: true })`, match by trigger/keywords (priority desc, case-insensitive, first hit wins), with the **existing hardcoded `responses` map as fallback** when KB is empty or nothing matches. Keep the exact "Alpha Assistant" greeting and current UX.
3. Commit: `feat: admin — chatbot trainer + KB-driven chatbot`.

### Phase 8 — Users & Roles (owner|admin only)
1. `src/routes/admin/Users.jsx`: `<DataTable/>` (email, full_name, role pill, active, created); actions via `adminApi.js` -> `/api/admin/users/*`: change role (select owner/admin/editor — only `owner` may promote to `owner`), activate/deactivate, invite (email + role + full name). **Guard:** you cannot deactivate or demote your own account; the server re-checks this too. `logActivity('user.*')`.
2. Commit: `feat: admin — users & roles management`.

### Phase 9 — Activity Log + Settings
1. `src/routes/admin/ActivityLog.jsx`: read-only `<DataTable/>` (timestamp, user email, action, entity, entity_id); filter by user/entity/date-range; pagination (50/page). 
2. `src/routes/admin/Settings.jsx`: form bound to `site_settings` (key/value upsert) — editable keys: `company_phone`, `company_email`, `company_address`, `social_facebook`, `social_instagram`, `social_linkedin`, `social_viber`, `hero_headline`, `hero_subheadline`. Save via `useAdminCrud` on `site_settings`; `logActivity('settings.update')`. NOTE: wiring these into the public `Home.jsx`/`Footer.jsx`/`Contact.jsx` is OPTIONAL this round — if done, keep hardcoded fallbacks; otherwise document the keys as ready-but-not-yet-consumed.
3. Commit: `feat: admin — activity log + site settings`.

---

## 13. Phase 10 — Security, Polish & Accessibility

1. Verify RLS is enabled on every admin table and there is **zero** client use of the service key: `grep -R "SERVICE_ROLE" src/` must return nothing.
2. Verify `.env.local` is gitignored; `.env` holds only placeholder comments; no committed secrets anywhere.
3. Admin 403 page for role-gated forbidden access; admin 404 for unknown `/admin/*`.
4. Consistent loading skeletons, empty states (`<EmptyState/>`), and error states across all managers — no raw `undefined`/blank renders.
5. `<Toast/>` on every create/update/delete success and error.
6. Responsive: sidebar -> drawer under 900px; tables -> stacked cards under 640px; forms full-width on mobile.
7. Keyboard: Enter submits forms; Esc closes modals/drawers; `<ConfirmDialog/>` focuses Cancel by default (safe default). 
8. A11y: form `<label>`s, `aria-label` on icon-only buttons, gold `:focus-visible` ring, AA contrast on dark surfaces.
9. Commit: `feat: admin — security, polish & a11y`.

---

## 14. Phase 11 — Final Verification

1. `pnpm install` (pulls `recharts`) then a clean `pnpm build` — zero errors, zero warnings.
2. `pnpm dev:all` (Vite `:3000` + contact/admin server `:3001`). Walk every admin route: login, dashboard, properties (CRUD + image upload), leads (pipeline + CSV export), blogs, careers, chatbot (test panel), users (role change + invite), activity, settings.
3. Submit the public contact form once with a test email -> confirm the Resend ticket returns AND a new lead appears in admin Leads (realtime, no refresh).
4. Public parity re-check: every public route (`/`, `/properties`, `/virtual-office`, `/careers`, `/blogs`, `/contact`, `/subsidiaries/*`) renders exactly as before; `Blogs`/`Careers` now read Supabase but fall back to the hardcoded content when their tables are empty; `Properties`/`VirtualOffice` unchanged.
5. DevTools on each admin route — no red console errors, no 404 assets, no missing fonts.
6. Responsive at 900px (drawer opens) and 640px (tables stack) for the admin shell.
7. Security check: with an unauthenticated/anon session, the client cannot read `inquiries`, `activity_log`, or `profiles`, and cannot write any admin table (RLS blocks); confirm by attempting a direct `supabase.from('inquiries').select()` while logged out -> returns empty/error.
8. Commit final: `feat: admin — full panel complete`.

---

## Appendix — File & Acceptance Checklist

**New files:** `supabase/schema.sql`, `scripts/setup-admin.cjs`, `server/admin-api.js`, `src/context/AuthContext.jsx`, `src/lib/{adminApi.js,insights.js,logActivity.js}`, `src/hooks/useAdminCrud.js`, `src/components/admin/{AdminLayout,Sidebar,Topbar,ProtectedRoute,StatCard,DataTable,ImageUploader,Toast,ConfirmDialog,StatusPill,EmptyState}.jsx`, `src/routes/admin/{admin.css,Login,Dashboard,PropertiesManager,Leads,BlogManager,CareerManager,ChatbotTrainer,Users,ActivityLog,Settings,NotFound}.jsx`.

**Edited files:** `src/App.jsx` (add admin route branch), `src/hooks/useFirestore.js` (add hooks), `src/routes/Blogs.jsx` + `src/routes/Careers.jsx` + `src/components/Chatbot.jsx` (Supabase data + hardcoded fallback), `server/contact.js` (persist inquiries + `/api/admin/*`), `vite.config.js` (proxy `/api/admin`), `package.json` (add `recharts`), `.env` (template), `.env.local` (add `SUPABASE_SERVICE_ROLE_KEY`), `.gitignore` (ensure `.env.local` ignored).

**Untouched:** all legacy `*.html`/`*.php`, `.old_site/`, `firestore.rules`, `storage.rules`, public `Header.jsx`/`Footer.jsx`/`Layout.jsx`, all `src/routes/subsidiaries/*`, `src/routes/{Home,Properties,VirtualOffice,Contact,NotFound}.jsx` behavior.

- [ ] `pnpm setup-admin` creates an owner login and seeds fallback settings/KB/blog/job rows.
- [ ] `/admin/login` -> `/admin` works; logout works; role gating blocks `editor` from Users.
- [ ] Properties: CRUD, image upload, featured/publish toggles, soft-delete + restore; public site reflects changes.
- [ ] Contact form submissions create `inquiries` rows AND send emails; Leads pipeline + CSV + realtime.
- [ ] Dashboard: 4 KPIs + 4 charts + AI Insights feed (>=3 insights) all live and error-free.
- [ ] Blogs/Careers/Chatbot admin CRUD; public pages read Supabase with hardcoded fallback.
- [ ] Users (owner|admin): role change, activate/deactivate, invite; self-demote guard.
- [ ] Activity Log read-only + filter; Settings key/value upsert.
- [ ] No service key in `src/`; no committed secrets; RLS blocks anon admin access.
- [ ] `pnpm build` green; no console errors on any route; responsive at 900px/640px.

---

## Out of Scope (future, do not build now)

- Drag-and-drop kanban for leads (deliberately omitted to respect the one-dependency rule; status dropdowns used instead).
- A rich WYSIWYG blog editor (plain textarea is fine for v1; can add TipTap later).
- LLM-backed insights (the `VITE_INSIGHTS_API_URL` seam is ready; wire a real endpoint later by adding one env var).
- Consuming `site_settings` inside public `Home.jsx`/`Footer.jsx` (keys are stored now; wiring is a follow-up).
- Bulk import/export of listings.

---

## Quickstart (for the user, after DeepSeek finishes)

```bash
pnpm install                  # pulls recharts
# add SUPABASE_SERVICE_ROLE_KEY to .env.local, then:
pnpm setup-admin              # creates the first owner login + seeds fallback content
pnpm dev:all                  # Vite :3000 + contact/admin :3001
# open http://localhost:3000/admin/login and sign in with the printed credentials
```
