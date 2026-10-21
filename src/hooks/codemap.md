# hooks/

## Responsibility
Reusable React hooks: data hooks that fetch listing, blog, job, page-content, and service data from PHP APIs with loading/error state and local fallbacks, plus `useModalDialog` for accessible hand-built modal overlays.

## Design
- `useListings()` (TS) returns `{ listings, syncedAt, loading, error }` with typed `Listing` rows (`ref`, `title`, `type`/`type_label`, `deal`, `area`, `size`, `price`, `terms`, `photos`, `added`, `updated`); `isNewListing()` flags listings added in the last 14 days; `LISTING_REF` is the `APR-XXXXXX` ref pattern (also used by `Realty.jsx`/`PropertiesSection` for listing URLs). No fallback data: an empty feed renders an empty state.
- `useBlogs(slug, fallbackData)` returns `{ blogs, loading, error }`; slug selects a single-post URL and fallback can be an array or object.
- `useCareers(enterprise, fallbackData)` returns `{ jobs, loading, error }`; an optional canonical enterprise slug scopes the request. `fallbackData` renders while loading and replaces the result only on a failed request; a successful empty list stays empty. Rows come from `lib/listCache` (one request per URL per session, so a revisit renders them at once); `loading` is true until the current URL settles, and the previous rows stay on screen while another URL loads.
- `useContent(pageSlug, fallbackData?)` returns `{ content, loading, error }`: registry defaults (`src/data/contentSchema.js` ← `api/data/content-schema.json`) render immediately, overlaid with admin-saved values (wrong-shaped values dropped). One request per slug per session (module cache + `useSyncExternalStore`); `invalidateContent(slug)` after admin saves.
- `useSiteSettings()` = `useContent('site').content` (contacts, socials, map embed, announcement banner) plus pure helpers `companyContact(settings, slug)` (company override, else main), `mainSocials`, `phoneParts`, `telHref`, `addressLines`, `addressOneLine`, `safeUrl`, `mapEmbedSrc`.
- `useServices(category, fallbackData)` returns `{ services, loading, error }`; category is an enterprise slug and each row carries `kind` (`service` | `product` | `package`). Same fallback and caching rules as `useCareers`.
- `useModalDialog<T>(isOpen, onClose)` (TypeScript) returns a ref for the dialog element. While open it: moves focus to the first focusable child, traps Tab/Shift+Tab inside, calls the latest `onClose` on Escape, locks scroll by setting `overflow: hidden` on `<html>` (the scrolling element, since `global.css` gives `<html>` `overflow-x: hidden`), and sets `<html data-modal-open>` so fixed overlays (the chatbot launcher) hide. Cleanup restores overflow, removes the flag, and returns focus to the opener.

## Flow
- `useModalDialog` reference-counts open dialogs, so a dialog that hands off to another (listing → inquiry) keeps the scroll lock and `data-modal-open` (which also drops the enterprise header behind dialogs) and does not pull focus out of the new dialog.
- `useListings`: GET `/api/listings.php` once → every row re-normalised by `toListing` (valid `APR-` ref required, photos limited to `/uploads/drive/`) → callers filter client-side.
- `useBlogs`: optional slug → `/api/blogs.php` or `?slug=...` → success data or fallback.
- `useCareers`: optional enterprise → `fetchList('/api/careers.php' | '...?enterprise=...')` → rows (empty stays empty) or fallback on error.
- `useContent`: page slug → `/api/content.php?page=...` (once per session) → stored values overlay registry defaults; error keeps defaults.
- `useServices`: category → `fetchList('/api/services.php?category=...')` → rows or fallback on error.
- `useBlogs`/`useListings` set loading before fetch and clear it in `finally`; `useCareers`/`useServices` derive it from whether the current URL has settled. Data hooks use effect cleanup to ignore late results after unmount, and keep fallbacks on failure.
- `useModalDialog`: `isOpen` true → effect installs keydown listener/scroll lock/flag and focuses → `isOpen` false or unmount → cleanup reverses all of it.

## Integration
- Data hooks are consumed by public route pages and enterprise components: `useContent` by `HomeView`, `AboutUsSection`, `Construction`, `Prime88`; `useListings` by Realty's `PropertiesSection` and `HomeSection` (listings are Realty-only); `useServices` by `VirtualOffice` and subsidiaries; `useCareers` by subsidiary pages. `useBlogs` has no current consumer: blog lists load through `routes/subsidiaries/blogApi.ts` (enterprises) and `views/BlogsView` (apex), both on `lib/listCache`.
- `useModalDialog` is used by `InquireModal`, `JobApplyModal`, `BlogDetailModal`, the `CareersView` feedback dialog, and alpha-realty modals/sections; `components/EnterpriseChatbot.css` and `EnterpriseHeader.css` react to its `data-modal-open` flag and also to any `[aria-modal="true"]` element, so overlays that don't use the hook still clear the header and chat launcher as long as they set `aria-modal`.
- Write flows live outside these hooks: inquiries POST `/api/inquire.php`, applications POST multipart to `/api/applicants.php`.
