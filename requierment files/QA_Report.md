# Relfam — End-to-End QA Report

**Date:** 2026-08-20
**Scope:** Full end-to-end test of every screen and interactive control in `www/index.html`, driven by real headless-Chromium clicks (Playwright), not just code inspection. Triggered by a report that "Create Event / Slide to create an event" wasn't working.

## Method

1. Reproduced the reported bug first, in isolation, with real `.click()` dispatch on the actual button (not a direct JS call) — to see exactly what a user sees.
2. Ran a 44-step scripted sweep across every flow: auth (login/OTP/signup/terms), Find Event → Contribute → Live Streaming → Share, event creation (including the "More" event-type sub-grid), Add Entry (receiver and sender), Records + Detailed Filter + Edit Record, Collections, and all 15 Profile sub-screens.
3. Captured browser console errors throughout (0 were ever thrown by the app itself — every bug found was a *silent* logic/rendering gap, not a crash).
4. Fixed every confirmed bug, then re-ran the affected flows to verify the fix.

## Headline finding: the reported bug did not reproduce

Clicking the real "Slide to create an event" button — filled form, real click, real render — creates the event and navigates to the success screen correctly, every time, with zero console errors. The event-creation code itself was never broken.

**What almost certainly caused the report:** a much bigger, silent bug described below (toast messages being invisible on the login/signup/OTP screens). If a user hit *any* validation issue while signing up or logging in — e.g. an unaccepted checkbox, a mismatched password — the app gave **zero visible feedback**. The screen just sat there looking unresponsive. That is exactly the symptom of "the button doesn't work," and it's plausible this (or the field-wiping bug below) is what was actually experienced, on a different screen than the one first suspected.

## Bugs found and fixed

| # | Bug | Where | Severity | Fix |
|---|-----|-------|----------|-----|
| 1 | **Toasts were completely invisible** on Login, Sign Up, OTP Login, and Terms & Conditions. `showToast()` re-renders the page, but these 4 screens never included the toast `<div>` in their output (every other screen does). Any validation message ("Enter your name," "Passwords do not match," "OTP sent," "Password reset link sent," etc.) fired silently. | `authScreen`, `signupScreen`, `otpScreen`, `termsScreen` | **High** — looks exactly like a dead button | Added the toast markup to all four screens. Verified every one of the 44 screen-render functions now includes it (direct, via `subPage()`, or via a manual toast block). |
| 2 | **Add Entry form wiped every field** (name, mobile, place, old/new amounts, notes, even the checkboxes) whenever a validation toast fired (e.g., forgetting to select Old/New). This is the single most-used form in the app. | `entryFormScreen` / `saveEntry()` | **High** | Bound every field to a `state.enDraft` object with `oninput` handlers instead of reading raw, unbound DOM values, so a re-render no longer erases what the user typed. |
| 3 | **Change Password wiped Current/New/Confirm** on a mismatch or weak-password toast, forcing a full retype. | `changePasswordScreen` | Medium | Same draft-binding fix (`state.cpDraft`). |
| 4 | **Sign Up wiped the entire form** on any validation failure, *and* separately, on tapping into Terms & Conditions and coming back. | `signupScreen` | Medium (first impression) | Same draft-binding fix (`state.suDraft`), applied to survive both re-renders and page navigation. |
| 5 | **Reminders form wiped Date/Note** if Title was left blank. | `remindersScreen` | Low | Same draft-binding fix (`state.rmDraft`). |
| 6 | **Contribute screen's amount presets showed `₹1001` / `₹2501`** instead of the comma-formatted `₹1,001` / `₹2,501` your mockup specifies. | `contributeScreen` | Low (cosmetic) | Routed through the existing `money()` formatter instead of raw string interpolation. |

All six were confirmed with real-browser reproduction *before* fixing and re-verified with real-browser interaction *after* fixing.

## Full flow coverage — what was tested and confirmed working

- **Auth**: password login, eye-icon show/hide, logout, OTP login (send/verify), Sign Up (with the field-persistence bug above fixed), Terms & Conditions.
- **Home**: Find an Event by code (valid + invalid code paths), Scan QR stub.
- **Find Event → Contribute → Live Streaming → Share**: event lookup, View Location ("Open in Maps"), live chat send, Share Event (copy code), Contribute with a preset amount, Contribute with a custom amount (including the zero-amount rejection).
- **Receiver**: Create Event through every step including the "More" event-type sub-grid, the Slide-to-create button, the Event Created Success screen, View Invitation, Add Entry (Old/New split, live total, Cash⇄UPI payment-method switch with QR reveal, success modal).
- **Records**: quick filter chips, search, Detailed Filter (amount buckets, status, visits), and the new Edit Record screen (opening a row, editing name/place/status, saving).
- **Sender**: Create Collection (all 4 categories), sender-side Add Entry, Open Existing Collection list.
- **Profile**: Edit Profile, Change Password (strength meter + checklist), Change Mobile (2-step OTP), Records & Summary, Transaction History (filter tabs), Reminders (add/complete), Family Account (OTP-gated add + role cycling), Settings (Hide Amount masking app-wide), Security (Auto Lock cycling, Logout-from-all-devices), Help & Support → FAQs (search), Feedback, About, Share App.

Every one of the above passed with real clicks and zero console errors after the fixes above.

## Not covered in this pass

- Real device/APK testing (still blocked on Android Studio/JDK not being installed locally — see README for the build steps once you have it).
- The dual Cash/UPI layout variant of Add Entry your own spec doc marks as deferred to "phase1 release."
- Payment gateway integration (explicitly out of scope per earlier decision — manual entry only).
