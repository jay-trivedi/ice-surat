/* =========================================================
   data.jsx — Seed data, tiers, seat map structure
   ========================================================= */

// Membership tiers (locked spec)
const TIERS = [
  { id: "freeflow", code: "Free Flow", name: "Free Flow", rows: ["A","B","C"], fee: 10000, rule: "fix", ruleLabel: "All Fix", desc: "Premium front rows. Fixed seats every event." },
  { id: "m50",      code: "M-50",     name: "M-50",      rows: ["D","E","F"], fee: 8000,  rule: "rotation", ruleLabel: "Rotation · 10% less side", desc: "Rotation across allowed rows each event." },
  { id: "m45",      code: "M-45",     name: "M-45",      rows: ["G","H","I"], fee: 7000,  rule: "rotation", ruleLabel: "Rotation · 10% less side", desc: "Rotation across allowed rows each event." },
  { id: "m35",      code: "M-35",     name: "M-35",      rows: ["J","K","L"], fee: 6000,  rule: "rotation", ruleLabel: "Rotation · 10% less side", desc: "Rotation across allowed rows each event." },
  { id: "m30",      code: "M-30",     name: "M-30",      rows: ["M","N","O"], fee: 5400,  rule: "rotation", ruleLabel: "Rotation · 10% less side", desc: "Rotation across allowed rows each event." },
  { id: "m25",      code: "M-25",     name: "M-25",      rows: ["P"],         fee: 4000,  rule: "fix", ruleLabel: "All Fix", desc: "Fixed seat in row P every event." },
  { id: "m20",      code: "M-20",     name: "M-20",      rows: ["Q","R","S"], fee: 3000,  rule: "softrotation", ruleLabel: "10% less side", desc: "Soft rotation away from side seats." },
  { id: "m15",      code: "M-15",     name: "M-15",      rows: ["T","U","V","W"], fee: 1000, rule: "fcfs", ruleLabel: "First Come First", desc: "Allocation by payment timestamp." },
];

const TIER_CLASS = {
  freeflow: "t-freeflow",
  m50: "t-m50",
  m45: "t-m45",
  m35: "t-m35",
  m30: "t-m30",
  m25: "t-m25",
  m20: "t-m20",
  m15: "t-m15",
};

// Row → tier lookup
const ROW_TIER = (() => {
  const m = {};
  TIERS.forEach(t => t.rows.forEach(r => { m[r] = t.id; }));
  return m;
})();

// ---------------------------------------------------------
// Seat map: faithful reproduction of the reference image.
// Each row has segments (sub-blocks of contiguous seats),
// separated by aisles. Seat numbers descend left-to-right
// (audience perspective) — i.e. seat "1" is on stage-right.
// ---------------------------------------------------------
const SEAT_SPEC = [
  // Rows A–H: 3 sections
  { row: "A", segs: [[32,23],[22,11],[10,1]] },        // 32 seats
  { row: "B", segs: [[34,24],[23,12],[11,1]] },        // 34
  { row: "C", segs: [[36,25],[24,13],[12,1]] },        // 36
  { row: "D", segs: [[38,26],[25,14],[13,1]] },        // 38
  { row: "E", segs: [[40,27],[26,15],[14,1]] },        // 40
  { row: "F", segs: [[42,28],[27,16],[15,1]] },        // 42
  { row: "G", segs: [[44,29],[28,17],[16,1]] },        // 44
  { row: "H", segs: [[46,30],[29,18],[17,1]] },        // 46

  // Rows I–O: 5 sections (two outer wings)
  { row: "I", segs: [[42,39],[38,28],[27,16],[15,5],[4,1]] },   // 42
  { row: "J", segs: [[44,40],[39,29],[28,17],[16,6],[5,1]] },   // 44
  { row: "K", segs: [[46,41],[40,30],[29,18],[17,7],[6,1]] },   // 46
  { row: "L", segs: [[48,42],[41,31],[30,19],[18,8],[7,1]] },   // 48
  { row: "M", segs: [[50,43],[42,32],[31,20],[19,9],[8,1]] },   // 50
  { row: "N", segs: [[52,44],[43,33],[32,21],[20,10],[9,1]] },  // 52
  { row: "O", segs: [[54,45],[44,34],[33,22],[21,11],[10,1]] }, // 54

  // Rows P–V: uniform 5 sections, 56 seats
  { row: "P", segs: [[56,46],[45,35],[34,23],[22,12],[11,1]] },
  { row: "Q", segs: [[56,46],[45,35],[34,23],[22,12],[11,1]] },
  { row: "R", segs: [[56,46],[45,35],[34,23],[22,12],[11,1]] },
  { row: "S", segs: [[56,46],[45,35],[34,23],[22,12],[11,1]] },
  { row: "T", segs: [[56,46],[45,35],[34,23],[22,12],[11,1]] },
  { row: "U", segs: [[56,46],[45,35],[34,23],[22,12],[11,1]] },
  { row: "V", segs: [[56,46],[45,35],[34,23],[22,12],[11,1]] },

  // Row W: widest — 68 seats, continuous (no aisle gaps)
  { row: "W", segs: [[68,1]] },
];

// Hardcoded reserved seat list (admin-blocked)
const RESERVED_SEATS = [
  ...range(7,10).map(n => `A${n}`),
  ...range(23,26).map(n => `A${n}`),
  ...range(1,5).map(n => `C${n}`),
];

function range(a, b) {
  const out = [];
  if (a <= b) { for (let i = a; i <= b; i++) out.push(i); }
  else { for (let i = a; i >= b; i--) out.push(i); }
  return out;
}

