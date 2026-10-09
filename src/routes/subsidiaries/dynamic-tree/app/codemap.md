# dynamic-tree/app/
## Responsibility
- Contains the Dynamic Tree app shell, standalone route option, shared data, page views, and components.
- `App.tsx` selects the active view from a parent-controlled page key.
- `routes.tsx` defines a standalone root/services/blogs/careers/inquire router; nothing imports it.
- `pages/` contains five page components; `components/` contains chrome and visual helpers.
- `serviceCards.ts` maps admin service records to cards and supplies fallback services.
## Design
- Pale pink (`#FDF4F7`), dark ink, rose accents, and Outfit define the app theme.
- `styles/theme.css` maps semantic tokens under `:root.dynamic-tree-active`; pages use utilities and imported imagery.
- Layout, Nav, and Footer are only reachable through the unused standalone router.
- `SakuraBurst` adds a Dynamic Tree decorative motif used by most pages.
- The Figma subfolder's `ImageWithFallback` is not imported by any page.
## Flow
- Embedded mode receives `page` and `setPage` and renders one matching page module.
- `handleNavigate` relays page changes to the parent callback when provided.
- Changing page smooth-scrolls the window to the top.
- The `inquire` key renders the in-app Inquire page; `/subsidiaries/dynamic-tree/inquire` renders shared `EnterpriseInquire`.
- Page forms submit to APG APIs with `form_started_at` and display error states.
## Integration
- `DynamicTree.jsx` relays enterprise navigation state, renders `EnterpriseSeo`, and imports this app.
- Page modules use shared components and APG `useServices`/`useCareers` hooks where needed.
- Only the wrapper's `../styles/index.css` import is live; `main.tsx` also imports it but is orphaned.
- `routes.tsx` is an alternative route configuration, distinct from embedded page switching.
- Pages import images via `@/imports/...` (`src/imports`) and call project-level `/api/` endpoints.
