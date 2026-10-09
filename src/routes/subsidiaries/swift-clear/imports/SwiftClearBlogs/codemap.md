# swift-clear/imports/SwiftClearBlogs/
## Responsibility
- Holds two SwiftClear brand images used by the live app.
- `03bb49ec...png` is the "Swift Clear" logo-name wordmark.
- `8f0946c8...png` is the decorative background pattern.
## Design
- `8f0946c8...png` holds JPEG data despite its `.png` extension.
## Flow
- `BgDecor` renders the background pattern; the header/footer render the logo name.
## Integration
- `swift-clear/app/App.tsx` imports both files as `logoNameImg` and `bgPattern`; Vite bundles them.
