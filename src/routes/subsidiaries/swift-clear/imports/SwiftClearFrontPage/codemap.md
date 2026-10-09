# swift-clear/imports/SwiftClearFrontPage/
## Responsibility
- Contains the generated SwiftClear intro/landing screen design.
- `index.tsx` default-exports `SwiftClearFrontPage`, a visual logo/brand composition.
- A hashed local PNG (`a1454d6c...png`) supplies the SwiftClear logo mark.
- Decorative circles and screen elements are created directly in the component.
- The TSX screen is not imported; the app has its own `FrontPage` view.
## Design
- Layered blue circles form the branded generated screen backdrop.
- Centered content includes logo, “It Matters” statement, and ENTER text.
- `Group`, `Group1`, and `Group2` organize generated UI and image content.
- Fixed absolute positioning and inline SVG match the Figma export format.
- The palette and logo imagery align with SwiftClear's blue identity.
## Flow
- A caller could mount the default component as a static intro screen; none does.
- It renders the logo and generated display elements without props.
- The generated ENTER link has no app navigation callback.
- The live `FrontPage` exists only on the standalone router path; embedded mode starts at Home.
- No data fetching or form submission occurs here.
## Integration
- `index.tsx` imports its hashed PNG from the same folder.
- `swift-clear/app/App.tsx` imports that same PNG directly as `logoSymbol`.
- Vite bundles the asset because the app imports it.
- Tailwind classes would need a build that scans this folder if mounted.
- `SwiftClear.jsx` remains the APG route wrapper for the actual themed page set.
