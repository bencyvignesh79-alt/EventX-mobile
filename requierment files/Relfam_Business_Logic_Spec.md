# Relfam --- Business Logic Specification

**Document:** `Relfam_Business_Logic_Spec.md`\
**Purpose:** Developer-ready business rules and workflows for the Relfam
Gift Ledger MVP and planned supporting modules.\
**Status:** Draft v1.0.

------------------------------------------------------------------------

# 1. Product Core

Relfam maintains a digital ledger for gifts/contributions exchanged
around family and social events.

There are two major user perspectives:

1.  **Receiver flow** --- user is hosting an event and records gifts
    received.
2.  **Sender flow** --- user is attending/supporting someone else's
    event and records gifts sent.

A single verified digital payment may create one canonical transaction
that is visible to both sides.

Manual/offline payments must not automatically appear on the receiver
side because Relfam cannot independently verify that payment.

------------------------------------------------------------------------

# 2. Authentication Flow

## 2.1 Login

User may log in using:

-   mobile number + password
-   email + password
-   mobile number + OTP
-   email + OTP

### Rules

-   Verify account exists.
-   Validate credentials.
-   For OTP login, issue OTP and verify it.
-   Create authenticated session/token after success.
-   Record `last_login_at`.

------------------------------------------------------------------------

# 3. Registration

Fields:

-   First name
-   Last name
-   Mobile number
-   Optional alternate mobile number
-   Email
-   Password
-   Confirm password

### Validation

-   First/last name required.
-   Mobile number normalized and unique.
-   Email normalized and unique if supplied.
-   Password and confirmation must match.
-   Password must meet security policy.
-   OTP verification required for phone registration.
-   Email verification may be required according to deployment policy.

After successful registration:

``` text
Registration
→ OTP verification
→ User creation
→ Profile creation
→ Login/session
→ Home
```

------------------------------------------------------------------------

# 4. Receiver Flow

## 4.1 Entry

Receiver selects:

``` text
Receive Gift
```

Then:

``` text
Open Existing Event
OR
Create New Event
```

------------------------------------------------------------------------

# 5. Create Event Flow

## 5.1 Event type

Show predefined event types:

-   Wedding
-   Birthday
-   Housewarming
-   Anniversary
-   Engagement
-   Reception
-   Naming Ceremony
-   Ear Piercing
-   Religious Event
-   Corporate Event
-   Memorial
-   Custom

The system may add more types without changing transaction logic.

------------------------------------------------------------------------

## 5.2 Event details

Depending on event type, collect applicable details.

For wedding, for example:

-   host
-   bride name
-   groom name
-   relevant profile details
-   event date/time
-   location
-   UPI ID
-   event photo

### Mandatory event photo

The planned receiver event flow requires an event photo before event
creation can complete.

### Location choices

User can:

1.  use current/live location
2.  search for a place
3.  manually enter a location

For search:

``` text
User types place
→ location suggestions
→ user selects suggestion
→ store formatted address + coordinates + external place ID where available
```

------------------------------------------------------------------------

# 6. Event Creation Confirmation

User performs the final confirmation/swipe action.

Backend:

``` text
Validate fields
→ generate event_id
→ generate unique event_code
→ create event
→ create location
→ save photo reference
→ save UPI configuration
→ return event
```

Show success modal:

-   Event created
-   View
-   Edit
-   Share on WhatsApp

------------------------------------------------------------------------

# 7. Share Event

When user selects Share on WhatsApp:

Create share content containing:

-   event name
-   event date
-   event details
-   event code/link
-   contribution/payment link

WhatsApp itself handles recipient selection.

Relfam should not assume the user actually sent the WhatsApp message
merely because the share sheet opened.

------------------------------------------------------------------------

# 8. Open Existing Event --- Receiver

Display events owned/managed by the user.

Event card should show:

-   event type/name
-   total gift received
-   total returned/sent
-   pending
-   status

Example:

``` text
Wedding
Received: ₹50,000
Returned: ₹20,000
Pending: ₹30,000
Status: Partially Completed
```

------------------------------------------------------------------------

# 9. Receiver Add Entry

When receiver manually records a gift:

Fields:

-   sender name
-   sender mobile number
-   sender place
-   amount
-   payment mode
-   old/new classification
-   date/time
-   notes

Save:

``` text
Create transaction
→ assign receiver
→ assign event
→ store amount
→ store payment mode
→ store OLD/NEW
→ calculate settlement state
```

------------------------------------------------------------------------

