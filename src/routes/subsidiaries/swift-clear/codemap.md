# swift-clear/
## Responsibility
- Contains SwiftClear's themed SPA mounted by `SwiftClear.jsx` within the APG enterprise shell.
- `app/App.tsx` implements the app and all page views; `main.tsx` is an orphan standalone bootstrap.
- The app covers home, services, blogs/article details, careers/applications, and inquiry.
- `imports/` stores generated Figma screens; only three of its PNGs are imported by the app.
- `styles/` contains theme, font, Tailwind, and entry CSS layers that the route does not load.
## Design
- Uses blue/white sanitation branding with deep navy and vivid blue accents, mostly as inline Tailwind values.
- `SwiftClear.jsx` does not import `styles/index.css`; utilities come from the corporate `src/styles/global.css` Tailwind build.
- `styles/` is therefore unused in production (only `main.tsx`, itself unreferenced, imports it).
- Generated screen modules (`SwiftClearFrontPage`, `SwiftClearBlogs`, `BlogsReadMore`, `SwiftClearCareers`, `SwiftClearCareersForm`) are not mounted.
- `app/components/figma/ImageWithFallback.tsx` exists but is not imported.
## Flow
- Served at `swiftclear.alphapremiergroup.com`; in-app paths remain `/subsidiaries/swiftclear/...`.
- `SwiftClear.jsx` toggles `swiftclear-active` on `<html>`, refreshes AOS, and registers/unregisters its navigator with `EnterpriseNavContext`.
- App selects Home, Services, Blogs (with in-page article detail), Careers (with form), or Inquire.
- Inquire now POSTs to `/api/inquire.php` with `form_started_at` and shows an error on failure.
- Blog bodies are rendered via `dangerouslySetInnerHTML` only after `DOMPurify.sanitize`.
## Integration
- Wrapper renders `<EnterpriseSeo slug="swiftclear" page={page}>` and wraps the app in `.swiftclear-scope`.
- Blogs load from `/api/blogs.php?enterprise=swiftclear` with module-level caching and bundled fallbacks.
- `useServices`/`useCareers('swiftclear')` supply services and positions; careers post to `/api/applicants.php`.
- `swiftclear-active` is consumed by `EnterpriseChatbot.css` to restyle the shared chatbot.
- Logo and background PNGs are imported from `imports/SwiftClearBlogs` and `imports/SwiftClearFrontPage`.
