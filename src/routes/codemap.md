# src/routes/

## Responsibility

Route-level page components for the public APG site and enterprise/subsidiary experiences. `src/App.jsx` owns the URL-to-component mapping (including enterprise-subdomain path rewriting); this folder supplies the page elements mounted by that router.

## Design

- Public pages: `Contact`, `Properties`, `VirtualOffice`, `PrivacyPolicy`, `TermsConditions`, and `NotFound`. Each sets head metadata through `components/Seo` (`<Seo path=...>`; `NotFound` uses `noindex`; `VirtualOffice` uses `<EnterpriseSeo slug="virtual-office" />` so its canonical is the virtual-office subdomain). `Contact`, `Properties`, and `VirtualOffice` initialize AOS and have dedicated CSS files.
- `Properties` keeps its filter in the `type` query parameter and manages property detail/gallery/inquiry overlays locally. `Contact` owns a controlled inquiry form; `VirtualOffice` renders live service packages over a static fallback.
- `Home.jsx` (+ `Home.css`) is a legacy group-overview page still in the folder but no longer imported or routed by `App.jsx`; it still uses `Helmet` directly.
- `subsidiaries/` holds the enterprise experiences (documented in its own codemap): `AltaVenture` is a nested layout with Home/Services/Blogs/Careers/Inquire children; Realty, LuxePrime, DynamicTree, SwiftClear, Construction, and Prime88 mount beneath `EnterpriseShell`, with `EnterpriseInquire` serving each `/subsidiaries/<slug>/inquire`. `admin/` holds the CMS.

## Flow

1. `App` matches the (host-mapped) location. Under `RedesignShell`: `/properties`, `/virtual-office`, `/contact`, `/privacy`, `/terms` render these pages through the shell `<Outlet />`; `/`, `/enterprises`, `/careers/*`, `/blogs`, `/inquire` are shell-owned `null` elements rendered by `views/`. `PrivacyPolicy`, `TermsConditions`, and `NotFound` are statically imported; the others are lazy.
2. `Properties` reads/updates `type` via `useSearchParams`, calls `useListings({ type, search, limit: 50 })` (`/api/listings.php`, local fallback on empty/error), opens listing details, and forwards inquiry intent into `InquireModal`.
3. `VirtualOffice` calls `useServices('virtual-office', DEFAULT_PACKAGES)` (`/api/services.php?category=virtual-office`); package inquiry links navigate to `/inquire`. On production, `/virtual-office` lives at the virtual-office subdomain via `App.jsx` redirects.
4. `Contact` POSTs JSON `{ name, email, subject, message, source: 'Contact Page', website, form_started_at }` to `/api/inquire.php` and shows success with the returned ticket, or an error.
5. Unmatched paths render `NotFound` with a link back to `/`. `/privacy` and `/terms` are apex-only (redirected off subdomains in production).

## Integration

- `src/App.jsx` wraps public pages in `RedesignShell`, enterprise pages in `EnterpriseShell`, Alta Venture in its own nested shell, and delegates `/admin/*` to `routes/admin/AdminShell`.
- `Properties` integrates with `@/hooks/useListings` and `@/components/redesign/InquireModal`; `VirtualOffice` with `@/hooks/useServices`; `Contact` with `/api/inquire.php`; all pages with `components/Seo`.
- Enterprise pages use shared public hooks (`useBlogs`, `useCareers`, `useServices`, `useContent`) and `EnterpriseSeo`; these are display hooks with fallbacks, not admin CRUD.
