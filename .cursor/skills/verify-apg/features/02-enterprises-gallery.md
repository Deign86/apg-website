# Feature: Enterprises Gallery & Navigation

## Sub-features
1. **Logo Marquee / Strip:** Alpha Premier Realty, Swift Clear, Dynamic Tree, Luxe Prime, Alta Venture, Construction, 88 Prime.
2. **Interactive Enterprise Grid:** Dynamic cards displaying capabilities, industry, and direct subsidiary routing.
3. **Route transitions:** Clicking an enterprise card smoothly transitions into its dedicated subsidiary workspace.

## How to get to it (user POV)
Click "ENTERPRISES" in the top navbar or scroll down to "OUR ENTERPRISES" section on the homepage.

## Driving it with chrome_devtools
1. `navigate_page(pageId, type="url", url="http://localhost:3000/enterprises")`
2. `take_snapshot(pageId)` to observe enterprise listings.
3. Click any enterprise card (e.g. Alta Venture or Luxe Prime).
4. Verify URL changes to `http://localhost:3000/subsidiaries/<slug>` and enterprise branding loads.
5. `take_screenshot(pageId, filePath=".verification-evidence/02-enterprises-gallery.png")`

## Gotchas
- Some subsidiaries have dedicated custom shells (Alta Venture has its own navigation, others use EnterpriseShell).
