# Feature: Global Inquiry System

## Sub-features
1. **Global Inquire Modal:** Triggered via top navbar "INQUIRE NOW" button or route `/inquire`.
2. **Enterprise Inquire Pages:** Dedicated subsidiary inquiries (`/subsidiaries/<enterprise>/inquire`).
3. **Input Validation:** Full Name, Work Email, Mobile Number, Enterprise selector, Subject, Message.
4. **Submission Handler:** Submits payload to backend `/api/inquire.php`.

## How to get to it (user POV)
Click "INQUIRE NOW" from the navbar on any page, or navigate to `/inquire`.

## Driving it with chrome_devtools
1. `navigate_page(pageId, type="url", url="http://localhost:3000/")`
2. `take_snapshot(pageId)` and locate the "INQUIRE NOW" button.
3. `click(pageId, uid=<inquire-button-uid>)`
4. `take_snapshot(pageId)` to verify the modal dialog is visible.
5. Fill test inputs into Full Name, Email, Phone, Message.
6. `take_screenshot(pageId, filePath=".verification-evidence/03-inquiry-modal.png")`

## Gotchas
- In test environments without active SMTP, submission verifies client-side validation and request dispatch.
