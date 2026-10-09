# luxe-prime/app/
## Responsibility
- Implements the Luxe Prime Realty app and its shared stateful UI in one large `App.tsx`.
- `App.tsx` renders Home, Services, Blogs, and Careers (with application form) views.
- Local primitives cover decoration, gold flakes, tilt/parallax, image display, and lightbox viewing.
- The `components/figma/` directory holds its generated image fallback utility.
- Services and careers use shared hooks with in-code fallback records.
## Design
- Presents black luxury-property surfaces with warm ivory and gold highlights.
- Cinzel, Montserrat, and Cormorant typography combine with utility classes and an inline keyframes `<style>`.
- Header/footer chrome comes from the shared APG shell; the file defines no local Nav/Footer.
- `ImageWithFallback` is local (used for the Luxe Prime logo).
- The app requires route-controlled `page`/`setPage` from `LuxePrime.jsx` (no internal page state).
## Flow
- The wrapper passes the selected `page`; app navigation requests another page through its callback.
- Home introduces the portfolio; Services, Blogs, and Careers consume dynamic/fallback records.
- Service photo interactions open the portaled `Lightbox`, which handles Esc/arrow keys and locks `<html>` overflow.
- Careers posts the application to `/api/applicants.php` with `form_started_at`; errors render with `role="alert"`.
- `setPage("inquire")` is intercepted by the wrapper, which routes to the shared `EnterpriseInquire`.
## Integration
- `LuxePrime.jsx` supplies route sync, `EnterpriseSeo`, `EnterpriseNavContext`, the scope class, and the CSS entry.
- `useServices`/`useCareers('luxe-prime')` provide admin-managed records; fallbacks support empty/offline states.
- Blogs fetch `/api/blogs.php?enterprise=luxe-prime` with a bundled fallback list.
- `styles/index.css` supplies this app's Tailwind and theme layers.
- Media sources include `/assets/luxe-prime/...` public paths and remote property imagery.
