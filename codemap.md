# Repository Atlas: apg-website (Alpha Premier Group)

## Project Responsibility
Vite 7 + React 18 + Tailwind v4 + React Router 7 SPA on a native PHP 8+ PDO/MySQL REST backend. Public site (redesign shell + 8 enterprise experiences, each also served on its own `<slug>.alphapremiergroup.com` subdomain), authenticated `/admin/*` CMS/ATS/live-chat console, Gemini-backed chat assistant and applicant screening (both optional), and Hostinger SMTP mail dispatch. Deployed to Hostinger `public_html` (Apache rewrites); legacy archive at `public/legacy/` (`/legacy`).

## System Entry Points
- `index.html`: `#root` mount, fonts, base SEO/OG tags.
- `src/main.jsx`: StrictMode + HelmetProvider + BrowserRouter bootstrap, `styles/global.css`, optional GA (`VITE_ANALYTICS_ID`).
- `src/App.jsx`: Top-level `<Routes>` — public `RedesignShell` (`/`, `/enterprises`, `/careers`, `/blogs`, `/inquire`), page routes (`/virtual-office`, `/contact`, `/privacy`, `/terms`), nested `AltaVenture` routes, `EnterpriseShell` subsidiary routes + short aliases, `/admin/*` → `AdminShell`, wildcard `NotFound`; apex `/properties` redirects (keeping `?ref=`) to Realty's `/subsidiaries/realty/properties`. `useEnterpriseHostLocation()` maps a clean subdomain URL onto the in-app `/subsidiaries/<slug>/...` path and, on production hosts, redirects enterprise paths to their subdomain and apex-only paths (`/admin`, `/privacy`, `/terms`) back to the apex.
- `src/lib/enterpriseHost.js`: Hostname → enterprise slug (`hostEnterprise`, `enterpriseFromPath`, `basePathFor`, `enterpriseOrigin`, `MAIN_SITE_HREF`); non-production hosts (localhost, Vercel previews) keep plain path routing.
- `src/components/Seo.tsx`: Single source of per-page head metadata (title, description, absolute canonical on apex or enterprise subdomain, OG/Twitter, robots, JSON-LD).
- `src/types.ts`: Shared contracts — `Enterprise`, `JobPosition`, `BlogPost`, `ServiceItem`, `ContentBlock`, `ChatMessage`, `InquireFormData`.
- `package.json` / `vite.config.js` / `vercel.json`: Vite build, Tailwind v4 plugin, `npm run deploy` (`tools/deploy-hostinger.mjs`).
- `api/config.php` + `api/db.php`: `.env` loading, Manila TZ, strict session cookies, same-origin JSON (`sendJson`, no CORS headers), `rateLimit()`, form guard, RBAC helpers, canonical enterprise slugs, PDO singleton.
- `api/schema.sql` + `api/setup.php` + `api/migrate.php`: DB contract and one-shot dev/operator utilities (CLI or `X-Setup-Token`); never shipped to production.
- `.htaccess` (root): HTTPS redirect; dotfiles denied; `X-Robots-Tag: noindex` for `/admin*`; security headers; `no-cache` for `*.html` and immutable caching for hashed `-xxxxxxxx.js|css` bundles; existing files/dirs served directly; missing `assets|images|imports|fonts|legacy/` files return a real 404 (never the HTML shell); extensionless `/api/*` → `.php`; everything else → `index.html`. Crawler/link-preview user agents get `prerender/<host>/<path>/index.html` when it exists (rule 0, `Vary: User-Agent`); HSTS; 30-day caching for images/video/fonts; gzip for text.

