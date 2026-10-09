# src/

## Responsibility

The application entry and shared TypeScript domain types: `main.jsx` boots the SPA, `App.jsx` defines top-level routing, shells, and enterprise-subdomain path mapping, and `types.ts` describes shared business records.

## Design

- `main.jsx` mounts React under `React.StrictMode`, `HelmetProvider`, and `BrowserRouter`; global styles are imported once at bootstrap.
- `App.jsx` uses React Router v7 `<Routes location={routedLocation}>` with lazy-loaded route modules under a shared `Suspense` boundary with a null fallback. Cookie consent is separately lazy-loaded and rendered outside `<Routes>`. The route tree separates public `RedesignShell`, bespoke nested Alta Venture routes, shared `EnterpriseShell` enterprise pages, and `/admin/*`.
- `useEnterpriseHostLocation()` (in `App.jsx`) uses `lib/enterpriseHost` so one SPA serves both the apex and `<slug>.alphapremiergroup.com`. On an enterprise subdomain it rewrites the clean address-bar path onto the in-app path (`/` → `/subsidiaries/<slug>`, `/inquire` → `/subsidiaries/<slug>/inquire`; `virtual-office` maps to `/virtual-office`) and passes that location to `<Routes>`, so descendants' `useLocation()` see the in-app path.
- Production-only redirects (`isProductionHost()`): an in-app enterprise path on its own subdomain is `navigate(..., { replace: true })`d to the clean path; an enterprise path on any other production host does `window.location.replace` to that enterprise's subdomain; `/admin`, `/privacy`, `/terms` on a subdomain go back to the apex. Localhost/preview hosts keep plain path routing.
- Google Analytics is installed only when `VITE_ANALYTICS_ID` matches a GA measurement ID pattern; the script URL encodes that ID.
- `types.ts` centralizes structural interfaces/unions without runtime behavior: `Enterprise`, `JobPosition`, `BlogPost`, `ServiceItem`, `ContentBlock`, `ChatMessage`, `InquireFormData`, and `NavTab`. `vite-env.d.ts` holds Vite client typings.

## Flow

1. `index.html`'s `#root` is passed to `ReactDOM.createRoot`; bootstrap providers then render `App` inside the browser history router and Helmet context.
2. `App` computes `routedLocation` (host mapping above), then matches it. Public `RedesignShell` contains shell-owned `null` child elements for the index, `enterprises`, `careers`, `careers/*`, `blogs`, and `inquire`, alongside page routes `properties`, `virtual-office`, `contact`, `privacy`, and `terms`; `about` redirects to `/`. `routes/Home.jsx` still exists but is not imported or routed by `App.jsx`.
3. `/subsidiaries/alta-venture` is a parent `AltaVenture` route with nested index, `services`, `blogs`, `careers`, and `inquire` pages (and a nested wildcard falling back to `AltaVentureHome`). `EnterpriseShell` wraps Realty, Luxe Prime, Dynamic Tree, SwiftClear, Construction, and 88 Prime under `/subsidiaries/<slug>` and their short root aliases, with each `/subsidiaries/<slug>/inquire` rendering the shared `EnterpriseInquire`.
4. `/admin/*` mounts the lazy `AdminShell`; the top-level wildcard mounts `NotFound`. `Layout` is still imported by `App.jsx` but no route uses it.
5. Type consumers use `Enterprise` portfolio metadata, `JobPosition` openings, `BlogPost` articles, `ServiceItem` catalog items, `ContentBlock` CMS sections, `ChatMessage` threads, and `InquireFormData` inquiry values.

## Integration

- `main.jsx` integrates React DOM, React Router, Helmet, and `styles/global.css`; optional analytics uses `window.dataLayer`, `window.gtag`, and the Google Tag Manager script.
- `App.jsx` composes `components/redesign/RedesignShell`, `components/EnterpriseShell`, `components/CookieConsent`, `routes/admin/AdminShell`, public route components, and subsidiary route components; it imports `basePathFor`, `enterpriseFromPath`, `enterpriseOrigin`, `hostEnterprise`, `isProductionHost`, and `ROOT_DOMAIN` from `lib/enterpriseHost`.
- Per-page head metadata (title, canonical, Open Graph, JSON-LD) is emitted by `components/Seo.tsx` from shells and route pages, not from `App.jsx`.
- Public page data flows through hooks and PHP endpoints (listings, services, blogs, careers, content); inquiry forms post to `/api/inquire.php`, job applications to `/api/applicants.php`, and the chatbot to `/api/chat/*`. Admin routing delegates authentication and CRUD to `routes/admin/`.
- `types.ts` is the shared data contract for UI features but does not itself fetch, validate, or transform API data.
