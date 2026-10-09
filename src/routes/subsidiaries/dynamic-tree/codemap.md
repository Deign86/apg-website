# dynamic-tree/
## Responsibility
- Contains the Dynamic Tree themed page set mounted by `DynamicTree.jsx`.
- `main.tsx` is the standalone React entry; `app/App.tsx` is the embedded page switcher.
- `app/pages/` implements Home, Services, Blogs, Careers, and Inquire.
- `app/components/` contains Layout, Nav, Footer, SakuraBurst, and the Figma image helper.
- `app/serviceCards.ts` holds service data; `imports/` holds brand and page imagery.
## Design
- The theme uses pale pink surfaces, dark brown text, and rose accents from `styles/theme.css`.
- The app shell uses Outfit; `styles/index.css` composes Tailwind, globals, and font layers.
- SakuraBurst and local imagery support Dynamic Tree's creative talent identity.
- Generated UI support is under `app/components/figma/ImageWithFallback.tsx`.
- `app/routes.tsx` separately defines a standalone React Router route set.
## Flow
- The APG wrapper passes current `page` and `setPage` into `DynamicTreeApp`.
- The app switches among page components and scrolls to top when the page changes.
- Page navigation callbacks return to the wrapper and its enterprise navigation state.
- Standalone routes can instead nest the same views beneath shared `Layout`.
- Shared chrome is supplied by Layout or app/page components as appropriate.
## Integration
- `DynamicTree.jsx` imports `styles/index.css`, sets metadata, and syncs `EnterpriseNavContext`.
- Pages use APG hooks such as `useServices` and `useCareers` where content is dynamic.
- `imports/` contains locally imported brand marks, media, and generated imagery.
- `main.tsx` bootstraps the standalone app and loads the same stylesheet entry.
- Local assets and `/assets` public URLs are resolved through Vite or the host app.
