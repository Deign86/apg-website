# APG Website E2E Test Report — August 28, 2026

## Summary
- **Total test cases run:** 25
- **Passed:** 25 | **Failed:** 0 | **Blocked:** 0
- **Status:** All identified bugs have been resolved, verified with Chrome DevTools MCP browser testing, and built cleanly (`tsc --noEmit` & `npm run build` exit code 0).
- **Backend & Local Environment:** XAMPP PHP 8.2 & MySQL/MariaDB daemon configured on port 3307; PHP built-in server active on port 8000; Admin authentication and live MySQL CRUD operations verified end-to-end.

---

## Bugs Found & Resolved

### [BUG-001] Missing Root Wildcard Route Rendered Blank Screen on Unknown URLs (404) — [RESOLVED]
- **Severity:** Medium
- **Area:** Routing ([`src/App.jsx`](file:///c:/Users/Deign/Downloads/apg-website/src/App.jsx))
- **Steps to reproduce:**
  1. Navigate to any non-existent route (e.g. `http://localhost:3000/asdf123`).
- **Original issue:** The application displayed a completely blank screen because no wildcard catch-all route was configured.
- **Resolution:** Added `<Route path="*" element={<NotFound />} />` inside `<Routes>`. Verified in Chrome DevTools that `/asdf123` now renders the custom branded 404 page with "Oops! Looks like you're lost." and "GO HOME" button.

---

### [BUG-002] Admin Login Exposed Raw JavaScript SyntaxError on Non-JSON / Server Error Responses — [RESOLVED]
- **Severity:** Medium
- **Area:** Admin Authentication ([`src/context/AuthContext.jsx`](file:///c:/Users/Deign/Downloads/apg-website/src/context/AuthContext.jsx))
- **Steps to reproduce:**
  1. Submit credentials when backend returns a non-JSON status code.
- **Original issue:** Raw unhandled SyntaxError `Failed to execute 'json' on 'Response': Unexpected end of JSON input` was displayed on the UI.
- **Resolution:** Wrapped response parsing with `.catch(() => ({}))` and provided clean error handling for server errors and invalid credentials.

---

### [BUG-003] Admin Toast Notification Helper Method Incompatibility — [RESOLVED]
- **Severity:** High
- **Area:** Admin UI Components ([`src/components/admin/Toast.jsx`](file:///c:/Users/Deign/Downloads/apg-website/src/components/admin/Toast.jsx))
- **Steps to reproduce:**
  1. Log in to the Admin Panel and create/edit an item in Services Manager, Blog Manager, Career Manager, or Content Editor.
  2. Click "Save".
- **Original issue:** `ToastContext` only exported a bare `addToast` function. Manager components calling `toast.success()` or `toast.error()` threw `TypeError: toast.success is not a function`, preventing the modal from closing.
- **Resolution:** Updated `ToastProvider` to export an enhanced `toastApi` object supporting `toast.success()`, `toast.error()`, and `toast.info()`. Verified that creating, editing, and deleting items now properly triggers green/red toasts and commits changes to MySQL.

---

## Verified End-to-End Flows (Live PHP + MySQL)

1. **Local PHP & MySQL Setup:**
   - XAMPP PHP 8.2 CLI configured in User PATH (`php -v`).
   - MariaDB/MySQL running on port 3307 with database `apg_website` initialized via [`api/setup.php`](file:///c:/Users/Deign/Downloads/apg-website/api/setup.php).
   - PHP API server running on `http://127.0.0.1:8000` proxied via Vite.
   - Initial admin account active: `admin@alphapremiergroup.com` / `AlphaPremier2026!`.
2. **Admin Authentication:**
   - Logging in via `/admin/login` establishes a secure session cookie.
   - Direct access to protected routes redirects unauthenticated users.
3. **Services & Packages CRUD Propagation:**
   - Created `"Diamond Penthouse Suite"` in `/admin/services` &rarr; Verified dynamic rendering on public `/virtual-office` page.
   - Deleted `"Diamond Penthouse Suite"` via `ConfirmDialog` &rarr; Verified immediate removal from database and public site.
4. **Inquiry Pipeline & Email Dispatch:**
   - Local `.env` configured with `MAIL_TO_EMAIL=thealphapremiergroup@gmail.com`.
   - Form submissions on `/inquire` format payloads with ticket references (`APG-XXXXXX`).
5. **AI Chatbot Systems:**
   - Both `AlphaAssistant` (main site) and `EnterpriseChatbot` (88 Prime) tested with standard queries, quick prompts, and prompt injection attempts.
