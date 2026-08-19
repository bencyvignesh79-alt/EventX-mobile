# Relfam Admin Panel — Module-Wise Functional Specification

## Platform Overview
Relfam is a family gift-tracking app built around the South Indian (Tamil) tradition of recording "moi" — the cash and gifts exchanged at life-event functions such as weddings, birthdays, housewarmings (Grihapravesam), baby showers (Valaikappu), engagements, and 60th-birthday ceremonies (Sashtiabdapoorthi) — so families never lose track of who gave what and can reciprocate later. This document describes the **admin back-office console** the Relfam operations team uses to run the platform: managing users and events, reconciling the gift ledger, handling subscriptions and fraud, running support and marketing, and configuring the app. Throughout, the logged-in persona is "Louis A," a Super Admin.

## Module Index
| # | Module | Purpose |
|---|--------|---------|
| 1 | Dashboard | Platform health at a glance |
| 2 | Users | Manage accounts; drill into a profile |
| 3 | Events | Browse and export hosted events |
| 4 | Gift Records | Review and verify individual moi transactions |
| 5 | Packages & Payments | Manage plans and subscription billing |
| 6 | Family Accounts | Manage family groups and member roles |
| 7 | Fraud & Spam | Investigate and action abuse cases |
| 8 | Reports | Business summaries and exports |
| 9 | Analytics | Retention, regional, and package-mix insight |
| 10 | Notifications | Push / SMS / email campaign builder |
| 11 | Advertisements | Targeted, schedulable in-app ad campaigns |
| 12 | Support | Ticketing and team assignment |
| 13 | Content Management | Onboarding, themes, FAQ, announcements, legal, translations |
| 14 | Settings | Platform-wide configuration |
| 15 | Admin Management | Back-office staff and screen-level permissions |
| 16 | Audit Logs | Who did what, when, from where |
| 17 | Global Search | Cross-module lookup |
| 18 | Navigation Shell | Sidebar, header, and layout conventions |

## Shared UI & Interaction Patterns
These conventions recur across most modules, so they're described once here instead of repeated below:

- **List-view pattern** — Users, Events, Gift Records, Subscriptions, Support Tickets, and Audit Logs all share one layout: a text search box (substring match across the relevant fields), a row of single-select filter chips (some are plain field matches, others test a computed condition, e.g. "amount > ₹10,000" or "High priority"), a sticky-header data table, and a footer reading "Showing X of Y" that updates live as filters change.
- **Status chips** — one color system is reused everywhere a status appears: green for positive/closed states (Active, Verified, Completed, Resolved, Paid, Published, Actioned), blue for live/in-progress states (Live, In Progress, New, Under Review), amber for attention-needed states (Upcoming, Pending, Medium, Inactive, Draft), red for negative/urgent states (Blocked, Suspended, Flagged, Open, High, Failed), gray for low-priority/closed states (Low, Dismissed). Plan tiers and family roles get their own accents (Pro = blue, Advanced = gold, Regular = gray; Admin = gold, Member = blue, Guest = gray).
- **Avatars** — generated rather than uploaded: initials from the name, a background color deterministically chosen from a fixed palette.
- **KPI cards** — appear on Dashboard, Payments, and Fraud: icon, label, headline number, a small trend sparkline, and a growth % with a colored up/down arrow. Many are clickable shortcuts that pre-filter the table beneath them.
- **Overlays** — centered modals with a blurred backdrop are used for creation forms (New Ticket, New Admin, New Advertisement); a right-side sliding drawer is used for single-record detail (the Gift Transaction Drawer).
- **Currency** — every money value is formatted as Indian Rupees with `en-IN` thousands grouping (₹).
- **Drill-downs** — Users and Family Accounts each have a list view plus a dedicated detail view. Opening the detail view keeps the parent sidebar item highlighted and adds an explicit Back action rather than becoming its own nav entry.

## 1. Dashboard
The landing screen — platform health at a glance, with a Tamil-greeting subtitle ("Vanakkam, Louis…").
- **8 KPI cards**: Total Users (12,960, +12.4%), Active Users (8,214, +8.1%), Total Events (1,608, +15.2%), Events Today (23, +4.5%), Gifts Recorded (86,420, +18.9%), Total Gift Value (₹18.4 Cr, +21.3%), Paid Subscribers (4,182, +14.6%), Open Fraud Cases (3, -6.2%). "Open Fraud Cases" is a shortcut into the Fraud module.
- **User Growth** — 12-month line chart, total Users vs. Daily Active Users.
- **Event Types** — donut chart: Wedding 38%, Birthday 22%, Housewarming 16%, Baby Shower 12%, Others 12%.
- **Event Creation** — bar chart of events created per month.
- **Gift Value Trend** — area chart, monthly gift value in ₹ lakh.
- **Subscription Revenue** — area chart, monthly revenue in ₹.
- **Recent Activity feed** — latest 5 platform events (new registration, fraud alert raised, package activated, gift added, ticket created), each with icon, description, status badge, and relative time.
- **Quick Actions** — five shortcuts: Add User, Create Announcement, Review Fraud Cases, Send Notification, Export Data. Only "Review Fraud Cases" is wired to navigate anywhere (to the Fraud module); the rest are placeholders for future actions.