# 10. Old vs New Logic

This is a core Relfam concept.

Suppose Person A previously gave Person B:

``` text
₹500
```

Later Person B gives Person A:

``` text
₹500
```

If the sender explicitly selects `OLD`, the system treats this as
reciprocal settlement.

The previous outstanding amount can therefore become:

``` text
₹500 outstanding
- ₹500 settlement
= ₹0
```

Status becomes:

``` text
COMPLETED
```

------------------------------------------------------------------------

# 11. Partial Settlement

Suppose:

``` text
Previous gift = ₹500
Settlement = ₹300
```

Then:

``` text
Outstanding = ₹200
```

Status:

``` text
PARTIALLY_COMPLETED
```

Do not mark it completed until the eligible outstanding amount is fully
settled.

------------------------------------------------------------------------

# 12. New Gift

If the user gives another fresh amount and selects `NEW`, it is not
treated as settlement of an old reciprocal obligation.

Example:

``` text
Old obligation = ₹500
New gift = ₹500
```

The new gift is stored independently as a NEW contribution.

------------------------------------------------------------------------

# 13. Cash Payment

If receiver receives cash:

``` text
Receiver
→ Add Entry
→ payment mode = CASH
→ OLD/NEW
→ save
```

This creates a receiver-side record.

It must NOT automatically create a sender-side verified record.

------------------------------------------------------------------------

# 14. Other/Offline Payment

For cheque, bank transfer recorded manually, or other external method:

-   user may manually record it
-   source = MANUAL
-   verification depends on the available evidence
-   do not automatically create a verified receiver-side transaction
    unless the payment is independently confirmed

------------------------------------------------------------------------

# 15. Relfam Digital Payment Flow

When user contributes using a Relfam event payment link/QR:

``` text
Find Event / Payment Link
→ Contribution
→ sender details
→ amount
→ UPI payment
→ provider/payment verification
→ payment success
→ canonical transaction creation
```

Then:

``` text
Sender side record
+
Receiver side visibility
```

must reference the same canonical transaction.

Do not create two unrelated financial transactions.

------------------------------------------------------------------------

# 16. Payment Idempotency

If payment callback/webhook is received twice:

``` text
First callback → create transaction
Second callback → detect existing provider reference
             → do not create duplicate transaction
```

Provider transaction/reference must be unique.

------------------------------------------------------------------------

# 17. Sender Flow

Sender selects:

``` text
Send Gift
```

Then:

``` text
Open Existing Collection
OR
Create New Collection
```

------------------------------------------------------------------------

# 18. Sender Collections

Suggested collection categories:

-   Family Event
-   Friends Event
-   Religious Event
-   Corporate Event
-   Custom

Selecting a category creates/opens a collection.

The collection is an organizational folder, not a financial transaction.

------------------------------------------------------------------------

# 19. Sender Existing Collection

Example:

``` text
Family Events

Arun
₹5,000
OLD
Completed

Nithya
₹2,000
NEW
Pending
```

Display:

-   name
-   mobile
-   place
-   event
-   amount
-   OLD/NEW
-   status
-   time/date
-   transaction source

------------------------------------------------------------------------

# 20. Sender Add Entry

Use a `+ Add Entry` action.

Fields:

-   receiver name
-   receiver mobile
-   event
-   amount
-   payment mode
-   OLD/NEW
-   place
-   date/time
-   notes

For voice input:

``` text
Tap microphone
→ speech-to-text
→ parse fields
→ show confirmation preview
→ user confirms
→ save transaction
```

Never save voice-parsed financial data without user confirmation.

------------------------------------------------------------------------

# 21. Sender Direct UPI Payment

If user pays a receiver directly through an external UPI app without a
Relfam-generated payment link/flow:

``` text
Relfam cannot know with certainty that payment occurred.
```

Therefore:

``` text
User returns to Relfam
→ Add Entry manually
→ save as manual/direct UPI
```

Do not auto-create receiver-side records.

------------------------------------------------------------------------

# 22. Digital Payment vs Offline Payment Rule

  Payment scenario                    Sender record         Receiver record
  --------------------------------- --------------- -----------------------
  Relfam verified digital payment         Automatic               Automatic
  Cash                                       Manual   Manual receiver entry
  External UPI outside Relfam                Manual           Not automatic
  Other offline payment                      Manual           Not automatic
  Verified provider callback              Automatic               Automatic

This is a critical anti-fraud rule.

------------------------------------------------------------------------

# 23. Reciprocal Status Synchronization

