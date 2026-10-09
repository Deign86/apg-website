# swift-clear/imports/SwiftClearBlogs/
## Responsibility
- Holds the generated SwiftClear blog index mockup and shared branded PNG assets.
- `index.tsx` exports the static `SwiftClearBlogs` screen composition.
- Local images provide brand marks, backgrounds, and article illustrations.
- The live production blog feed is data-driven in `app/App.tsx`.
- This directory functions as a design reference and asset source for the app.
## Design
- The generated screen uses white/blue surfaces, circular gradients, and article blocks.
- `Group` helpers compose repeated feature/article rows from fixed-position elements.
- Generated `Nav` markup is visual content rather than live router navigation.
- Local hashed filenames are imported directly beside the screen module.
- Placeholder copy is included in the exported visual mockup.
## Flow
- The static component renders its decoration, heading, and sample article groups.
- It accepts no article props and does not query the blog API.
- The main app imports select logo and background PNG assets from this folder.
- Actual article selection and details are controlled in `app/App.tsx`.
- Page navigation is handled by the live app rather than this mockup.
## Integration
- `swift-clear/app/App.tsx` imports logo/background media from this directory.
- `index.tsx` resolves each design image through local relative imports.
- Vite bundles those assets and Tailwind supplies utilities if the screen is mounted.
- `/api/blogs.php?enterprise=swiftclear` is consumed by the app, not the static mockup.
- The remaining content images are local binaries summarized rather than listed.
