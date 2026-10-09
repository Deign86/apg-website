# swift-clear/imports/SwiftClearCareers/
## Responsibility
- Holds the generated static SwiftClear careers screen design.
- `index.tsx` exports the `SwiftClearCareers` composition.
- Local hashed images provide its branding and background decoration.
- Position and Apply labels are placeholders in the generated visual.
- Live careers and application behavior is implemented in the app, not this folder.
## Design
- Uses white/pale-blue surfaces, vivid blue circular accents, and navy headings.
- Group helpers arrange repeated placeholder position rows and apply labels.
- The navigation and apply elements are generated fixed-position markup.
- All imagery is imported from local files within this folder.
- This is a Figma export rather than a functional production page.
## Flow
- A caller can mount the default component as a static screen design.
- It renders three placeholder opportunities with apply labels.
- It has no props, local state, submission behavior, or API calls.
- Production careers state and applications belong to `swift-clear/app/App.tsx`.
- Navigation is controlled by the main app shell, not this mockup.
## Integration
- TSX resolves local image assets through relative imports.
- Folder is part of SwiftClear's generated screen collection.
- Tailwind styles come from `swift-clear/styles/index.css` if mounted.
- Live opportunity data is fetched through the app's `useCareers` hook.
- `SwiftClearCareersForm/` contains a separate static form design.
