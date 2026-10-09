# api/

## Responsibility

Provides the public PHP REST endpoints, shared API configuration/PDO connection, and database setup/migration entry points. Public reads serve CMS content, jobs, services, blogs, and real-estate listings; public writes accept inquiries and applicant submissions.

## Design

- `config.php` loads root `.env`/`.env.local`, configures Manila timezone and hardened PHP session cookies, exposes JSON/CORS and form-abuse guards, admin session/RBAC helpers, canonical enterprise slug resolution, and setup-token protection.
- `db.php:getDbConnection()` memoizes a MySQL PDO connection (`utf8mb4`, exceptions, associative fetches, native prepares) using `DB_*`; failed connection returns `null` for endpoint-specific fallback/error handling. Endpoint SQL uses prepared statements and bound values.
- Public read routes are GET-only: `blogs.php` reads published `blog_posts`; `careers.php` reads active `job_openings`; `content.php` reads `content_blocks`; `services.php` reads published `service_items`; `listings.php` filters/paginates published `listings` and loads related `listing_images`.
- Public submission routes are POST-only (with OPTIONS handling): `applicants.php` validates candidate data, saves an optional restricted resume, inserts `job_applicants` when PDO is available, and attempts notification mail; `inquire.php` builds a branded inquiry email without database persistence.
- Enterprise-scoped blogs, careers, and services use corporate rows only when the requested enterprise has no rows (fallback-only, no merge). `listings.php` has in-memory mock listing fallback; other DB-backed reads return empty data with a fallback message when no connection is available.
- `schema.sql` defines `content_blocks`, `service_items`, `job_openings`, `blog_posts`, `job_applicants`, `admins`, `listings`, `listing_images`, `chat_sessions`, and `chat_messages`, with seed data. `setup.php` executes the schema, applies compatibility DDL, secures resume uploads, and creates the initial admin. `migrate.php` is the guarded idempotent cross-enterprise schema/data migration and seed backfill utility.

## Flow

1. Each endpoint requires `config.php`; DB-backed handlers then require `db.php` and call `getDbConnection()`. `sendJson()` sets status, JSON/CORS headers, serializes the response, and exits.
2. Public read request parameters form bound WHERE clauses: `blogs.php?slug=` selects one published post, otherwise optional enterprise filtering applies; `careers.php?enterprise=` and `services.php?category=` select active/published rows and decode JSON list columns; `content.php?page=` returns ordered blocks plus a `section_key => value` map; `listings.php` normalizes type aliases, counts matches, fetches a page, then loads images by listing IDs.
3. `applicants.php` parses JSON or multipart fields, invokes `guardPublicFormSubmission()`, resolves enterprise aliases, validates candidate fields/resume, writes a `job_applicants` row, builds a ticketed branded HTML message, and calls `Mailer::send()` with the candidate address as Reply-To and an optional resume attachment. `inquire.php` performs the analogous form guard/validation and enterprise branding, embeds a logo and optional upload as attachments, then calls the same mailer; it does not insert an inquiry row.
4. Admin and visitor chat use the separate `api/admin/` and `api/chat/` endpoint families; their common tables and controls are summarized in those folder maps.

## Integration

- Public site pages/forms consume `/api/blogs.php`, `/api/careers.php`, `/api/content.php`, `/api/listings.php`, `/api/services.php`, `/api/applicants.php`, and `/api/inquire.php`; the admin application consumes `/api/admin/*.php`. `api/chat/*.php` is consumed by the public chat widget.
- `api/admin/` shares `config.php` RBAC/session helpers, `db.php`, and the CMS/ATS tables; `api/chat/` shares `chat_sessions`, `chat_messages`, and `admins` with `api/admin/chat.php`.
- `applicants.php`, `inquire.php`, and `chat/message.php` require `api/lib/Mailer.php`; `config.php` supplies SMTP and recipient constants. `setup.php`/`migrate.php` require CLI or a valid `SETUP_TOKEN` for HTTP access.
- `schema.sql` is the initial database contract; `setup.php` and `migrate.php` are operator-run deployment utilities, not normal frontend flows.
