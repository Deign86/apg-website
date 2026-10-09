# swift-clear/imports/
## Responsibility
- Stores generated SwiftClear screens and their adjacent image assets.
- `SwiftClearFrontPage/` contains the intro screen design; `SwiftClearBlogs/` contains a blog mockup and shared imagery.
- `BlogsReadMore/` contains an article-detail mockup; the career screens are grouped separately.
- Every screen folder has a TSX component and local hashed image assets.
- The live production app is implemented in `app/App.tsx` rather than these generated views.
## Design
- Generated screens use white/blue surfaces, navy accents, oversized circles, and rounded forms.
- TSX outputs use fixed-position utility classes and inline SVG geometry.
- Hashed PNG filenames are imported relative to their screen modules.
- `SwiftClearBlogs` assets are also reused by the live app for branding and background images.
- `app/components/figma/ImageWithFallback.tsx` is a separate runtime helper.
## Flow
- `app/App.tsx` imports selected brand/background images from the generated folders.
- Screen modules export static visual compositions for direct mounting if needed.
- Vite resolves local images alongside the generated TSX source.
- Generated visual screens do not own blog, career, or route state.
- Page transitions and live data remain in the main app shell.
## Integration
- The five screen groupings are `SwiftClearFrontPage`, `SwiftClearBlogs`, `BlogsReadMore`, `SwiftClearCareers`, and `SwiftClearCareersForm`.
- App-level integration uses local relative asset imports.
- Static imports are bundled by Vite; public files may supplement generated assets.
- Blog APIs and career/service hooks are consumed by `app/App.tsx`, not these design folders.
- Binary images are summarized here rather than enumerated individually.