Suppose:

``` text
User A gave User B ₹500
```

Receiver-side record is NEW/PENDING from the reciprocal accounting
perspective.

Later:

``` text
User B gives User A ₹500 as OLD
```

The settlement engine links the new transaction to the prior
transaction.

Result:

``` text
Previous outstanding = ₹500
Settlement = ₹500
Remaining = ₹0
Status = COMPLETED
```

Both sides should display the updated reciprocal state.

------------------------------------------------------------------------

# 24. Partial Reciprocal Settlement

Example:

``` text
Outstanding = ₹500
New OLD settlement = ₹300
```

Result:

``` text
Remaining = ₹200
Status = PARTIALLY_COMPLETED
```

The system must retain the original transaction and create a settlement
link for ₹300.

------------------------------------------------------------------------

# 25. Multiple Historical Transactions

If the same phone number appears across multiple events:

``` text
Do not merge all events into one transaction.
```

Instead:

``` text
Person
 ├── Event A → Transaction
 ├── Event B → Transaction
 └── Event C → Transaction
```

Phone number provides person matching, not event merging.

------------------------------------------------------------------------

# 26. Phone-Based History

If a person later registers with a phone number already used in ledger
records:

``` text
OTP verification
→ normalize phone
→ find eligible historical contact/shadow records
→ offer matching/claim flow
→ link records
```

Historical records must not be silently exposed if ownership/privacy
rules do not permit it.

------------------------------------------------------------------------

# 27. Search and Quick Filters

Quick filters:

-   OLD
-   NEW
-   PENDING
-   PARTIALLY_COMPLETED
-   COMPLETED

Search by:

-   name
-   mobile number
-   location

------------------------------------------------------------------------

# 28. Detailed Filters

Support combinations such as:

-   name
-   mobile number
-   location
-   amount range
-   status
-   OLD/NEW
-   payment mode
-   event
-   collection
-   date range
-   transaction source
-   receipt/record count where applicable

Backend must apply authorization before returning results.

------------------------------------------------------------------------

# 29. Voice Entry

Voice entry is an input convenience, not an alternate accounting system.

Example:

User says:

``` text
"Arun gave me five thousand cash, old"
```

System extracts:

``` text
Name = Arun
Amount = ₹5,000
Payment = CASH
Classification = OLD
```

Show:

``` text
Please confirm:
Arun
₹5,000
Cash
OLD
```

Only after confirmation create the transaction.

------------------------------------------------------------------------

# 30. Transaction History

Transaction History is a system-wide inbox/read layer.

Its purpose is to capture transactions that have been created or
automatically received but have not yet been organized into a specific
collection/folder.

Example:

``` text
Transaction History
--------------------
₹5,000 from Arun
₹2,000 to Nithya
₹1,000 from Kumar
```

User may later move records to:

``` text
Family Events
Friends Events
Religious Events
```

Moving a transaction must not change its financial identity.

------------------------------------------------------------------------

# 31. Records & Summary

The summary changes according to the user's role/context.

## Sender summary

Show:

-   total value sent
-   total value received
-   amount expected/remaining
-   completed
-   pending
-   partially completed

## Receiver summary

Show:

-   total gifts received
-   total returned
-   total completed
-   total pending
-   total partially completed

All summary figures are calculated from the ledger.

------------------------------------------------------------------------

# 32. Profile

Profile can contain:

-   name
-   mobile number
-   email
-   address
-   profile photo

Changing mobile/email:

``` text
Request change
→ OTP
→ verify
→ update
→ audit log
```

------------------------------------------------------------------------

# 33. Reminders

User can create reminders.

Example:

``` text
Remind me to return ₹500 to Arun
```

Reminder may reference:

-   event
-   transaction
-   person
-   custom note

When due:

``` text
Reminder engine
→ create notification
→ push notification
→ show in notification center
```

------------------------------------------------------------------------

# 34. Family Account

Owner can add family members using:

-   name
-   relationship
-   mobile number

Flow:

``` text
Owner adds member
→ OTP invitation/verification
→ member becomes family member
→ shadow account created if necessary
```

------------------------------------------------------------------------

# 35. Shadow Account

A shadow account allows the family owner to maintain records for a
member who has not yet independently registered.

When that person later logs in using the same verified mobile number:

``` text
OTP
→ identify shadow account
→ claim
→ convert/link to real user
→ preserve historical records
```

Access must respect family permissions.

------------------------------------------------------------------------

# 36. Family Roles

Recommended roles:

