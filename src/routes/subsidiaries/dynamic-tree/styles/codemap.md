# dynamic-tree/styles/
## Responsibility
- Contains Dynamic Tree's CSS entry point and supporting theme layers.
- `index.css` composes font, global, theme, and Tailwind styles.
- `theme.css` defines semantic light/dark tokens and Tailwind aliases.
- `globals.css` and `fonts.css` provide base rules and typography; `tailwind.css` integrates utilities.
- Both the APG wrapper and standalone React entry import this style system.
## Design
- Tokens set a pale pink background, dark ink foreground, and rose accent.
- Outfit is the application shell font; font rules live in the font layer.
- Tailwind base rules and aliases support page-level utility styling.
- Global typography and form styling are shared across the standalone themed UI.
- Component-level decoration remains in React rather than the theme sheets.
## Flow
- `DynamicTree.jsx` loads `styles/index.css` when its route module is included.
- `main.tsx` imports the same entry for independent React mounting.
- The entry composes supporting CSS for global defaults, theme variables, and utilities.
- The page shell consumes matching theme colors and typography.
- No navigation or React runtime state is implemented here.
## Integration
- Vite/Tailwind/PostCSS process CSS directives for the project bundle.
- `theme.css` exposes semantic colors and sizing via `@theme inline` mappings.
- `fonts.css` declares the font assets used by the app shell.
- Theme files remain local to Dynamic Tree, not shared with other subsidiaries.
- The common entry path is `dynamic-tree/styles/index.css`.
