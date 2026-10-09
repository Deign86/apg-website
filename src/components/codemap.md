# src/components/

## Responsibility
Shared site chrome for the legacy/public and subsidiary route families: standard `Layout`, legacy `Header`/`Footer`, chatbot adapters, and enterprise-specific `EnterpriseShell` chrome.

## Design
- `Layout` composes `Header`, `<main><Outlet /></main>`, `Footer`, and `Chatbot`; `Chatbot` is a thin alias for `EnterpriseChatbot`.
- `EnterpriseShell` is the shared subsidiary layout: `EnterpriseNavProvider` wraps `EnterpriseHeader`, routed `<Outlet />`, `EnterpriseFooter`, and `EnterpriseChatbot`.
- `Header` uses `useLocation` to switch between APG links and Construction/88Prime hash-link sets, calculates active links, tracks mobile-menu/scroll state, and portals to `document.body`.
- `EnterpriseHeader`/`EnterpriseFooter` resolve tenant branding and content through `getEnterpriseConfig(pathname)`. Header consumes `EnterpriseNavContext` (`currentPage`, `navigate`); footer buttons call the `window.enterpriseNavigate` bridge.
- `Footer` renders standard APG links/socials and returns `null` for `/subsidiaries/88prime`.
- `EnterpriseChatbot` has internally controlled open/input/session state; it resolves title/accent/prompts/slug from enterprise config, restores a saved token, calls the AI session API, polls messages/status, supports live-agent handoff, and creates downloadable `jspdf` transcripts. It portals into `document.body`.

## Flow
- A route layout renders its global header/footer around the matched route element via `<Outlet />`.
- `EnterpriseShell` resets scroll and refreshes AOS on pathname change, then installs the nav provider so child enterprise views and header share current page/navigation state.
- `EnterpriseChatbot` maps path to config/slug → restores or starts a session → maps server messages to display messages → polls by last message id and reconciles optimistic visitor messages → sends replies/handoff requests. Its footer controls create/reset chat sessions and transcript download.
- `EnterpriseFooter` maps configured footer keys to nav items; clicks use the context-installed global navigation bridge.

## Integration
- **Consumers/routes:** `src/App.jsx` uses `RedesignShell` for the primary public site and `EnterpriseShell` for Realty, Luxe Prime, Dynamic Tree, Swift Clear, Construction, and 88Prime subsidiary routes; Alta Venture has a separate shell. `Layout` is available for legacy/nested app areas (imported by `App.jsx`, though current main routes use `RedesignShell`). `EnterpriseShell` directly mounts `EnterpriseChatbot`; `Chatbot` wraps the same implementation.
- **Dependencies:** `src/context/EnterpriseNavContext`; `src/data/enterpriseConfig` (`getEnterpriseConfig`, `DEFAULT_ENTERPRISE_CONFIG`); `@/lib/ai` session/token functions; React Router `Outlet`, `Link`, `useLocation`, `useNavigate`; AOS; `jspdf`; `lucide-react`; component CSS (`Header.css`, `Footer.css`, `EnterpriseHeader.css`, `EnterpriseFooter.css`, `EnterpriseChatbot.css`).
