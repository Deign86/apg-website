# dynamic-tree/app/pages/
## Responsibility
- Implements Dynamic Tree's Home, Services, Blogs, Careers, and Inquire page views.
- Each view is a React module selected by the app shell or standalone router.
- Home introduces the agency; Services and Blogs present offerings and editorial content.
- Careers presents opportunities; Inquire provides the contact path.
- Shared chrome and common decorative UI are defined outside this directory.
## Design
- Pages use the pale-pink/rose theme and Outfit typography from Dynamic Tree styles.
- Tailwind utilities, Motion, and imported brand imagery compose page content.
- Shared `Layout`, `Nav`, and `Footer` support the standalone router flow.
- `SakuraBurst` provides brand decoration where page compositions use it.
- Figma `ImageWithFallback` handles media load failures.
## Flow
- `app/App.tsx` renders a view by its current page key and passes `onNavigate` callbacks.
- Embedded navigation callbacks return page changes to the APG wrapper.
- Home actions lead to services, blogs, careers, or inquiry as supported by the page.
- `routes.tsx` can mount the page modules directly beneath the shared Layout.
- Page content may load service/career data through shared hooks.
## Integration
- Both the embedded page switcher and standalone route config import these view modules.
- `DynamicTree.jsx` owns enterprise context, metadata, and the `styles/index.css` import.
- `serviceCards.ts` and `imports/` provide supporting data and imagery.
- APG `useServices` and `useCareers` hooks back data-driven views where used.
- Parent theme CSS supplies utilities, colors, and font rules.
