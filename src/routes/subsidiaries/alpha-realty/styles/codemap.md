# alpha-realty/styles/
## Responsibility
- Defines Alpha Realty's stylesheet entry point in `index.css`.
- Imports Google fonts, Tailwind CSS v4 with `source(none)`, and `tw-animate-css`.
- Tailwind scans only adjacent JS/TS/JSX/TSX app files through an `@source` directive.
- This directory holds Realty-specific theme styling, separate from sibling subsidiary themes.
- The top-level Realty route imports the entry stylesheet.
## Design
- Sans typography uses Plus Jakarta Sans; serif/display typography uses Cinzel and Playfair Display.
- `@theme` font tokens are re-declared under `html.alpha-realty-active`, since shared `:root` values are pinned by corporate CSS.
- `html.alpha-realty-active` scopes black surfaces and subtle gold ambient gradients to Realty.
- Scoped pseudo-elements create dotted and fine-grid backgrounds; scrollbars use restrained gold styling only while active.
- Scoped selectors hide the host `.site-header` and `.site-footer` while Realty is active.
## Flow
- `Realty.jsx` imports `index.css` as part of the route module.
- Its mount effect adds `alpha-realty-active` to `document.documentElement`.
- The wrapper removes that class at unmount, so theme vars and scrollbar styles stop applying elsewhere.
- Tailwind utilities are generated from the Realty app sources and used by its components.
- No route or runtime state logic is defined in CSS.
## Integration
- CSS is loaded through `Realty.jsx`, not through a standalone HTML document.
- Global theme selectors require the wrapper's matching `alpha-realty-active` class.
- Google Fonts are external imports with local generic fallback families.
- Tailwind v4 and `tw-animate-css` are processed by the project build.
- Scoped selectors avoid affecting sibling themed apps and the corporate site.
