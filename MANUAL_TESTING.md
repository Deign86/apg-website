# Alpha Premier Group (APG) Website — Manual Testing Guide

> **Live site:** https://apg-website-alpha-deign86s-projects.vercel.app
> **Repo:** `apg-website` (Vite 5 + React 18 + Supabase + NVIDIA NIM AI + Resend email)
> **Supabase project ref:** `ldtavdybcgwjgticrymz`

This document is a comprehensive, end-to-end manual test plan covering every public page, the admin panel, AI features, API endpoints, role/permission rules, and cross-cutting concerns (responsive, accessibility, error handling). Work through it top-to-bottom; each section has checkboxes you can tick.

---

## 0. Environment & Access Credentials

> ⚠️ **Handle with care.** These values come from `.env.local` / `.env` / `secrets/`. The `SUPABASE_SERVICE_ROLE_KEY` and `NVIDIA_API_KEY` are **server-only secrets** — never commit them or paste them into client code.

### 0.1 Application / Backend

| Item | Value |
|------|-------|
| Live site URL | https://apg-website-alpha-deign86s-projects.vercel.app |
| Local Vite dev server | http://localhost:3000 |
| Local Node API server | http://localhost:3001 |
| Legacy PHP backend (proxied) | http://localhost:8080 (`/api`, `/includes`) |
| Firebase project (legacy) | `apg-website-2026` (see `.firebaserc`) |

