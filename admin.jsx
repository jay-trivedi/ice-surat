/* =========================================================
   admin.jsx — Admin dashboard, events, allocation, members, CSV
   ========================================================= */

function Admin({ go, params }) {
  const [tab, setTab] = useState(params?.tab || "dashboard");
  const [, force] = useState(0);
  useEffect(() => {
    const onUpdate = () => force(x => x + 1);
    window.addEventListener("ice-store-update", onUpdate);
    return () => window.removeEventListener("ice-store-update", onUpdate);
  }, []);

  return (
    <div className="page">
      <div className="container-wide">
        <div className="admin-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 24, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div className="crumb"><a onClick={() => go("landing")} style={{ cursor: "pointer" }}>Home</a> / <span>Organiser console</span></div>
            <h1 className="page-title">Organiser console</h1>
            <p className="page-sub">Members, events, and seat allocation for the 2026–27 Sur Sanidhya season.</p>
          </div>
          <div className="pill-tabs">
            {[
              { k: "dashboard", l: "Overview" },
              { k: "members", l: "Members" },
              { k: "events", l: "Events" },
              { k: "allocation", l: "Allocation" },
            ].map(t => (
              <div key={t.k} className={"pill-tab" + (tab === t.k ? " active" : "")} onClick={() => setTab(t.k)}>{t.l}</div>
            ))}
          </div>
        </div>

        {tab === "dashboard" && <AdminDashboard go={go} setTab={setTab} />}
        {tab === "members" && <AdminMembers />}
        {tab === "events" && <AdminEvents setTab={setTab} />}
        {tab === "allocation" && <AdminAllocation params={params} />}
      </div>
    </div>
  );
}

