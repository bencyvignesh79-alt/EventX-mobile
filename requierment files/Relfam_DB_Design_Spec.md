# Relfam --- Database Design Specification

**Document:** `Relfam_DB_Design_Spec.md`\
**Purpose:** Developer-ready database design for the Relfam gift/event
ledger MVP and its planned supporting modules.\
**Status:** Draft v1.0 --- based on the product flows described by the
founder.

------------------------------------------------------------------------

## 1. Scope

This document defines the persistent data model for:

-   User registration, login and OTP authentication
-   User profile
-   Events and event codes
-   Gift records / ledger entries
-   Sender and receiver relationships
-   Old/New gift classification
-   Cash, UPI and other payment modes
-   Digital-payment linked transactions
-   Transaction history and collection/folder organization
-   Family accounts and shadow accounts
-   Reminders and notifications
-   Event discovery / Find Event
-   Event location
-   Event photos
-   Search and filtering
-   Audit and security metadata

### 1.1 Core identity rule

Every important entity must have its own immutable unique identifier:

  Entity            Identifier
  ----------------- --------------------
  User              `user_id`
  Event             `event_id`
  Transaction       `transaction_id`
  Collection        `collection_id`
  Family            `family_id`
  Family member     `family_member_id`
  Payment attempt   `payment_id`
  Notification      `notification_id`
  Reminder          `reminder_id`

Do not use phone number, email, name, or event code as the primary key.

------------------------------------------------------------------------

# 2. Recommended Database

## 2.1 Database type

Use a relational database such as **PostgreSQL**.

Reason:

-   Gift records have strong relationships.
-   Sender/receiver settlement requires transactional consistency.
-   Digital payment can create linked records on two sides.
-   Family membership requires permissions.
-   Reporting requires aggregation.
-   Search/filtering benefits from indexed structured columns.

Use UUIDs for internal identifiers.

## 2.2 General conventions

-   Primary keys: UUID
-   Monetary values: `NUMERIC(14,2)`
-   Timestamps: `TIMESTAMPTZ`
-   Phone numbers: normalized E.164 format where possible
-   Email: normalized lowercase
-   Boolean fields: explicit `BOOLEAN`
-   Soft deletion: `deleted_at`
-   Audit timestamps: `created_at`, `updated_at`

Never use floating-point types for money.

------------------------------------------------------------------------

# 3. Entity Relationship Overview

``` text
USER
 ├── USER_AUTH
 ├── USER_PROFILE
 ├── FAMILY_MEMBERSHIP ─── FAMILY
 ├── EVENTS
 │    ├── EVENT_PHOTOS
 │    ├── EVENT_LOCATIONS
 │    ├── EVENT_ACCESS
 │    └── COLLECTIONS
 │          └── TRANSACTIONS
 │                ├── PAYMENT_ATTEMPTS
 │                └── TRANSACTION_LINKS
 ├── REMINDERS
 └── NOTIFICATIONS

TRANSACTIONS
 ├── sender_user_id
 ├── receiver_user_id
 ├── event_id
 └── collection_id

CONTACT/LEDGER PERSON
 └── may exist before the person registers

A later verified user may be matched to historical
records through normalized phone number + controlled
claim/matching logic.
```

------------------------------------------------------------------------

# 4. User Tables

## 4.1 `users`

Stores the application's canonical user identity.

  Column                Type           Constraints
  --------------------- -------------- --------------------------------
  `user_id`             UUID           PK
  `first_name`          VARCHAR(100)   NOT NULL
  `last_name`           VARCHAR(100)   NOT NULL
  `phone_number`        VARCHAR(20)    UNIQUE, nullable
  `email`               VARCHAR(255)   UNIQUE, nullable
  `password_hash`       TEXT           nullable for OTP-only accounts
  `status`              VARCHAR(30)    ACTIVE / LOCKED / DELETED
  `phone_verified_at`   TIMESTAMPTZ    nullable
  `email_verified_at`   TIMESTAMPTZ    nullable
  `last_login_at`       TIMESTAMPTZ    nullable
  `created_at`          TIMESTAMPTZ    NOT NULL
  `updated_at`          TIMESTAMPTZ    NOT NULL
  `deleted_at`          TIMESTAMPTZ    nullable

### Rules

-   At least one login identifier must exist.
-   Phone number must be unique among active accounts.
-   Email must be unique case-insensitively.
-   Password must never be stored in plain text.
-   OTP verification is required when using phone-based authentication.
-   If a phone/email is changed, re-verification is required.

