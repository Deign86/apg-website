# swift-clear/imports/SwiftClearBlogs/
## Responsibility
- Holds the generated SwiftClear blog index mockup and shared branded image assets.
- `index.tsx` default-exports the static `SwiftClearBlogs` screen composition (not mounted anywhere).
- Local images provide brand marks, backgrounds, and article illustrations.
- The live production blog feed is data-driven in `app/App.tsx`.
- This directory functions as a design reference and a partial asset source for the app.
## Design
- The generated screen uses white/blue surfaces, circular gradients, and article blocks.
- `Group` helpers compose repeated feature/article rows from fixed-position elements.
- Generated `Nav` markup is visual content rather than live router navigation.
- Local hashed filenames are imported directly beside the screen module.
- `8f0946c8...png` holds JPEG data despite its `.png` extension.
## Flow
- The static component would render decoration, heading, and sample article groups.
- It accepts no article props and does not query the blog API.
- The main app imports `03bb49ec...png` (logo name) and `8f0946c8...png` (background pattern).
- The other article illustrations are referenced only by the unused mockup.
- Article selection, details, and navigation are controlled in `app/App.tsx`.
## Integration
- `swift-clear/app/App.tsx` imports two logo/background images from this directory.
- `index.tsx` resolves each design image through local relative imports.
- Vite bundles only the two app-imported assets.
- `/api/blogs.php?enterprise=swiftclear` is consumed by the app, not the static mockup.
- The remaining content images are local binaries summarized rather than listed.
