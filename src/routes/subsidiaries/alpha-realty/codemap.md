# alpha-realty/
## Responsibility
- Holds Alpha Realty's themed application mounted by the top-level `Realty.jsx` route wrapper.
- `app/App.tsx` composes site chrome, page sections, inquiry modal, and background effects.
- `app/components/` contains page and chrome components; `styles/index.css` is the theme entry.
- The site presents property listings, corporate blogs, careers, and inquiry interaction.
- This folder supplies the UI layer rather than the enterprise route definition.
## Design
- `styles/index.css` loads Tailwind v4, animation utilities, and Cinzel/Plus Jakarta Sans/Playfair Display fonts.
- Scoped `html.alpha-realty-active` selectors establish the black-and-gold visual system.
- `GoldWavesBackground` and `AlphaPremierLogo` provide reusable themed assets.
- Components are React TypeScript UI; this directory is not a generated static page bundle.
- Utility classes and the scoped stylesheet compose the individual sections.
## Flow
- `Realty.jsx` passes `page` and `setPage` props after registering enterprise navigation.
- The app uses parent page props when embedded and local tab state when standalone.
- Home and Listings callbacks open `InquireModal`, optionally prefilled for a selected property.
- Page changes select Home, Services/Listings, Blogs, or Careers and scroll to the top.
- Successful inquiry or job application actions trigger timed feedback toasts.
## Integration
- `data.ts` maps shared `companyData` blog/job records into local `types.ts` models.
- Page components own page-specific content/API work and receive callbacks from App.
- `Realty.jsx` imports the CSS entry, scopes the document class, and connects `EnterpriseNavContext`.
- App suppresses its Header/Footer when the parent APG enterprise shell supplies unified chrome.
- Assets and API integrations are delegated to the section and modal components.
