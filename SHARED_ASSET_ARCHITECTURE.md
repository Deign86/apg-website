# Shared Supabase Asset Architecture — apg-website × apg-posting-desk
> ⚠️ **PROJECT CONSOLIDATION NOTICE (verified during implementation):**
> The two repos were linked to **different** Supabase projects at inspection time:
> - `apg-website` → `ldtavdybcgwjgticrymz` (canonical — full live schema: offerings, assets, profiles, RLS)
> - `apg-posting-desk` → `rskdjeszbuacezybhvkv` (standalone desk project — now DEPRECATED)
>
> This contradicts `0002_shared_assets.sql`'s old comment, which assumed they already shared `ldtavdybcgwjgticrymz`. Decision: **consolidate onto the website project `ldtavdybcgwjgticrymz`**. All desk files (migrations + Python) now target that project's schema, and the desk's old conflicting `0001` (profiles/jobs/…) has been rewritten to create only desk-owned tables. The **one manual gate** requiring your live-cloud auth:
>   1. In the desk repo: `supabase link --project-ref ldtavdybcgwjgticrymz` (re-link away from the old desk project)
>   2. `supabase db push` (applies the desk's `0001`/`0002` to the canonical project)
>   3. Migrate any existing desk posting history off the old project, then decommission `rskdjeszbuacezybhvkv`.
> The old desk project's profiles/jobs/job_activity/property_queue are NOT re-applied (removed from the migration files).


**Status:** Proposed (opinionated, implementation-ready)
**Audience:** Engineers working on `Deign86/apg-website` and `Deign86/apg-posting-desk`
**Scope:** One unified, Supabase-native asset architecture that both repos follow.

> **How this was produced:** Both local source trees were inspected (`APG Prototype System for Automated Posting` and `Original APG Website`), including every Supabase migration in both repos, the desk's `ingest.py` / `folder_parser.py` / `supabase_assets.py` / `asset_service.py` / `supabase_job_store.py`, the website's `usePropertyGallery.js` / `supabase.js` / `adminApi.js`, and the real `APR LISTING` folder tree. The recommendation reconciles **existing drift** found in the code, it does not assume a green field.

---

## TL;DR (the one-paragraph answer)

**Use ONE shared Supabase project for both repos (Option A).** The website already owns the canonical asset model (`offerings`, `assets`, `property_asset_relations`, `import_batches`, `import_file_mappings`) plus the `apg-public` / `apg-private` buckets and the `is_staff()` / `is_admin()` RLS helpers. The posting desk already targets that same model at runtime (`supabase_assets.py` reads `offerings`/`assets`/`property_asset_relations`; `asset_service.py` writes them; `0002_shared_assets.sql` explicitly says "both repos share ONE Supabase project"). The desk therefore becomes the **write / ingest / workflow side**, and the website remains the **read / consume side** (plus its own admin CMS writes). The work that remains is to (1) extend the canonical model with `categories`, `transaction_types`, `raw_folder_mappings`, and `property_asset_versions`; (2) fix three real divergences — the desk's `ingest.py` writes to non-existent `properties`/`property_assets` tables, the desk's `0001_init.sql` creates a conflicting `profiles` table, and two different storage-path conventions coexist; (3) finish the desk's Firebase→Supabase auth migration so shared RLS works; and (4) run the APR LISTING import into the canonical model.

---

## Text Architecture Diagram

```
                         ┌─────────────────────────────────────────────────┐
                         │        ONE shared Supabase project              │
                         │        (project ref: ldtavdybcgwjgticrymz)       │
                         │                                                 │
                         │  Postgres (canonical system of record)          │
                         │  ┌──────────────────────┐  ┌──────────────────┐ │
                         │  │ SHARED / canonical    │  │ DESK-only         │ │
                         │  │  profiles (auth+role) │  │  posting_jobs     │ │
                         │  │  categories           │  │  posting_job_     │ │
                         │  │  transaction_types    │  │    assets         │ │
                         │  │  offerings (=property)│  │  posted_log       │ │
                         │  │  assets               │  │  daily_report(view)│ │
                         │  │  property_asset_      │  └──────────────────┘ │
                         │  │    relations          │  ┌──────────────────┐ │
                         │  │  property_asset_      │  │ WEBSITE-only       │ │
                         │  │    versions           │  │  inquiries         │ │
                         │  │  raw_folder_mappings  │  │  blog_posts        │ │
                         │  │  import_batches       │  │  job_openings      │ │
                         │  │  import_file_mappings │  │  chatbot_kb        │ │
                         │  │  activity_log (audit) │  │  chat_sessions...  │ │
                         │  └──────────────────────┘  └──────────────────┘ │
                         │                                                 │
                         │  Storage (canonical binary layer)               │
                         │  apg-public  (public read / staff write)        │
                         │  apg-private (staff-only; signed URLs)          │
                         │  path: properties/{pid}/images/{aid}/...        │
                         │                                                 │
                         │  Auth: Supabase Auth → profiles.role            │
                         │  RLS:  is_staff() / is_admin() helpers          │
                         └────────────┬───────────────────────┬────────────┘
                                      │                       │
            WRITE / ingest / workflow│                       │ READ / consume (+ CMS writes)
                                      │                       │
        ┌─────────────────────────────▼───┐     ┌─────────────▼────────────────────┐
        │  apg-posting-desk               │     │  apg-website                     │
        │  (Python FastAPI + Vite PWA)    │     │  (Vite + React + Node API)       │
        │                                 │     │                                  │
        │  • ingest.py → import APR LISTING │     │  • Public site = read-only       │
        │  • asset_service.py → upload/     │     │    (offerings, assets, relations)│
        │    version/approve/publish        │     │  • usePropertyGallery → hero +    │
        │  • supabase_assets.py → read for  │     │    gallery via getPublicUrl       │
        │    operator review (signed URLs)  │     │  • Admin panel = privileged CMS   │
        │  • posting_jobs workflow +        │     │    via /api/admin/* (server,      │
        │    caption generation (NVIDIA NIM)│     │    service role; never in client) │
        │  • human-in-the-loop FB publish   │     │  • signed URLs for private assets │
        └──────────────────────────────────┘     └───────────────────────────────────┘

  Ingestion source (NOT runtime): C:\...\APR LISTING  →  one-time / on-demand import only
```

---

## 1. Shared Architecture Recommendation

**Recommendation: Option A — one shared Supabase project for both repos.**

This is not a new decision; the codebase already committed to it. `apg-posting-desk/supabase/migrations/0002_shared_assets.sql` states verbatim: *"Both repos share ONE Supabase project (ldtavdybcgwjgticrymz). The website owns canonical asset tables; the desk owns posting workflow tables that reference them."* The desk's `config.yaml` already defines `bucket_private: apg-private` and `bucket_public: apg-public` — the **exact** bucket names the website creates in `011_asset_layer.sql`. The desk's runtime read adapter (`supabase_assets.py`) and write adapter (`asset_service.py`) already query/write the website's `offerings`, `assets`, and `property_asset_relations`.

**Why one project (defense of A over B — separate projects + shared abstraction):**

| Criterion | One shared project (A) | Two projects + abstraction (B) |
|---|---|---|
| Canonical IDs | One `offerings.id`/`assets.id` space — no translation. | Must sync IDs or maintain a mapping layer. |
| Storage | One set of buckets; upload once. | Duplicate uploads or cross-project copy/signing — exactly what you want to avoid. |
| Auth / RLS | One `profiles` table, one `is_staff()` helper, uniform RLS. | Two user directories; RLS can't span projects; double auth. |
| Drift risk | Low — single schema source of truth. | High — two schemas drift; abstraction becomes a burden. |
| Cost / ops | One project to back up, monitor, migrate. | Two of everything. |
| Fit to reality | Website already live on it; desk already targets it. | Would rewind working code. |

Option B only pays off with isolated scaling, separate data residency, or separate security boundaries. APG's website and posting desk are the same company, same data domain, same staff, same listing photos. There is no isolation requirement. **Choose A.**

**Principles enforced by this design:**

1. Supabase Postgres = canonical metadata + workflow layer; Supabase Storage = canonical binary layer. The Windows `APR LISTING` folder is an **ingestion source only**, never read at runtime.
2. Raw folder names are **never** permanent identifiers. Canonical IDs are UUIDs. Raw paths live only in `raw_folder_mappings` / `import_file_mappings` for audit.
3. Privileged mutations happen **server-side** with the service-role key. The browser never receives `SUPABASE_SERVICE_ROLE_KEY`.
4. Versioning is non-destructive: edits create new versions, never overwrite.
5. Public listing images → `apg-public` (public read); protected/internal files → `apg-private` (staff-only, signed URLs).
6. Both repos interoperate via shared metadata + shared storage conventions, not duplicated uploads.

---

## 2. Cross-Repo Responsibility Split

| Concern | Owner | Tables / buckets | Notes |
|---|---|---|---|
| Canonical property/listing record | **website** (DDL owner) | `offerings` | Desk references + ingests into it; desk does not own DDL. |
| Canonical file record | **website** (DDL owner) | `assets` | One row per logical file/version. |
| Property↔asset link, role, order | **website** (DDL owner) | `property_asset_relations` | `gallery_role`, `display_order`, `is_cover`. |
| Asset versioning history | **shared** (new) | `property_asset_versions` | Both repos' admins edit assets → history must be shared. |
| Categories & transaction types | **shared** (new) | `categories`, `transaction_types` | Lookup tables referenced by `offerings`. |
| Raw folder → property mapping | **shared** (new) | `raw_folder_mappings` | Preserves messy source folder name + parse confidence. |
| Import batches & file mappings | **website** (DDL owner) | `import_batches`, `import_file_mappings` | Desk's `ingest.py` writes here. |
| Audit trail | **shared** | `activity_log` | Already used by website; `asset_service.py` already writes to it. **Not** a desk-only `audit_logs`. |
| Auth, users, roles | **shared** | `profiles`, `auth.users` | Desk must finish Firebase→Supabase migration. |
| Posting workflow | **desk-only** | `posting_jobs`, `posting_job_assets` | Facebook posting jobs. |
| Posted reporting | **desk-only** | `posted_log`, `daily_report` (view) | Denormalized convenience; derivable from `posting_jobs`. |
| Public site rendering | **website** | read `offerings`/`assets`/relations | Read-only for anonymous visitors. |
| Admin CMS | **website** | write canonical via server | Privileged, server-side. |
| Ingest from APR LISTING | **desk** | writes canonical + storage | Desk is the import operator. |
| Caption generation (NVIDIA NIM) | **desk** | `posting_jobs.selected_caption` | Human-in-the-loop; manual FB publish. |

**Mental model:** the desk is the *write/ingest/workflow* side; the website is the *read/consume* side (its admin CMS is a co-writer of canonical content). Both write the **same** canonical tables; only workflow/reporting tables are desk-specific.

**What apg-website treats as read-only vs mutable:**

- **Public site:** strictly read-only. Reads `offerings`, `assets` (`is_public = true` and `ingestion_status = 'active'`), `property_asset_relations`. Never uploads/deletes/mutates storage from the public bundle. Hero/gallery URLs via `getPublicUrl(asset)` against `apg-public`.
- **Admin panel:** privileged writer **co-owner** of the canonical model. May create/edit/archive offerings, upload/replace/approve assets, set cover + gallery order — but always through the Node server (`/api/admin/*`, `/api/assets/signed-url`) with the service role, never with the service-role key in the browser. Must **not** touch `posting_jobs`, `posting_job_assets`, `posted_log`, or `raw_folder_mappings`.

**What apg-posting-desk is allowed to mutate:**

- `offerings` (insert from ingest; update canonical fields, cover, gallery_count)
- `assets` (insert, archive, restore, set_public) via `asset_service.py`
- `property_asset_relations` (insert, reorder, set cover) via `asset_service.py`
- `property_asset_versions` (insert new versions)
- `raw_folder_mappings`, `import_batches`, `import_file_mappings` (ingest bookkeeping)
- `categories`, `transaction_types` (upsert during ingest)
- `posting_jobs`, `posting_job_assets`, `posted_log` (desk-owned workflow)
- `activity_log` (append audit entries)

The desk must **not** mutate website-only tables (`inquiries`, `blog_posts`, `job_openings`, `chatbot_kb`, `chat_*`, `services`, `site_settings`).

---

## 3. Folder Hierarchy Mapping

**Observed real structure of `APR LISTING`** (verified by directory listing):

```
APR LISTING/
├─ CONDO - HOUSE AND LOT/
│   ├─ FOR LEASE- FOR RENT/        ← messy: "FOR LEASE- FOR RENT"
│   │   └─ <property folders>
│   └─ FOR SALE/
├─ COMMERCIAL SPACE/
│   ├─ For lease/                  ← mixed case
│   └─ For Sale/
├─ OFFICE SPACE/
│   ├─ FOR LEASE - RENT/
│   └─ FOR SALE/
├─ WAREHOUSE/
│   ├─ FOR LEASE-RENT/
│   └─ FOR SALE/
├─ SOLD/                           ← BREAKS pattern: no txn subfolder
│   ├─ <property folders directly>     (txn implied = sold)
│   ├─ SOLD COMMERCIAL SPACE/      ← nested sub-category
│   ├─ SOLD OFFICE SPACE/
│   ├─ SOLD WAREHOUSE/
│   └─ House-Lot Sold/
└─ Virtual Office for posting/     ← BREAKS pattern: versioned folders
    ├─ 2026 NEW VIRTUAL OFFICE/
    └─ 2026 V2.0 NEW VIRTUAL OFFICE_/
```

**Canonical mapping rules:**

| Source level | Maps to | Rule |
|---|---|---|
| `APR LISTING/<Category>` | `categories` + `offerings.category_id` | `classify_category()` → uppercase name + slug. `SOLD` and `Virtual Office for posting` are categories too. |
| `<Category>/<Txn>` | `transaction_types` + `offerings.transaction_type_id` | `classify_transaction_type()`: LEASE/RENT/LEASING→`lease`; SALE→`sale`; SOLD→`sold`; VIRTUAL→`virtual`. Handles `FOR LEASE- FOR RENT`, `For lease`, `FOR LEASE - RENT`, `FOR LEASE-RENT`. |
| `<Category>/<Txn>/<Property>` | `offerings` (canonical property) | Parse name → `normalized_title`, `slug`, `location_label`, `approximate_area_sqm`. `offerings.id` (uuid) = canonical property ID; raw folder name → `raw_folder_mappings`. |
| Files inside `<Property>` | `assets` + `property_asset_relations` + `property_asset_versions` | `.jpg/.jpeg/.png`→`image`; `.docx/.pdf/.txt`→`document` (caption-details). Real example: `00.jpg`, `8.jpg`, `9.jpg`, `Untitled document.docx`. |

**Special-case handling (encode in the walker, do not assume):**

- **SOLD:** property folders may sit **directly** under `SOLD/` (txn implied `sold`), **or** under a nested sub-category (`SOLD COMMERCIAL SPACE`, `SOLD OFFICE SPACE`, `SOLD WAREHOUSE`, `House-Lot Sold`). Rule: if a child of `SOLD/` contains image files → it is a property (txn=`sold`, category=`SOLD`). If a child contains only subfolders → it is a sub-category; recurse one level, keeping txn=`sold`.
- **Virtual Office for posting:** children are iteration folders (`2026 NEW VIRTUAL OFFICE`, `2026 V2.0 NEW VIRTUAL OFFICE_`), not transaction types. Set transaction_type=`virtual`; store the iteration folder name in `raw_folder_mappings.iteration_label`; recurse to find property folders.
- **Flat files directly under a transaction folder:** keep `ingest.py`'s existing fallback that treats the txn folder itself as one property when images live directly under it.

---

## 4. Shared Canonical Data Model

The canonical model = the website's **existing** tables (`offerings`, `assets`, `property_asset_relations`, `import_batches`, `import_file_mappings`, `activity_log`, `profiles`) **extended** with four new shared tables (`categories`, `transaction_types`, `raw_folder_mappings`, `property_asset_versions`). We keep the website's table names to avoid renaming a live table; the desk's `ingest.py` must be refactored to write these names (see §13).

> **ID type note:** the live `offerings.id` is `uuid` (per `supabase/schema.sql` and the desk's `0002` FK `offering_id UUID REFERENCES offerings(id)`). If your live table is still `bigint` from `001_schema.sql`, migrate to `uuid` before adopting shared canonical IDs. All examples below assume `uuid`.

### 4.1 `categories` (new, shared lookup)
```
categories
  id            uuid pk default gen_random_uuid()
  name          text unique not null      -- normalized uppercase, e.g. "CONDO - HOUSE AND LOT"
  slug          text unique not null      -- "condo-house-and-lot"
  parent_id     uuid references categories(id)  -- for SOLD COMMERCIAL SPACE under SOLD
  display_order int  default 0
  created_at    timestamptz default now()
```

### 4.2 `transaction_types` (new, shared lookup)
```
transaction_types
  id    uuid pk default gen_random_uuid()
  name  text unique not null   -- 'lease' | 'sale' | 'sold' | 'virtual'
  label text                  -- human label "For Lease", "For Sale", "Sold", "Virtual Office"
```

### 4.3 `offerings` (existing; extended columns)
Existing columns kept: `title, location, property_type, sub_property_type, status, price, price_unit, floor_area, lot_area, description, slug, images(jsonb legacy), is_published, deleted_at, cover_asset_id, gallery_count, import_batch_id, created_at, updated_at`.
**Add:**
```
alter table offerings
  add column if not exists category_id          uuid references categories(id),
  add column if not exists transaction_type_id  uuid references transaction_types(id),
  add column if not exists raw_folder_name      text,   -- traceability only
  add column if not exists raw_folder_path      text,   -- full source path; audit only, never exposed to frontend
  add column if not exists normalized_title     text,
  add column if not exists location_label       text,   -- city + area, human label
  add column if not exists approximate_area_sqm numeric,-- parsed sqm (first/primary value)
  add column if not exists parse_confidence     text default 'high'
                     check (parse_confidence in ('high','partial','low')),
  add column if not exists parse_errors         jsonb default '[]'::jsonb;
create unique index if not exists offerings_slug_key on offerings(slug);
```
`offerings.id` is the **canonical property ID** used in storage paths.

### 4.4 `raw_folder_mappings` (new, shared — folder→property audit)
```
raw_folder_mappings
  id                uuid pk default gen_random_uuid()
  property_id       uuid not null references offerings(id) on delete cascade
  raw_folder_name   text not null            -- "_Novaliches, 7,713 Nagkaisang Nayon"
  raw_folder_path   text not null            -- full source path
  category_id       uuid references categories(id)
  transaction_type_id uuid references transaction_types(id)
  iteration_label   text                     -- for Virtual Office: "2026 V2.0 NEW VIRTUAL OFFICE_"
  parse_payload     jsonb                    -- full parser output (city, area, sqm, errors)
  parse_confidence  text check (... in ('high','partial','low'))
  import_batch_id   text references import_batches(id)
  created_at        timestamptz default now()
unique (raw_folder_path)                       -- one canonical property per source folder
```
RLS: staff-only (internal traceability; never frontend-facing).

### 4.5 `assets` (existing — canonical file record)
Already defined in `011_asset_layer.sql`. Key fields: `id uuid`, `asset_type` (`image|brochure|floor_plan|document|video`), `mime_type`, `size_bytes`, `original_name`, `storage_path` (UNIQUE), `storage_bucket` (`apg-public|apg-private`), `width`, `height`, `is_public`, `import_batch_id`, `source_path` (Windows path, audit only), `ingestion_status` (`active|archived|error|pending_review`), `error_message`, `created_by`, timestamps.
**Add one column for the version link:**
```
alter table assets add column if not exists current_version int not null default 1;
```
RLS: public reads `where is_public=true and ingestion_status='active'`; staff full CRUD (already in 011).

### 4.6 `property_asset_relations` (existing — link, role, order)
Already in 011: `offering_id`, `asset_id`, `gallery_role` (`hero|gallery|thumbnail|brochure|floor_plan`), `display_order`, `alt_text`, `caption`, `is_cover`. This is the join the website's `usePropertyGallery` and the desk's `supabase_assets._list_offering_assets` both read. No change needed.

### 4.7 `property_asset_versions` (new, shared — non-destructive history)
The website currently does "replace = new asset + archive old" with **no** version table. Add explicit versioning so both repos preserve history and the desk's facebook-ready derivatives are tracked.
```
property_asset_versions
  id              uuid pk default gen_random_uuid()
  asset_id        uuid not null references assets(id) on delete cascade
  version_number  int  not null
  storage_bucket  text not null check (... in ('apg-public','apg-private'))
  object_path     text not null          -- the versioned file in storage
  derivative_kind text default 'original'-- 'original' | 'thumb' | 'facebook-ready' | 'web-optimized'
  width int, height int, size_bytes bigint
  created_by      uuid references profiles(id)
  is_current      boolean not null default true
  created_at      timestamptz not null default now()
unique (asset_id, version_number, derivative_kind)
```
A new edit = new row with `version_number = max+1`, set previous `is_current=false`. The `assets.storage_path` always points at the **current** version; `property_asset_versions` holds the history. RLS: public can read current public versions; staff full CRUD.

### 4.8 `import_batches` + `import_file_mappings` (existing)
As defined in 011. **Important reconciliation:** the desk's `ingest.py` currently inserts `import_batches` with columns `property_count, asset_count, error_count, dry_run` — **those columns do not exist** in the website's `import_batches` (which has `stats jsonb, error_summary`). `ingest.py` must be fixed to use `stats jsonb` (see §7). `import_file_mappings` (per-file: `source_path, source_filename, source_folder, file_size_bytes, mime_type, checksum_sha256, asset_id, status`) is the **file-level** dedup/audit table; `raw_folder_mappings` is the **folder-level** mapping. They are complementary, not redundant.

### 4.9 `activity_log` (existing, shared audit)
Already used by the website and by `asset_service.py._audit()`. This is the **single** audit trail for both repos. Do **not** create a separate desk-only `audit_logs` table. Schema owner: website.

### 4.10 `profiles` (existing, shared — single user/role directory)
**Critical reconciliation:** the desk's `0001_init.sql` creates its **own** `profiles` (role `admin|user`) **and** its own `handle_new_user` trigger. The website already has `profiles` (role enum `owner|moderator|admin` per 001, or text `admin|editor` per `schema.sql`, consolidated in `0100_consolidate_roles`). Two `profiles` definitions + two triggers in the same project is a **conflict**. The desk's `0001` profiles/trigger **must be dropped**; both repos use the website's single `profiles` + single trigger.

**Unified role recommendation** (resolve the role-set drift): adopt one set across both repos — `owner | admin | staff | viewer` — where:
- `is_admin()` ⟺ role in (`owner`,`admin`)
- `is_staff()` ⟺ role in (`owner`,`admin`,`staff`)  (desk operators are `staff`)
- `viewer` = read-only internal
Map the desk's old `user` role → `staff`. Update `is_staff()`/`is_admin()` helpers and RLS accordingly.

---

## 5. Repo-Specific Data and Workflow Boundaries

### 5.1 Desk-specific tables (owned by apg-posting-desk)

**`posting_jobs`** (from `0002_shared_assets.sql` — keep, this is the aligned design):
```
posting_jobs
  id                 text pk               -- "APG-0704-001"
  offering_id        uuid references offerings(id) on delete set null  -- canonical property
  assigned_by        text
  operator           text
  due_date           date
  status             text check (... in ('assigned','preparing','ready','posted','cancelled'))
  selected_caption   text
  caption_details    text                  -- source caption doc text
  final_facebook_url text
  approved_by        uuid references profiles(id)
  approved_at        timestamptz
  created_on         date default current_date
  created_at, updated_at timestamptz
```
Note: `offering_id` replaces the old `property_name` text field so a job points at the **canonical property**. `approved_by`/`approved_at` record the human-in-the-loop sign-off.

**`posting_job_assets`** (from `0002` — keep):
```
posting_job_assets
  id               bigserial pk
  job_id           text not null references posting_jobs(id) on delete cascade
  asset_id         uuid not null references assets(id) on delete cascade  -- canonical asset
  display_order    int  default 0
  selected         boolean default true
  caption_override text
  unique (job_id, asset_id)
```
This is the **ordered, selected subset** of canonical assets chosen for one Facebook post. It references `assets.id` — the same images the website shows in its gallery. No duplication of bytes.

**`posted_log` + `daily_report` (view)** (from desk `0001` — keep as desk-only reporting):
`posted_log` is a denormalized record of completed posts; `daily_report` aggregates it into the bullet format the old Google Doc produced. Keep them desk-owned. They are derivable from `posting_jobs` where `status='posted'`, but retained for the report workflow and external parity.

### 5.2 Tables to DEPRECATE from the desk's `0001_init.sql`

The desk's `0001` was a self-contained Firebase-replacement schema. With the shared-project decision, most of it is obsolete or conflicting:

| `0001` table | Disposition | Reason |
|---|---|---|
| `profiles` | **DROP** (use website's) | Conflicting duplicate; breaks single user directory. |
| `handle_new_user` trigger | **DROP** (use website's) | Duplicate trigger on `auth.users`. |
| `property_queue` | **DROP / fold into `posting_jobs`** | Queue claim logic moves to `posting_jobs` status + a `claim_next_job()` function. |
| `jobs` | **DROP** | Superseded by `posting_jobs`. `supabase_job_store.py` must be refactored onto `posting_jobs`. |
| `job_activity` | **DROP / fold into `activity_log`** | One shared audit trail. |
| `posted_log` | **KEEP** (desk-only) | Reporting. |
| `daily_report` | **KEEP** (desk-only view) | Reporting. |

### 5.3 Website-specific tables (unchanged, not touched by the desk)
`inquiries`, `blog_posts`, `job_openings`, `chatbot_kb`, `chat_sessions`, `chat_messages`, `services`, `site_settings`, `offering_comments`, `offering_ratings`, `offering_reactions`. The desk never reads or writes these.

### 5.4 Boundary enforcement
- **RLS** keeps desk staff out of website-only tables (no policy grants them access).
- **Schema ownership**: the website repo owns DDL for all shared canonical tables + website-only tables. The desk repo owns DDL only for `posting_jobs`, `posting_job_assets`, `posted_log`, `daily_report`. Migrations are applied to the **same** project from both repos, but each repo only ships migrations for the tables it owns (idempotent `create table if not exists` / `add column if not exists`).
- **No cross-repo direct DB coupling beyond shared canonical tables.**

---

## 6. Supabase Buckets and Access Rules

**Two canonical buckets for property/listing assets** (already created by the website in `011_asset_layer.sql`, already named in the desk's `config.yaml`):

| Bucket | Public? | MIME / size | Read | Write | Used for |
|---|---|---|---|---|---|
| `apg-public` | **public** | jpeg/png/webp/avif, 10 MB | anyone (anon) | staff (RLS `is_staff()`) | Published hero, gallery, thumbnail, web-optimized listing images |
| `apg-private` | **private** | pdf/jpeg/png, 25 MB | staff only (signed URLs) | staff (RLS `is_staff()`) | Raw originals, caption-details docs, brochures, floor plans, facebook-ready working copies, anything not yet approved/published |

**Access rules (already in `012_storage_rls.sql`; keep, extend):**

- `apg-public`: `select` for anyone (no auth); `insert/update/delete` for `authenticated` where `is_staff()`.
- `apg-private`: `select/insert/update/delete` for `authenticated` where `is_staff()` only. **No public read.** Private assets are served via **signed URLs** minted server-side (`usePrivateAsset` → `POST /api/assets/signed-url`; TTL from `config.yaml.signed_url_ttl_seconds`, default 3600).

**Per-asset visibility is data-driven, not just bucket-driven.** `assets.is_public` + `assets.storage_bucket` decide behavior:
- An asset with `is_public=true` **and** `storage_bucket='apg-public'` → website `getPublicUrl()` returns the public URL (no auth).
- An asset with `is_public=false` **or** `storage_bucket='apg-private'` → served by signed URL only.

**Publishing model (recommended):** ingest uploads **originals + caption docs + brochures to `apg-private`** with `is_public=false`, `ingestion_status='pending_review'`. The desk/website admin reviews; on approval the system derives a web-optimized public image (resize/webp), uploads it to `apg-public`, flips `is_public=true` and `ingestion_status='active'`, and the relation `gallery_role` decides hero/gallery/thumbnail. This keeps raw/internal material private and only exposes curated public imagery — matching your preference for public buckets for truly public images and private+signed for protected/internal files.

**Legacy buckets** (`offerings`, `blogs`, `careers`, `admins`, `chat` from `007`): keep for non-property content (blog/career images, chat, admin avatars) during migration; do **not** store property/listing images there. Plan to retire `offerings` bucket once all listing images live under `apg-public`/`apg-private` with `assets` records.

**Never expose privileged credentials:** `SUPABASE_SERVICE_ROLE_KEY` is server-only (Node API, Python FastAPI). The browser uses `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` only.

---

## 7. Import Pipeline From APR LISTING Into Supabase

The desk's `ingest.py` is the right *shape* (walk → parse → upsert → upload → dedup) but currently writes to **non-existent** tables (`properties`, `property_assets`) and uses **wrong** `import_batches` columns. Refactor it onto the canonical model. The Windows folder is read **only** by this pipeline; runtime never touches it.

**Pipeline steps (refactored `ingest.py`):**

1. **Start batch:** insert `import_batches` row `{id, source_root, status:'running', stats:{}, started_at}`. (Do **not** use the old `property_count/asset_count/error_count/dry_run` columns.)
2. **Walk tree** with the §3 rules: `APR LISTING/<Category>/<Txn>/<Property>/files`, handling SOLD and Virtual Office special cases.
3. **For each Category:** `classify_category()` → upsert `categories` (by `name`); for SOLD sub-categories set `parent_id`.
4. **For each Txn:** `classify_transaction_type()` → upsert `transaction_types` (by `name`).
5. **For each Property folder:** `parse_property_folder_name()` → build `normalized_title`, `slug`, `location_label`, `approximate_area_sqm`, `parse_confidence`, `parse_errors`.
6. **Upsert `offerings`** by `slug`: if exists, reuse `offerings.id` (canonical property ID); else insert new uuid. Set `category_id`, `transaction_type_id`, `raw_folder_name`, `raw_folder_path`, `normalized_title`, `location_label`, `approximate_area_sqm`, `parse_confidence`, `parse_errors`, `import_batch_id`. Leave `is_published=false`, `ingestion_status`-style fields default until approved.
7. **Insert `raw_folder_mappings`** row (`property_id`, `raw_folder_name`, `raw_folder_path`, category/txn ids, `parse_payload`, `parse_confidence`, `import_batch_id`). On conflict of `raw_folder_path`, reuse the existing mapping (re-import is idempotent).
8. **For each file:** compute `sha256`. **Dedup:** check `import_file_mappings` by `checksum_sha256` (global) **and** `assets` by `(property_id, sha256)` via relations. If a matching active asset already exists for this property → `status:'skipped_duplicate'`, skip upload. This prevents duplicate uploads of the same image into different projects/buckets.
9. **Upload** to storage with the canonical nested path (§12): originals + docs → `apg-private`; (optionally) derived public image → `apg-public`. Use `asset_id` in the path, **never** the raw filename (handles non-ASCII like `Tiño`, `Parañaque` and collisions like `00.jpg`).
10. **Insert `assets`** row (`id`, `asset_type`, `mime_type`, `size_bytes`, `original_name`, `storage_path`, `storage_bucket`, `width`, `height`, `is_public=false` initially, `import_batch_id`, `source_path` = raw Windows path [audit], `ingestion_status='pending_review'`, `current_version=1`, `created_by`).
11. **Insert `property_asset_relations`** row (`offering_id`, `asset_id`, `gallery_role='gallery'`, `display_order` by filename sort, `is_cover=false`). First image (lowest sort) can be auto-promoted to `hero`/`is_cover` if none exists.
12. **Insert `property_asset_versions`** row (`asset_id`, `version_number=1`, `storage_bucket`, `object_path`, `derivative_kind='original'`, `is_current=true`).
13. **Insert `import_file_mappings`** row (`import_batch_id`, `source_path`, `source_filename`, `source_folder`, `file_size_bytes`, `mime_type`, `checksum_sha256`, `asset_id`, `status:'uploaded'`).
14. **Finalize batch:** update `import_batches` `{status:'completed'|'partial_failure', stats:{properties,assets,skipped,errors}, completed_at}`. Append `activity_log` entry.

**Modes:** `--dry-run` (walk + parse + dedup check, no writes; report planned actions), `--verify` (compare Supabase contents against the folder; report missing/orphaned), live (default). Keep these flags from the existing `ingest.py`.

**Idempotency:** re-running on the same folder must not duplicate assets (sha256 dedup) or properties (slug upsert) or mappings (`raw_folder_path` unique). This is what makes the Windows folder a safe re-ingestable source rather than a fragile one-shot.

---

## 8. Upload, Versioning, Approval, and Publishing Flow

This is the lifecycle that makes the desk the write side and the website the consume side. State lives on `assets.ingestion_status` + `assets.is_public` + `property_asset_versions`, and on `posting_jobs.status`.

**Asset lifecycle states (`assets.ingestion_status`):**
`pending_review` → `active` → `archived` (soft delete). Transitions: `error` on failure; `archived` is reversible via `restore_asset`.

**Upload (desk `asset_service.upload_asset`):**
1. Compute sha256; dedup against existing assets for the offering.
2. Generate `asset_id` (uuid); upload bytes to the chosen bucket at canonical path (§12).
3. Insert `assets` (is_public per caller, ingestion_status per caller), `property_asset_relations`, `property_asset_versions(v1, is_current=true)`.
4. Audit via `activity_log`.

**Versioning — edits create new versions, never overwrite:**
- An "edit/replace" = upload a **new version** of the **same** asset: new `property_asset_versions` row with `version_number = max+1`, new `object_path` under `.../v{n}/...`, set previous rows `is_current=false`, update `assets.storage_path` to the new current path, bump `assets.current_version`. The old bytes stay in storage (non-destructive).
- This **replaces** the website's current "replace = new asset + archive old" pattern in `asset_service.replace_asset` with true in-place versioning while keeping `assets.id` stable (so `property_asset_relations`, `posting_job_assets`, and the website's `cover_asset_id` references don't break).
- Derivatives (`thumb.webp`, `facebook-ready.jpg`, `web-optimized.webp`) are versioned too: same `asset_id`, different `derivative_kind`, each with its own `object_path`.

**Approval (human-in-the-loop):**
- Ingested assets enter as `pending_review`, `is_public=false`, bucket `apg-private`.
- A staff member (desk operator or website admin) reviews. Approving sets `ingestion_status='active'` and records `approved_by`/`approved_at` (on the offering or on a per-asset approval; recommend per-asset `approved_by`/`approved_at` columns on `assets`).
- Rejecting sets `ingestion_status='archived'` with `error_message`.

**Publishing (making an asset public on the website):**
- On approval + publish: derive a public-optimized image (resize/webp), upload to `apg-public`, set `assets.is_public=true` and `storage_bucket='apg-public'` for the public derivative's version row, keep the original in `apg-private`. The website's `usePropertyGallery` reads `assets` where `is_public=true and ingestion_status='active'` and renders via `getPublicUrl`.
- `offerings.is_published` gates whether the property appears publicly at all; `offerings.cover_asset_id` + `property_asset_relations.is_cover` decide the hero.

**Posting workflow states (`posting_jobs.status`):**
`assigned` → `preparing` → `ready` → `posted` (+ `cancelled`).
- `assigned`: job created, pointing at `offering_id`.
- `preparing`: desk fetches assets via `supabase_assets` (read canonical), selects subset into `posting_job_assets`, generates caption (NVIDIA NIM, APG rules).
- `ready`: caption approved (`approved_by`/`approved_at`), ≥3 images selected, ready for manual FB publish.
- `posted`: operator pastes `final_facebook_url`; write `posted_log` row; append `activity_log`.

**What this prevents:** duplicate uploads (sha256 dedup + shared buckets), drift (one canonical `assets` row referenced by both repos), broken references (stable `assets.id` across versions), and incompatible conventions (one storage path pattern, §12).

---

## 9. Runtime Data Flow for apg-posting-desk

At runtime the desk reads/writes the **shared canonical** backend. The Windows folder is not involved.

**Sign-in:** Supabase Auth (complete the Firebase→Supabase migration). The PWA obtains a session; `SupabaseTokenVerifier.verify()` reads `profiles.role`. Operators are `staff` (satisfies `is_staff()` RLS).

**Job intake (admin assigns):**
- Create `posting_jobs` row (`offering_id`, `assigned_by`, `operator`, `due_date`, `status='assigned'`). The admin picks from canonical `offerings` (not a free-text property name) — so a job is bound to a canonical property ID from the start.

**Prepare (operator works a job):**
1. `ReviewPipeline.prepare()` uses `SupabaseAssetRepository.find_property_folder(offering_id)` → `_find_offering` + `_list_offering_assets` (reads `property_asset_relations` join `assets`, ordered by `display_order`, excluding archived).
2. Caption: `ContentExtractor` reads the caption-details document bytes from `apg-private` (`download_file` via `storage.from_(bucket).download(storage_path)`), `CaptionGenerator` (NVIDIA NIM) produces caption with APG rules; `validate_caption` enforces no emojis / no "least term" / no "negotiables".
3. Operator selects ≥3 images → write `posting_job_assets` rows (ordered, `selected=true`). For private/original images the PWA displays them via **signed URLs** (`get_signed_url`, TTL 3600); for public derivatives it can use public URLs.
4. On caption approval: `posting_jobs.status='ready'`, set `selected_caption`, `approved_by`, `approved_at`.

**Publish (human-in-the-loop):**
- Operator manually posts to Facebook, pastes `final_facebook_url`, clicks Log Post.
- `review_pipeline.log_post()` validates URL prefix, `TrackerUpdater` writes `posted_log` row + appends `activity_log`; `posting_jobs.status='posted'`.

**Privileged writes (server-side, service role):** all run through `asset_service.py` (`upload_asset`, `replace_asset`→version, `archive_asset`, `restore_asset`, `set_public`, `set_gallery_order`, `set_cover`). The PWA never uses the service-role key; it calls FastAPI routes which use `build_supabase_client(url, service_role_key)`.

**Reporting:** `daily_report` view reads `posted_log` for the bullet report (replaces the old Google Doc).

**Net:** the desk mutates canonical tables + desk-only workflow tables; it reads canonical assets for review. No second file backend.

---

## 10. Runtime Data Flow for apg-website

**Public site (anonymous, read-only):**
1. Catalog page queries `offerings` where `is_published=true and deleted_at is null`, joined to `categories`/`transaction_types` for filters. Search uses the existing `search_vector` GIN index.
2. Detail page calls `usePropertyGallery(offeringId)`:
   - `supabase.from('property_asset_relations').select('*, asset:assets(*)').eq('offering_id', offeringId).order('display_order')`.
   - RLS returns only rows where the joined `assets.is_public=true and ingestion_status='active'` (the public-read policy on `assets` + relation policy).
   - `hero = rows.find(is_cover) || rows[0]`; `gallery = rows.filter(role in ('gallery','hero'))`.
3. Image URLs via `getPublicUrl(asset)` → `supabase.storage.from(asset.storage_bucket || 'apg-public').getPublicUrl(asset.storage_path)`. Resizes via `getTransformedUrl` (Supabase Image Transform query params). **No service-role key in the browser** — only `VITE_SUPABASE_ANON_KEY`.
4. Private assets (brochures, floor plans) are fetched via `usePrivateAsset` → `POST /api/assets/signed-url` (Node server mints a signed URL using the service role).

**Admin panel (privileged CMS, co-owner of canonical model):**
- Auth via Supabase Auth; admin role satisfies `is_admin()`/`is_staff()`.
- Properties CRUD, asset upload/replace/approve/publish, set cover + gallery order — all through `/api/admin/*` server routes (service role). These hit the **same** `offerings`/`assets`/`property_asset_relations`/`property_asset_versions` tables the desk writes. An asset approved/published by the website admin is immediately available to the desk's posting jobs and to the public site.
- The admin panel must **not** touch `posting_jobs`, `posting_job_assets`, `posted_log`, `raw_folder_mappings` (RLS denies; UI does not expose them).

**What the website treats as read-only:** the public bundle never mutates storage or canonical tables. `getPublicUrl` is a pure read. The only writers are the admin server routes (privileged) — and those write the same canonical rows the desk writes, so there is one source of truth, not two.

**Interoperability result:** when the desk ingests and publishes a listing's images, the website catalog/detail pages render them with zero duplicated uploads — both read the same `assets` rows and the same `apg-public` objects.

---

## 11. Handling Renames, Duplicates, and Messy Data

**Rule 1 — raw folder names are never IDs.** The canonical key is `offerings.slug` (derived, normalized) and `offerings.id` (uuid). The raw name is stored verbatim in `raw_folder_mappings.raw_folder_name` and `offerings.raw_folder_name` for traceability only.

**Parsing strategy** (extend `folder_parser.parse_property_folder_name`). Worked example — input: `_Novaliches, 7,713 Nagkaisang Nayon`

1. **Strip leading noise:** remove leading `[_\-. ,]+` → `Novaliches, 7,713 Nagkaisang Nayon`.
2. **Split on first comma** → city=`Novaliches`, remainder=`7,713 Nagkaisang Nayon`.
3. **Extract first numeric (allow comma decimals):** regex `(\d[\d,]*(?:\.\d+)?)` → `7,713` → `size_sqm=7713` (strip commas → numeric `approximate_area_sqm=7713`). Remainder=`Nagkaisang Nayon`.
4. **Remainder = area/sub-location:** strip `SQM`/`sqm`/`SQ. M.`, strip category suffixes (`- Commercial`, `- Warehouse`...), strip parentheses → `Nagkaisang Nayon`.
5. **normalized_title** = `Novaliches, Nagkaisang Nayon, 7713 sqm`.
6. **slug** = lowercase, `[, ]+→-`, strip non-`[a-z0-9-]`, collapse dashes → `novaliches-nagkaisang-nayon-7713-sqm`.
7. **parse_confidence:** `high` if city + sqm + area all present; `partial` if one missing; `low` if none. `parse_errors` lists what failed.

**Fallback rules for unknown / partially parsed values:**
- **No comma / no city:** treat the whole stripped string as `location_label`; `location_city=''`; confidence `partial`.
- **Multiple numbers** (e.g. `Bulacan, 1708, 1853, 1697... Pulong Gubat` — a compound with several lot areas): take the **first** as `approximate_area_sqm`; store **all** numbers in `parse_payload.extra_areas[]`; confidence `partial` with error `"multiple_area_values"`. Let a human pick the canonical area in review.
- **Decimals** (`Cainta, 5,617.45`, `Makati, 30.4`): keep the decimal; `approximate_area_sqm=5617.45`.
- **Bare number** (`1111` in SOLD): city='', area='', size_sqm=1111; confidence `low`; flag for manual review. Do **not** invent a city.
- **Trailing/leading underscores** (`_Bulacan, 1,900 Marilao`, `...West Service Road_`): strip them; they are noise.
- **Non-ASCII / mangled** (`Tiño`, `Parañaque`, `Dasmariñas`): keep the original bytes in `raw_folder_name`; build slug from a **slugified** version (strip diacritics or transliterate to ASCII) so slugs stay URL-safe and unique. Never put raw non-ASCII into storage paths.
- **Unparseable:** still create the `offerings` + `raw_folder_mappings` row with `parse_confidence='low'` and `parse_errors`, so the property is not lost; surface it in a review queue (`ingestion_status='pending_review'`) for a human to fix `normalized_title`/`slug`.

**Renames (a folder is renamed in the source):**
- Re-ingest hits `raw_folder_mappings.unique(raw_folder_path)` — the new path is a new mapping. Detect "same property, renamed folder" by matching on **content hash set** (the multiset of file sha256s) or on a human-confirmed merge. Provide an admin "merge/alias" action that points the old `raw_folder_mappings` row at the surviving `offerings.id` and marks the old path superseded. **Never** delete the `offerings` row on a rename.

**Duplicates (same images across folders or re-imports):**
- **File-level:** `import_file_mappings.checksum_sha256` + `assets` dedup by sha256 per offering → `skipped_duplicate`, no re-upload.
- **Property-level:** `offerings.slug` unique → re-ingest reuses the row. If two different raw folders parse to the same slug (genuine duplicate listings), the second is flagged `parse_confidence='low'` with error `slug_collision` for manual merge.
- **Cross-repo:** because both repos share one bucket and one `assets` table, the same image is uploaded **once**; both repos reference the same `assets.id`. No duplicated uploads into different projects/buckets.

**Broken references:** `assets.id` is stable across versions (versioning changes `storage_path`, not `id`), so `property_asset_relations`, `posting_job_assets`, and `offerings.cover_asset_id` never break on edit. Deleting an asset cascades to relations (`on delete cascade`); `cover_asset_id` uses `on delete set null` so a deleted cover doesn't orphan the offering.

---

## 12. Suggested Shared Schema and Storage Keys

### 12.1 Shared canonical tables (one-line summary)
- `profiles` — auth users + unified role (`owner|admin|staff|viewer`); helpers `is_staff()`, `is_admin()`.
- `categories` — normalized property groupings (with `parent_id` for SOLD sub-categories).
- `transaction_types` — `lease|sale|sold|virtual`.
- `offerings` — canonical property/listing; carries `category_id`, `transaction_type_id`, `raw_folder_name`, `raw_folder_path`, `normalized_title`, `location_label`, `approximate_area_sqm`, `slug`, `cover_asset_id`, `gallery_count`, `import_batch_id`, `is_published`, `deleted_at`.
- `assets` — canonical file record; `storage_path` (unique), `storage_bucket`, `is_public`, `ingestion_status`, `current_version`, `source_path` (audit).
- `property_asset_relations` — `offering_id`↔`asset_id`, `gallery_role`, `display_order`, `is_cover`, `alt_text`, `caption`.
- `property_asset_versions` — per-version history; `version_number`, `object_path`, `derivative_kind`, `is_current`.
- `raw_folder_mappings` — folder→`property_id` audit; `raw_folder_name`, `raw_folder_path`, `parse_payload`, `parse_confidence`.
- `import_batches` + `import_file_mappings` — import run + per-file dedup/audit (`checksum_sha256`).
- `activity_log` — shared audit trail for both repos.

### 12.2 Desk-only tables
`posting_jobs` (`offering_id`, `status`, `selected_caption`, `final_facebook_url`, `approved_by`, `approved_at`), `posting_job_assets` (`job_id`, `asset_id`, `display_order`, `selected`), `posted_log`, `daily_report` (view).

### 12.3 Canonical storage key patterns (adopt these; one convention for both repos)

The desk's `ingest.py` currently uses `properties/{pid}/{kind}s/{aid}/v1/{fn}` (versioned, nested) while `asset_service.py` uses `{aid}-original.{ext}` (flat). **Adopt the nested versioned pattern as the single convention** and migrate existing flat-path assets (copy object, update `assets.storage_path` + `property_asset_versions.object_path`; `storage_path` is unique so it's safe). Always use `asset_id` in the path, **never** the raw filename.

```
# Originals (private, source of truth)
properties/{property_id}/images/{asset_id}/original.jpg
properties/{property_id}/images/{asset_id}/original.png

# Public derivatives (published listing imagery)  — apg-public
properties/{property_id}/images/{asset_id}/thumb.webp
properties/{property_id}/images/{asset_id}/hero.webp
properties/{property_id}/images/{asset_id}/gallery.webp

# Versioned working copies / derivatives (per version)
properties/{property_id}/images/{asset_id}/v{version}/facebook-ready.jpg
properties/{property_id}/images/{asset_id}/v{version}/web-optimized.webp

# Documents (private)
properties/{property_id}/documents/{asset_id}/caption-details.docx
properties/{property_id}/documents/{asset_id}/brochure.pdf
properties/{property_id}/documents/{asset_id}/floor-plan.pdf
```

- `{property_id}` = `offerings.id` (uuid). `{asset_id}` = `assets.id` (uuid). `{version}` = `property_asset_versions.version_number`.
- `assets.storage_path` always points at the **current** version/derivative the repo should serve; `property_asset_versions` keeps every prior version.
- Bucket choice: `original.*`, `caption-details.*`, `brochure.pdf`, `floor-plan.pdf`, `v{version}/facebook-ready.jpg` → `apg-private`; `thumb.webp`, `hero.webp`, `gallery.webp`, `web-optimized.webp` (published) → `apg-public`.

### 12.4 Edit-replace-vs-version guidance
- **Edits create new versions. Never overwrite an existing object.** A replaced image = new `property_asset_versions` row + new object under `v{n}/`; old rows/objects retained.
- **Archiving** is a soft state (`ingestion_status='archived'`); the bytes remain for restore.
- **Hard delete** (object removal) only via an explicit admin action that also removes the `assets`/version rows (cascade), and only after a confirmation + audit log. Prefer archive over delete.

### 12.5 Read-only vs mutable (storage)
- **apg-website public bundle:** read-only on `apg-public` (GET public URLs). No storage writes from the public bundle.
- **apg-website admin:** may write `apg-public`/`apg-private` via server (service role) for CMS edits.
- **apg-posting-desk:** may write `apg-public`/`apg-private` via FastAPI (service role) for ingest + versioning + publishing.
- **Anonymous/`anon` key:** can only read `apg-public`. Cannot read `apg-private`, cannot write any bucket.

---

## 13. Cross-Repo Migration and Refactor Plan

The two repos currently have **different assumptions**: the website is fully Supabase with `offerings`/`assets`; the desk is mid-migration (Firebase auth, Google Drive, Google Sheets) with a Supabase layer that is partly aligned (`supabase_assets.py`, `asset_service.py`, `0002`) and partly divergent (`ingest.py` → `properties`/`property_assets`; `0001` → conflicting `profiles`; `supabase_job_store.py` → old `jobs`). This plan reconciles them.

**Phase 0 — Align foundations (no data changes)**
- Confirm both repos point at the same project (`ldtavdybcgwjgticrymz`); align env vars (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` server-side; `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` client-side).
- Agree the website repo owns DDL for shared canonical tables; the desk owns DDL only for `posting_jobs`/`posting_job_assets`/`posted_log`/`daily_report`.

**Phase 1 — Consolidate auth + roles (shared `profiles`)**
- Adopt unified roles `owner|admin|staff|viewer`; update `is_staff()`/`is_admin()` + RLS.
- Drop the desk's `0001` `profiles` table + `handle_new_user` trigger (use the website's).
- Finish desk Firebase→Supabase auth: PWA signs in via Supabase Auth; `SupabaseTokenVerifier` reads the shared `profiles`. Retire `firebase_auth.py`/`firebase_queue.py`/`VITE_FIREBASE_*`.

**Phase 2 — Extend canonical schema (website ships new migration)**
- Add `categories`, `transaction_types`, `raw_folder_mappings`, `property_asset_versions`.
- Add `offerings` columns (§4.3) + `assets.current_version` + per-asset `approved_by`/`approved_at`.
- Add storage path migration for any existing flat-path assets → nested pattern.
- RLS for new tables (staff-only for `raw_folder_mappings`; public read current public versions).

**Phase 3 — Refactor desk `ingest.py` onto canonical model**
- Replace `properties`/`property_assets` writes with `offerings`/`assets`/`property_asset_relations`/`property_asset_versions`/`raw_folder_mappings`.
- Fix `import_batches` insert to use `stats jsonb` (not the old columns).
- Use the nested storage key pattern; upload originals+docs to `apg-private`, derive public images to `apg-public`.
- Implement SOLD + Virtual Office special-case walking (§3).
- Run `--dry-run`, review the parse-confidence report, then live import.

**Phase 4 — Refactor desk runtime onto `posting_jobs`**
- Move `supabase_job_store.py` from `jobs`/`job_activity` to `posting_jobs` + `posting_job_assets` + `activity_log`. Bind jobs to `offering_id` (canonical) not free-text `property_name`.
- Add `claim_next_job()` function (replaces `property_queue` claim). Add `approved_by`/`approved_at` to the ready transition.
- `supabase_assets.py` (read) and `asset_service.py` (write) already target canonical model — keep, but update `asset_service.replace_asset` to true versioning (§8) and adopt nested paths.

**Phase 5 — Deprecate old desk tables + legacy buckets**
- Drop `0001`'s `jobs`, `job_activity`, `property_queue` (keep `posted_log`/`daily_report`).
- Migrate any remaining website listing images from the legacy `offerings` bucket to `apg-public` with `assets` records; retire the `offerings` bucket for listing images.
- Remove static/manual image references in the website (legacy `offerings.images` jsonb) in favor of `property_asset_relations` (keep jsonb as a denormalized cache only if needed, sourced from relations).

**Phase 6 — Harden + guardrails**
- Add a `--verify` reconciliation report (Supabase vs folder; missing/orphaned).
- Enforce signed-URL endpoint for private assets; rotate TTL.
- Add RLS tests for anon/staff/admin on each table and bucket.
- Add CI checks: no `SUPABASE_SERVICE_ROLE_KEY` in client bundles; migrations idempotent.

**Handling old static/manual references:** the website's old `offerings.images` jsonb array and the desk's old Google Drive / `downloads/` paths are superseded. During migration, map each old image reference to a canonical `assets` row (re-upload once with sha256 dedup), then flip reads to `property_asset_relations`. The Windows `downloads/` and `logs/` dirs are runtime-generated artifacts (per the desk's `AGENTS.md` anti-patterns) — not sources of record; do not migrate them.

---

## 14. Risks and Guardrails

| Risk | Guardrail |
|---|---|
| **Drift between repos' schema assumptions** (already present: `ingest.py` vs `asset_service.py` vs `0001`). | One schema owner (website). Desk ships only its own tables. CI runs both migration sets against a fresh shadow DB; fails on conflicting DDL (e.g. two `profiles` definitions). |
| **Two storage-path conventions** (flat `{aid}-original.{ext}` vs nested versioned). | Adopt nested versioned (§12.3) as the only convention; migrate flat assets; lint `assets.storage_path` to match `^properties/{uuid}/...`. |
| **Conflicting `profiles`/trigger from desk `0001`.** | Drop desk `0001` profiles/trigger in Phase 1; single shared `profiles`. |
| **Duplicate uploads across repos/projects.** | One project, one bucket set, sha256 dedup via `import_file_mappings` + per-offering `assets` check. |
| **Raw folder name used as ID.** | Forbidden. Canonical key = `offerings.slug` + `offerings.id`. Raw name only in `raw_folder_mappings`. |
| **Messy names → bad slugs / collisions / non-ASCII in paths.** | Slugify (ASCII-safe), `parse_confidence` flagging, `slug_collision` review queue, `asset_id` (never filename) in storage paths. |
| **Non-ASCII filenames** (`Tiño`, `Parañaque`). | Use `asset_id` in object path; keep `original_name` for display only. |
| **Multiple sqm values** mis-parsed. | Take first as primary; store all in `parse_payload.extra_areas`; flag `partial` for human review. |
| **Service-role key leaking to client.** | Server-only env var; CI greps client build for the key; RLS is the backstop even if leaked. |
| **Private assets exposed publicly.** | `apg-private` has no public-read policy; served only via short-TTL signed URLs minted server-side after auth. |
| **Destructive overwrites losing history.** | Versioning is mandatory; `replace_asset` creates a new version, never overwrites; archive is reversible. |
| **Broken references on asset edit/delete.** | Stable `assets.id` across versions; relations cascade on delete; `cover_asset_id` set null. |
| **Windows folder treated as runtime system of record.** | Folder is ingestion-only; runtime reads Supabase. `ingest.py --verify` reconciles; no app code reads the folder at runtime. |
| **Re-import duplicating data.** | Idempotent by design: slug upsert, sha256 dedup, `raw_folder_path` unique. |
| **SOLD / Virtual Office structure mis-handled.** | Explicit walker rules (§3): SOLD property-direct + nested sub-categories; Virtual Office iteration folders → `virtual` txn. |
| **Role drift** (`admin|user` vs `owner|moderator|admin` vs `admin|editor`). | Unified `owner|admin|staff|viewer`; `is_staff()`/`is_admin()` updated; old roles mapped. |
| **Cross-project accidental split.** | Both `.env` files pinned to the same project ref; documented in both READMEs. |

---

## 15. Step-by-Step Implementation Checklist

**Setup / alignment**
- [ ] Confirm both repos' `.env` point to the same Supabase project ref (`ldtavdybcgwjgticrymz`).
- [ ] Confirm `apg-public` + `apg-private` buckets exist (website `011`) and `012` RLS is applied.
- [ ] Decide schema ownership: website = canonical; desk = `posting_jobs`/`posting_job_assets`/`posted_log`/`daily_report`.

**Auth + roles (Phase 1)**
- [ ] Adopt roles `owner|admin|staff|viewer`; update `is_staff()`/`is_admin()` + RLS.
- [ ] Drop desk `0001` `profiles` + `handle_new_user` (use website's single `profiles`).
- [ ] Migrate desk auth Firebase→Supabase (`supabase_auth.py`); seed `staff` operators; retire `VITE_FIREBASE_*`.

**Canonical schema (Phase 2) — website ships migration**
- [ ] Create `categories`, `transaction_types`, `raw_folder_mappings`, `property_asset_versions`.
- [ ] Add `offerings` columns (category_id, transaction_type_id, raw_folder_name, raw_folder_path, normalized_title, location_label, approximate_area_sqm, parse_confidence, parse_errors).
- [ ] Add `assets.current_version`, `assets.approved_by`, `assets.approved_at`.
- [ ] RLS: staff-only for `raw_folder_mappings`; public read current public versions on `property_asset_versions`.
- [ ] Migrate any existing flat-path assets to nested `properties/{pid}/...` paths.

**Ingest (Phase 3) — desk**
- [ ] Refactor `ingest.py` to write `offerings`/`assets`/`property_asset_relations`/`property_asset_versions`/`raw_folder_mappings`/`import_batches`/`import_file_mappings`.
- [ ] Fix `import_batches` insert to `stats jsonb`.
- [ ] Implement SOLD + Virtual Office walker rules.
- [ ] Use nested storage keys; originals+docs → `apg-private`; derived public → `apg-public`.
- [ ] Run `--dry-run`; review parse-confidence report; fix `low`/`partial` rows; run live import.

**Desk runtime (Phase 4)**
- [ ] Move `supabase_job_store.py` onto `posting_jobs` + `posting_job_assets` + `activity_log`; bind to `offering_id`.
- [ ] Add `claim_next_job()`; add `approved_by`/`approved_at` on ready transition.
- [ ] Update `asset_service.replace_asset` to true versioning; adopt nested paths.
- [ ] Keep `supabase_assets.py` read path (already canonical).

**Deprecation (Phase 5)**
- [ ] Drop desk `0001` `jobs`/`job_activity`/`property_queue` (keep `posted_log`/`daily_report`).
- [ ] Migrate legacy `offerings` bucket listing images → `apg-public` + `assets` rows; retire `offerings` bucket for listings.
- [ ] Flip website reads from `offerings.images` jsonb → `property_asset_relations`.

**Harden (Phase 6)**
- [ ] `ingest.py --verify` reconciliation report.
- [ ] Signed-URL endpoint for private assets; TTL rotation.
- [ ] RLS tests (anon/staff/admin) for every table + bucket.
- [ ] CI: no service-role key in client bundle; migrations idempotent; storage-path lint.

---

## What to do NOW / NEXT / LATER

**Do now (this week — unblock everything, low risk):**
1. Pin both repos to the one shared Supabase project; document the project ref in both READMEs.
2. In the website repo, ship the Phase 2 migration: `categories`, `transaction_types`, `raw_folder_mappings`, `property_asset_versions`, and the `offerings`/`assets` extension columns — all `if not exists`/idempotent.
3. Drop the desk's conflicting `0001` `profiles` + `handle_new_user` so there is a single user/role directory; adopt the unified role set.

**Do next (the real convergence):**
4. Refactor the desk's `ingest.py` onto the canonical model (`offerings`/`assets`/`property_asset_relations`/`property_asset_versions`/`raw_folder_mappings`), fix the `import_batches` columns, implement SOLD + Virtual Office walking, and run a `--dry-run` import of the real `APR LISTING` folder. Review every `parse_confidence='low'`/`'partial'` row.
5. Refactor the desk's `supabase_job_store.py` onto `posting_jobs` + `posting_job_assets` (bound to `offering_id`), and finish Firebase→Supabase auth so shared RLS works end-to-end.
6. Adopt the nested storage-key convention; migrate any existing flat-path assets.

**Do later (polish + deprecation):**
7. Run the live import; approve + publish curated public images; verify the website catalog/detail pages render them with zero duplicated uploads.
8. Deprecate the desk's `0001` `jobs`/`job_activity`/`property_queue` and the legacy `offerings` bucket; flip the website off `offerings.images` jsonb onto `property_asset_relations`.
9. Add `--verify` reconciliation, signed-URL hardening, RLS tests, and CI guardrails (no service-role key in client builds, idempotent migrations, storage-path lint).

---

*This document lives at `apg-website/SHARED_ASSET_ARCHITECTURE.md` because the website repo owns the canonical schema. The desk repo should reference it (and link it from its own README) so both teams converge on one Supabase-native asset architecture.*

