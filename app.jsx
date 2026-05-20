/* =========================================================
   app.jsx — Top-level router + toasts + tweaks
   ========================================================= */

const ROUTES = {
  landing: { label: "Home", show: true },
  signup: { label: "Become a member", show: true },
  member: { label: "Member portal", show: true },
  admin: { label: "Organiser console", show: true },
};

function parseRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "");
  if (!hash) return { route: "landing", params: {} };
  const [route, qs] = hash.split("?");
  const params = {};
  if (qs) {
    qs.split("&").forEach(p => {
      const [k, v] = p.split("=");
      if (k) params[k] = decodeURIComponent(v || "");
    });
  }
  return { route: ROUTES[route] ? route : "landing", params };
}

function App() {
  const [{ route, params }, setRoute] = useState(parseRoute());
  const [tweaks, setTweak] = useTweaks(/*EDITMODE-BEGIN*/{
    "accent": "#0b4ea2",
    "accentSecondary": "#c45a2e",
    "fontSans": "Plus Jakarta Sans",
    "density": "default",
    "showInkAccent": true
  }/*EDITMODE-END*/);
  const [toasts, setToasts] = useState([]);

  // Hash-based nav
  useEffect(() => {
    function onHash() { setRoute(parseRoute()); window.scrollTo(0, 0); }
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Global nav helper
  useEffect(() => {
    window.__nav = (r, p = {}) => {
      const qs = Object.entries(p).map(([k, v]) => `${k}=${encodeURIComponent(v)}`).join("&");
      window.location.hash = `#/${r}${qs ? `?${qs}` : ""}`;
    };
  }, []);

  // Toasts
  useEffect(() => {
    function onToast(e) {
      const t = { id: Math.random().toString(36).slice(2), ...e.detail };
      setToasts(ts => [...ts, t]);
      setTimeout(() => setToasts(ts => ts.filter(x => x.id !== t.id)), 3500);
    }
    window.addEventListener("ice-toast", onToast);
    return () => window.removeEventListener("ice-toast", onToast);
  }, []);

  // Apply tweaks via CSS vars
  useEffect(() => {
    const r = document.documentElement.style;
    r.setProperty("--accent", tweaks.accent);
    r.setProperty("--accent-2", tweaks.accentSecondary);
    r.setProperty("--font-sans", `"${tweaks.fontSans}", system-ui, sans-serif`);
  }, [tweaks]);

  const go = (r, p) => window.__nav(r, p);

  return (
    <div className="app">
      <TopNav route={route} go={go} />
      <main style={{ flex: 1 }}>
        {route === "landing" && <Landing go={go} />}
        {route === "signup" && <Signup go={go} params={params} />}
        {route === "member" && <MemberDashboard go={go} params={params} />}
        {route === "admin" && <Admin go={go} params={params} />}
      </main>
      <Footer />

      <ToastStack toasts={toasts} />

      <TweaksPanel>
        <TweakSection label="Brand">
          <TweakColor
            label="Primary accent"
            value={tweaks.accent}
            onChange={v => setTweak("accent", v)}
            options={["#0b4ea2", "#1f5e3c", "#7c3aed", "#0f172a", "#a8362a"]}
          />
          <TweakColor
            label="Secondary accent"
            value={tweaks.accentSecondary}
            onChange={v => setTweak("accentSecondary", v)}
            options={["#c45a2e", "#b08542", "#0b4ea2", "#a8362a", "#2e7d4f"]}
          />
        </TweakSection>
        <TweakSection label="Typography">
          <TweakSelect
            label="Sans font"
            value={tweaks.fontSans}
            onChange={v => setTweak("fontSans", v)}
            options={[
              { value: "Plus Jakarta Sans", label: "Plus Jakarta Sans" },
              { value: "DM Sans", label: "DM Sans" },
              { value: "Manrope", label: "Manrope" },
              { value: "Outfit", label: "Outfit" },
              { value: "Work Sans", label: "Work Sans" },
            ]}
          />
        </TweakSection>
        <TweakSection label="Data">
          <TweakButton onClick={() => {
            if (!confirm("Reset all demo data? This re-seeds members and clears allocations.")) return;
            resetStore();
            window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: "Demo data reset.", kind: "ok" } }));
          }}>Reset demo data</TweakButton>
          <TweakButton onClick={() => {
            // Allocate all events
            const evs = listEvents();
            evs.forEach(e => allocateSeatsForEvent(e.id));
            window.dispatchEvent(new CustomEvent("ice-toast", { detail: { text: `Allocated ${evs.length} events.`, kind: "ok" } }));
          }}>Allocate all events</TweakButton>
        </TweakSection>
      </TweaksPanel>
    </div>
  );
}

function TopNav({ route, go }) {
  const [open, setOpen] = useState(false);
  // Close mobile menu on route change
  useEffect(() => { setOpen(false); }, [route]);
  return (
    <header className={"topnav" + (open ? " nav-mobile-open" : "")}>
      <div className="container-wide topnav-inner">
        <div className="brand" onClick={() => go("landing")}>
          <div className="brand-mark"><img src="assets/ice-logo.png" alt="ICE Surat" /></div>
          <div className="brand-name">
            <div className="t1">ICE Surat · <em style={{ fontStyle: "normal", fontFamily: "var(--font-serif)", fontWeight: 500, color: "var(--accent)" }}>Sur Sanidhya</em></div>
            <div className="t2">Institute of Civil Engineers · 2026–27</div>
          </div>
        </div>
        <nav className="nav-links">
          <a className={"nav-link" + (route === "landing" ? " active" : "")} onClick={() => go("landing")}>Home</a>
          <a className={"nav-link" + (route === "signup" ? " active" : "")} onClick={() => go("signup")}>Become a member</a>
          <a className={"nav-link" + (route === "member" ? " active" : "")} onClick={() => go("member")}>My membership</a>
          <a className={"nav-link" + (route === "admin" ? " active" : "")} onClick={() => go("admin")}>Organiser</a>
        </nav>
        <button className="nav-toggle" aria-label="Menu" onClick={() => setOpen(o => !o)}>
          {open ? (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M6 6 18 18 M18 6 6 18" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round"><path d="M4 7h16 M4 12h16 M4 17h16" /></svg>
          )}
        </button>
      </div>
    </header>
  );
}

function ToastStack({ toasts }) {
  return (
    <div className="toast-stack">
      {toasts.map(t => <div key={t.id} className={"toast " + (t.kind || "")}>{t.text}</div>)}
    </div>
  );
}

// Mount
ReactDOM.createRoot(document.getElementById("root")).render(<App />);
