# api/chat/

## Responsibility

Provides the unauthenticated visitor-facing chat API: create/restore a conversation, answer visitor messages (Gemini assistant grounded in `api/data/knowledge.md`, keyword FAQ fallback) or hand off to a live agent, and poll session state/messages.

## Design

- `start.php`, `message.php`, and `poll.php` require `../config.php` and `../db.php`, use prepared SQL against `chat_sessions`/`chat_messages`, and return JSON through `sendJson()`. `start.php` and `message.php` are POST-only; `poll.php` reads the token from query, form, or JSON body.
- A random 32-hex `session_token` is the visitor bearer credential. Statuses: `bot`, `waiting_for_agent`, `agent_active`, `closed`.
- Rate limits (`rateLimit()` in `config.php`): new sessions 10/hour per IP (restoring a token is not throttled); messages 30/minute per IP.
- `message.php` key functions:
  - `askChatAssistant()` builds a fixed system prompt (scope, no invented facts, handoff rules, prompt-injection refusal) plus the knowledge base, sends the last ~10 turns through `geminiGenerate()` with a JSON schema `{reply, needs_human, reason}`.
  - `guardAssistantReply()` rejects prompt leaks and emails/phone numbers absent from the knowledge base, and replaces links not on `alphapremiergroup.com` (or its subdomains).
  - `chatAiAllowed()` skips AI for messages over 500 chars and enforces daily caps: 25 per chat, 60 per IP, `GEMINI_DAILY_LIMIT` (default 800) site-wide.
  - `matchFaqReply()` is the deterministic keyword FAQ (global + per-enterprise intents).
- Messages are limited to 2,000 valid UTF-8 characters; closed sessions reject writes. `message.php` requires `../lib/Mailer.php` and `../lib/Gemini.php`.

## Flow

1. The widget POSTs to `start.php`. A known token restores the session (with assigned admin name) and full history, updating the enterprise slug if it changed; otherwise a new `bot` session and token are created.
2. The visitor POSTs to `message.php` with token and text, or an explicit handoff flag. The endpoint validates, syncs the enterprise slug, inserts the visitor message, and loads history. Sessions already `waiting_for_agent`/`agent_active` return without a bot reply.
3. In `bot` mode, if Gemini is enabled and `chatAiAllowed()` passes, `askChatAssistant()` answers; the status is re-read afterwards so a reply never talks over an agent who just took over. Handoff fires on: explicit request; AI `needs_human` (AI reply used as the handoff message); or, without an AI answer, handoff/high-stakes keywords or a second consecutive FAQ miss. Handoff sets `waiting_for_agent`, inserts the bot message, and best-effort emails `MAIL_TO_EMAIL` (reason, enterprise, conversation excerpt, fixed-host admin link).
4. Otherwise the AI reply, a `matchFaqReply()` answer, or the first-miss fallback is inserted as a `bot` message and returned.
5. The widget calls `poll.php` with token and `after_id`; it returns status, assigned admin, and newer messages (with sender admin names) in ascending order.

## Integration

- Consumed by the public chat widgets via `src/lib/ai.js`; the browser-held token correlates requests without an admin cookie.
- `/api/admin/chat.php` claims/replies/closes the same rows; visitors see those changes through polling.
- `config.php` supplies JSON responses, rate limiting, enterprise slug resolution, and SMTP constants; `lib/Gemini.php` calls the Gemini REST API (`GEMINI_API_KEY`, `GEMINI_MODEL`); `data/knowledge.md` is the only grounding source; `lib/Mailer.php` sends handoff notices. With no Gemini key or a missing knowledge base, the FAQ path is used.
