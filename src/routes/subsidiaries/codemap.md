# subsidiaries/
## Responsibility
- Contains APG enterprise route wrappers, themed app folders, and the shared `EnterpriseInquire.tsx` page.
- The seven represented businesses are 88 Prime, Alpha Realty, Dynamic Tree, SwiftClear, Luxe Prime, Alta Venture, and Alpha Premier Construction.
- AlphaAssistant is an APG offering but has no dedicated module in this folder; Virtual Office lives outside it.
- `Prime88.jsx` renders the 88 Prime B2B supply site; `Realty.jsx` mounts the Alpha Realty app.
- `DynamicTree.jsx` and `SwiftClear.jsx` mount their themed page sets; `LuxePrime.jsx` mounts Luxe Prime.
- `AltaVenture.jsx` is the nested Alta Venture layout; `Construction.jsx` contains construction views.
## Design
- Subsidiaries maintain distinct visual systems rather than sharing a common page template.
- Theme CSS is scoped by a class on `<html>` added on mount and removed on unmount (`alpha-realty-active`, `dynamic-tree-active`, `luxe-prime-active`), so tokens/scrollbars no longer leak; SwiftClear and Alta Venture toggle `swiftclear-active`/`alta-venture-active` the same way.
- SwiftClear's own `swift-clear/styles/` is not imported by `SwiftClear.jsx` (only by the orphan standalone `main.tsx`).
- Alta Venture uses `alta-venture.css` plus `av-header.css`/`av-footer.css` (`av-chatbot.css` is unused); Prime88 uses `Prime88.css`.
- Construction layers `alpha-construction.tailwind.css` (Tailwind theme imported `layer(theme)`, no preflight, `@source ./Construction.jsx`) with `alpha-construction.theme.css` and `.apc-scope` rules in `alpha-construction.css`.
- Generated `figma/ImageWithFallback.tsx` helpers exist in Dynamic Tree, Luxe Prime, and SwiftClear; only Luxe Prime imports its copy.
- `Subsidiary.css` supplies legacy generic hero/content/CTA rules using shared accent/background variables.
## Flow
- Each enterprise is served on `<slug>.alphapremiergroup.com`; `src/lib/enterpriseHost.js` + `App.jsx` map the subdomain onto in-app paths, which stay `/subsidiaries/<slug>/...`.
- Every wrapper renders `<EnterpriseSeo slug=... page=...>` (Alta Venture per nested page export; EnterpriseInquire with `page="inquire"`).
- Realty, Dynamic Tree, SwiftClear, Luxe Prime, Construction, and 88 Prime call `registerNavigator` from `EnterpriseNavContext` and return its unregister function from the effect.
- Luxe Prime reflects the router path in its page; Construction reads `location.hash`; Alta Venture uses nested routes with its own header/footer.
- Forms post `form_started_at` with each submission and render real error states on failure.
## Integration
- `EnterpriseInquire.tsx` reads config via `getEnterpriseConfig(location.pathname)` and posts to `/api/inquire.php`.
- Careers forms post multipart data to `/api/applicants.php`; blogs load from `/api/blogs.php?enterprise=<slug>`.
- Subsidiary apps use shared `useServices`, `useCareers`, `useContent`, and `useModalDialog` hooks from `@/hooks`.
- `EnterpriseNavContext` (provided by `EnterpriseShell`) exposes current page and the registered navigator to shared header/footer.
- Media is imported from local `imports/` folders, `@/imports`, or `public/assets`; binary files are not mapped individually.
