/* =========================================================
   store.jsx — Mock API + localStorage persistence
   This layer is intentionally isolated from UI so it can be
   swapped for real APIs later (Cloudflare D1, Razorpay, etc).
   ========================================================= */

const STORE_KEY = "ice-surat:v1";
const YEAR = 2026;

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch { return null; }
}
function persist(state) {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

function initialState() {
  const members = seedMembers();
  return {
    members,
    events: [...SEED_EVENTS],
    allocations: {},      // { eventId: { seatId: memberId } }
    manualSeats: {},      // { eventId: { memberId: [seatA, seatB] } } — admin overrides
    blockedSeats: {},     // { eventId: [seatId,...] } — admin-blocked beyond global reserved
    auditLog: [],
    fixedAssignments: {}, // { memberId: [seatA, seatB] } — sticky for "fix" tiers
  };
}

function getState() {
  let s = load();
  if (!s) { s = initialState(); persist(s); }
  return s;
}

function setState(updater) {
  const s = getState();
  const next = typeof updater === "function" ? updater(s) : updater;
  persist(next);
  window.dispatchEvent(new CustomEvent("ice-store-update"));
  return next;
}

function resetStore() {
  persist(initialState());
  window.dispatchEvent(new CustomEvent("ice-store-update"));
}

// --------------------- Members ---------------------
function listMembers(filter = {}) {
  const s = getState();
  let m = s.members;
  if (filter.status) m = m.filter(x => x.status === filter.status);
  if (filter.tierId) m = m.filter(x => x.tierId === filter.tierId);
  if (filter.q) {
    const q = filter.q.toLowerCase();
    m = m.filter(x =>
      x.name.toLowerCase().includes(q) ||
      x.mobile.includes(q) ||
      x.email.toLowerCase().includes(q) ||
      x.id.toLowerCase().includes(q)
    );
  }
  return m;
}
function getMember(id) { return getState().members.find(m => m.id === id); }

function createMember({ primary, spouse, mobile, email, address, tierId }) {
  const tier = TIERS.find(t => t.id === tierId);
  if (!tier) throw new Error("Invalid tier");
  const id = `M${1000 + Math.floor(Math.random() * 9000)}`;
  const now = new Date().toISOString();
  const member = {
    id,
    name: spouse ? `${primary} & ${spouse}` : primary,
    primary, spouse,
    mobile, email,
    address: address || "",
    tierId,
    joinedAt: now,
    paidAt: null,
    paymentRef: null,
    amount: tier.fee,
    membershipYear: YEAR,
    status: "pending",
  };
  setState(s => ({ ...s, members: [...s.members, member] }));
  return member;
}

function createMockPayment(memberId) {
  return new Promise(resolve => {
    setTimeout(() => {
      const ref = `PAY-${Date.now().toString(36).toUpperCase()}`;
      const ts = new Date().toISOString();
      setState(s => ({
        ...s,
        members: s.members.map(m =>
          m.id === memberId ? { ...m, status: "active", paidAt: ts, paymentRef: ref } : m
        ),
      }));
      resolve({ ref, ts });
    }, 1100);
  });
}

// --------------------- Events ---------------------
function listEvents() { return getState().events; }
function getEvent(id) { return getState().events.find(e => e.id === id); }

function createEvent({ name, type, date, time, venue, description, status = "scheduled" }) {
  const id = `E${(100 + getState().events.length + 1).toString()}`;
  const ev = { id, name, type, date, time, venue, description: description || "", status };
  setState(s => ({ ...s, events: [...s.events, ev] }));
  return ev;
}
function updateEvent(id, patch) {
  setState(s => ({ ...s, events: s.events.map(e => e.id === id ? { ...e, ...patch } : e) }));
}
function deleteEvent(id) {
  setState(s => {
    const next = { ...s, events: s.events.filter(e => e.id !== id) };
    const { [id]: _a, ...alloc } = s.allocations;
    const { [id]: _b, ...manual } = s.manualSeats || {};
    const { [id]: _c, ...blocked } = s.blockedSeats || {};
    next.allocations = alloc; next.manualSeats = manual; next.blockedSeats = blocked;
    return next;
  });
}

// --------------------- Allocation ---------------------
// Core: allocate seats for an event, respecting tier rules
function allocateSeatsForEvent(eventId, opts = {}) {
  const s = getState();
  const event = s.events.find(e => e.id === eventId);
  if (!event) throw new Error("Event not found");

  const reserved = new Set(RESERVED_SEATS);
  const blocked = new Set((s.blockedSeats || {})[eventId] || []);
  const taken = new Set();
  const allocations = {};      // seatId -> memberId
  const memberSeats = {};      // memberId -> [seatA, seatB]
  const unallocated = [];

  // Helper: try to grab a contiguous pair from a given pool of available seats
  function takePair(pool) {
    // Sort by row, then seat number, prefer contiguous
    const groups = {};
    for (const sid of pool) {
      const row = sid.match(/^[A-W]/)[0];
      const num = parseInt(sid.slice(1), 10);
      groups[row] = groups[row] || [];
      groups[row].push({ sid, num });
    }
    for (const row of Object.keys(groups)) {
      groups[row].sort((a, b) => a.num - b.num);
      const arr = groups[row];
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i + 1].num === arr[i].num + 1) {
          return [arr[i].sid, arr[i + 1].sid];
        }
      }
    }
    // No contiguous pair — fall back to any two seats in same row
    for (const row of Object.keys(groups)) {
      const arr = groups[row];
      if (arr.length >= 2) return [arr[0].sid, arr[1].sid];
    }
    // Anything
    return pool.slice(0, 2);
  }

  // Build per-row available pool for a tier (respects reserved/blocked/taken & side rule)
  function poolForTier(tier) {
    let pool = [];
    for (const row of tier.rows) {
      const all = rowSeats(row);
      const sides = (tier.rule === "rotation" || tier.rule === "softrotation") ? sideSeats(row) : new Set();
      for (const sid of all) {
        if (reserved.has(sid) || blocked.has(sid) || taken.has(sid)) continue;
        if (sides.has(sid)) continue;
        pool.push(sid);
      }
    }
    return pool;
  }

  // Sort active members for deterministic allocation
  const active = s.members
    .filter(m => m.status === "active")
    .sort((a, b) => (a.paidAt || "").localeCompare(b.paidAt || ""));

  // Group by tier
  const byTier = {};
  for (const m of active) {
    byTier[m.tierId] = byTier[m.tierId] || [];
    byTier[m.tierId].push(m);
  }

  // Process tiers in order: fixed first (priority on fixed seats)
  for (const tier of TIERS) {
    const members = byTier[tier.id] || [];

    // Manual overrides apply first (admin-set), regardless of rule
    const manualMap = (s.manualSeats || {})[eventId] || {};

    for (const m of members) {
      // Manual override for this event
      if (manualMap[m.id]) {
        const pair = manualMap[m.id];
        for (const sid of pair) { taken.add(sid); allocations[sid] = m.id; }
        memberSeats[m.id] = pair;
        continue;
      }

      let pair = null;

      if (tier.rule === "fix") {
        // Stick to previous fixed assignment if any
        if (s.fixedAssignments[m.id]) {
          const fix = s.fixedAssignments[m.id];
          if (fix.every(sid => !taken.has(sid) && !reserved.has(sid) && !blocked.has(sid))) {
            pair = fix;
          }
        }
      } else if (tier.rule === "fcfs") {
        // First-come allocates strictly in payment order — already sorted
      }

      if (!pair) {
        let pool = poolForTier(tier);
        // Rotation: offset starting row based on event order for fairness
        if (tier.rule === "rotation") {
          const evIndex = s.events.findIndex(e => e.id === eventId);
          const rotated = [...tier.rows.slice(evIndex % tier.rows.length), ...tier.rows.slice(0, evIndex % tier.rows.length)];
          pool.sort((a, b) => {
            const ra = a.match(/^[A-W]/)[0], rb = b.match(/^[A-W]/)[0];
            return rotated.indexOf(ra) - rotated.indexOf(rb);
          });
        }
        if (pool.length < 2) {
          unallocated.push(m.id);
          continue;
        }
        pair = takePair(pool);
      }

      if (!pair || pair.length < 2) { unallocated.push(m.id); continue; }
      for (const sid of pair) { taken.add(sid); allocations[sid] = m.id; }
      memberSeats[m.id] = pair;
    }
  }

  // Persist: store allocations for event; capture fixed-tier assignments if first allocation
  setState(s => {
    const fixedNext = { ...(s.fixedAssignments || {}) };
    for (const tier of TIERS) {
      if (tier.rule !== "fix") continue;
      for (const m of (s.members || [])) {
        if (m.tierId !== tier.id) continue;
        if (!fixedNext[m.id] && memberSeats[m.id]) {
          fixedNext[m.id] = memberSeats[m.id];
        }
      }
    }
    return {
      ...s,
      allocations: { ...s.allocations, [eventId]: allocations },
      fixedAssignments: fixedNext,
      auditLog: [
        { ts: Date.now(), op: "allocate", eventId, allocated: Object.keys(allocations).length, unallocated: unallocated.length },
        ...(s.auditLog || []),
      ].slice(0, 200),
    };
  });

  return {
    allocated: Object.keys(allocations).length,
    memberCount: active.length,
    unallocated,
  };
}

