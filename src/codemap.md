# src/

## Responsibility

The application entry and shared TypeScript domain types: `main.jsx` boots the SPA, `App.jsx` defines top-level routing and shells, and `types.ts` describes shared business records.

## Design

- `main.jsx` mounts React under `React.StrictMode`, `HelmetProvider`, and `BrowserRouter`; global styles are imported once at bootstrap.
- `App.jsx` uses React Router v7 `<Routes>`/`<Route>` and lazy-loaded route modules under a shared `Suspense` boundary with a null fallback. Cookie consent is separately lazy-loaded. The route tree separates public `RedesignShell`, bespoke nested Alta Venture routes, shared `EnterpriseShell` enterprise pages, and `/admin/*`.
- Google Analytics is installed only when `VITE_ANALYTICS_ID` matches a GA measurement ID pattern; the script URL encodes that ID.
- `types.ts` centralizes structural interfaces/unions without runtime behavior, including `Enterprise`, `JobPosition`, `BlogPost`, `ServiceItem`, `ContentBlock`, `ChatMessage`, and `InquireFormData`, plus `NavTab`.

## Flow

1. `index.html`'s `#root` is passed to `ReactDOM.createRoot`; bootstrap providers then render `App` inside the browser history router and Helmet context.
2. In `App`, public `RedesignShell` contains shell-owned null child elements for `/`, `/enterprises`, `/careers`, `/careers/*`, `/blogs`, and `/inquire`, alongside page routes `/properties`, `/virtual-office`, `/contact`, `/privacy`, and `/terms`. `Home` is imported but the `/` element is currently `null`.
3. `/subsidiaries/alta-venture` is a parent `AltaVenture` route with nested index, `services`, `blogs`, `careers`, and `inquire` pages (and a nested wildcard falling back to AltaVentureHome). `EnterpriseShell` wraps Realty, Luxe Prime, Dynamic Tree, SwiftClear, Construction, and 88 Prime aliases under `/subsidiaries/...` and their shorter root aliases, including each enterprise's inquire route.
4. `/admin/*` mounts the lazy `AdminShell`; the top-level wildcard mounts `NotFound`. Cookie consent is rendered alongside route content, and lazy route resolution is handled by Suspense.
5. Type consumers use `Enterprise` portfolio metadata, `JobPosition` openings, `BlogPost` articles, `ServiceItem` catalog items, `ContentBlock` CMS sections, `ChatMessage` threads, and `InquireFormData` inquiry values. Their fields include optional/public API variants such as blog excerpt/cover fields and content page/section identifiers.

## Integration

- `main.jsx` integrates React DOM, React Router, Helmet, and `styles/global.css`; optional analytics uses `window.dataLayer`, `window.gtag`, and the Google Tag Manager script.
- `App.jsx` composes `components/redesign/RedesignShell`, `components/EnterpriseShell`, `routes/admin/AdminShell`, public route components, and subsidiary route components; `Navigate` redirects `/about` to `/`.
- Public page data flows through hooks and PHP endpoints: property listings, services, blogs, and careers use the corresponding public APIs, while contact forms post to `/api/inquire.php`; admin routing delegates authentication and CRUD API integration to `routes/admin/`.
- `types.ts` is the shared data contract for UI features but does not itself fetch, validate, or transform API data.
