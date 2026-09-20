# Admin ↔ Site UI Alignment Audit (READ-ONLY)

**Date:** 2026-09-19 · **Scope:** `src/routes/admin/` + `src/components/admin/` vs site token system · **Mode:** zero production edits — this doc is the only write.
**RED contract:** `src/routes/admin/__tests__/site-alignment.test.mjs` (4 tests, all RED at audit time — expected).
**Routes covered:** AdminShell → login / Dashboard / live-chat / content / services / listings / careers / applicants / blogs / users (+ `*` NotFound). Tailwind v4, no config file.

## 1. Skill routing (ui-skills-root protocol: prefer 1, max 3)

Loaded: `ui-skills-root` (router) + `baseline-ui` (craft baseline) + `improve-ui` (audit method).

| Skill | Role in this audit | Selected for future fix execution? |
|---|---|---|
| `ui-skills-root` | Routing layer only — enforced prefer-1 / max-3, narrowest-skill rule. | Routing only, not a fix skill. |
| `baseline-ui` | Cleanup baseline: Tailwind defaults, no gradients/glow, `text-balance`/`text-pretty`, fixed z-scale, `size-*`, accessible primitives, `cn` for class logic. Directly maps to 90% of findings below. | **YES — the 1 selected fix skill.** |
| `improve-ui` | Audit-only skill: read-only surface trace, proof-gated findings, plans under `design-plans/`, never modifies product source. Matches this task's zero-edit constraint exactly — it *is* the method used to produce this doc. | NO for execution (it forbids implementing); cited as audit provenance. |

**Selection: 1 skill → `baseline-ui`.** The work is a token-swap + icon-swap cleanup on a fixed site contract, not a redesign — one narrow craft skill covers it. `improve-ui` contributed the audit discipline; `ui-skills-root` contributed the routing rule. No 2nd/3rd fix skill justified.

### Registry follow-up (`dammyjay93/interface-design`)
**Not fetched — deliberately skipped.** Reason: (a) MUST NOT allows no npm installs and `npx -y ui-skills@latest get` performs a network fetch outside the read-only tool budget (read/grep/glob/write-only); (b) nothing in the findings needs an external interface-design pattern — every replacement value is already pinned by the site contract below, so a registry skill would add choice where the contract removes it. Revisit only if a future restyle needs net-new admin patterns (e.g. command palette, kanban) with no site owner.

## 2. Site token contract (verified sources)

| Token family | Site value | Verified in |
|---|---|---|
| Shell bg | `bg-[#0A0803]` | RED contract; Footer `bg-[#0B0905]` sibling, Navbar `bg-[#0d0a06]` |
| Cards | `bg-[#120E05]/90` + `border-[#D4AF37]/30` + `rounded-2xl` | `InquireModal.tsx:165` |
| Buttons (primary/pill) | `bg-[#D4AF37]` + `hover:bg-[#FFF3D1]` + `rounded-full` + `uppercase tracking-widest` | `Navbar.tsx:101,145` |
| Nav pill container | `bg-[#161109]/90` + `border-[#D4AF37]/30` + `rounded-full` + active gold gradient `from-[#FFE082] via-[#D4AF37] to-[#B8860B]` | `Navbar.tsx:78,87` |
| Modals | `bg-[#0B0905]` + `border-[#D4AF37]/50` + `rounded-3xl` | `InquireModal.tsx:119`, `Footer.tsx:53` |
| Inputs | `bg-black/80` (InquireModal) / `bg-black/70`–`/90` variants + `border-neutral-800` (`border-[#D4AF37]/30` in Careers) + `focus:border-[#D4AF37]` + `rounded-xl` | `InquireModal.tsx:326-442`, `InquireView.tsx:278`, `CareersView.tsx:573` |
| Gold / headings | `#D4AF37` body-gold, `#E2B857` headings/eyebrows | `InquireModal.tsx:131,153`, `Footer.tsx:127`, `UnifiedLuxuryBackground.tsx:79` |
| Font | `Plus Jakarta Sans` (`--font-ui-primary`, `--font-nav` in `src/styles/global.css:18-19`) | `global.css` |
| Icons | `lucide-react` only (`package.json ^0.487.0`; Navbar/Footer/InquireModal import from it; zero `fa-solid` site-wide outside admin) | `package.json:21`, `Navbar.tsx:3`, `Footer.tsx:5`, `InquireModal.tsx:4` |
| Modal/input API | `InquireModal`: overlay `fixed inset-0 z-50 … bg-black/90 backdrop-blur-md`, panel `rounded-3xl border-[#D4AF37]/50`, icon chips `w-8 h-8 rounded-lg bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#E2B857]`, close `rounded-full border-[#D4AF37]/30` with `aria-label` | `InquireModal.tsx:118-145,186` |
| Footer pattern | `bg-[#0B0905] border-t border-[#D4AF37]/30`, eyebrow `text-[#E2B857] tracking-[0.25em] uppercase`, newsletter pill `rounded-full border-[#D4AF37]/30 focus:border-[#D4AF37]` | `Footer.tsx:53,127,231` |

