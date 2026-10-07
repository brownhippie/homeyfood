# HomeyFood — Rebuild Setup Plan (zero/near-zero cost)

Goal: rebuild HomeyFood as a standalone, free, open web app (no Bubble
dependency), reusing the vision in [VISION.md](VISION.md). Every choice below
is picked for a generous free tier, not "free trial."

## 1. Stack

Same pattern as your other apps (PersonalApp, Blunder Reel) — one you already
know how to run and deploy for $0:

- **Frontend**: React + Vite + TypeScript (web), plain CSS or Tailwind.
- **Backend**: Node.js + Express, REST API.
- **Database**: Postgres.
- **Realtime (chat/notifications)**: plain WebSockets via `ws` on the same
  Express server — no paid service needed.

## 2. Free-tier service choices (and what they replace)

| Need | Bubble used | Free replacement | Why |
|---|---|---|---|
| Hosting (API) | Bubble server | **Railway free tier** or **Render free web service** | You already deploy PersonalApp/Blunder Reel on Railway |
| Hosting (web) | Bubble server | **Vercel free tier** | Same pattern as PersonalApp/web |
| Database | Bubble's built-in DB | **Railway Postgres free tier** (or Supabase free Postgres, 500MB) | Supabase also gives free auth/storage if you want fewer moving parts |
| File/image/video storage | Bubble file storage | **Cloudinary free tier** (25GB storage/25GB bandwidth) | Needed for chef photos, recipe images, video uploads |
| Live streaming | Agora (paid plugin in Bubble) | **Agora free tier** (10,000 free minutes/month) or **self-hosted via WebRTC (e.g. mediasoup) on a free VM** if you outgrow Agora's free tier | Agora's free tier is generous enough to start; no cost until real scale |
| Maps / location search | Bubble "Maps Extended" plugin | **Leaflet.js + OpenStreetMap** | Totally free, no API key/billing account needed (unlike Google Maps) |
| Auth | Bubble built-in auth | **Your own JWT + bcrypt** (like PersonalApp's PIN auth) | No third-party auth bill |
| Email (newsletter signup, notifications) | Bubble email | **Resend free tier** (3,000 emails/month) or skip for v1 | Only needed once you build the newsletter feature |
| Push notifications | — | Web Push API (free, browser-native) — same approach as PersonalApp | No cost |

Everything above has a real, permanent free tier (not a 30-day trial), matching your "never pay for this" rule.

## 3. Repo layout

```
D:\HomeyFood
  api/        Express app (REST + WebSocket)
  web/        React/Vite app
  docs/       VISION.md, SETUP_PLAN.md, this folder
```

Mirrors `PersonalApp/api` + `PersonalApp/web` so your deploy muscle memory carries over directly.

## 4. Account model (decided)

One `User` account. Signup picks a starting role (`guest` or `chef`), but a
user can enable the other role later from their profile ("Switch to Guest" /
"Switch to Chef," matching the button already in `chef-landing_page`).
Someone who is both just has `is_guest = true` and `is_chef = true` on the
same account and a UI toggle to switch active view — no separate login/signup
flow for "both."

## 5. Data model (first pass, from the audited pages)

- **User** — name, email, password hash, `is_guest` (bool), `is_chef` (bool), active_role, avatar.
- **ChefProfile** — bio, cover photo, recipes[], videos[], location (lat/lng), availability modes (`eat_in`, `delivery`, `take_out`), rating.
- **Listing** — a bookable meal/menu item: chef_id, title, description, photos[], tags[], price, availability mode, location.
- **Booking** — guest_id, listing_id, chef_id, time slot, mode, status.
- **Recipe** — chef_id, title, media, description.
- **VideoPost** — chef_id, video url (Cloudinary), caption, likes/comments (optional v1).
- **LiveStream** — chef_id, status (`live`/`ended`), Agora channel id, comments_enabled.
- **Review** — booking_id, rating, text.

Keep this loose until you confirm it against `ai_user_profile_2` (still unchecked) and any backend workflows I haven't read yet in Bubble.

## 6. Build order (smallest usable slice first)

1. **Scaffold** `api/` + `web/` (copy PersonalApp's package.json/tsconfig/vite setup as a starting skeleton, strip its finance-specific code).
2. **Auth** — signup/login as guest or chef, JWT sessions.
3. **Chef profile + listings** — create/edit a chef profile, add listings (no payments yet — booking just reserves a slot).
4. **Guest search/discovery** — the `search_page` feature set: filter by Eat in/Delivery/Take out, tags, rating, list/map view (Leaflet).
5. **Booking flow** — guest books a listing/time slot; chef sees it in a "Bookings" dashboard (mirrors `chef-landing_page`).
6. **Recipes/videos on chef profile** — Cloudinary upload, display on `chef_profile_page` equivalent.
7. **Live streaming** — Agora integration last, since it's the most infrastructure-heavy piece and the rest of the app works without it.
8. **Reviews, newsletter, blog/testimonials** — nice-to-have content from `ai_landing_page_1`, lowest priority.

## 7. What to deliberately skip for v1 (cost/complexity, not value)

- Payments — start with "reserve a slot," add real payment processing (e.g. Stripe, which has no monthly fee, only per-transaction) only once you actually have users transacting.
- The generic `ai_dashboard_1` admin template — irrelevant boilerplate, don't port it.
- AI features (`ai_landing_page_1`'s AI-prefixed pages) — unclear scope; revisit after core marketplace works.

## 8. Audit follow-ups (resolved)

1. **`ai_user_profile_2`** — an imported social-profile template page (posts
   feed with likes/comments, "Ratings & Reviews" with a 5-to-1-star
   percentage breakdown, one real chef-flavored bio line: "Crafting Culture:
   Epicurean Enthusiast • Chef @ HomeyFood"). Still contains unrelated dummy
   filler content from the template (a stranger's dress review). Not a page
   to port directly — but its **Posts feed** and **star-breakdown ratings
   widget** are good patterns to reuse for the real chef profile/reviews UI,
   folded into `ChefProfile`/`Review` in the data model above.
2. **Backend Workflows: 0.** Confirmed via the Backend Workflows tab — the
   app has no API workflows, scheduled workflows, or other server-side logic
   beyond what's visible in the page UIs already audited. Nothing hidden to
   account for.
