# Repository Atlas: apg-website (Alpha Premier Group)

## Project Responsibility
Vite 7 + React 18 + Tailwind v4 + React Router 7 SPA on a native PHP 8+ PDO/MySQL REST backend. Public site (redesign shell + 7 subsidiary experiences + views), authenticated `/admin/*` CMS/ATS/live-chat console, and Hostinger/Titan SMTP mail dispatch. Deployed to Hostinger `public_html` (Apache rewrites); legacy archive at `public/legacy/` (`/legacy`).

## System Entry Points
- `index.html`: `#root` mount, fonts, SEO/OG tags.
- `src/main.jsx`: StrictMode + HelmetProvider + BrowserRouter bootstrap, `styles/global.css`, optional GA (`VITE_ANALYTICS_ID`).
- `src/App.jsx`: Top-level `<Routes>` — public `RedesignShell` (`/`, `/enterprises`, `/careers`, `/blogs`, `/inquire`), page routes (`/properties`, `/virtual-office`, `/contact`, `/privacy`, `/terms`), nested `AltaVenture` routes, `EnterpriseShell` subsidiary routes + short aliases, `/admin/*` → `AdminShell`, wildcard `NotFound`.
- `src/types.ts`: Shared contracts — `Enterprise`, `JobPosition`, `BlogPost`, `ServiceItem`, `ContentBlock`, `ChatMessage`, `InquireFormData`.
- `package.json` / `vite.config.js` / `vercel.json`: Vite build, Tailwind v4 plugin, `tools/deploy-hostinger.mjs`.
- `api/config.php` + `api/db.php`: `.env` loading, Manila TZ, hardened session cookies, CORS/JSON (`sendJson`), RBAC/capability helpers, canonical enterprise slugs, PDO singleton (`utf8mb4`, exceptions, native prepares).
- `api/schema.sql` + `api/setup.php` + `api/migrate.php`: DB contract (`content_blocks`, `service_items`, `job_openings`, `blog_posts`, `job_applicants`, `admins`, `listings`, `listing_images`, `chat_sessions`, `chat_messages`), guarded setup/migration + seed backfill.

## Flow
1. Browser → `main.jsx` → `App.jsx` shells (`RedesignShell` public, `EnterpriseShell` subsidiaries, `AdminShell` console).
2. Reads: views/hooks (`useListings`, `useBlogs`, `useCareers`, `useContent`, `useServices`) → GET `api/*.php` → MySQL or in-memory/static fallback → render. Writes: `InquireView`/modals → POST `api/inquire.php`; careers apply → multipart POST `api/applicants.php`; chat widget → `api/chat/start|message|poll.php` (32-hex token bearer, FAQ/handoff escalation).
3. Admin: `/admin/login` → POST `api/admin/auth.php` (session cookie) → `ProtectedRoute`+`AuthProvider` → CRUD managers ↔ `api/admin/*.php` (capability-gated, PDO transactions) → public readers reflect managed rows.
4. Mail: `inquire.php` / `applicants.php` / `chat/message.php` → `api/lib/Mailer.php` (sockets SMTP `smtp.hostinger.com:465` SSL + `mail()` fallback) → `MAIL_TO_EMAIL`.

## Integration
- Public display boundary: `api/blogs|careers|content|listings|services.php` ↔ hooks/views/subsidiary apps. Submission boundary: `api/inquire|applicants.php` + `api/chat/*.php` ↔ forms/chat widget.
- Auth boundary: `api/admin/auth.php` session + `src/context/AuthContext.jsx` (`can()` via `src/data/permissions.js` `roleCan`) — server RBAC authoritative.
- Tenant boundary: `src/data/enterprises.js` (canonical slugs) + `src/data/enterpriseConfig.js` (`getEnterpriseConfig(pathname)`) + `EnterpriseNavContext` bridge ↔ `EnterpriseHeader/Footer/Chatbot`, `EnterpriseInquire.tsx`.
- Content fallback discipline: static fixtures in `src/data/companyData.ts` seed views; hooks retain fallback on empty/error; enterprise career/service scoping is fallback-only (corporate rows fill gaps).