## 3. Per-file divergence table

`Skill` = fix skill to apply (all rows: `baseline-ui`). Totals verified by grep: **62 `fa-solid` occurrences in admin prod code** (52 in `src/routes/admin/*.jsx` + 10 in `src/components/admin/*.jsx`; test file excluded), **0 `lucide-react` imports in admin**, **0 occurrences of any site token** (`#0A0803`, `#D4AF37`, `#120E05`, `bg-black/80`, `rounded-2xl/3xl/full` as Tailwind classes) in admin prod code.

| # | Admin file | Current style (divergence) | Site token replacement | Skill |
|---|---|---|---|---|
| 1 | `src/components/admin/AdminLayout.jsx` | Shell is `div.admin-layout` → `admin.css:22` `background:#000`, no Tailwind shell token; font inherits Poppins chain | Shell wrapper → `bg-[#0A0803] text-neutral-100` (+ keep flex layout utilities); drop dependency on `#000` | baseline-ui |
| 2 | `src/routes/admin/admin.css` (design system root) | `--admin-surface:#111`, `--admin-surface-2:#1a1a1a`, `--admin-border:#2a2a2a`, `--admin-gold:#c5a059` (L10), layout `background:#000` (L22), `font-family:'Poppins'` (L24, L123), logo `font-family:'Orbitron'` (L68), radii `6/8/10/12px` (L121, L227, L238, L521…), chat-bubble `linear-gradient(135deg,#c5a059…)` (L904), `z-index:1000/5000/9999` ad-hoc scale (L57, L469, L515) | Remap vars: surface→`#0A0803` family, gold→`#D4AF37`/`#E2B857` headings, font→Plus Jakarta Sans stack; cards→`rounded-2xl` (`16px` min), dialogs→`rounded-3xl`, pills/buttons→`rounded-full`; replace gradient bubble with flat `bg-[#D4AF37] text-black`; collapse z-scale to fixed site scale (`50` overlay / modal, header below) | baseline-ui |
| 3 | `src/components/admin/ProtectedRoute.jsx` | Loading screen uses `admin-loading-screen` → `#000` bg + `#c5a059` text (admin.css:538-547) | Loading state → site shell `bg-[#0A0803]` + structural skeleton (baseline-ui: skeletons over spinners) + `text-[#E2B857]` | baseline-ui |
| 4 | `src/routes/admin/Login.jsx` | Inline `Orbitron` + `#c5a059` h2 (L39); `fa-circle-exclamation` icon (L47); `.admin-field` inputs (`#1a1a1a`/`#2a2a2a`, `radius:6px`); `.admin-btn-primary` (`#c5a059`, `radius:6px`) (L77) | Card → `bg-[#120E05]/90 border-[#D4AF37]/30 rounded-2xl`; inputs → `bg-black/80 border-neutral-800 focus:border-[#D4AF37] rounded-xl`; button → `bg-[#D4AF37] hover:bg-[#FFF3D1] rounded-full uppercase tracking-widest`; icon → lucide `CircleAlert`; heading → Plus Jakarta Sans + `text-[#E2B857]`; error inline (baseline-ui: error next to action, no paste-blocking) | baseline-ui |
| 5 | `src/routes/admin/Dashboard.jsx` | Module cards inline `#12141c` / `#232738` / `radius:12` (L147-149, L189); 7 rainbow icon colors (`#ef4444 #3b82f6 #8b5cf6 #10b981 #06b6d4 #f59e0b` + `#c5a059`, L60-114); `fa-solid` ×4 incl. dynamic `fa-solid ${m.icon}` (L170); hover JS mutating `borderColor` `#c5a059/#232738` (L158-165); status pill hand-rolled (L134); `code` chips `#1c1f2e` (L195) | Cards → `bg-[#120E05]/90 border-[#D4AF37]/30 rounded-2xl hover:border-[#D4AF37]`; icon chips → `bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#E2B857] rounded-lg` (InquireModal API); icons → lucide (`Headset, PenSquare, Building2, Layers, Briefcase, UserCheck, Newspaper`); single gold accent per view (baseline-ui: one accent per view — rest to neutral); hover via Tailwind classes, not `onMouseEnter` style mutation; headings `text-balance`, desc `text-pretty tabular-nums` for counts | baseline-ui |
| 6 | `src/components/admin/Sidebar.jsx` | `fa-chart-pie/fa-headset/fa-pen-to-square/…` string icons + `fa-right-from-bracket` (L6-15, L67, L79); active `rgba(197,160,89,…)` + `#c5a059` via CSS; badge `var(--admin-red)` pill | Nav → Navbar pill pattern `bg-[#161109]/90 border-[#D4AF37]/30 rounded-full`, active `bg-[#D4AF37] text-black uppercase tracking-[0.15em]`; icons → lucide components (not string map); badge → site red w/ `tabular-nums` | baseline-ui |
| 7 | `src/components/admin/Topbar.jsx` | `fa-bars`, `fa-arrow-up-right-from-square` (L10, L15); role badge `var(--admin-blue)/#555` (CSS L209-210); profile `#aaa` inline (L20) | Icons → lucide `Menu`, `ExternalLink`; CTA → Navbar `INQUIRE NOW`-style pill (`rounded-full border-[#D4AF37]`); role badge → `StatusPill`-equivalent gold/green pills; title `text-balance` | baseline-ui |
| 8 | `src/components/admin/ConfirmDialog.jsx` | `admin-dialog-box` → `#111`/`#2a2a2a`/`radius:12px` (CSS L518-526); buttons `admin-btn-secondary/danger` (`radius:6px`, red `#e74c3c`) | Modal → InquireModal API: `bg-[#0B0905] border-[#D4AF37]/50 rounded-3xl`; destructive confirm → `AlertDialog` primitive (baseline-ui MUST for destructive actions); buttons → site pill buttons | baseline-ui |
| 9 | `src/components/admin/DataTable.jsx` | Sort/action icons `fa-arrow-up/down`, `fa-solid ${act.icon}` (L68, L90); toolbar inputs `admin-table-toolbar` (`#1a1a1a`, `radius:6px`); ghost action buttons | Inputs → `bg-black/80 border-neutral-800 focus:border-[#D4AF37] rounded-xl`; icons → lucide `ArrowUp/ArrowDown`; ghost buttons get `aria-label` (baseline-ui MUST for icon-only buttons); pagination buttons → site secondary pill | baseline-ui |
| 10 | `src/components/admin/StatCard.jsx` | `fa-solid ${icon}` + `fa-arrow-up/down` delta (L7, L14); `admin-stat-card` `#111`/`radius:10px`, icon chip `rgba(197,160,89,.12)`/`radius:12px` | Card → `bg-[#120E05]/90 border-[#D4AF37]/30 rounded-2xl`; icon chip → `bg-[#D4AF37]/15 border-[#D4AF37]/30 text-[#E2B857] rounded-xl`; icons → lucide props; delta → `tabular-nums` + lucide `TrendingUp/Down` | baseline-ui |
| 11 | `src/components/admin/StatusPill.jsx` | `admin-pill-*` color set keyed to legacy gold/red/blue (`rgba(197,160,89,…)`, `#e74c3c`, `#3498db`) — no `rounded-full` pill, no gold/heading split | Pill → `rounded-full uppercase tracking-widest` with `bg-[#D4AF37]/15 text-[#E2B857]` (gold), green/red/blue site equivalents; keep `colorMap` API, swap values only | baseline-ui |
| 12 | `src/components/admin/EmptyState.jsx` | `fa-solid ${icon‖'fa-database'}` (L4); `.admin-empty-state` `#666` centered, no next action (CSS L497-505) | Icon → lucide prop (default `Database`); add one clear next action (baseline-ui MUST for empty states); text `text-pretty` | baseline-ui |
| 13 | `src/components/admin/Toast.jsx` | `fa-check-circle/fa-circle-exclamation/fa-circle-info` (L31); toast skins `#1a3a2a/#3a1a1a/#1a2a3a` + `slideIn` transform animation (CSS L487-494) | Icons → lucide `CheckCircle2/CircleAlert/Info`; skins → site neutrals + gold/green/red left-border; keep compositor-only animation ≤200ms `ease-out` (baseline-ui animation rules) | baseline-ui |
| 14 | `src/routes/admin/AdminShell.jsx` | No styling itself, but composes the diverged tree (AuthProvider→ProtectedRoute→AdminLayout→8 managers); no font shell | No visual change; inherits shell/font/icon fixes from rows 1-13; ensure `Plus Jakarta Sans` on admin root | baseline-ui |
| 15 | `src/routes/admin/LiveChat.jsx` | `fa-solid` ×8 (`fa-rotate/hourglass/bolt/circle-check/xmark/paper-plane/lock` + dynamic tab icon); wait-time red chips, `#080808` message scroll, gold-gradient admin bubble (CSS L849, L903-908) | Queue/session cards → `bg-[#120E05]/90 border-[#D4AF37]/30 rounded-2xl`; inputs → `bg-black/80 … rounded-xl`; icons → lucide (`RefreshCw, Hourglass, Zap, CheckCircle2, X, Send, Lock`); admin bubble → flat `bg-[#D4AF37] text-black`; badge `tabular-nums` | baseline-ui |
| 16 | `src/routes/admin/ContentEditor.jsx` | `fa-solid` ×5 (plus/upload/file/pen/trash); filter tabs `#c5a059`/`#141620` + `#232738` borders (L216-219); `code` chips `#1c1f2e`; preview `#0d0f16` + `radius:6` (L352, L374) | Tabs → Navbar pill active/inactive; inputs → site input token; icons → lucide; chips → `bg-black/80 border-[#D4AF37]/30 text-[#E2B857] rounded-xl` | baseline-ui |
| 17 | `src/routes/admin/ServicesManager.jsx` | `fa-solid` ×4; category tabs `#c5a059`/`#141620`/`#232738` (L206-209); empty `fa-boxes-stacked #444` (L232) | Same tab/input/icon swap as row 16; empty state → row-12 pattern | baseline-ui |
| 18 | `src/routes/admin/ListingsManager.jsx` | `fa-solid` ×8 (plus/spinner/building/pen/trash/images/upload); primary `#c5a059` inline (L445); gallery `#101010` + `radius:6` | Gallery cards → `rounded-2xl border-[#D4AF37]/30 bg-[#120E05]/90`; dialog (`property-editor-dialog`, max-w 860) → InquireModal API `bg-[#0B0905] rounded-3xl border-[#D4AF37]/50`; icons → lucide | baseline-ui |
| 19 | `src/routes/admin/CareerManager.jsx` | `fa-solid` ×4; filters `#c5a059`/`#12141c`/`#141620`/`#232738` (L246-288); search `#0b0d14`/`radius:6` (L306); rows `#12141c` (L465, L490) | Filters → pill tabs; search → `bg-black/80 … rounded-xl` w/ lucide `Search` prefix (BlogsView pattern `:1147`); rows → site cards; icons → lucide | baseline-ui |
| 20 | `src/routes/admin/ApplicantsManager.jsx` | `fa-solid` ×9 + `fa-regular fa-envelope`; detail labels `#c5a059` uppercase (L478, L489); resume card `#12141c`/`#232738` (L456); notes box `#0d0f16`-adjacent (L502) | Labels → `text-[#E2B857] tracking-widest uppercase`; cards → site card token; links → `hover:text-[#E2B857]` (InquireModal API); icons → lucide (`RotateCw, Mail, Phone, FileText, Eye, Trash2, Download, Lock`); ATS stage pills → row-11 | baseline-ui |
| 21 | `src/routes/admin/BlogManager.jsx` | `fa-solid` ×5 (star/plus/triangle/upload); filters `#c5a059`/`#12141c`/`#141620`/`#232738` (L419-477); editor `#0d0f16`/`radius:6` (L631) | Same filter/input/icon swap; featured `fa-star #c5a059` → lucide `Star text-[#E2B857]`; uploads → lucide `Upload` + site input token | baseline-ui |
| 22 | `src/routes/admin/UsersManager.jsx` | `fa-solid` ×3 (plus/triangle ×2); `YOU` badge `#c5a059` (L166) | Badge → site gold pill; icons → lucide (`Plus, TriangleAlert`); forms → site input + pill-button tokens | baseline-ui |
| 23 | `src/routes/admin/NotFound.jsx` | `fa-compass #c5a059 56px` (L9); `admin-error-page`; `admin-btn-primary` link | Icon → lucide `Compass text-[#E2B857]`; button → site pill; heading `text-balance` | baseline-ui |