### 0.2 Supabase (PostgreSQL + Auth + Storage)

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://ldtavdybcgwjgticrymz.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` (client) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdGF2ZHliY2d3amd0aWNyeW16Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI5NzQ3NzcsImV4cCI6MjA5ODU1MDc3N30.RBXjTEDftOxDTZHAYoRAYEkcTBfium-hyDAgQ77ZDO8` |
| `SUPABASE_SERVICE_ROLE_KEY` (server only) | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxkdGF2ZHliY2d3amd0aWNyeW16Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4Mjk3NDc3NywiZXhwIjoyMDk4NTUwNzc3fQ.rVlq4JpW-nGQ5AyjoxCFvUi6lL020YQI8UuETldikEI` |
| Supabase Dashboard | https://supabase.com/dashboard/project/ldtavdybcgwjgticrymz |
| Storage buckets | `apg-public` (public read), `apg-private` (staff only), `listing-images`, `blog-covers`, `apr-listing`, `realty`, `admins`, `chat` |

### 0.3 AI (NVIDIA NIM)

| Variable | Value |
|----------|-------|
| `NVIDIA_API_KEY` | `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` |
| `NVIDIA_MODEL` | `stepfun-ai/step-3.7-flash` |
| `VITE_INSIGHTS_API_URL` | `/api/ai/insights` |

### 0.4 Email (Resend) — *optional / currently commented out*

| Variable | Value |
|----------|-------|
| `RESEND_API_KEY` | _(set in `.env.local`; example format `re_…`)_ |
| `COMPANY_EMAIL` | `alphapremierrealty@gmail.com` |

### 0.5 Google Drive Listings Sync

| Variable | Value |
|----------|-------|
| `GOOGLE_APPLICATION_CREDENTIALS` | `./secrets/apr-listing-sync-key.json` |
| `GOOGLE_DRIVE_LISTING_FOLDER_ID` | `1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll` |
| Service account email | `apr-listing-sync@apg-posting-desk-deign-2026.iam.gserviceaccount.com` |
| Service account project | `apg-posting-desk-deign-2026` |

### 0.6 Admin Login

A working admin account has been created in the live Supabase project. Use these credentials to sign in:

| Field | Value |
|-------|-------|
| Login URL (local) | http://localhost:3000/admin/login |
| Login URL (live) | https://apg-website-alpha-deign86s-projects.vercel.app/admin/login |
| Email | `admin@alphapremier.com` |
| Password | `APGadmin2026!` |
| User ID (auth.users) | `13358f48-2186-430c-9d28-4e5a46b02d0e` |
| Profile role | `admin` (active = true) |

> These were provisioned via the service‑role key (see `scripts/setup-admin.cjs`). The same email is the placeholder shown in the login form. The account's `profile.role` is `admin`, so it can access the Dashboard, Properties, Leads, Blogs, Careers, Chatbot, Facebook, Activity, Settings, and Users pages. To elevate it to `owner` (so it can invite new owner‑level users), use the Supabase Dashboard → Table Editor → `profiles` → set `role = 'owner'`, or run: `update public.profiles set role='owner' where email='admin@alphapremier.com';`

- If you forgot the password, an **owner/admin** can use the "Reset Password" action on the **Users** page (`/admin/users`), or reset it directly in the Supabase Dashboard → Authentication → Users → `admin@alphapremier.com` → "Send password reset" (or set a new password there).
- To create additional test accounts for role testing (§7), sign in as admin/owner and use **Users → Invite User**.

### 0.7 Canonical Roles (from migration `015_unified_roles.sql`)

`profiles.role` ∈ `owner | admin | editor | staff | viewer`

| Function | Roles that satisfy it |
|----------|----------------------|
| `is_admin()` | `owner`, `admin` (and `active = true`) |
| `is_staff()` | `owner`, `admin`, `editor`, `staff` |
| `is_viewer()` | all authenticated internal roles incl. `viewer` |

Sidebar visibility per role (from `Sidebar.jsx`):

| Nav item | owner | admin | editor | staff | viewer |
|----------|:-----:|:-----:|:------:|:-----:|:------:|
| Dashboard | ✅ | ✅ | — | — | — |
| Properties | ✅ | ✅ | ✅ | — | — |
| Leads | ✅ | ✅ | — | — | — |
| Blogs | ✅ | ✅ | ✅ | — | — |
| Careers | ✅ | ✅ | ✅ | — | — |
| Chatbot | ✅ | ✅ | ✅ | — | — |
| Facebook | ✅ | ✅ | ✅ | — | — |
| Activity | ✅ | ✅ | — | — | — |
| Settings | ✅ | ✅ | — | — | — |
| Users | ✅ | ✅ | — | — | — |
---

## 1. Local Environment Setup (Pre-flight)

- [ ] `pnpm install` completes without fatal errors.
- [ ] `.env.local` exists with the values in §0 (Supabase URL + anon key + service role key + NVIDIA key). Resend is optional.
- [ ] `secrets/apr-listing-sync-key.json` exists (only needed for Drive sync tests, §9).
- [ ] Run `pnpm dev:all` — both the Vite server (3000) **and** the Node API server (3001) start.
  - Console shows `Server running on http://localhost:3001`.
  - If Supabase is misconfigured: `WARN: Supabase not configured - inquiry persistence disabled`.
  - If Resend is missing: `WARN: Resend not configured - email sending disabled`.
- [ ] Open http://localhost:3000 — Home page renders, no blank/black screen.
- [ ] Open browser DevTools → Console — confirm there is **no** `Missing VITE_SUPABASE_URL…` error.
- [ ] `pnpm build` succeeds with exit code 0 (output in `dist/`).

---

## 2. Public Site — Navigation & Layout

### 2.1 Header

- [ ] Logo image (`/assets/images/viber1.png`) loads; clicking it navigates to `/`.
- [ ] Nav links present and correct: Home, Properties, Virtual Office, Careers, Blogs.
- [ ] Active link gets the `active` class (gold underline / highlight).
- [ ] Header gains `scrolled` class after scrolling > 30px (background/solid style appears).
- [ ] Mobile: hamburger icon toggles the nav menu; clicking a link closes the menu.

### 2.2 Footer (`Footer.jsx`)

- [ ] Footer renders company contact info pulled from `site_settings` (`company_phone`, `company_email`, `company_address`).
- [ ] Social links (Facebook, Instagram, TikTok/LinkedIn) render; `#` placeholders are acceptable if unset.
- [ ] Quick links to public pages work.

### 2.3 Global Chatbot (`Chatbot.jsx`) — appears on every page

