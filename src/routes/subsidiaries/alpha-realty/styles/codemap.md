# alpha-realty/styles/
## Responsibility
- Defines Alpha Realty's stylesheet entry point in `index.css`.
- Imports Google fonts, Tailwind CSS v4 with `source(none)`, and `tw-animate-css`.
- Tailwind scans only adjacent JS/TS/JSX/TSX app files through an `@source` directive.
- This directory holds Realty-specific theme styling, separate from sibling subsidiary themes.
- The top-level Realty route imports the entry stylesheet.
## Design
- Sans typography uses Plus Jakarta Sans; serif/display typography uses Playfair Display. On every Realty page (home, properties, services, blogs, careers) and the full-screen listing and article views, only `.font-display` headings use Playfair; their other headings use Plus Jakarta Sans.
- `@theme` font tokens are re-declared under `html.alpha-realty-active`, since shared `:root` values are pinned by corporate CSS.
- `html.alpha-realty-active` scopes black surfaces and subtle gold ambient gradients to Realty.
- Realty-only overrides of the shared site header and footer (`src/components/Enterprise*.css`):
  - the header's Inquire button becomes the gold gradient pill;
  - the footer uses Plus Jakarta Sans, a Playfair title, small-caps headings and a gold outline pill.
  - They use !important with more specific selectors, matching the shared rules.
- `.realty-drift`: the drifting gold light (`RealtyBackground`) is a CSS scroll-driven animation (`animation-timeline: scroll(root)`), one swing per screen (`--realty-screens`, alternating). It is still without support or with reduced motion.
- Realty-only overrides of the other shared pieces:
  - Phone menu: a full-screen dark sheet with a gold glow (no backdrop blur: under a 97% opaque sheet it was invisible but costly).
  - Cookie banner: its title is a sans small-caps label instead of Playfair capitals.
  - AI chatbot (`src/components/EnterpriseChatbot.css`):
    - Plus Jakarta Sans, a Playfair title, and a 24px panel with a gold glow;
    - a gold online dot; your own messages as dark text on gold, bot and agent messages as faint cards;
    - pill chips with a gold "Talk to live agent" pill, a pill message box and a gold send button;
    - live-agent banners in gold tones instead of red and green.
    - The shared file's touch sizes (40px buttons, a 16px message box so iOS does not zoom) are kept.
- Display scaling: on mouse devices from 1024 px wide and at most 900 px tall (Windows 125-150% scaling), the Realty root font size eases from 16 px down to 13 px with the screen height, so every rem size shrinks with it. The site header is in px; Realty's one-screen sections subtract 64px, not 4rem.
- `@custom-variant short` (at least 1024 px wide, at most 700 px tall) tightens listing cards (16:10 photos), the listing view's right column and the inquiry form.
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
