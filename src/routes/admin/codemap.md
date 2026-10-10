# src/routes/admin/

## Responsibility

Implements the authenticated `/admin/*` application: sign-in, dashboard, content and portfolio CRUD, recruitment pipeline with ATS screening, user administration, and live-chat operations.

## Design

- `AdminShell` provides nested React Router routes inside `AuthProvider`; `/admin/login` is public, while dashboard and module routes share `ProtectedRoute` around `AdminLayout`. `admin.css` supplies admin-specific styling. On an enterprise subdomain in production, `App.jsx` redirects `/admin` to the apex.
- `ProtectedRoute` waits for session loading, then redirects unauthenticated users to `/admin/login`. `AuthProvider` verifies/signs in/out through `/api/admin/auth.php` and exposes `user`, `can`, and session state.
- `Dashboard` greets the user, links to each module, and loads summary counts concurrently from admin endpoints. `Login` invokes `signIn` and navigates into `/admin`.
- Managers use component-local state and direct `fetch` calls with `credentials: 'include'`, not the public data hooks. Shared admin components: `useToast`, `ConfirmDialog`, `DataTable`, `StatusPill`; capability checks use `useAuth().can(...)`.
- `ApplicantsManager` defines an `AtsBadge` (`<score>/100`; green when `ats_shortlisted`, amber when `ats_details.recommendation === 'maybe'`, red otherwise, "Pending" when unscored) shown in an ATS Score column and in the detail panel, which also lists `ats_details` summary, strengths, gaps, matched keywords, and method (AI vs keyword scored).
- `BlogManager` and `ContentEditor` render HTML live previews through `DOMPurify.sanitize(...)` (replacing the earlier regex sanitizer).
- `LiveChat` labels bot messages "APG Assistant".

## Flow

1. `App.jsx` routes `/admin/*` to `AdminShell` → `AuthProvider` → `Login` at `login`, or protected `AdminLayout` outlet for index (Dashboard), `live-chat`, `content`, `services`, `listings`, `careers`, `applicants`, `blogs`, `users`; unknown protected paths render admin `NotFound`.
2. Session bootstrap checks `/api/admin/auth.php?action=check`; `Login` POSTs credentials; sign-out uses `?action=logout`. Controls call `can('content'|'services'|'listings'|'careers'|'applicants'|'blogs'|'delete')`; server authorization remains authoritative.
3. `Dashboard` concurrently reads `/api/admin/` `services.php`, `careers.php`, `applicants.php`, `blogs.php`, `content.php`, and `chat.php`.
4. CRUD/API mapping:
   - `BlogManager` ↔ `/api/admin/blogs.php`: GET; POST; PUT; PATCH `{ id, status }`; DELETE `?id=`; `?action=upload_image` for covers.
   - `CareerManager` ↔ `/api/admin/careers.php`: GET; POST; PUT update/status; DELETE `?id=`.
   - `ServicesManager` ↔ `/api/admin/services.php`: GET all or `?category=`; POST; PUT update/publish; DELETE `?id=`.
   - `ApplicantsManager` ↔ `/api/admin/applicants.php`: GET list/summary; PUT status or notes; DELETE `?id=`; link `?action=resume&id=` opens the protected resume; POST `?action=rescreen` `{ id }` (gated by `can('applicants')`) re-runs ATS scoring and merges the returned `ats_*` fields into the row and detail panel with a toast.
   - `ContentEditor` ↔ `/api/admin/content.php`: GET `?page=`; POST save; DELETE `?id=`; `?action=upload_image`.
   - `UsersManager` ↔ `/api/admin/users.php`: GET; POST; PUT; DELETE `?id=`.
   - `LiveChat` ↔ `/api/admin/chat.php`: GET queue/summary; GET `?session_id=` thread; POST `{ action: 'message'|'claim'|'close', session_id, ... }`. Queue and thread poll every 3.5s; a `session` query param preselects a thread.
5. Mutations show toasts and reload or patch the affected collection; destructive actions use `ConfirmDialog`. Applicants filter by enterprise, status, search, and a "Shortlisted" toggle, and sort by newest (server order) or highest ATS score (client sort, unscored last). `DataTable` is used by blog and user managers.

## Integration

- Depends on `src/context/AuthContext.jsx`, `src/data/permissions`, `src/components/admin/*`, and `src/data/enterprises` (`ENTERPRISE_TABS`/`ENTERPRISES` for enterprise filters/options); also `dompurify`, `lucide-react`, and React Helmet metadata.
- PHP endpoints under `/api/admin/` are the authenticated persistence boundary. Uploads use multipart form data; other writes send JSON with HTTP verbs. ATS scores are produced server-side (keyword or optional Gemini scoring) when public applications arrive via `/api/applicants.php` or on re-screen.
- Admin records feed the public site's display hooks (`useBlogs`, `useCareers`, `useServices`, `useContent`), which the managers do not call. Property listings are managed in the APR Google Drive; the Dashboard card counts the public `/api/listings.php` feed and links to `/properties` (redirects to Realty's listings page).
