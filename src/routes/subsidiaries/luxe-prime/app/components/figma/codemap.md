# luxe-prime/app/components/figma/
## Responsibility
- Hosts the Figma-generated `ImageWithFallback` helper for Luxe Prime.
- The helper adds a local error-rendering branch to ordinary HTML image props.
- This folder contains no page-specific layout or app state.
- App uses it for the Luxe Prime logo image.
- It does not own media data or route behavior.
## Design
- The utility keeps image failure state with React `useState`.
- Its normal branch preserves source, alt text, class, style, and other img attributes.
- The error branch renders an inline encoded SVG inside a neutral container.
- Tailwind utilities provide basic wrapper and alignment styling.
- This is an independent local helper rather than a shared cross-app module.
## Flow
- Callers pass standard `React.ImgHTMLAttributes<HTMLImageElement>` values.
- The `<img>` onError handler marks its source as failed.
- Failed state swaps the original image for fallback markup and preserves source metadata.
- Successful image loads remain unchanged and trigger no callback.
- The helper does not retry the URL or request another asset.
## Integration
- `luxe-prime/app/App.tsx` imports the named export from this directory.
- Only React and native browser image events are required.
- Parent `styles/index.css` supplies utility class styling.
- The caller selects `/assets/luxe-prime/...` logo source.
- Other subsidiaries do not share this helper.
