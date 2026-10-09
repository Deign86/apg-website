# swift-clear/imports/
## Responsibility
- Stores the three SwiftClear brand images imported by `app/App.tsx`.
- `SwiftClearBlogs/` holds the logo-name and background-pattern images.
- `SwiftClearFrontPage/` holds the logo-symbol image.
## Design
- Filenames are Figma export hashes kept as-is so imports stay stable.
- `SwiftClearBlogs/8f0946c8...png` is actually JPEG data with a `.png` name; browsers sniff it correctly.
## Flow
- Vite fingerprints and bundles each image because `app/App.tsx` imports it.
## Integration
- `app/App.tsx` imports `SwiftClearBlogs/03bb49ec...png` (`logoNameImg`), `SwiftClearBlogs/8f0946c8...png` (`bgPattern`), and `SwiftClearFrontPage/a1454d6c...png` (`logoSymbol`).