// -------------- Dashboard --------------
function AdminDashboard({ go, setTab }) {
  const stats = dashboardStats();
  const events = listEvents();
  const state = getState();
  const recentAudit = (state.auditLog || []).slice(0, 6);

  return (
    <>
      <div className="stat-grid">
        <Stat label="Total members" value={stats.total.toLocaleString("en-IN")} foot={`for ${2026}–27 season`} />
        <Stat label="Paid · active" value={stats.paid.toLocaleString("en-IN")} foot={`${pct(stats.paid, stats.total)}% of total`} cls="up" />
        <Stat label="Pending" value={stats.pending.toLocaleString("en-IN")} foot="awaiting payment" cls="warn" />
        <Stat label="Annual collection" value={`₹${(stats.collection / 1000).toFixed(0)}k`} foot={`of ₹${(stats.totalCollection / 1000).toFixed(0)}k expected`} />
        <Stat label="Events" value={stats.events.toLocaleString("en-IN")} foot="in season" />
        <Stat label="Seats allocated" value={stats.seatsAllocated.toLocaleString("en-IN")} foot="across all events" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 16, marginTop: 16 }}>
        <div className="card">
          <div className="card-h">
            <h3>Upcoming events</h3>
            <button className="btn btn-sm btn-ghost" onClick={() => setTab("events")}>Manage all →</button>
          </div>
          <table className="tbl">
            <thead>
              <tr><th>Event</th><th>Date</th><th>Status</th><th style={{ textAlign: "right" }}>Allocated</th><th /></tr>
            </thead>
            <tbody>
              {events.map(ev => {
                const alloc = (state.allocations[ev.id] || {});
                const count = Object.keys(alloc).length;
                return (
                  <tr key={ev.id}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{ev.name}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{ev.type} · {ev.venue}</div>
                    </td>
                    <td className="num">{ev.date}</td>
                    <td>
                      <span className={"badge " + (ev.status === "scheduled" ? "badge-ok" : ev.status === "draft" ? "badge-warn" : "badge")}>
                        <span className="badge-dot" />{ev.status}
                      </span>
                    </td>
                    <td className="num" style={{ textAlign: "right" }}>{count.toLocaleString("en-IN")}</td>
                    <td style={{ textAlign: "right" }}>
                      <button className="btn btn-sm btn-ghost" onClick={() => { window.__nav("admin", { tab: "allocation", eventId: ev.id }); }}>Allocate</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-h"><h3>Activity</h3></div>
          {recentAudit.length === 0 ? (
            <div className="empty-state">
              <div style={{ fontSize: 32, opacity: 0.3 }}>—</div>
              <h4>No activity yet</h4>
              <div style={{ fontSize: 13 }}>Run an allocation to see it here.</div>
            </div>
          ) : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {recentAudit.map((a, i) => {
                const ev = events.find(e => e.id === a.eventId);
                return (
                  <li key={i} style={{ padding: "12px 0", borderBottom: i < recentAudit.length - 1 ? "1px solid var(--line-2)" : "none", display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <div>
                      <div style={{ fontSize: 14 }}><b>Allocation run</b> · {ev ? ev.name : a.eventId}</div>
                      <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{a.allocated} seats · {a.unallocated} unallocated</div>
                    </div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-4)" }}>{new Date(a.ts).toLocaleString("en-IN")}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 16 }}>
        <div className="card-h">
          <h3>Tier breakdown</h3>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-sm btn-ghost" onClick={() => { const n = exportMembersCSV(); window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: `Exported ${n} members to CSV.`, kind: "ok" } })); }}>Export members CSV</button>
          </div>
        </div>
        <TierBreakdown />
      </div>
    </>
  );
}

function pct(a, b) { return b ? Math.round((a / b) * 100) : 0; }

function Stat({ label, value, foot, cls = "" }) {
  return (
    <div className="stat">
      <div className="stat-label">{label}</div>
      <div className="stat-value">{value}</div>
      <div className={"stat-foot " + cls}>{foot}</div>
    </div>
  );
}

function TierBreakdown() {
  const state = getState();
  const rows = TIERS.map(t => {
    const m = state.members.filter(x => x.tierId === t.id);
    const paid = m.filter(x => x.status === "active").length;
    const pending = m.length - paid;
    const collected = paid * t.fee;
    return { ...t, total: m.length, paid, pending, collected };
  });
  const grandTotal = rows.reduce((s, r) => s + r.total, 0);

  return (
    <table className="tbl">
      <thead>
        <tr>
          <th style={{ width: 28 }}></th>
          <th>Tier</th>
          <th>Rows</th>
          <th>Fee</th>
          <th style={{ textAlign: "right" }}>Members</th>
          <th style={{ textAlign: "right" }}>Paid</th>
          <th style={{ textAlign: "right" }}>Pending</th>
          <th style={{ textAlign: "right" }}>Collected</th>
          <th>Share</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.id}>
            <td><div style={{ width: 14, height: 14, borderRadius: 3, background: tierColor(r.id) }} /></td>
            <td><b>{r.name}</b></td>
            <td className="num">{r.rows.join(" · ")}</td>
            <td className="num">₹{r.fee.toLocaleString("en-IN")}</td>
            <td className="num" style={{ textAlign: "right" }}>{r.total}</td>
            <td className="num" style={{ textAlign: "right", color: "var(--ok)" }}>{r.paid}</td>
            <td className="num" style={{ textAlign: "right", color: "var(--warn)" }}>{r.pending}</td>
            <td className="num" style={{ textAlign: "right" }}>₹{r.collected.toLocaleString("en-IN")}</td>
            <td style={{ width: 140 }}>
              <div style={{ height: 6, background: "var(--bg-2)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ width: `${pct(r.total, grandTotal)}%`, height: "100%", background: tierColor(r.id) }} />
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// -------------- Members --------------
function AdminMembers() {
  const [q, setQ] = useState("");
  const [tierFilter, setTierFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const all = listMembers();
  const filtered = all.filter(m => {
    if (q) {
      const ql = q.toLowerCase();
      if (!m.name.toLowerCase().includes(ql) && !m.mobile.includes(q) && !m.id.toLowerCase().includes(ql) && !m.email.toLowerCase().includes(ql)) return false;
    }
    if (tierFilter && m.tierId !== tierFilter) return false;
    if (statusFilter && m.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 12, display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
        <input
          placeholder="Search by name, mobile, member id…"
          value={q} onChange={e => setQ(e.target.value)}
          style={{ flex: 1, minWidth: 240, padding: "10px 14px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 14, background: "var(--bg)" }}
        />
        <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg)" }}>
          <option value="">All tiers</option>
          {TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg)" }}>
          <option value="">All status</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
        </select>
        <button className="btn btn-ghost btn-sm" onClick={() => { const n = exportMembersCSV(); window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: `Exported ${n} members to CSV.`, kind: "ok" } })); }}>
          ↓ Export CSV
        </button>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table className="tbl">
          <thead>
            <tr>
              <th>Member</th>
              <th>Tier</th>
              <th>Mobile</th>
              <th>Email</th>
              <th>Status</th>
              <th>Paid on</th>
              <th style={{ textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(m => {
              const t = TIERS.find(x => x.id === m.tierId);
              return (
                <tr key={m.id}>
                  <td>
                    <div style={{ fontWeight: 600 }}>{m.name}</div>
                    <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)" }}>{m.id}</div>
                  </td>
                  <td>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                      <span style={{ width: 10, height: 10, borderRadius: 2, background: tierColor(t.id) }} />
                      <b>{t.name}</b>
                    </span>
                  </td>
                  <td className="mono">{m.mobile}</td>
                  <td style={{ fontSize: 13, color: "var(--ink-3)" }}>{m.email}</td>
                  <td>
                    <span className={"badge " + (m.status === "active" ? "badge-ok" : "badge-warn")}>
                      <span className="badge-dot" />{m.status}
                    </span>
                  </td>
                  <td className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{m.paidAt ? new Date(m.paidAt).toLocaleDateString("en-IN") : "—"}</td>
                  <td className="num" style={{ textAlign: "right" }}>₹{m.amount.toLocaleString("en-IN")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <div className="empty-state"><h4>No members match</h4><div>Adjust filters or clear the search.</div></div>}
      </div>
      <div style={{ marginTop: 12, fontSize: 12, color: "var(--ink-3)", textAlign: "right" }}>
        Showing {filtered.length} of {all.length} members
      </div>
    </div>
  );
}

// -------------- Events --------------
function AdminEvents({ setTab }) {
  const [editing, setEditing] = useState(null);
  const events = listEvents();
  const state = getState();

  function startCreate() {
    setEditing({ name: "", type: "Musical", date: "", time: "19:00", venue: "Sanjeev Kumar Auditorium", description: "", status: "scheduled", isNew: true });
  }

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <div style={{ fontWeight: 600 }}>Season 2026–27 · {events.length} events</div>
          <div style={{ fontSize: 12, color: "var(--ink-3)" }}>Schedule, edit, and manage events. Each event has its own seat allocation.</div>
        </div>
        <button className="btn btn-accent" onClick={startCreate}>+ Add event</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {events.map(ev => {
          const alloc = state.allocations[ev.id] || {};
          return (
            <div key={ev.id} className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.06em" }}>{ev.id} · {ev.type}</div>
                  <h3 style={{ fontSize: 20, fontWeight: 600, margin: "4px 0 6px" }}>{ev.name}</h3>
                  <div style={{ fontSize: 13, color: "var(--ink-3)" }}>{ev.venue} · {ev.date} · {ev.time}</div>
                </div>
                <span className={"badge " + (ev.status === "scheduled" ? "badge-ok" : "badge-warn")}>
                  <span className="badge-dot" />{ev.status}
                </span>
              </div>
              <div style={{ fontSize: 13, color: "var(--ink-2)", lineHeight: 1.5, marginBottom: 14 }}>{ev.description}</div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 14, borderTop: "1px dashed var(--line)" }}>
                <div style={{ fontSize: 12, color: "var(--ink-3)" }}>
                  <b style={{ color: "var(--ink)", fontFamily: "var(--font-mono)" }}>{Object.keys(alloc).length}</b> seats allocated
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="btn btn-sm btn-ghost" onClick={() => setEditing(ev)}>Edit</button>
                  <button className="btn btn-sm btn-primary" onClick={() => window.__nav("admin", { tab: "allocation", eventId: ev.id })}>Allocate →</button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {editing && <EventModal initial={editing} onClose={() => setEditing(null)} />}
    </div>
  );
}

function EventModal({ initial, onClose }) {
  const [form, setForm] = useState(initial);
  function save() {
    if (form.isNew) {
      createEvent(form);
      window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: `Event "${form.name}" created.`, kind: "ok" } }));
    } else {
      updateEvent(form.id, form);
      window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: "Event updated.", kind: "ok" } }));
    }
    onClose();
  }
  function remove() {
    if (!confirm(`Delete event "${form.name}"? This also clears its allocations.`)) return;
    deleteEvent(form.id);
    onClose();
  }
  return (
    <div className="modal-bg" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()} style={{ maxWidth: 540 }}>
        <h2 style={{ margin: "0 0 4px", fontSize: 22, fontWeight: 600 }}>{form.isNew ? "New event" : "Edit event"}</h2>
        <p style={{ color: "var(--ink-3)", margin: "0 0 20px", fontSize: 13 }}>Season 2026–27</p>

        <div className="field" style={{ marginBottom: 12 }}>
          <label>Name *</label>
          <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Sufi Saanjh" />
        </div>
        <div className="form-row">
          <div className="field">
            <label>Type</label>
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              {["Natak","Musical","Comedy","Literary","Other"].map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
              <option value="draft">Draft</option>
              <option value="scheduled">Scheduled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="field">
            <label>Date</label>
            <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="field">
            <label>Time</label>
            <input type="time" value={form.time} onChange={e => setForm({ ...form, time: e.target.value })} />
          </div>
        </div>
        <div className="field" style={{ marginBottom: 12 }}>
          <label>Venue</label>
          <input value={form.venue} onChange={e => setForm({ ...form, venue: e.target.value })} />
        </div>
        <div className="field" style={{ marginBottom: 24 }}>
          <label>Description</label>
          <textarea rows="2" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          {!form.isNew ? <button className="btn btn-danger btn-sm" onClick={remove}>Delete</button> : <div />}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-accent" onClick={save}>{form.isNew ? "Create event" : "Save"}</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// -------------- Allocation --------------
function AdminAllocation({ params }) {
  const events = listEvents();
  const [eventId, setEventId] = useState(params?.eventId || events[0]?.id || null);
  const [density, setDensity] = useState("default");
  const [tierFilter, setTierFilter] = useState("");
  const [picked, setPicked] = useState(null);
  const [, force] = useState(0);

  useEffect(() => {
    const onUpdate = () => force(x => x + 1);
    window.addEventListener("ice-store-update", onUpdate);
    return () => window.removeEventListener("ice-store-update", onUpdate);
  }, []);

  if (!eventId) return <div className="empty-state"><h4>No events scheduled</h4><div>Create an event first.</div></div>;

  const event = getEvent(eventId);
  const state = getState();
  const alloc = state.allocations[eventId] || {};
  const allocatedCount = Object.keys(alloc).length;
  const activeMembers = listMembers({ status: "active" });
  const allocatedMembers = new Set(Object.values(alloc));
  const unallocatedCount = activeMembers.length - allocatedMembers.size;

  function runAlloc() {
    const result = allocateSeatsForEvent(eventId);
    window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: `Allocated ${result.allocated} seats. ${result.unallocated.length} unallocated.`, kind: result.unallocated.length ? "warn" : "ok" } }));
  }
  function clearAlloc() {
    if (!confirm("Clear all seat allocations for this event?")) return;
    clearAllocation(eventId);
    window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: "Allocation cleared.", kind: "ok" } }));
  }

  function onSeatClick(sid, info) {
    const mid = alloc[sid];
    if (mid) {
      // open seat detail
      setPicked({ sid, memberId: mid, info });
    } else if (info.isBlocked) {
      // unblock
      toggleBlockedSeat(eventId, sid);
    } else {
      setPicked({ sid, info });
    }
  }

  return (
    <div>
      <div className="card" style={{ padding: 16, marginBottom: 12, display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 12, color: "var(--ink-3)", letterSpacing: "0.06em", textTransform: "uppercase", fontWeight: 600 }}>Event</div>
          <select value={eventId} onChange={e => setEventId(e.target.value)} style={{ padding: "10px 12px", border: "1px solid var(--line)", borderRadius: 8, fontSize: 14, fontWeight: 600, background: "var(--bg)", minWidth: 280 }}>
            {events.map(ev => <option key={ev.id} value={ev.id}>{ev.name} · {ev.date}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", gap: 16, alignItems: "center", fontSize: 13, color: "var(--ink-3)" }}>
          <span><b className="num" style={{ color: "var(--ink)" }}>{allocatedCount}</b> / {activeMembers.length * 2} seats</span>
          {unallocatedCount > 0 && allocatedCount > 0 && (
            <span style={{ color: "var(--warn)" }}><b>{unallocatedCount}</b> unallocated members</span>
          )}
        </div>
        <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <select value={tierFilter} onChange={e => setTierFilter(e.target.value)} style={{ padding: "8px 12px", border: "1px solid var(--line)", borderRadius: 8, background: "var(--bg)", fontSize: 13 }}>
            <option value="">Highlight: all tiers</option>
            {TIERS.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
          </select>
          <div className="pill-tabs" style={{ padding: 3 }}>
            {["tight","default","comfortable"].map(d => (
              <div key={d} className={"pill-tab" + (density === d ? " active" : "")} onClick={() => setDensity(d)} style={{ padding: "4px 10px", fontSize: 11 }}>{d}</div>
            ))}
          </div>
        </div>
      </div>

      <div className="two-col">
        <div>
          <SeatMap
            eventId={eventId}
            highlightTier={tierFilter || null}
            density={density}
            onSeatClick={onSeatClick}
            mode="admin"
          />
        </div>

        <div>
          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Run allocation</h3>
            <p style={{ color: "var(--ink-3)", fontSize: 13, lineHeight: 1.5, margin: "0 0 16px" }}>
              Auto-assigns 2 seats per active member, honouring tier rules
              (fix / rotation / FCFS) and reserved-seat list.
            </p>
            <button className="btn btn-accent" style={{ width: "100%", marginBottom: 8 }} onClick={runAlloc}>
              {allocatedCount > 0 ? "Re-allocate seats" : "Run allocation"}
            </button>
            {allocatedCount > 0 && (
              <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={clearAlloc}>Clear allocation</button>
            )}
          </div>

          <div className="card" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Export</h3>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%", marginBottom: 6 }} onClick={() => { const n = exportEventSeatCSV(eventId); window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: `Exported ${n} member-seat rows.`, kind: "ok" } })); }}>↓ Event seat CSV</button>
            <button className="btn btn-ghost btn-sm" style={{ width: "100%" }} onClick={() => { const n = exportMembersCSV(); window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: `Exported ${n} members.`, kind: "ok" } })); }}>↓ Members CSV</button>
          </div>

          {picked && <SeatDetailCard picked={picked} eventId={eventId} onClose={() => setPicked(null)} />}

          <div className="card">
            <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Tip</h3>
            <ul style={{ paddingLeft: 18, margin: 0, fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
              <li>Click any seat to see details, override member, or block.</li>
              <li>Allocations are stored per-event — switching events shows different layouts.</li>
              <li>Reserved seats (A7–A10, A23–A26, C1–C5) are never auto-allocated.</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

function SeatDetailCard({ picked, eventId, onClose }) {
  const { sid, info } = picked;
  const memberId = picked.memberId;
  const member = memberId ? getMember(memberId) : null;
  const tier = info.tierId ? TIERS.find(t => t.id === info.tierId) : null;

  function unblock() { toggleBlockedSeat(eventId, sid); onClose(); }
  function block() { toggleBlockedSeat(eventId, sid); onClose(); }
  function unallocate() {
    setState(s => {
      const a = { ...s.allocations };
      const evMap = { ...(a[eventId] || {}) };
      delete evMap[sid];
      a[eventId] = evMap;
      return { ...s, allocations: a };
    });
    onClose();
  }

  return (
    <div className="card" style={{ marginBottom: 12, borderColor: "var(--accent)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Seat {sid}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-3)", fontSize: 18 }}>×</button>
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-3)", marginBottom: 14 }}>
        Row {info.row} · Tier <b style={{ color: "var(--ink)" }}>{tier ? tier.name : "—"}</b>
      </div>

      {info.isBlocked ? (
        <>
          <div className="badge badge-warn" style={{ marginBottom: 14 }}><span className="badge-dot" />Blocked by admin</div>
          <button className="btn btn-sm btn-ghost" style={{ width: "100%" }} onClick={unblock}>Unblock seat</button>
        </>
      ) : member ? (
        <>
          <div style={{ padding: 14, background: "var(--bg)", borderRadius: 8, marginBottom: 14 }}>
            <div style={{ fontWeight: 600 }}>{member.name}</div>
            <div className="mono" style={{ fontSize: 12, color: "var(--ink-3)" }}>{member.id} · {member.mobile}</div>
          </div>
          <button className="btn btn-sm btn-danger" style={{ width: "100%", marginBottom: 6 }} onClick={unallocate}>Unallocate</button>
          <button className="btn btn-sm btn-ghost" style={{ width: "100%" }} onClick={block}>Block this seat</button>
        </>
      ) : (
        <>
          <div className="badge" style={{ marginBottom: 14 }}>Available</div>
          <button className="btn btn-sm btn-ghost" style={{ width: "100%" }} onClick={block}>Block this seat</button>
        </>
      )}
    </div>
  );
}

Object.assign(window, { Admin });
