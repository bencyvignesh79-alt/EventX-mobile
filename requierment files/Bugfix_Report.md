# EventX (Relfam) — Receiver Side Bug Fix Report

**Date:** 2026-08-21
**Source:** "EventX - Bug notes" — 13 items reported against the Receiver side.
**Verification:** every fix below was tested with real browser interaction (Playwright, headless Chromium — actual clicks, drags, and typing, not just code reads). Full 13-item automated re-check passed 13/13 with zero console errors, plus a broader regression pass across Records, Profile, My Events, Event Detail, and Collections confirmed nothing else broke.

---

### Bug 1
Need footer for every page

**Result:** Issue Fixed
The bottom navigation footer was previously only shown on a handful of "tab root" screens; every immersive screen (Create Event, Event Detail, Add Entry, Records filters, Edit Record, etc.) had none. `wrapPlain()` — the wrapper every one of those screens renders through — now always includes the footer, so it's present app-wide post-login.

---

### Bug 2
Remove save draft button from the 'create new event' page

**Result:** Issue Fixed
Removed the "🔖 Save Draft" button from both steps of the Create Event flow (the event-type picker and the details form).

---

### Bug 3
Event type -> more option -> didn't navigate the new "custom event" create page

**Result:** Issue Fixed
Tapping a tile inside the "More Events" grid (e.g. Custom Event, Anniversary, Naming Ceremony) previously just selected it silently and left the user on the same screen, with a separate "Continue" tap required and no visual feedback that a selection had registered — it looked broken. Tiles in that grid now navigate straight to the details form on tap.

---

### Bug 4
Need to clarify (cover image and help coming soon popup)

**Result:** Issue Fixed
The "?" help button on the Create Event screens showed a "Help coming soon" toast with no real content. It now opens a real info popup explaining what the screen expects (cover image + UPI required, how the slide bar works, etc.). The cover image behavior itself is clarified by Bug 5 below — it's a real, working, mandatory upload now, not a stub.

---

### Bug 5
Should set the cover image as mandatory in create event page

**Result:** Issue Fixed
"Choose Image" was a non-functional stub ("Image picker coming soon"). It's now a real file picker with an on-screen preview (via `FileReader`), and event creation is blocked with a clear message until a cover image is selected.

---

### Bug 6
Set the event date only current and future date (create new event -> wedding page)

**Result:** Issue Fixed
The date field now has `min` set to today's date (so the native picker won't offer past dates), and event creation is also blocked server-side-in-JS if a past date is somehow submitted — defense in depth, not just a UI restriction.

---

### Bug 7
User can select the live location for Address in address field & whenever user type the location will show the suggestion based on the search location

**Result:** Issue Fixed
The Venue/Location field now shows a live filtered suggestion dropdown as you type (matching against a curated venue list), and a "🎯 Use current location" button that requests the device's GPS position via the Geolocation API and fills the field with it. (Full reverse-geocoding to a real street address would need a paid Maps API key, which is out of scope — the field is filled with coordinates and is freely editable.)

---

### Bug 8
Need to validate the UPI whether valid or not

**Result:** Issue Fixed
The UPI ID field now validates against the standard `name@bank` UPI format live as you type (✅ indicator appears once valid), and event creation is blocked with a clear message if the format is invalid.

---

### Bug 9
Create event button need to change into slide bar

**Result:** Issue Fixed
Replaced the plain "Slide to create an event" button — which was really just a click target — with an actual draggable slide-to-confirm control. The user must physically drag the handle to the end of the track to submit; releasing early snaps it back. Validation failures (missing cover, past date, bad UPI, etc.) also snap the handle back instead of submitting.

---

### Bug 10
Remove the online gift contribution component in the 'view invitation' page

**Result:** Issue Fixed
Removed the "Online Gift Contribution" card from the View Invitation screen.

---

### Bug 11
Change the collected, pending, target into -> total given, total received, yet to receive in the view records page

**Result:** Issue Fixed
The View Records summary previously showed "Total Received / Target / Yet to Receive," with "Yet to Receive" actually computed against the fundraising target rather than against what was given. It now shows all three requested labels — Total Given, Total Received, Yet to Receive — with "Yet to Receive" correctly computed as given-minus-received.

---

### Bug 12
Should need mic option in add entry record page

**Result:** Issue Fixed
The mic buttons on the Sender/Receiver Name and Place fields were present but were decorative stubs ("Voice input coming soon"). They now trigger real speech-to-text via the browser's Web Speech API where the device/browser supports it, filling the field with the transcribed text; on unsupported devices they show a clear "not supported" message instead of silently doing nothing.

---

### Bug 13
Amount field enable after checkbox selected in add entry page

**Result:** Issue Fixed
The Old Amount and New Amount fields were always editable regardless of whether their Old/New checkbox was ticked. They're now disabled (and cleared) until their matching checkbox is checked, and re-enabled the moment it is.

---

## Summary

| # | Bug | Status |
|---|-----|--------|
| 1 | Footer on every page | ✅ Fixed |
| 2 | Remove Save Draft button | ✅ Fixed |
| 3 | More → sub-type navigation | ✅ Fixed |
| 4 | Cover image / help popup clarity | ✅ Fixed |
| 5 | Mandatory cover image | ✅ Fixed |
| 6 | Date restricted to today/future | ✅ Fixed |
| 7 | Live location + address suggestions | ✅ Fixed |
| 8 | UPI ID validation | ✅ Fixed |
| 9 | Real slide-to-create bar | ✅ Fixed |
| 10 | Remove Online Gift Contribution | ✅ Fixed |
| 11 | Given/Received/Yet-to-Receive labels | ✅ Fixed |
| 12 | Working mic input | ✅ Fixed |
| 13 | Amount fields gated by checkbox | ✅ Fixed |

**13 of 13 fixed and verified.**

## Notes / known limitations

- "Use current location" fills GPS coordinates, not a resolved street address — real reverse-geocoding needs a paid Maps API key (out of scope for this build).
- Voice input depends on the browser's Web Speech API being available; it degrades to a clear error message where it isn't (e.g., some Android WebView configurations), rather than failing silently.
