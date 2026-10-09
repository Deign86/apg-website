# api/lib/

## Responsibility

Shared PHP libraries required by endpoints and the cron script: `Mailer` (SMTP email), `Gemini` (Google Gemini REST client), and `Ats` (applicant screening). Not web-accessible: `.htaccess` is `Require all denied`.

## Design

- `Mailer.php`: no external packages. The constructor captures `SMTP_HOST/PORT/USER/PASS/SECURE`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` from `config.php`. `send($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments)` uses `sendViaSmtp()` (PHP sockets: implicit SSL on 465 or STARTTLS, AUTH LOGIN, MIME multipart/base64, inline CID attachments) when credentials are set, and falls back to `sendViaNativeMail()` (`mail()`). No persistence or retry.
- `Gemini.php`: `geminiEnabled()` (non-empty `GEMINI_API_KEY`) and `geminiGenerate($system, $parts, $schema, $history, $timeout)`, a cURL call to `v1beta/models/{GEMINI_MODEL}:generateContent` (default `gemini-flash-latest`, key in `x-goog-api-key` header). It sends a system instruction, prior user/model turns, temperature 0.3, and `BLOCK_LOW_AND_ABOVE` safety settings for harassment, hate, sexual, and dangerous content. With a schema it requests JSON output and returns the decoded array. Returns `null` on any failure so callers fall back to non-AI behaviour.
- `Ats.php` (requires `Mailer.php` and `Gemini.php`; callers load `config.php`):
  - `atsEnsureSchema()` idempotently adds the `ats_*` columns (`ATS_COLUMNS`) to `job_applicants`, since production has no migration runner.
  - Resume handling: `atsResumeFile()` resolves a stored path and rejects anything outside `uploads/resumes`; `atsExtractText()` does pure-PHP best-effort extraction for txt, rtf, docx (zip XML), legacy doc, and pdf (inflate, ToUnicode cmaps, content-stream text). It never throws and caps output at 60k chars. Images yield no text.
  - Scoring: `atsJobContext()` reads the linked `job_openings` row or a general enterprise profile (`atsEnterpriseProfile()`). `atsKeywordScore()` scores out of 100: keyword coverage 50, years of experience 20, title terms 15, education 10, completeness 5. `atsAiScore()` sends job, form, and the resume (PDF inline ≤ 10 MB, otherwise text) to Gemini with a score/summary/strengths/gaps/recommendation schema.
  - Config: `atsThreshold()` (`ATS_THRESHOLD`, default 70), `atsRecommendation()`, and `atsHrEmail()` (`HR_EMAIL`, with a built-in fallback address).
  - Output: `atsDetails()` decodes the stored `ats_summary` JSON. `atsNotifyHr()` emails HR a shortlist card with the resume attached and Reply-To set to the candidate. `atsEsc()`/`atsListHtml()` are HTML helpers.

## Flow

1. `atsScreenSafely($pdo, $id, $notify = true)` wraps `atsScreenApplicant()` and never throws. It loads the applicant, builds the job context, and extracts resume text. It always computes the keyword score. When `ATS_USE_AI=1` and Gemini is enabled, it tries the AI score, which takes precedence and keeps the keyword data.
2. It persists `ats_score`, `ats_summary` (full JSON), `ats_method`, `ats_shortlisted`, and `ats_scored_at`. If the score clears the threshold and `ats_notified_at` is empty with `$notify` true, it calls `atsNotifyHr()` and stamps `ats_notified_at` on success.
3. Mail callers build and escape their own HTML and prepare attachments, then call `Mailer::send()`. SMTP failures are logged and fall back to `mail()`.

## Integration

- `Mailer`: `api/inquire.php`, `api/applicants.php` (recruitment notice), `api/chat/message.php` (handoff), `Ats.php` (shortlist), and `api/cron/ats-digest.php` (digest).
- `Gemini`: `api/chat/message.php` (chat assistant) and `Ats.php` (optional AI scoring).
- `Ats`: `api/applicants.php` (post-response screening via a shutdown function), `api/admin/applicants.php` (`atsEnsureSchema`, `atsDetails`, re-screen), and `api/cron/ats-digest.php` (backfill + digest helpers).
- Environment: `SMTP_*`/`MAIL_*`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `ATS_THRESHOLD`, `ATS_USE_AI`, `HR_EMAIL`.
