# src/components/admin/

## Responsibility
Reusable admin application shell, authentication gate, navigation, page header, filter controls, table/status/stat presentation, confirmation, empty-state, and toast primitives for `/admin/*` CMS routes.

## Design
- `ProtectedRoute` reads `AuthContext` (`user`, `loading`): shows a loading skeleton, redirects unauthenticated users to `/admin/login`, otherwise renders `children`.
- `AdminLayout` composes a `ToastProvider`, mobile overlay/sidebar, `Topbar`, and nested `<Outlet />`. It owns sidebar-open state, supplies toggle/close callbacks, and loads `src/routes/admin/admin.css`. The outlet sits in a `Suspense` (spinner) because manager screens are lazy chunks.
- `PageHeader({ eyebrow, title, badge, description, actions })` is every page's header; the eyebrow matches the sidebar group. `SegmentedControl({ label, options, value, onChange })` is the single-choice status/view filter (`aria-pressed` buttons in a `role="group"`). `EnterpriseSelect({ value, onChange, countFor, allLabel })` is the enterprise scope `<select>` over `ENTERPRISE_TABS` (gold `is-filtered` border when narrowed).
- `Sidebar({ open, onClose })` consumes `useAuth()` (`signOut`, `can`), renders destinations in groups (Engagement, Website, Recruitment, Administration), filters them by capability, polls `/api/admin/chat.php?summary=1` only for chat-capable users, and signs out before navigating to login.
- `Topbar({ onToggleSidebar })` reads `profile` from `AuthContext` and displays role/name and a public-site link. Its "Change password" button opens `ChangePasswordModal` (current password → emailed code → new password).
- `DataTable` accepts `columns`, `rows`, optional `actions`, controlled `search`/`onSearch`, `filterComponent`, `pageSize`, initial `sortKey`/`sortDir`, empty-state props, and `loading`. It owns sorting/page state (page clamped when rows shrink), performs client-side filtering/sorting/pagination, keeps its toolbar (`filterComponent` + search) visible in loading/empty states, and invokes column renderers/action callbacks (`danger: true` actions get the red hover).
- `ToastProvider` and `useToast` (`Toast.jsx`) form a context API with callable/info/success/error notifications; the hook errors outside the provider. `ConfirmDialog` is a controlled dialog (`open`, `onConfirm`, `onCancel`, `loading`, labels/content). `EmptyState`, `StatusPill`, and `StatCard` are prop-driven display primitives.

## Flow
- `/admin/*` enters route-level `AdminShell` → `ProtectedRoute` → `AdminLayout` → provider/sidebar/topbar/content outlet. Auth loading blocks protected children; missing user redirects to login.
- Admin views fetch and own records, then pass them into `DataTable` or render their own tables; `DataTable` handles local search, sort and page slicing, rendering `EmptyState` if no rows match.
- Mutations invoke `useToast()` for timed feedback; destructive actions open `ConfirmDialog`; status fields are displayed through `StatusPill`.
- Sidebar access uses `can(capability)` both to filter links and to gate its waiting-chat badge poll: every 5 s while the tab is visible, at most once a minute while hidden (the poll keeps an idle console's PHP session alive), and on `visibilitychange`.

## Integration
- **Consumers/routes:** `src/routes/admin/AdminShell.jsx` composes `ProtectedRoute` and `AdminLayout`. Managers (`BlogManager`, `ApplicantsManager`, `LiveChat`, `ContentEditor`, `CareerManager`, `ServicesManager`, `UsersManager`) use `useToast` and/or `ConfirmDialog`; only `BlogManager` and `UsersManager` use `DataTable` (`ApplicantsManager` renders its own table with ATS badges); `StatusPill` is used by LiveChat, BlogManager, ApplicantsManager, and UsersManager. `DataTable` reuses `EmptyState`. `StatCard` has no current route consumer.
- **Dependencies:** `@/context/AuthContext` (`user`, `loading`, `profile`, `signOut`, `can`); React Router (`Outlet`, `NavLink`, `Navigate`, `Link`, `useNavigate`); `/api/admin/chat.php?summary=1`; `lucide-react`; `src/routes/admin/admin.css`.