function clearAllocation(eventId) {
  setState(s => {
    const a = { ...s.allocations }; delete a[eventId];
    const m = { ...(s.manualSeats || {}) }; delete m[eventId];
    return { ...s, allocations: a, manualSeats: m };
  });
}

function listSeatAllocations(eventId) {
  return getState().allocations[eventId] || {};
}

function setManualSeat(eventId, memberId, seats) {
  setState(s => {
    const m = { ...(s.manualSeats || {}) };
    m[eventId] = { ...(m[eventId] || {}), [memberId]: seats };
    return { ...s, manualSeats: m };
  });
}

function toggleBlockedSeat(eventId, seatId) {
  setState(s => {
    const b = { ...(s.blockedSeats || {}) };
    const list = new Set(b[eventId] || []);
    if (list.has(seatId)) list.delete(seatId); else list.add(seatId);
    b[eventId] = [...list];
    return { ...s, blockedSeats: b };
  });
}

// --------------------- CSV Export ---------------------
function toCSV(rows) {
  if (!rows.length) return "";
  const header = Object.keys(rows[0]);
  const esc = v => {
    if (v == null) return "";
    const s = String(v).replace(/"/g, '""');
    return /[",\n]/.test(s) ? `"${s}"` : s;
  };
  return [header.join(","), ...rows.map(r => header.map(h => esc(r[h])).join(","))].join("\n");
}

function downloadCSV(filename, csv) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; document.body.appendChild(a); a.click();
  setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 100);
}

