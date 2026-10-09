# views/

## Responsibility
Route-level React views for the public APG landing page, enterprise portfolio, editorial blog, careers catalog/application portal, and inquiry form.

## Design
- `HomeView` combines static `ENTERPRISES`, `PROPERTY_TYPES`, and `CORE_VALUES` from `companyData.ts` with page-specific copy from `useContent('home', fallback)`; FAQ content accepts an array or JSON-encoded array of `{ q, a }` objects.
- `EnterprisesView` presents seven division profiles and delegates inquiry/navigation actions through props and React Router; its editorial blocks animate from scroll position.
- `BlogsView` starts with typed `BLOG_POSTS` fallback and maps successful `/api/blogs.php` records into `BlogPost` values (`id`, `title`, `slug`, `summary`, `content`, `image`, `category`, `date`, `readTime`, `author`, `featured`). Search and category filtering are local view state.
- `CareersView` starts with `OPEN_POSITIONS` and maps `/api/careers.php` records to `JobPosition` fields (identity/title/division/location/type/experience/description plus responsibility, requirement, perk arrays). It also maintains application and feedback UI state.
- `InquireView` uses `ENTERPRISES` to populate the division selector and keeps inquiry fields, submission/loading/error state and ticket reference locally.

## Flow
- `HomeView` calls `useContent('home', fallback)` → hook fetches `/api/content.php?page=home` → fallback and returned content are merged into hook state → hero, mission/vision, CEO quote, and FAQ render from that state. Its CTA calls `onOpenInquire`; enterprise/portfolio actions call `onNavigate` or `onSelectEnterprise`.
- `BlogsView` fetches `/api/blogs.php` once → successful non-empty records are mapped and replace fallback state → featured/regular posts are selected and filtered by local category/search → `onSelectPost(post)` hands the chosen `BlogPost` to the app.
- `CareersView` fetches `/api/careers.php` once → successful job rows are normalized and replace `OPEN_POSITIONS` → division/search filters drive the catalog; route query `?job=` or `/apply` selects a role/general application. Submission builds multipart `FormData` (candidate fields, job metadata, honeypot/timestamp, optional resume) and POSTs `/api/applicants.php`; response ticket/success or error updates the confirmation/error state. Catalog actions can also call `onApplyJob` and `onGeneralApply`.
- `InquireView` collects contact, enterprise, budget, timeline, and message fields → POSTs JSON to `/api/inquire.php` → success ticket switches to confirmation state; failed HTTP/network requests populate the error state.
- `EnterprisesView` has no API fetch: it renders the division narratives locally; inquiry buttons pass a division name to `onOpenInquire`, while full-site buttons navigate to `/subsidiaries/<slug>`.

## Integration
- Shared shape sources are `BlogPost`, `JobPosition`, `Enterprise` types plus `BLOG_POSTS`, `OPEN_POSITIONS`, `ENTERPRISES`, `PROPERTY_TYPES`, and `CORE_VALUES` in `src/data/companyData.ts`.
- Related reusable data hooks are `useListings` (`/api/listings.php` with filters/pagination), `useBlogs` (`/api/blogs.php` with optional slug), `useCareers` (`/api/careers.php` with optional enterprise), `useContent` (`/api/content.php?page=`), and `useServices` (`/api/services.php?category=`). The views described above directly call only `useContent`; BlogsView and CareersView currently fetch their endpoints directly.
- Inquiry destinations supplied by the parent and navigation callbacks connect these views to app-level routing/modals; career applications submit to `applicants.php` and public inquiries submit to `inquire.php`.
