# api/data/

## Responsibility

Server-side reference data. Currently one file: `knowledge.md`, the chatbot knowledge base. Not web-accessible: `.htaccess` is deny-all, and `api/.htaccess` also denies `*.md`.

## Design

- `knowledge.md` is hand-maintained Markdown with a "Last synced" date and its sources: repository site content, the Google Drive listing folder, and the Facebook page. Sections:
  1. Company overview
  2. Business contact details
  3. Enterprises and services
  4. Property listings: office and commercial space for lease by area, properties for sale, sold examples, virtual office plans
  5. Careers
  6. Source notes
- It holds only facts the assistant may quote. Listing prices and availability are marked as subject to confirmation.

## Flow

1. `api/chat/message.php` `askChatAssistant()` reads the whole file on each AI-eligible message and embeds it in the Gemini system prompt inside `<knowledge_base>` tags, marked as data rather than instructions.
2. `guardAssistantReply()` checks model output against the same text: any email or Philippine phone number not found in the file voids the AI reply, and the chat falls back to the FAQ path.
3. If the file is missing or empty, the assistant is skipped and `matchFaqReply()` answers.

## Integration

- Read only by `api/chat/message.php`. To update the bot's facts, edit this file and redeploy; no database or cache is involved.
- `tools/hostinger-update.sh` deletes only `codemap.md`/`README.md` from the bundle, so `knowledge.md` ships to production.
