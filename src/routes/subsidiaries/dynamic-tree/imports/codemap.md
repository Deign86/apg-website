# dynamic-tree/imports/
## Responsibility
- Holds a local copy of Dynamic Tree brand logos, model photography, and design screenshots.
- Files include `Dynamic_Tree_Logo*.png`, `model1-9.jpg`, `image*.png`, and dated `Screenshot_*.png` captures.
- No module imports from this folder; it is unused by the build.
- The live pages import the same filenames from `src/imports` through the `@/imports/...` alias.
- It contains no TSX screen modules, unlike SwiftClear's generated `imports/` folders.
## Design
- Assets are plain binaries with no accompanying components or metadata.
- Model photos, screenshots, and `image*.png` are byte-identical to their `src/imports` counterparts.
- The two logo PNGs here differ in content from the `src/imports` versions of the same name.
- Screenshots and `image*.png` are not imported by any source file in either location.
- Binary files are summarized here rather than mapped individually.
## Flow
- Nothing resolves paths into this directory at build or runtime.
- Vite only bundles files that are imported, so these assets do not ship.
- Page imagery flows from `src/imports` into Home, Services, Blogs, Careers, and Inquire.
- The SEO logo uses the public `/assets/dynamic-tree/Dynamic_Tree_Logo-1.png` path instead.
- No data fetching or state is associated with these files.
## Integration
- `@` resolves to `src/` in `vite.config`, so `@/imports` never points here.
- Removing or consolidating this folder would not affect current pages.
- Sibling `app/` and `styles/` code has no reference to `../imports`.
- Public favicons/logos are served from `public/assets/...`.
- Treat this folder as an unused asset archive until it is wired in or removed.