- [ ] Floating comment-icon toggle button is visible (hidden only if `site_settings.ai_enabled === `false``).
- [ ] Clicking opens the chat panel with a greeting: *"Hello! I`m Alpha, your virtual assistant…"*
- [ ] "AI" badge shows next to the title when `ai_chatbot_enabled !== `false``.
- [ ] Sending a message shows a "Thinking…" spinner, then a reply.
- [ ] Keyword fallback works when AI is offline — try "hello", "property", "virtual office", "careers", "contact", "swiftclear", "dynamic tree", "luxe prime", "alta venture", "construction", "88 prime", "thank".
- [ ] Unknown keyword returns the fallback: *"I`m sorry, I didn`t understand…"*.
- [ ] Pressing Enter sends the message; the send (paper-plane) button also works.
- [ ] Closing (×) and reopening keeps a fresh session.
- [ ] When AI is enabled, a reply from NVIDIA NIM appears (non-empty `result.content`).

### 2.4 404 / Unknown Route

- [ ] Navigate to `/nonexistent` → `NotFound` page renders.
- [ ] `/about` redirects to `/` (Navigate replace).

---

## 3. Public Pages (Detailed)

### 3.1 Home (`/`)

- [ ] Hero section renders with heading and CTA.
- [ ] "Enterprise listings" / featured properties section loads properties from `offerings` (featured first).
- [ ] Mission / Vision section renders.
- [ ] Core Values section renders.
- [ ] AOS animations trigger on scroll (`data-aos`).
- [ ] Subsidiary showcase section renders links to all 7 subsidiaries.

### 3.2 Properties (`/properties`)

- [ ] Grid loads from `useProperties()` (`offerings` where `deleted_at IS NULL`).
- [ ] Loading state shows "Loading properties…".
- [ ] Error state shows "Failed to load properties." (test by disabling network).
- [ ] Offline state shows "Listing temporarily unavailable — backend offline."
- [ ] Empty state shows the no-results icon + "No properties found." when filters exclude all.
- [ ] Search box filters by title and location (case-insensitive).
- [ ] Filter chips work: All, Warehouse, Commercial, Office, Condo, House, Virtual.
- [ ] Each card shows: status badge, hero image, price (₱ formatted, "Contact for Price" when null), title, location, floor/lot area, "VIEW DETAILS" button.
- [ ] Clicking "VIEW DETAILS" opens the modal.
- [ ] **Modal:** hero image, status, title, location, price, description, floor/lot area, "INQUIRE NOW" link → `/contact`.
- [ ] **Lightbox:** if gallery images exist, clicking the hero opens the lightbox; prev/next buttons cycle; close (×) and overlay click dismiss.
- [ ] Image fallback chain works: asset → legacy `images[0]` JSONB → `/assets/images/placeholder.jpg`.
- [ ] In dev mode, console warns `[DualRead] Fallback to images JSONB…` for properties still using the legacy column.

### 3.3 Virtual Office (`/virtual-office`)

- [ ] Virtual office listings load (same dual-read gallery hook as Properties).
- [ ] Cards render image, title, location, price, specs.
- [ ] Detail modal/lightbox works identically to Properties.

### 3.4 Careers (`/careers`)

- [ ] Job openings load from `job_openings` (status = `active`).
- [ ] Hero title/subtitle reflect `site_settings` `careers_hero_title` / `careers_hero_subtitle` (fallbacks if unset).
- [ ] Each job card shows title, location, type, tag.
- [ ] "Apply" / inquiry CTA present.

### 3.5 Blogs (`/blogs`)

- [ ] Published blog posts load from `blog_posts` (status = `published`).
- [ ] Each post card shows cover image, title, excerpt, category, date.
- [ ] Clicking a post opens the full article (slug-based).

### 3.6 Contact (`/contact`)

