/* =========================================================
   member-flow.jsx — Signup, tier pick, payment, success, dashboard
   ========================================================= */

function Signup({ go, params }) {
  const [step, setStep] = useState(1); // 1=form, 2=tier, 3=review, 4=pay, 5=success
  const [form, setForm] = useState({
    primary: "", spouse: "", mobile: "", email: "", address: "",
    tierId: params?.tierId || null,
  });
  const [errors, setErrors] = useState({});
  const [member, setMember] = useState(null);
  const [paying, setPaying] = useState(false);

  const tier = TIERS.find(t => t.id === form.tierId);

  function validateForm() {
    const e = {};
    if (!form.primary.trim()) e.primary = "Required";
    if (!form.mobile.trim() || !/^\d{10}$/.test(form.mobile)) e.mobile = "10-digit mobile";
    if (!form.email.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(form.email)) e.email = "Valid email";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handlePay() {
    if (!member) {
      const m = createMember({
        primary: form.primary, spouse: form.spouse,
        mobile: form.mobile, email: form.email, address: form.address,
        tierId: form.tierId,
      });
      setMember(m);
      setPaying(true);
      await createMockPayment(m.id);
      setPaying(false);
      setStep(5);
      const updated = getMember(m.id);
      setMember(updated);
    } else {
      setPaying(true);
      await createMockPayment(member.id);
      setPaying(false);
      setStep(5);
    }
  }

  return (
    <div className="page">
      <div className="container" style={{ maxWidth: 880 }}>
        <div className="crumb">
          <a onClick={() => go("landing")} style={{ cursor: "pointer" }}>Home</a> / <span>Become a member</span>
        </div>

        <Stepper current={step} steps={["Your details", "Tier", "Review", "Payment", "Done"]} />

        {step === 1 && <FormStep form={form} setForm={setForm} errors={errors} onNext={() => { if (validateForm()) setStep(2); }} />}
        {step === 2 && <TierStep form={form} setForm={setForm} onBack={() => setStep(1)} onNext={() => form.tierId && setStep(3)} />}
        {step === 3 && <ReviewStep form={form} tier={tier} onBack={() => setStep(2)} onNext={() => setStep(4)} />}
        {step === 4 && <PayStep tier={tier} paying={paying} onBack={() => setStep(3)} onPay={handlePay} />}
        {step === 5 && <SuccessStep member={member} tier={tier} go={go} />}
      </div>
    </div>
  );
}

function Stepper({ current, steps }) {
  return (
    <div style={{ display: "flex", gap: 0, marginBottom: 32, border: "1px solid var(--line)", borderRadius: 10, background: "var(--paper)", overflow: "hidden", flexWrap: "wrap" }} className="stepper-wrap">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === current;
        const done = n < current;
        return (
          <div key={i} style={{
            flex: 1, padding: "14px 18px",
            borderRight: i < steps.length - 1 ? "1px solid var(--line)" : "none",
            background: active ? "var(--ink)" : done ? "var(--bg-2)" : "transparent",
            color: active ? "white" : done ? "var(--ink-2)" : "var(--ink-3)",
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <div style={{
              width: 22, height: 22, borderRadius: "50%",
              background: active ? "white" : done ? "var(--ok)" : "var(--line)",
              color: active ? "var(--ink)" : done ? "white" : "var(--ink-3)",
              fontSize: 12, fontWeight: 700, display: "grid", placeItems: "center",
              fontFamily: "var(--font-mono)",
            }}>
              {done ? "✓" : n}
            </div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
}

function FormStep({ form, setForm, errors, onNext }) {
  return (
    <div className="card card-pad-lg">
      <h2 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.015em" }}>Your details</h2>
      <p style={{ color: "var(--ink-3)", margin: "0 0 28px" }}>Membership is for a couple. Both names appear on the membership.</p>

      <div className="form-row">
        <div className="field">
          <label>Member name *</label>
          <input value={form.primary} onChange={e => setForm({ ...form, primary: e.target.value })} placeholder="e.g. Hiren Patel" />
          {errors.primary && <div className="err">{errors.primary}</div>}
        </div>
        <div className="field">
          <label>Spouse / partner name</label>
          <input value={form.spouse} onChange={e => setForm({ ...form, spouse: e.target.value })} placeholder="e.g. Priti Patel" />
        </div>
      </div>
      <div className="form-row">
        <div className="field">
          <label>Mobile *</label>
          <input value={form.mobile} onChange={e => setForm({ ...form, mobile: e.target.value.replace(/\D/g, "").slice(0, 10) })} placeholder="10-digit" />
          {errors.mobile && <div className="err">{errors.mobile}</div>}
        </div>
        <div className="field">
          <label>Email *</label>
          <input value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.in" />
          {errors.email && <div className="err">{errors.email}</div>}
        </div>
      </div>
      <div className="field" style={{ marginBottom: 28 }}>
        <label>Address (optional)</label>
        <textarea rows="2" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} placeholder="Flat / building / area / city" />
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button className="btn btn-accent btn-lg" onClick={onNext}>Continue · Pick tier →</button>
      </div>
    </div>
  );
}

function TierStep({ form, setForm, onBack, onNext }) {
  return (
    <div>
      <div className="card card-pad-lg" style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.015em" }}>Choose your tier</h2>
        <p style={{ color: "var(--ink-3)", margin: "0 0 0" }}>Each tier maps to specific rows. Click a card to select. Annual fee is for the couple.</p>
      </div>
      <div className="tier-grid" style={{ marginTop: 16 }}>
        {TIERS.map(t => (
          <div
            key={t.id}
            className={"tier-card" + (form.tierId === t.id ? " selected" : "")}
            onClick={() => setForm({ ...form, tierId: t.id })}
          >
            <div className="tier-swatch" style={{ background: tierColor(t.id) }} />
            <div className="tier-code">{t.code}</div>
            <h3 className="tier-name">{t.name}</h3>
            <div className="tier-rows">Rows {t.rows.join(" · ")}</div>
            <div className="tier-fee">₹{t.fee.toLocaleString("en-IN")}<small>/year</small></div>
            <div className="tier-rule"><b>{t.ruleLabel}</b>{t.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ marginTop: 32, padding: 18, background: "var(--paper)", border: "1px solid var(--line)", borderRadius: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 14, color: "var(--ink-3)" }}>
            Where will I sit? See the auditorium layout coloured by tier below.
          </div>
        </div>
        <div style={{ marginTop: 16, maxHeight: 340, overflow: "auto" }}>
          <SeatMap density="tight" highlightTier={form.tierId} showLegend={false} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-accent btn-lg" disabled={!form.tierId} onClick={onNext}>Review →</button>
      </div>
    </div>
  );
}

function ReviewStep({ form, tier, onBack, onNext }) {
  return (
    <div className="card card-pad-lg">
      <h2 style={{ fontSize: 24, fontWeight: 600, margin: "0 0 6px", letterSpacing: "-0.015em" }}>Review &amp; confirm</h2>
      <p style={{ color: "var(--ink-3)", margin: "0 0 28px" }}>Make sure everything looks right before payment.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
        <ReviewBox label="Member" value={form.primary + (form.spouse ? ` & ${form.spouse}` : "")} />
        <ReviewBox label="Mobile" value={form.mobile} mono />
        <ReviewBox label="Email" value={form.email} />
        <ReviewBox label="Address" value={form.address || "—"} />
      </div>

      <div style={{ background: "var(--bg)", padding: 20, borderRadius: 10, border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 12 }}>
          <div className="tier-swatch" style={{ background: tierColor(tier.id), width: 36, height: 36, borderRadius: 6, margin: 0 }} />
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Tier</div>
            <div style={{ fontSize: 20, fontWeight: 600 }}>{tier.name} <span style={{ color: "var(--ink-3)", fontWeight: 400, fontSize: 14 }}>· Rows {tier.rows.join(" · ")}</span></div>
          </div>
        </div>
        <div style={{ borderTop: "1px dashed var(--line)", paddingTop: 14, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <span style={{ color: "var(--ink-3)" }}>Annual fee · couple · 2026–27</span>
          <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: "-0.02em", fontFamily: "var(--font-mono)" }}>₹{tier.fee.toLocaleString("en-IN")}</span>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 28 }}>
        <button className="btn btn-ghost" onClick={onBack}>← Back</button>
        <button className="btn btn-accent btn-lg" onClick={onNext}>Proceed to payment →</button>
      </div>
    </div>
  );
}

function ReviewBox({ label, value, mono }) {
  return (
    <div style={{ padding: 16, background: "var(--bg)", border: "1px solid var(--line)", borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 15, fontWeight: 500, fontFamily: mono ? "var(--font-mono)" : "inherit" }}>{value}</div>
    </div>
  );
}

function PayStep({ tier, paying, onBack, onPay }) {
  return (
    <div className="card card-pad-lg" style={{ maxWidth: 560, margin: "0 auto" }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Mock payment gateway</div>
        <div style={{ fontSize: 14, color: "var(--ink-4)", marginTop: 4 }}>Razorpay slot ready in code · this is a prototype</div>
      </div>

      <div style={{ marginTop: 28, padding: 24, background: "var(--bg)", borderRadius: 10, border: "1px solid var(--line)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <span style={{ color: "var(--ink-3)" }}>Sur Sanidhya · {tier.name}</span>
          <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>₹{tier.fee.toLocaleString("en-IN")}</span>
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", color: "var(--ink-3)", fontSize: 13 }}>
          <span>Processing fee</span><span style={{ fontFamily: "var(--font-mono)" }}>₹0</span>
        </div>
        <div style={{ borderTop: "1px dashed var(--line)", marginTop: 12, paddingTop: 12, display: "flex", justifyContent: "space-between" }}>
          <b>Total to pay</b>
          <b style={{ fontFamily: "var(--font-mono)", fontSize: 22 }}>₹{tier.fee.toLocaleString("en-IN")}</b>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "flex", flexDirection: "column", gap: 10 }}>
        <button className="btn btn-accent btn-lg" onClick={onPay} disabled={paying}>
          {paying ? <Spinner /> : null}
          {paying ? "Processing…" : `Pay ₹${tier.fee.toLocaleString("en-IN")} (mock)`}
        </button>
        <button className="btn btn-ghost" onClick={onBack} disabled={paying}>← Back</button>
      </div>

      <div style={{ marginTop: 18, fontSize: 11, color: "var(--ink-4)", textAlign: "center", lineHeight: 1.5 }}>
        Code is structured for Razorpay or any HDFC/CCAvenue gateway — see
        <span className="kbd" style={{ marginInline: 4 }}>store.jsx → createMockPayment</span>
      </div>
    </div>
  );
}

function Spinner() {
  return <span style={{
    display: "inline-block", width: 14, height: 14,
    border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "white",
    borderRadius: "50%", animation: "spin 0.7s linear infinite",
  }} />;
}
const __spinStyle = document.createElement("style");
__spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(__spinStyle);

function SuccessStep({ member, tier, go }) {
  return (
    <div className="card card-pad-lg" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto" }}>
      <div className="success-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
      </div>
      <h2 style={{ fontSize: 28, fontWeight: 700, margin: "0 0 8px", letterSpacing: "-0.02em" }}>Welcome to Sur Sanidhya.</h2>
      <p style={{ color: "var(--ink-3)", margin: "0 0 24px" }}>Your couple membership for season 2026–27 is now active.</p>

      <div style={{ background: "var(--ink)", color: "white", padding: 24, borderRadius: 10, textAlign: "left", position: "relative" }}>
        <div className="brand-mark on-dark" style={{ position: "absolute", top: 18, right: 18, width: 56, height: 56 }}><img src="assets/ice-logo.png" alt="ICE Surat" /></div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16, paddingBottom: 16, borderBottom: "1px dashed rgba(255,255,255,0.25)", paddingRight: 60 }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Membership No.</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, marginTop: 4 }}>SS/{member?.membershipYear || 2026}/{member?.id || "M----"}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)" }}>Tier</div>
            <div style={{ fontSize: 18, marginTop: 4, fontWeight: 600 }}>{tier?.name}</div>
          </div>
        </div>
        <div style={{ fontFamily: "var(--font-serif)", fontSize: 22, marginBottom: 12 }}>{member?.name}</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, fontSize: 12 }}>
          <div><div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Mobile</div>{member?.mobile}</div>
          <div><div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Rows</div>{tier?.rows.join(" · ")}</div>
          <div><div style={{ color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono)", fontSize: 10, letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 4 }}>Paid</div><span style={{ fontFamily: "var(--font-mono)" }}>{member?.paymentRef?.slice(0, 16)}</span></div>
        </div>
      </div>

      <div style={{ display: "flex", gap: 12, justifyContent: "center", marginTop: 28 }}>
        <button className="btn btn-primary" onClick={() => go("member", { memberId: member?.id })}>View my membership →</button>
        <button className="btn btn-ghost" onClick={() => go("landing")}>Back to home</button>
      </div>
    </div>
  );
}

