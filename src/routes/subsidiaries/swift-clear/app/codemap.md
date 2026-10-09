# swift-clear/app/
## Responsibility
- Implements SwiftClear's page switcher, themed UI, services, blog feed/details, and careers.
- `App.tsx` contains shared elements and Home, Services, Blogs, BlogDetail, Careers, and Inquire views.
- Blog types, caching/loading, and offline fallback rows are maintained in the app module.
- `components/` contains the Figma image-fallback utility.
- The standalone `main.tsx` entry is one directory above this app folder.
## Design
- Pages use a blue/white palette with Tailwind utilities and Motion effects.
- Generated assets provide brand images, while shared app helpers provide decor and navigation.
- App currently defines its shared navbar and sanitation particles alongside page views.
- `ImageWithFallback` is a local generated import helper for image failures.
- Theme tokens and fonts come from `../styles/index.css`.
## Flow
- Parent props control the current page and provide navigation callbacks in embedded mode.
- Home and Services use `useServices`; Careers uses `useCareers` and career application UI.
- `useBlogs` queries the SwiftClear API, caching results and retaining bundled offline articles.
- Selecting a blog opens detail content; related/back interactions update selected article state.
- Inquiry actions use the parent callback or standalone router navigation.
## Integration
- App imports logos and background images from `../imports/SwiftClearBlogs` and `SwiftClearFrontPage`.
- Blog data comes from `/api/blogs.php?enterprise=swiftclear`; shared content hooks use `@/hooks`.
- `SwiftClear.jsx` owns enterprise context/page synchronization; `main.tsx` owns standalone mounting.
- `styles/index.css` supplies theme, global, font, and Tailwind rules.
- `BlogRecord` is the local content contract for feed and detail rendering.
