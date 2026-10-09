# swift-clear/
## Responsibility
- Contains SwiftClear's themed SPA mounted by `SwiftClear.jsx` within the APG enterprise shell.
- `app/App.tsx` implements the app and all page views.
- The app covers home, services, blogs/article details, careers/applications, and inquiry.
- `imports/` keeps only the three brand images the app imports.
## Design
- Uses blue/white sanitation branding with deep navy and vivid blue accents, mostly as inline Tailwind values.
- There is no route stylesheet; utilities come from the corporate `src/styles/global.css` Tailwind build.
## Flow
- Served at `swiftclear.alphapremiergroup.com`; in-app paths remain `/subsidiaries/swiftclear/...`.
- `SwiftClear.jsx` toggles `swiftclear-active` on `<html>`, refreshes AOS, and registers/unregisters its navigator with `EnterpriseNavContext`.
- App selects Home, Services, Blogs (with in-page article detail), Careers (with form), or Inquire.
- Inquire POSTs to `/api/inquire.php` with `form_started_at` and shows an error on failure.
- Blog bodies are rendered via `dangerouslySetInnerHTML` only after `DOMPurify.sanitize`.
## Integration
- Wrapper renders `<EnterpriseSeo slug="swiftclear" page={page}>` and wraps the app in `.swiftclear-scope`.
- Blogs load from `/api/blogs.php?enterprise=swiftclear` with module-level caching and bundled fallbacks.
- `useServices`/`useCareers('swiftclear')` supply services and positions; careers post to `/api/applicants.php`.
- `swiftclear-active` is consumed by `EnterpriseChatbot.css` to restyle the shared chatbot.
- Logo and background images are imported from `imports/SwiftClearBlogs` and `imports/SwiftClearFrontPage`.