// ----------------------------------------------------------
// Member dashboard — shows membership + per-event seats
// ----------------------------------------------------------
function MemberDashboard({ go, params }) {
  const [memberId, setMemberId] = useState(params?.memberId || null);
  const [members, setMembers] = useState(listMembers({ status: "active" }));

  useEffect(() => {
    function refresh() { setMembers(listMembers({ status: "active" })); }
    window.addEventListener("ice-store-update", refresh);
    return () => window.removeEventListener("ice-store-update", refresh);
  }, []);

  const member = memberId ? getMember(memberId) : null;

  if (!member) {
    return (
      <div className="page">
        <div className="container" style={{ maxWidth: 720 }}>
          <div className="crumb">
            <a onClick={() => go("landing")} style={{ cursor: "pointer" }}>Home</a> / <span>Member portal</span>
          </div>
          <h1 className="page-title">Member portal</h1>
          <p className="page-sub">Pick a member from the seeded directory to preview their portal. In the real app, this is a phone-OTP login.</p>
          <div className="card" style={{ marginTop: 24 }}>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Select a member</label>
              <select onChange={e => setMemberId(e.target.value)} defaultValue="">
                <option value="" disabled>— Choose a member —</option>
                {members.map(m => {
                  const t = TIERS.find(x => x.id === m.tierId);
                  return <option key={m.id} value={m.id}>{m.id} · {m.name} · {t.code}</option>;
                })}
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const tier = TIERS.find(t => t.id === member.tierId);
  const events = listEvents();
  const state = getState();

  return (
    <div className="page">
      <div className="container">
        <div className="crumb">
          <a onClick={() => go("landing")} style={{ cursor: "pointer" }}>Home</a> /
          <a onClick={() => setMemberId(null)} style={{ cursor: "pointer" }}> Member portal</a> /
          <span> {member.id}</span>
        </div>

        <div className="two-col">
          <div>
            <div className="card card-pad-lg" style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20, paddingBottom: 20, borderBottom: "1px dashed var(--line)" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Membership</div>
                  <div style={{ fontSize: 36, fontWeight: 700, letterSpacing: "-0.02em", marginTop: 4, fontFamily: "var(--font-serif)" }}>{member.name}</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 13, color: "var(--ink-3)", marginTop: 4 }}>
                    SS/{member.membershipYear}/{member.id} · {member.mobile}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className={"badge " + (member.status === "active" ? "badge-ok" : "badge-warn")}>
                    <span className="badge-dot" />
                    {member.status === "active" ? "Active" : "Pending payment"}
                  </div>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 10, justifyContent: "flex-end" }}>
                    <div className="tier-swatch" style={{ width: 22, height: 22, borderRadius: 4, background: tierColor(tier.id), margin: 0 }} />
                    <div style={{ fontSize: 18, fontWeight: 600 }}>{tier.name}</div>
                  </div>
                </div>
              </div>

              <h3 style={{ fontSize: 14, letterSpacing: "0.04em", textTransform: "uppercase", color: "var(--ink-3)", margin: "0 0 16px" }}>This season</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {events.map(ev => {
                  const alloc = state.allocations[ev.id] || {};
                  const mySeats = Object.entries(alloc).filter(([_, mid]) => mid === member.id).map(([sid]) => sid);
                  return (
                    <div key={ev.id} style={{ display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 16, alignItems: "center", padding: "14px 16px", background: "var(--bg)", borderRadius: 8, border: "1px solid var(--line-2)" }}>
                      <div style={{ width: 56, textAlign: "center" }}>
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {new Date(ev.date).toLocaleString("en-IN", { month: "short" })}
                        </div>
                        <div style={{ fontSize: 24, fontWeight: 700, fontFamily: "var(--font-serif)", lineHeight: 1 }}>
                          {new Date(ev.date).getDate()}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 600 }}>{ev.name}</div>
                        <div style={{ fontSize: 12, color: "var(--ink-3)" }}>{ev.type} · {ev.venue} · {ev.time}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        {mySeats.length > 0 ? (
                          <div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "var(--ink-3)", letterSpacing: "0.08em", textTransform: "uppercase" }}>Your seats</div>
                            <div style={{ fontFamily: "var(--font-mono)", fontSize: 18, fontWeight: 700, color: "var(--accent)" }}>{mySeats.join(" · ")}</div>
                          </div>
                        ) : (
                          <div className="badge">Not allocated yet</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="card">
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Your tier</h3>
              <div className="tier-swatch" style={{ background: tierColor(tier.id) }} />
              <div className="tier-code">{tier.code}</div>
              <div className="tier-name">{tier.name}</div>
              <div className="tier-rows">Rows {tier.rows.join(" · ")}</div>
              <div className="tier-fee">₹{tier.fee.toLocaleString("en-IN")}<small>/year</small></div>
              <div className="tier-rule"><b>{tier.ruleLabel}</b>{tier.desc}</div>
            </div>

            <div className="card" style={{ marginTop: 12 }}>
              <h3 style={{ margin: "0 0 14px", fontSize: 16, fontWeight: 600 }}>Contact us</h3>
              <div style={{ fontSize: 13, color: "var(--ink-3)", lineHeight: 1.6 }}>
                <div>sursanidhya@icesurat.in</div>
                <div>+91 261 245 8000</div>
                <hr className="hr-soft" />
                <div>Renewals for 2027–28 open 1 March 2027.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

Object.assign(window, { Signup, MemberDashboard });
