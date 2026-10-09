# lib/

## Responsibility
Client-side utilities: the chat API/session-token client used by the enterprise chatbot (`ai.js`), and hostname-based enterprise subdomain helpers (`enterpriseHost.js`).

## Design
- `ai.js`:
  - `getSavedSessionToken()` / `saveSessionToken(token)` read/write the `apg_chat_session_token` key in `localStorage`; storage failures are caught and treated as unavailable.
  - `startChatSession(enterpriseSlug = 'apg-main', sessionToken = null)` creates or restores a session and persists a returned token.
  - `sendChatMessage(sessionToken, message, enterpriseSlug = 'apg-main', isHandoff = false)` sends a visitor message or live-agent handoff.
  - `pollChatSession(sessionToken, afterId = 0)` retrieves session status, assignment, and newer messages.- `enterpriseHost.js` (imports `ENTERPRISE_SLUGS`; subdomain slugs are all except `corporate`):
  - `ROOT_DOMAIN` (`alphapremiergroup.com`), `basePathFor(slug)` (`/virtual-office` for virtual-office, else `/subsidiaries/<slug>`), `enterpriseOrigin(slug)` (`https://<slug>.<ROOT_DOMAIN>`).
  - `hostEnterprise(hostname?)` returns the enterprise slug served by a `<slug>.<ROOT_DOMAIN>` host, or `null` on apex/www/other hosts. `isProductionHost(hostname?)` is true for the apex and any subdomain.
  - `enterpriseFromPath(pathname)` splits an in-app path into `{ slug, rest }` when it belongs to an enterprise, else `null`.
  - `MAIN_SITE_HREF` is `https://<ROOT_DOMAIN>/` on an enterprise subdomain, otherwise `/`.

## Flow
- Chat: saved token → `startChatSession` POSTs `/api/chat/start.php` (`session_token`, `enterprise_slug`) → token saved. Input/handoff → `sendChatMessage` POSTs JSON to `/api/chat/message.php` (server answers with Gemini grounded in a knowledge base, FAQ fallback, or handoff) → result returned. Polling → `pollChatSession` GETs `/api/chat/poll.php?session_token=...&after_id=...`. All helpers return `{ success: false, error }` on caught failures rather than throwing.
- Hosts: `App.jsx`'s `useEnterpriseHostLocation` calls `hostEnterprise()` once at module load, maps clean subdomain paths with `basePathFor`, and (only when `isProductionHost()`) redirects using `enterpriseFromPath` + `enterpriseOrigin`. Localhost and preview hosts get `null`/false, so plain path routing applies.

## Integration
- `ai.js` consumer is `components/EnterpriseChatbot.jsx`, which owns UI, polling cadence, and chat state. Admin chat capability is `roleCan(..., 'chat')`; enforcement is server-side.
- `enterpriseHost.js` consumers: `src/App.jsx`, `components/Seo.tsx` (`ROOT_DOMAIN`, `enterpriseOrigin` for canonicals/JSON-LD), and `MAIN_SITE_HREF` in `components/EnterpriseHeader.jsx` and `routes/subsidiaries/alta-venture/Header.jsx`.
- Lead flows (`/api/inquire.php`, `/api/applicants.php`) do not use this folder.
