# ICE Surat · Sur Sanidhya

Membership + event-wise seat allocation web app for **Institute of Civil Engineers, Surat** (cultural program: *Sur Sanidhya*).

This repo holds two things:

1. **`design/` — the design prototype.** Pixel-perfect interactive mock produced via [claude.ai/design](https://claude.ai/design). React + Babel via CDN, no build step, all data in `localStorage`. Currently hosted at <https://ice.jay.trivedi.cloud> as a stand-in until the real app is ready.
2. **`webapp/` — the production app (not yet scaffolded).** Will be a Vite + React + TS app deployed on **Cloudflare Pages**, with **Pages Functions** for the API layer and **Cloudflare D1** for the database. Razorpay plugs into the payment flow later. Will replace the prototype on the same domain once ready.

The prototype stays around as a visual reference for the production build.

## Production stack (planned)

| Layer | Service |
|-------|---------|
| Frontend | Cloudflare Pages |
| Backend APIs | Cloudflare Pages Functions (escalate to standalone Workers only if needed) |
| Database | Cloudflare D1 |
| DNS | Cloudflare DNS |
| Payments | Razorpay (mocked initially via `createMockPayment()`; real integration via webhook later) |
| Static assets | Cloudflare Pages public assets (move to R2 if storage needs grow) |

Scale target: ~500 members, 5–6 events/year. Hosting cost ≈ ₹0/month on this stack.

```
ice.jay.trivedi.cloud
        ↓
Cloudflare Pages (Vite/React/TS)
        ↓
Pages Functions (REST API)
        ↓
Cloudflare D1 (SQLite)
        ↓
Razorpay webhooks → payment confirmation
```

## Prototype: run locally

```sh
cd ~/ice-surat/design
python3 -m http.server 8000
# open http://localhost:8000
```

(Any static file server works — nothing to build.)

## Repo layout

- `design/` — the hosted prototype source
  - `index.html` — entry, loads React + Babel from CDN and the `.jsx` files below
  - `data.jsx` — seeded tiers, sample members, reserved seats, per-row seat counts
  - `store.jsx` — mock API + localStorage persistence + allocation engine
  - `seatmap.jsx` — full A–W auditorium grid component
  - `landing.jsx` — public landing page (intro, program, gallery, office bearers, contact)
  - `member-flow.jsx` — 5-step signup → mock payment → membership card → portal
  - `admin.jsx` — organiser console (overview, members, events, allocation)
  - `app.jsx` — top-level router + topnav
  - `tweaks-panel.jsx` — design tweaks panel (brand accent, font, reset demo)
  - `styles.css` — single stylesheet
  - `assets/` — ICE Surat logo + favicon
- `webapp/` — production Vite/TS/Pages/D1 app (not yet scaffolded)
- `design-handoffs/` — most recent raw bundle from claude.ai/design (kept for reference; see folder's README)

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

## Migration notes (prototype → production)

When `webapp/` is scaffolded:

- `design/store.jsx`'s mock API (`createMember`, `createMockPayment`, `allocateSeatsForEvent`, etc.) maps 1:1 onto Pages Functions endpoints under `webapp/functions/api/`.
- `design/data.jsx`'s seed data (tiers, reserved seats, sample members) becomes `webapp/db/schema.sql` + `webapp/db/seed.sql` for D1.
- The seat-allocation engine inside `design/store.jsx` moves to the backend largely unchanged.
- Razorpay plugs in where `createMockPayment()` currently lives — design the payment provider as a single interface so swap is a one-file change.
- The `design/` prototype stays around for visual reference and can be served from a `/preview` route, or simply retired once the production app reaches parity.

## Design handoff archive

Only the most recent raw bundle from `claude.ai/design` is kept, under `design-handoffs/` as a timestamped `.tar.gz`. See `design-handoffs/README.md` for the layout. The hosted prototype builds from the top-level project files, not from this folder.

---

## Build brief (verbatim, for production handoff)

> The text below is the original prompt the design prototype was built against, plus a follow-up addendum specifying the admin seat-selector UI. Use it as the source of truth when a coding agent rebuilds this in React + Vite + TS + Cloudflare D1/Workers.

### Core spec

Build a simple membership booking, payment, and event-wise seat allocation web app for "Institute of Civil Engineers, Surat" also referred to as "ICE Surat". Do not call it ICEA Surat. The association does not have a website yet, so include a clean public landing page plus the actual membership/admin app.

**Context:**
ICE Surat runs an annual cultural membership called "Sur Sanidhya". Members pay once annually for a couple membership. The association hosts around 5 to 6 events/programs per year, such as natak, musical programs, and comedy shows. Seat allocation must be maintained separately for each event.

**Membership tiers:**
1. Free Flow, rows ABC, annual fee ₹10,000, rule: All Fix
2. M-50, rows DEF, annual fee ₹8,000, rule: Rotation, 10% less side seats
3. M-45, rows GHI, annual fee ₹7,000, rule: Rotation, 10% less side seats
4. M-35, rows JKL, annual fee ₹6,000, rule: Rotation, 10% less side seats
5. M-30, rows MNO, annual fee ₹5,400, rule: Rotation, 10% less side seats
6. M-25, row P, annual fee ₹4,000, rule: All Fix
7. M-20, rows QRS, annual fee ₹3,000, rule: 10% less side seats
8. M-15, rows TUVW, annual fee ₹1,000, rule: First Come First

**Important seat reservation rules:**
- A7 to A10 are reserved
- A23 to A26 are reserved
- C1 to C5 are reserved
- Reserved seats must never be auto-allocated
- The seat map should support rows A to W and seat numbers, with a visual grid
- Use the provided seat map image/PDF as reference if available

**Core product requirement:**
Build the app so annual membership and payment are separate from event-wise seat allocation.

**Member flow:**
1. Landing page explains ICE Surat, Sur Sanidhya, annual membership, event access, and category-based seating.
2. User opens membership form.
3. User enters name, mobile, email, address optional.
4. User selects membership tier.
5. App shows annual fee.
6. User completes mock payment.
7. Payment success creates active membership for the selected year.
8. Member can view their membership and event-wise seat allocation once assigned.

**Admin flow:**
1. Admin dashboard shows total members, paid members, unpaid/pending members, annual collection, events created, and seats allocated.
2. Admin can create events with name, date, venue, and status.
3. Admin can run seat allocation for a selected event.
4. Each event must have its own seat allocation records.
5. Same member may have different seats in different events if their tier uses rotation.
6. Fixed tier members should retain the same seats across events where possible.
7. Rotation tier members should rotate fairly across allowed rows for every event.
8. First Come First tier should allocate based on payment timestamp or booking timestamp.
9. Admin must be able to manually override seats.
10. Admin must be able to mark seats as reserved/blocked.
11. Admin must be able to export members and event seat allocations as CSV.

Use mock APIs and seeded data first, but structure the code so real APIs can be plugged in later.

**Preferred stack:**
- React + Vite + TypeScript
- Clean CSS or Tailwind
- Local mock API using localStorage or in-memory service
- Include Cloudflare-ready backend structure if possible
- Include D1/SQLite schema files
- Include setup scripts

**Data model needed:**
- members
- membership_tiers
- memberships
- payments
- events
- venue_seats
- event_seat_allocations
- reserved_seats
- admin_users optional

**Mock API requirements:**
- createMember()
- createMembership()
- createMockPayment()
- listMembers()
- createEvent()
- listEvents()
- allocateSeatsForEvent(eventId)
- updateSeatAllocation()
- listSeatAllocations(eventId)
- exportMembersCSV()
- exportEventSeatCSV()

**Landing page requirements:**
- Use brand name: Institute of Civil Engineers, Surat
- Include "Sur Sanidhya" as the cultural membership/program name
- Use a clean, trustworthy, community-style design
- Include sections: Hero, About ICE Surat, About Sur Sanidhya, Membership categories, How membership works, Event-wise seating explanation, Contact / enquiry section
- Use an ICE Surat logo placeholder if no official logo is available
- Keep the design polished but simple

**Seat allocation logic:**
- Each paid membership gets 2 seats because membership is for a couple
- Only active paid memberships should be allocated seats
- Respect the tier row mapping
- Respect reserved seats
- Avoid duplicate seat allocation within the same event
- For fixed tiers, allow fixed seat mapping if already assigned
- For rotation tiers, rotate members within their allowed rows across events
- For first-come tiers, allocate in payment timestamp order
- If no valid seats are available, mark the member as unallocated and show a warning

**Deliverables:**
1. Full working app
2. Seed data
3. Setup instructions in README
4. Local run command
5. Build command
6. Mock API layer clearly separated from UI
7. SQLite/D1 schema
8. CSV export
9. Clean folder structure
10. Notes on where to plug real payment gateway like Razorpay later

**Acceptance criteria:**
- I can run the app locally with one command
- I can create a member and mock payment
- I can create an event
- I can run allocation for that event
- I can see allocated, available, and reserved seats on a visual seat grid
- Reserved seats A7-A10, A23-A26, C1-C5 are blocked
- I can switch between events and see different event-wise allocation
- I can export CSV
- The code is easy to modify later

### Addendum: seat selector UI

Build a seat selector UI. The app needs a visual seat selector for admin use.

**Use cases:**

1. **Fixed seat assignment**
   - Admin should be able to select exact seats for fixed membership tiers.
   - Example: Free Flow / ABC and M-25 / P members may have fixed seats.
   - Once selected, these seats should become the member's fixed seats across events unless manually changed.
   - The selector must prevent choosing reserved seats or seats already fixed for another member.

2. **Rotation starting location**
   - For rotation tiers, admin should be able to select a starting seat pair or starting row/seat.
   - Example: M-50 member starts from D12-D13.
   - For future events, the allocation engine should rotate from this starting location.
   - The starting location should act as the member's baseline, not necessarily the same seat every event.

3. **Manual event override**
   - For any event, admin should be able to manually change a member's allocated seats.
   - Manual override should apply only to that event unless admin explicitly saves it as fixed/baseline.

**Seat selector UI requirements:**
- Show a visual grid of the auditorium seats (rows A to W, seats numbered across each row)
- Reserved seats should appear blocked: A7-A10, A23-A26, C1-C5
- Already allocated seats should appear occupied
- Available seats should be clickable
- Admin should select 2 seats per membership by default because membership is for a couple
- Prefer selecting adjacent seat pairs
- If admin selects non-adjacent seats, show a warning but allow it only with confirmation
- Show seat legend: Available, Reserved, Occupied, Selected, Fixed, Rotation Baseline
- Search/filter above selector: Search member, Filter by tier, Filter by allocation status

**Data model additions:**
- Add `fixed_seat_1` and `fixed_seat_2` to `memberships` or create a separate `member_fixed_seats` table
- Add `rotation_start_seat_1` and `rotation_start_seat_2` to `memberships` or create a separate `member_rotation_baselines` table
- Event-specific allocations remain in `event_seat_allocations`
- Manual overrides should have an `allocation_source` field: `auto` | `fixed` | `rotation` | `manual_override`

**Seat allocation logic update:**
- Fixed tiers: use fixed seats if assigned and available for that event. If fixed seats are reserved or blocked, mark conflict and ask admin to resolve.
- Rotation tiers: use the rotation baseline as the starting point. Rotate seat pairs across allowed rows and events. Respect reserved and occupied seats.
- First Come First tiers: use payment timestamp or booking timestamp.
- Manual override: always override auto allocation for that event. Do not change fixed seats or rotation baseline unless admin chooses "Save as fixed" or "Save as rotation baseline".

**Admin screens:**
1. Member detail page — select fixed seats, select rotation baseline seats, view membership tier and payment status
2. Event allocation page — run auto allocation, open seat selector, assign/change seats for selected member, save event-specific override, export final allocation CSV

**Acceptance criteria:**
- Admin can visually select fixed seats for a member
- Admin can visually select rotation starting seats for a member
- Admin can manually override event seats
- Reserved seats cannot be selected
- Occupied seats cannot be selected unless admin first removes/reassigns the existing allocation
- The selector clearly shows selected, occupied, reserved, fixed, and rotation baseline seats
