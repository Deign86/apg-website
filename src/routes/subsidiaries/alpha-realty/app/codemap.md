# alpha-realty/app/
## Responsibility
- Implements the Realty app shell and shared page/modal/toast state.
- `App.tsx` coordinates Header, Footer, HomeSection, ListingsSection, BlogsSection, CareersSection, and InquireModal.
- `types.ts` defines blog, job-opening, and inquiry data shapes.
- `data.ts` maps corporate `companyData` into local offline blog and career fallbacks.
- `components/` contains the themed chrome, background, and page section modules.
## Design
- Uses React, TypeScript, Motion, Tailwind utilities, and Lucide icons.
- Gold/black palette and typography come from the parent `styles/index.css` theme.
- App owns cross-page state, with focused components rendering section content.
- `page` and `setPage` props let the app embed in APG enterprise navigation.
- `vite-env.d.ts` provides local Vite typing support only.
## Flow
- Embedded page props control the active tab; standalone mode uses local tab state.
- The active tab selects the section mounted in the animated main area.
- Property inquiries set prefill data and open the modal; generic inquiry clears prefill.
- The `inquire` tab value also opens the modal; closing clears modal selection.
- Inquiry and job success callbacks display a timed toast with the relevant message.
## Integration
- Child components receive navigation, property selection, and application completion callbacks.
- `data.ts` consumes `@/data/companyData`; its record types are declared in `types.ts`.
- `Realty.jsx` provides `EnterpriseNavContext` wiring and imports app styling.
- Embedded mode omits local Header/Footer in favor of the enterprise shell.
- Inquiry and content sections own their specific form/API integration.