// Expand SEAT_SPEC into a flat list of seat ids per row
function rowSeats(row) {
  const r = SEAT_SPEC.find(s => s.row === row);
  if (!r) return [];
  const out = [];
  r.segs.forEach(([start, end]) => {
    const step = start >= end ? -1 : 1;
    for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
      out.push(`${row}${n}`);
    }
  });
  return out;
}

function allSeatsForTier(tierId) {
  const t = TIERS.find(t => t.id === tierId);
  if (!t) return [];
  return t.rows.flatMap(rowSeats);
}

// Count seats and side seats (for "10% less side" rule)
function sideSeats(row) {
  const r = SEAT_SPEC.find(s => s.row === row);
  if (!r) return new Set();
  const total = r.segs.reduce((s, [a, b]) => s + Math.abs(a - b) + 1, 0);
  const sideCount = Math.floor(total * 0.1);
  // First and last sideCount seats of the row (outermost on each wing)
  const allSeats = rowSeats(row);
  const sides = new Set();
  for (let i = 0; i < sideCount; i++) {
    sides.add(allSeats[i]);
    sides.add(allSeats[allSeats.length - 1 - i]);
  }
  return sides;
}

// ---------------------------------------------------------
// Seed members + events
// ---------------------------------------------------------
const FIRST_NAMES = ["Aarav","Vivaan","Aditya","Vihaan","Arjun","Sai","Reyansh","Krishna","Ishaan","Shaurya","Rudra","Ayaan","Atharv","Kabir","Anaya","Aaradhya","Saanvi","Aanya","Pari","Diya","Myra","Sara","Aarohi","Anika","Navya","Riya","Kiara","Avni","Meera","Tara","Nikhil","Rohan","Karan","Manav","Yash","Dev","Hiren","Mehul","Nilesh","Kalpesh","Tushar","Bhavin","Jignesh","Rakesh","Sanjay","Hetal","Priti","Nishita","Reema","Falguni"];
const LAST_NAMES = ["Patel","Shah","Desai","Mehta","Joshi","Modi","Trivedi","Vyas","Bhatt","Pandya","Dave","Parikh","Gandhi","Kapadia","Kothari","Sanghvi","Vora","Jain","Doshi","Mistry","Vasani","Italiya","Khatri","Vaishnav","Solanki"];

function seedMembers(count = 64) {
  const members = [];
  let id = 1;
  const seed = (n, tierId, paidRate = 0.9) => {
    const t = TIERS.find(x => x.id === tierId);
    for (let i = 0; i < n; i++) {
      const f1 = FIRST_NAMES[(id * 7) % FIRST_NAMES.length];
      const f2 = FIRST_NAMES[(id * 13 + 3) % FIRST_NAMES.length];
      const l = LAST_NAMES[(id * 11) % LAST_NAMES.length];
      const paid = Math.random() < paidRate;
      const tsBase = Date.parse("2026-03-01") + id * 1000 * 60 * 60 * 4;
      members.push({
        id: `M${1000 + id}`,
        name: `${f1} & ${f2} ${l}`,
        primary: f1,
        spouse: f2,
        mobile: `98${(20000000 + id * 7919) % 100000000}`.padStart(10,"0"),
        email: `${f1.toLowerCase()}.${l.toLowerCase()}@example.in`,
        address: `${(id * 13) % 200 + 1}, ${["Adajan","Vesu","Athwa","Citylight","Piplod","Ghod Dod"][id % 6]}, Surat`,
        tierId,
        joinedAt: new Date(tsBase).toISOString(),
        paidAt: paid ? new Date(tsBase + 1000 * 60 * 30).toISOString() : null,
        paymentRef: paid ? `PAY-${(Math.random() * 1e9).toFixed(0)}` : null,
        amount: t.fee,
        membershipYear: 2026,
        status: paid ? "active" : "pending",
      });
      id++;
    }
  };
  seed(6, "freeflow", 1);
  seed(10, "m50", 0.95);
  seed(10, "m45", 0.95);
  seed(8, "m35", 0.9);
  seed(8, "m30", 0.9);
  seed(8, "m25", 0.85);
  seed(8, "m20", 0.8);
  seed(12, "m15", 0.85);
  return members;
}

const SEED_EVENTS = [
  { id: "E001", name: "Surangini — Classical Evening", type: "Musical", date: "2026-06-14", time: "19:00", venue: "Sanjeev Kumar Auditorium", status: "scheduled", description: "Hindustani classical with Pandit Ramesh Kulkarni and ensemble." },
  { id: "E002", name: "Hasya Ratri", type: "Comedy", date: "2026-08-09", time: "20:00", venue: "Sanjeev Kumar Auditorium", status: "scheduled", description: "An evening of Gujarati stand-up." },
  { id: "E003", name: "Maa Re Maa", type: "Natak", date: "2026-09-21", time: "19:30", venue: "Sanjeev Kumar Auditorium", status: "scheduled", description: "Gujarati family drama by Manhar Gadhia troupe." },
  { id: "E004", name: "Sufi Saanjh", type: "Musical", date: "2026-11-08", time: "19:00", venue: "Sanjeev Kumar Auditorium", status: "draft", description: "Sufi night featuring guest artists." },
  { id: "E005", name: "Annual Mushaira", type: "Literary", date: "2027-01-18", time: "18:30", venue: "Sanjeev Kumar Auditorium", status: "draft", description: "Curated Urdu poetry recital." },
];

Object.assign(window, {
  TIERS, TIER_CLASS, ROW_TIER, SEAT_SPEC, RESERVED_SEATS,
  rowSeats, allSeatsForTier, sideSeats,
  seedMembers, SEED_EVENTS, range,
});
