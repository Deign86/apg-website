# swift-clear/imports/SwiftClearFrontPage/
## Responsibility
- Contains the generated SwiftClear intro/landing screen design.
- `index.tsx` exports `SwiftClearFrontPage`, a visual logo/brand composition.
- A hashed local PNG supplies the SwiftClear logo mark.
- Decorative circles and screen elements are created directly in the component.
- Functional entry navigation lives in the production `app/App.tsx`.
## Design
- Layered blue circles form the branded generated screen backdrop.
- Centered content includes logo, “It Matters” statement, and ENTER text.
- `Group`, `Group1`, and `Group2` organize generated UI and image content.
- Fixed absolute positioning and inline SVG match the Figma export format.
- The palette and logo imagery align with SwiftClear's blue identity.
## Flow
- A caller mounts the default component as a static intro screen.
- It renders the logo and generated display elements without props.
- The generated ENTER link has no app navigation callback.
- Page transitions and enter behavior are owned by `app/App.tsx`.
- No data fetching or form submission occurs here.
## Integration
- `index.tsx` imports its hashed PNG from the same folder.
- Vite bundles the asset and supplies its resolved URL at runtime.
- Parent `styles/index.css` supplies Tailwind utilities if this mockup is mounted.
- The live app imports this screen's logo asset family in its app code.
- `SwiftClear.jsx` remains the APG route wrapper for the actual themed page set.
