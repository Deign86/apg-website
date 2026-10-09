# context/

## Responsibility
React context providers for admin authentication/capability checks and shared subsidiary-page navigation state.

## Design
- `AuthProvider` owns `user` and initial `loading` state and exposes `user`, `session` (`{ user }` or `null`), `profile`, `loading`, `signIn`, `signOut`, `hasRole`, `can`, and `checkAuth`. `useAuth()` reads this value and throws when used outside the provider.
- `EnterpriseNavProvider` owns `currentPage` (initially `home`), a navigator ref, and a pending-key ref. `useEnterpriseNav()` returns `currentPage`, `setCurrentPage`, `registerNavigator`, and `navigate` (with safe defaults outside the provider: `registerNavigator` returns a no-op unregister, `navigate` returns `false`).
- `registerNavigator(fn)` returns an unregister function that clears the ref (and `window.enterpriseNavigate`) only if `fn` is still the registered one. Because `EnterpriseShell` stays mounted across enterprises and their `/inquire` routes, pages must return this from their effect so header/footer never call a previous page's dead setter.
- Authorization capability policy comes from `src/data/permissions.js`; `can()` is a client-side convenience for UI gating, not server authorization.

## Flow
- Provider mount → `checkAuth()` GETs `/api/admin/auth.php?action=check` with cookie credentials → authenticated `data.user` populates `user`, otherwise clears it → consumers read auth/loading/capability state through `useAuth()`.
- `signIn(email, password)` POSTs JSON to `/api/admin/auth.php` with credentials → success stores `data.user` and returns it; network or unsuccessful response throws for the caller to display.
- `signOut()` POSTs `/api/admin/auth.php?action=logout` → `finally` clears local user state. `hasRole()` reports whether any user exists; `can(capability)` calls `roleCan(user?.role, capability)`.
- An enterprise page registers its section-changing callback via `registerNavigator(fn)` and updates the active key with `setCurrentPage(page)` (mirrored to `window.enterpriseNavigate` / `window.enterpriseCurrentPage`). `navigate(key)` calls the registered callback (or the global fallback) and returns `true`; if none is mounted it stores `key` as pending and returns `false`, and the next `registerNavigator` immediately applies the pending key.

## Integration
- Wrap protected/admin descendants in `AuthProvider`; use `useAuth()` for session/user and `can()` for capability UI. Roles are superadmin, admin, editor, recruiter, with per-resource rules in `CAPABILITIES`.
- `EnterpriseShell` wraps enterprise routes in `EnterpriseNavProvider`; `EnterpriseHeader`/`EnterpriseFooter` call `navigate(key)` and, on `false`, router-navigate to `/subsidiaries/<slug>` so the enterprise home picks up the pending section.
- Authentication endpoints are `/api/admin/auth.php?action=check`, `/api/admin/auth.php` (POST login), and `/api/admin/auth.php?action=logout` (POST); credentials are included for session cookies.
