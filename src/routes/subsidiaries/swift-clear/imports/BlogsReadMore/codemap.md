# swift-clear/imports/BlogsReadMore/
## Responsibility
- Contains a generated article-detail screen design for SwiftClear blogs.
- `index.tsx` default-exports the static `BlogsReadMore` composition.
- Local hashed PNGs provide brand and decorative imagery.
- It is a Figma visual reference, not the live article-detail implementation.
- No module imports it, so the screen and its images are unused.
## Design
- Uses white/blue surfaces, circular gradients, and large long-form article blocks.
- `Group` and `Group1` assemble branding and article hero elements.
- `Nav` displays generated navigation markup rather than router links.
- Fixed absolute coordinates and inline SVG indicate exported screen geometry.
- Placeholder title and body text are static component content.
## Flow
- A consumer could mount the default component as a static screen; none does.
- The component renders local imagery, decoration, heading, and body copy.
- It accepts no content props and performs no API request.
- There is no route navigation or selection flow in the component.
- Live blog detail behavior is `BlogDetailPage` in `swift-clear/app/App.tsx`.
## Integration
- Local images are imported from sibling files within this directory.
- Its images duplicate files in `SwiftClearBlogs/`, which the app imports instead.
- Tailwind classes would need a Tailwind build that scans this folder if mounted.
- Production articles come from `/api/blogs.php?enterprise=swiftclear` and are DOMPurify-sanitized in the app.
- No backend or external service dependency is present here.
