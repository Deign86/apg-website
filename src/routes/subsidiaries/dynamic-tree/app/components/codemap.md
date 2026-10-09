# dynamic-tree/app/components/
## Responsibility
- Provides shared chrome and visual helpers for Dynamic Tree page views.
- `Layout.tsx` frames nested router pages and renders a route outlet.
- `Nav.tsx` and `Footer.tsx` provide common site links and footer content.
- `SakuraBurst.tsx` renders the brand's decorative motif.
- `figma/ImageWithFallback.tsx` displays a fallback graphic on image errors.
## Design
- Components use React, TypeScript, Tailwind classes, and the subsidiary rose/pink theme.
- Layout composes navigation, page content, and footer in standalone mode.
- SakuraBurst is a visual utility independent of page state.
- The Figma helper is a narrowly scoped generated image component.
- Theme tokens and utilities are supplied by the app stylesheet entry.
## Flow
- `routes.tsx` mounts Layout around its nested page routes.
- Nav links move among home, services, blogs, careers, and inquiry destinations.
- Individual page components own page actions; chrome provides shared navigation.
- Pages include SakuraBurst when their visual composition calls for it.
- ImageWithFallback switches from requested media to fallback output after an error.
## Integration
- `app/routes.tsx` references Layout; pages reuse Nav/Footer/SakuraBurst as needed.
- `app/components/figma/ImageWithFallback.tsx` is the generated image import utility.
- `styles/index.css` supplies tokens and Tailwind rules; components do not load CSS directly.
- Local imagery can be passed from the sibling `imports/` folder.
- React Router provides Link and Outlet behavior in standalone mode.