function exportMembersCSV() {
  const s = getState();
  const rows = s.members.map(m => {
    const t = TIERS.find(x => x.id === m.tierId);
    return {
      id: m.id, name: m.name, primary: m.primary, spouse: m.spouse,
      mobile: m.mobile, email: m.email, address: m.address,
      tier: t.code, fee: m.amount, status: m.status,
      paid_at: m.paidAt || "", payment_ref: m.paymentRef || "",
      year: m.membershipYear,
    };
  });
  downloadCSV(`ice-surat-members-${YEAR}.csv`, toCSV(rows));
  return rows.length;
}

function exportEventSeatCSV(eventId) {
  const s = getState();
  const event = s.events.find(e => e.id === eventId);
  const alloc = s.allocations[eventId] || {};
  const memberMap = {};
  s.members.forEach(m => { memberMap[m.id] = m; });
  // Group by member -> seats
  const byMember = {};
  Object.entries(alloc).forEach(([seat, mid]) => {
    byMember[mid] = byMember[mid] || [];
    byMember[mid].push(seat);
  });
  const rows = Object.entries(byMember).map(([mid, seats]) => {
    const m = memberMap[mid];
    const t = TIERS.find(x => x.id === m.tierId);
    return {
      event: event.name, event_date: event.date, member_id: mid,
      member_name: m.name, mobile: m.mobile,
      tier: t.code, seats: seats.join(" + "),
    };
  });
  downloadCSV(`ice-surat-event-${eventId}.csv`, toCSV(rows));
  return rows.length;
}

// Aggregate stats
function dashboardStats() {
  const s = getState();
  const total = s.members.length;
  const paid = s.members.filter(m => m.status === "active").length;
  const pending = total - paid;
  const collection = s.members.filter(m => m.status === "active").reduce((sum, m) => sum + (m.amount || 0), 0);
  const totalCollection = s.members.reduce((sum, m) => sum + (m.amount || 0), 0);
  const events = s.events.length;
  const seatsAllocated = Object.values(s.allocations).reduce((sum, a) => sum + Object.keys(a).length, 0);
  return { total, paid, pending, collection, totalCollection, events, seatsAllocated };
}

Object.assign(window, {
  getState, setState, resetStore,
  listMembers, getMember, createMember, createMockPayment,
  listEvents, getEvent, createEvent, updateEvent, deleteEvent,
  allocateSeatsForEvent, clearAllocation, listSeatAllocations,
  setManualSeat, toggleBlockedSeat,
  exportMembersCSV, exportEventSeatCSV,
  dashboardStats, toCSV, downloadCSV,
});
