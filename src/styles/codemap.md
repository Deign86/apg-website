# styles/

## Responsibility
Global stylesheet: Tailwind v4 entry and corporate theme, APG palette and font tokens, readable type scale, accessibility baselines (focus ring, scroll margin, iOS input zoom), document reset, scrollbar treatment, and shared legacy utility selectors.

## Design
- `global.css` starts with `@import "tailwindcss"` and an `@theme` block defining corporate fonts (`--font-sans`, `--font-serif`, `--font-display`, `--font-logo`, `--font-michroma`, `--font-cinzel`).
- `:root` defines the corporate palette (`--primary`, `--accent`, `--accent-2`, `--light`, `--dark`, `--bg-dark`, `--card-bg`, `--red-bg`), UI/nav font stacks, and enterprise display font stacks.
- A second unlayered `:root` pins `--font-sans/serif/display/mono` and `--radius`, because each enterprise's own Tailwind build re-declares `--font-*` in `@layer theme` and, loading later, would otherwise override the corporate tokens for the rest of the session; enterprises override on `:root.<enterprise>-active`.
- Type scale tokens on `html:root` (unlayered, beating every Tailwind `@layer theme` and the construction build's unlayered import): `--text-xs/sm/base/lg` with line heights, 13/15/16/18px on mobile and 14/16/17/19px at ≥1024px.
- `[id] { scroll-margin-top: 5rem }` so in-page jumps clear the fixed headers; below 768px, text inputs/selects/textareas get `font-size: max(1rem, 1em)` to stop iOS zoom.
- A `:where(...)` `:focus-visible` rule gives links, buttons, form fields, `summary`, `[role="button"]`, and tabbable elements a 2px gold (`#a8843f`) outline that survives `outline-none`.
- Registers the `GoodTimes` font face; applies scrollbar colors, box sizing, `html { overflow-x: hidden; scroll-behavior: smooth }`, body defaults, and `.container` / `.section-title` utilities.

## Flow
- `main.jsx` imports `global.css` → Tailwind utilities and tokens are available everywhere → later-loaded enterprise CSS cannot displace the pinned corporate font/radius/type-scale tokens → shared selectors and variables apply alongside utility classes.
- No network fetch, application state, API endpoint, context provider, or permissions logic is defined here.

## Integration
- Root font stacks `--font-ui-primary` and `--font-nav`; enterprise display variables cover APG, realty, Luxe, Dynamic Tree, construction, and BPO families.
- `html { overflow-x: hidden }` is why `hooks/useModalDialog` locks scroll on `<html>` rather than `<body>`. Redesign and route components rely on the `text-xs`…`text-lg` tokens defined here.
- Enterprise Tailwind builds under `src/routes/subsidiaries/` load their own CSS; the unlayered rules here are designed to win over them.