Cross-cutting notes: (a) `Poppins`/`Orbitron` must go everywhere incl. `Login.jsx:39` inline style — replace with Plus Jakarta Sans stack from `global.css:18`; (b) baseline-ui forbids the `admin.css:904` gradient and glow — the only sanctioned gold gradient is the site-owned Navbar active-pill `from-[#FFE082] via-[#D4AF37] to-[#B8860B]`; (c) baseline-ui `h-dvh` over `h-screen` applies where viewport heights are used (`admin.css:21,52` use `100vh` → `100dvh`); (d) `tracking-*` changes are site-contract-driven (Navbar/Footer `tracking-[0.25em]` eyebrows, pill `tracking-widest`), which satisfies baseline-ui's "never modify letter-spacing unless explicitly requested" — the site system is the explicit requester.

## 4. `cn()` (clsx + tailwind-merge) decision: **SKIP — with justification**

**Decision: do NOT introduce `cn()` in the alignment restyle.**

1. **baseline-ui's `cn` rule is conditional, not absolute.** It mandates `cn` *"for class logic"* — i.e. where conditional/composed classes risk conflicts. Admin's current conditional styling is string-concat (`admin-nav-item ${isActive?'active':''}`) and inline-style mutation (`Dashboard.jsx:158-165`), both of which the restyle *deletes* in favor of static Tailwind tokens + Tailwind state variants (`hover:`, `focus:`). No `tailwind-merge`-class conflict (e.g. `px-4` vs `px-5`) is introduced by the token map above.
2. **Zero-conflict token map.** Every replacement is additive site classes with no competing same-property utilities on one element (cards get one bg, one border, one radius). `tailwind-merge` solves a problem this diff does not create.
3. **Hard constraints forbid it.** `clsx` + `tailwind-merge` are absent from `package.json` (verified §2); adding them violates this task's **No npm installs** + **zero production edits**. A `cn` util without its deps is dead code — the exact speculative-abstraction slop `install-anti-slop`/`ponytail` forbid.
4. **Adoption gate (when to reverse this):** introduce `lib/cn.js` (clsx + tailwind-merge) only if a later change adds *variant-driven* admin components (e.g. Button/Card with `variant/size` props merging consumer `className`) where conflicting Tailwind classes become possible. That is a new-feature decision, not part of token alignment.

