# EventX (Relfam) — Bug Fix Report (2nd Level)

**Date:** 2026-08-22
**Source:** 22-item bug list, second round of feedback (WhatsApp notes, 21–22 Aug 2026).
**Verification:** every fix below was tested with real browser interaction (Playwright, headless Chromium — actual clicks, form fills, uploads, canvas rendering), not just code reads. Full 18-check automated re-check passed 18/18 with zero console errors, plus a regression pass across Collections, Profile, Event Overview, and Contribute confirmed nothing else broke.

---

### Bug 1
Records should be able to download in Excel and PDF format

**Result:** Issue Fixed
The "Download" button on View Records was a stub ("Export coming soon"). It's now two real buttons: **Excel** exports the current event's records as a real downloadable `.csv` file (opens directly in Excel/Sheets), and **PDF** opens a formatted, print-ready page and triggers the browser's print dialog, where "Save as PDF" produces a real PDF.

---

### Bug 2 & 5
User can edit or mark as partially completed which the record is in pending status / when user changes status pending → completed or partially completed, the status should change accordingly

**Result:** Issue Fixed
Confirmed and verified: from Edit Record, choosing "Mark as Completed" or "Mark as Partially Completed" updates that record's status immediately and it's reflected everywhere the record is shown (list, filters, info popup).

---

### Bug 3
Remove not completed option

**Result:** Issue Fixed
Removed the "Mark as Not Completed" radio option from Edit Record — only "Mark as Completed" and "Mark as Partially Completed" remain, so a record can no longer be reverted back to Pending.

---

### Bug 4
When user edits or marks as completed manually, we need to show changes in the record when user clicks the info icon of the record

**Result:** Issue Fixed
Added a real info (ℹ️) icon to every record row (previously there was none). Tapping it opens a detail popup showing the record's full details, and — if it's been manually edited — a note like "Marked as partially completed manually" with a timestamp.

---

### Bug 6
Need to add partially completed filter chip

**Result:** Issue Fixed
The Quick Filter row's "Old" chip is now explicitly labeled "◐ Partially Completed" (and the same label is used everywhere else the status appears), so filtering by it is now clear.

---

### Bug 7
In filter, place should be a searchable dropdown

**Result:** Issue Fixed
Replaced the flat grid of place chips with a search box that shows a live-filtered dropdown of matching places as you type; selected places show as removable chips above it.

---

### Bug 8
In filter, custom amount field should allow only numbers

**Result:** Issue Fixed
The custom From/To amount fields are numeric-only inputs; browsers already reject letters at the keyboard level for this field type, and a JS sanitizer additionally strips any other non-digit characters that could otherwise slip through (e.g. exponent notation), so only plain digits ever reach the filter.

---

### Bug 9
When user selects custom field we should not allow user to apply filter without filling the amount — need to add validation

**Result:** Issue Fixed
Tapping "Apply Filter" with Custom selected and both From/To left empty now shows a validation message and keeps you on the filter screen instead of applying an empty filter.

---

### Bug 10
When user adds the entry with old and new amount, we need to add two separate entries

**Result:** Issue Fixed
Filling in both Old and New amounts on Add Entry now creates two independent, separately-editable records (one marked Partially Completed for the Old amount, one Pending for the New amount) instead of one combined row.

---

### Bug 11
Remove Memorial Gathering, add Corporate Event

**Result:** Issue Fixed
Swapped "Memorial Gathering" out of the "More Events" type list and added "Corporate Event" in its place.

---

### Bug 12
Need to modify the design as per Figma because many fields are missing for event creation

**Result:** Partially Addressed
I don't have access to the referenced Figma file, so I can't guarantee full parity with it. What I could do without it: added the missing **Host / Organizer Name** field (previously the host was silently auto-filled from the logged-in account with no way to change it). If there's a specific screenshot or exported spec of the Figma fields, I can close the rest of this gap precisely — right now I'd just be guessing at what else is missing.

---

### Bug 13
Invitation should be created based on the event type with entered details

**Result:** Issue Fixed
The View Invitation screen previously always showed generic wedding copy ("Together with their families...") regardless of event type. It now adapts wording, eyebrow text and closing line per type — Wedding/Reception/Engagement keep the couple-style copy, Birthday gets celebration copy, Housewarming gets "warmly invites you," Baby Shower gets its own copy, and everything else gets a generic cordial-invite version — and pulls in the entered cover image, date, time, venue and description.

---

### Bug 14
User should be able to send invitation as image format in WhatsApp

