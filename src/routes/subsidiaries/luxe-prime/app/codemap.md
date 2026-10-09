# luxe-prime/app/
## Responsibility
- Implements the Luxe Prime Realty app and its shared stateful UI in one large `App.tsx`.
- `App.tsx` renders Home, Services, Blogs, Careers (with application form), and Inquire views.
- Local primitives cover decoration, particles, tilt/parallax, image display, carousels, and lightbox viewing.
- The `components/figma/` directory holds its generated image fallback utility.
- Services and careers use shared hooks with in-code fallback records.
## Design
- Presents black luxury-property surfaces with warm ivory and gold highlights.
- Cinzel, Montserrat, and Cormorant typography combine with utility classes and an inline keyframes `<style>`.
- Local `Nav` and `Footer` functions remain in the file but are not rendered (shared APG chrome is used).
- `ImageWithFallback` is local; `GlowCard` is imported from `@/components/ui/spotlight-card`.
- The app accepts route-controlled `page`/`setPage` from `LuxePrime.jsx`, else uses internal state.
## Flow
- The wrapper passes the selected `page`; app navigation requests another page through its callback.
- Home introduces the portfolio; Services, Blogs, and Careers consume dynamic/fallback records.
- Service photo interactions open the portaled `Lightbox`, which handles Esc/arrow keys and locks `<html>` overflow.
- Careers posts the application to `/api/applicants.php` with `form_started_at`; errors render with `role="alert"`.
- The in-app `InquirePage` (mailto-based) is only reached standalone; the wrapper routes inquiries to `EnterpriseInquire`.
## Integration
- `LuxePrime.jsx` supplies route sync, `EnterpriseSeo`, `EnterpriseNavContext`, the scope class, and the CSS entry.
- `useServices`/`useCareers('luxe-prime')` provide admin-managed records; fallbacks support empty/offline states.
- Blogs fetch `/api/blogs.php?enterprise=luxe-prime` with a bundled fallback list.
- `styles/index.css` supplies this app's Tailwind and theme layers.
- Media sources include `/assets/luxe-prime/...` public paths and remote property imagery.
