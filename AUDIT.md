# Repo Audit — apg-website

Produced using three installed skills:
- **ponytail-audit** (`.pi/skills/ponytail-audit`) — over-engineering sweep
- **anti-slop** (`.pi/skills/install-anti-slop`) — low-evidence TS/JS patterns
- **unlazy** (`.pi/skills/unlazy`) — gate-enforced completion (`GATES.md`, 4/4 met with runnable evidence)

---

## ponytail-audit findings (ranked, biggest cut first)

- `delete:` Three **identical, completely unimported** shadcn `ui/` trees under
  `src/routes/subsidiaries/{dynamic-tree,luxe-prime,swift-clear}/app/components/ui/` —
  48 components × 3 = **15,351 lines of dead code**. Verified: zero imports of
  `components/ui/*` anywhere in the three subsidiary apps. Replacement: nothing.
- `delete:` **17 orphaned files in `scripts/`**, not referenced by `package.json` or any
  npm script (~2,284 lines): apply-migration.cjs, asset-health-check.js,
  batch-convert.js, batch-convert-phase2.js, check-asset-guardrails.cjs,
  convert-property.js, final-verify.js, fix-remaining.js, ingest-apg-listings.cjs,
  migrate.js, migrate.sql, prime88_update.jsx, seed.cjs, validate.js, verify-html.js,
  verify-roles.cjs, write-config.js. Replacement: nothing (keep in git history).
- `delete:` **14 directly unused dependencies** (0 import references measured across
  src/api/server/index.html): `@emotion/react`, `@emotion/styled`, `@mui/material`,
  `@mui/icons-material`, `three`, `@types/three` (dev), `react-slick`, `date-fns`,
  `canvas-confetti`, `react-dnd`, `react-dnd-html5-backend`,
  `react-responsive-masonry`, `react-popper`, `@popperjs/core`.
- `delete:` **38 transitively dead dependencies** — only ever imported by the dead
  `ui/` trees above: all 28 `@radix-ui/react-*` packages plus `cmdk`, `vaul`,
  `sonner`, `next-themes`, `embla-carousel-react`, `react-day-picker`, `input-otp`,
  `class-variance-authority`, `tailwind-merge`, `clsx`.
  Keep `recharts` (used by `src/routes/admin/Dashboard.jsx`). The two root ui files
  (`glowing-ai-chat-assistant.tsx`, `spotlight-card.tsx`) use only react + lucide-react.
- `delete:` Build leftover at repo root: `vite.config.js.timestamp-1785053361711-22dbbfc4911c28.mjs`.
- `shrink:` The "General Application" job-object literal is pasted verbatim **4×**
  in `src/views/CareersView.tsx` (lines ≈111, 114, 385, 1259), each ending in a
  blind `as any`. Extract one typed constant `GENERAL_APPLICATION`.

**net: -~17,600 lines, -52 deps possible.**

## anti-slop findings (low-evidence patterns)

| Rule | Count | Where | Fix |
|---|---|---|---|
| `require-safety-comment-for-type-assertion` / unsafe cast | 9 | `(window as any).enterpriseNavigate` in subsidiary Home/Services/Careers pages | Declare `interface Window { enterpriseNavigate?: (route: string) => void }` once; delete every cast |
| `require-safety-comment-for-type-assertion` | 5 | `{...} as any` job literals, `src/views/CareersView.tsx` | Type the object as the real `JobOpening` shape |
| `no-unknown-parameters` | 3 | `payload: unknown` in each copied `chart.tsx` (line 317) | Moot if the dead ui trees are deleted (recommended) |
| runtime `typeof` narrowing | 26 | various | Mostly legitimate boundary checks — low priority |

Clean: no chained assertions (`as unknown as`), no `Reflect.*`, no module mocking, no `@ts-ignore`.

Note: this repo is predominantly JS/JSX, so anti-slop's oxlint plugin has limited
surface today. If you want it enforced mechanically, run the `install-anti-slop`
skill to vendor the rules into `tools/oxlint/anti-slop/` + `oxlint.config.ts`.

## unlazy ledger

`GATES.md`: **4 of 4 gates met** with command-recorded evidence (gate-check ran via
`.pi/skills/unlazy/scripts/gate-check.mjs`). One self-caught correction along the way:
dep count was re-measured to 67 after an initial misremembered 56.

## Recommended order

1. Delete the three dead `ui/` trees → drop the 38 transitive deps.
2. Delete orphaned `scripts/` files + vite timestamp leftover.
3. Prune the 14 unused direct deps; run `pnpm install && pnpm build` to confirm.
4. Extract `GENERAL_APPLICATION` const; add typed `Window.enterpriseNavigate`.
