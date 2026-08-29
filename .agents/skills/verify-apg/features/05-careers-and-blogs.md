# Feature: Careers & Insights (Blogs)

## Sub-features
1. **Careers Directory:** Job openings across APG and subsidiaries with department and location badges.
2. **Job Application Modal:** "Apply Now" form with resume attachment and contact details.
3. **Corporate Blogs:** Article feed with category filtering, reading time, and rich reader modal.

## How to get to it (user POV)
Click "CAREERS" or "BLOGS" in the main navigation.

## Driving it with chrome_devtools
1. `navigate_page(pageId, type="url", url="http://localhost:3000/careers")`
2. `take_snapshot(pageId)` and verify job cards rendered.
3. `take_screenshot(pageId, filePath=".verification-evidence/05-careers.png")`
4. `navigate_page(pageId, type="url", url="http://localhost:3000/blogs")`
5. `take_snapshot(pageId)` and verify blog cards rendered.
6. `take_screenshot(pageId, filePath=".verification-evidence/05-blogs.png")`

## Gotchas
- Modal open/close states update the URL hash or query params on specific routes.