## Directory Map (Aggregated)
| Directory | Responsibility Summary | Detailed Map |
|-----------|------------------------|--------------|
| `api/` | Public PHP REST reads (blogs/careers/content/services/listings) + inquiry/applicant writes, shared config/PDO, schema/setup | [View Map](api/codemap.md) |
| `api/admin/` | Session-authenticated CMS/ATS/chat/users API (RBAC + capabilities + superadmin users) | [View Map](api/admin/codemap.md) |
| `api/chat/` | Visitor chat API: token session restore, FAQ/handoff messaging, incremental poll | [View Map](api/chat/codemap.md) |
| `api/lib/` | Standalone `Mailer` SMTP + `mail()` fallback transport, no DB | [View Map](api/lib/codemap.md) |
| `src/` | SPA bootstrap, top-level routing/shells, shared types | [View Map](src/codemap.md) |
| `src/components/` | Shared + enterprise chrome: `Layout`, `EnterpriseShell`, headers/footers, `EnterpriseChatbot` | [View Map](src/components/codemap.md) |
| `src/components/admin/` | Admin shell primitives: `AdminLayout`, `ProtectedRoute`, `DataTable`, `Toast`, `ConfirmDialog` | [View Map](src/components/admin/codemap.md) |
| `src/components/redesign/` | Public redesign shell, sections, controlled modals (`Inquire`, `JobApply`, `BlogDetail`), `AlphaAssistant` | [View Map](src/components/redesign/codemap.md) |
| `src/components/ui/` | Reusable visual primitives (`spotlight-card`, `glowing-ai-chat-assistant` prototype) | [View Map](src/components/ui/codemap.md) |
| `src/routes/` | Public/enterprise page routes + navigation | [View Map](src/routes/codemap.md) |
| `src/routes/admin/` | Authenticated admin SPA: login, dashboard, CRUD managers, `LiveChat` ↔ `api/admin/*.php` | [View Map](src/routes/admin/codemap.md) |
| `src/routes/subsidiaries/` | 7 subsidiary experiences (88Prime, Realty, DynamicTree, SwiftClear, LuxePrime, AltaVenture, Construction) + shared `EnterpriseInquire` | [View Map](src/routes/subsidiaries/codemap.md) |
| `src/routes/subsidiaries/alta-venture/` | Full nested sub-site (Home/Services/Blogs/Careers/Inquire + branded chrome/chatbot) | [View Map](src/routes/subsidiaries/alta-venture/codemap.md) |
| `src/routes/subsidiaries/alpha-realty/` (+`app/`, `app/components/`, `styles/`) | Themed Realty listings/blogs/careers/inquiry app, black-gold theme | [View Map](src/routes/subsidiaries/alpha-realty/codemap.md) |
| `src/routes/subsidiaries/dynamic-tree/` (+`app/`, `app/components/`, `app/components/figma/`, `app/pages/`, `styles/`) | Creative/talent themed page set, pink/rose theme, figma fallback helper | [View Map](src/routes/subsidiaries/dynamic-tree/codemap.md) |
| `src/routes/subsidiaries/luxe-prime/` (+`app/`, `app/components/`, `app/components/figma/`, `styles/`) | Luxury realty app, dark theme, router-synced pages | [View Map](src/routes/subsidiaries/luxe-prime/codemap.md) |
| `src/routes/subsidiaries/swift-clear/` (+`app/`, `app/components/`, `app/components/figma/`, `imports/`, `styles/`) | Cleaning-services app + generated Figma screen mocks, theme layers | [View Map](src/routes/subsidiaries/swift-clear/codemap.md) |
| `src/views/` | Route-level public views (Home, Enterprises, Blogs, Careers+apply, Inquire) | [View Map](src/views/codemap.md) |
| `src/hooks/` | Data hooks (`useListings/Blogs/Careers/Content/Services`) with loading/error + fallback | [View Map](src/hooks/codemap.md) |
| `src/data/` | Static fixtures, canonical slugs/configs, client capability metadata | [View Map](src/data/codemap.md) |
| `src/context/` | `AuthContext` (session + `can()`) + `EnterpriseNavContext` (embedded nav bridge) | [View Map](src/context/codemap.md) |
| `src/lib/` | Chat session/message/poll/token utilities (`ai.js`) consumed by chatbot | [View Map](src/lib/codemap.md) |
| `src/styles/` | Global tokens, fonts, resets, shared utilities | [View Map](src/styles/codemap.md) |

> Subsidiary leaf maps (figma helpers, page sets, imports screens) are linked from the parent `src/routes/subsidiaries/codemap.md` and each intermediate folder map. Excluded from atlas scope by design: `public/**` assets/legacy, `src/imports/**`, `tools/**`, `tests/**`, `docs/**`.