------------------------------------------------------------------------

## 4.2 `user_profiles`

  Column                Type           Constraints
  --------------------- -------------- ---------------
  `user_profile_id`     UUID           PK
  `user_id`             UUID           FK → users
  `display_name`        VARCHAR(200)   nullable
  `address_line_1`      VARCHAR(255)   nullable
  `address_line_2`      VARCHAR(255)   nullable
  `city`                VARCHAR(100)   nullable
  `state`               VARCHAR(100)   nullable
  `country`             VARCHAR(100)   default India
  `postal_code`         VARCHAR(20)    nullable
  `profile_photo_url`   TEXT           nullable
  `created_at`          TIMESTAMPTZ    NOT NULL
  `updated_at`          TIMESTAMPTZ    NOT NULL

One user should have at most one active profile.

------------------------------------------------------------------------

## 4.3 `otp_verifications`

  -----------------------------------------------------------------------
  Column                              Type
  ----------------------------------- -----------------------------------
  `otp_id`                            UUID PK

  `user_id`                           UUID nullable

  `identifier`                        VARCHAR(255)

  `identifier_type`                   PHONE / EMAIL

  `otp_hash`                          TEXT

  `purpose`                           LOGIN / REGISTRATION / CHANGE_PHONE
                                      / CHANGE_EMAIL / FAMILY_INVITE /
                                      CLAIM_ACCOUNT

  `expires_at`                        TIMESTAMPTZ

  `verified_at`                       TIMESTAMPTZ nullable

  `attempt_count`                     INT

  `created_at`                        TIMESTAMPTZ
  -----------------------------------------------------------------------

Never store a raw OTP.

------------------------------------------------------------------------

# 5. Events

## 5.1 `events`

An event represents a hosted function for which gift/contribution
records may be maintained.

  Column                Type           Constraints
  --------------------- -------------- ---------------------------------------
  `event_id`            UUID           PK
  `owner_user_id`       UUID           FK → users
  `event_type_id`       UUID           FK → event_types
  `event_code`          VARCHAR(30)    UNIQUE
  `event_name`          VARCHAR(255)   NOT NULL
  `host_name`           VARCHAR(255)   nullable
  `bride_name`          VARCHAR(255)   nullable
  `groom_name`          VARCHAR(255)   nullable
  `description`         TEXT           nullable
  `event_date`          DATE           nullable
  `event_time`          TIME           nullable
  `location_id`         UUID           FK → event_locations nullable
  `upi_id`              VARCHAR(255)   nullable
  `primary_photo_url`   TEXT           NOT NULL
  `status`              VARCHAR(30)    DRAFT / ACTIVE / COMPLETED / ARCHIVED
  `visibility`          VARCHAR(30)    PRIVATE / CODE_ACCESS / PUBLIC
  `created_at`          TIMESTAMPTZ    NOT NULL
  `updated_at`          TIMESTAMPTZ    NOT NULL
  `deleted_at`          TIMESTAMPTZ    nullable

### Rules

1.  Every event gets a unique `event_id`.
2.  Every event gets a unique human-friendly `event_code`.
3.  Event photo is mandatory for the planned event creation flow.
4.  UPI ID is required when online contribution is enabled.
5.  Event owner must be an authenticated user.
6.  Event code must not expose the database UUID.

------------------------------------------------------------------------

## 5.2 `event_types`

Seed/static data.

Examples:

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

  Column            Type
  ----------------- --------------------
  `event_type_id`   UUID PK
  `code`            VARCHAR(50) UNIQUE
  `name`            VARCHAR(100)
  `description`     TEXT
  `is_active`       BOOLEAN
  `display_order`   INT

------------------------------------------------------------------------

## 5.3 `event_locations`

Supports live location, search suggestion, and manual address.

  Column                Type
  --------------------- ------------------------
  `location_id`         UUID PK
  `source_type`         LIVE / SEARCH / MANUAL
  `place_name`          VARCHAR(255)
  `formatted_address`   TEXT
  `address_line_1`      VARCHAR(255)
  `city`                VARCHAR(100)
  `state`               VARCHAR(100)
  `country`             VARCHAR(100)
  `postal_code`         VARCHAR(20)
  `latitude`            NUMERIC(10,7)
  `longitude`           NUMERIC(10,7)
  `external_place_id`   VARCHAR(255) nullable
  `created_at`          TIMESTAMPTZ

