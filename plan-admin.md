# Plan — Alpha Premier Group Admin Panel (CMS + AI-Powered Dashboard)

> **Executor:** DeepSeek V4 Flash
> **Repo:** `C:\Users\Deign\Downloads\Original APG Website` (branch `main`)
> **Goal:** Build a complete, secure admin panel for the Alpha Premier Group website — content management for property listings, blogs, careers, and leads, plus an AI-powered analytics dashboard — using the existing Vite + React + Supabase stack.
> **Golden rule:** Do NOT touch the public site''s behavior or routes. The admin panel lives under `/admin/*` with its own layout (no public Header/Footer/Chatbot). Public pages may gain Supabase data sources but must keep working with their current hardcoded fallbacks.

---

## 0. Mission & Guardrails

1. Preserve the existing stack: Vite 5 + React 18 + React Router 6 + react-helmet-async + AOS + Supabase (data) + Resend (contact email) + pnpm.
2. **ONE** new dependency allowed: `recharts` (`^2`, React-friendly charts for the dashboard). Do not add any other library.
3. Admin routes use a separate `AdminLayout` (sidebar + topbar, dark/gold theme) — NOT the public `Layout` (no site Header/Footer/Chatbot on admin pages).
4. Never expose the Supabase service-role key to the client. Admin writes go through Supabase RLS policies enforced by the authenticated user''s role, not a service key.
5. Match the brand: dark (`#0a0a0a`/`#000`) + gold (`#c5a059`), Poppins/Orbitron, Font Awesome 6. Admin chrome may use a slightly lighter dark surface (`#111`) for panels — keep gold accents.
6. Every change keeps `pnpm build` green and the browser console error-free.
7. Commit per phase: `feat: admin — <phase summary>` (e.g. `feat: admin — auth layer + protected routes`).
8. Keep all legacy reference files (`*.html`, `*.php`, `.old_site/`) untouched.
9. Keep the existing parity `plan.md` intact — this is a separate effort tracked in `plan-admin.md`.

---

## 1. Tech Stack (preserve + 1 addition)

- Build/runtime: unchanged (Vite, React 18, RR6, react-helmet-async, AOS, pnpm).
- Data: Supabase — extend the schema (Phase 1). Public read; admin write via RLS.
- Auth: Supabase Auth (email/password) + a `profiles` table holding `role`.
- Charts: `recharts@^2` — the single allowed new dependency. Compatible with React 18 + Vite 5.
- Storage: Supabase Storage bucket `listing-images` for property/blog image uploads.
- Server: extend `server/contact.js` so inquiry submissions are also persisted to the `inquiries` table (service-role key is server-side only — never shipped to the client).
- Scripts: implement `scripts/setup-admin.cjs` (already wired in `package.json` as `pnpm setup-admin`).

---

## 2. Architecture & Route Map

`src/App.jsx` gets a second top-level route branch (NOT nested under the public `<Layout/>`). Public routes stay exactly as they are.

```
/admin/login              -> admin/Login.jsx            (public, no guard)
/admin                   -> AdminLayout + <ProtectedRoute>
  index                  -> admin/Dashboard.jsx
  /admin/properties      -> admin/PropertiesManager.jsx
  /admin/blogs           -> admin/BlogManager.jsx
  /admin/careers         -> admin/CareerManager.jsx
  /admin/inquiries       -> admin/Inquiries.jsx
  /admin/chat            -> admin/ChatViewer.jsx
  /admin/users           -> admin/Users.jsx            (owner|admin only)
  /admin/settings        -> admin/Settings.jsx
  /admin/activity        -> admin/ActivityLog.jsx
```

The public `Header.jsx` does **not** get an Admin link — admin is reached by direct URL (`/admin/login`). Unknown `/admin/*` paths render the admin 404 (on-brand).

---

## 3. Design System (admin)

Reuse `src/styles/global.css` tokens. Add `src/routes/admin/admin.css` with admin-specific layout classes:

- Extra tokens: `--admin-surface:#111; --admin-surface-2:#1a1a1a; --admin-border:#2a2a2a;` (alongside existing `--accent:#c5a059` etc.).
- **Sidebar:** fixed left, 240px, dark surface, gold active-state bar, Font Awesome icon + label per item, logo at top, logout at bottom; collapses to a drawer below 900px.
- **Topbar:** current page title, search (global, optional Phase 4 stretch), admin avatar + role badge, logout button.
- **Cards / tables:** dark surface, gold header text, hover row highlight, status pills (gold=featured, green=available/active, red=closed/inactive, grey=draft).
- **Forms:** dark inputs with gold focus ring, gold primary buttons, consistent spacing.
- **Responsive:** sidebar -> drawer (hamburger) under 900px; tables -> stacked cards under 640px.

---