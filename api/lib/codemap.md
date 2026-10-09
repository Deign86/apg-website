# api/lib/

## Responsibility

Contains the standalone `Mailer` transport used to dispatch public inquiry, applicant, and live-chat handoff email.

## Design

- `Mailer.php` has no external package dependency; it reads SMTP/from settings from constants defined by `api/config.php` and supports HTML bodies, Reply-To headers, regular attachments, and inline CID attachments.
- `Mailer::__construct()` captures `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_SECURE`, `MAIL_FROM_EMAIL`, and `MAIL_FROM_NAME`. `send()` attempts SMTP only when host/user/password are populated, then falls back to native PHP `mail()` after SMTP failure or absent credentials.
- SMTP is implemented with PHP sockets (`fsockopen`): implicit SSL for `ssl`/port 465, optional STARTTLS, SMTP AUTH LOGIN, recipient commands, MIME multipart/base64 encoding, then QUIT. No DB access or persistence is performed here.

## Flow

1. Caller constructs `new Mailer()` after loading `config.php`, then calls `send($to, $subject, $htmlBody, $replyToEmail, $replyToName, $attachments)`.
2. `send()` routes to `sendViaSmtp()` when SMTP config is complete. That method connects/authenticates, sends the encoded MIME payload (including existing attachment files and optional `Content-ID`), and returns true; SMTP exceptions are logged and trigger `sendViaNativeMail()`.
3. Native fallback builds equivalent HTML/multipart headers and calls PHP `mail()`; its boolean result is returned to the caller. The mailer does not persist delivery status or retry asynchronously.

## Integration

- `api/inquire.php` sends enterprise-branded inquiry messages and optional logo/form attachments to `MAIL_TO_EMAIL`; `api/applicants.php` sends ticketed recruitment notices with Reply-To set to the applicant and an optional saved resume attachment.
- `api/chat/message.php` calls the mailer on visitor-to-agent handoff to notify the configured admin recipient; failure is logged and does not cancel state transition.
- `api/config.php` defines environment-backed Titan/Hostinger SMTP configuration (default `smtp.hostinger.com:465`, SSL) and sender/recipient defaults. Callers own validation, HTML construction/escaping, and attachment preparation.