``` text
OWNER
ADMIN
MEMBER
VIEWER
```

Example:

-   OWNER: full control
-   ADMIN: manage permitted family data
-   MEMBER: view/add according to policy
-   VIEWER: read-only

Do not give every family member full financial edit access by default.

------------------------------------------------------------------------

# 37. Privacy

Settings should include:

-   Hide amounts
-   Allow/disallow Find Event
-   Family visibility
-   Transaction visibility
-   App lock
-   Biometric authentication

Privacy restrictions must be enforced on APIs.

------------------------------------------------------------------------

# 38. Find Event

Future/public flow:

``` text
Find Event
→ enter event code
→ search
→ show permitted event details
```

Display:

-   event name
-   event photo
-   date/time
-   location
-   contribution link
-   streaming link if available
-   share

Do not expose gift ledger entries to a stranger unless the event owner
explicitly permits it.

------------------------------------------------------------------------

# 39. Find Event Contribution

User taps:

``` text
Contribution
```

System opens contribution form.

Pre-fill:

-   receiver/event
-   event ID
-   event code
-   receiver UPI/payment configuration

User supplies:

-   own name
-   mobile
-   amount
-   optional place
-   OLD/NEW where applicable

Then payment occurs.

If payment is verified:

``` text
canonical transaction
→ sender record
→ receiver record
→ notification
```

------------------------------------------------------------------------

# 40. Event Location

Location click:

``` text
Event
→ Location
→ map/navigation
```

Relfam stores coordinates where available.

External map provider handles actual navigation.

------------------------------------------------------------------------

# 41. Event Streaming

Future:

``` text
Event
→ Live Stream
→ open configured streaming URL
```

Relfam should store the stream reference but need not become a video
streaming provider in the MVP.

------------------------------------------------------------------------

# 42. Event Not Found / Create Event

If a receiver cannot find the relevant event:

``` text
Find Event
→ Event not available?
→ Create Event
```

The user can create a new event and obtain an event code.

A future claim flow can allow the actual event owner to claim the event.

------------------------------------------------------------------------

# 43. Notifications

Notification types may include:

-   payment successful
-   contribution received
-   reminder due
-   family invitation
-   event shared
-   event claimed
-   transaction update
-   settlement completed
-   partial settlement

Every notification should reference the related entity where
appropriate.

------------------------------------------------------------------------

# 44. Settings

Recommended settings:

### Account

-   profile
-   change mobile
-   change email
-   password

### Privacy & Security

-   hide amounts
-   app lock
-   biometric
-   visibility

### Notifications

-   payment notifications
-   reminders
-   family notifications
-   marketing notifications

### Help

-   FAQ
-   contact support
-   email support

### Feedback

-   feedback form
-   rating/comment
-   issue category

### Share

-   share Relfam

### Session

-   logout

------------------------------------------------------------------------

# 45. Logout

Logout should:

-   invalidate/revoke active session/token
-   clear local sensitive session state
-   keep user records in database
-   return to login

Logout must not delete data.

------------------------------------------------------------------------

# 46. Error Handling

Examples:

### Duplicate phone

``` text
This mobile number is already registered.
```

### Invalid OTP

``` text
Invalid or expired OTP.
```

### Payment pending

``` text
Payment is still being verified.
```

Do not mark payment successful from client-side redirect alone.

### Event not found

``` text
No event found for this code.
```

### Unauthorized transaction

Do not return private transaction data. Return a generic authorization
response.

------------------------------------------------------------------------

# 47. Concurrency Rules

Two requests can arrive simultaneously.

Example:

``` text
Payment webhook
+
manual save
```

Backend must use:

-   database transactions
-   unique constraints
-   idempotency keys
-   row locking where required

Never rely on UI checks alone.

------------------------------------------------------------------------

# 48. Financial Calculation Rules

All monetary calculations happen server-side.

Example:

``` text
received = SUM(valid received transactions)
returned = SUM(valid settlement transactions)
pending = eligible outstanding balance
```

Do not allow the mobile app to submit a final balance and have the
server trust it.

------------------------------------------------------------------------

# 49. Audit Requirements

Log:

-   event creation
-   event update
-   transaction creation
-   transaction edit
-   transaction reversal
-   payment status changes
-   family member addition/removal
-   profile identifier changes
-   privacy changes
-   shadow account claim

Audit data should be append-oriented.

------------------------------------------------------------------------

# 50. MVP Priorities

## Phase 1 --- Gift Ledger

Must have:

