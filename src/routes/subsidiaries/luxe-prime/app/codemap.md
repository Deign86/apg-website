# luxe-prime/app/
## Responsibility
- Implements the Luxe Prime Realty app and its shared stateful UI.
- `App.tsx` composes the navigation, themed pages, service/career content, and inquiry flows.
- Local primitives cover decoration, image display, carousels, and lightbox viewing.
- The `components/figma/` directory holds its generated image fallback utility.
- Services and careers use shared hooks with in-code fallback records.
## Design
- Presents black luxury-property surfaces with warm ivory and gold highlights.
- Cinzel, Montserrat, and Cormorant typography combine with utility classes and inline motion.
- Gold particles, progress, parallax, and photo galleries are implemented in app UI.
- `ImageWithFallback` is local; `GlowCard` is imported from shared APG UI.
- The app accepts route-controlled page state from `LuxePrime.jsx`.
## Flow
- The wrapper passes the selected `page`; app navigation requests another page through its callback.
- Home introduces the portfolio; Services, Blogs, and Careers consume dynamic/fallback records.
- Service photo interactions open carousel/lightbox views; careers maintain application UI state.
- Inquiry navigation returns to the wrapper, which routes to the inquire path.
- Active page remains consistent with the browser URL through parent synchronization.
## Integration
- `LuxePrime.jsx` supplies route sync, metadata, `EnterpriseNavContext`, and the CSS entry import.
- `useServices` and `useCareers` provide admin-managed records; fallbacks support empty/offline states.
- `GlowCard` comes from `@/components/ui/spotlight-card`; image fallback is locally imported.
- `styles/index.css` supplies this app's Tailwind and theme layers.
- Media sources include public paths and remote property imagery.
