# swift-clear/
## Responsibility
- Contains SwiftClear's themed SPA mounted by `SwiftClear.jsx` within the APG enterprise shell.
- `app/App.tsx` implements the app and all page views.
- The app covers home, services, blogs/article details, careers/applications, and inquiry.
- `imports/` keeps the three brand PNGs; the app imports only the wordmark (the symbol and pattern use public WebP copies).
## Design
- Uses blue/white sanitation branding with deep navy and vivid blue accents, mostly as inline Tailwind values.
- There is no route stylesheet; utilities come from the corporate `src/styles/global.css` Tailwind build.
## Flow
- Served at `swiftclear.alphapremiergroup.com`; in-app paths remain `/subsidiaries/swiftclear/...`.
- `SwiftClear.jsx` toggles `swiftclear-active` on `<html>` and registers/unregisters its navigator with `EnterpriseNavContext`.
- App selects Home, Services, Blogs (with in-page article detail), Careers (with form), or Inquire.
- Inquire POSTs to `/api/inquire.php` with `form_started_at` and shows an error on failure.
- Blog bodies are rendered via `dangerouslySetInnerHTML` only after `DOMPurify.sanitize`.
## Integration
- Wrapper renders `<EnterpriseSeo slug="swiftclear" page={page}>` and wraps the app in `.swiftclear-scope`.
- Blogs load through `../blogApi.ts` (`/api/blogs.php?enterprise=swiftclear&summary=1`, body by slug) with module-level caching and bundled fallbacks.
- `useServices`/`useCareers('swiftclear')` supply services and positions; careers post to `/api/applicants.php`.
- `swiftclear-active` is consumed by `EnterpriseChatbot.css` to restyle the shared chatbot.
- The wordmark is imported from `imports/SwiftClearBlogs`; the logo symbol and background pattern are public WebP files (`/images/swiftclear-logo.webp`, `/images/swiftclear-bg-pattern.webp`).
