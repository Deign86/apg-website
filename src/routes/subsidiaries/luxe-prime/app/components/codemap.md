# luxe-prime/app/components/
## Responsibility
- One component per page: `HomePage`, `ServicesPage`, `BlogsPage` (with its article `Reader`), `CareersPage` (with its `ApplicationPage`), `InquirePage`.
- Shared pieces:
  - `ui.ts`: the look as class strings, plus the square glass settings and `roman()`;
  - `headings.tsx`: the scroll reveal (`Reveal`, `rise` and `EASE` from the Realty site, plus `settle`), `Eyebrow` and `SectionHeading` (one scale for page titles, one for section titles);
  - `ClosingPanel.tsx`: the call to act at the end of a page;
  - `Lightbox.tsx`: the service photo viewer;
  - `services.ts`: `toLuxeService` (admin service rows) and `sized()` (smaller Unsplash copies for thumbnails).
## Design
- "Art Deco couture", deliberately unlike the Realty site's soft rounded look, in black and Luxe's deeper gold (#C49A2A, light #F0D080):
  - Shapes: square corners everywhere, thin gold hairlines (often doubled: `DOUBLE_FRAME` adds a second rule 8 px inside the border), and small gold diamonds (`DIAMOND`) as ornaments. Photos are framed like prints (hairline mat, diamonds on two corners).
  - Headings: "—◆ EYEBROW ◆—" over the title. Section dividers: a short hairline with a diamond on it. Numbering: Roman numerals.
  - Type, the Realty site's pair (the user found Cormorant Garamond and Cinzel too thin): Playfair Display for titles (`DISPLAY`); Plus Jakarta Sans semibold caps (`CAPS`) for eyebrows, buttons, links, labels and numerals; Plus Jakarta Sans for reading text, in ivory (#F5F0E8).
  - Buttons are rectangular. `BUTTON_PRIMARY` is solid gold with a second hairline outside it that closes in on hover; `BUTTON_SECONDARY` is a hairline that fills with gold. Links end in a hairline that extends on hover.
  - Form fields (`FIELD_*`) are square, dark, with a gold hairline; errors are linked to their fields (aria-invalid, aria-describedby) and focus moves to the first one.
  - Motion, the same as the Alpha Premier Realty site's (the user asked for it back, over the Taste Skill's no-scroll-fade rule): each section's container is a `Reveal` (motion `whileInView`, once) that staggers its children rising in (`rise`); titles slide up from behind a mask and the eyebrow hairlines draw in (`headings.tsx`); framed photos settle from a slight zoom (`settle`). Transform and opacity only; reduced motion renders it all in place. Hover feedback is 200 ms (buttons step and press, linked cards lift 2 px, photos zoom 1.03 inside their frame, `PHOTO_ZOOM`).
  - Layout: one section per screen. `OPENING` is a page's first screen (full height, under the fixed header), `SCREEN` every section after it (the screen minus the header, content centred). Service rows and featured covers have height-bounded photos so a row fits its screen.
- Liquid glass only on controls over photos, with square corners: `GLASS_SQUARE` (hero "Our services", scroll cue, a service's "Gallery") and `GLASS_TAG` (numeral tags). They reuse the Realty glass settings with `borderRadius: 0`.
- Class strings live in `ui.ts`: Luxe's Tailwind build only scans this site's files.
## Flow
- `HomePage`:
  - hero: the logo (about 38% of the screen height, set low in the stack) and tagline over `public/images/luxe-prime-hero.webp` (curved towers, Unsplash photo-1527576539890, graded: black sky with a soft gold glow behind the logo, the building in black and gold);
  - philosophy (`#philosophy`): a framed photo beside the story, its last paragraph set apart as a quote;
  - Signature Services: four framed photo cards;
  - What Sets Us Apart: three centred double-framed cards, then the closing panel.
- `ServicesPage`: an opening screen (title, intro, a numbered index that scrolls to each service, a framed photo), then one screen per service (the photo framed like a print with a glass "View n photos" button, beside a text block centred on it: numeral, title, text, hairline-ruled features, "Inquire about this service"; sides alternate), then the client journey as a timeline (`journey_steps`) with the closing panel. Skeleton while loading; an empty state when there are none.
- `BlogsPage`: an opening screen (title, then the newest post as a spread), then a screen with the rest as framed cards (6 at a time) and the closing panel; category tabs once there are at least four posts in more than one category. The reader is a full-screen dialog (Esc closes, focus starts on the title) as wide as the site container: the title and the framed cover across it, then the body (`BlogBody`, 17 px, a ~70-character column) beside a side column that stays in view (the article's category, date and reading time, and the call to inquire); below, "More Insights" as framed cover cards of one size, centred. The three seeded posts show only when the blog can't be loaded or is empty.
- `CareersPage`: an opening screen (title, intro and the perks, `careers_perks`, as double-framed cards), then a screen of open roles with a count (or "No open roles right now" and a general application), and a closing panel for general applications. `ApplicationPage` posts to `/api/applicants.php` (same fields as before, `jobTitle` "General Application" when there is no role) and shows the server's ticket.
- `InquirePage`: the concierge desk (email, phones, response time, office from `companyContact`) beside the form: one-tap topics from the Luxe config's `quickPrompts`, name, email, phone, company, line of business, budget, subject, message. Posts the same JSON to `/api/inquire.php` as the shared `EnterpriseInquire` and shows the ticket.
## Integration
- Copy comes from `useContent('luxe-prime')` (admin-editable registry page 'luxe-prime'); no copy is added to the registry.
- The only Realty import is the glass settings (`GLASS_PILL`, `GLASS_BADGE` in `alpha-realty/app/components/ui.ts`), which are plain objects.
