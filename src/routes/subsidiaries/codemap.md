# subsidiaries/
## Responsibility
- Contains APG enterprise route wrappers, themed app folders, the shared `EnterpriseInquire.tsx` page, and `blogApi.ts` (shared blog list/body loader).
- The seven represented businesses are 88 Prime, Alpha Realty, Dynamic Tree, SwiftClear, Luxe Prime, Alta Venture, and Alpha Premier Construction.
- AlphaAssistant is an APG offering but has no dedicated module in this folder; Virtual Office lives outside it.
- `Prime88.jsx` renders the 88 Prime B2B supply site; `Realty.jsx` mounts the Alpha Realty app.
- `DynamicTree.jsx` and `SwiftClear.jsx` mount their themed page sets; `LuxePrime.jsx` mounts Luxe Prime.
- `AltaVenture.jsx` is the nested Alta Venture layout; `Construction.jsx` contains construction views.
## Design
- Subsidiaries maintain distinct visual systems rather than sharing a common page template.
- Theme CSS is scoped by a class on `<html>` added on mount and removed on unmount (`alpha-realty-active`, `dynamic-tree-active`, `luxe-prime-active`), so tokens/scrollbars no longer leak; SwiftClear and Alta Venture toggle `swiftclear-active`/`alta-venture-active` the same way.
- SwiftClear has no route stylesheet; its utilities come from the corporate `src/styles/global.css` Tailwind build.
- Alta Venture uses `alta-venture.css` plus `av-header.css`/`av-footer.css`; Prime88 uses `Prime88.css`.
- Construction layers `alpha-construction.tailwind.css` (Tailwind theme imported `layer(theme)`, no preflight, utilities `source(none)` scanning `Construction.jsx` plus the shared `EnterpriseInquire.tsx`, `JobApplyModal.tsx` and `ApplicantExtrasFields.tsx` it renders, since `global.css` skips `Construction.jsx`) with `alpha-construction.theme.css` and `.apc-scope` rules in `alpha-construction.css` (incl. the hero scroll-hint keyframes).
- Of the generated `figma/ImageWithFallback.tsx` helpers, only Luxe Prime's copy remains (Dynamic Tree and SwiftClear copies were unused and removed).
- `Subsidiary.css` supplies legacy generic hero/content/CTA rules using shared accent/background variables.
- Only 88 Prime uses AOS (`data-aos`; it imports `aos/dist/aos.css` itself); the other wrappers no longer init AOS or reset scroll, since `EnterpriseShell` jumps to the top instantly on every path change. Construction, Luxe Prime, Dynamic Tree and SwiftClear run their endless decorative loops on the compositor (CSS keyframes or the Web Animations API on transform/opacity).
## Flow
- Each enterprise is served on `<slug>.alphapremiergroup.com`; `src/lib/enterpriseHost.js` + `App.jsx` map the subdomain onto in-app paths, which stay `/subsidiaries/<slug>/...`.
- Every wrapper renders `<EnterpriseSeo slug=... page=...>` (Alta Venture per nested page export; EnterpriseInquire with `page="inquire"`).
- Realty, Dynamic Tree, SwiftClear, Luxe Prime, Construction, and 88 Prime call `registerNavigator` from `EnterpriseNavContext` and return its unregister function from the effect.
- Realty and 88 Prime take their section from the URL (`useEnterpriseSection()`: `<base>/services|blogs|careers|inquire`); Realty adds `/properties` and opens its inquiry modal for "Inquire". 88 Prime and Alta Venture blogs open articles at `?post=<slug>` (`useBlogPostParam` + `BlogBody`).
- Page copy for Realty, Alta Venture, 88 Prime and Virtual Office comes from the content registry (`useContent('realty' | 'alta-venture' | '88prime' | 'virtual-office')`); contacts/socials from `companyContact(useSiteSettings(), slug)`.
- `EnterpriseInquire.tsx` accepts a `config` override; `VirtualOffice.jsx` exports `VirtualOfficeInquire` (route `/virtual-office/inquire?package=<plan>`).
- Sections are real URLs (`<base>/services|blogs|careers|inquire`): Dynamic Tree, SwiftClear, Luxe Prime and Construction derive the page from the URL with `useEnterpriseSection()`; Realty and 88 Prime keep state and `EnterpriseNavProvider` syncs it (pushes on `setCurrentPage`, restores on load/Back/Forward). Only Realty's `/inquire` is a standalone `EnterpriseInquire` route. Alta Venture uses nested routes with its own header/footer.
- Company blog posts open in place at `?post=<slug>` (`useBlogPostParam`) and render with the shared `components/BlogBody.tsx`.
- Page copy for Construction, Dynamic Tree, SwiftClear and Luxe Prime is in the content registry (`api/data/content-schema.json`), read with `useContent(slug)`.
- Forms post `form_started_at` with each submission and render real error states on failure.
## Integration
- `EnterpriseInquire.tsx` reads config via `getEnterpriseConfig(location.pathname)` and posts to `/api/inquire.php`.
- Careers forms post multipart data to `/api/applicants.php`; blogs load through `blogApi.ts`: the list from `/api/blogs.php?enterprise=<slug>&summary=1` (no bodies, once per session) and an article body from `?slug=` when a reader opens it.
- `blogApi.ts` exports `loadBlogList(enterprise, withBodies = false)` (rows normalized by `toBlogRow`, cached through `lib/listCache`; rows that already carry a body open without a second request) and `useBlogBody(slug, fallback)` (null while loading; `fallback` when the post is not in the database or the request fails). Realty's search loads the list with bodies once (`withBodies`).
- Subsidiary apps use shared `useServices`, `useCareers`, `useContent`, and `useModalDialog` hooks from `@/hooks`.
- `EnterpriseNavContext` (provided by `EnterpriseShell`) exposes current page and the registered navigator to shared header/footer.
- Media is imported from local `imports/` folders or referenced by public URL (`public/assets`, `public/imports`, `public/images`; smaller WebP renditions where they exist); binary files are not mapped individually.
