# Feature: Admin Audit & Management Portal

## Sub-features
1. **Admin Authentication:** Protected route guards requiring administrative access.
2. **Dashboard Metrics:** Inquiries count, active listings, blog management, career postings.
3. **Audit Log:** Comprehensive system verification and data logging.

## How to get to it (user POV)
Navigate to `http://localhost:3000/admin`.

## Driving it with chrome_devtools
1. `navigate_page(pageId, type="url", url="http://localhost:3000/admin")`
2. `take_snapshot(pageId)` to observe admin layout / login view.
3. `take_screenshot(pageId, filePath=".verification-evidence/06-admin-portal.png")`

## Gotchas
- Unauthenticated sessions redirect to login view.
