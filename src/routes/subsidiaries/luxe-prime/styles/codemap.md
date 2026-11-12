# luxe-prime/styles/
## Responsibility
- `index.css` is the Luxe Prime CSS entry: it imports `tailwind.css` and holds the page-wide rules.
- `tailwind.css` imports Tailwind (`source(none)`, scanning `../**/*.{js,ts,jsx,tsx}`) and `tw-animate-css`, and declares the `short:` variant (screens at least 1024 px wide and 700 px tall or less).
## Design
- Everything is scoped to `html.luxe-prime-active`:
  - Hanken Grotesk on `body`, antialiased;
  - the fixed background layer (`::before`): fine vertical gold pinstripes under a soft gold light from the top (Luxe's Art Deco texture; the Realty site uses film grain and a drifting light);
  - the fluid root font on short mouse screens (16 px down to 13 px), the fix for 125% Windows scaling.
- The Figma template theme (`theme.css`) and the empty `fonts.css` were removed: the redesigned components use none of its tokens.
## Flow
- `LuxePrime.jsx` imports `styles/index.css` when its route loads, and adds `luxe-prime-active` to `<html>` before the first paint.
## Integration
- Fonts (Newsreader and Hanken Grotesk, the Taste Skill's pairing) load once from `index.html`; `body` is Hanken Grotesk, antialiased.
