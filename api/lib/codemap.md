# api/lib/

## Responsibility

Shared PHP libraries required by endpoints and the cron scripts: `Mailer` (SMTP email), `EmailTemplate` (branded email layout, one theme per enterprise in `email-themes.php`), `Gemini` (Google Gemini REST client), `GoogleDrive` (read-only Drive client) and `Ats` (applicant screening). Not web-accessible: `.htaccess` is `Require all denied`.

## Design

- `Mailer.php`: no external packages. The constructor captures `SMTP_HOST/PORT/USER/PASS/SECURE`, `MAIL_FROM_EMAIL`, `MAIL_FROM_NAME` from `config.php`. `send($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments)` uses `sendViaSmtp()` (PHP sockets: implicit SSL on 465 or STARTTLS, AUTH LOGIN) when credentials are set. Every message is multipart/alternative (plain text from `htmlToText()` + HTML); inline cid images go in multipart/related, files in multipart/mixed. It and falls back to `sendViaNativeMail()` (`mail()`). No persistence or retry.
- `Gemini.php`: `geminiEnabled()` (non-empty `GEMINI_API_KEY`) and `geminiGenerate($system, $parts, $schema, $history, $timeout)`, a cURL call to `v1beta/models/{GEMINI_MODEL}:generateContent` (default `gemini-flash-latest`, key in `x-goog-api-key` header). It sends a system instruction, prior user/model turns, temperature 0.3, and `BLOCK_LOW_AND_ABOVE` safety settings for harassment, hate, sexual, and dangerous content. With a schema it requests JSON output and returns the decoded array. Returns `null` on any failure so callers fall back to non-AI behaviour.
- `EmailTemplate.php` + `email-themes.php`: `emailTheme($slug)` returns the enterprise's tokens (colours, fonts, radii, logo) taken from what each enterprise website renders. `emailRender($t, $o)` builds a table-based, inline-styled email (eyebrow/badge, title, rows, quote, sections, buttons, footer). The brand header is one PNG drawn with GD (`emailHeaderAttachment()`, cached in the temp dir) and embedded as cid:, because the Gmail apps force-invert colours in dark mode but never recolour images; without GD it falls back to an HTML header with the embedded, resized logo. `color-scheme: only light|only dark` keeps Apple Mail/Outlook from re-colouring. `emailSend()` attaches the header and sends; `emailSafeFirstName()` and `emailConfirmationAllowed()` (3 per recipient per day) guard confirmations sent to addresses typed into public forms, which never repeat visitor-written text.
- `Ats.php` (requires `Mailer.php`, `Gemini.php`, `EmailTemplate.php`; callers load `config.php`):
  - `atsEnsureSchema()` idempotently adds the `ats_*` columns (`ATS_COLUMNS`) to `job_applicants`, since production has no migration runner.
  - Resume handling: `atsResumeFile()` resolves a stored path and rejects anything outside `uploads/resumes`; `atsExtractText()` does pure-PHP best-effort extraction for txt, rtf, docx (zip XML), legacy doc, and pdf (inflate, ToUnicode cmaps, content-stream text). It never throws and caps output at 60k chars. Images yield no text.
  - Scoring: `atsJobContext()` reads the linked `job_openings` row or a general enterprise profile (`atsEnterpriseProfile()`). `atsKeywordScore()` scores out of 100: keyword coverage 50, years of experience 20, title terms 15, education 10, completeness 5. `atsAiScore()` sends job, form, and the resume (PDF inline ≤ 10 MB, otherwise text) to Gemini with a score/summary/strengths/gaps/recommendation schema.
  - Config: `atsThreshold()` (`ATS_THRESHOLD`, default 70), `atsRecommendation()`, and `atsHrEmail()` (`HR_EMAIL`, with a built-in fallback address).
  - Output: `atsDetails()` decodes the stored `ats_summary` JSON. `atsNotifyHr()` emails HR every application in the applicant's enterprise theme (score badge, summary, strengths/gaps, cover note, resume attached, Reply-To the candidate; works without a score). `atsNotifyUnscored()` covers scoring failures. `atsEsc()`/`atsListHtml()` are HTML helpers.

## Flow

1. `atsScreenSafely($pdo, $id, $notify = true)` wraps `atsScreenApplicant()` and never throws. It loads the applicant, builds the job context, and extracts resume text. It always computes the keyword score. When `ATS_USE_AI=1` and Gemini is enabled, it tries the AI score, which takes precedence and keeps the keyword data.
2. It persists `ats_score`, `ats_summary` (full JSON), `ats_method`, `ats_shortlisted`, and `ats_scored_at`. If `ats_notified_at` is empty and `$notify` is true (every new application; admin re-screen passes false), it calls `atsNotifyHr()` and stamps `ats_notified_at` on success.
3. Mail callers render with `emailRender()` and send with `emailSend()` (header image + their attachments → `Mailer::send()`). SMTP failures are logged and fall back to `mail()`.

## Integration

- `EmailTemplate`/`Mailer`: `api/inquire.php` (team + confirmation), `api/applicants.php` (confirmation), `Ats.php` (HR application email), `api/chat/message.php` (handoff), `api/admin/auth.php` (password code); `api/cron/selftest.php` uses `Mailer` directly.
- `Gemini`: `api/chat/message.php` (chat assistant) and `Ats.php` (optional AI scoring).
- `Ats`: `api/applicants.php` (post-response screening via a shutdown function), `api/admin/applicants.php` (`atsEnsureSchema`, `atsDetails`, re-screen), and `api/cron/ats-digest.php` (backfill + retry of undelivered HR emails).
- Environment: `SMTP_*`/`MAIL_*`, `GEMINI_API_KEY`, `GEMINI_MODEL`, `ATS_THRESHOLD`, `ATS_USE_AI`, `HR_EMAIL`.
