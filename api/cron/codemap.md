# api/cron/

## Responsibility

Server-side CLI jobs: `data-fixes.php`, run by `tools/hostinger-update.sh` on every deploy to apply the pending one-off data corrections in `../lib/DataFixes.php` (exit 1 if any failed); `ats-digest.php`, the daily ATS safety net (scores unscored applicants, retries HR emails that failed at submission; no digest email), and `drive-sync.php`, the APR Google Drive → website listings + chat knowledge sync (every 15 minutes). Not web-accessible (`.htaccess` deny-all; the script also returns 404 unless `PHP_SAPI === 'cli'`).

## Design

- `ats-digest.php` requires `../config.php`, `../db.php`, and `../lib/Ats.php` (which brings in `Mailer` and `Gemini`). It writes progress to stdout, errors to stderr, and exits non-zero on DB failure or when an HR email from the last 24h is still undelivered.
- Backfilled applicants submitted more than 24h ago are scored with `$notify = false`, so a first run over historical rows does not flood HR.

## Flow

1. `jobSchemaEnsure()` runs, then up to 500 applicants with `ats_scored_at IS NULL` are scored through `atsScreenSafely()`. HR emails go out only for rows from the last 24h.
2. Applicants from the last 24h with `ats_notified_at IS NULL` are re-screened (which emails HR) or, if scoring fails, sent through `atsNotifyUnscored()`.
3. `atsSendPendingRejections()` emails the polite rejection to applicants the ATS auto-rejected at least an hour earlier and HR left rejected.
4. It prints how many were scored, retried, still undelivered (exit code 1 if any remain) and how many rejection emails went out.

## Integration

- Run as `php api/cron/ats-digest.php` from a Hostinger cron job, daily at `0 0 * * *` (08:00 Manila); see `DEPLOY.md`.
- `drive-sync.php` (`*/15 * * * *`, flock-guarded) walks `DRIVE_FOLDER_ID` with `lib/GoogleDrive.php`. Each property folder ("City, sqm street") becomes one listing: area, size, type/deal from the folder path, rate and terms allow-listed from its Google Doc (no addresses, buildings, units, names, phones, emails or links). Writes `data/listings.generated.json` (available listings only; SOLD and VO folders excluded; `APR-` + 6 hex of md5(folder id) as the public ref) and `data/listings.generated.md` (chat knowledge, with refs). Photos are mirrored to `webRootDir()/uploads/drive/<ref>/`, re-encoded with GD (EXIF/GPS stripped, auto-rotated, max 1600px), only re-downloaded when changed, and removed with their listing. Any Drive error keeps the previous files. Every run past the lock writes `data/listings.status.json` `{last_run, ok, error, count}` from a shutdown handler (failures and fatals included) for the admin Property Listings banner; `tools/hostinger-update.sh` carries it across deploys. The tree comes from one indexed `files.list` search (per-folder walk as fallback); only website listings get their doc exported, and doc terms are cached in `data/drive-doc-cache.json` by doc `modifiedTime` (exports are slow and can hit the 30s timeout), so a steady-state run makes a few API calls.
- Shares the `job_applicants` `ats_*` columns with `api/applicants.php` (instant screening) and `api/admin/applicants.php` (display/re-screen). Uses `HR_EMAIL`, `ATS_THRESHOLD`, `ATS_USE_AI`, and `GEMINI_*`.
