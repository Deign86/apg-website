# luxe-prime/styles/
## Responsibility
- Defines the Luxe Prime CSS entry and supporting theme layers.
- `index.css` composes font, global, Tailwind, and `theme.css` imports.
- `theme.css` declares dark luxury palette tokens and Tailwind color aliases.
- `globals.css` provides base/reset rules, `fonts.css` provides typography, and `tailwind.css` connects utilities.
- Styling is maintained locally rather than shared with sibling subsidiaries.
## Design
- Root theme uses near-black background and warm ivory foreground.
- Page-level JSX adds gold accents and luxury component treatments.
- `@theme inline` maps semantic variables and radii to Tailwind tokens.
- Base typography and form rules are defined in the global layer.
- Most visual detail resides in React utility classes and inline styles.
## Flow
- `LuxePrime.jsx` imports `styles/index.css` when its route is loaded.
- The entry stylesheet loads its fonts, global rules, and theme variables.
- App components consume those defaults and Tailwind utilities when rendered.
- CSS does not own page selection or navigation state.
- Vite and Tailwind directives compile the local stylesheet set into the bundle.
## Integration
- The parent wrapper imports the single `luxe-prime/styles/index.css` entry.
- Project PostCSS/Tailwind tooling resolves theme and utility directives.
- External/local font declarations are handled by `fonts.css`.
- Practical route visibility is controlled by the wrapper importing the theme bundle.
- Luxe Prime stylesheet names and variables remain subsidiary-specific.