## 2. Users
The full account directory.
- **Columns**: user (avatar, name, city), User ID, mobile, email, country, package, events hosted, gifts recorded, status, last login, actions.
- **Search**: name, User ID, mobile, email, or city.
- **Filters**: All / Active / Suspended / Blocked / Regular / Pro / Advanced / India — the last filters by country rather than status or plan.
- **Row actions**: View (opens the profile), and a single Suspend ⇄ Reactivate toggle whose icon and label flip based on the user's current status.

### 2.1 User Details (drill-down)
Opened from a Users row; has its own Back-to-Users action.
- **Profile card** — avatar, name, User ID, city/country, status + package chips, an Edit button (not yet wired to an action), and Suspend/Reactivate.
- **Subscription card** — package, amount, activation date, expiry, and payment status when a subscription record exists for the user; otherwise a "no payment record" note for users on the free Regular plan.
- **Personal Information card** — User ID, mobile, email, registration date, language.
- **Overview / Events / Gifts / Payments tabs** — the tab selector is present, but the content below it is a fixed overview regardless of which tab is active: three stat tiles (events hosted, gifts recorded, total moi value = gifts × ₹4,200), a Recent Events list, a Login History list (last 3 logins with device/location), and a Devices list (trusted vs. removed).

## 3. Events
Every hosted event on the platform.
- **Columns**: Event ID, event name, type, host (avatar + name), date, gift count, total collection (₹), status.
- **Search**: event name, host, or ID.
- **Host filter**: a dropdown listing every host, each labeled with their User ID.
- **Date-range filter**: From/To pickers plus a Clear action, filtering on the event's date.
- **Status/type filter chips**: All / Live / Upcoming / Completed / Wedding / Birthday / Housewarming / Baby Shower.
- **Export CSV**: exports exactly the currently-filtered rows (the button label shows the live count) to `relfam-events-export.csv`, including a Host UID column looked up from the Users list.

## 4. Gift Records
The moi ledger — every individual gift transaction.
- **Columns**: transaction ID, sender (avatar + name), receiver, event, amount, payment method, date, status.
- **Search**: transaction ID, sender, or receiver.
- **Filters**: All / Cash / UPI / Bank / > ₹10,000 / Pending / Flagged.
- Clicking any row opens the Gift Transaction Drawer.

### 4.1 Gift Transaction Drawer
A right-side slide-in panel for a single transaction.
- A large highlighted amount with its status chip.
- Detail rows: transaction ID, sender, receiver, event, payment type, date & time, "recorded by" (always shown as the family member on the host side), and a ledger note ("Total = Old + New · auto-updated").
- **Actions**, conditional on current status: Verify (if not already Verified), Flag (if not already Flagged), or Move to Pending (available only once a transaction has been Flagged).