**Result:** Issue Fixed
Added a "📤 Send as Image on WhatsApp" button on View Invitation. It renders the invitation as a real PNG image (canvas-generated — not a pixel copy of the on-screen card, since that needs a DOM-to-image library I didn't want to add without checking with you, but a genuine branded image with the same content) and shares it as an actual image file via the device's native share sheet (which includes WhatsApp) where supported; on devices/browsers without file-sharing support, it downloads the image and opens WhatsApp so it can be attached manually.

---

### Bug 15
QR code is not valid — create proper QR as per bank

**Result:** Issue Fixed
The QR "code" shown for payment was a decorative checkerboard pattern — not an actual QR code, so nothing could scan it. It's now a real, scannable QR code encoding a standard UPI payment link (`upi://pay?pa=...&pn=...&am=...&cu=INR`) generated with a proper QR-encoding library, shown wherever a payment QR appears (Add Entry, Contribute).

---

### Bug 16
Change the time field to an easy format to fill

**Result:** Issue Fixed
Replaced the raw native time picker with three simple dropdowns — Hour / Minute / AM-PM — which is faster and more reliable to fill on mobile than the native time widget (which behaves inconsistently across Android WebView versions).

---

### Bug 17
Added image is not getting reflected after created the event

**Result:** Issue Fixed
Confirmed as real: the uploaded cover image was saved but never actually displayed anywhere — My Events, Event Detail, the Created-Successfully screen and the Event Overview screen all just kept showing the generic icon/gradient regardless. All four now show the real uploaded image.

---

### Bug 18
Show only collected amount in My Events page for all events

**Result:** Issue Fixed
Simplified each event card on My Events down to just the Collected amount, removing the Pending/Target stats that were cluttering it.

---

### Bug 19
When user clicks share event, show only WhatsApp, Instagram, Message, Share Link — share as a link; open the app if installed, else redirect to Play Store/App Store

**Result:** Issue Fixed (with one caveat)
Trimmed the share grid down to exactly those 4 options. WhatsApp uses `wa.me`, which natively handles "open the app if installed, else the web/store" itself. Message uses the system SMS composer. Share Link uses the device's native share sheet (or clipboard as a fallback). **Instagram is the caveat:** Instagram has no public web API for sharing arbitrary text/links the way WhatsApp does — there's no way to reliably hand it a "link" from a plain web app. What I built instead: copy the invite text to the clipboard, then attempt to open the Instagram app directly (falling back to its Play Store page if it's not installed within ~1.5s) so the user can paste the copied link in. It's the closest honest approximation without integrating Instagram's own SDK.

---

### Bug 20
Remove search button from My Events page

**Result:** Issue Fixed
Removed. (Note: this reverses the search feature added earlier this session at your explicit request — following this newer instruction since it supersedes it.)

---

### Bug 21
Edit event is not working once event is created

**Result:** Issue Fixed
Confirmed as real: "Edit Event" was wired to the same function as "Create New Event," so it just wiped the draft and started a brand-new blank event instead of loading the existing one. It now properly pre-fills the form with the event's current details and updates that same event in place (verified: no new event is created, the original one is modified). Also added a dedicated ✏️ Edit button directly on the Event Detail page, since previously the only way to reach Edit at all was from the one-time success screen right after creation.

---

### Bug 22
Instead of UPI ID, better we can upload QR code from local

**Result:** Issue Fixed
Event creation now offers a toggle: "Enter UPI ID" (auto-generates a scannable QR, per Bug 15) or "Upload QR Code" (pick an image from your device — your bank's own QR image is used directly, wherever a payment QR is shown for that event). At least one of the two is required to create the event.

---

## Summary

| # | Bug | Status |
|---|-----|--------|
| 1 | Excel/PDF export | ✅ Fixed |
| 2 | Edit/mark partially completed from Pending | ✅ Fixed |
| 3 | Remove "Not Completed" option | ✅ Fixed |
| 4 | Info icon shows edit history | ✅ Fixed |
| 5 | Status updates correctly | ✅ Fixed |
| 6 | "Partially Completed" filter chip | ✅ Fixed |
| 7 | Searchable place filter dropdown | ✅ Fixed |
| 8 | Numeric-only custom amount fields | ✅ Fixed |
| 9 | Validate custom amount before applying | ✅ Fixed |
| 10 | Old+New split into two entries | ✅ Fixed |
| 11 | Memorial Gathering → Corporate Event | ✅ Fixed |
| 12 | Missing fields per Figma | 🟡 Partial (no Figma access) |
| 13 | Invitation adapts to event type | ✅ Fixed |
| 14 | Send invitation as image on WhatsApp | ✅ Fixed |
| 15 | Real scannable QR code | ✅ Fixed |
| 16 | Easy time picker | ✅ Fixed |
| 17 | Cover image not reflected | ✅ Fixed |
| 18 | Show only Collected on My Events | ✅ Fixed |
| 19 | Trimmed share icons, link-based sharing | ✅ Fixed (Instagram caveat noted) |
| 20 | Remove search from My Events | ✅ Fixed |
| 21 | Edit Event not working | ✅ Fixed |
| 22 | Upload QR instead of UPI ID | ✅ Fixed |

**21 of 22 fully fixed, 1 partially addressed pending Figma access.**

## Notes for next round

- If you can share the Figma file (or export screenshots of the specific event-creation screens), I can close Bug 12 precisely instead of guessing.
- The QR library and invitation-image sharing both require an internet connection to load on first use (the QR library loads from a CDN, same as the app's fonts already do) — this matches the app's existing dependency profile, but worth knowing if you test fully offline.
- Instagram sharing (Bug 19) is a best-effort workaround, not a true "share this link into Instagram" integration — that would need Instagram's own SDK, which is a bigger scope decision worth confirming before investing in it.
