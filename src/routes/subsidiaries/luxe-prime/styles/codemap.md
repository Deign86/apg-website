# luxe-prime/styles/
## Responsibility
- Defines the Luxe Prime CSS entry and supporting theme layers.
- `index.css` composes `fonts.css`, `tailwind.css`, and `theme.css`.
- `theme.css` declares dark luxury palette tokens, Tailwind color aliases, and base typography.
- `fonts.css` imports Cinzel/Cormorant Garamond/Montserrat; `tailwind.css` imports Tailwind (`source(none)`) and `tw-animate-css`.
- `globals.css` is empty and not imported by the entry.
## Design
- Root theme uses near-black background and warm ivory foreground.
- Tokens and `@layer base` rules are declared under `:root.luxe-prime-active` so they never leak to other sites.
- `@theme inline` maps semantic variables and radii to Tailwind tokens.
- Page-level JSX adds gold accents and luxury component treatments.
- Most visual detail resides in React utility classes and inline styles.
## Flow
- `LuxePrime.jsx` imports `styles/index.css` when its route is loaded.
- Its layout effect adds `luxe-prime-active` to `<html>` before first paint and removes it on unmount.
- `tailwind.css` scans `../**/*.{js,ts,jsx,tsx}` for utilities.
- App components consume those tokens and Tailwind utilities when rendered.
- CSS does not own page selection or navigation state.
## Integration
- The parent wrapper imports the single `luxe-prime/styles/index.css` entry.
- Project PostCSS/Tailwind tooling resolves theme and utility directives.
- Fonts load from Google Fonts via `fonts.css`.
- Theme visibility is gated by the wrapper-managed `luxe-prime-active` class.
- Luxe Prime stylesheet names and variables remain subsidiary-specific.
