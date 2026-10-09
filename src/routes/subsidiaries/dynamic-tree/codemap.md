# dynamic-tree/
## Responsibility
- Contains the Dynamic Tree themed page set mounted by `DynamicTree.jsx`.
- `app/App.tsx` is the embedded page switcher used in production.
- `app/pages/` implements Home, Services, Blogs, Careers, and Inquire.
- `app/components/` contains the `SakuraBurst` decoration.
- `app/serviceCards.ts` holds service-card mapping and fallbacks.
## Design
- The theme uses pale pink surfaces, dark ink text, and rose accents from `styles/theme.css`.
- Theme tokens and base rules are scoped to `:root.dynamic-tree-active`, so they never leak to other sites.
- The app shell uses Outfit; `styles/index.css` composes fonts, Tailwind (`source(none)`), and theme layers.
- SakuraBurst and model imagery support Dynamic Tree's creative talent identity.
## Flow
- Served at `dynamic-tree.alphapremiergroup.com`; in-app paths remain `/subsidiaries/dynamic-tree/...`.
- `DynamicTree.jsx` adds `dynamic-tree-active` in a layout effect (themed first paint) and removes it on unmount.
- The wrapper passes `page` and `setPage` into `DynamicTreeApp`, which switches views and scrolls to top.
- Page `onNavigate` callbacks return to the wrapper, whose navigator is registered with `EnterpriseNavContext` and unregistered on unmount.
- Inquire and Careers forms post with `form_started_at` and render server/network error messages.
## Integration
- `DynamicTree.jsx` imports `styles/index.css` and renders `<EnterpriseSeo slug="dynamic-tree" page={page}>`.
- Pages use `useServices`/`useCareers('dynamic-tree')`, `/api/blogs.php?enterprise=dynamic-tree`, `/api/inquire.php`, and `/api/applicants.php`.
- Images are imported from `@/imports/...` (i.e. `src/imports`); this folder has no local image copies.
- Home lightboxes lock `<html>` scroll while open and restore it on close.
