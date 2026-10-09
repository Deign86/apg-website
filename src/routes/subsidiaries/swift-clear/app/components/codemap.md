# swift-clear/app/components/
## Responsibility
- Contains SwiftClear's generated Figma helper beneath `figma/`.
- `ImageWithFallback.tsx` wraps image rendering with a fallback display on load failure.
- Main site chrome and page-level shared components currently live in `app/App.tsx`.
- The folder contains no independent page state or route tree.
- It supplies reusable UI support to the themed app.
## Design
- Image helper uses React TypeScript and Tailwind utility classes.
- Success rendering forwards normal image properties and sizing from its caller.
- Error rendering displays a neutral surface and embedded SVG fallback.
- The parent styles entry provides theme tokens and utility CSS.
- The `figma` path marks generated support rather than a general component library.
## Flow
- `app/App.tsx` imports the named helper where images need failure handling.
- Caller supplies `src` and standard HTML image attributes.
- Its `onError` event updates local state and switches to fallback markup.
- Route and API state are unaffected by image errors.
- Caller remains responsible for selecting an image source.
## Integration
- App imports the helper through a relative `./components/figma` path.
- It relies on React and native browser image events only.
- `swift-clear/styles/index.css` supplies Tailwind utility rules.
- Screen imagery is stored under sibling `swift-clear/imports/` directories.
- Other subsidiary apps keep their own independent generated helpers.