## 5. Packages & Payments
Subscription plans and billing operations.
- **Activation KPIs**, computed live from the subscription list: Activated Today, This Week, This Month, Failed Payments. Each is clickable; the first three all pre-filter the table to Active status, and Failed Payments filters to Failed — the KPI numbers themselves are time-scoped, but the click-through filter is not.
- **Three plan cards**: Regular (₹0, free forever — 1 event, 50 gift records, basic ledger, 1 family member), Pro (₹199/mo — unlimited events and records, QR collection, 5 family members), Advanced (₹499/mo — everything in Pro plus payment links, priority support, unlimited family members, reciprocity insights). Each card shows its live subscriber count and toggles the subscriptions table filter to that plan when clicked (clicking again clears it).
- **Subscriptions table**: Sub ID, user, plan, amount, payment method, activation date, expiry, status, actions.
- **Search/filters**: search by user or Sub ID; status chips All / Active / Inactive / Failed.
- **Row actions**, status-dependent: Retry (Failed → Active, new expiry date), Deactivate (Active + paid plan only → Inactive — free Regular subscriptions can't be deactivated this way), Reactivate (Inactive → Active, new expiry date).

## 6. Family Accounts
Groups multiple users under one household ledger.
- **Card grid**: one card per family — icon, family name, head of family, and three stats (member count, events hosted, total moi ledger value).
- "Manage family" opens the detail view.

### 6.1 Family Detail (drill-down)
- **Profile card** — family name, head, and member counts by role (Admin / Member / Guest).
- **Family Ledger card** — total moi value, events hosted, and two fixed policy notes: amounts are hidden app-wide, and guest access is read-only and server-enforced.
- **Add Member form** — name and relation; new members always join with the Guest role.
- **Members table** — member (avatar + name), relation, role, actions. The role chip is directly clickable and **cycles Admin → Member → Guest → Admin** on each click; a matching icon button does the same, alongside a Remove-member action.

## 7. Fraud & Spam
The investigation queue for abuse and suspicious activity.
- **Status KPIs**: New Alerts, Under Review, Actioned, Dismissed — each filters the case list when clicked.
- A note documents the detection engine's signal types: entry velocity, payment mismatch, content filter, device fingerprint.
- **Case list** — collapsible cards, left border color-coded by severity (High / Medium / Low). Collapsed view shows case ID, type, severity chip, the flagged user, detection time, and status.
- **Expanded view** shows two panels:
  - *User context* — avatar, name, location, status, mobile, email, plan, registration date, events/gifts counts, last-active time, and an "Open full profile" link into User Details.
  - *Evidence* — a free-text description of what was detected, plus a highlighted "signal" callout naming the specific metric that triggered the case (e.g. entry velocity vs. family average, or claimed amount vs. median gift).
- **Case actions**, shown conditionally: Suspend user & close case (suspends the account and marks the case Actioned in one step), Mark under review, Dismiss as legitimate, and Reopen (available on Dismissed/Actioned cases, returns them to Under Review).
- **Sample cases**: a spam entry-velocity case, a fake-payment claim disputed by the host, an abusive content flag left on someone else's event, and a dismissed QR-scan anomaly that turned out to be a legitimate venue kiosk.

## 8. Reports
Business-summary snapshots and exports.
- **Summary tiles**: Total Collection (₹18.4 Cr, +21.3%), Average Gift (₹4,210, +3.8%), Monthly Growth (9.7%, +1.2 pts), Most Active User (ranked by gift count).
- **Generate Report** panel with Excel / CSV / PDF export buttons (presentational in this build — unlike the working CSV export on the Events screen, these aren't wired to a real export yet) alongside a bar chart of the monthly gift-value trend.

## 9. Analytics
Deeper platform insight across four panels:
- **Daily Active Users** — 12-month area chart.
- **Retention Cohorts (D30)** — progress bars by acquisition path: Wedding hosts 82%, invited Family members 64%, QR-only guests 31%, Organic signups 47%, with a callout noting wedding hosts retain roughly 2.6× better than QR-only guests.
- **Top Regions** — ranked user counts across Chennai, Madurai, Coimbatore, Singapore, and Dubai.
- **Package Mix** — horizontal bar chart: Regular (free) 68%, Pro 24%, Advanced 8%.

## 10. Notifications
The push / SMS / email campaign composer.
- **New Campaign form** — channel selector (Push / SMS / Email), campaign name, title, message, audience chips (All users, Active 30d, Pro + Advanced, Tamil Nadu, Diaspora), and schedule chips (Send now, Today 6 PM, Custom).
- **Live preview** — a simulated phone notification reflecting the current title/message, plus the selected audience, channel, and an estimated per-message cost (SMS carries a cost; Push/Email show ₹0).
- **Send now / Schedule** and **Save draft** actions — sending prepends the new campaign to the Recent Campaigns list.
- **Recent Campaigns** — name, channel chip, and delivery stats (e.g. "8,102 sent · 34% open").

## 11. Advertisements
Targeted, schedulable in-app ad placements.
- **Campaign KPIs**: Live, Paused, Draft, and Total campaign counts.
- **Campaign list** — title, ID, status, ad copy, and four targeting chips: event type, target user (all users or one specific user), date targeting (or the custom range), and placement (event page banner / home feed / push card). Actions: toggle Live ⇄ Paused, Publish a draft, Delete.
- **New Advertisement modal** — title, message, target event type, target user, date targeting (All dates / Today / This week / Custom range), placement — with a **live "reach" preview** that recalculates the number of matching events (and names a few) as the targeting fields change. Can be published immediately or saved as a draft.

## 12. Support
Ticketing and support-team workload management.
- **Columns**: ticket ID, user (+ User ID), category, priority, assignee, status, created date, actions.
- **Search/filters**: search by ticket, user, or category; status chips All / Open / In Progress / Resolved / High priority.
- **Inline reassignment** — the Assigned To cell is itself a dropdown of the support team (shown with support level, e.g. "Ramesh K — L2 Support"); reassigning auto-bumps status to In Progress unless the ticket is already Resolved.
- **Resolve** action is available until a ticket is marked Resolved.
- **New Ticket modal** — user, category (Payments / QR Collection / OTP-Login / Family Sharing / Gift Records / Billing-Packages / Other), priority, assignee, and a free-text description. "Create & assign" stays disabled until a user and an assignee are chosen; the new ticket is numbered sequentially from the highest existing ticket ID.

## 13. Content Management
Everything end users see in the app, editable from one place — a landing grid of six sub-areas:
- **Onboarding Screens** — read-only list of the app's intro screens with copy/illustration version notes and an Edit stub per screen.
- **Event Type Themes** — read-only list of the visual theme per event type (e.g. Wedding = maroon & gold, Valaikappu = yellow & green), each marked Live or In review.
- **FAQ & Help Articles** — add a new article by title (created as a draft by default); each existing article shows its category and a Published/Draft toggle, with delete.
- **App Announcements** — add a new banner by text (published live by default); each shows its placement and a Live/Off toggle, with delete.
- **Legal & Policies** — read-only list (Terms of Service, Privacy Policy, Refund Policy) with last-updated notes and an Edit stub.
- **Translations** — per-language completion bars (Tamil and English at 100%, Telugu 68%, Kannada 41%, Malayalam 24%, Hindi 12%).

## 14. Settings
Platform-wide configuration — a landing grid of eight sub-areas, each with its own editable form and a Save changes action:
- **General** — app name, data region, default language, currency.
- **Packages** — Pro and Advanced monthly prices, free trial length, grace period after a failed payment (Regular's ₹0 price is fixed).
- **Security** — require 2FA for all admins, session timeout, and an admin IP allowlist (add/remove entries).
- **Fraud Detection Rules** — max gift entries per minute, content-filter flag threshold (0–1), auto-suspend on High-severity cases, flag duplicate QR scans.
- **Notification Settings** — OTP/SMS provider, monthly SMS budget, email sender address.
- **Theme** — brand color (5 preset swatches), dark mode (beta) toggle.
- **Backup** — last backup time, auto-backup toggle, frequency, and a manual "Backup now" action.
- **API Configuration** — masked API key with Regenerate, rate limit, and a webhook URL list (add/remove).

## 15. Admin Management
Back-office staff accounts and screen-level permissions — Super Admin only.
- **Columns**: admin (avatar, name, email), role, screen access, 2FA status, last active, actions.
- **Screen access is granted per module** — an admin only sees the sidebar items they've been granted, shown as chips (or "All modules" for a Super Admin). 2FA can be toggled inline for non-Super-Admins.
- The Super Admin row is protected: no edit, remove, or 2FA-toggle action is exposed for it.
- **Add/Edit Admin modal** — name, email, role (Support / Support Lead / Ops Admin / Analyst / Content Admin), a require-2FA toggle, and a checklist grid covering every module **except Admin Management itself** (with Select all / Clear shortcuts) — meaning that permission can only ever belong to a Super Admin, never granted through this UI. Saving is disabled until a name and at least one screen are selected.

## 16. Audit Logs
An immutable trail of admin actions.
- **Columns**: admin, action taken, module, IP address, device, timestamp.
- **Search/filters**: search across admin/action/IP/module text; chips for All / Users / Support / Settings / Notifications / Today.
- Sample entries cover a CSV export, a ticket resolution, a user suspension, a pricing change, and a push-campaign send — illustrating that every sensitive action (exports, status changes, config edits, comms) is expected to be logged with actor, IP, and device.

## 17. Global Search
A single header-level search box that queries five record types at once as the admin types: Users (name / ID / email / mobile / city), Events (name / host / type), Gift Records (ID / sender / receiver), Support Tickets (ID / user / category), and Subscriptions (ID / user / plan). Results come back grouped and capped (up to 4 Users, up to 3 of each other type). Selecting a **User** or **Gift** result deep-links straight to that record (the profile page or the transaction drawer); Event, Ticket, and Subscription results navigate to their respective list screens, since those record types have no dedicated single-record view in this build.

## 18. Navigation Shell (Sidebar + Header)
- **Sidebar** — brand mark, all 16 top-level modules with icons, collapsible to an icon-only width. The active item stays highlighted even while viewing a drill-down page (User Details keeps "Users" active, Family Detail keeps "Family Accounts" active). The Fraud item carries a live badge counting cases with status "New."
- **Header** — sticky with a blurred background; a breadcrumb ("Relfam Admin / [current page]"); the Global Search bar; a Fraud bell (shows a red dot when new cases exist, click jumps to Fraud); a Notifications bell (jumps to Notifications); a static Help icon; the logged-in admin's identity (avatar, name, role); and a Logout icon.
- **Page header** — every module renders a title plus a short contextual subtitle tailored to that screen (e.g. Dashboard's greeting, Payments' "who paid, who's active, and where payments failed," Fraud's description of the detection pipeline).
