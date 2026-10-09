# luxe-prime/
## Responsibility
- Contains Luxe Prime's themed application mounted by the `LuxePrime.jsx` route wrapper.
- `app/App.tsx` implements its home, services, blogs, careers, and inquiry experience.
- `app/components/figma/ImageWithFallback.tsx` provides generated image fallback behavior.
- `styles/` contains Tailwind, global, font, and theme layers for this sub-site.
- The wrapper connects page state to the enterprise router and navigation context.
## Design
- Theme tokens define black surfaces and warm ivory text; app content adds luxury gold accents.
- `styles/index.css` composes Tailwind, typography, global defaults, and theme variables.
- App uses gold decorative effects, property imagery, carousels, and editorial content.
- The Figma helper handles failed image loads and sits outside the main app module.
- Luxe Prime styling remains separate from sibling subsidiary themes.
## Flow
- `LuxePrime.jsx` maps the current URL to a page key and passes it into the themed app.
- The app renders the selected view and obtains service/career records from shared hooks.
- Navigation returns to the wrapper; inquiry actions route to the shared inquire URL.
- Local gallery and lightbox interactions remain within the app component.
- The wrapper keeps browser path and active page synchronized.
## Integration
- Parent wrapper imports this app, `styles/index.css`, React Router APIs, and `EnterpriseNavContext`.
- `useServices` and `useCareers` provide admin-managed content with bundled fallback records.
- App imports shared `GlowCard` UI and local Figma `ImageWithFallback`.
- Route wrapper owns page metadata and URL navigation for page changes.
- Imagery comes from public assets, remote images, and app-level imports.