Coordinates should be stored when available.

------------------------------------------------------------------------

## 5.4 `event_photos`

  Column             Type
  ------------------ -----------------
  `event_photo_id`   UUID PK
  `event_id`         UUID FK
  `file_url`         TEXT
  `photo_type`       COVER / GALLERY
  `sort_order`       INT
  `created_at`       TIMESTAMPTZ

------------------------------------------------------------------------

# 6. Collections

A collection is an organizational bucket used by the sender side. It is
not the same thing as an event.

Examples:

-   Family Event
-   Friends Event
-   Religious Event
-   Corporate Event

## 6.1 `collections`

  -----------------------------------------------------------------------
  Column                              Type
  ----------------------------------- -----------------------------------
  `collection_id`                     UUID PK

  `owner_user_id`                     UUID FK → users

  `collection_type`                   FAMILY / FRIENDS / RELIGIOUS /
                                      CORPORATE / CUSTOM

  `collection_name`                   VARCHAR(255)

  `description`                       TEXT nullable

  `status`                            ACTIVE / ARCHIVED

  `created_at`                        TIMESTAMPTZ

  `updated_at`                        TIMESTAMPTZ
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 6.2 `collection_transactions`

Used to move/organize a transaction into a collection without changing
its underlying identity.

  Column                        Type
  ----------------------------- -------------
  `collection_transaction_id`   UUID PK
  `collection_id`               UUID FK
  `transaction_id`              UUID FK
  `added_by_user_id`            UUID FK
  `added_at`                    TIMESTAMPTZ

Unique constraint:

``` text
UNIQUE(collection_id, transaction_id)
```

------------------------------------------------------------------------

# 7. Gift Ledger

## 7.1 `ledger_contacts`

This is important because a sender/receiver may exist in the ledger
before registering on Relfam.

  Column             Type
  ------------------ --------------------------
  `contact_id`       UUID PK
  `owner_user_id`    UUID FK
  `name`             VARCHAR(255)
  `phone_number`     VARCHAR(20)
  `place`            VARCHAR(255) nullable
  `linked_user_id`   UUID nullable FK → users
  `created_at`       TIMESTAMPTZ
  `updated_at`       TIMESTAMPTZ

### Matching rule

Phone number is the strongest matching candidate.

Name alone must not automatically merge two people.

------------------------------------------------------------------------

## 7.2 `transactions`

This is the core gift/contribution ledger.

  Column                  Type
  ----------------------- ----------------------------------------------
  `transaction_id`        UUID PK
  `event_id`              UUID nullable FK
  `collection_id`         UUID nullable FK
  `sender_user_id`        UUID nullable FK
  `receiver_user_id`      UUID nullable FK
  `sender_contact_id`     UUID nullable FK
  `receiver_contact_id`   UUID nullable FK
  `amount`                NUMERIC(14,2)
  `gift_category`         GIFT / MOI / OTHER
  `gift_classification`   OLD / NEW
  `payment_mode`          CASH / UPI / OTHER
  `transaction_source`    MANUAL / PAYMENT_LINK / QR / IMPORT / SYSTEM
  `verification_status`   PENDING / VERIFIED / FAILED / NOT_APPLICABLE
  `settlement_status`     PENDING / PARTIALLY_COMPLETED / COMPLETED
  `notes`                 TEXT nullable
  `occurred_at`           TIMESTAMPTZ
  `created_by_user_id`    UUID FK
  `created_at`            TIMESTAMPTZ
  `updated_at`            TIMESTAMPTZ
  `deleted_at`            TIMESTAMPTZ nullable

### Critical rule

A transaction is immutable in identity. Corrections should update
permitted fields or create an adjustment/reversal record; never create a
new transaction just to overwrite history.

------------------------------------------------------------------------

# 8. Old/New Gift Logic

`gift_classification` means the user's relationship accounting:

-   `NEW`: a fresh gift/contribution that does not settle an existing
    reciprocal obligation.
-   `OLD`: contribution intended to settle a previously recorded gift
    obligation.

The system must not decide OLD/NEW only from amount.

The user explicitly selects OLD or NEW.

A settlement engine then calculates:

``` text
previous_outstanding
+ new reciprocal amount
- settlement amount
= current_outstanding
```

------------------------------------------------------------------------

# 9. Reciprocal / Settlement Records

## 9.1 `ledger_relationships`