- [ ] Contact info (phone/email/address) renders from `site_settings` with sensible fallbacks.
- [ ] Form fields: Name (required), Email (required, type=email), Subject (optional), Message (required).
- [ ] Submitting with valid data:
  - [ ] Button shows "Sending…" and is disabled.
  - [ ] `POST /api/contact` returns 200 with `{ success: true, ticket: "APR-YYYYMMDD-XXXX" }`.
  - [ ] Success alert shows "Message sent!" + ticket number.
  - [ ] Form fields reset.
  - [ ] A new row is inserted into `inquiries` (status `new`).
  - [ ] If Resend is configured, an email arrives at `COMPANY_EMAIL`.
  - [ ] If Resend is **not** configured, response is still 200 with "Inquiry received (email disabled).".
- [ ] Submitting with missing name/email/message → 400 "Name, email, and message required."
- [ ] HTML is escaped server-side (try `<script>` in message — should render as text, not execute).
- [ ] Network error → "Something went wrong. Please try again…" alert.

### 3.7 Subsidiary Landing Pages

Visit each route and confirm the page renders (Helmet title, hero, content, CTA):

- [ ] `/subsidiaries/realty` — Alpha Premier Realty (title `… | Alpha Premier`).
- [ ] `/subsidiaries/construction` — Alpha Premier Construction.
- [ ] `/subsidiaries/swiftclear` — Swift Clear.
- [ ] `/subsidiaries/dynamic-tree` — Dynamic Tree.
- [ ] `/subsidiaries/luxe-prime` — Luxe Prime.
- [ ] `/subsidiaries/alta-venture` — Alta Venture.
- [ ] `/subsidiaries/88prime` — 88 Prime.
- [ ] Each has scoped CSS (no style bleed into main site).
- [ ] Inquiry/CTA buttons link to `/contact` or fire the contact form pattern.
---

## 4. Admin Panel — Authentication

### 4.1 Login Flow (`/admin/login`)

- [ ] Navigating to `/admin` while **signed out** redirects to `/admin/login`.
- [ ] Login form: Email + Password fields, "Sign In" button.
- [ ] Empty submit → HTML5 validation blocks it.
- [ ] Invalid credentials → red error alert "Invalid credentials" (or Supabase error message).
- [ ] Valid credentials → redirect to `/admin` (Dashboard).
- [ ] "Signing in…" button state while waiting.
- [ ] Already-signed-in user visiting `/admin/login` is auto-redirected to `/admin`.

### 4.2 Session Persistence

- [ ] Refreshing `/admin` keeps you signed in (Supabase session in localStorage).
- [ ] Logout (Sidebar → Logout) clears session and returns to `/admin/login`.

### 4.3 Protected Routes (`ProtectedRoute.jsx`)

- [ ] Unauthenticated → redirect to `/admin/login`.
- [ ] `profile.active === false` → "Account Disabled" screen with lock icon.
- [ ] `requiredRole` mismatch → "Access Denied" screen naming the required role.
- [ ] Loading state shows spinner + "Loading…".

---

## 5. Admin Panel — Modules

> Sign in as `owner` for full coverage. Re-run role-restricted checks (§7) as `admin`, `editor`, etc.

### 5.1 Dashboard (`/admin`) — admin/owner only

- [ ] StatCards render: listings, leads, pipeline value, wins.
- [ ] Charts render (Recharts): Area (leads over time), Bar (property types), Pie (lead statuses).
- [ ] Recent activity list loads from `activity_log`.
- [ ] "Generate AI Insights" button:
  - [ ] Shows loading spinner.
  - [ ] Calls `POST /api/ai/insights` (admin-guarded).
  - [ ] Returns a narrative summary + bullet insights.
  - [ ] If NVIDIA key missing → graceful fallback to rule-based `generateDashboardInsights()`.
- [ ] Lead score badges display (`scoreLead`).

### 5.2 Properties Manager (`/admin/properties`) — admin/editor

