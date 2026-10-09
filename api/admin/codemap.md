# api/admin/

## Responsibility

Implements the session-authenticated administration API for content management, property listings, careers/applicants, live chat, and admin accounts.

## Design

- Each endpoint requires `../config.php` and `../db.php`, checks `getDbConnection()`, and emits JSON through `sendJson()`. `requireAdminAuth()` gates the endpoint using the native PHP session cookie (`admin_logged_in`, `admin_id`); `auth.php` provides session check/login/logout.
- `auth.php` verifies `admins.password_hash` using `password_verify()`, stores admin identity/role in `$_SESSION`, and clears/destroys the session on logout. `config.php` resolves legacy session roles from `admins` and defines capabilities: `blogs`, `content`, `services`, `listings`, `careers`, `applicants`, `chat`, `delete`, and `users`.
- GET handlers require an authenticated session. Mutations use `requireAdminCapability()` (edit/create capabilities; delete operations require `delete`); user management uses `requireSuperadmin()`. Prepared PDO statements bind external values. Content and listing create/update paths use PDO transactions/upserts where needed.
- Endpoint/table mapping: `blogs.php` → `blog_posts`; `careers.php` → `job_openings`; `services.php` → `service_items`; `content.php` → `content_blocks`; `listings.php` → `listings` + `listing_images`; `applicants.php` → `job_applicants` joined to `job_openings` and protected resume files; `chat.php` → `chat_sessions` + `chat_messages` + `admins`; `users.php`/`auth.php` → `admins`.
- Blogs, careers, services, and content support CRUD/upsert behavior and validate enterprise/category values against `enterpriseSlugs()`. Job requirements/responsibilities and service features/photos are JSON text in MySQL and decoded to arrays for API responses.

## Flow

1. Browser admin requests authenticate through `/api/admin/auth.php`: GET or `?action=check` reports the current session; POST verifies email/password and initializes session fields; logout clears the cookie/session.
2. A resource request enters its matching endpoint, loads config/PDO, and runs `requireAdminAuth()`. GET executes filtered reads; write methods additionally verify the named capability before parsing JSON or form data and executing prepared INSERT/UPDATE/DELETE statements.
3. `blogs.php` lists with enterprise/status/category/search filters and optional pagination, creates with generated slug/publication timestamp, supports full PUT or merged PATCH, and hard-deletes. `careers.php` stores JSON list fields and hard-deletes openings. `services.php` stores features/photos as JSON text. `content.php` upserts by the unique `(page_slug, section_key)` key. `listings.php` maintains associated images transactionally on create/update and can upload/attach image files. These data are exposed to public readers in `api/blogs.php`, `api/careers.php`, `api/services.php`, `api/content.php`, and `api/listings.php`.
4. `applicants.php` lists/searches candidates and counts statuses, joins `job_openings` for position details, updates status/internal notes, streams a validated resume to authorized users, and on delete removes the associated file and applicant row.
5. `chat.php` lists sessions/threads, claims waiting sessions, inserts admin replies, auto-assigns responders, and closes conversations by updating `chat_sessions` and inserting `chat_messages`. These changes are returned to visitors through `api/chat/poll.php`.
6. `users.php` is superadmin-only; it lists safe account fields, hashes passwords on create/change, preserves at least one superadmin, prevents self-deletion, and never returns password hashes.

## Integration

- The admin SPA consumes `/api/admin/auth.php` and each resource endpoint; public endpoints in `api/` read the resulting managed content and job/listing data.
- `config.php` owns PHP session settings, `requireAdminAuth()`, role/capability checks, and enterprise slug validation. `db.php` supplies the shared PDO singleton; `schema.sql` defines the mapped tables and foreign keys.
- Admin role policy is enforced server-side: editors can write blogs/content/services; admins/superadmins can write listings; recruiters/admins/superadmins can write careers/applicants/chat; destructive operations are admin/superadmin; only superadmins manage users. Any authenticated role can perform GET operations.
- Uploaded listing/content/blog images are persisted under public uploads; applicant resumes live under protected `uploads/resumes` and are streamed only by the authenticated applicant endpoint. `api/chat/` public endpoints share chat records with `admin/chat.php`.
