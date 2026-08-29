# Feature: Homepage & Brand Experience

## Sub-features
1. **Header / Navbar:** Logo, navigation buttons (HOME, ENTERPRISES, BLOGS, CAREERS), INQUIRE NOW button.
2. **Hero Section:** Ambient video, animated headline "WHERE CONNECTIONS GROW INTO SUCCESS", conglomerate overview.
3. **Pillars & Leadership:** 4 integrated divisions, President & CEO profile card, mission/vision.
4. **Interactive Assistant:** AI Floating Concierge drawer trigger.

## How to get to it (user POV)
Navigate to `http://localhost:3000/` directly in any standard browser.

## Driving it with chrome_devtools
1. `navigate_page(pageId, type="url", url="http://localhost:3000/")`
2. `take_snapshot(pageId)` to locate navbar items and hero headings.
3. Verify header elements:
   - Button "HOME"
   - Button "ENTERPRISES"
   - Button "BLOGS"
   - Button "CAREERS"
   - Button "INQUIRE NOW"
4. `take_screenshot(pageId, filePath=".verification-evidence/01-homepage-hero.png")`

## Gotchas
- Video backdrop may take a moment to stream; DOM elements render immediately.
