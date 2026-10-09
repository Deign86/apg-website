# hooks/

## Responsibility
Reusable React data hooks that fetch listing, blog, job, page-content, and service data from PHP APIs and expose loading/error state with local fallback behavior.

## Design
- `useListings(options)` accepts `{ type, search, city, status, featured, page, limit }`; returns `{ listings, loading, error, pagination, refetch }`. Its built-in `FALLBACK_LISTINGS` have property identity/title/slug/type, price and display string, address/city/location, area and room counts, sale/lease status, featured/published flags, description, primary image, and image/caption records.
- `useBlogs(slug, fallbackData)` returns `{ blogs, loading, error }`; slug selects a single-post URL and fallback can be an array or object.
- `useCareers(enterprise, fallbackData)` returns `{ jobs, loading, error }`; an optional canonical enterprise slug scopes the API request.
- `useContent(pageSlug, fallbackData)` returns `{ content, loading, error }`; API content is a key/value object merged over supplied fallback copy.
- `useServices(category, fallbackData)` returns `{ services, loading, error }`; category is an enterprise slug and service records are passed through as returned by the API.
- Hooks keep endpoint concerns outside most components, use effect cleanup to avoid applying late results after unmount, and preserve the fallback data when requests fail or return no usable rows.

## Flow
- `useListings`: options → URL query for `/api/listings.php` → success sets server listing rows and pagination; empty or failed response runs local `filterFallbackListings` → hook exposes current rows, loading/error, pagination, and a refetch callback to listing UI.
- `useBlogs`: optional slug → `/api/blogs.php` or `/api/blogs.php?slug=...` → success data or fallback → consuming component renders blog records.
- `useCareers`: optional enterprise → `/api/careers.php` or `/api/careers.php?enterprise=...` → non-empty success data or fallback → consuming component renders jobs. Server scoping is fallback-only, so an enterprise can receive corporate openings if it has no scoped openings.
- `useContent`: page slug → `/api/content.php?page=...` (or unscoped endpoint) → non-empty result overlays fallback keys → consuming page renders copy; empty/error responses restore fallback.
- `useServices`: category → `/api/services.php?category=...` (or unscoped endpoint) → non-empty success rows or fallback → consuming enterprise view renders services. Server category scoping is fallback-only.
- Every request sets loading before fetch and clears it in `finally`; `error` is cleared on a successful response and populated on caught failures. Data endpoints expected by this module are `/api/listings.php`, `/api/blogs.php`, `/api/careers.php`, `/api/content.php`, and `/api/services.php`.

## Integration
- Hooks are consumed by public views and enterprise/subsidiary components; `HomeView` specifically consumes `useContent('home', ...)` and renders its resulting content state.
- Shared fallback records and canonical enterprise slugs come from `src/data/companyData.ts` and `src/data/enterprises.js`; `useListings` has its own fixture fallback.
- Related write flows are in views rather than these read hooks: `InquireView` POSTs `/api/inquire.php`, while `CareersView` POSTs multipart candidate applications to `/api/applicants.php`.
