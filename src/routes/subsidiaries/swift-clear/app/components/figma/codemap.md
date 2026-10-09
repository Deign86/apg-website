# swift-clear/app/components/figma/
## Responsibility
- Holds SwiftClear's generated Figma image fallback helper.
- `ImageWithFallback` adds an error state to ordinary HTML image rendering.
- The helper is generic UI support, not a route or content component.
- The caller would control source, alt text, and display properties.
- It is not imported anywhere, so it is unused.
## Design
- Props use `React.ImgHTMLAttributes<HTMLImageElement>`.
- Local React state tracks whether image loading failed.
- On failure it renders a neutral wrapper with encoded SVG fallback artwork.
- The regular branch preserves caller-provided image values.
- Tailwind classes would rely on the global Tailwind build.
## Flow
- A caller would render the component with a source URL and normal image options.
- The source image's `onError` handler sets the failure flag.
- Failure switches the component output to the fallback branch.
- The original source is retained as a diagnostic data attribute.
- The utility does not retry the source or start a secondary request.
## Integration
- `swift-clear/app/App.tsx` does not import it; it uses plain `<img>` elements.
- Image assets in the app come from the local `imports/` tree.
- The helper adds no API, router, or external Figma runtime dependency.
- `styles/index.css` is not loaded by the route, so it cannot be relied on here.
- Equivalent helpers exist in Dynamic Tree (unused) and Luxe Prime (used).