## Flow
1. Browser (apex or enterprise subdomain) → `main.jsx` → `App.jsx` host-aware location → shells (`RedesignShell` public, `EnterpriseShell` subsidiaries, `AdminShell` console); `Seo.tsx` sets head tags per route.
2. Reads: views/hooks (`useListings`, `useBlogs`, `useCareers`, `useContent`, `useServices`) → GET `api/*.php` → MySQL or in-memory/static fallback → render. Property listings: APR Google Drive → `api/cron/drive-sync.php` (every 15 min) → `api/data/listings.generated.json` + `uploads/drive/` photos → `api/listings.php` → `useListings` — shown only on Alpha Premier Realty (`realty.alphapremiergroup.com` home "Available now" strip and `/properties`) → Realty `InquireModal` with the listing ref. Writes: `InquireView`/modals → POST `api/inquire.php`; every careers form → multipart POST `api/applicants.php` (persisted, then ATS-scored after the response); chat widget → `api/chat/start|message|poll.php` (32-hex token bearer; Gemini answer grounded in `api/data/knowledge.md`, FAQ fallback, live-agent handoff).
3. Admin: `/admin/login` → POST `api/admin/auth.php` (throttled, session regenerated) → `ProtectedRoute`+`AuthProvider` → CRUD managers ↔ `api/admin/*.php` (role re-read per request, same-origin writes, capability-gated) → public readers reflect managed rows.
<<<<<<< HEAD
4. Mail: `inquire.php` / `applicants.php` / `chat/message.php` → `api/lib/Mailer.php` → `MAIL_TO_EMAIL`; ATS shortlist emails and `api/cron/ats-digest.php` daily digest → `HR_EMAIL`.
5. Deploy (current production route, see `DEPLOY.md` "Current production route"): build (vite build, then `tools/prerender.mjs` snapshots every sitemap URL with local Chrome into `dist/prerender/`) + `tools/deploy-hostinger.mjs --zip-only` → tarball attached to a GitHub release with `tools/hostinger-update.sh` → a temporary Hostinger cron runs the script on the server, which snapshots the docroot, keeps `public_html/.env` and `uploads/`, strips `.env*`, `setup.php`, `migrate.php`, `schema.sql` and `codemap.md`/`README.md`, replaces `api/` wholesale, and keeps old hashed bundles. All enterprise subdomains point at the same `public_html`. `ats-digest.php` runs daily via cron (`0 0 * * *`); `drive-sync.php` every 15 minutes (`*/15 * * * *`), and the update script carries `api/data/listings.generated.{md,json}` across deploys.
=======
4. Mail: every email is rendered by `api/lib/EmailTemplate.php` in the enterprise's own theme (brand header embedded as an image) and sent by `api/lib/Mailer.php`. Inquiries and chat handoffs → `MAIL_TO_EMAIL`; every job application → `HR_EMAIL` immediately (resume + ATS score); inquirers and applicants get a confirmation.
5. Deploy (current production route, see `DEPLOY.md` "Current production route"): build + `tools/deploy-hostinger.mjs --zip-only` → tarball attached to a GitHub release with `tools/hostinger-update.sh` → a temporary Hostinger cron runs the script on the server, which snapshots the docroot, keeps `public_html/.env` and `uploads/`, strips `.env*`, `setup.php`, `migrate.php`, `schema.sql` and `codemap.md`/`README.md`, replaces `api/` wholesale, and keeps old hashed bundles. All enterprise subdomains point at the same `public_html`. `ats-digest.php` runs daily via cron (`0 0 * * *`); `drive-sync.php` every 15 minutes (`*/15 * * * *`), and the update script carries `api/data/listings.generated.{md,json}` across deploys.
>>>>>>> origin/main

## Integration
- Public display boundary: `api/blogs|careers|content|listings|services.php` ↔ hooks/views/subsidiary apps. Submission boundary: `api/inquire|applicants.php` + `api/chat/*.php` ↔ forms/chat widget.
- Auth boundary: `api/admin/auth.php` session + `src/context/AuthContext.jsx` (`can()` via `src/data/permissions.js` `roleCan`) — server RBAC (`adminCapabilities()`) authoritative.
- Tenant boundary: `src/data/enterprises.js` (canonical slugs) + `src/lib/enterpriseHost.js` (subdomains) + `src/data/enterpriseConfig.js` + `EnterpriseNavContext` ↔ `EnterpriseHeader/Footer/Chatbot`, `EnterpriseInquire.tsx`; server mirror is `enterpriseSlugs()`/`resolveEnterpriseSlug()` in `api/config.php`.
- AI boundary: `api/lib/Gemini.php` (REST, strict safety settings) used by `api/chat/message.php` and `api/lib/Ats.php`; disabled (FAQ bot / keyword ATS) when `GEMINI_API_KEY` is empty.
- Environment (`.env.example`): `DB_*`, `SETUP_TOKEN`, `ADMIN_DEFAULT_PASSWORD`, `SMTP_*`/`MAIL_*`, `VITE_ANALYTICS_ID`, `GEMINI_API_KEY`/`GEMINI_MODEL`/`GEMINI_DAILY_LIMIT`, `HR_EMAIL`/`ATS_THRESHOLD`/`ATS_USE_AI`.
- Content fallback discipline: static fixtures in `src/data/companyData.ts` seed views; hooks retain fallback on empty/error; enterprise career/service scoping is fallback-only (corporate rows fill gaps).

