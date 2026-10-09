# swift-clear/styles/
## Responsibility
- Holds the SwiftClear stylesheet entry and supporting theme layers.
- `index.css` composes global, font, theme, and Tailwind stylesheets.
- `theme.css` defines semantic colors, radii, and dark-mode token overrides.
- `globals.css` and `fonts.css` supply baseline and typography rules.
- `tailwind.css` integrates utility styling used by app and generated views.
## Design
- Base semantic tokens are neutral; SwiftClear pages apply their blue brand palette in utilities.
- `@theme inline` maps semantic CSS variables to Tailwind color and radius names.
- Base heading, label, button, and input typography is declared in theme styles.
- Component visuals primarily use Tailwind classes and inline theme colors.
- Font declarations remain separate from global reset rules.
## Flow
- `main.tsx` imports `styles/index.css` for standalone app bootstrapping.
- The APG route wrapper mounts the same app within the host SPA context.
- `index.css` imports support layers for tokens, base styles, fonts, and utilities.
- App and generated UI components consume the resulting Tailwind classes.
- CSS contributes no route or page state logic.
## Integration
- Vite and Tailwind process the CSS directives into the subsidiary bundle.
- Theme tokens and defaults are shared by `swift-clear/app/App.tsx` and generated imports.
- Font rules and base resets are loaded through the entry stylesheet.
- This theme is maintained locally and is not shared with sibling subsidiaries.
- Common stylesheet entry is `swift-clear/styles/index.css`.
