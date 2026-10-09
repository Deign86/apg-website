# luxe-prime/
## Responsibility
- Contains Luxe Prime's themed application mounted by the `LuxePrime.jsx` route wrapper.
- `app/App.tsx` implements its home, services, blogs, and careers views (inquiries go to the shared `EnterpriseInquire`).
- `app/components/figma/ImageWithFallback.tsx` provides generated image fallback behavior.
- `styles/` contains font, Tailwind, and theme layers for this sub-site.
- The wrapper connects page state to the enterprise router and navigation context.
## Design
- Theme tokens define near-black surfaces and warm ivory text; app content adds luxury gold accents.
- Tokens and base rules are scoped to `:root.luxe-prime-active`, toggled by the wrapper, so they no longer leak.
- `styles/index.css` composes fonts, Tailwind (`source(none)`), and theme variables.
- App uses gold decorative effects, property imagery, carousels, a lightbox, and editorial content.
- Luxe Prime styling remains separate from sibling subsidiary themes.
## Flow
- Served at `luxe-prime.alphapremiergroup.com`; in-app paths remain `/subsidiaries/luxe-prime/...`.
- `LuxePrime.jsx` maps the URL's last segment to home/services/blogs/careers and passes it into the app.
- Navigation pushes the matching path; `inquire` routes to `/subsidiaries/luxe-prime/inquire` (shared `EnterpriseInquire`).
- Local gallery and lightbox interactions stay within the app; the lightbox locks `<html>` scroll.
- The careers form posts to `/api/applicants.php` with `form_started_at` and shows submit errors.
## Integration
- The wrapper imports this app, `styles/index.css`, React Router APIs, `EnterpriseNavContext`, and `EnterpriseSeo`.
- Its navigator is registered with `EnterpriseNavContext` and unregistered on unmount.
- `useServices`/`useCareers('luxe-prime')` provide admin-managed content with bundled fallback records.
- Blogs load from `/api/blogs.php?enterprise=luxe-prime`; App imports shared `GlowCard` and local `ImageWithFallback`.
- Imagery comes from `/assets/luxe-prime/...` public paths and remote images.
