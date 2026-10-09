# swift-clear/imports/SwiftClearCareers/
## Responsibility
- Holds the generated static SwiftClear careers screen design.
- `index.tsx` default-exports the `SwiftClearCareers` composition.
- Local hashed images provide its branding and background decoration.
- Position and Apply labels are placeholders in the generated visual.
- Nothing imports this folder; live careers behavior is implemented in the app.
## Design
- Uses white/pale-blue surfaces, vivid blue circular accents, and navy headings.
- Group helpers arrange repeated placeholder position rows and apply labels.
- The navigation and apply elements are generated fixed-position markup.
- All imagery is imported from local files that duplicate `SwiftClearBlogs/` assets.
- This is a Figma export rather than a functional production page.
## Flow
- A caller could mount the default component as a static screen design; none does.
- It renders three placeholder opportunities with apply labels.
- It has no props, local state, submission behavior, or API calls.
- Production careers state and applications belong to `CareersPage`/`CareersFormPage` in `app/App.tsx`.
- Navigation is controlled by the main app shell, not this mockup.
## Integration
- TSX resolves local image assets through relative imports.
- Folder is part of SwiftClear's unused generated screen collection.
- Tailwind classes would need a build that scans this folder if mounted.
- Live opportunity data comes from the app's `useCareers('swiftclear')` hook.
- Live applications post to `/api/applicants.php`; `SwiftClearCareersForm/` is a separate static form design.
