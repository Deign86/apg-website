# luxe-prime/
## Responsibility
- Luxe Prime Realty's site, mounted by the `LuxePrime.jsx` route wrapper: Home, Services, Blogs, Careers and Inquire.
- `app/App.tsx` switches between the pages in `app/components/` (one file per page) by the route's `page`.
- `styles/` holds this site's Tailwind build and its page-wide CSS.
## Design
- Its own "Art Deco couture" look, deliberately unlike the Alpha Premier Realty site: square corners, gold hairlines and diamonds, Cinzel caps, Cormorant Garamond titles, ivory text, slow fades, a pinstripe background (see `app/components/codemap.md`).
- Everything is scoped to `html.luxe-prime-active`, toggled by the wrapper, so nothing leaks to the corporate site or other enterprises.
## Flow
- Served at `luxe-prime.alphapremiergroup.com`; in-app paths remain `/subsidiaries/luxe-prime/...`.
- `LuxePrime.jsx` maps the URL's last segment to home/services/blogs/careers/inquire and passes it into the app, with the service an "Inquire about this service" button was clicked on (`interest`).
- Inquiries post to `/api/inquire.php` (Luxe's own `InquirePage`); applications post to `/api/applicants.php` with `form_started_at` and the Turnstile token.
## Integration
- The wrapper imports this app, `styles/index.css`, React Router APIs, `EnterpriseNavContext` and `EnterpriseSeo` (for every page, inquire included).
- Data: `useContent('luxe-prime')` (admin copy), `useServices`/`useCareers('luxe-prime')` (admin records; skeletons while loading, empty states when none), and blogs through `../blogApi.ts` (`loadBlogList('luxe-prime')`, bodies via `useBlogBody`).
- Imagery: `/assets/luxe-prime/...`, `public/images/luxe-prime-hero.webp` and the admin's remote photos.