1.  Registration/login
2.  OTP
3.  Receiver event creation
4.  Receiver event list
5.  Add gift
6.  Old/New
7.  Cash/UPI/manual classification
8.  Sender collection
9.  Sender add entry
10. Transaction history
11. Summary
12. Search/filter
13. Event code
14. Digital payment linkage
15. Basic notifications

## Phase 2

-   Family accounts
-   Shadow accounts
-   Reminders
-   Advanced privacy
-   Voice entry
-   Better event discovery

## Future

-   AI invitation
-   streaming
-   vendor marketplace
-   family vault
-   bills/payments
-   rewards
-   advanced analytics

------------------------------------------------------------------------

# 51. Non-Negotiable Business Rules

1.  Every user has a unique `user_id`.
2.  Every event has a unique `event_id`.
3.  Every transaction has a unique `transaction_id`.
4.  Every event has a unique event code.
5.  Every verified digital payment maps to one canonical transaction.
6.  Digital verified payment can appear on both sides.
7.  Cash/offline/manual payment must not automatically appear as a
    verified receiver-side record.
8.  OLD/NEW is explicit user classification.
9.  OLD settlement can reduce outstanding reciprocal amount.
10. Partial settlement produces `PARTIALLY_COMPLETED`.
11. Full settlement produces `COMPLETED`.
12. Transactions are never duplicated just because they appear in
    different folders.
13. Collections organize transactions; they do not own financial truth.
14. Transaction History is the fallback/system-wide record layer.
15. Phone number can help match a person, but name alone must not merge
    accounts.
16. Amounts and balances are calculated server-side.
17. Payment success must be independently verified.
18. Payment callbacks must be idempotent.
19. Privacy rules are enforced server-side.
20. Audit logs must preserve sensitive changes.

------------------------------------------------------------------------

# 52. End-to-End Example

## Scenario

Arun attends Louis's wedding.

### Receiver

Louis creates:

``` text
Event: Louis Wedding
Event ID: E123
Event Code: RLF-8K2P
UPI: louis@upi
```

### Digital contribution

Arun finds event:

``` text
RLF-8K2P
```

He contributes:

``` text
₹5,000
```

Payment succeeds.

Backend:

``` text
Payment verified
→ Transaction T9001
→ sender = Arun
→ receiver = Louis
→ event = Louis Wedding
→ amount = ₹5,000
→ payment_mode = UPI
→ source = PAYMENT_LINK
→ verification = VERIFIED
```

Both users can see the same canonical transaction.

### Offline scenario

Later Louis receives ₹500 cash from another person.

Louis manually enters:

``` text
₹500
CASH
NEW
```

Only Louis's receiver-side ledger is created.

The sender does not automatically receive a Relfam record because Relfam
has no proof that the cash was actually given.

------------------------------------------------------------------------

# 53. Recommended Backend Architecture

``` text
Mobile/Web Client
       ↓
API Gateway / Backend
       ↓
Authentication Service
       ↓
Event Service
       ↓
Ledger Service
       ↓
Payment Service
       ↓
Notification Service
       ↓
PostgreSQL
```

For MVP these can live in one modular backend rather than separate
microservices.

Recommended logical modules:

``` text
auth
users
events
ledger
payments
collections
families
notifications
reminders
search
audit
```

Do not start with microservices unless scale/team size requires them.

------------------------------------------------------------------------

# 54. API Transaction Boundary

For a verified digital payment:

``` text
BEGIN TRANSACTION

create/update payment
create canonical ledger transaction
link sender
link receiver
link event
update settlement state
create notifications
write audit record

COMMIT
```

If any critical financial operation fails, rollback the database
transaction and retry safely.

------------------------------------------------------------------------

# 55. Definition of Done

The Gift Ledger backend is ready for MVP when:

-   authentication works
-   event creation works
-   event code works
-   receiver entry works
-   sender entry works
-   OLD/NEW works
-   partial/full settlement works
-   transaction history works
-   collections work
-   digital payment is idempotent
-   verified digital payment is visible on both sides
-   offline payment does not create an unverified receiver record
-   search/filter works
-   balances are server-calculated
-   audit logs exist
-   authorization tests pass

------------------------------------------------------------------------

# 56. Final Architecture Principle

Relfam should be designed around one idea:

> **One real financial event should have one canonical transaction
> identity, while users may view and organize that transaction in
> different contexts.**

That principle should remain unchanged even when Relfam later adds
wallets, family accounts, vendors, invitations, streaming, rewards or
other modules.
