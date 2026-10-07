# HomeyFood — Reconstructed Vision (from Bubble app audit)

Source: Bubble app `homeyfood-69753`, owned by yj30102024@gmail.com.
No written mission/vision exists in the app — "Mission/Vision" and "About us"
footer links on the homepage are unwired placeholders. This doc is inferred
from the actual pages/flows built so far.

## Core concept

A home-chef marketplace — "Airbnb for homemade food" — connecting independent
home cooks/chefs directly with nearby guests, with a social video-discovery
layer on top of ordering.

## Actual marketing copy (found on `ai_landing_page_1`)

This page is a fully-built marketing landing page (unlike the homepage, this
one has real copy, not placeholders) and is the clearest statement of intent
in the whole app. Paraphrased, the pitch is:

- **Tagline**: "#1 on foodie tours" / "Savor Authentic Home-Cooked Meals."
  The promise is discovering and booking authentic, home-cooked meals from
  local home chefs — not restaurant food.
- **Value props** (three pillars the app organizes around):
  1. **Community Connections** — personalized dining recommendations,
     meeting people over food.
  2. **Local Flavor Discovery** — geolocation-based discovery of nearby home
     chefs/meals.
  3. **Flavor Fusion** — connecting with like-minded locals, building
     culinary friendships.
- **Positioning**: meals come with "stories" — the emphasis is on
  authenticity, culture, and intimacy ("right at home") vs. anonymous
  restaurant dining. Secure booking/payments and ease of hosting guests are
  called out as practical selling points.
- **Nav structure on this page**: Location picker, "Join as Chef" / "Join as
  Guest" (two-sided marketplace, explicit), Login/Signup, "Find Chefs."
- **Content plan** (sections exist as placeholders/scaffolding, not all
  wired up): testimonials from diners, a blog ("Latest blog articles") with
  posts about home chefs and cross-cultural meal sharing, a newsletter
  signup, and standard footer (About, Jobs, FAQs, Contact, Terms, Privacy).

This reads as a two-sided marketplace pitch: **guests** get authentic,
story-rich, local home-cooked meals; **chefs** get a way to share their
cooking/culture and build community, not just transact.

## Two sides of the app

### Guest side
- `homefood_homepage` / `index`: search bar ("What are you craving for
  today?!"), location + distance filter, order mode toggle (Eat in /
  Delivery / Take Out), "Popular Videos" feed.
- `search_page`, `listingsdeatils`: presumably search results and a single
  listing's detail page (not yet inspected in depth).

### Chef side
- `chef-landing_page` (also has a `chef_profile_page`): chef dashboard with:
  - Switch between Chef/Guest views
  - Bookings management
  - Live streaming ("GO FOR LIVE STREAMING!!!")
  - Eat in / Take Out / Delivery availability toggle
  - Trending Videos row
  - "Top searches by Guests with fewer Chefs" — a demand/gap signal showing
    guests' popular searches that currently have few chefs serving them.

### AI pages (purpose not yet confirmed)
- `ai_dashboard_1`, `ai_landing_page_1`, `ai_user_profile_2` — likely an
  AI-assisted feature set (recommendations? onboarding?). Needs inspection.

### Live streaming
- `live_stream` page + "Agora Streaming" plugin installed in the app —
  chefs can livestream cooking.

## Utility pages
`reset_pw`, `test`, `404` — standard scaffolding, not product-defining.

## Page-by-page audit (remaining pages)

- `ai_dashboard_1` — **generic "AdminHub" template boilerplate** (fake users
  like "Ava Hemsley", email/alert metrics). Not HomeyFood-specific; looks
  like leftover template scaffolding, possibly intended to become an
  internal admin/analytics dashboard later but not customized yet.
- `chef_profile_page` — a chef's public profile: name/username header,
  "Switch to Guest," **Top Videos**, **Top Recipes** (sic: "Top Recipee"),
  **News Feed**. Confirms chefs are content creators, not just vendors.
- `listingsdeatils` — empty/unbuilt (single empty group, no content yet).
- `search_page` — real, mostly-built: Eat In / Delivery / Take Out filters,
  Advanced Search Filters, Sort, List View / Map View toggle, tag filters,
  star-rating filter. This is the guest discovery/search experience.
- `live_stream` — chef-facing live streaming control page: "LIVE STREAMING"
  / "STOP STREAMING" controls, "TURN OFF COMMENTS," a description field, and
  a stream-confirmation popup. Built on the Agora Streaming plugin.
- `ai_user_profile_2` — not yet inspected.

## Status
App is mid-build: 40 unresolved issues flagged in the Bubble editor as of
2026-10-07. Many elements/workflows are stubbed or incomplete (e.g. footer
nav links with no destination).

## Branding
"Powered by YJRevolution" in the footer — appears to be the user's own
dev/brand name for this and related projects.
