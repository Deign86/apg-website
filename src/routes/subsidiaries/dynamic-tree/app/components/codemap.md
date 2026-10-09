# dynamic-tree/app/components/
## Responsibility
- Provides chrome and visual helpers for Dynamic Tree page views.
- `Layout.tsx` composes Nav, a route `<Outlet>`, and Footer for the standalone router.
- `Nav.tsx` and `Footer.tsx` provide standalone site links and footer content.
- `SakuraBurst.tsx` renders the brand's decorative motif.
- `figma/ImageWithFallback.tsx` displays a fallback graphic on image errors.
## Design
- Components use React, TypeScript, Tailwind classes, and the subsidiary rose/pink theme.
- Layout/Nav/Footer are referenced only by `app/routes.tsx`, which nothing imports, so they are unused in production.
- In production the shared APG `EnterpriseShell` header/footer replace this chrome.
- SakuraBurst is a visual utility independent of page state and is the only component pages import.
- The Figma helper is a narrowly scoped generated image component with no importers (unused).
## Flow
- `routes.tsx` would mount Layout around its nested page routes in standalone mode.
- Nav links move among home, services, blogs, careers, and inquiry routes via React Router.
- Individual page components own page actions; embedded navigation uses `onNavigate` callbacks.
- Pages include SakuraBurst as a background decoration.
- ImageWithFallback switches from requested media to fallback output after an error.
## Integration
- `app/routes.tsx` references Layout; pages import only `SakuraBurst` from this folder.
- Nav/Footer import the logo from `@/imports/Dynamic_Tree_Logo-1.png` (`src/imports`).
- `styles/index.css` supplies tokens and Tailwind rules; components do not load CSS directly.
- Theme tokens apply only while `dynamic-tree-active` is on `<html>`.
- React Router provides Link and Outlet behavior for the standalone path.
