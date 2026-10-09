# subsidiaries/
## Responsibility
- Contains APG subsidiary page modules, themed app folders, and shared subsidiary components.
- The seven represented businesses are 88 Prime, Alpha Realty, Dynamic Tree, SwiftClear, Luxe Prime, Alta Venture, and Alpha Premier Construction.
- AlphaAssistant is an APG offering but has no dedicated module in this folder.
- `Prime88.jsx` renders the 88 Prime B2B supply site; `Realty.jsx` mounts the Alpha Realty app.
- `DynamicTree.jsx` and `SwiftClear.jsx` mount their themed page sets; `LuxePrime.jsx` mounts Luxe Prime.
- `AltaVenture.jsx` is the nested Alta Venture layout; `Construction.jsx` contains construction views.
## Design
- Subsidiaries maintain distinct visual systems rather than sharing a common page template.
- Realty uses `alpha-realty/styles/index.css`; Dynamic Tree, Luxe Prime, and SwiftClear use their own `styles/index.css` and theme layers.
- Alta Venture has `alta-venture.css` plus `av-header.css`, `av-footer.css`, and `av-chatbot.css`.
- Prime88 uses `Prime88.css`; Construction uses `alpha-construction.tailwind.css` and `alpha-construction.css`.
- Generated Figma UI is used by the Realty app and the Dynamic Tree, Luxe Prime, and SwiftClear `app/components/figma/ImageWithFallback.tsx` helpers.
- `Subsidiary.css` supplies legacy generic hero/content/CTA rules using shared accent/background variables.
## Flow
- The enterprise router chooses a subsidiary wrapper and renders its page experience.
- Realty, Dynamic Tree, and SwiftClear synchronize page state with `EnterpriseNavContext` and pass navigation to themed apps.
- Luxe Prime also reflects the current router path in its selected page.
- Alta Venture frames nested route content with shared header, footer, and chatbot; 88 Prime and Construction render their own views.
- The page sets cover home, services, blogs, careers, and supported inquiry interactions.
## Integration
- `EnterpriseInquire.tsx` reads per-enterprise data through `getEnterpriseConfig(location.pathname)` and posts to `/api/inquire.php`.
- It is shared by enterprise inquiry routes and imported directly by selected subsidiary page modules.
- Subsidiary apps use shared `useServices`, `useCareers`, and `useContent` hooks and APIs under `/api/`.
- `EnterpriseNavContext` exposes embedded navigation state/callbacks to the parent enterprise shell.
- Media is imported from local `imports/` folders or referenced from `public/assets`; binary files are not mapped individually.
