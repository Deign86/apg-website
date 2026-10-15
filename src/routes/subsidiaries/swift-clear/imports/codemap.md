# swift-clear/imports/
## Responsibility
- Stores the three SwiftClear brand images; `app/App.tsx` imports only the wordmark.
- `SwiftClearBlogs/` holds the logo-name and background-pattern images.
- `SwiftClearFrontPage/` holds the logo-symbol image.
## Design
- Filenames are Figma export hashes kept as-is so imports stay stable.
- `SwiftClearBlogs/8f0946c8...png` is actually JPEG data with a `.png` name; browsers sniff it correctly.
## Flow
- Vite fingerprints and bundles the imported wordmark; the other two are not bundled.
## Integration
- `app/App.tsx` imports only `SwiftClearBlogs/03bb49ec...png` (`logoNameImg`); `bgPattern` and `logoSymbol` now use the smaller public webp copies, so the other two PNGs are source files only.
