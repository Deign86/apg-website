# dynamic-tree/app/components/figma/
## Responsibility
- Contains the generated Dynamic Tree image-fallback helper.
- `ImageWithFallback.tsx` preserves regular image props while adding an error branch.
- It is the only utility in this directory, not a page or route component.
- The fallback graphic is embedded as encoded SVG data.
- The component does not own asset selection or retrieval.
## Design
- Implements a compact React TypeScript component with local failure state.
- Successful display is a normal HTML `<img>` with caller styling and attributes.
- Failed display uses a neutral wrapper and centered inline fallback graphic.
- Tailwind classes receive their CSS from the parent app styles.
- Its generated utility role is isolated from the primary page components.
## Flow
- Callers provide `src`, `alt`, and standard image props.
- The image's `onError` handler sets the failure state.
- A failed load switches to the fallback branch and retains source metadata.
- Successful load has no side effects or callback chain.
- No retries or network requests are initiated by the helper.
## Integration
- Dynamic Tree pages import the named export where images need error handling.
- The helper depends only on React and browser image events.
- `styles/index.css` provides the utility styling used for the fallback container.
- Images generally originate in Dynamic Tree's sibling `imports/` directory.
- Other themed apps have independent equivalents of this Figma helper.