Represents the reciprocal relationship between two parties.

  Column              Type
  ------------------- -----------------
  `relationship_id`   UUID PK
  `user_a_id`         UUID nullable
  `contact_a_id`      UUID nullable
  `user_b_id`         UUID nullable
  `contact_b_id`      UUID nullable
  `status`            ACTIVE / CLOSED
  `created_at`        TIMESTAMPTZ
  `updated_at`        TIMESTAMPTZ

This allows the system to calculate whether a gift is fully, partially,
or not yet reciprocated.

------------------------------------------------------------------------

## 9.2 `settlement_links`

Links a settlement transaction to the prior transaction(s) it settles.

  Column                        Type
  ----------------------------- ------------------------
  `settlement_link_id`          UUID PK
  `settlement_transaction_id`   UUID FK → transactions
  `original_transaction_id`     UUID FK → transactions
  `settled_amount`              NUMERIC(14,2)
  `created_at`                  TIMESTAMPTZ

This table is preferable to simply changing the old transaction amount.

------------------------------------------------------------------------

# 10. Payments

## 10.1 `payment_intents`

  Column                 Type
  ---------------------- --------------------------------------------------
  `payment_id`           UUID PK
  `transaction_id`       UUID nullable FK
  `event_id`             UUID nullable FK
  `payer_user_id`        UUID nullable
  `payee_user_id`        UUID nullable
  `amount`               NUMERIC(14,2)
  `payment_method`       UPI
  `provider_reference`   VARCHAR(255) nullable
  `status`               CREATED / PENDING / SUCCESS / FAILED / CANCELLED
  `initiated_at`         TIMESTAMPTZ
  `completed_at`         TIMESTAMPTZ nullable

------------------------------------------------------------------------

## 10.2 `payment_events`

Stores provider/webhook state transitions.

  Column                Type
  --------------------- ----------------------
  `payment_event_id`    UUID PK
  `payment_id`          UUID FK
  `provider_event_id`   VARCHAR(255) UNIQUE
  `event_type`          VARCHAR(100)
  `payload_hash`        VARCHAR(255)
  `received_at`         TIMESTAMPTZ
  `processed_at`        TIMESTAMPTZ nullable

Never trust only the client application to declare a payment successful.

------------------------------------------------------------------------

# 11. Digital Payment Double-Sided Posting

When a Relfam payment link/QR is used and payment is verified:

``` text
Payment verified
      ↓
Create canonical transaction
      ↓
Create sender-side relationship
      ↓
Create receiver-side relationship
      ↓
Attach transaction to receiver's event
      ↓
Add transaction to sender's transaction history
      ↓
Notify both parties
```

The same transaction must not be duplicated as two independent financial
transactions.

------------------------------------------------------------------------

# 12. Manual Cash / Other Payment

For cash or an external/offline payment:

-   sender creates a manual transaction
-   sender-side record is created
-   receiver-side record must NOT automatically be created
-   receiver can independently enter/confirm it
-   system must not claim that an unverified offline payment was
    received

This protects against false claims/scams.

------------------------------------------------------------------------

# 13. Transaction History

## 13.1 `transaction_history_views`

A physical table is not required.

Create a database view or API query that returns all transactions
associated with a user.

History should include:

-   transaction ID
-   date/time
-   sender
-   receiver
-   event
-   amount
-   old/new
-   payment mode
-   source
-   verification
-   settlement status
-   collection assignment

Transactions not yet assigned to a collection remain in history.

The user may later move/assign them into a collection.

------------------------------------------------------------------------

# 14. Family Accounts

## 14.1 `families`

  Column            Type
  ----------------- -------------------
  `family_id`       UUID PK
  `owner_user_id`   UUID FK
  `family_name`     VARCHAR(255)
  `status`          ACTIVE / ARCHIVED
  `created_at`      TIMESTAMPTZ
  `updated_at`      TIMESTAMPTZ

------------------------------------------------------------------------

## 14.2 `family_members`

  Column                Type
  --------------------- ---------------------------------------
  `family_member_id`    UUID PK
  `family_id`           UUID FK
  `user_id`             UUID nullable
  `name`                VARCHAR(255)
  `relationship`        VARCHAR(100)
  `phone_number`        VARCHAR(20)
  `role`                OWNER / ADMIN / MEMBER / VIEWER
  `invite_status`       PENDING / VERIFIED / ACTIVE / REMOVED
  `shadow_account_id`   UUID nullable
  `created_at`          TIMESTAMPTZ
  `updated_at`          TIMESTAMPTZ

