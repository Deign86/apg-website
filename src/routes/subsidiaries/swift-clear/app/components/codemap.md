# swift-clear/app/components/
## Responsibility
- Contains SwiftClear's generated Figma helper beneath `figma/`.
- `ImageWithFallback.tsx` wraps image rendering with a fallback display on load failure.
- Main site chrome and page-level shared components live in `app/App.tsx`.
- The folder contains no independent page state or route tree.
- Nothing in SwiftClear imports from this folder, so it is currently unused.
## Design
- Image helper uses React TypeScript and Tailwind utility classes.
- Success rendering forwards normal image properties and sizing from its caller.
- Error rendering displays a neutral surface and embedded SVG fallback.
- Utility CSS would come from the global Tailwind build, as SwiftClear's own styles are not loaded.
- The `figma` path marks generated support rather than a general component library.
## Flow
- `app/App.tsx` renders plain `<img>` elements instead of this helper.
- A caller would supply `src` and standard HTML image attributes.
- Its `onError` event updates local state and switches to fallback markup.
- Route and API state are unaffected by image errors.
- Caller remains responsible for selecting an image source.
## Integration
- No import path currently references `./components/figma`.
- It relies on React and native browser image events only.
- Screen imagery is stored under sibling `swift-clear/imports/` directories.
- Only Luxe Prime actively imports its copy of this generated helper.
- Safe to remove or wire in without affecting current pages.