## 5. Verification (read-only — no GREEN expected)

- **RED still RED (2026-09-19):** `node --test src/routes/admin/__tests__/site-alignment.test.mjs` → all 4 fail as designed: `ALIGN-SHELL` (no `bg-[#0A0803]`), `ALIGN-TOKENS` (missing `bg-[#120E05]/90` first), `ALIGN-ICONS` (**62 `fa-solid`** occurrences, must be 0), `ALIGN-INPUTS` (missing `bg-black/80`). No prod file touched, so RED is intact.
- **Build passes:** `npm run build` → `✓ built in 9.59s` (only the pre-existing >500 kB chunk-size warning on `index-*.js`; no errors). Read-only audit changed nothing under `src/`, `api/`, or config.
- **Diff discipline:** sole repo write is this file (`docs/admin-ui-audit.md`). No installs, no commits, no theme/component-library proposals.

## 6. Executor handoff (for the future restyle PR — not this task)

1. Apply rows 1-13 (shell, system, layout, login, dashboard, shared components) first — highest reach.
2. Apply rows 15-22 per manager route; rows 6/9/11/12/13 are shared primitives, so managers inherit most fixes.
3. Keep the RED contract assertions untouched; restyle until `node --test` is GREEN, then run `npm run build`.
4. Revisit `cn()` only at the §4 gate; revisit `dammyjay93/interface-design` only for net-new patterns (§1).
