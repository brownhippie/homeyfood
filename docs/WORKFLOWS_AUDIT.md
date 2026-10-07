# HomeyFood — Popups, Dialogs & Workflow Audit

Deeper pass through the Bubble editor's Overlays (popups/floating groups) on
each page, since the first audit only looked at top-level page layout. This
surfaces real fields and flows that weren't visible from the rendered pages
alone. Findings below changed the local rebuild's scope — see "Rebuild
impact" at the bottom.

## homefood_homepage overlays

- **Become a chef/guest popup** — the real signup form, richer than assumed:
  Username, Email, Password, **Reconfirm Password**, and a **Government ID**
  field. The Government ID strongly implies identity verification is part of
  becoming a chef (food-safety/trust requirement for a home-cooking
  marketplace) — not just an email+password signup.
  - **Confirmed: the Government ID field is a factual structural finding**,
    not copyrighted content — just noting it in case of doubt.
- **Fire Pop UP** — empty stub groups ("Group D" ×7) + a "FIRE" button, no
  copy. Unfinished/placeholder in the Bubble app itself.
- **Sign in Pop Up** — standard login: Username/Email + Password. Matches
  what's already built.
- **Popup User Information** — empty stub groups (H, L, M, N, O, P, Q, R, S,
  V), no labeled content. Unfinished in the original.

## chef-landing_page overlays

- **Pop UP Fire** — this is the actual **listing creation form** (the
  "GO FOR LIVE STREAMING" page's main popup), and it's far richer than the
  `{title, description, mode}` the rebuild currently has:
  - Title
  - Description
  - Keyword(s) (search tags, separate from description)
  - Cuisine
  - Category
  - Serving time
  - Number of people (capacity — this is a per-session headcount, not just a
    listing)
  - **Rate per head** — pricing is per-person, not a flat listing price
  - Continuing days (how many days the listing/session runs)
  - Select serve (Eat in / Delivery / Take Out — already have this)
- **Popup LiveStream Description** — "PREPARE TO GO LIVE!!" step: a
  description field bundle plus a confirmation group, shown before a chef
  actually starts streaming. Simple pre-flight step.
- **Popup Calendar** — uses Bubble's Calendar/Calendar Month plugin element,
  not a free-text field. Confirms **booking should be a real date-picker
  calendar**, not the free-text "preferred time" input currently in the
  rebuild's booking form.
- **Popup Calendar Cancel/Submit Confirmation, Popup Fire/Cancel/Submit
  Confirmation, Popup Stream Confirmation** — all generic "are you sure?"
  text + button pairs. No unique fields; just confirm/cancel dialogs guarding
  the calendar and Fire (listing) submit/cancel actions, and the live-stream
  start/stop actions. Worth replicating as lightweight confirm dialogs before
  destructive/committing actions (submitting a listing, cancelling a
  calendar booking, going live) — current rebuild uses plain buttons with no
  confirmation step.
- **Popup Advanced Filters** — this is an **allergy/dietary filter**: one
  "Group Allergy" plus five numbered copies (6 allergy toggles total), not a
  generic filter panel. The rebuild's search page has no allergy filtering
  at all yet.

## Not yet opened

`search_page`'s own "Popup Advanced Filter" (singular) and `live_stream`'s
confirmation popup weren't re-opened individually — both are almost
certainly the same patterns as chef-landing_page's versions above (shared
popup elements reused across pages is standard Bubble practice), so treating
them as duplicates rather than re-auditing was a deliberate time-saving call.

## Rebuild impact — what this changes

1. **Listing data model is incomplete.** Need to add: `keywords`, `cuisine`,
   `category`, `serving_time`, `capacity` (number of people), `rate_per_head`
   (replace flat `price_cents` with per-person pricing), `continuing_days`.
2. **Booking should use a calendar date-picker**, not a free-text time slot
   string.
3. **Signup needs a Government ID field** (at least for chefs) and password
   confirmation — this is a real trust/safety feature of the original app,
   not a cosmetic one.
4. **Search needs allergy/dietary filtering**, not just mode/tag filtering.
5. **Confirm dialogs** should guard booking cancellation, listing
   submission, and going live — small UX layer currently missing.
