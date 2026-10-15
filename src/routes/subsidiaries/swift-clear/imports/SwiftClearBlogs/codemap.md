# swift-clear/imports/SwiftClearBlogs/
## Responsibility
- Holds two SwiftClear brand images; the live app imports only the wordmark.
- `03bb49ec...png` is the "Swift Clear" logo-name wordmark.
- `8f0946c8...png` is the decorative background pattern.
## Design
- `8f0946c8...png` holds JPEG data despite its `.png` extension.
## Flow
- The header/footer render the logo name; `BgDecor` draws the pattern from its public WebP copy (`/images/swiftclear-bg-pattern.webp`, 800px).
## Integration
- `swift-clear/app/App.tsx` imports only `03bb49ec...png` as `logoNameImg`; Vite bundles it. `8f0946c8...png` is a source file only.
