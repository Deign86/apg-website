# lib/

## Responsibility
Client-side chat API and session-token utilities shared by APG live chat/AI-assisted contact components.

## Design
- `getSavedSessionToken()` and `saveSessionToken(token)` read/write the `apg_chat_session_token` key in `localStorage`; storage failures are caught and treated as unavailable.
- `startChatSession(enterpriseSlug = 'apg-main', sessionToken = null)` creates or restores a session and persists a returned session token.
- `sendChatMessage(sessionToken, message, enterpriseSlug = 'apg-main', isHandoff = false)` sends a visitor message or live-agent handoff.
- `pollChatSession(sessionToken, afterId = 0)` retrieves session status, assignment, and newer messages.
- `aiChat(message, history, meta)` is a backward-compatible adapter to `sendChatMessage`; history is accepted for legacy callers but unused, and the adapter returns `{ content, fallback }`.

## Flow
- Chat consumer obtains a saved token → calls `startChatSession` with enterprise slug → POST `/api/chat/start.php` with `session_token` and `enterprise_slug` → successful session token is saved and response returned for component state.
- Message input or handoff action → `sendChatMessage` POSTs JSON to `/api/chat/message.php` with token, message, enterprise slug, and handoff flag → result (reply/status/handoff) returns to the consumer for display/state updates.
- Active session polling → `pollChatSession` GETs `/api/chat/poll.php?session_token=...&after_id=...` → consumer incorporates status and messages.
- All network helpers return `{ success: false, error }` on caught fetch/parse-path exceptions rather than throwing; `aiChat` converts success into `{ content: reply, fallback: false }` and failure into `{ content: null, fallback: true }`.

## Integration
- Consumers supply enterprise identifiers from the shared enterprise route/config vocabulary and own UI rendering, polling cadence, and chat state; this module only persists token and performs requests.
- Chat-related admin capabilities are represented by `roleCan(..., 'chat')` in `src/data/permissions.js`; enforcement belongs to server endpoints.
- Separate public lead flows use `/api/inquire.php` (inquiry JSON) and `/api/applicants.php` (multipart application), not this chat client.
