# src/routes/

## Responsibility

Route-level page components for the public APG site and enterprise/subsidiary experiences. `src/App.jsx` owns the actual URL-to-component mapping; this folder supplies the page elements mounted by that router.

## Design

- Public pages in this folder include `Home`, `Contact`, `Properties`, `VirtualOffice`, and `NotFound`; page metadata is set with `react-helmet-async`, and `Home`, `Contact`, `Properties`, and `VirtualOffice` initialize AOS effects.
- `Home` supplies the group overview and links to enterprise routes, property filters, and `/contact`; `Properties` keeps its filter in the `type` query parameter and manages property detail/gallery/inquiry overlays locally.
- `Contact` owns a controlled inquiry form; `VirtualOffice` renders live service packages over a static package fallback. Route pages use dedicated CSS files where present.
- Subsidiary pages under `subsidiaries/` are specialized experiences, not all group pages: `AltaVenture` is mounted as a nested layout with its own Home, Services, Blogs, Careers, and Inquire child pages; other enterprises mount their own page component beneath `EnterpriseShell`.

## Flow

1. `App` chooses a public route beneath `RedesignShell` (`/properties`, `/virtual-office`, `/contact`, `/privacy`, `/terms`, plus shell-owned null elements at `/`, `/enterprises`, `/careers`, `/blogs`, and `/inquire`). The page components in this folder are lazy-loaded where configured; `Home` is imported by `App` but the root index route currently renders `null` inside `RedesignShell`.
2. The group-home page links to `/subsidiaries/realty`, `/subsidiaries/swiftclear`, `/subsidiaries/dynamic-tree`, `/subsidiaries/luxe-prime`, `/subsidiaries/alta-venture`, `/subsidiaries/construction`, and `/subsidiaries/88prime`; its property cards link to `/properties?type=...` and its CTA to `/contact`.
3. `Properties` reads and updates `type` through `useSearchParams`, calls `useListings({ type, search, limit: 50 })`, then opens selected listing details and forwards inquiry intent into `InquireModal`. `useListings` fetches `/api/listings.php` and falls back to local catalog entries on empty/error responses.
4. `VirtualOffice` calls `useServices('virtual-office', DEFAULT_PACKAGES)`, which requests `/api/services.php?category=virtual-office`; package inquiry links navigate to `/inquire`. `Contact` POSTs JSON to `/api/inquire.php` and displays success/error plus the returned ticket.
5. Enterprise child pages (in the nested `subsidiaries/` directory) consume shared data hooks such as `useBlogs`, `useCareers`, and `useServices`; public not-found pages render `NotFound` with a link back to `/`.

## Integration

- `src/App.jsx` wraps public route elements in `RedesignShell` or `EnterpriseShell`; `/subsidiaries/alta-venture/*` uses the `AltaVenture` nested route shell. Unmatched paths render `NotFound`; `/admin/*` is delegated to `routes/admin/AdminShell`.
- `Properties` integrates with `@/hooks/useListings` (`/api/listings.php`) and `@/components/redesign/InquireModal`; `VirtualOffice` integrates with `@/hooks/useServices` (`/api/services.php`); `Contact` posts to the PHP inquiry endpoint.
- `Home` links to enterprise pages and route filters, while enterprise pages use shared hooks for public blogs, career openings, and service content. The public API hooks are `useListings`, `useServices`, `useBlogs`, and `useCareers` (they are not admin CRUD hooks).
- `PrivacyPolicy` and `TermsConditions` are statically imported by `App.jsx` at `/privacy` and `/terms`, but those source files are not present in the current `src/routes/` directory listing; the root path is currently shell-owned rather than rendering the imported `Home` component.
