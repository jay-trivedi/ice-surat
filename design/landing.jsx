/* =========================================================
   landing.jsx — Public landing page
   ========================================================= */

const { useRef } = React;

function Landing({ go }) {
  return (
    <>
      <Intro go={go} />
      <Program />
      <EventGallery />
      <OfficeBearers />
      <Contact />
    </>
  );
}

function Intro({ go }) {
  return (
    <section className="intro">
      <div className="container">
        <div className="intro-mark">
          <div className="brand-mark xl"><img src={(window.__resources && window.__resources.iceLogo) || "assets/ice-logo.png"} alt="ICE Surat" /></div>
        </div>

        <div className="intro-meta">
          <span>Institute of Civil Engineers, Surat</span>
          <span className="dot" />
          <span>Established 2004</span>
          <span className="dot" />
          <span>Athwa Lines, Surat</span>
        </div>

        <h1 className="intro-title">
          A twenty-year-old fraternity of civil engineers in South Gujarat —
          and a cultural <em>season</em> for its families.
        </h1>

        <p className="intro-lead">
          ICE Surat is a member-led association of practising civil engineers,
          consultants and contractors across South Gujarat. Beyond technical
          practice, the institute is now launching its first annual cultural
          season for members — five to six curated evenings of theatre, music,
          and comedy — under the banner of <em>Sur Sanidhya</em>.
        </p>

        <div className="intro-cta">
          <button className="btn btn-accent btn-lg" onClick={() => go("signup")}>Become a member →</button>
          <button className="btn btn-ghost btn-lg" onClick={() => go("admin")}>I'm an organiser</button>
        </div>

        <div className="intro-stats">
          <div className="intro-stat">
            <div className="intro-stat-v">5–6</div>
            <div className="intro-stat-l">events per season</div>
          </div>
          <div className="intro-stat">
            <div className="intro-stat-v">8</div>
            <div className="intro-stat-l">membership categories</div>
          </div>
          <div className="intro-stat">
            <div className="intro-stat-v">1,200+</div>
            <div className="intro-stat-l">auditorium seats</div>
          </div>
          <div className="intro-stat">
            <div className="intro-stat-v">2026 – 27</div>
            <div className="intro-stat-l">current season</div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Program() {
  return (
    <section className="section section-dark">
      <div className="container">
        <div className="section-eyebrow">The programme</div>
        <h2 className="section-title">
          <em>Sur Sanidhya</em><br />
          A season of natak, sangeet, and laughter — for one annual fee.
        </h2>
        <p className="section-lead">
          One yearly contribution covers admission for a couple to every event of
          the season — natak, classical, comedy, mushaira and more — at Sanjeev
          Kumar Auditorium.
        </p>

        <div className="program-grid">
          {[
            { k: "Natak",     v: "Gujarati family dramas — tested troupes only.",       icon: "🎭" },
            { k: "Classical", v: "Hindustani vocal and instrumental evenings.",         icon: "🪕" },
            { k: "Comedy",    v: "Stand-up sets curated for family audiences.",         icon: "🎤" },
            { k: "Mushaira",  v: "The annual Urdu poetry recital with guest poets.",    icon: "📜" },
          ].map(item => (
            <div className="program-card" key={item.k}>
              <div className="program-icon">{item.icon}</div>
              <div className="program-name">{item.k}</div>
              <div className="program-desc">{item.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Hero({ go }) {
  return null;
}

function AboutICE() {
  return null;
}

function AboutSurSanidhya() {
  return null;
}

function Tiers({ go }) {
  return null;
}

function HowItWorks() {
  return null;
}

function SeatingExplainer() {
  return null;
}

// Past event gallery — placeholders the institute will swap with real photos
const GALLERY = [
  { title: "Surangini · Classical Evening", caption: "Pandit Anil Kulkarni, Tabla: Ustad Akram Khan", date: "Sep 2024", tone: "warm", icon: "🎻" },
  { title: "Hasya Ratri 2024", caption: "An evening of Gujarati stand-up at Sanjeev Kumar Auditorium", date: "Jul 2024", tone: "ink", icon: "🎤" },
  { title: "Maa Re Maa", caption: "Gujarati family drama, sold-out evening", date: "Apr 2024", tone: "cream", icon: "🎭" },
  { title: "Sufi Saanjh", caption: "Sufi ensemble with guest qawwals from Ajmer", date: "Feb 2024", tone: "warm", icon: "🪕" },
  { title: "Annual Mushaira", caption: "Curated Urdu poetry recital", date: "Jan 2024", tone: "ink", icon: "📜" },
  { title: "Sangeet Sandhya", caption: "Members' own talent night, hosted by the cultural sub-committee", date: "Nov 2023", tone: "cream", icon: "🎶" },
];

function OfficeBearers() {
  const bearers = [
    { name: "Shri Bhavin Patel",    role: "President",                 tone: 0, note: "ICE Surat 2026–27" },
    { name: "Shri Hiren Desai",     role: "Vice President",            tone: 1 },
    { name: "Shri Mehul Shah",      role: "Hon. Secretary",            tone: 2 },
    { name: "Shri Jignesh Mehta",   role: "Hon. Treasurer",            tone: 3 },
    { name: "Shri Kalpesh Trivedi", role: "Cultural Committee Chair",  tone: 4, note: "Sur Sanidhya convener" },
    { name: "Shri Nilesh Vyas",     role: "Joint Secretary",           tone: 5 },
  ];
  return (
    <section className="section">
      <div className="container">
        <div className="section-eyebrow">Committee</div>
        <h2 className="section-title">Office bearers, 2026–27.</h2>

        <div className="bearer-grid">
          {bearers.map((b, i) => (
            <div className="bearer-card" key={i}>
              <div className={"bearer-photo tone-" + b.tone} aria-hidden="true">
                <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="32" cy="24" r="11" fill="currentColor" opacity="0.85" />
                  <path d="M10 60 C 12 44, 22 38, 32 38 C 42 38, 52 44, 54 60 Z" fill="currentColor" opacity="0.85" />
                </svg>
                <div className="bearer-photo-tag">PHOTO</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div className="bearer-role">{b.role}</div>
                <div className="bearer-name">{b.name}</div>
                {b.note && <div className="bearer-note">{b.note}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventGallery() {
  const [index, setIndex] = useState(0);
  const trackRef = useRef(null);
  const total = GALLERY.length;
  const mounted = useRef(false);

  function step(d) { setIndex(i => (i + d + total) % total); }

  useEffect(() => {
    // skip initial mount so the page doesn't auto-scroll into the gallery
    if (!mounted.current) { mounted.current = true; return; }
    if (!trackRef.current) return;
    const cards = trackRef.current.querySelectorAll(".gallery-card");
    const target = cards[index];
    if (!target) return;
    // scroll only horizontally inside the track, not the page
    const track = trackRef.current;
    const trackRect = track.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const delta = (targetRect.left + targetRect.width / 2) - (trackRect.left + trackRect.width / 2);
    track.scrollBy({ left: delta, behavior: "smooth" });
  }, [index]);

  return (
    <section className="section gallery-section">
      <div className="container">
        <div style={{ marginBottom: 32 }}>
          <div className="section-eyebrow">From previous seasons</div>
          <h2 className="section-title" style={{ marginBottom: 0 }}>An evening, a year, a tradition.</h2>
        </div>
      </div>

      <div className="gallery-track-wrap">
        <div className="gallery-track" ref={trackRef}>
          {GALLERY.map((g, i) => (
            <div key={i} className={"gallery-card tone-" + g.tone} onClick={() => setIndex(i)}>
              <div className="gallery-art">
                <div className="gallery-icon">{g.icon}</div>
                <div className="gallery-frame-tag">PHOTO · {g.date}</div>
              </div>
              <div className="gallery-meta">
                <div className="gallery-card-title">{g.title}</div>
                <div className="gallery-card-cap">{g.caption}</div>
              </div>
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
        <div className="section-eyebrow">Enquiry</div>
        <h2 className="section-title">Become a member, or ask a question.</h2>
        <p className="section-lead">
          Membership intake for the 2026–27 season is open. Existing members
          can simply renew with the same tier; new members can pick any
          category subject to availability.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24, marginTop: 40 }}>
          <div>
            <div style={{ display: "block", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 600 }}>Office</div>
            <div style={{ fontSize: 15 }}>Institute of Civil Engineers, Surat<br />Athwa Lines, Surat 395001</div>
          </div>
          <div>
            <div style={{ display: "block", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 600 }}>Phone</div>
            <div style={{ fontSize: 15 }}>+91 261 245 8000<br /><span style={{ color: "var(--ink-3)", fontSize: 13 }}>Tue–Sat, 11am – 6pm</span></div>
          </div>
          <div>
            <div style={{ display: "block", color: "var(--ink-3)", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6, fontWeight: 600 }}>Email</div>
            <div style={{ fontSize: 15 }}>sursanidhya@icesurat.in</div>
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
              <div className="brand-mark on-dark"><img src={(window.__resources && window.__resources.iceLogo) || "assets/ice-logo.png"} alt="ICE Surat" /></div>
              <div className="brand-name">
                <div className="t1" style={{ color: "white" }}>Institute of Civil Engineers, Surat</div>
                <div className="t2">Sur Sanidhya · Cultural Membership</div>
              </div>
            </div>
            <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, maxWidth: 360, lineHeight: 1.6 }}>
              A non-profit fraternity of civil engineers in South Gujarat,
              launching its first annual cultural season for members in 2026–27.
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
          <div>Made with <span aria-label="love" role="img">❤</span> by Janak Trivedi and Associates</div>
        </div>
      </div>
    </footer>
  );
}

Object.assign(window, { Landing, Footer });
