# alpha-realty/app/components/
## Responsibility
- Contains Alpha Realty's themed sections, inquiry modal, logo, and background components.
- `HomeSection` presents the introduction; `ListingsSection` renders services via `useServices('realty')`.
- `BlogsSection` and `CareersSection` provide editorial content and the inline application form.
- `InquireModal`, `GoldWavesBackground`, and `AlphaPremierLogo` provide inquiry and shared visual support.
## Design
- React TypeScript modules use Motion and Tailwind classes for the premium page presentation.
- The parent Realty stylesheet provides black/gold fonts, background, and active-scope rules.
- Modal overlays use `useModalDialog` (Esc, focus trap, `<html>` scroll lock, focus return).
- Props keep navigation and submission feedback controlled by the app shell.
## Flow
- App selects a section from the current tab and mounts it in the animated content region.
- Home links to services/listings, blogs, and generic or property-specific inquiry.
- Listings report the service title to open a prefilled inquiry modal.
- `PropertiesSection` is the live listings page and, given a `hubPath`, a browse page ("hub", `/properties/warehouse-for-lease[/cavite]`): only that hub's listings (`inHub`), the hub's h1/description, a breadcrumb (Available Properties › type + deal hub › hub), no type chips or lease/sale toggle (search still works), its head tags from `hubSeo`, and related hub links (a type + deal hub's indexable areas; an area hub's type + deal hub and the area's other indexable hubs). A path the feed has no hub for shows every listing with a notice, noindex. Unfiltered, the list ends with "Browse by type" (every type + deal hub) and "Popular searches" (indexable area hubs, 24 then "Show all"). The listing dialog links "More <hub h1>" (its indexable area hub, else its type + deal hub). Hub links are router `<Link>`s to `realtyHref()` paths. Head tags render only once the feed has loaded (react-helmet-async keeps a discarded first render's tags).
- `ListingCard` exports `realtyHref(path)`: a clean Realty path (`/properties/...`) as is on the Realty subdomain, under `/subsidiaries/realty` elsewhere (cards, hub links and `Realty.jsx` navigation use it, so router state survives on the subdomain).
- Careers opens an inline application form per job (or general), posting with `form_started_at` and showing submit errors.
- InquireModal posts JSON to `/api/inquire.php`; failures surface an inline error message instead of success.
## Integration
- `app/App.tsx` imports components and owns their callback/state wiring.
- Local data contracts and fallback records live in `app/types.ts` and `app/data.ts`.
- `BlogsSection` loads the summary list with `loadBlogList('realty')` (`../../../blogApi.ts`), the list with bodies once on the first search (search also matches article text), and the open post's body with `useBlogBody`; `CareersSection` uses `useCareers` and `/api/applicants.php`.
- Parent `Realty.jsx` manages `alpha-realty-active`, `EnterpriseSeo`, and `EnterpriseNavContext`.
- Unified APG enterprise chrome supplies navigation; there are no local Header/Footer components.
