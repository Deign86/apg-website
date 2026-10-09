# dynamic-tree/styles/
## Responsibility
- Contains Dynamic Tree's CSS entry point and supporting theme layers.
- `index.css` composes `fonts.css`, `tailwind.css`, and `theme.css`.
- `theme.css` defines semantic light/dark tokens, Tailwind aliases, and base typography.
- `fonts.css` imports Outfit/Playfair/Big Shoulders; `tailwind.css` imports Tailwind (`source(none)`) and `tw-animate-css`.
## Design
- Tokens set a pale pink background, dark ink foreground, and rose accent.
- Tokens and base rules are declared under `:root.dynamic-tree-active`, so they apply only while the route is mounted.
- `@theme inline` maps semantic variables and radii to Tailwind utilities.
- Base heading, label, button, and input typography sits in `@layer base`, overridable by utilities.
- Component-level decoration remains in React rather than the theme sheets.
## Flow
- `DynamicTree.jsx` loads `styles/index.css` when its route module is included.
- Its layout effect adds `dynamic-tree-active` to `<html>` before first paint and removes it on unmount.
- `tailwind.css` scans `../**/*.{js,ts,jsx,tsx}` for utilities.
- The page shell consumes matching theme colors and typography.
- No navigation or React runtime state is implemented here.
## Integration
- Vite/Tailwind/PostCSS process CSS directives for the project bundle.
- Once loaded, unscoped Tailwind utilities persist, but theme tokens stop applying after the class is removed.
- `fonts.css` loads the font families from Google Fonts.
- Theme files remain local to Dynamic Tree, not shared with other subsidiaries.
- `DynamicTree.jsx` is the only importer of this entry.