- [ ] Table loads from `offerings` ordered by `created_at` desc.
- [ ] Columns: Title, Type (pill), Location, Price, Status (pill), Featured star.
- [ ] Search box filters rows.
- [ ] Filter by property type dropdown.
- [ ] **Add Property:** form opens with fields — title, location, type (warehouse/commercial_spaces/office_spaces/condominium/house/virtual_office/Lot), status (FOR_SALE/FOR_LEASE/Available/Sold/Closed), price, price_unit, floor_area, lot_area, beds, baths, garage, description, email, phone, images, featured, is_published.
- [ ] Saving creates a row → toast "Property created".
- [ ] **Edit:** loads existing values (nulls stripped) → save updates → toast "Property updated".
- [ ] **Duplicate:** creates a copy form with "(Copy)" suffix.
- [ ] **Archive (soft delete):** sets `deleted_at` → toast "Archived" → row disappears from default view.
- [ ] **Restore:** clears `deleted_at` → row returns.
- [ ] **Featured toggle:** clicking the star toggles `featured` immediately.
- [ ] Image uploader uploads to Supabase Storage (`listing-images`).
- [ ] Confirm dialogs appear for destructive actions.

### 5.3 Leads (`/admin/leads`) — admin/owner only

- [ ] Table loads from `inquiries` with lead scores.
- [ ] Status pipeline: new → contacted → qualified → won/lost → archived.
- [ ] **Update status:** dropdown moves lead; toast "Moved to {status}".
- [ ] **Assign:** assign to a staff/admin profile.
- [ ] **Notes:** save/edit notes on a lead.
- [ ] **AI Lead Insight:** button calls `POST /api/ai/lead` (admin-guarded) → returns analysis + score.
- [ ] Filter by status.
- [ ] Detail panel (table/tab toggle) shows full inquiry.

### 5.4 Blog Manager (`/admin/blogs`) — admin/editor

- [ ] Table of `blog_posts` (draft/published/archived).
- [ ] Create new post: slug (unique), title, excerpt, content, category, cover_image, author, status.
- [ ] Edit / archive / restore.
- [ ] Published posts appear on public `/blogs`.

### 5.5 Career Manager (`/admin/careers`) — admin/editor

- [ ] Table of `job_openings`.
- [ ] Create/edit: title, location, type (Full-time/Part-time), tag, status (active/inactive).
- [ ] Active jobs appear on public `/careers`.

### 5.6 Chatbot Trainer (`/admin/chatbot`) — admin/editor

- [ ] Loads `chat_logs` (paginated, max 500).
- [ ] Filters: search messages, role (user/assistant), session, start/end date.
- [ ] "Clear filters" button resets.
- [ ] **Session view:** click a session → see ordered conversation thread.
- [ ] **Clear all logs:** confirm dialog → deletes all `chat_logs` rows → logs activity.
- [ ] **AI health card:** fetches `GET /api/ai/health` → shows NVIDIA configured?, model, Supabase status.
- [ ] Knowledge-base intents (`chatbot_kb`) CRUD (add/edit triggers + answers, priority, active toggle).

### 5.7 Facebook Context (`/admin/facebook-context`) — admin/editor

- [ ] Page loads Facebook context content (from `facebook_context` table).
- [ ] Create/edit/delete context entries.

### 5.8 Users (`/admin/users`) — admin/owner

- [ ] Table of `profiles` (email, full_name, role, active).
- [ ] **Owner only:** "Invite User" dialog — email, full name, role (editor/admin/owner).
  - [ ] Calls `POST /api/admin/invite` with Bearer token.
  - [ ] Toast "Invitation sent to {email}".
- [ ] **Owner only:** cycle role (editor → admin → owner) per user.
- [ ] **Admin:** Activate/Deactivate toggle (confirm dialog) — cannot change own status.
- [ ] **Reset Password:** sends reset email.
- [ ] Cannot change own role → toast "Cannot change own role".
- [ ] Editor sees read-only notice ("you can view users but cannot change roles…").

### 5.9 Activity Log (`/admin/activity`) — admin/owner only

- [ ] Loads `activity_log` ordered by time desc.
- [ ] Each entry: action, resource type/title, details, timestamp, actor.
- [ ] Filter/search if present.
- [ ] Actions from other modules (property create, role change, settings save, invite) appear here.

### 5.10 Settings (`/admin/settings`) — admin/owner only

