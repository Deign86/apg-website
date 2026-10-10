# api/admin/

## Responsibility

Implements the session-authenticated administration API for content management, property listings, careers/applicants (including ATS results), live chat, and admin accounts.

## Design

- Each endpoint requires `../config.php` and `../db.php`, checks `getDbConnection()`, and emits JSON through `sendJson()`. `requireAdminAuth()` gates every endpoint: it checks the session (`admin_logged_in`, `admin_id`), enforces `requireSameOrigin()` on non-GET requests, and re-reads the role from `admins` on every request (`currentAdminRole()`), destroying the session if the admin no longer exists.
- Capabilities (`adminCapabilities()` in `config.php`, mirrored by `src/data/permissions.js`): `blogs`, `content`, `services`, `listings`, `careers`, `applicants`, `chat`, `delete`, `users`. Writes call `requireAdminCapability()`; deletes require `delete`; `users.php` is `requireSuperadmin()` end to end. GETs need only authentication, except `applicants.php` and `chat.php`, whose GETs also require their capability (candidate/visitor PII).
- `auth.php`: session check (also destroys sessions whose admin row vanished), login, and POST-only same-origin logout via `destroyAdminSession()`. Login is same-origin checked, type-checks inputs, throttles 5 failed attempts per IP and per email per 15 minutes (`rateLimit()` check-only, recorded on failure), verifies `password_verify()`, and calls `session_regenerate_id(true)` before storing identity/role. Login also bootstraps a superadmin: if none exists, the lowest-id (setup) account is promoted when it signs in. Self-service password change is two-step: `POST ?action=password-code` (verifies the current password, emails a single-use 6-digit code to `SECURITY_EMAIL`, 3 requests/15 min) then `POST ?action=password` (code valid 10 min, 5 tries, new password ≥10 chars, session regenerated).
- Endpoint/table mapping: `blogs.php` → `blog_posts`; `careers.php` → `job_openings`; `services.php` → `service_items`; `content.php` → `content_blocks`; `listings.php` → `listings` + `listing_images`; `applicants.php` → `job_applicants` (+ `job_openings`, resume files, `lib/Ats.php`); `chat.php` → `chat_sessions` + `chat_messages` + `admins`; `users.php`/`auth.php` → `admins`.
- Image uploads (`blogs.php`, `content.php`, `listings.php`, `?action=upload_image` or POST with `image`): 5 MB cap, `finfo` MIME allowlist JPG/PNG/WebP, extension derived from MIME, random filename, saved under `webRootDir()/uploads/{blogs,content,listings}`.
- PDO errors are logged with `error_log()` and returned as a generic message. Multi-column searches use distinct placeholders (`:search1..4`, `:s1..4`).

## Flow

1. The admin SPA authenticates via `/api/admin/auth.php`: GET or `?action=check` reports the session; POST logs in; `POST ?action=logout` clears it.
2. A resource request loads config/PDO, runs `requireAdminAuth()`, then capability checks per method before parsing JSON/form data and executing prepared INSERT/UPDATE/DELETE statements (transactions for listings/images).
3. `blogs.php` lists with enterprise/status/category/search filters and pagination, creates with generated slug/publish timestamp, supports PUT/PATCH and hard delete. `careers.php` and `services.php` store list fields as JSON text. `content.php` upserts on `(page_slug, section_key)`. `listings.php` maintains images transactionally. Public readers in `api/` serve these rows.
4. `applicants.php` calls `atsEnsureSchema()` on every request; GET lists/searches (enterprise/status/job/search) with status counts or returns one applicant, each row decorated with `ats_details` (decoded `ats_summary`); `?action=resume` streams a validated resume; `POST ?action=rescreen` (`applicants`, rate-limited 30/10 min per admin) re-runs `atsScreenSafely()` and returns the fresh `ats_*` fields; PUT updates status/notes; DELETE removes file and row.
5. `chat.php` lists sessions/threads, claims waiting sessions, inserts admin replies, and closes conversations (closing note inserted before the status flips so the visitor's last poll can read it). Visitors see changes via `api/chat/poll.php`.
6. `users.php` lists safe account fields, hashes passwords, preserves at least one superadmin, prevents self-deletion, and never returns hashes.

## Integration

- Consumed by `src/routes/admin/*` managers; public endpoints in `api/` read the resulting content, job, and listing rows. Stored blog/content HTML is sanitized with DOMPurify when rendered in the admin previews.
- `config.php` owns session settings, auth/role/capability checks, same-origin and rate-limit helpers, and enterprise slug validation; `db.php` supplies PDO; `schema.sql` defines the tables.
- Role policy: editors write blogs/content/services; admins/superadmins write listings; recruiters/admins/superadmins read and write careers/applicants/chat; deletes are admin/superadmin; only superadmins manage users.
- Resumes live under protected `uploads/resumes` (deny-all `.htaccess`) and are streamed only by `applicants.php`; ATS scoring and HR email come from `api/lib/Ats.php`.
