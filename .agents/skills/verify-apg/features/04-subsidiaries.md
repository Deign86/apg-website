# Feature: Subsidiary Hubs & Dedicated Portals

## Sub-features
1. **Alta Venture Outsource:** Custom layout, Services tabs, Blogs, Careers, Inquire.
2. **Luxe Prime Realty:** High-end luxury properties showcase, search, virtual tours.
3. **88 Prime Real Estate:** Commercial & industrial real estate catalog.
4. **SwiftClear:** Facility services, sanitization, logistics support.
5. **Dynamic Tree:** Multimedia & creative agency services.
6. **Alpha Premier Construction:** Engineering, general contracting, build management.

## How to get to it (user POV)
Navigate directly to `/subsidiaries/<slug>` or through the Enterprises gallery.

## Driving it with chrome_devtools
1. `navigate_page(pageId, type="url", url="http://localhost:3000/subsidiaries/alta-venture")`
2. `take_snapshot(pageId)` to verify Alta Venture custom branding and navigation.
3. `take_screenshot(pageId, filePath=".verification-evidence/04-alta-venture.png")`
4. `navigate_page(pageId, type="url", url="http://localhost:3000/subsidiaries/luxe-prime")`
5. `take_screenshot(pageId, filePath=".verification-evidence/04-luxe-prime.png")`

## Gotchas
- Alta Venture uses a standalone navigation component; other subsidiaries use EnterpriseShell.
