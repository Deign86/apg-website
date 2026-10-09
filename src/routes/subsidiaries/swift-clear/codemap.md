# swift-clear/
## Responsibility
- Contains SwiftClear's themed SPA mounted by `SwiftClear.jsx` within the APG enterprise shell.
- `main.tsx` is the standalone bootstrap; `app/App.tsx` implements the app and its page views.
- The app covers home, services, blogs/article details, careers/applications, and inquiry actions.
- `imports/` stores generated Figma screens and local image assets.
- `styles/` contains theme, global, font, Tailwind, and entry CSS layers.
## Design
- Uses blue/white sanitation branding with deep navy and vivid blue accents.
- `styles/theme.css` defines semantic tokens; app UI uses Tailwind and Motion.
- `SwiftClearFrontPage` is the generated concentric-circle opening screen design.
- Other generated screens are `SwiftClearBlogs`, `BlogsReadMore`, `SwiftClearCareers`, and `SwiftClearCareersForm`.
- App-level generated image support lives at `app/components/figma/ImageWithFallback.tsx`.
## Flow
- `SwiftClear.jsx` manages page state, scroll/AOS refresh, and enterprise navigation registration.
- App selects Home, Services, Blogs, Careers, or Inquire and handles selected article state.
- Blogs load from `/api/blogs.php?enterprise=swiftclear` with local fallbacks.
- Services and career records use APG hooks with fallback data; inquiry/application actions are app-managed.
- The standalone entry separately creates a React root and mounts the app.
## Integration
- Wrapper imports the app, toggles `swiftclear-active`, and syncs `EnterpriseNavContext`.
- `main.tsx` loads `styles/index.css` for standalone use.
- The app uses `/api/blogs.php` and shared `useServices`/`useCareers` hooks.
- Generated local assets are imported from screen folders; public assets supplement them.
- The style entry composes `theme.css`, `globals.css`, `fonts.css`, and `tailwind.css`.