------------------------------------------------------------------------

## 14.3 `shadow_accounts`

A shadow account represents a family member who has ledger visibility
before independently becoming a full account.

  Column                Type
  --------------------- -----------------------------
  `shadow_account_id`   UUID PK
  `family_id`           UUID FK
  `family_member_id`    UUID FK
  `phone_number`        VARCHAR(20)
  `status`              ACTIVE / CLAIMED / DISABLED
  `claimed_user_id`     UUID nullable
  `created_at`          TIMESTAMPTZ
  `claimed_at`          TIMESTAMPTZ nullable

### Claim logic

If the member later logs in with the verified phone number:

1.  verify OTP
2.  find matching active shadow account
3.  offer account claim
4.  link shadow account to real user
5.  expose only records permitted by family access policy
6.  preserve original record IDs

------------------------------------------------------------------------

# 15. Privacy and Security

## 15.1 `privacy_settings`

  Column                           Type
  -------------------------------- -------------
  `privacy_setting_id`             UUID PK
  `user_id`                        UUID UNIQUE
  `hide_amounts`                   BOOLEAN
  `allow_find_event`               BOOLEAN
  `allow_family_visibility`        BOOLEAN
  `allow_transaction_visibility`   BOOLEAN
  `updated_at`                     TIMESTAMPTZ

Amount hiding must be enforced server-side, not only in UI.

------------------------------------------------------------------------

## 15.2 `user_security_settings`

  Column                  Type
  ----------------------- -------------
  `security_setting_id`   UUID PK
  `user_id`               UUID UNIQUE
  `biometric_enabled`     BOOLEAN
  `app_lock_enabled`      BOOLEAN
  `updated_at`            TIMESTAMPTZ

Biometric secrets should never be stored in the database. The app should
use the device secure enclave/keystore.

------------------------------------------------------------------------

# 16. Reminders and Notifications

## 16.1 `reminders`

  Column                     Type
  -------------------------- --------------------------------
  `reminder_id`              UUID PK
  `user_id`                  UUID FK
  `title`                    VARCHAR(255)
  `description`              TEXT
  `remind_at`                TIMESTAMPTZ
  `repeat_rule`              TEXT nullable
  `status`                   ACTIVE / COMPLETED / CANCELLED
  `related_event_id`         UUID nullable
  `related_transaction_id`   UUID nullable
  `created_at`               TIMESTAMPTZ

## 16.2 `notifications`

  Column                  Type
  ----------------------- ----------------------
  `notification_id`       UUID PK
  `user_id`               UUID FK
  `type`                  VARCHAR(100)
  `title`                 VARCHAR(255)
  `body`                  TEXT
  `related_entity_type`   VARCHAR(50) nullable
  `related_entity_id`     UUID nullable
  `read_at`               TIMESTAMPTZ nullable
  `created_at`            TIMESTAMPTZ

------------------------------------------------------------------------

# 17. Find Event

Find Event searches by `event_code`.

Recommended response data:

-   event name
-   event type
-   event photo
-   event date/time
-   location
-   contribution availability
-   contribution link
-   streaming link if enabled
-   visibility/access status

Never expose private transaction records through event-code search.

------------------------------------------------------------------------

# 18. Event Streaming

Future table:

## `event_streams`

  Column         Type
  -------------- ----------------
  `stream_id`    UUID PK
  `event_id`     UUID FK
  `provider`     VARCHAR(50)
  `stream_url`   TEXT
  `status`       ACTIVE / ENDED
  `created_at`   TIMESTAMPTZ

------------------------------------------------------------------------

# 19. Audit

## 19.1 `audit_logs`

  Column             Type
  ------------------ ----------------
  `audit_id`         UUID PK
  `actor_user_id`    UUID nullable
  `action`           VARCHAR(100)
  `entity_type`      VARCHAR(100)
  `entity_id`        UUID
  `old_value_json`   JSONB nullable
  `new_value_json`   JSONB nullable
  `ip_address`       INET nullable
  `user_agent`       TEXT nullable
  `created_at`       TIMESTAMPTZ

Use audit logs for sensitive changes such as:

-   transaction edits
-   transaction deletion
-   event ownership changes
-   family member changes
-   phone/email changes
-   privacy changes
-   payment state changes

------------------------------------------------------------------------

# 20. Recommended Indexes

