# alpha-realty/app/components/
## Responsibility
- Contains Alpha Realty's themed site chrome, sections, inquiry modal, and background components.
- `Header` and `Footer` provide standalone navigation and site links.
- `HomeSection` presents the introduction; `ListingsSection` renders property/service options.
- `BlogsSection` and `CareersSection` provide editorial and job content.
- `InquireModal`, `GoldWavesBackground`, and `AlphaPremierLogo` provide inquiry and shared visual support.
## Design
- React TypeScript modules use Motion and Tailwind classes for the premium page presentation.
- The parent Realty stylesheet provides black/gold fonts, background, and active-scope rules.
- Components are split by page/chrome role while App retains shared state.
- The `figma/` subfolder is a small generated utility area, not the primary component library.
- Props keep navigation and submission feedback controlled by the app shell.
## Flow
- App selects a section from the current tab and mounts it in the animated content region.
- Home links to services/listings, blogs, and generic or property-specific inquiry.
- Listings report property title and ID to open a prefilled inquiry modal.
- Careers reports successful applications upward; blogs owns its page display.
- Header/Footer change tabs or open inquiry when running standalone.
## Integration
- `app/App.tsx` imports components and owns their callback/state wiring.
- Local data contracts and fallback records live in `app/types.ts` and `app/data.ts`.
- Parent `Realty.jsx` manages `alpha-realty-active` and `EnterpriseNavContext`.
- `styles/index.css` supplies global scoped styling; components use utility classes for sections.
- Unified APG enterprise chrome replaces local Header/Footer in embedded mode.