- [ ] Groups load from `site_settings`:
  - **Site Settings:** site_name, company_email, company_phone, company_address.
  - **Social Links:** social_facebook, social_instagram, social_tiktok.
  - **AI Settings:** ai_enabled (bool), ai_chatbot_enabled (bool) toggles.
  - **Notifications:** notify_new_lead_email (bool), notify_email_address.
  - **Careers Page:** careers_hero_title, careers_hero_subtitle.
- [ ] "Save {Group}" upserts rows → toast "{Group} saved" → logs activity.
- [ ] Boolean toggles show "Enabled/Disabled".
- [ ] Changing `company_email`/`phone`/`address` reflects on public `/contact`.
- [ ] Disabling `ai_enabled` hides the chatbot toggle button site-wide.
- [ ] Disabling `ai_chatbot_enabled` removes the "AI" badge.
- [ ] Storage card links to Supabase Storage dashboard.

### 5.11 Assets (`/admin/assets`) — admin/editor

- [ ] Asset table loads from `assets` + `property_asset_relations`.
- [ ] Filters: type (image/pdf), status (active/archived/pending_review).
- [ ] Archive / delete actions.
- [ ] **Replace image flow:** upload new → creates new asset UUID → updates `property_asset_relations` → archives old.
- [ ] Linked offering (offering_id) displays.
---

## 6. AI Features (NVIDIA NIM)

### 6.1 Public Chatbot AI

- [ ] With `ai_enabled !== `false`` and a valid `NVIDIA_API_KEY`:
  - [ ] Send "Tell me about your properties" → AI generates a contextual reply.
  - [ ] Conversation history is sent (last messages as context).
  - [ ] Reply is non-empty (`result.content`).
- [ ] If NVIDIA returns empty/error → keyword fallback reply is used (no crash).
- [ ] Messages are logged to `chat_logs` (verify in Chatbot Trainer).

### 6.2 Admin AI Insights (`/api/ai/insights`)

- [ ] From Dashboard, "Generate AI Insights" → 200 with `narrative` + `insights[]`.
- [ ] Requires admin Bearer token (else 401 Unauthorized).
- [ ] Non-admin role → 403 Forbidden.

### 6.3 Admin AI Lead Insight (`/api/ai/lead`)

- [ ] From Leads, AI analysis → 200 with analysis + score.
- [ ] Requires admin token.

### 6.4 AI Health (`/api/ai/health`)

