# alpha-realty/
## Responsibility
- Holds Alpha Realty's themed application mounted by the top-level `Realty.jsx` route wrapper.
- `app/App.tsx` composes page sections, inquiry modal, toast feedback, and the gold background effect.
- `app/components/` contains page section, modal, logo, and background components; `styles/index.css` is the theme entry.
- The site presents property/service listings, blogs, careers applications, and inquiry interaction.
- This folder supplies the UI layer rather than the enterprise route definition.
## Design
- `styles/index.css` loads Tailwind v4 (`source(none)` + local `@source`), `tw-animate-css`, and Cinzel/Plus Jakarta Sans/Playfair Display fonts.
- Scoped `html.alpha-realty-active` selectors establish the black-and-gold visual system and font variables.
- `GoldWavesBackground` and `AlphaPremierLogo` provide reusable themed assets.
- Overlay dialogs (inquiry, blog post, job detail, feedback) use the shared `useModalDialog` hook.
- Components are React TypeScript UI; there is no generated Figma helper in this app.
## Flow
- Served at `realty.alphapremiergroup.com`; in-app paths remain `/subsidiaries/realty/...`.
- `Realty.jsx` registers its navigator with `EnterpriseNavContext` (unregistering on unmount) and passes `page`/`setPage`.
- Home, Properties and Listings callbacks open `InquireModal`, optionally prefilled for a selected property (live listings also pass their `APR-XXXXXX` ref, sent as `property` so `inquire.php` links the Drive folder).
- Page changes select Home, Properties, Services/Listings, Blogs, or Careers; the `inquire` key opens the modal. Properties is the only routed page: `Realty.jsx` shows it whenever the path ends in `/properties` or `/properties/<ref>` (each listing's own page, `realty.alphapremiergroup.com/properties/APR-XXXXXX`), navigating to it pushes that URL, and leaving it returns to the Realty root. Opening a listing pushes `/properties/<ref>` with the filter query; closing replaces it with `/properties` + filters. Old `?ref=APR-XXXXXX` links are replace-redirected to the path. Its own `Seo` sets the realty `/properties` canonical; an open listing swaps in `lib/listingSeo.ts` (title, description, first photo, `RealEstateListing` + `BreadcrumbList` JSON-LD, matching the crawler snapshot), and a ref not in the loaded feed shows the list with a "no longer available" notice and `noindex`.
- Successful inquiry or job application actions trigger timed feedback toasts.
## Integration
- `Realty.jsx` imports the CSS entry, toggles `alpha-realty-active` on `<html>`, and renders `<EnterpriseSeo slug="realty">`.
- `InquireModal` posts to `/api/inquire.php` with `form_started_at` and shows server/network errors inline.
- `PropertiesSection` (live listings: URL-synced `q`/`type`/`deal` filters, `listingRef` from the path, `ListingCard` grid, portalled gallery `ListingDialog`) and the `HomeSection` "Available now" strip read `useListings()`; `ListingCard` is a link to the listing's clean URL for the current host (plain click opens it in-app, modified clicks open a new tab) (`/api/listings.php`, Drive-synced by `api/cron/drive-sync.php`).
- `CareersSection` posts to `/api/applicants.php`; `BlogsSection` loads `/api/blogs.php?enterprise=realty&summary=1` through `../blogApi.ts` (body by slug on open, full list on first search).
- `data.ts` maps shared `companyData` blog/job records into local `types.ts` models as offline fallbacks.
- App has no local Header/Footer; the parent APG enterprise shell supplies unified chrome.
