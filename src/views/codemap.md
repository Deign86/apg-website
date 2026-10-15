# views/

## Responsibility
Tab-level React views rendered by `RedesignShell` for the public APG landing page, enterprise portfolio, editorial blog, careers catalog/application portal, and inquiry form.

## Design
- `HomeView` combines static `ENTERPRISES`, `PROPERTY_TYPES`, and `CORE_VALUES` from `companyData.ts` with copy from `useContent('home', fallback)`, and composes `AboutUsSection`, `EnterprisesGallery`, and `SeamlessHeroVideo`. Category cards are keyboard-operable (`role="button"`, Enter/Space, `aria-expanded`). Its decorative background loops are CSS classes from `styles/apex-motion.css` (compositor-only); `useOffscreenPause` marks a section `data-offscreen` while it is out of view (IntersectionObserver), which pauses them.
- `EnterprisesView` presents the division profiles and delegates inquiry through `onOpenInquire`; full-site buttons navigate to `/subsidiaries/<slug>`. Editorial blocks animate from scroll position (`motion/react`), with `will-change` only while a reveal runs; logos are small WebP variants (`/assets/images/logos/`) and photos load lazily.
- `BlogsView` starts with typed `BLOG_POSTS` fallback (or the session-cached list) and maps successful `/api/blogs.php?summary=1` records (no `content`) into `BlogPost` values. It renders 12 cards and "Load more" adds 12 at a time; a category or search change resets to 12. Search (labelled `#blog-search`) and category filtering are local state.
- `CareersView` starts with `OPEN_POSITIONS` and maps `/api/careers.php` records (session-cached via `lib/listCache`) to `JobPosition` (with default responsibilities/requirements/perks). It keeps an inline application form (ids/`name`s, `aria-invalid`/`aria-describedby` errors), division/search filters, and a testimonial "feedback" dialog wired to `useModalDialog`; submitted testimonials are only prepended to local state.
- `InquireView` uses `ENTERPRISES` to populate the division selector and keeps inquiry fields, submission/loading/error state and ticket reference locally.

## Flow
- `HomeView` → `useContent('home', ...)` → `/api/content.php?page=home` merged over fallback → hero, mission/vision, CEO quote, FAQ render. CTA calls `onOpenInquire`; enterprise actions call `onNavigate` or `onSelectEnterprise`.
- `BlogsView` → `fetchList('/api/blogs.php?summary=1')` (once per session) → records replace fallback → filtered by category/search → first `visibleCount` cards → `onSelectPost(post)` opens the shell's `BlogDetailModal`, which fetches the body by `?slug=`.
- `CareersView` fetches `/api/careers.php` once per session (`lib/listCache`; a revisit starts from the cached rows) → rows replace `OPEN_POSITIONS`. Route drives the form: `?job=<id>` or `?job=general` / `/careers/apply` selects a role or general application; returning to `/careers` (incl. Back/Forward) clears the form. Submit builds multipart `FormData` (candidate fields, job metadata, honeypot/timestamp, optional resume) → POST `/api/applicants.php` → ticket or error. It takes no props (the old `onApplyJob`/`onGeneralApply` modal path was removed).
- `InquireView` collects contact, enterprise, budget, timeline, and message → POSTs JSON to `/api/inquire.php` → `success === true` shows the ticket confirmation; otherwise the server's `error` string (or a fallback message) populates the error state.
- `EnterprisesView` has no API fetch.

## Integration
- `RedesignShell` lazy-loads each view as its own chunk and mounts it by tab (`home`, `enterprises`, `blogs`, `careers`, `inquire`) and owns their SEO via `components/Seo`; the views themselves render no head tags.
- Shape sources: `BlogPost`, `JobPosition`, `Enterprise`, `NavTab` types plus `companyData.ts` fixtures. Of the data hooks only `useContent` is used here; `BlogsView` and `CareersView` fetch through `lib/listCache` (`peekList`/`fetchList`). `useModalDialog` backs the careers feedback dialog.
- Career applications submit to `applicants.php` (server ATS screening happens there); inquiries submit to `inquire.php`.
