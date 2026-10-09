# api/cron/

## Responsibility

Scheduled server-side jobs. Currently one: `ats-digest.php`, the daily applicant-screening digest for HR. Not web-accessible (`.htaccess` deny-all; the script also returns 404 unless `PHP_SAPI === 'cli'`).

## Design

- `ats-digest.php` requires `../config.php`, `../db.php`, and `../lib/Ats.php` (which brings in `Mailer` and `Gemini`). It writes progress to stdout, errors to stderr, and exits non-zero on DB failure or a failed send.
- Backfilled applicants submitted more than 24h ago are scored with `$notify = false`, so a first run over historical rows does not flood HR with shortlist emails.

## Flow

1. `atsEnsureSchema()` runs, then up to 500 applicants with `ats_scored_at IS NULL` are scored through `atsScreenSafely()`. Shortlist emails go out only for rows from the last 24h.
2. It selects the last 24h of `job_applicants`, ranked by `ats_score` (unscored rows last). If there are none, it exits without sending.
3. It builds one HTML table (rank, candidate/position/enterprise, colour-coded score against `atsThreshold()`, shortlisted flag, summary from `atsDetails()`) with a link to `/admin/applicants`, and sends it to `atsHrEmail()` via `Mailer`.

## Integration

- Run as `php api/cron/ats-digest.php` from a Hostinger cron job, daily at `0 0 * * *` (08:00 Manila); see `DEPLOY.md`.
- Shares the `job_applicants` `ats_*` columns with `api/applicants.php` (instant screening) and `api/admin/applicants.php` (display/re-screen). Uses `HR_EMAIL`, `ATS_THRESHOLD`, `ATS_USE_AI`, and `GEMINI_*`.
