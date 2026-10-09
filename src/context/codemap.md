# context/

## Responsibility
React context providers for admin authentication/capability checks and shared subsidiary-page navigation state.

## Design
- `AuthProvider` owns `user` and initial `loading` state and exposes `user`, `session` (`{ user }` or `null`), `profile`, `loading`, `signIn`, `signOut`, `hasRole`, `can`, and `checkAuth`. `useAuth()` reads this value and throws when used outside the provider.
- `EnterpriseNavProvider` owns `currentPage` (initially `home`) and a registered navigator function. `useEnterpriseNav()` returns `currentPage`, `setCurrentPage`, `registerNavigator`, and `navigate` (with safe default context values).
- Authorization capability policy comes from `src/data/permissions.js`; `can()` is a client-side convenience for UI gating, not server authorization.

## Flow
- Provider mount → `checkAuth()` GETs `/api/admin/auth.php?action=check` with cookie credentials → authenticated `data.user` populates `user`, otherwise clears it → consumers read auth/loading/capability state through `useAuth()`.
- `signIn(email, password)` POSTs JSON to `/api/admin/auth.php` with credentials → success stores `data.user` and returns it; network or unsuccessful response throws an error for the caller to display.
- `signOut()` POSTs `/api/admin/auth.php?action=logout` → `finally` clears local user state. `hasRole()` reports whether any user exists; `can(capability)` calls `roleCan(user?.role, capability)`.
- A subsidiary shell registers its page-changing callback via `registerNavigator(fn)` and updates active key with `setCurrentPage(page)` → provider state updates and mirrors to `window.enterpriseNavigate` / `window.enterpriseCurrentPage` → consumers call `navigate(key)` to invoke the registered callback (or the global fallback).

## Integration
- Wrap protected/admin descendants in `AuthProvider`; use `useAuth()` to access session/user and `can()` for capability UI. The role model includes superadmin, admin, editor, recruiter, with per-resource rules in `CAPABILITIES`.
- Wrap enterprise navigation descendants in `EnterpriseNavProvider`; `useEnterpriseNav()` connects shared headers, page tabs, and related controls without prop-drilling the current page callback.
- Authentication endpoints are `/api/admin/auth.php?action=check`, `/api/admin/auth.php` (POST login), and `/api/admin/auth.php?action=logout` (POST); credentials are included for session cookies.
