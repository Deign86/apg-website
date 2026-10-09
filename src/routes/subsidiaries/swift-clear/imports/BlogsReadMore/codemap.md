# swift-clear/imports/BlogsReadMore/
## Responsibility
- Contains a generated article-detail screen design for SwiftClear blogs.
- `index.tsx` exports the static `BlogsReadMore` composition.
- Local hashed PNGs provide brand and decorative imagery.
- It is a Figma visual reference, not the live article-detail implementation.
- It does not fetch articles or keep selected article state.
## Design
- Uses white/blue surfaces, circular gradients, and large long-form article blocks.
- `Group` and `Group1` assemble branding and article hero elements.
- `Nav` displays generated navigation markup rather than router links.
- Fixed absolute coordinates and inline SVG indicate exported screen geometry.
- Placeholder title and body text are static component content.
## Flow
- Consumers mount the default component as a static screen.
- The component renders local imagery, decoration, heading, and body copy.
- It accepts no content props and performs no API request.
- There is no route navigation or selection flow in the component.
- Live blog detail behavior is in `swift-clear/app/App.tsx`.
## Integration
- Local images are imported from sibling files within this directory.
- The screen is grouped under the SwiftClear generated `imports/` collection.
- Tailwind classes require the parent SwiftClear CSS build when mounted.
- Production articles come from the app's blog feed and API integration.
- No backend or external service dependency is present here.
