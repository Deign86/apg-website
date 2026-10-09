# swift-clear/imports/
## Responsibility
- Stores generated SwiftClear screens and their adjacent image assets.
- `SwiftClearFrontPage/` contains the intro screen design; `SwiftClearBlogs/` contains a blog mockup and shared imagery.
- `BlogsReadMore/` contains an article-detail mockup; `SwiftClearCareers/` and `SwiftClearCareersForm/` hold career mockups.
- Every screen folder has a default-export TSX component and local hashed image assets.
- None of the TSX screens is imported; the live app is implemented in `app/App.tsx`.
## Design
- Generated screens use white/blue surfaces, navy accents, oversized circles, and rounded forms.
- TSX outputs use fixed-position utility classes and inline SVG geometry.
- Hashed filenames are duplicated across folders; `8f0946c8...png` is actually JPEG data with a `.png` name.
- Only three assets are used live: `SwiftClearBlogs/03bb49ec...png`, `SwiftClearBlogs/8f0946c8...png`, and `SwiftClearFrontPage/a1454d6c...png`.
- `app/components/figma/ImageWithFallback.tsx` is a separate (also unused) runtime helper.
## Flow
- `app/App.tsx` imports the logo-name, background-pattern, and logo-symbol images from these folders.
- Screen modules export static visual compositions that nothing mounts.
- Vite bundles only the imported images; the remaining files do not ship.
- Generated visual screens do not own blog, career, or route state.
- Page transitions and live data remain in the main app shell.
## Integration
- The five screen groupings are `SwiftClearFrontPage`, `SwiftClearBlogs`, `BlogsReadMore`, `SwiftClearCareers`, and `SwiftClearCareersForm`.
- App-level integration uses local relative asset imports (`../imports/...`).
- Remaining PNGs and all five TSX screens are unreferenced (unused) design artifacts.
- Blog APIs and career/service hooks are consumed by `app/App.tsx`, not these design folders.
- Binary images are summarized here rather than enumerated individually.
