# api/

## Responsibility

Provides the public PHP REST endpoints, shared API configuration/PDO connection, and the schema plus dev/operator setup and migration tools. Public reads serve CMS content, jobs, services, blogs, and real-estate listings; public writes accept inquiries and applicant submissions (applicants are ATS-scored after the response).

## Design

- `config.php` loads root `.env`/`.env.local`, sets Manila timezone and strict session settings (`httponly`, `use_only_cookies`, `use_strict_mode`, `SameSite=Lax`, `secure`), and defines `DB_*`/`SMTP_*`/`MAIL_*` constants. Helpers:
  - `sendJson()` — status + JSON body; no CORS headers (same-origin in production, Vite proxy in dev).
  - `guardPublicFormSubmission()` — honeypot `website`, required `form_started_at` (3 s–4 h elapsed), and `rateLimit('form-<ip>', 5, 600)`.
  - `rateLimit($bucket, $max, $window, $record = true)` — sliding window in a `flock`'d temp file per bucket; `$record = false` only checks (used to count failures).
  - `requireSameOrigin()` — rejects non-GET requests whose `Origin` is not the apex/www/current host or localhost.
  - `webRootDir()` — `public/` in dev, the docroot in production (upload and logo paths).
  - `requireAdminAuth()` (session check + same-origin + role re-read from `admins` each request via `currentAdminRole()`; deleted admins are logged out by `destroyAdminSession()`), `adminCapabilities()`/`requireAdminCapability()`/`requireSuperadmin()`, `enterpriseSlugs()`/`resolveEnterpriseSlug()`, and `requireSetupToken()` (CLI, or `X-Setup-Token` header only; otherwise 404).
- `db.php:getDbConnection()` memoizes a MySQL PDO connection (`utf8mb4`, exceptions, associative fetches, native prepares); failure returns `null` for endpoint-specific fallback. Native prepares forbid reused named placeholders, so multi-column searches bind `:search1..4`.
- Public read routes are GET-only and type-check query strings: `blogs.php` (published `blog_posts`, `?slug=` or enterprise filter), `careers.php` (active `job_openings`), `content.php` (`content_blocks`), `services.php` (published `service_items`), `listings.php` (available properties from `data/listings.generated.json`, written by `cron/drive-sync.php`; strips the staff-only `drive_folder`; empty list before the first sync, never sample data). `inquire.php` adds a Drive-folder link to the staff email when the `property` field carries an `APR-XXXXXX` listing ref. Enterprise-scoped blogs/careers/services fall back to corporate rows only when the enterprise has none.
- Public submission routes are POST-only: `applicants.php` and `inquire.php`. Uploads are capped at 15 MB with an extension allowlist (`pdf doc docx rtf txt png jpg jpeg`).
- `schema.sql` defines `content_blocks`, `service_items`, `job_openings`, `blog_posts`, `job_applicants` (incl. `ats_*` columns), `admins`, `listings`, `listing_images`, `chat_sessions`, `chat_messages`. `setup.php` runs the schema, writes a deny-all `uploads/resumes/.htaccess`, and creates the first admin only from `ADMIN_DEFAULT_PASSWORD` (min 12 chars, no fallback). `migrate.php` is the idempotent cross-enterprise migration/seed backfill. All three are dev/one-shot tools; `tools/hostinger-update.sh` strips them from production.
- `.htaccess` denies `*.sql` and `*.md`; `lib/`, `cron/`, and `data/` each carry a deny-all `.htaccess`.

## Flow

1. Each endpoint requires `config.php`; DB-backed handlers also require `db.php` and call `getDbConnection()`. Responses exit through `sendJson()`.
2. Public reads build bound WHERE clauses from validated parameters (`slug`, `enterprise`, `category`, `page`, listing type aliases/search/pagination) and decode JSON list columns before returning.
3. `applicants.php` parses JSON or multipart, runs `guardPublicFormSubmission()`, resolves the enterprise slug, validates fields and the resume (saved under protected `uploads/resumes` with a random name), links `job_id` to a real `job_openings` row (submitted id if it exists, else case-insensitive title match preferring same enterprise/active), inserts `job_applicants`, mails a ticketed notice via `Mailer` (Reply-To candidate, resume attached), then registers a shutdown function that flushes the response and runs `atsScreenSafely()` from `lib/Ats.php`.
4. `inquire.php` performs the same form guard/validation and enterprise branding, embeds the logo from `webRootDir()` and an optional allowlisted attachment (MIME via `finfo`), then sends through `Mailer`; it does not persist an inquiry row.
5. Admin, visitor chat, and the ATS digest use `api/admin/`, `api/chat/`, and `api/cron/`; see those maps.

## Integration

- The SPA consumes `/api/blogs|careers|content|listings|services|applicants|inquire.php`; the admin app consumes `/api/admin/*.php`; the chat widget consumes `/api/chat/*.php`. The root `.htaccess` also serves these without the `.php` suffix.
- `applicants.php`, `inquire.php`, and `chat/message.php` require `lib/Mailer.php`; `applicants.php` lazily requires `lib/Ats.php`; `chat/message.php` requires `lib/Gemini.php` and reads `data/knowledge.md`.
- `api/admin/` shares `config.php` RBAC/session helpers, `db.php`, and the CMS/ATS tables; `api/chat/` shares `chat_sessions`/`chat_messages`/`admins` with `api/admin/chat.php`.
- Production lacks a migration runner: `atsEnsureSchema()` adds missing `ats_*` columns at runtime.
