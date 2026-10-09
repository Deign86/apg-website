# dynamic-tree/app/components/figma/
## Responsibility
- Contains the generated Dynamic Tree image-fallback helper.
- `ImageWithFallback.tsx` preserves regular image props while adding an error branch.
- It is the only utility in this directory, not a page or route component.
- The fallback graphic is embedded as encoded SVG data.
- No Dynamic Tree module currently imports it, so it is unused.
## Design
- Implements a compact React TypeScript component with local failure state.
- Successful display is a normal HTML `<img>` with caller styling and attributes.
- Failed display uses a neutral wrapper and centered inline fallback graphic.
- Tailwind classes would receive their CSS from the parent app styles.
- Its generated utility role is isolated from the primary page components.
## Flow
- Callers would provide `src`, `alt`, and standard image props.
- The image's `onError` handler sets the failure state.
- A failed load switches to the fallback branch and retains the source as a data attribute.
- Successful load has no side effects or callback chain.
- No retries or network requests are initiated by the helper.
## Integration
- Pages render plain `<img>` elements with `@/imports` assets instead of this helper.
- The helper depends only on React and browser image events.
- `styles/index.css` (scoped to `dynamic-tree-active`) would style the fallback container.
- Luxe Prime's copy is the only one of these generated helpers in active use.
- SwiftClear keeps an independent, likewise unused, copy.
