/* =========================================================
   landing.jsx — Public landing page
   ========================================================= */

function Landing({ go }) {
  return (
    <>
      <Hero go={go} />
      <AboutICE />
      <AboutSurSanidhya />
      <Tiers go={go} />
      <HowItWorks />
      <SeatingExplainer />
      <Contact />
    </>
  );
}

function Hero({ go }) {
  return (
    <section className="hero">
      <div className="container">
        <div className="hero-grid">
          <div>
            <div className="hero-eyebrow"><span className="dot" /> Cultural membership · 2026–27 season</div>
            <h1 className="hero-title">
              An auditorium-year for two,<br />
              <em>curated</em> by your community.
            </h1>
            <p className="hero-sub">
              <b>Sur Sanidhya</b> is the annual cultural membership of the
              Institute of Civil Engineers, Surat. One yearly contribution covers
              admission for a couple to every event of the season — natak, classical,
              comedy and more — with category-based seating in our home auditorium.
            </p>
            <div className="hero-cta">
              <button className="btn btn-accent btn-lg" onClick={() => go("signup")}>Become a member →</button>
              <button className="btn btn-ghost btn-lg" onClick={() => go("admin")}>I'm an organiser</button>
            </div>
            <div style={{ marginTop: 40, display: "flex", gap: 32, fontSize: 13, color: "var(--ink-3)" }}>
              <div><b style={{ color: "var(--ink)", fontSize: 22, fontWeight: 700, display: "block", marginBottom: 2 }}>5–6</b>events per season</div>
              <div><b style={{ color: "var(--ink)", fontSize: 22, fontWeight: 700, display: "block", marginBottom: 2 }}>8</b>seating categories</div>
              <div><b style={{ color: "var(--ink)", fontSize: 22, fontWeight: 700, display: "block", marginBottom: 2 }}>1,200+</b>auditorium seats</div>
            </div>
          </div>

          <div className="hero-art">
            <div className="ticket">
              <div className="ticket-head">
                <div>
                  <div className="label">Membership No.</div>
                  <div className="val">SS / 2026 / 0042</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div className="label">Season</div>
                  <div className="val">2026 – 27</div>
                </div>
              </div>
              <div className="ticket-title">
                <small>Sur Sanidhya</small>
                <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                  <div className="brand-mark lg" style={{ flexShrink: 0 }}><img src="assets/ice-logo.png" alt="ICE Surat" /></div>
                  <div>Couple Membership<br /> Free Flow</div>
                </div>
              </div>
              <div className="ticket-perf" />
              <div className="ticket-foot">
                <div>Holder<b>Patel Family</b></div>
                <div>Tier<b>Free Flow</b></div>
                <div>Rows<b>A · B · C</b></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutICE() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 80, alignItems: "flex-start" }}>
          <div>
            <div className="section-eyebrow">About the institute</div>
            <h2 className="section-title">A 60-year-old fraternity of engineers in Surat.</h2>
          </div>
          <div style={{ fontSize: 17, lineHeight: 1.6, color: "var(--ink-2)" }}>
            <p style={{ marginTop: 0 }}>
              The <b>Institute of Civil Engineers, Surat</b> is a member-led
              association of practising civil engineers, consultants and
              contractors across South Gujarat. Beyond technical practice, the
              institute has long sponsored cultural programming for its members
              and their families — a tradition that today continues under the
              banner of <em style={{ fontStyle: "normal", fontFamily: "var(--font-serif)", color: "var(--accent)" }}>Sur Sanidhya</em>.
            </p>
            <p>
              The institute is not a ticketing platform. Every event is staged
              for our own community — admission is by annual membership only,
              and seating is arranged by category, not by first-click.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutSurSanidhya() {
  return (
    <section className="section section-dark">
      <div className="container">
        <div className="section-eyebrow">The programme</div>
        <h2 className="section-title">
          <em>Sur Sanidhya</em><br />
          A season of natak, sangeet, and laughter — for one annual fee.
        </h2>
        <p className="section-lead">
          Five to six curated evenings per year at the Sanjeev Kumar Auditorium.
          One membership covers a couple, with seats allocated per event
          according to your category. No ticket queues, no seat-grab — just turn
          up on the evening, find your row, and settle in.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 1, background: "rgba(255,255,255,0.12)", marginTop: 56, border: "1px solid rgba(255,255,255,0.12)" }}>
          {[
            { k: "Natak", v: "Gujarati family dramas, tested troupes only." },
            { k: "Classical", v: "Hindustani vocal and instrumental evenings." },
            { k: "Comedy", v: "Stand-up sets curated for family audiences." },
            { k: "Mushaira", v: "Annual Urdu poetry recital with guest poets." },
          ].map(item => (
            <div key={item.k} style={{ background: "var(--ink)", padding: "28px 24px" }}>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 11, color: "rgba(255,255,255,0.5)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>Format</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: 24, marginBottom: 8 }}>{item.k}</div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.5 }}>{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Tiers({ go }) {
  return (
    <section className="section" id="tiers">
      <div className="container">
        <div className="section-eyebrow">Membership categories</div>
        <h2 className="section-title">Pick your <em>row</em>, pay once.</h2>
        <p className="section-lead">
          Eight categories. Higher tiers are closer to the stage, with stricter
          seating rules — Free Flow and M-25 are fixed-seat, mid-tiers rotate
          fairly across allowed rows each event, and M-15 is first-come-first-served
          by payment date.
        </p>

        <div className="tier-grid">
          {TIERS.map(t => (
            <div key={t.id} className="tier-card" onClick={() => go("signup", { tierId: t.id })}>
              <div className="tier-swatch" style={{ background: tierColor(t.id) }} />
              <div className="tier-code">{t.code}</div>
              <h3 className="tier-name">{t.name}</h3>
              <div className="tier-rows">Rows {t.rows.join(" · ")}</div>
              <div className="tier-fee">₹{t.fee.toLocaleString("en-IN")}<small>/year · couple</small></div>
              <div className="tier-rule">
                <b>{t.ruleLabel}</b>
                {t.desc}
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 32, padding: 18, background: "var(--paper)", border: "1px dashed var(--line)", borderRadius: 8, fontSize: 13, color: "var(--ink-3)" }}>
          <b style={{ color: "var(--ink)" }}>Each membership covers two seats.</b>
          {" "}Seats A7–A10, A23–A26 and C1–C5 are house-reserved and never allocated to members.
          {" "}Side-most 10% of seats in rotation rows are kept out of the rotation to ensure fair viewing.
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Fill the form", d: "Name, mobile, email, and address for the couple." },
    { n: "02", t: "Pick a tier", d: "Choose a category. Annual fee shows automatically." },
    { n: "03", t: "Pay online", d: "Mock payment for the demo; Razorpay slot ready in code." },
    { n: "04", t: "Get membership", d: "Active membership number issued for the 2026–27 season." },
    { n: "05", t: "Seats per event", d: "Organisers allocate seats event-by-event under tier rules." },
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="section-eyebrow">How it works</div>
        <h2 className="section-title">From form to your row, in five steps.</h2>
        <div className="steps">
          {steps.map(s => (
            <div className="step" key={s.n}>
              <div className="step-num">{s.n}</div>
              <h3 className="step-title">{s.t}</h3>
              <div className="step-desc">{s.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function SeatingExplainer() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-eyebrow">Event-wise seating</div>
        <h2 className="section-title">Same membership, fresh seats every event.</h2>
        <p className="section-lead">
          Membership and event seating are deliberately separated. Each event in
          the season runs its own allocation pass — fixed tiers keep their seat,
          rotating tiers shift through their allowed rows, and first-come-first
          fills row T onwards by payment date.
        </p>

        <div style={{ marginTop: 56, position: "relative" }}>
          <div className="seatmap-mobile-hint">
            <span>← swipe to see the full auditorium →</span>
          </div>
          <SeatMap density="tight" showLegend={true} />
        </div>

        <div style={{ marginTop: 32, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
          {[
            { t: "Fixed", d: "Free Flow and M-25 members keep the same seat across the entire season." },
            { t: "Rotation", d: "M-50, M-45, M-35 and M-30 rotate through their three allotted rows each event." },
            { t: "First-come", d: "M-15 row T onwards fills by payment timestamp — earlier payers, better seats." },
          ].map(b => (
            <div key={b.t} className="card">
              <div className="card-title">{b.t}</div>
              <div style={{ fontSize: 14, color: "var(--ink-2)", lineHeight: 1.5 }}>{b.d}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <section className="section">
      <div className="container">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80 }}>
          <div>
            <div className="section-eyebrow">Enquiry</div>
            <h2 className="section-title">Become a member, or ask a question.</h2>
            <p className="section-lead">
              Membership intake for the 2026–27 season is open. Existing members
              can simply renew with the same tier; new members can pick any
              category subject to availability.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 32, fontSize: 14 }}>
              <div><b style={{ display: "block", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Office</b>Institute of Civil Engineers, Surat · Athwa Lines, Surat 395001</div>
              <div><b style={{ display: "block", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Phone</b>+91 261 245 8000 (Tue–Sat, 11am – 6pm)</div>
              <div><b style={{ display: "block", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Email</b>sursanidhya@icesurat.in</div>
            </div>
          </div>
          <div className="card card-pad-lg">
            <h3 style={{ margin: "0 0 18px", fontSize: 20, fontWeight: 600 }}>Quick enquiry</h3>
            <div className="form-row">
              <div className="field"><label>Name</label><input placeholder="Your full name" /></div>
              <div className="field"><label>Mobile</label><input placeholder="10-digit number" /></div>
            </div>
            <div className="field" style={{ marginBottom: 16 }}><label>Email</label><input placeholder="you@example.in" /></div>
            <div className="field" style={{ marginBottom: 24 }}><label>Message</label><textarea rows="4" placeholder="Tell us what you'd like to know" /></div>
            <button className="btn btn-primary" style={{ width: "100%" }} onClick={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: "Thanks! We'll get back within 2 working days.", kind: "ok" } })); }}>Send enquiry</button>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <div className="brand" style={{ marginBottom: 18 }}>
              <div className="brand-mark on-dark"><img src="assets/ice-logo.png" alt="ICE Surat" /></div>
              <div className="brand-name">
                <div className="t1" style={{ color: "white" }}>Institute of Civil Engineers, Surat</div>
                <div className="t2">Sur Sanidhya · Cultural Membership</div>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, maxWidth: 360, lineHeight: 1.6 }}>
              A non-profit fraternity of civil engineers in South Gujarat,
              sponsoring an annual cultural season for its members since 1968.
            </p>
          </div>
          <div>
            <h5>Sur Sanidhya</h5>
            <a>Membership tiers</a>
            <a>This season's events</a>
            <a>Seating rules</a>
            <a>Renew membership</a>
          </div>
          <div>
            <h5>Institute</h5>
            <a>About ICE Surat</a>
            <a>Office bearers</a>
            <a>Past programmes</a>
            <a>Photo archive</a>
          </div>
          <div>
            <h5>Get in touch</h5>
            <a>sursanidhya@icesurat.in</a>
            <a>+91 261 245 8000</a>
            <a>Athwa Lines, Surat</a>
          </div>
        </div>
        <div className="footer-foot">
          <div>© 2026 Institute of Civil Engineers, Surat. All rights reserved.</div>
          <div>Prototype · committee preview</div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Landing, Footer });
