# HomeyFood

Free, open home-chef marketplace. Guests discover and book home-cooked meals
(eat in, delivery, take out) from local chefs; chefs manage listings,
bookings, recipes, and reviews.

Rebuilt from an earlier Bubble.io prototype as a standalone app — see
[docs/VISION.md](docs/VISION.md) and [docs/SETUP_PLAN.md](docs/SETUP_PLAN.md)
for background.

## Structure

- `api/` — Express + SQLite REST API
- `web/` — React + Vite + TypeScript frontend
- `docs/` — vision and planning docs

## Local development

```bash
cd api && npm install && npm run dev   # http://localhost:4000
cd web && npm install && npm run dev   # http://localhost:5173
```

## Stack (kept free)

React/Vite + Node/Express + SQLite, Leaflet/OpenStreetMap for maps, deployed
on free tiers (Railway). See [docs/SETUP_PLAN.md](docs/SETUP_PLAN.md) for the
full list of free-tier choices and why.
