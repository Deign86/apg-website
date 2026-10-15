# styles/

## Responsibility
Global stylesheet: Tailwind v4 entry and corporate theme, APG palette and font tokens, readable type scale, accessibility baselines (focus ring, scroll margin, iOS input zoom), document reset, scrollbar treatment, and shared legacy utility selectors; plus `apex-motion.css`, the apex home's decorative CSS loops.

## Design
- `global.css` starts with `@import "tailwindcss" source("../")` (scans `src/` only) plus `@source not` for the enterprise apps that ship their own Tailwind build (alpha-realty, luxe-prime, dynamic-tree, alta-venture, AltaVenture.jsx, Construction.jsx), so this render-blocking sheet carries only the utilities of the apex, admin, shared components, SwiftClear and 88 Prime. It is followed by an `@theme` block defining corporate fonts (`--font-sans`, `--font-serif`, `--font-display`, `--font-logo`, `--font-michroma`, `--font-cinzel`).
- `:root` defines the corporate palette (`--primary`, `--accent`, `--accent-2`, `--light`, `--dark`, `--bg-dark`, `--card-bg`, `--red-bg`), UI/nav font stacks, and enterprise display font stacks.
- A second unlayered `:root` pins `--font-sans/serif/display/mono` and `--radius`, because each enterprise's own Tailwind build re-declares `--font-*` in `@layer theme` and, loading later, would otherwise override the corporate tokens for the rest of the session; enterprises override on `:root.<enterprise>-active`.
- Type scale tokens on `html:root` (unlayered, beating every Tailwind `@layer theme` and the construction build's unlayered import): `--text-xs/sm/base/lg` with line heights, 13/15/16/18px on mobile and 14/16/17/19px at ≥1024px.
- `[id] { scroll-margin-top: 5rem }` so in-page jumps clear the fixed headers; below 768px, text inputs/selects/textareas get `font-size: max(1rem, 1em)` to stop iOS zoom.
- A `:where(...)` `:focus-visible` rule gives links, buttons, form fields, `summary`, `[role="button"]`, and tabbable elements a 2px gold (`#a8843f`) outline that survives `outline-none`.
- Applies scrollbar colors, box sizing, `html { overflow-x: hidden }` (deliberately no global `scroll-behavior: smooth`: route resets jump instantly, in-page jumps pass `behavior: 'smooth'`), body defaults, and `.container` / `.section-title` utilities.
- `apex-motion.css` (imported by `views/HomeView`, so it ships with that chunk): `.apex-loop` keyframe loops (`apex-orb-*`, `apex-sparkle-*`, `apex-aura`, `apex-ring`, `apex-dot-*`, `apex-beam`) on transform/opacity only, replacing per-frame JS motion loops with the same timings; paused under `[data-offscreen]` (set by HomeView while a section is out of view) and `prefers-reduced-motion`.

## Flow
- `main.jsx` imports `global.css` → Tailwind utilities and tokens are available everywhere → later-loaded enterprise CSS cannot displace the pinned corporate font/radius/type-scale tokens → shared selectors and variables apply alongside utility classes.
- No network fetch, application state, API endpoint, context provider, or permissions logic is defined here.

## Integration
- Root font stacks `--font-ui-primary` and `--font-nav`; enterprise display variables cover realty, Luxe, Dynamic Tree, construction, and BPO families.
- `html { overflow-x: hidden }` is why `hooks/useModalDialog` locks scroll on `<html>` rather than `<body>`. Redesign and route components rely on the `text-xs`…`text-lg` tokens defined here.
- Enterprise Tailwind builds under `src/routes/subsidiaries/` load their own CSS; the unlayered rules here are designed to win over them.
