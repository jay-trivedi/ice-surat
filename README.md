# ICE Surat · Sur Sanidhya

Interactive hi-fi prototype of the membership + event-wise seat allocation web app for **Institute of Civil Engineers, Surat** (cultural program: *Sur Sanidhya*).

This is a design-stage prototype: React via CDN + Babel-standalone, no build step. All data lives in `localStorage`. Mock API in `store.jsx` can be swapped for a real backend later.

Hosted at: https://ice.jay.trivedi.cloud

## Run locally

```sh
cd ~/ice-surat
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static file server works — nothing to build.)

## Structure

- `index.html` — entry, loads React + Babel from CDN and the `.jsx` files below
- `data.jsx` — seeded tiers, sample members, reserved seats, per-row seat counts
- `store.jsx` — mock API + localStorage persistence + allocation engine
- `seatmap.jsx` — full A–W auditorium grid component
- `landing.jsx` — public landing page (hero, tiers, how-it-works, enquiry)
- `member-flow.jsx` — 5-step signup → mock payment → membership card → portal
- `admin.jsx` — organiser console (overview, members, events, allocation)
- `app.jsx` — top-level router + topnav
- `tweaks-panel.jsx` — design tweaks panel (brand accent, font, reset demo)
- `styles.css` — single stylesheet
- `assets/` — ICE Surat logo

## Tier rules

| Tier      | Rows  | Fee     | Allocation rule |
|-----------|-------|---------|-----------------|
| Free Flow | A–C   | ₹10,000 | All fix         |
| M-50      | D–F   | ₹8,000  | Rotation, side -10% |
| M-45      | G–I   | ₹7,000  | Rotation, side -10% |
| M-35      | J–L   | ₹6,000  | Rotation, side -10% |
| M-30      | M–O   | ₹5,400  | Rotation, side -10% |
| M-25      | P     | ₹4,000  | All fix         |
| M-20      | Q–S   | ₹3,000  | Side -10%       |
| M-15      | T–W   | ₹1,000  | First-come      |

Reserved seats (never auto-allocated): **A7–A10, A23–A26, C1–C5**.

## Notes for the production build

When this graduates to a real codebase (React + Vite + TS + Cloudflare D1/Workers per the original brief), the `store.jsx` mock layer maps 1:1 onto the data model. Razorpay plugs in where `createMockPayment` lives. The seat-allocation engine in `store.jsx` can move to the backend unchanged.