- [ ] `GET /api/ai/health` (no auth) returns `{ nvidia_configured, model, supabase }`.
- [ ] Reflected in Chatbot Trainer`s AI health card.

---

## 7. Roles & Permissions Testing

Create (or invite) test accounts for each role and verify:

### 7.1 Unauthenticated visitor
- [ ] Cannot reach any `/admin/*` except `/admin/login` (redirect).
- [ ] Public data (offerings, blogs, careers) is readable.
- [ ] Cannot write to any table (RLS blocks).

### 7.2 `viewer`
- [ ] Can sign in.
- [ ] Sidebar shows **no** nav items (all require admin/editor) — confirm graceful empty state.
- [ ] Cannot access Dashboard/Leads/Users/Settings/Activity (ProtectedRoute `requiredRole="admin"`).

### 7.3 `staff` (posting-desk operator)
- [ ] Can write to `apg-public`/`apg-private` storage (satisfies `is_staff()`).
- [ ] No admin sidebar items (staff not in any Sidebar role list) — confirm no crash.

### 7.4 `editor`
- [ ] Sidebar shows: Properties, Blogs, Careers, Chatbot, Facebook.
- [ ] Can CRUD offerings, blog_posts, job_openings, chatbot_kb.
- [ ] **Cannot** access Dashboard (redirect/Access Denied — requiredRole admin).
- [ ] **Cannot** access Leads, Users, Settings, Activity.
- [ ] Users page shows read-only notice; no invite/role/activate buttons.

### 7.5 `admin`
- [ ] Full sidebar (Dashboard, Properties, Leads, Blogs, Careers, Chatbot, Facebook, Activity, Settings, Users).
- [ ] Can manage all content + leads + settings + users (verify role cycle allows up to owner).
- [ ] Cannot change own role/status.

### 7.6 `owner`
- [ ] Everything admin can do, plus:
  - [ ] Invite users as owner.
  - [ ] Cycle any user`s role through editor → admin → owner.

### 7.7 Disabled account
- [ ] Set `profiles.active = false` for a user → sign in → "Account Disabled" screen.

---

## 8. API Endpoints (Direct / cURL)

Use the dev server at `http://localhost:3001` (or live Vercel functions).

### 8.1 Contact
- [ ] `POST /api/contact` with `{name,email,message}` → 200 + ticket.
- [ ] Missing fields → 400.
- [ ] HTML-injected payload is escaped.

### 8.2 Admin routes (`/api/admin/*`)
- [ ] `POST /api/admin/invite` — requires Bearer admin token; creates user + profile.
- [ ] `POST /api/admin/seed` — seeds fallback content (admin token).
- [ ] Without token → 401; with non-admin token → 403.

### 8.3 AI routes
- [ ] `POST /api/ai/chat` — public; returns `{content}` or fallback.
- [ ] `POST /api/ai/insights` — admin token required.
- [ ] `POST /api/ai/lead` — admin token required.
- [ ] `GET /api/ai/health` — no auth; returns config status.

### 8.4 Asset edge functions
- [ ] `GET /api/assets/public-meta?id=<uuid>` — returns public asset metadata.
- [ ] `GET /api/assets/signed-url?id=<uuid>` — returns signed URL for private asset (staff token).

### 8.5 CORS / OPTIONS
- [ ] `OPTIONS` on any `/api/*` returns 200 with CORS headers (`Access-Control-Allow-Origin: *`).

---

## 9. Data Sync & Asset Pipeline

### 9.1 Google Drive → Supabase sync
- [ ] `pnpm sync-drive --batch-id "test-$(date +%Y-%m-%d)" --dry-run` lists planned ingest without writing.
- [ ] `pnpm sync-drive --batch-id "test-$(date +%Y-%m-%d)"` runs live:
  - [ ] Downloads JPEG/PNG/WebP/PDF from Drive folder `1GXeGULYswb7jXcMGCCRm2RQ_h0EKsDll`.
  - [ ] Uploads to `apr-listing` staging bucket + `apg-public` for matched offerings.
  - [ ] Creates `assets`, `property_asset_relations`, `import_batches`, `import_file_mappings` rows.
  - [ ] Idempotency: re-run skips files by `import_file_mappings.checksum_sha256`.
- [ ] `--category "OFFICE SPACE"` limits to one category.
- [ ] Unmatched offerings appear for manual reassignment.

### 9.2 Asset health check
- [ ] `node scripts/asset-health-check.js` runs:
  - [ ] Reports orphaned relations, error/pending_review assets.
  - [ ] Reports unmatched `import_file_mappings`.
  - [ ] Reports broken `cover_asset_id` refs.
  - [ ] Spot-checks 10 random public assets in storage.

---

## 10. Cross-Cutting Concerns

### 10.1 Responsive Design
- [ ] Test all public pages at 360px, 768px, 1024px, 1440px widths.
- [ ] Header collapses to hamburger on mobile.
- [ ] Property grid reflows; cards remain usable.
- [ ] Admin sidebar toggles on mobile (overlay drawer).
- [ ] Chatbot panel fits within mobile viewport.

### 10.2 Browser Compatibility
- [ ] Latest Chrome, Edge, Firefox, Safari.
- [ ] No console errors blocking render.

### 10.3 Accessibility
- [ ] All images have `alt` text (or empty alt for decorative).
- [ ] Forms have labels (`<label>` paired with inputs).
- [ ] Buttons are keyboard-focusable; Enter submits forms.
- [ ] Color contrast meets WCAG AA (gold `#c5a059` on dark `#0a0a0a`).
- [ ] Modal/lightbox closeable via overlay click and × button.

### 10.4 SEO / Meta
- [ ] Each page sets a `<Helmet>` `<title>` (e.g., "Properties | Alpha Premier").
- [ ] Meta description present where applicable.
- [ ] 404 page returns correct title.

### 10.5 Performance
- [ ] Property images use `loading="lazy"`.
- [ ] Image transforms use Supabase CDN resize (`getTransformedUrl` width param).
- [ ] No 404s for critical assets in Network tab.
- [ ] Build size reasonable (`dist/`).

### 10.6 Security
- [ ] `SUPABASE_SERVICE_ROLE_KEY` **not** present in client bundle (run `node scripts/check-asset-guardrails.cjs`).
- [ ] `.env.example` marks service-only keys as server-only.
- [ ] RLS rules enforced: anon cannot write offerings/blogs/careers/users.
- [ ] Contact form input is escaped server-side (XSS).
- [ ] Admin API routes verify Bearer token + role.
- [ ] No secrets committed to git (`.env.local`, `secrets/` are git-ignored).

### 10.7 Error Handling
- [ ] Supabase unreachable → public pages show fallback content; admin shows errors.
- [ ] Resend failure → 500 "Failed to send email." but inquiry still persists (non-blocking).
- [ ] NVIDIA failure → AI features fall back gracefully; no white screen.
- [ ] Missing `aiSettings` state would cause black screen — confirm the state is initialized (regression check on `Chatbot.jsx`).

---

## 11. Build & Deployment

- [ ] `pnpm build` → exit 0, `dist/` populated.
- [ ] `pnpm preview` serves the production build locally.
- [ ] Vercel deployment: push to `main` triggers automatic build.
- [ ] `vercel.json` SPA rewrite: deep links like `/properties` resolve (no 404 on refresh).
- [ ] Serverless API functions (`/api/*`) work on Vercel (contact, admin, ai, assets).

---

## 12. Regression Checklist (Quick Smoke)

Run this before any release after changes:

- [ ] Home loads, no console errors.
- [ ] Properties grid + one modal opens.
- [ ] Contact form submits and returns a ticket.
- [ ] Chatbot opens and replies.
- [ ] Admin login → Dashboard renders with charts.
- [ ] Create + archive a property.
- [ ] Move a lead through one status.
- [ ] Save one Settings group; confirm it reflects on the public site.
- [ ] `pnpm build` passes.
- [ ] `node scripts/check-asset-guardrails.cjs` passes (no leaked service key).

---

### Appendix A — Key File Map

| Area | File |
|------|------|
| Routing | `src/App.jsx`, `src/routes/admin/AdminShell.jsx` |
| Auth | `src/context/AuthContext.jsx`, `src/components/admin/ProtectedRoute.jsx` |
| Admin layout/nav | `src/components/admin/AdminLayout.jsx`, `Sidebar.jsx`, `Topbar.jsx` |
| Supabase client | `src/lib/supabase.js` |
| Admin API | `server/contact.js`, `api/admin/[...path].js` |
| AI (server) | `server/ai.js`, `api/ai/[...path].js` |
| AI (client) | `src/lib/ai.js`, `src/lib/insights.js` |
| Gallery hook | `src/hooks/usePropertyGallery.js`, `src/lib/assetUrls.js` |
| Firestore rules (legacy) | `firestore.rules`, `storage.rules` |
| Supabase migrations | `supabase/migrations/` (0001 → 1001) |
| Setup/seeding | `scripts/setup-admin.cjs` |
| Drive sync | `scripts/sync-drive-listings.cjs` |
| Health check | `scripts/asset-health-check.js` |
| Guardrails | `scripts/check-asset-guardrails.cjs` |

### Appendix B — Test Data Suggestions

- **Property:** title "Test Warehouse QA", type `warehouse`, status `FOR_LEASE`, price 5000000, floor_area 200.
- **Blog:** slug `qa-test-post`, status `draft` (then publish to verify public visibility).
- **Lead:** name "QA Tester", email `qa@example.com`, message "Testing contact form".
- **Chatbot KB intent:** trigger `qa,test`, answer "QA reply", priority 5, active true.