## Directory Map (Aggregated)
| Directory | Responsibility Summary | Detailed Map |
|-----------|------------------------|--------------|
| `api/` | Public PHP REST reads + inquiry/applicant writes, shared config/PDO/rate limiting, schema and dev-only setup/migration | [View Map](api/codemap.md) |
| `api/admin/` | Session-authenticated CMS/ATS/chat/users API (RBAC + capabilities, ATS details/re-screen) | [View Map](api/admin/codemap.md) |
| `api/chat/` | Visitor chat API: token sessions, Gemini/FAQ replies, handoff, incremental poll | [View Map](api/chat/codemap.md) |
| `api/lib/` | `Mailer` SMTP transport, `EmailTemplate` branded emails, `Gemini` REST client, `GoogleDrive` client, `Ats` resume screening (web access denied) | [View Map](api/lib/codemap.md) |
| `api/cron/` | CLI-only daily ATS safety net + 15-minute Drive listings sync (web access denied) | [View Map](api/cron/codemap.md) |
| `api/data/` | Chatbot knowledge base `knowledge.md` (web access denied) | [View Map](api/data/codemap.md) |
| `src/` | SPA bootstrap, top-level routing/shells, shared types | [View Map](src/codemap.md) |
| `src/components/` | Shared + enterprise chrome: `Layout`, `EnterpriseShell`, headers/footers, `EnterpriseChatbot`, `Seo`, `CookieConsent` | [View Map](src/components/codemap.md) |
| `src/components/admin/` | Admin shell primitives: `AdminLayout`, `ProtectedRoute`, `DataTable`, `Toast`, `ConfirmDialog` | [View Map](src/components/admin/codemap.md) |
| `src/components/redesign/` | Public redesign shell, sections, controlled modals (`Inquire`, `JobApply`, `BlogDetail`), `AlphaAssistant` | [View Map](src/components/redesign/codemap.md) |
| `src/components/ui/` | Reusable visual primitives (`spotlight-card`, `glowing-ai-chat-assistant` prototype) | [View Map](src/components/ui/codemap.md) |
| `src/routes/` | Public/enterprise page routes + navigation | [View Map](src/routes/codemap.md) |
| `src/routes/admin/` | Authenticated admin SPA: login, dashboard, CRUD managers, `LiveChat` ↔ `api/admin/*.php` | [View Map](src/routes/admin/codemap.md) |
| `src/routes/subsidiaries/` | Subsidiary experiences (88Prime, Realty, DynamicTree, SwiftClear, LuxePrime, AltaVenture, Construction) + shared `EnterpriseInquire` | [View Map](src/routes/subsidiaries/codemap.md) |
| `src/routes/subsidiaries/alta-venture/` | Full nested sub-site (Home/Services/Blogs/Careers/Inquire + branded chrome/chatbot) | [View Map](src/routes/subsidiaries/alta-venture/codemap.md) |
| `src/routes/subsidiaries/alpha-realty/` (+`app/`, `app/components/`, `styles/`) | Themed Realty listings/blogs/careers/inquiry app, black-gold theme | [View Map](src/routes/subsidiaries/alpha-realty/codemap.md) |
| `src/routes/subsidiaries/dynamic-tree/` (+`app/`, `app/components/`, `app/components/figma/`, `app/pages/`, `styles/`) | Creative/talent themed page set, pink/rose theme, figma fallback helper | [View Map](src/routes/subsidiaries/dynamic-tree/codemap.md) |
| `src/routes/subsidiaries/luxe-prime/` (+`app/`, `app/components/`, `app/components/figma/`, `styles/`) | Luxury realty app, dark theme, router-synced pages | [View Map](src/routes/subsidiaries/luxe-prime/codemap.md) |
| `src/routes/subsidiaries/swift-clear/` (+`app/`, `app/components/`, `app/components/figma/`, `imports/`, `styles/`) | Cleaning-services app + generated Figma screen mocks, theme layers | [View Map](src/routes/subsidiaries/swift-clear/codemap.md) |
| `src/views/` | Route-level public views (Home, Enterprises, Blogs, Careers+apply, Inquire) | [View Map](src/views/codemap.md) |
| `src/hooks/` | Data hooks (`useListings` Drive feed; `useBlogs/Careers/Content/Services` with fallback) + `useModalDialog` (Esc, focus trap, scroll lock) | [View Map](src/hooks/codemap.md) |
| `src/data/` | Static fixtures, canonical slugs/configs, client capability metadata | [View Map](src/data/codemap.md) |
| `src/context/` | `AuthContext` (session + `can()`) + `EnterpriseNavContext` (embedded nav bridge) | [View Map](src/context/codemap.md) |
| `src/lib/` | Chat client utilities (`ai.js`) + enterprise subdomain routing (`enterpriseHost.js`) | [View Map](src/lib/codemap.md) |
| `src/styles/` | Global tokens, fonts, resets, shared utilities | [View Map](src/styles/codemap.md) |

> Subsidiary leaf maps (figma helpers, page sets, imports screens) are linked from the parent `src/routes/subsidiaries/codemap.md` and each intermediate folder map. Excluded from atlas scope by design: `public/**` assets/legacy (incl. `robots.txt`, `sitemap.xml`, `llms.txt`), `src/imports/**`, `tools/**` (deploy scripts described in Flow step 5), `tests/**`, `docs/**`.
