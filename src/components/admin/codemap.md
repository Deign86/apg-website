# src/components/admin/

## Responsibility
Reusable admin application shell, authentication gate, navigation, table/status/stat presentation, confirmation, empty-state, and toast primitives for `/admin/*` CMS routes.

## Design
- `ProtectedRoute` reads `AuthContext` (`user`, `loading`): shows a loading skeleton, redirects unauthenticated users to `/admin/login`, otherwise renders `children`.
- `AdminLayout` composes a `ToastProvider`, mobile overlay/sidebar, `Topbar`, and nested `<Outlet />`. It owns sidebar-open state, supplies toggle/close callbacks, and loads `src/routes/admin/admin.css`.
- `Sidebar({ open, onClose })` consumes `useAuth()` (`signOut`, `can`), filters destinations by capability, polls `/api/admin/chat.php` only for chat-capable users, and signs out before navigating to login.
- `Topbar({ onToggleSidebar })` reads `profile` from `AuthContext` and displays role/name and a public-site link.
- `DataTable` accepts `columns`, `rows`, optional `actions`, controlled `search`/`onSearch`, `filterComponent`, `pageSize`, initial `sortKey`/`sortDir`, empty-state props, and `loading`. It owns sorting/page state, performs client-side filtering/sorting/pagination, and invokes column renderers/action callbacks.
- `ToastProvider` and `useToast` (`Toast.jsx`) form a context API with callable/info/success/error notifications; the hook errors outside the provider. `ConfirmDialog` is a controlled dialog (`open`, `onConfirm`, `onCancel`, `loading`, labels/content). `EmptyState`, `StatusPill`, and `StatCard` are prop-driven display primitives.

## Flow
- `/admin/*` enters route-level `AdminShell` → `ProtectedRoute` → `AdminLayout` → provider/sidebar/topbar/content outlet. Auth loading blocks protected children; missing user redirects to login.
- Admin views fetch and own records, then pass them into `DataTable` or render their own tables; `DataTable` handles local search, sort and page slicing, rendering `EmptyState` if no rows match.
- Mutations invoke `useToast()` for timed feedback; destructive actions open `ConfirmDialog`; status fields are displayed through `StatusPill`.
- Sidebar access uses `can(capability)` both to filter links and to gate its five-second waiting-chat polling badge.

## Integration
- **Consumers/routes:** `src/routes/admin/AdminShell.jsx` composes `ProtectedRoute` and `AdminLayout`. Managers (`BlogManager`, `ApplicantsManager`, `LiveChat`, `ContentEditor`, `ListingsManager`, `CareerManager`, `ServicesManager`, `UsersManager`) use `useToast` and/or `ConfirmDialog`; only `BlogManager` and `UsersManager` use `DataTable` (`ApplicantsManager` renders its own table with ATS badges); `StatusPill` is used by LiveChat, BlogManager, ApplicantsManager, and UsersManager. `DataTable` reuses `EmptyState`. `StatCard` has no current route consumer.
- **Dependencies:** `@/context/AuthContext` (`user`, `loading`, `profile`, `signOut`, `can`); React Router (`Outlet`, `NavLink`, `Navigate`, `Link`, `useNavigate`); `/api/admin/chat.php`; `lucide-react`; `src/routes/admin/admin.css`.
