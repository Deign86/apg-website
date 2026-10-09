# alpha-realty/app/
## Responsibility
- Implements the Realty app shell and shared page/modal/toast state.
- `App.tsx` coordinates HomeSection, ListingsSection, BlogsSection, CareersSection, InquireModal, and GoldWavesBackground.
- `types.ts` defines blog, job-opening, and inquiry data shapes.
- `data.ts` maps corporate `companyData` into local offline blog and career fallbacks.
- `components/` contains the themed background, logo, inquiry modal, and page section modules.
## Design
- Uses React, TypeScript, Motion, Tailwind utilities, and Lucide icons.
- Gold/black palette and typography come from the parent `styles/index.css` theme.
- App owns cross-page state, with focused components rendering section content.
- `page` and `setPage` are required props supplied by `Realty.jsx` (no standalone mode).
## Flow
- `Realty.jsx` page state controls the active tab.
- The active tab selects the section mounted in the animated main area.
- Home/Listings inquiries set a prefilled property title and open the modal.
- The `inquire` tab value also opens the modal; closing clears modal selection.
- Inquiry and job success callbacks display a 5-second toast with the relevant message.
## Integration
- Child components receive navigation, property selection, and application completion callbacks.
- `data.ts` consumes `@/data/companyData`; its record types are declared in `types.ts`.
- `Realty.jsx` provides `EnterpriseNavContext` wiring, `EnterpriseSeo`, the scope class, and imports app styling.
- Header/footer chrome comes from the enterprise shell; the app has no local Header/Footer.
- Inquiry (`/api/inquire.php`), careers (`/api/applicants.php`), and blogs (`/api/blogs.php`) are owned by their components.
