# Deploying APG to Hostinger

Everything needed to ship this repo to Hostinger shared hosting, in order.

---

## 0. Why not the Hostinger MCP

The official `hostinger-api-mcp` **cannot deploy this project.** Verified against the
upstream tool list:

| Capability | Reality |
|---|---|
| `agency-hosting_deployNodeStaticWebsite` | **Agency Plan (h5g) only.** It uploads an archive and triggers a node-static build. It also **permanently overwrites all existing site contents** with no undo. |
| Upload arbitrary files to shared/business hosting | **No such tool.** |
| Create a MySQL database / run SQL | **No such tool.** |
| DNS, domains, billing, VPS | Available, but irrelevant to this deploy. |

This is a **shared/business hosting** account running **PHP + MySQL**, so the supported
channels are **SFTP**, **File Manager**, or **Git**. This repo uses SFTP, with a ZIP
fallback for File Manager.

If you later move to an Agency plan or a VPS, the MCP becomes useful. Until then it is
not the deploy path.

---

## 1. What the server layout must look like

```
public_html/
  index.html          <- SPA entry (from dist/)
  assets/             <- Vite build output
  imports/            <- blog cover images
  images/  fonts/  legacy/  favicon.png  viber1.png  earth-globe.glb
  .htaccess           <- SPA rewrites (REQUIRED)
  api/                <- PHP backend
    blogs.php  config.php  db.php  inquire.php  ...  admin/  chat/  lib/
  .env                <- created ON THE SERVER, never uploaded
  uploads/resumes/    <- created at runtime by api/setup.php
```

`api/` is a **sibling** of `index.html`, not inside it. `dist/` alone is not a deployable
artifact — Vite never copies `api/` into it.

---

## 2. One-time setup

### 2.1 Fill in the SFTP target

```bash
cp .env.deploy.example .env.deploy
```

Edit `.env.deploy` with values from Hostinger hPanel:

| Key | Where to find it |
|---|---|
| `SFTP_HOST` | hPanel -> Advanced -> SSH Access, the server IP |
| `SFTP_PORT` | `65002` is Hostinger's standard SFTP port |
| `SFTP_USER` | your hosting username, e.g. `u123456789` |
| `SFTP_PATH` | `/home/u123456789/public_html` |

`.env.deploy` is git-ignored. Leave `SFTP_PASSWORD` blank to be prompted each deploy
(recommended), or set `SFTP_KEY` to a private key for unattended runs.

### 2.2 Create the production `.env` on the server

**Do not upload your local `.env`** — it would overwrite production credentials with
local ones. Create it directly on the server via hPanel File Manager or SSH:

```ini
DB_HOST=localhost
DB_PORT=3306
DB_NAME=<hostinger_db_name>
DB_USER=<hostinger_db_user>
DB_PASS=<hostinger_db_password>

SMTP_HOST=smtp.hostinger.com
SMTP_PORT=465
SMTP_SECURE=ssl
SMTP_USER=<mailbox>
SMTP_PASS=<mailbox_password>
MAIL_FROM_EMAIL=<mailbox>
MAIL_FROM_NAME="Alpha Premier Group"
MAIL_TO_EMAIL=<inbox>

# Required for the migration endpoints. Generate with:
#   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
SETUP_TOKEN=<random_32_byte_hex>

# Password for the initial admin account. Change it after first login.
ADMIN_DEFAULT_PASSWORD=<strong_password>
```

### 2.3 Create the database

In hPanel -> Databases -> MySQL Databases, create a database and user, then grant the
user all privileges on that database. Put those values in the server `.env` above.

---

## 3. Deploy

```bash
npm run deploy
```

That runs, in order:

1. `vite build` -> `dist/`
2. Stage `dist/` + `api/` + `.htaccess` into `dist-deploy/`
3. Write `dist-deploy.zip` as a File Manager fallback
4. `scp` the bundle to `SFTP_PATH`

### Useful flags

| Flag | Effect |
|---|---|
| `--dry-run` | Print the upload plan, change nothing on the server |
| `--zip-only` | Stage + ZIP, skip upload (use with File Manager) |
| `--skip-build` | Reuse the existing `dist/` |
| `--skip-legacy` | Exclude `legacy/` — saves ~152 MB |
| `--no-zip` | Skip the ZIP, saves ~150 MB of local disk |
| `--with-migrations` | **Include** `api/setup.php` and `api/migrate.php` |
| `--purge-migrations` | **Delete** those two files from the server |

`npm run deploy:dry` is shorthand for `npm run deploy -- --dry-run`.

### Bundle size

The full bundle is about **384 MB**, dominated by:

| Path | Size | Notes |
|---|---|---|
| `assets/` | 166 MB | includes a 9 MB hero video |
| `legacy/` | 151 MB | archived old site; **one 146 MB video** |
| `images/` | 60 MB | |
| `imports/` | 3.3 MB | blog cover images |

On a slow uplink this takes a long time. `--skip-legacy` drops it to ~233 MB. Use
`--skip-legacy` on routine content deploys and include `legacy/` only when that archive
actually changed.

**Safety:** `api/` files beginning with `_` are treated as local test harnesses and are
stripped from the bundle. `.env`, `.env.local` and `.env.production` are removed during
staging.

---

## 4. Run the database migration

The schema needs `enterprise_slug`, `read_time` and `is_featured` on `blog_posts`, and the
36 articles that used to be hardcoded in the subsidiary pages need backfilling.

