# styles/

## Responsibility
Global baseline CSS, APG palette and font tokens, document reset, scrollbar treatment, and shared legacy utility selectors.

## Design
- `global.css` defines root custom properties for the corporate color palette (`--primary`, `--accent`, `--accent-2`, `--light`, `--dark`, `--bg-dark`, `--card-bg`, `--red-bg`) and shared UI/display font stacks for APG and enterprise brands.
- Registers the `GoodTimes` font face from `/fonts/GoodTimes-Regular.otf`.
- Applies scrollbar colors, global box sizing, smooth document scrolling, horizontal overflow suppression, body typography/background/foreground defaults, and `.container` / `.section-title` utilities.
- Page views primarily compose Tailwind classes; this file supplies the document-wide baseline and CSS variables rather than page-specific component styles.

## Flow
- App stylesheet import loads `global.css` into the Vite SPA → `:root` tokens and font-face are available to all descendants → browser reset/body rules establish baseline rendering → shared selectors and variables can be used by components alongside utility classes.
- No network fetch, application state, API endpoint, context provider, or permissions logic is defined in this folder.

## Integration
- Shared root font stacks are `--font-ui-primary` and `--font-nav`; enterprise display variables include APG, realty, Luxe, Dynamic Tree, construction, and BPO families.
- Global CSS supports all route-level views and shared shells consistently; component-level interactive data flow remains in `src/views`, `src/hooks`, and `src/context`.
