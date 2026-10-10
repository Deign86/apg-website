# hooks/

## Responsibility
Reusable React hooks: data hooks that fetch listing, blog, job, page-content, and service data from PHP APIs with loading/error state and local fallbacks, plus `useModalDialog` for accessible hand-built modal overlays.

## Design
- `useListings()` (TS) returns `{ listings, syncedAt, loading, error }` with typed `Listing` rows (`ref`, `title`, `type`/`type_label`, `deal`, `area`, `size`, `price`, `terms`, `photos`, `added`, `updated`); `isNewListing()` flags listings added in the last 14 days. No fallback data: an empty feed renders an empty state.
- `useBlogs(slug, fallbackData)` returns `{ blogs, loading, error }`; slug selects a single-post URL and fallback can be an array or object.
- `useCareers(enterprise, fallbackData)` returns `{ jobs, loading, error }`; an optional canonical enterprise slug scopes the request.
- `useContent(pageSlug, fallbackData)` returns `{ content, loading, error }`; API content is a key/value object merged over supplied fallback copy.
- `useServices(category, fallbackData)` returns `{ services, loading, error }`; category is an enterprise slug.
- `useModalDialog<T>(isOpen, onClose)` (TypeScript) returns a ref for the dialog element. While open it: moves focus to the first focusable child, traps Tab/Shift+Tab inside, calls the latest `onClose` on Escape, locks scroll by setting `overflow: hidden` on `<html>` (the scrolling element, since `global.css` gives `<html>` `overflow-x: hidden`), and sets `<html data-modal-open>` so fixed overlays (the chatbot launcher) hide. Cleanup restores overflow, removes the flag, and returns focus to the opener.

## Flow
- `useModalDialog` reference-counts open dialogs, so a dialog that hands off to another (listing → inquiry) keeps the scroll lock and `data-modal-open` (which also drops the enterprise header behind dialogs) and does not pull focus out of the new dialog.
- `useListings`: GET `/api/listings.php` once → every row re-normalised by `toListing` (valid `APR-` ref required, photos limited to `/uploads/drive/`) → callers filter client-side.
- `useBlogs`: optional slug → `/api/blogs.php` or `?slug=...` → success data or fallback.
- `useCareers`: optional enterprise → `/api/careers.php` or `?enterprise=...` → non-empty data or fallback.
- `useContent`: page slug → `/api/content.php?page=...` → non-empty result overlays fallback keys; empty/error restores fallback.
- `useServices`: category → `/api/services.php?category=...` → non-empty rows or fallback.
- Data hooks set loading before fetch and clear it in `finally`, use effect cleanup to ignore late results after unmount, and keep fallbacks on failure.
- `useModalDialog`: `isOpen` true → effect installs keydown listener/scroll lock/flag and focuses → `isOpen` false or unmount → cleanup reverses all of it.

## Integration
- Data hooks are consumed by public route pages and enterprise components: `useContent` by `HomeView`, `AboutUsSection`, `Construction`, `Prime88`; `useListings` by Realty's `PropertiesSection` and `HomeSection` (listings are Realty-only); `useServices` by `VirtualOffice` and subsidiaries; `useBlogs`/`useCareers` by subsidiary pages.
- `useModalDialog` is used by `InquireModal`, `JobApplyModal`, `BlogDetailModal`, the `CareersView` feedback dialog, and alpha-realty modals/sections; `components/EnterpriseChatbot.css` reacts to its `data-modal-open` flag.
- Write flows live outside these hooks: inquiries POST `/api/inquire.php`, applications POST multipart to `/api/applicants.php`.