Both endpoints are **token-gated**. Without `SETUP_TOKEN` in the server `.env`, every
HTTP request returns **404** (deliberately, so the endpoints' existence is not disclosed).
CLI execution is always permitted.

### Step 1 — upload the migration files

```bash
npm run deploy -- --with-migrations --skip-legacy
```

### Step 2 — run them

Either over HTTP:

```
https://<your-domain>/api/setup.php?token=<SETUP_TOKEN>
https://<your-domain>/api/migrate.php?token=<SETUP_TOKEN>
```

Or over SSH if your plan has it:

```bash
ssh -p 65002 u123456789@<host> 'cd public_html && php api/setup.php'
ssh -p 65002 u123456789@<host> 'cd public_html && php api/migrate.php'
```

### What the migration does

`api/migrate.php` is a single idempotent script covering everything:

| Step | Effect |
|---|---|
| 1. Schema | Adds `enterprise_slug`, `read_time`, `is_featured` to `blog_posts`; `enterprise_slug`, `salary`, `is_featured`, `responsibilities` to `job_openings`; `summary`, `tag`, `features`, `photos` to `service_items`; the `admins.role` column; and the unique keys the upserts rely on. |
| 2. Slug normalisation | Rewrites legacy spellings (`general`, `swift-clear`, `88-prime`, `apg-main`, `altaventure`) to the canonical slugs in every table that stores one. |
| 3. Blogs | Backfills 36 articles that used to be hardcoded in the subsidiary blog pages. |
| 4. Careers | Backfills 34 job openings that used to be hardcoded in the subsidiary careers pages. |
| 5. Services | Backfills 29 service items that used to be hardcoded in the subsidiary services pages. |
| 6. Report | Prints per-enterprise row counts so you can confirm the result. |

It is safe to re-run: every write is either a guarded `ALTER` or an upsert keyed on
a unique constraint. The three payloads are embedded in the file, so it needs no
companion data on the server.

### Step 3 — delete the migration files

```bash
npm run deploy -- --purge-migrations
```

Or manually delete `public_html/api/setup.php` and `public_html/api/migrate.php`.

**Do not leave them in place.** They run schema migrations.

---

## 5. Verify

```bash
curl -s "https://<your-domain>/api/blogs.php?enterprise=luxe-prime"
```

Expect `{"success":true,"data":[...],"fallback":false}` with 3 Luxe Prime articles.

Then walk the checklist in `MANUAL_TESTING.md` section 8.

Quick checks:

| Check | Expected |
|---|---|
| `/` | SPA loads |
| `/blogs`, `/admin`, `/subsidiaries/luxe-prime` | 200, SPA shell (not 404) |
| `/api/blogs.php` | JSON, 41 posts |
| `/api/admin/blogs.php` (no session) | 401 |
| `/api/setup.php` (no token) | 404 |

---

## 6. Manual deploy via hPanel File Manager

If SFTP is unavailable:

1. `npm run deploy -- --zip-only --with-migrations`
2. hPanel -> Files -> File Manager -> `public_html/`
3. Upload `dist-deploy.zip`
4. Extract, choosing **overwrite** for existing files
5. Delete the uploaded zip
6. Run the migration (section 4, step 2)
7. `npm run deploy -- --purge-migrations` once SFTP is available, or delete the two files
   via File Manager

---

## 7. Troubleshooting

**Deep routes return 404.** `.htaccess` is missing or not being read. Confirm
`public_html/.htaccess` exists and that the host allows `AllowOverride All`. This is the
single most common Hostinger failure.

**`/api/blogs.php` returns HTML.** The SPA rewrite is swallowing API requests, meaning
`.htaccess` rule 1 is not matching. Confirm `api/` sits at `public_html/api/`.

**Admin login returns 401 immediately.** The session cookie is not surviving. Check that
the site is served over HTTPS and that `session.cookie_samesite=Lax` in `api/config.php`
is compatible with how you reach the admin panel.

**Migration returns 404 despite the correct token.** `SETUP_TOKEN` is not in the server
`.env`, or the `.env` is not readable. The guard fails closed by design.

**Migration says "Embedded seed data is empty".** The embedded payload was lost. Regenerate
and re-embed locally:

```bash
node tools/extract-blog-seed.mjs > tools/blog-seed.json
node tools/embed-seed.mjs
npm run deploy -- --with-migrations
```

---

## 8. Related files

| File | Purpose |
|---|---|
| `tools/deploy-hostinger.mjs` | The deploy script |
| `.env.deploy.example` | SFTP target template |
| `api/setup.php` | Schema + admin bootstrap (token-gated) |
| `api/migrate.php` | Single idempotent migration: schema, slug normalisation, and the blog/careers/services backfill (token-gated) |
| `tools/extract-blog-seed.mjs` | Pulls blog articles out of the subsidiary source files |
| `tools/extract-content-seed.mjs` | Pulls careers and services arrays out of the subsidiary source files |
| `tools/embed-seed.mjs` | Injects both payloads into `api/migrate.php` |
| `tools/remove-arrays.mjs` | One-off cleanup that stripped the migrated arrays from the components |
| `src/data/enterprises.js` | Canonical enterprise slug list (single source of truth) |
| `api/config.php` | `requireSetupToken()` lives here |
| `MANUAL_TESTING.md` section 8 | Cross-enterprise blog verification |
