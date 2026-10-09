# dynamic-tree/app/
## Responsibility
- Contains the Dynamic Tree app shell, route option, shared data, page views, and components.
- `App.tsx` selects the active view from a parent-controlled page key.
- `routes.tsx` defines standalone root, services, blogs, careers, and inquire routes.
- `pages/` contains five page components; `components/` contains chrome and visual helpers.
- `serviceCards.ts` supplies service-card data for page rendering.
## Design
- Pale pink (`#FDF4F7`), dark ink, rose accents, and Outfit define the app theme.
- `styles/theme.css` maps semantic tokens; pages use utilities and imported imagery.
- Layout, Nav, and Footer provide shared standalone site chrome.
- `SakuraBurst` adds a Dynamic Tree decorative motif.
- The Figma subfolder contains a reusable `ImageWithFallback` image utility.
## Flow
- Embedded mode receives `page` and `setPage` and renders one matching page module.
- `handleNavigate` relays page changes to the parent callback when provided.
- Changing page scrolls the window to the top before the view settles.
- Standalone mode uses `routes.tsx` to mount page views beneath shared Layout.
- Layout supplies the route outlet and common chrome for the standalone router.
## Integration
- `DynamicTree.jsx` relays enterprise navigation state and imports this app.
- Page modules use shared components and APG services/careers hooks where needed.
- Standalone `main.tsx` and the wrapper load `../styles/index.css`.
- `routes.tsx` is an alternative route configuration, distinct from embedded page switching.
- Pages integrate local `imports/` assets and project-level APG APIs.
