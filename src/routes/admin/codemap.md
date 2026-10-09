# src/routes/admin/

## Responsibility

Implements the authenticated `/admin/*` application: sign-in, dashboard, content and portfolio CRUD, recruitment pipeline, user administration, and live-chat operations.

## Design

- `AdminShell` provides nested React Router routes inside `AuthProvider`; `/admin/login` is public, while dashboard and module routes share `ProtectedRoute` around `AdminLayout`. `admin.css` supplies admin-specific styling.
- `ProtectedRoute` reads `useAuth()` and waits for session loading, then redirects unauthenticated users to `/admin/login`; authenticated children render in `AdminLayout`. `AuthProvider` verifies/signs in/out through `/api/admin/auth.php` and exposes `user`, `can`, and session state.
- `Dashboard` presents the signed-in user's greeting and links to each admin module; its summary loads counts concurrently from admin PHP endpoints. `Login` invokes `signIn` and navigates into `/admin`.
- Managers use component-local React state and direct `fetch` calls with `credentials: 'include'`, rather than the public data hooks. Shared admin components include `useToast`, `ConfirmDialog`, `DataTable`, and `StatusPill`; capability checks use `useAuth().can(...)`.

## Flow

1. `App.jsx` routes `/admin/*` to `AdminShell`. It mounts `AuthProvider`, then renders `Login` at `login` or a nested protected `AdminLayout` outlet for `/admin` (Dashboard), `/admin/live-chat`, `/admin/content`, `/admin/services`, `/admin/listings`, `/admin/careers`, `/admin/applicants`, `/admin/blogs`, and `/admin/users`; unknown protected admin paths render admin `NotFound`.
2. Session bootstrap checks `/api/admin/auth.php?action=check`. `Login` POSTs credentials to `/api/admin/auth.php`; successful authentication updates context and navigates to `/admin`. Sign-out is provided by the context through `/api/admin/auth.php?action=logout`. Permission-sensitive controls call `can('content'|'services'|'listings'|'careers'|'blogs'|'delete')`; user administration is described as superadmin-only and server authorization remains authoritative.
3. `Dashboard` concurrently reads `/api/admin/services.php`, `listings.php`, `careers.php`, `applicants.php`, `blogs.php`, `content.php`, and `chat.php` (all below `/api/admin/`) for module counts and chat queue summaries.
4. CRUD/API mapping:
   - `ListingsManager` ↔ `/api/admin/listings.php`: GET collection or `?id=...` details; POST create; PUT update; DELETE `?id=...`; POST `?action=upload_image` for listing images.
   - `BlogManager` ↔ `/api/admin/blogs.php`: GET list; POST create; PUT update; PATCH `{ id, status }` publish/draft; DELETE `?id=...`; `?action=upload_image` uploads a cover image.
   - `CareerManager` ↔ `/api/admin/careers.php`: GET list; POST create; PUT update/status; DELETE `?id=...`.
   - `ServicesManager` ↔ `/api/admin/services.php`: GET all or `?category=...`; POST create; PUT update/publish state; DELETE `?id=...`.
   - `ApplicantsManager` ↔ `/api/admin/applicants.php`: GET list/summary; PUT status or internal notes; DELETE `?id=...`; GET `?action=resume&id=...` opens the protected resume.
   - `ContentEditor` ↔ `/api/admin/content.php`: GET `?page=...`; POST saves a block; DELETE `?id=...`; `?action=upload_image` uploads image content.
   - `UsersManager` ↔ `/api/admin/users.php`: GET list; POST create; PUT update; DELETE `?id=...`.
   - `LiveChat` ↔ `/api/admin/chat.php`: GET queue/summary; GET `?session_id=...` thread; POST `{ action: 'message'|'claim'|'close', session_id, ... }` sends, claims, or closes a session. Queue and selected thread poll every 3.5 seconds; an optional `session` query parameter selects a thread.
5. Successful mutations generally show toast feedback and reload the affected collection; destructive actions use `ConfirmDialog`. Blog, job, content, services, and applicant lists support local filtering; `DataTable` is used by blog and user managers.

## Integration

- Depends on `src/context/AuthContext.jsx` and `src/data/permissions` for session state/capabilities; `src/components/admin/ProtectedRoute.jsx` and `AdminLayout` enforce and frame protected route pages.
- PHP REST endpoints under `/api/admin/` are the authenticated persistence boundary; requests include browser credentials. Image uploads use multipart form data to the action endpoint; other writes send JSON and use HTTP verbs to express operations.
- Admin content represents the records consumed on the public site: `useListings` fetches `/api/listings.php`; `useBlogs` fetches `/api/blogs.php`; `useCareers` fetches `/api/careers.php`; `useServices` fetches `/api/services.php`. These are public display hooks with fallback content, not hooks called by the CRUD managers.
- `ENTERPRISE_TABS`/`ENTERPRISES` provide shared enterprise filters/options for blog, career, and service records; route modules also use Lucide icons and React Helmet metadata.
