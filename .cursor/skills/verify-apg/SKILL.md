---
name: verify-apg
description: "Drive and verify Alpha Premier Group (APG) web application using chrome_devtools MCP: covers main redesign portal, 7 subsidiary sites, inquiry modals, careers, blogs, and admin shell."
---

# Verify Alpha Premier Group (APG)

Harness and feature map for verifying Alpha Premier Group single-page web application (React 18 + Vite + Tailwind v4 + PHP backend). Drives the application live via the chrome_devtools MCP server.

## Launch
1. **Start Dev Server:**
   ```powershell
   npm run dev
   ```
2. **Ready Signal:**
   Vite starts on `http://localhost:3000`. The server is ready when `http://localhost:3000` responds with HTTP 200 and page title includes `Alpha Premier Group`.
3. **Teardown:**
   Stop the dev server task or background process when testing is completed. Evidence files in `.verification-evidence/` remain preserved.

## Doctor
Run a read-only health check to ensure the instance is responsive before driving:
1. Call `chrome_devtools.list_pages`.
2. Ensure at least one page is open, or call `chrome_devtools.new_page` or `chrome_devtools.navigate_page` with URL `http://localhost:3000/`.
3. Call `chrome_devtools.take_snapshot`. Check that the root web area has title `Alpha Premier Group | Corporate Conglomerate` or a valid APG page title.
4. Verify zero fatal console errors with `chrome_devtools.list_console_messages`.

## Drive (Harness: chrome_devtools MCP)
Use the `chrome_devtools` MCP tools to exercise user paths:
- **Navigation:** `navigate_page(pageId, type="url", url="http://localhost:3000/<route>")`
- **Inspect DOM/a11y:** `take_snapshot(pageId)` to obtain element `uid`s and text hierarchy.
- **Interactions:**
  - `click(pageId, uid)` to click buttons, tabs, links, modal triggers.
  - `fill(pageId, uid, value)` or `fill_form(pageId, elements)` to fill input fields.
  - `evaluate_script(pageId, script)` to query document state or scroll smoothly.
- **Screenshots:** `take_screenshot(pageId, filePath=".verification-evidence/<name>.png")`
- **Network / Console Check:** `list_console_messages(pageId)` and `list_network_requests(pageId)` to ensure no unhandled exceptions or 500 errors.

## Evidence Standards
- **Real User Paths:** Drive actual user workflows (navbar clicking, enterprise cards, modals, form submission fields).
- **Target Folder:** `.verification-evidence/`
- **Naming Pattern:** `.verification-evidence/<feature-slug>-<timestamp-or-action>.png`
- **Observable End States:** Document both visual state and DOM snapshot affirmation.

## Cleanup
1. If temporary dialogs/modals are open, close them (ESC key or close button click).
2. Reset browser URL to `http://localhost:3000/` to leave the session in a clean state.
3. Proof artifacts in `.verification-evidence/` must never be deleted during cleanup.

## Helpers
- Quick full-page audit snapshot:
  `take_screenshot(pageId, filePath=".verification-evidence/audit-fullpage.png", fullPage=true)`
- Console error check helper:
  `list_console_messages(pageId)` filter `type == "error"`
