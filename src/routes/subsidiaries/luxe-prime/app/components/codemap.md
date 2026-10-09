# luxe-prime/app/components/
## Responsibility
- Contains Luxe Prime's Figma-generated image helper under `figma/`.
- `ImageWithFallback` wraps HTML image rendering with an error fallback.
- Main page and visual primitives (including Lightbox and carousels) live in `app/App.tsx` itself.
- This directory does not declare routes or page state.
- The subfolder separates image support from the large app module.
## Design
- Uses React TypeScript and an inline encoded SVG for fallback imagery.
- Successful rendering forwards the requested image source and standard properties.
- Failure rendering places the fallback graphic in a neutral container.
- Utility classes come from the Luxe Prime Tailwind build.
- The helper does not depend on the subsidiary's data or navigation state.
## Flow
- App imports the named helper from `components/figma/ImageWithFallback`.
- Callers supply normal image attributes, including source, alt, class, and style.
- An image error updates local state and switches to fallback markup.
- No retries, route changes, or API requests occur on error.
- Caller remains responsible for selecting and providing media URLs.
## Integration
- `app/App.tsx` uses the helper for the Alpha Premier and Luxe Prime logos.
- `luxe-prime/styles/index.css` supplies its Tailwind utility rules.
- Component relies on React and browser image events only.
- Logo sources are `/assets/luxe-prime/...` public paths chosen by app code.
- This is the only subsidiary copy of the generated helper that is actually imported.
