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

## listingsdeatils — NOT actually empty (re-audited)

The first pass called this page "empty/unbuilt" because only "Group B" showed
in the collapsed Layers tree. Re-opened it directly and it is in fact the
real, most complete listing-detail/creation form in the whole app — richer
than `Pop UP Fire`'s version:

- Title, Category Type, Cuisine Type
- Serving Time: From / To (time range, not a single field)
- Rate per Serving, Number of Serving
- **Eat In / Take Out / Delivery — independent numeric quantities** (each
  shown as "00"), meaning one dish can be offered across all three modes at
  once with different availability per mode, not a single mode select
- A file upload for a food photo
- Description of the Food, Keyword Tagged
- **Portion Size**
- **Allergy precautions** (matches the allergens field already built)
- **Dietary Preference**
- **Spice Level**
- **Dish Preparation information**
- **Packaging Preference**

Implemented: portion size, dietary preference, spice level, dish prep info,
packaging preference, and the three independent eat-in/take-out/delivery
quantity fields (search now matches a listing under a mode if either its
primary `mode` matches or that mode's quantity is > 0). **Not implemented**:
the photo upload — that needs real file storage (Cloudinary, per
SETUP_PLAN.md) which isn't wired up yet; `photo_url` stays a plain URL field
until that's set up.

## ai_user_profile_2 — re-audited, nothing new

Its only overlay is "FloatingGroup Mobile Menu," a generic mobile nav
duplicate of the page's top bar (Notifications, mode filters, Edit Profile).
No new fields. The Posts/Ratings & Reviews pattern found in the first pass
still stands as the useful takeaway from this page.

## search_page overlays (re-audited — NOT a duplicate)

Initially assumed `search_page`'s "Popup Advanced Filter" (singular) was the
same popup as chef-landing_page's "Popup Advanced Filters" (allergy toggles).
That assumption was wrong — re-opened it directly and it's a different,
separate filter panel:

- Eat In / Delivery / Take Out checkboxes (duplicating the top-level mode
  filter, inside the popup too)
- **Cuisines**, **Categories**, **Availability** — three tag-style filter
  pill groups (not the generic "Tag 1" placeholder it first appeared to be
  from the stale accessibility-tree text; confirmed from the rendered
  canvas)
- **Rating** — a minimum star-rating filter (5-star widget)
- The page itself also has a **Sort** control and three "Tag 1" labels
  outside the popup (Cuisines/Categories/Availability again, as the
  top-level filter bar)

This means allergy filtering and cuisine/category/rating filtering are two
separate, parallel filter systems in the original app, not one combined
panel. `live_stream`'s confirmation popup was not re-opened individually —
that one really is a generic confirm/cancel pattern matching the others
already audited, so treating it as a duplicate stands.

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
