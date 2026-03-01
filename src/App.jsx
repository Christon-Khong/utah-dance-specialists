import { useState, useMemo, useEffect } from "react";
import specialistsData from "./specialists.json";

const HERO_IMAGE = "/hero.jpg";
const specialists = specialistsData;
const allCertifications = [...new Set(specialists.flatMap((s) => s.certifications))].sort();
const allInsurances = [...new Set(specialists.flatMap((s) => s.insurances))].sort();

// ─── FONT LOADER ────────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);
}

// ─── SHARED NAV ─────────────────────────────────────────────────────────────
function Nav({ current, onNav }) {
  const links = ["directory", "about", "providers", "contact"];
  const labels = { directory: "Directory", about: "About", providers: "For Providers", contact: "Contact" };
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(16,8,24,0.96)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 }}>
        <button onClick={() => onNav("directory")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500, fontFamily: "'Inter',sans-serif" }}>
          utahdancespecialists.com
        </button>
        <div style={{ display: "flex", gap: 32 }}>
          {links.map((page) => (
            <button key={page} onClick={() => onNav(page)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, letterSpacing: "0.08em", fontFamily: "'Inter',sans-serif", fontWeight: current === page ? 600 : 400, color: current === page ? "#fff" : "rgba(255,255,255,0.6)", borderBottom: current === page ? "1px solid #9d4e6e" : "1px solid transparent", paddingBottom: 2, transition: "color 0.2s" }}>
              {labels[page]}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── SHARED FOOTER ───────────────────────────────────────────────────────────
function Footer({ onNav }) {
  return (
    <footer style={{ background: "#100818", borderTop: "1px solid #2a1535", padding: "40px 48px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div>
          <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 20, color: "#fff", fontWeight: 300, letterSpacing: "0.02em" }}>Utah Dance Medicine Specialists</div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>utahdancespecialists.com</div>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {[["directory","Directory"],["about","About"],["providers","For Providers"],["contact","Contact"]].map(([page, label]) => (
            <button key={page} onClick={() => onNav(page)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>{label}</button>
          ))}
        </div>
      </div>
      <div style={{ maxWidth: 1100, margin: "12px auto 0", paddingLeft: 0 }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0 }}>Providers are responsible for keeping their profiles current. Listing does not constitute endorsement.</p>
      </div>
    </footer>
  );
}

// ─── DROPDOWN ────────────────────────────────────────────────────────────────
function Dropdown({ label, icon, options, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const active = selected.length > 0;
  return (
    <div style={{ position: "relative" }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "11px 18px",
          borderRadius: 50,
          background: active ? "#2c1a3a" : "#fff",
          border: active ? "1.5px solid #2c1a3a" : "1.5px solid #ddd",
          fontSize: 13,
          fontWeight: 500,
          color: active ? "#fff" : "#444",
          cursor: "pointer",
          letterSpacing: "0.02em",
          boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
          fontFamily: "'Inter',sans-serif",
        }}
      >
        <span>{icon}</span>
        {selected.length === 0 ? label : label + " · " + selected.length}
        <span style={{ fontSize: 9, opacity: 0.6 }}>{open ? "▲" : "▼"}</span>
      </button>
      {open && (
        <>
          <div onClick={() => setOpen(false)} style={{ position: "fixed", inset: 0, zIndex: 10 }} />
          <div style={{ position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 20, background: "#fff", borderRadius: 16, boxShadow: "0 12px 40px rgba(0,0,0,0.14)", border: "1px solid #f0f0f0", width: 260, maxHeight: 260, overflowY: "auto", padding: "8px 0" }}>
            {options.map((opt) => (
              <label key={opt} style={{ display: "flex", alignItems: "center", gap: 12, padding: "9px 18px", cursor: "pointer", fontSize: 13, color: "#333", background: selected.includes(opt) ? "#f9f4fc" : "transparent", fontFamily: "'Inter',sans-serif" }}>
                <input
                  type="checkbox"
                  checked={selected.includes(opt)}
                  onChange={() => onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt])}
                  style={{ accentColor: "#9d4e6e", width: 15, height: 15 }}
                />
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SPECIALIST CARD ─────────────────────────────────────────────────────────
function SpecialistCard({ s }) {
  const [open, setOpen] = useState(false);
  const isEmail = s.contactInfo.includes("@");
  return (
    <div
      style={{ background: "#fff", borderRadius: 20, border: "1px solid " + s.borderColor, boxShadow: "0 4px 24px rgba(0,0,0,0.06)", overflow: "hidden", display: "flex", flexDirection: "column", transition: "box-shadow 0.25s, transform 0.25s", fontFamily: "'Inter',sans-serif" }}
      onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 8px 40px rgba(0,0,0,0.12)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
      onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 4px 24px rgba(0,0,0,0.06)"; e.currentTarget.style.transform = "translateY(0)"; }}
    >
      <div style={{ height: 4, background: "linear-gradient(90deg, " + s.color + ", " + s.color + "99)" }} />
      <div style={{ background: s.bgLight, padding: "22px 24px 18px" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
          <div style={{ width: 54, height: 54, borderRadius: "50%", background: "linear-gradient(145deg, " + s.color + ", " + s.color + "bb)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 600, fontSize: 17, flexShrink: 0, boxShadow: "0 4px 14px " + s.color + "55", letterSpacing: "0.05em" }}>
            {s.initials}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 16, color: "#1a1a1a", lineHeight: 1.3 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: "#999", marginTop: 3, fontWeight: 500, letterSpacing: "0.04em", textTransform: "uppercase" }}>{s.degrees}</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 10 }}>
              {s.acceptingPatients
                ? <span style={{ fontSize: 11, fontWeight: 600, color: "#1a7a45", background: "#e6f8ee", border: "1px solid #a8e6c0", borderRadius: 99, padding: "3px 11px" }}>Accepting Patients</span>
                : <span style={{ fontSize: 11, fontWeight: 600, color: "#a02020", background: "#fdeaea", border: "1px solid #f5b0b0", borderRadius: 99, padding: "3px 11px" }}>Waitlist Only</span>}
              {s.onsiteAvailable && (
                <span style={{ fontSize: 11, fontWeight: 600, color: "#3a3580", background: "#eeedf8", border: "1px solid #c0bce8", borderRadius: 99, padding: "3px 11px" }}>Onsite / Backstage</span>
              )}
            </div>
          </div>
        </div>
      </div>
      <div style={{ padding: "18px 24px 20px", display: "flex", flexDirection: "column", gap: 12, flex: 1 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {s.certifications.map((c) => (
            <span key={c} style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.04em", background: s.badgeBg, color: s.badgeText, borderRadius: 99, padding: "4px 12px" }}>{c}</span>
          ))}
        </div>
        <div style={{ width: "100%", height: 1, background: "#f4f4f4" }} />
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0 }}>📍</span>
          <span>{s.locations.join(" · ")}</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0 }}>{isEmail ? "✉️" : "📞"}</span>
          <span>{s.contactInfo} · {s.contactMethod}</span>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0 }}>🛡️</span>
          <span>{s.insurances.join(", ")}</span>
        </div>
        <div style={{ marginTop: 4 }}>
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 600, color: s.color, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter',sans-serif" }}
          >
            <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
            {open ? "Hide Bio" : "Read Bio"}
          </button>
          {open && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + s.borderColor }}>
              <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{s.bio}</p>
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 12, fontWeight: 600, color: s.color, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  🌐 utahdancespecialists.com →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: DIRECTORY ─────────────────────────────────────────────────────────
function DirectoryPage({ onNav }) {
  const [query, setQuery] = useState("");
  const [certs, setCerts] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [onsiteOnly, setOnsiteOnly] = useState(false);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const hasFilters = query || certs.length > 0 || insurance.length > 0 || onsiteOnly || acceptingOnly;

  const filtered = useMemo(() =>
    specialists.filter((s) => {
      const q = query.toLowerCase();
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.certifications.some((c) => c.toLowerCase().includes(q)) || s.locations.some((l) => l.toLowerCase().includes(q));
      const matchC = certs.length === 0 || certs.some((c) => s.certifications.includes(c));
      const matchI = insurance.length === 0 || insurance.some((i) => s.insurances.includes(i));
      return matchQ && matchC && matchI && (!onsiteOnly || s.onsiteAvailable) && (!acceptingOnly || s.acceptingPatients);
    }),
    [query, certs, insurance, onsiteOnly, acceptingOnly]
  );

  const clearAll = () => { setQuery(""); setCerts([]); setInsurance([]); setOnsiteOnly(false); setAcceptingOnly(false); };

  const toggleStyle = (active, activeColor) => ({
    padding: "11px 18px",
    borderRadius: 50,
    fontSize: 13,
    fontWeight: 500,
    cursor: "pointer",
    fontFamily: "'Inter',sans-serif",
    letterSpacing: "0.02em",
    border: active ? "1.5px solid " + activeColor : "1.5px solid #ddd",
    background: active ? activeColor : "#fff",
    color: active ? "#fff" : "#444",
    boxShadow: "0 1px 6px rgba(0,0,0,0.07)",
  });

  return (
    <div>
      {/* Hero */}
      <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
        <img src={HERO_IMAGE} alt="Ballet dancers in a Utah studio" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(15,8,25,0.45) 0%, rgba(15,8,25,0.65) 55%, rgba(15,8,25,0.90) 100%)" }} />
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "0 48px 52px" }}>
          <div style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(255,255,255,0.55)", fontWeight: 500, marginBottom: 14 }}>Utah's Premier Resource</div>
          <h1 style={{ margin: "0 0 16px", fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 56, fontWeight: 300, color: "#fff", lineHeight: 1.1, letterSpacing: "-0.5px" }}>
            Dance Medicine<br />
            <em>Specialists</em>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.62)", fontSize: 16, maxWidth: 520, lineHeight: 1.7, margin: 0, fontWeight: 300 }}>
            Connecting Utah dancers with practitioners who understand the demands, artistry, and precision of movement.
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ece8e4", boxShadow: "0 4px 30px rgba(0,0,0,0.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 32px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 12 }}>
          <div style={{ position: "relative", flex: "1 1 280px", minWidth: 240 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#aaa" }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, specialty, or location..."
              style={{ width: "100%", padding: "12px 40px 12px 44px", borderRadius: 50, fontSize: 14, fontFamily: "'Inter',sans-serif", border: "1.5px solid #e0dbd6", outline: "none", background: "#faf9f8", color: "#222", boxSizing: "border-box" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#bbb" }}>×</button>
            )}
          </div>
          <Dropdown label="Certification" icon="⭐" options={allCertifications} selected={certs} onChange={setCerts} />
          <Dropdown label="Insurance" icon="🛡️" options={allInsurances} selected={insurance} onChange={setInsurance} />
          <button onClick={() => setOnsiteOnly((o) => !o)} style={toggleStyle(onsiteOnly, "#3a3580")}>★ Onsite Available</button>
          <button onClick={() => setAcceptingOnly((a) => !a)} style={toggleStyle(acceptingOnly, "#1a7a45")}>✓ Accepting Patients</button>
          {hasFilters && (
            <button onClick={clearAll} style={{ padding: "11px 18px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", border: "1.5px solid #f0c0c0", background: "#fff4f4", color: "#b03030" }}>× Clear</button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 30, fontWeight: 400, color: "#1a1a1a" }}>Specialist Directory</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#aaa" }}>{filtered.length} specialist{filtered.length !== 1 ? "s" : ""} found in Utah</p>
          </div>
          <button onClick={() => onNav("providers")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#9d4e6e", fontFamily: "'Inter',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            List Your Practice →
          </button>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🩰</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#888", fontStyle: "italic" }}>No specialists found</div>
            <button onClick={clearAll} style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#9d4e6e", fontFamily: "'Inter',sans-serif" }}>Clear filters</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))", gap: 22 }}>
            {filtered.map((s) => <SpecialistCard key={s.id} s={s} />)}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: ABOUT ─────────────────────────────────────────────────────────────
function AboutPage({ onNav }) {
  const stats = [
    { number: "6+", label: "Verified Specialists" },
    { number: "5", label: "Cities Covered" },
    { number: "10+", label: "Insurances Accepted" },
    { number: "Statewide", label: "Utah Coverage" },
  ];
  const pillars = [
    { icon: "🩰", title: "Built for Dancers", desc: "Designed around how dancers actually seek care — by certification, location, insurance, and whether a provider understands the specific demands of their art form." },
    { icon: "✅", title: "Verified Specialists", desc: "Every provider is reviewed for dance-relevant training and experience before being listed. This is a curated directory, not an open registry." },
    { icon: "📍", title: "Utah-Focused", desc: "Serving dancers from St. George to Logan, with an emphasis on underserved areas outside of Salt Lake City where access to specialized care has historically been limited." },
  ];
  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #fdf2f6 0%, #f4f2fb 100%)", padding: "80px 32px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9d4e6e", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>Our Mission</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 52, fontWeight: 300, color: "#1a1a1a", margin: "0 0 20px", lineHeight: 1.2 }}>Where Dance<br /><em>Meets Medicine</em></h1>
        <p style={{ fontSize: 17, color: "#666", maxWidth: 560, margin: "0 auto", lineHeight: 1.8, fontWeight: 300, fontFamily: "'Inter',sans-serif" }}>
          Utah's dedicated resource connecting dancers with practitioners who truly understand the demands of the art.
        </p>
      </div>

      {/* Mission Pillars */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {pillars.map((p) => (
            <div key={p.title} style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", border: "1px solid #ede8e4" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{p.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 400, color: "#1a1a1a", margin: "0 0 12px" }}>{p.title}</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.75, margin: 0, fontFamily: "'Inter',sans-serif" }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div style={{ background: "#100818", padding: "60px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 24, textAlign: "center" }}>
          {stats.map((stat) => (
            <div key={stat.label}>
              <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 48, fontWeight: 300, color: "#fff", lineHeight: 1 }}>{stat.number}</div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 8, letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Our Story */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 32px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 300, color: "#1a1a1a", marginBottom: 32 }}>Our Story</h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.9, marginBottom: 20, fontFamily: "'Inter',sans-serif" }}>
          Dancers in Utah have long faced a frustrating challenge: finding healthcare providers who understand that a sprained ankle isn't just a sprained ankle when you're performing in two weeks, or that "rest" isn't a complete treatment plan for someone whose livelihood depends on movement.
        </p>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.9, marginBottom: 20, fontFamily: "'Inter',sans-serif" }}>
          Utah Dance Medicine Specialists was created to close that gap — to build a centralized, trusted resource that dancers, companies, and studios can rely on to find practitioners who have specifically sought out training and experience in the unique physiology and demands of dance.
        </p>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>
          Every provider in our directory has been reviewed for dance-relevant credentials. We prioritize transparency: you can see exactly what each provider specializes in, which insurances they accept, whether they're currently taking new patients, and whether they offer onsite coverage for performances and intensives.
        </p>
        <div style={{ marginTop: 48, display: "flex", gap: 16 }}>
          <button onClick={() => onNav("directory")} style={{ padding: "14px 28px", borderRadius: 50, background: "#9d4e6e", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            Find a Specialist
          </button>
          <button onClick={() => onNav("providers")} style={{ padding: "14px 28px", borderRadius: 50, background: "none", border: "1.5px solid #9d4e6e", color: "#9d4e6e", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            List Your Practice
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: FOR PROVIDERS ──────────────────────────────────────────────────────
function ProvidersPage() {
  const [form, setForm] = useState({ name: "", credentials: "", practice: "", phone: "", email: "", locations: "", certifications: [], insurances: "", accepting: "", onsite: "", bio: "", website: "" });
  const [submitted, setSubmitted] = useState(false);

  const certOptions = ["Dance Medicine", "Dry Needling", "Pilates", "Pelvic Health", "Schroth", "Sports Medicine", "Osteopathic Manipulation", "Injury Prevention", "Strength & Conditioning"];

  const toggleCert = (cert) => {
    setForm((f) => ({
      ...f,
      certifications: f.certifications.includes(cert) ? f.certifications.filter((c) => c !== cert) : [...f.certifications, cert],
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const benefits = [
    { icon: "👥", title: "Reach Dancers Directly", desc: "Be found by Utah dancers actively searching for specialists who understand their needs — filtered by certification, location, and insurance." },
    { icon: "✅", title: "Build Your Reputation", desc: "A listing on Utah Dance Medicine Specialists signals to the dance community that you have sought out training relevant to their care." },
    { icon: "📊", title: "Stay in Control", desc: "Update your availability, accepting status, and profile details at any time. Your profile reflects your practice as it actually is." },
  ];

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0dbd6", fontSize: 14, fontFamily: "'Inter',sans-serif", color: "#222", background: "#faf9f8", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" };

  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #f4f2fb 0%, #fdf2f6 100%)", padding: "80px 32px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4a8a", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>For Healthcare Providers</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 52, fontWeight: 300, color: "#1a1a1a", margin: "0 0 20px", lineHeight: 1.2 }}>Join the<br /><em>Directory</em></h1>
        <p style={{ fontSize: 17, color: "#666", maxWidth: 520, margin: "0 auto", lineHeight: 1.8, fontWeight: 300, fontFamily: "'Inter',sans-serif" }}>
          Connect with Utah's dance community and make it easy for dancers to find you.
        </p>
      </div>

      {/* Benefits */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px 40px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 24 }}>
          {benefits.map((b) => (
            <div key={b.title} style={{ background: "#fff", borderRadius: 20, padding: "32px 28px", boxShadow: "0 4px 24px rgba(0,0,0,0.05)", border: "1px solid #ede8e4" }}>
              <div style={{ fontSize: 36, marginBottom: 16 }}>{b.icon}</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 400, color: "#1a1a1a", margin: "0 0 10px" }}>{b.title}</h3>
              <p style={{ fontSize: 14, color: "#666", lineHeight: 1.75, margin: 0, fontFamily: "'Inter',sans-serif" }}>{b.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Application Form */}
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 32px 80px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 300, color: "#1a1a1a", marginBottom: 8 }}>Apply to be Listed</h2>
        <p style={{ fontSize: 14, color: "#999", marginBottom: 40, fontFamily: "'Inter',sans-serif" }}>Applications are reviewed within 5–7 business days. We'll contact you at the email provided.</p>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 20, border: "1px solid #a8e6c0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 400, color: "#1a1a1a", marginBottom: 12 }}>Application Received</h3>
            <p style={{ fontSize: 14, color: "#666", fontFamily: "'Inter',sans-serif", lineHeight: 1.7 }}>Thank you for applying. We'll review your credentials and be in touch within 5–7 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Full Name *</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Dr. Jane Smith" />
              </div>
              <div>
                <label style={labelStyle}>Credentials / Degrees *</label>
                <input required value={form.credentials} onChange={(e) => setForm((f) => ({ ...f, credentials: e.target.value }))} style={inputStyle} placeholder="PT, DPT, OCS" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Practice Name</label>
              <input value={form.practice} onChange={(e) => setForm((f) => ({ ...f, practice: e.target.value }))} style={inputStyle} placeholder="Your clinic or practice name" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Phone *</label>
                <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="(801) 555-0100" />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="you@example.com" />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Location(s) in Utah *</label>
              <input required value={form.locations} onChange={(e) => setForm((f) => ({ ...f, locations: e.target.value }))} style={inputStyle} placeholder="e.g. Salt Lake City, Park City" />
            </div>
            <div>
              <label style={labelStyle}>Certifications</label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {certOptions.map((cert) => (
                  <label key={cert} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 99, border: "1.5px solid " + (form.certifications.includes(cert) ? "#9d4e6e" : "#ddd"), background: form.certifications.includes(cert) ? "#fce8f1" : "#fff", cursor: "pointer", fontSize: 13, color: form.certifications.includes(cert) ? "#7a2d4f" : "#555", fontFamily: "'Inter',sans-serif" }}>
                    <input type="checkbox" checked={form.certifications.includes(cert)} onChange={() => toggleCert(cert)} style={{ display: "none" }} />
                    {cert}
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label style={labelStyle}>Insurances Accepted</label>
              <input value={form.insurances} onChange={(e) => setForm((f) => ({ ...f, insurances: e.target.value }))} style={inputStyle} placeholder="e.g. SelectHealth, Blue Cross, Aetna" />
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Accepting New Patients?</label>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {["Yes","No"].map((opt) => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                      <input type="radio" name="accepting" value={opt} checked={form.accepting === opt} onChange={() => setForm((f) => ({ ...f, accepting: opt }))} style={{ accentColor: "#9d4e6e" }} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Onsite / Backstage Available?</label>
                <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                  {["Yes","No"].map((opt) => (
                    <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 14, cursor: "pointer", fontFamily: "'Inter',sans-serif" }}>
                      <input type="radio" name="onsite" value={opt} checked={form.onsite === opt} onChange={() => setForm((f) => ({ ...f, onsite: opt }))} style={{ accentColor: "#9d4e6e" }} />
                      {opt}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Bio *</label>
              <textarea required value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} style={{ ...inputStyle, minHeight: 120, resize: "vertical" }} placeholder="Tell dancers about your background, what makes your practice a good fit for them, and your experience with dance-related injuries..." />
            </div>
            <div>
              <label style={labelStyle}>Website URL</label>
              <input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} style={inputStyle} placeholder="https://yourpractice.com" />
            </div>
            <button type="submit" style={{ padding: "16px 32px", borderRadius: 50, background: "#9d4e6e", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "flex-start" }}>
              Submit Application →
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: CONTACT ────────────────────────────────────────────────────────────
function ContactPage({ onNav }) {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0dbd6", fontSize: 14, fontFamily: "'Inter',sans-serif", color: "#222", background: "#faf9f8", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" };

  const contactCards = [
    { icon: "✉️", title: "General Inquiries", value: "info@utahdancespecialists.com" },
    { icon: "🏥", title: "Provider Relations", value: "providers@utahdancespecialists.com" },
    { icon: "📢", title: "Press & Partnerships", value: "press@utahdancespecialists.com" },
  ];

  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #f0faf8 0%, #fdf2f6 100%)", padding: "80px 32px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#2d7a6e", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>We'd Love to Hear From You</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 52, fontWeight: 300, color: "#1a1a1a", margin: "0 0 20px", lineHeight: 1.2 }}>Get in<br /><em>Touch</em></h1>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px 80px", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48, alignItems: "start" }}>
        {/* Left column */}
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 32 }}>
            {contactCards.map((card) => (
              <div key={card.title} style={{ background: "#fff", borderRadius: 16, padding: "24px 24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #ede8e4" }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "#333", fontFamily: "'Inter',sans-serif" }}>{card.value}</div>
              </div>
            ))}
          </div>
          {/* Dancer callout */}
          <div style={{ background: "linear-gradient(135deg,#fdf2f6,#f4f2fb)", borderRadius: 16, padding: "24px", border: "1px solid #e8c0da" }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>🩰</div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: "0 0 16px", fontFamily: "'Inter',sans-serif" }}>
              Looking for a specialist? Use our directory to find practitioners near you who are accepting new patients.
            </p>
            <button onClick={() => onNav("directory")} style={{ padding: "10px 20px", borderRadius: 50, background: "#9d4e6e", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Search Directory →
            </button>
          </div>
        </div>

        {/* Right column — contact form */}
        <div style={{ background: "#fff", borderRadius: 20, padding: "40px", boxShadow: "0 4px 24px rgba(0,0,0,0.06)", border: "1px solid #ede8e4" }}>
          {submitted ? (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 400, color: "#1a1a1a", marginBottom: 12 }}>Message Sent</h3>
              <p style={{ fontSize: 14, color: "#666", fontFamily: "'Inter',sans-serif", lineHeight: 1.7 }}>Thanks for reaching out. We'll get back to you within 2 business days.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 400, color: "#1a1a1a", margin: "0 0 8px" }}>Send a Message</h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={labelStyle}>Name *</label>
                  <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your name" />
                </div>
                <div>
                  <label style={labelStyle}>Email *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="you@example.com" />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inputStyle}>
                  <option value="">Select a topic...</option>
                  <option>General Question</option>
                  <option>Provider Inquiry</option>
                  <option>Partnership Opportunity</option>
                  <option>Other</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Message *</label>
                <textarea required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, minHeight: 140, resize: "vertical" }} placeholder="How can we help?" />
              </div>
              <button type="submit" style={{ padding: "15px 30px", borderRadius: 50, background: "#9d4e6e", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "flex-start" }}>
                Send Message →
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ────────────────────────────────────────────────────────────────
export default function App() {
  useFonts();
  const [page, setPage] = useState("directory");

  const pages = {
    directory: <DirectoryPage onNav={setPage} />,
    about: <AboutPage onNav={setPage} />,
    providers: <ProvidersPage />,
    contact: <ContactPage onNav={setPage} />,
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "#f9f7f4" }}>
      <Nav current={page} onNav={setPage} />
      <main style={{ flex: 1 }}>{pages[page]}</main>
      <Footer onNav={setPage} />
    </div>
  );
}
