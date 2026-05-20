/* =========================================================
   seatmap.jsx — Faithful auditorium grid
   ========================================================= */

const { useState, useMemo, useRef, useEffect } = React;

function SeatMap({
  highlightTier = null,         // tier id to highlight
  eventId = null,               // if set, paint allocations
  selectedSeats = [],           // seat ids to outline (e.g. user-picking)
  selectableTier = null,        // restrict click to this tier
  showLegend = true,
  onSeatClick = null,
  showOnlyTiers = null,         // array of tier ids to render (others get muted)
  mode = "view",                // view | admin
}) {
  const [hover, setHover] = useState(null);
  const reserved = useMemo(() => new Set(RESERVED_SEATS), []);
  const allocations = useMemo(
    () => (eventId ? listSeatAllocations(eventId) : {}),
    [eventId]
  );
  const blockedSet = useMemo(() => {
    if (!eventId) return new Set();
    return new Set((getState().blockedSeats || {})[eventId] || []);
  }, [eventId]);

  const selectedSet = useMemo(() => new Set(selectedSeats), [selectedSeats]);
  const showOnlyTierSet = showOnlyTiers ? new Set(showOnlyTiers) : null;

  function seatClass(sid, row) {
    const tierId = ROW_TIER[row];
    const cls = ["seat", TIER_CLASS[tierId] || ""];

    if (reserved.has(sid)) {
      cls.push("reserved");
      return cls.join(" ");
    }
    if (blockedSet.has(sid)) {
      cls.push("blocked");
      return cls.join(" ");
    }
    if (allocations[sid]) {
      cls.push("allocated");
    } else {
      // mark "10% less side" seats — excluded from auto-allocation in rotation tiers
      const tier = TIERS.find(t => t.id === tierId);
      if (tier && (tier.rule === "rotation" || tier.rule === "softrotation")) {
        if (sideSeats(row).has(sid)) cls.push("side");
      }
    }
    if (selectedSet.has(sid)) cls.push("selected");
    if (showOnlyTierSet && !showOnlyTierSet.has(tierId)) {
      cls.push("muted");
    }
    if (highlightTier && tierId !== highlightTier) {
      cls.push("muted");
    }
    return cls.join(" ");
  }

  function handleClick(sid, row) {
    const tierId = ROW_TIER[row];
    if (reserved.has(sid)) return;
    if (selectableTier && tierId !== selectableTier) return;
    if (!onSeatClick) return;
    onSeatClick(sid, { tierId, row, isReserved: false, isAllocated: !!allocations[sid], isBlocked: blockedSet.has(sid) });
  }

  const widestRow = 68; // W is widest, anchor visual width
  const tipFor = (sid) => {
    if (!hover || hover !== sid) return null;
    const row = sid.match(/^[A-W]/)[0];
    const tierId = ROW_TIER[row];
    const tier = TIERS.find(t => t.id === tierId);
    const memberId = allocations[sid];
    const member = memberId ? getMember(memberId) : null;
    let status = "Available";
    if (reserved.has(sid)) status = "Reserved (house)";
    else if (blockedSet.has(sid)) status = "Blocked (admin)";
    else if (memberId) status = `Allocated · ${member ? member.name : memberId}`;
    return (
      <div className="seat-tip">
        <b>{sid}</b> · {tier.code}<br/>
        {status}
      </div>
    );
  };

  return (
    <div className="seatmap-wrap">
      {showLegend && (
        <div className="legend">
          {TIERS.map(t => (
            <div key={t.id} className="legend-item">
              <div className={"legend-swatch " + TIER_CLASS[t.id]} style={{ background: tierColor(t.id) }} />
              <span>{t.code} · {t.rows.join("")}</span>
            </div>
          ))}
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: "var(--ink)", position: "relative" }}>
              <div style={{ position: "absolute", inset: "30%", background: "var(--paper)", borderRadius: 1 }} />
            </div>
            <span>House reserved</span>
          </div>
          <div className="legend-item">
            <div className="legend-swatch" style={{
              background: tierColor("m45"),
              position: "relative",
              overflow: "hidden"
            }}>
              <div style={{
                position: "absolute", inset: 0,
                backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.85) 0 1.5px, transparent 1.5px 3.5px)",
                borderRadius: "inherit"
              }} />
            </div>
            <span>10% side · excluded from rotation</span>
          </div>
          <div className="legend-item">
            <div className="legend-swatch" style={{
              background: "var(--ink-4)",
              backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,0,0,0.4) 2px, rgba(0,0,0,0.4) 3px)"
            }} />
            <span>Blocked</span>
          </div>
          <div className="legend-item">
            <div className="legend-swatch" style={{ background: "var(--accent)" }} />
            <span>Allocated</span>
          </div>
        </div>
      )}

      <div className="seatmap-scroll">
        <div className="seatmap-inner">
          <div className="stage-bar">Stage</div>
          <div className={"seatmap"}>
        {SEAT_SPEC.map(({ row, segs }) => {
          const rowTotal = segs.reduce((sum, [a, b]) => sum + Math.abs(a - b) + 1, 0);
          const rowEl = (
            <div key={row} className="seat-row">
              <div className="row-label">{row}</div>
              {segs.map(([start, end], i) => {
                const seats = [];
                const step = start >= end ? -1 : 1;
                for (let n = start; step > 0 ? n <= end : n >= end; n += step) {
                  const sid = `${row}${n}`;
                  seats.push(
                    <div
                      key={sid}
                      className={seatClass(sid, row)}
                      onMouseEnter={() => setHover(sid)}
                      onMouseLeave={() => setHover(h => h === sid ? null : h)}
                      onClick={() => handleClick(sid, row)}
                      style={{ position: "relative" }}
                    >
                      {tipFor(sid)}
                    </div>
                  );
                }
                return (
                  <React.Fragment key={i}>
                    <div className="seg">{seats}</div>
                    {i < segs.length - 1 && (
                      <div className={"seg-gap " + gapClass(i, segs.length)} />
                    )}
                  </React.Fragment>
                );
              })}
              <div className="row-label">{row}</div>
            </div>
          );
          // Horizontal aisles after H and after P (2 seats tall)
          if (row === "H" || row === "P") {
            return (
              <React.Fragment key={row}>
                {rowEl}
                <div className="row-aisle" aria-hidden="true" />
              </React.Fragment>
            );
          }
          return rowEl;
        })}
          </div>
        </div>
      </div>
    </div>
  );
}

function tierColor(id) {
  return {
    freeflow: "#2d8859",
    m50: "#2563b5",
    m45: "#d978c2",
    m35: "#14a098",
    m30: "#d97334",
    m25: "#b53455",
    m20: "#4f9a3b",
    m15: "#d35438",
  }[id];
}

// Aisle gap widths per gap index, from left to right.
// Reference layout: each aisle = 3 seats wide (4 aisles × 3 = 12, matching W = V + 12).
function gapClass(gapIndex, totalSegs) {
  const gapCount = totalSegs - 1;
  if (gapCount === 4) {
    return ["g3", "g3", "g3", "g3"][gapIndex];
  }
  if (gapCount === 2) {
    // Only the two central aisles
    return ["g3", "g3"][gapIndex];
  }
  return "g3";
}

// Add muted style
const __muteStyle = document.createElement("style");
__muteStyle.textContent = `.seat.muted { opacity: 0.18; filter: grayscale(0.4); }`;
document.head.appendChild(__muteStyle);

Object.assign(window, { SeatMap, tierColor });