``` text
users(phone_number)
users(email)
events(event_code)
events(owner_user_id, status)
events(event_date)
transactions(event_id)
transactions(sender_user_id, occurred_at)
transactions(receiver_user_id, occurred_at)
transactions(sender_contact_id)
transactions(receiver_contact_id)
transactions(payment_mode)
transactions(gift_classification)
transactions(settlement_status)
transactions(amount)
ledger_contacts(owner_user_id, phone_number)
collections(owner_user_id, status)
collection_transactions(collection_id, transaction_id)
family_members(family_id, phone_number)
notifications(user_id, read_at, created_at)
reminders(user_id, remind_at, status)
```

For name/location search, consider PostgreSQL trigram indexes or
full-text search depending on expected scale.

------------------------------------------------------------------------

# 21. Data Integrity Rules

1.  Never delete a successful financial transaction physically.
2.  Use soft deletion or reversal/adjustment.
3.  Never duplicate a digital payment because of retry/webhook
    duplication.
4.  Payment provider reference must be idempotent.
5.  Transaction IDs must be immutable.
6.  Event IDs must be immutable.
7.  Phone numbers must be normalized.
8.  OTPs must be hashed.
9.  Passwords must be hashed using a modern password hashing algorithm.
10. Money must use exact decimal arithmetic.
11. Server must calculate all balances.
12. Client-side totals are display-only.
13. User access must be checked on every protected transaction/event
    API.
14. Offline/manual entries must be distinguishable from verified digital
    payments.
15. A person must not be automatically merged based only on name.

------------------------------------------------------------------------

# 22. Balance Calculation Model

Do not store every derived balance as an authoritative value.

For a relationship:

``` text
total_given
= SUM(outgoing eligible transactions)

total_received
= SUM(incoming eligible transactions)

gross_difference
= total_received - total_given

outstanding
= calculated according to reciprocal OLD/NEW settlement links
```

Cached summaries may be added later for scale, but the ledger remains
the source of truth.

------------------------------------------------------------------------

# 23. Suggested Status Model

### Transaction

``` text
PENDING
PARTIALLY_COMPLETED
COMPLETED
CANCELLED
```

### Payment

``` text
CREATED
PENDING
SUCCESS
FAILED
CANCELLED
```

### Event

``` text
DRAFT
ACTIVE
COMPLETED
ARCHIVED
```

### Family invitation

``` text
PENDING
VERIFIED
ACTIVE
REMOVED
```

------------------------------------------------------------------------

# 24. Future Migration Considerations

The schema should leave room for:

-   AI invitation generation
-   voice-to-ledger entry
-   Excel import
-   QR collection
-   UPI auto capture
-   vendor marketplace
-   event streaming
-   family vault
-   bills/payments
-   rewards
-   analytics

These should be added as modules without changing the core transaction
identity model.

------------------------------------------------------------------------

# 25. Source-of-Truth Principle

The most important architecture rule for Relfam is:

``` text
TRANSACTION LEDGER = SOURCE OF TRUTH

Collections = organization layer
Events      = context layer
Payments    = verification layer
History     = audit/read layer
Summaries   = derived/read layer
```

This prevents the same gift from becoming multiple unrelated records.

------------------------------------------------------------------------

# 26. Minimum MVP Tables

For the first Gift Ledger MVP, implement these first:

1.  `users`
2.  `user_profiles`
3.  `otp_verifications`
4.  `event_types`
5.  `events`
6.  `event_locations`
7.  `event_photos`
8.  `ledger_contacts`
9.  `transactions`
10. `settlement_links`
11. `payment_intents`
12. `payment_events`
13. `collections`
14. `collection_transactions`
15. `notifications`
16. `reminders`
17. `privacy_settings`
18. `audit_logs`

Family/shadow accounts can be enabled in the next MVP increment if
implementation capacity is limited.

------------------------------------------------------------------------

# 27. Final Database Design Principle

Relfam must treat every gift as a traceable ledger event with:

``` text
WHO
→ sender / receiver

WHAT
→ gift / contribution

HOW MUCH
→ exact amount

WHEN
→ occurred_at

WHERE / FOR WHAT
→ event

HOW
→ cash / UPI / other

OLD OR NEW
→ user classification

VERIFIED OR NOT
→ payment verification

SETTLED OR NOT
→ settlement state

WHERE ORGANIZED
→ collection

WHO CREATED / CHANGED IT
→ audit
```

This model is intended to remain stable while UI, payment providers, AI
features and future Relfam modules evolve.
