# api/chat/

## Responsibility

Provides the unauthenticated visitor-facing live-chat API: create/restore a conversation, submit visitor messages for FAQ responses or agent handoff, and poll session state/messages.

## Design

- `start.php`, `message.php`, and `poll.php` require `../config.php` and `../db.php`, use the shared PDO connection and prepared SQL against `chat_sessions` and `chat_messages`, and return JSON through `sendJson()`. `start.php`, `message.php`, and `poll.php` accept OPTIONS for CORS; `message.php` is POST-only.
- A random 32-hex-character `session_token` is the visitor bearer credential; there is no PHP admin authentication on these public routes. Poll/message requests resolve the token to a session before reading/writing. Chat statuses are `bot`, `waiting_for_agent`, `agent_active`, and `closed`.
- `message.php` contains deterministic keyword FAQ matching (`matchFaqReply()`), high-stakes/direct-agent handoff detection, and consecutive bot-miss escalation. It limits message text to 2,000 valid UTF-8 characters and prevents writes to closed sessions.
- `message.php` requires `../lib/Mailer.php` only for handoff notifications. Its SMTP notice contains enterprise/session context, recent conversation, and an admin queue link; mail exceptions are logged without preventing handoff response.

## Flow

1. The chat widget calls `start.php` with JSON, form fields, or GET parameters. With a known token, the endpoint restores the `chat_sessions` row, loads all ascending `chat_messages`, and may update the session's enterprise slug. Without a valid existing token, it generates one, inserts a `bot` session, and returns session metadata plus an empty history.
2. The visitor sends POST to `message.php` with token and text or explicit handoff. The endpoint validates input, fetches session/admin assignment, rejects missing/closed sessions, inserts the visitor message, updates session activity, and loads conversation history. Sessions already waiting or assigned to an agent return status without generating a bot reply.
3. For bot-mode sessions, explicit request/high-stakes keywords or repeated unmatched input trigger an UPDATE to `waiting_for_agent`, an inserted bot handoff message, and best-effort `Mailer::send()` notification. Otherwise `matchFaqReply()` either inserts a matching bot response or inserts a first-miss fallback; response includes the current chat state.
4. The widget calls `poll.php` with token and optional `after_id`; it loads session state and returns `chat_messages.id > after_id` in ascending order, including assigned admin names. Incremental polling exposes new bot/admin replies, handoff, and closure.

## Integration

- The public website chat widget consumes `/api/chat/start.php`, `/api/chat/message.php`, and `/api/chat/poll.php`; browser-held session token correlates requests without using an admin cookie.
- The admin live-chat UI uses `/api/admin/chat.php` to inspect/claim/respond/close the same `chat_sessions` and `chat_messages` rows. Visitor polling then sees admin replies and status changes.
- `config.php` supplies CORS/JSON response behavior and SMTP constants; `db.php` supplies PDO; `lib/Mailer.php` dispatches handoff notifications to `MAIL_TO_EMAIL`. The schema foreign-keys sessions to `admins` and messages to sessions/admins.
