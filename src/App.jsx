import { useState, useMemo, useEffect } from "react";
import specialistsData from "./specialists.json";

const SITE_URL = "https://utahdancemedicine.com";
const SITE_NAME = "Utah Dance Medicine";
const HERO_IMAGE = "/hero.jpg";

// ─── Data source ─────────────────────────────────────────────────────────────
// Live data comes from /api/providers (Vercel serverless → Airtable).
// specialists.json is the instant fallback shown while that fetch resolves.

// ─── COLOR PALETTE ────────────────────────────────────────────────────────────
// The app auto-assigns card colors by cycling through this palette in order.
// No human needs to touch these — just add providers to the sheet.
const COLOR_PALETTE = [
  { color: "#9d4e6e", bgLight: "#fdf2f6", borderColor: "#f0c4d8", badgeBg: "#fce8f1", badgeText: "#7a2d4f" },
  { color: "#5a4a8a", bgLight: "#f4f2fb", borderColor: "#d0c8f0", badgeBg: "#ece8f8", badgeText: "#3e2e70" },
  { color: "#2d7a6e", bgLight: "#f0faf8", borderColor: "#b2ddd8", badgeBg: "#daf2ef", badgeText: "#1a5a50" },
  { color: "#a06030", bgLight: "#fdf8f2", borderColor: "#f0ddc0", badgeBg: "#faebd4", badgeText: "#7a4520" },
  { color: "#1e6091", bgLight: "#f0f6fc", borderColor: "#b8d8f0", badgeBg: "#d8edf8", badgeText: "#0d4470" },
  { color: "#8a3a6e", bgLight: "#fcf2f8", borderColor: "#e8c0da", badgeBg: "#f5e0ef", badgeText: "#6a1a50" },
  { color: "#4a7a3a", bgLight: "#f4faf0", borderColor: "#c0ddb8", badgeBg: "#daf0d4", badgeText: "#2a5a1e" },
  { color: "#7a2040", bgLight: "#fdf0f4", borderColor: "#e8b0c8", badgeBg: "#f5d8e8", badgeText: "#5a1030" },
];

// Maps a provider's primary specialty to a fixed palette entry so color is
// consistent and meaningful rather than just sequential.
const SPECIALTY_COLORS = {
  "PT":                 COLOR_PALETTE[0],  // rose/mauve
  "MD":                 COLOR_PALETTE[4],  // blue
  "DO":                 COLOR_PALETTE[1],  // purple
  "Surgeon":            COLOR_PALETTE[7],  // dark red
  "Pilates Instructor": COLOR_PALETTE[2],  // teal
  "Gyrotonics":         COLOR_PALETTE[3],  // amber
  "Personal Trainer":   COLOR_PALETTE[5],  // plum
  "Athletic Trainer":   COLOR_PALETTE[6],  // green
};

function applyPalette(specialists) {
  return specialists.map((s, i) => {
    const primary = Array.isArray(s.specialty) ? s.specialty[0] : s.specialty;
    const palette = SPECIALTY_COLORS[primary] || COLOR_PALETTE[i % COLOR_PALETTE.length];
    return {
      ...s,
      ...palette,
      initials: s.name
        ? s.name.split(" ").filter(Boolean).map((n) => n[0].toUpperCase()).filter((_, j, a) => j === 0 || j === a.length - 1).join("").slice(0, 2)
        : "??",
    };
  });
}


// ─── GEOCODING (Nominatim + localStorage cache) ────────────────────────────────
// Converts a street address to lat/lng using OpenStreetMap's free API.
// Results are cached in localStorage so each address is only looked up once.
const GEO_CACHE_KEY = "udm_geo_v1";

function getGeoCache() {
  try { return JSON.parse(localStorage.getItem(GEO_CACHE_KEY) || "{}"); } catch { return {}; }
}

function saveGeoCache(cache) {
  try { localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(cache)); } catch {}
}

async function geocodeAddress(address) {
  const cache = getGeoCache();
  if (cache[address]) return cache[address];
  try {
    const url = "https://nominatim.openstreetmap.org/search?q=" + encodeURIComponent(address + ", USA") + "&format=json&limit=1&countrycodes=us";
    const res = await fetch(url, { headers: { "User-Agent": "UtahDanceMedicine/1.0 (utahdancemedicine.com)" } });
    const data = await res.json();
    if (data[0]) {
      const coords = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
      saveGeoCache({ ...cache, [address]: coords });
      return coords;
    }
  } catch {}
  return null;
}

async function geocodeAll(providers, onUpdate) {
  // Only geocode providers that have an address but no coordinates yet
  const cache = getGeoCache();
  const needsGeo = providers.filter((p) => p.address && !p.lat && !cache[p.address]);
  for (let i = 0; i < needsGeo.length; i++) {
    if (i > 0) await new Promise((r) => setTimeout(r, 1200)); // respect 1 req/sec rate limit
    const coords = await geocodeAddress(needsGeo[i].address);
    if (coords) onUpdate(needsGeo[i].id, coords);
  }
  // Apply cached coords to providers that already have a cached address
  const withCache = providers.map((p) => {
    if (!p.lat && p.address && cache[p.address]) return { ...p, ...cache[p.address] };
    return p;
  });
  return withCache;
}

// ─── HAVERSINE DISTANCE (miles) ───────────────────────────────────────────────
function haversine(lat1, lng1, lat2, lng2) {
  const R = 3958.8;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.asin(Math.sqrt(a));
}

// ─── SEO HOOK ────────────────────────────────────────────────────────────────
function useSEO(page) {
  useEffect(() => {
    const titles = {
      directory: "Utah Dance Medicine | Find Dance Medicine Specialists in Utah",
      about: "About | Utah Dance Medicine",
      providers: "For Providers | Join the Utah Dance Medicine Directory",
      onsite: "Onsite & Backstage Services | Utah Dance Medicine",
      contact: "Contact | Utah Dance Medicine",
    };
    document.title = titles[page] || titles.directory;
  }, [page]);
}

// ─── FONT LOADER ─────────────────────────────────────────────────────────────
function useFonts() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,300;1,400&family=Inter:wght@300;400;500;600&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "MedicalOrganization",
      "name": SITE_NAME,
      "url": SITE_URL,
      "description": "Utah's directory of dance medicine specialists — physical therapists, sports medicine doctors, and certified practitioners who understand the demands of dance.",
      "areaServed": { "@type": "State", "name": "Utah" },
      "medicalSpecialty": "Dance Medicine",
    });
    document.head.appendChild(script);
  }, []);
}

// ─── SHARED NAV ──────────────────────────────────────────────────────────────
function Nav({ current, onNav }) {
  const links = [
    ["directory", "Directory"],
    ["about", "About"],
    ["onsite", "Onsite Services"],
    ["providers", "For Providers"],
    ["contact", "Contact"],
  ];
  return (
    <nav style={{ position: "sticky", top: 0, zIndex: 100, background: "rgba(16,8,24,0.97)", backdropFilter: "blur(8px)", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 32px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 60 }}>
        <button onClick={() => onNav("directory")} style={{ background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 13, letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 500, fontFamily: "'Inter',sans-serif" }}>
          utahdancemedicine.com
        </button>
        <div style={{ display: "flex", gap: 28 }}>
          {links.map(([page, label]) => (
            <button key={page} onClick={() => onNav(page)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 13, letterSpacing: "0.06em", fontFamily: "'Inter',sans-serif", fontWeight: current === page ? 600 : 400, color: current === page ? "#fff" : "rgba(255,255,255,0.6)", borderBottom: current === page ? "1px solid #9d4e6e" : "1px solid transparent", paddingBottom: 2, transition: "color 0.2s" }}>
              {label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}

// ─── SHARED FOOTER ────────────────────────────────────────────────────────────
function Footer({ onNav }) {
  return (
    <footer style={{ background: "#100818", borderTop: "1px solid #2a1535", padding: "48px 48px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 32, marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 22, color: "#fff", fontWeight: 300, letterSpacing: "0.02em", marginBottom: 6 }}>Utah Dance Medicine</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", marginBottom: 4 }}>utahdancemedicine.com</div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", maxWidth: 300, lineHeight: 1.6 }}>Utah's premier directory connecting dancers with practitioners who understand the art and science of movement.</div>
          </div>
          <div style={{ display: "flex", gap: 48 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>Navigate</div>
              {[["directory","Directory"],["about","About"],["onsite","Onsite Services"],["providers","For Providers"],["contact","Contact"]].map(([page, label]) => (
                <button key={page} onClick={() => onNav(page)} style={{ display: "block", background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "rgba(255,255,255,0.45)", fontFamily: "'Inter',sans-serif", marginBottom: 8, padding: 0, textAlign: "left" }}>{label}</button>
              ))}
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 12, fontFamily: "'Inter',sans-serif" }}>Contact</div>
              {[["General","info@utahdancemedicine.com"],["Providers","providers@utahdancemedicine.com"],["Press","press@utahdancemedicine.com"]].map(([label, email]) => (
                <div key={label} style={{ marginBottom: 8 }}>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "'Inter',sans-serif" }}>{label}</div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "'Inter',sans-serif" }}>{email}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 20, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0 }}>© 2025 Utah Dance Medicine. All rights reserved.</p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.2)", margin: 0 }}>Providers are responsible for keeping their profiles current. Listing does not constitute endorsement.</p>
        </div>
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
      <button onClick={() => setOpen((o) => !o)} style={{ display: "flex", alignItems: "center", gap: 8, padding: "11px 18px", borderRadius: 50, background: active ? "#2c1a3a" : "#fff", border: active ? "1.5px solid #2c1a3a" : "1.5px solid #ddd", fontSize: 13, fontWeight: 500, color: active ? "#fff" : "#444", cursor: "pointer", letterSpacing: "0.02em", boxShadow: "0 1px 6px rgba(0,0,0,0.07)", fontFamily: "'Inter',sans-serif" }}>
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
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => onChange(selected.includes(opt) ? selected.filter((x) => x !== opt) : [...selected, opt])} style={{ accentColor: "#9d4e6e", width: 15, height: 15 }} />
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SPECIALIST CARD ──────────────────────────────────────────────────────────
function SpecialistCard({ s, distance }) {
  const [open, setOpen] = useState(false);
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
              {distance !== undefined && (
                <span style={{ fontSize: 11, fontWeight: 500, color: "#555", background: "#f4f4f4", border: "1px solid #e4e4e4", borderRadius: 99, padding: "3px 11px" }}>
                  {distance < 1 ? "< 1 mi" : distance.toFixed(0) + " mi away"}
                </span>
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
        {s.address && (
          <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
            <span style={{ flexShrink: 0 }}>📍</span>
            <a href={"https://maps.google.com/maps?q=" + encodeURIComponent(s.address)} target="_blank" rel="noopener noreferrer" style={{ color: "#555", textDecoration: "none" }}>{s.address}</a>
          </div>
        )}
        {s.clinicPhone   && <div style={{ display: "flex", gap: 10, fontSize: 13, color: "#555" }}><span>📞</span><span>{s.clinicPhone}</span></div>}
        {s.clinicEmail   && <div style={{ display: "flex", gap: 10, fontSize: 13, color: "#555" }}><span>✉️</span><span>{s.clinicEmail}</span></div>}
        {s.personalPhone && <div style={{ display: "flex", gap: 10, fontSize: 13, color: "#555" }}><span>📞</span><span>{s.personalPhone}</span></div>}
        {s.personalEmail && <div style={{ display: "flex", gap: 10, fontSize: 13, color: "#555" }}><span>✉️</span><span>{s.personalEmail}</span></div>}
        <div style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "#555", lineHeight: 1.5 }}>
          <span style={{ flexShrink: 0 }}>🛡️</span>
          <span>{s.insurances.join(", ")}</span>
        </div>
        <div style={{ marginTop: 4 }}>
          <button onClick={() => setOpen((o) => !o)} style={{ background: "none", border: "none", padding: 0, cursor: "pointer", fontSize: 12, fontWeight: 600, color: s.color, letterSpacing: "0.06em", textTransform: "uppercase", display: "flex", alignItems: "center", gap: 6, fontFamily: "'Inter',sans-serif" }}>
            <span style={{ fontSize: 10 }}>{open ? "▲" : "▼"}</span>
            {open ? "Hide Bio" : "Read Bio"}
          </button>
          {open && (
            <div style={{ marginTop: 12, paddingTop: 12, borderTop: "1px solid " + s.borderColor }}>
              <p style={{ fontSize: 13.5, color: "#555", lineHeight: 1.75, margin: 0, fontStyle: "italic" }}>{s.bio}</p>
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 14, fontSize: 12, fontWeight: 600, color: s.color, textDecoration: "none", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                  🌐 Website →
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/// ─── PAGE: DIRECTORY ──────────────────────────────────────────────────────────
function DirectoryPage({ onNav }) {
  // Start with local JSON (instant), then fetch Google Sheets + geocode in background
  const [specialists, setSpecialists] = useState(() => applyPalette(specialistsData));

  useEffect(() => {
    async function load() {
      let raw = specialistsData;
      try {
        const res = await fetch("/api/providers");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.providers) && data.providers.length > 0) {
            raw = data.providers;
          }
        }
      } catch {}
      const withPalette = applyPalette(raw);
      // Apply any already-cached coordinates immediately
      const cache = getGeoCache();
      const withCached = withPalette.map((p) =>
        !p.lat && p.address && cache[p.address] ? { ...p, ...cache[p.address] } : p
      );
      setSpecialists(withCached);
      // Geocode remaining addresses in background, updating cards as each resolves
      await geocodeAll(withCached, (id, coords) => {
        setSpecialists((prev) => prev.map((p) => p.id === id ? { ...p, ...coords } : p));
      });
    }
    load();
  }, []);

  const allCertifications = useMemo(() => [...new Set(specialists.flatMap((s) => s.certifications))].sort(), [specialists]);
  const allInsurances = useMemo(() => [...new Set(specialists.flatMap((s) => s.insurances))].sort(), [specialists]);

  // Text / dropdown filters
  const [query, setQuery] = useState("");
  const [certs, setCerts] = useState([]);
  const [insurance, setInsurance] = useState([]);
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  // Location / radius filters
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [radius, setRadius] = useState(25);
  const [zipInput, setZipInput] = useState("");
  const [locLabel, setLocLabel] = useState("");
  const [locLoading, setLocLoading] = useState(false);

  const lookupZip = async (zip) => {
    if (!/^\d{5}$/.test(zip)) return;
    setLocLoading(true);
    try {
      const res = await fetch("https://api.zippopotam.us/us/" + zip);
      if (!res.ok) throw new Error("not found");
      const data = await res.json();
      setUserLat(parseFloat(data.places[0].latitude));
      setUserLng(parseFloat(data.places[0].longitude));
      setLocLabel(data.places[0]["place name"] + ", " + data.places[0]["state abbreviation"]);
    } catch (_) {
      alert("Zip code not found. Please try another.");
    }
    setLocLoading(false);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { alert("Geolocation is not supported by your browser."); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { setUserLat(pos.coords.latitude); setUserLng(pos.coords.longitude); setLocLabel("Your location"); setLocLoading(false); },
      () => { alert("Couldn't access your location. Please enter a zip code instead."); setLocLoading(false); }
    );
  };

  const clearLocation = () => { setUserLat(null); setUserLng(null); setLocLabel(""); setZipInput(""); };
  const hasFilters = query || certs.length > 0 || insurance.length > 0 || acceptingOnly || userLat;
  const clearAll = () => { setQuery(""); setCerts([]); setInsurance([]); setAcceptingOnly(false); clearLocation(); };

  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    let result = specialists.filter((s) => {
      const matchQ = !q || s.name.toLowerCase().includes(q) || s.certifications.some((c) => c.toLowerCase().includes(q)) || (s.address && s.address.toLowerCase().includes(q));
      const matchC = certs.length === 0 || certs.some((c) => s.certifications.includes(c));
      const matchI = insurance.length === 0 || insurance.some((i) => s.insurances.includes(i));
      const matchAccepting = !acceptingOnly || s.acceptingPatients;
      const matchLoc = !userLat || !s.lat || haversine(userLat, userLng, s.lat, s.lng) <= radius;
      return matchQ && matchC && matchI && matchAccepting && matchLoc;
    });
    if (userLat) {
      result = [...result].sort((a, b) => {
        const da = a.lat ? haversine(userLat, userLng, a.lat, a.lng) : 9999;
        const db = b.lat ? haversine(userLat, userLng, b.lat, b.lng) : 9999;
        return da - db;
      });
    }
    return result;
  }, [query, certs, insurance, acceptingOnly, userLat, userLng, radius, specialists]);

  const inputBase = { padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0dbd6", fontSize: 13, fontFamily: "'Inter',sans-serif", color: "#222", background: "#faf9f8", outline: "none" };

  return (
    <div>
      {/* Hero */}
      <div style={{ position: "relative", height: 480, overflow: "hidden" }}>
        <img src={HERO_IMAGE} alt="Ballet dancers performing in a Utah dance studio with red rock views" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }} />
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

      {/* Filter bar */}
      <div style={{ background: "#fff", borderBottom: "1px solid #ece8e4", boxShadow: "0 4px 30px rgba(0,0,0,0.07)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "16px 32px", display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10 }}>
          {/* Search */}
          <div style={{ position: "relative", flex: "1 1 260px", minWidth: 220 }}>
            <span style={{ position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)", fontSize: 14, color: "#aaa" }}>🔍</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, specialty..."
              style={{ width: "100%", padding: "11px 36px 11px 44px", borderRadius: 50, fontSize: 13, fontFamily: "'Inter',sans-serif", border: "1.5px solid #e0dbd6", outline: "none", background: "#faf9f8", color: "#222", boxSizing: "border-box" }}
            />
            {query && (
              <button onClick={() => setQuery("")} style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "#bbb" }}>×</button>
            )}
          </div>

          {/* Certification & Insurance dropdowns */}
          <Dropdown label="Certification" icon="⭐" options={allCertifications} selected={certs} onChange={setCerts} />
          <Dropdown label="Insurance" icon="🛡️" options={allInsurances} selected={insurance} onChange={setInsurance} />

          {/* Accepting toggle */}
          <button
            onClick={() => setAcceptingOnly((a) => !a)}
            style={{ padding: "11px 18px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.02em", border: acceptingOnly ? "1.5px solid #1a7a45" : "1.5px solid #ddd", background: acceptingOnly ? "#1a7a45" : "#fff", color: acceptingOnly ? "#fff" : "#444", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
          >
            ✓ Accepting Patients
          </button>

          {/* Location / radius */}
          {!userLat ? (
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div style={{ position: "relative" }}>
                <input
                  value={zipInput}
                  onChange={(e) => { const v = e.target.value.replace(/\D/g, "").slice(0, 5); setZipInput(v); if (v.length === 5) lookupZip(v); }}
                  placeholder="Zip code"
                  style={{ ...inputBase, width: 100, padding: "11px 14px", borderRadius: 50 }}
                />
              </div>
              <button
                onClick={useMyLocation}
                disabled={locLoading}
                style={{ padding: "11px 16px", borderRadius: 50, fontSize: 12, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", border: "1.5px solid #ddd", background: "#fff", color: "#555", whiteSpace: "nowrap", boxShadow: "0 1px 6px rgba(0,0,0,0.07)" }}
              >
                {locLoading ? "⏳" : "📍 Near me"}
              </button>
            </div>
          ) : (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: "#333", background: "#f0f6ff", border: "1.5px solid #c0d8f0", borderRadius: 50, padding: "8px 14px", fontFamily: "'Inter',sans-serif", whiteSpace: "nowrap" }}>
                📍 {locLabel}
              </span>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                style={{ ...inputBase, padding: "9px 12px", borderRadius: 50, cursor: "pointer" }}
              >
                <option value={10}>10 miles</option>
                <option value={25}>25 miles</option>
                <option value={50}>50 miles</option>
                <option value={200}>Statewide</option>
              </select>
              <button onClick={clearLocation} style={{ padding: "9px 14px", borderRadius: 50, fontSize: 12, cursor: "pointer", fontFamily: "'Inter',sans-serif", border: "1.5px solid #f0c0c0", background: "#fff4f4", color: "#b03030" }}>× Location</button>
            </div>
          )}

          {hasFilters && (
            <button onClick={clearAll} style={{ padding: "11px 18px", borderRadius: 50, fontSize: 13, fontWeight: 500, cursor: "pointer", fontFamily: "'Inter',sans-serif", border: "1.5px solid #f0c0c0", background: "#fff4f4", color: "#b03030" }}>× Clear all</button>
          )}
        </div>
      </div>

      {/* Grid */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "40px 32px 80px" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 28 }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 30, fontWeight: 400, color: "#1a1a1a" }}>Specialist Directory</h2>
            <p style={{ margin: "4px 0 0", fontSize: 13, color: "#aaa" }}>
              {filtered.length} specialist{filtered.length !== 1 ? "s" : ""} found
              {userLat ? " within " + radius + " miles of " + locLabel : " in Utah"}
            </p>
          </div>
          <button onClick={() => onNav("providers")} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#9d4e6e", fontFamily: "'Inter',sans-serif", letterSpacing: "0.08em", textTransform: "uppercase" }}>
            Join the Directory →
          </button>
        </div>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.3 }}>🩰</div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: "#888", fontStyle: "italic" }}>No specialists found</div>
            <p style={{ fontSize: 13, color: "#bbb", marginTop: 8, fontFamily: "'Inter',sans-serif" }}>
              {userLat ? "Try increasing the radius or clearing your location filter." : "Try adjusting your filters."}
            </p>
            <button onClick={clearAll} style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "#9d4e6e", fontFamily: "'Inter',sans-serif" }}>Clear all filters</button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(380px,1fr))", gap: 22 }}>
            {filtered.map((s) => {
              const dist = userLat && s.lat ? haversine(userLat, userLng, s.lat, s.lng) : undefined;
              return <SpecialistCard key={s.id} s={s} distance={dist} />;
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: ABOUT ──────────────────────────────────────────────────────────────
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
    { icon: "📍", title: "Utah-Focused", desc: "Serving dancers from St. George to Logan, with an emphasis on underserved areas outside Salt Lake City where access to specialized care has historically been limited." },
  ];
  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #fdf2f6 0%, #f4f2fb 100%)", padding: "80px 32px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#9d4e6e", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>Our Mission</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 52, fontWeight: 300, color: "#1a1a1a", margin: "0 0 20px", lineHeight: 1.2 }}>Where Dance<br /><em>Meets Medicine</em></h1>
        <p style={{ fontSize: 17, color: "#666", maxWidth: 560, margin: "0 auto", lineHeight: 1.8, fontWeight: 300, fontFamily: "'Inter',sans-serif" }}>Utah's dedicated resource connecting dancers with practitioners who truly understand the demands of the art.</p>
      </div>
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
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "80px 32px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 300, color: "#1a1a1a", marginBottom: 32 }}>Our Story</h2>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.9, marginBottom: 20, fontFamily: "'Inter',sans-serif" }}>Dancers in Utah have long faced a frustrating challenge: finding healthcare providers who understand that a sprained ankle isn't just a sprained ankle when you're performing in two weeks, or that "rest" isn't a complete treatment plan for someone whose livelihood depends on movement.</p>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.9, marginBottom: 20, fontFamily: "'Inter',sans-serif" }}>Utah Dance Medicine was created to close that gap — to build a centralized, trusted resource that dancers, companies, and studios can rely on to find practitioners who have specifically sought out training and experience in the unique physiology and demands of dance.</p>
        <p style={{ fontSize: 15, color: "#555", lineHeight: 1.9, fontFamily: "'Inter',sans-serif" }}>Every provider in our directory has been reviewed for dance-relevant credentials. We prioritize transparency: you can see exactly what each provider specializes in, which insurances they accept, and whether they're currently taking new patients.</p>
        <div style={{ marginTop: 48, display: "flex", gap: 16, flexWrap: "wrap" }}>
          <button onClick={() => onNav("directory")} style={{ padding: "14px 28px", borderRadius: 50, background: "#9d4e6e", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Find a Specialist</button>
          <button onClick={() => onNav("providers")} style={{ padding: "14px 28px", borderRadius: 50, background: "none", border: "1.5px solid #9d4e6e", color: "#9d4e6e", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Join the Directory</button>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE: ONSITE SERVICES ────────────────────────────────────────────────────
function OnsitePage() {
  const [form, setForm] = useState({ name: "", org: "", role: "", email: "", phone: "", eventType: "", eventDate: "", location: "", dancers: "", notes: "" });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("https://formspree.io/f/mwvnjaqg", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ "_subject": "Onsite/Backstage Inquiry — Utah Dance Medicine", ...form }),
      });
      if (res.ok) setSubmitted(true);
    } catch (_) {}
    setSubmitting(false);
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0dbd6", fontSize: 14, fontFamily: "'Inter',sans-serif", color: "#222", background: "#faf9f8", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" };

  const services = [
    { icon: "🎭", title: "Performances & Productions", desc: "Medical coverage for ballet, contemporary, and theatrical performances. On-call practitioners for injury response, taping, and pre-show assessments." },
    { icon: "🏫", title: "Intensives & Workshops", desc: "Coverage for summer intensives, masterclasses, and multi-day workshops where dancers are training at elevated volumes and injury risk is higher." },
    { icon: "🏆", title: "Competitions", desc: "Backstage medical support for dance competitions, ensuring athletes have access to qualified care throughout the event." },
    { icon: "🏢", title: "Company Residencies", desc: "Embedded practitioner arrangements for dance companies seeking consistent, relationship-based sports medicine support throughout the season." },
  ];

  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #100818 0%, #2a1535 100%)", padding: "80px 32px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "rgba(157,78,110,0.9)", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>Specialized Coverage</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 52, fontWeight: 300, color: "#fff", margin: "0 0 20px", lineHeight: 1.2 }}>Onsite & Backstage<br /><em>Services</em></h1>
        <p style={{ fontSize: 17, color: "rgba(255,255,255,0.6)", maxWidth: 560, margin: "0 auto", lineHeight: 1.8, fontWeight: 300, fontFamily: "'Inter',sans-serif" }}>
          Connect your company, studio, or event with qualified dance medicine practitioners who can be on the ground when it matters most.
        </p>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "60px 32px 40px", textAlign: "center" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 36, fontWeight: 300, color: "#1a1a1a", marginBottom: 16 }}>How It Works</h2>
        <p style={{ fontSize: 15, color: "#666", lineHeight: 1.8, maxWidth: 600, margin: "0 auto 48px", fontFamily: "'Inter',sans-serif" }}>
          We maintain a network of Utah Dance Medicine specialists available for onsite and backstage engagements. Submit an inquiry and we'll match you with an available provider suited to your event's needs.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 0, maxWidth: 600, margin: "0 auto 60px" }}>
          {[["1", "Submit an inquiry", "Tell us about your event, dates, and needs."], ["2", "We match you", "We contact available providers in our network on your behalf."], ["3", "Coverage confirmed", "We connect you directly with your matched provider to finalize details."]].map(([num, title, desc]) => (
            <div key={num} style={{ padding: "0 16px", borderRight: num !== "3" ? "1px solid #e8e0dc" : "none" }}>
              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#9d4e6e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 600, margin: "0 auto 12px", fontFamily: "'Cormorant Garamond',serif" }}>{num}</div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#1a1a1a", marginBottom: 6, fontFamily: "'Inter',sans-serif" }}>{title}</div>
              <div style={{ fontSize: 13, color: "#888", lineHeight: 1.6, fontFamily: "'Inter',sans-serif" }}>{desc}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ background: "#fff", padding: "60px 32px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 34, fontWeight: 300, color: "#1a1a1a", textAlign: "center", marginBottom: 40 }}>Types of Coverage</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 20 }}>
            {services.map((svc) => (
              <div key={svc.title} style={{ borderRadius: 16, padding: "28px 24px", border: "1px solid #ede8e4", background: "#faf9f8" }}>
                <div style={{ fontSize: 32, marginBottom: 12 }}>{svc.icon}</div>
                <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 400, color: "#1a1a1a", margin: "0 0 8px" }}>{svc.title}</h3>
                <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: 0, fontFamily: "'Inter',sans-serif" }}>{svc.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: "60px 32px 80px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 300, color: "#1a1a1a", marginBottom: 8 }}>Submit an Inquiry</h2>
        <p style={{ fontSize: 14, color: "#999", marginBottom: 40, fontFamily: "'Inter',sans-serif" }}>We'll review your request and reach out within 2–3 business days with available providers.</p>
        {submitted ? (
          <div style={{ textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 20, border: "1px solid #a8e6c0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 400, color: "#1a1a1a", marginBottom: 12 }}>Inquiry Received</h3>
            <p style={{ fontSize: 14, color: "#666", fontFamily: "'Inter',sans-serif", lineHeight: 1.7 }}>Thank you for reaching out. We'll review your request and follow up within 2–3 business days with available providers in our network.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>Your Name *</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Full name" /></div>
              <div><label style={labelStyle}>Organization / Company *</label><input required value={form.org} onChange={(e) => setForm((f) => ({ ...f, org: e.target.value }))} style={inputStyle} placeholder="Company or studio name" /></div>
            </div>
            <div><label style={labelStyle}>Your Role</label><input value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={inputStyle} placeholder="e.g. Artistic Director, Production Manager" /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>Email *</label><input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="you@example.com" /></div>
              <div><label style={labelStyle}>Phone</label><input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} style={inputStyle} placeholder="(801) 555-0100" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Event Type *</label>
                <select required value={form.eventType} onChange={(e) => setForm((f) => ({ ...f, eventType: e.target.value }))} style={inputStyle}>
                  <option value="">Select...</option>
                  <option>Performance / Production</option>
                  <option>Summer Intensive</option>
                  <option>Workshop / Masterclass</option>
                  <option>Competition</option>
                  <option>Company Residency</option>
                  <option>Other</option>
                </select>
              </div>
              <div><label style={labelStyle}>Event Date(s) *</label><input required value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} style={inputStyle} placeholder="e.g. June 14–18, 2025" /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div><label style={labelStyle}>Location / Venue *</label><input required value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} style={inputStyle} placeholder="City, venue name" /></div>
              <div><label style={labelStyle}>Approximate # of Dancers</label><input value={form.dancers} onChange={(e) => setForm((f) => ({ ...f, dancers: e.target.value }))} style={inputStyle} placeholder="e.g. 30–50" /></div>
            </div>
            <div><label style={labelStyle}>Additional Notes</label><textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} placeholder="Any specific needs, styles of dance, or other details..." /></div>
            <button type="submit" disabled={submitting} style={{ padding: "16px 32px", borderRadius: 50, background: submitting ? "#c49" : "#9d4e6e", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: submitting ? "default" : "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "flex-start" }}>
              {submitting ? "Sending…" : "Submit Inquiry →"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ─── PAGE: FOR PROVIDERS ──────────────────────────────────────────────────────
function ProvidersPage() {
  const [form, setForm] = useState({
    // Profile info (shown publicly on the directory card)
    name: "",
    credentials: "",
    practiceName: "",
    website: "",
    // How dancers contact this provider (publicly displayed)
    clinicPhone: "",
    clinicEmail: "",
    personalPhone: "",
    personalEmail: "",
    // Admin-only contact (private, never shown to dancers)
    adminEmail: "",
    adminPhone: "",
    // Practice details
    practiceAddress: "",
    certifications: [],
    insurances: "",
    accepting: "",        // "yes" | "waitlist" | "no"
    // Profile
    bio: "",
    // Onsite interest
    onsiteInterest: "",   // "yes" | "no" | "maybe"
  });
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const certOptions = ["Dry Needling", "Pilates", "Pelvic Health", "Schroth", "Strength & Conditioning", "Gyrotonics", "Personal Trainer", "Other"];
  const toggleCert = (cert) => setForm((f) => ({ ...f, certifications: f.certifications.includes(cert) ? f.certifications.filter((c) => c !== cert) : [...f.certifications, cert] }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(false);
    try {
      const payload = {
        "_subject": "New Provider Application — Utah Dance Medicine",
        "Provider Name": form.name,
        "Credentials / Degrees": form.credentials,
        "Practice / Clinic Name": form.practiceName,
        "Website": form.website,
        "Clinic Phone": form.clinicPhone,
        "Clinic Email": form.clinicEmail,
        "Direct Phone": form.personalPhone,
        "Direct Email": form.personalEmail,
        "PRIVATE — Admin Email": form.adminEmail,
        "PRIVATE — Admin Phone": form.adminPhone,
        "Practice Address": form.practiceAddress,
        "Certifications": form.certifications.join(", "),
        "Insurances Accepted": form.insurances,
        "Accepting New Patients": form.accepting,
        "Bio": form.bio,
        "Onsite / Backstage Interest": form.onsiteInterest,
      };
      const res = await fetch("https://formspree.io/f/mwvnjaqg", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setSubmitted(true); }
      else { setSubmitError(true); }
    } catch (_) { setSubmitError(true); }
    setSubmitting(false);
  };

  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0dbd6", fontSize: 14, fontFamily: "'Inter',sans-serif", color: "#222", background: "#faf9f8", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" };
  const sectionLabelStyle = { fontSize: 11, fontWeight: 600, color: "#9d4e6e", letterSpacing: "0.14em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif", marginBottom: 16 };
  const dividerStyle = { height: 1, background: "#ece8e4", margin: "8px 0 24px" };

  const benefits = [
    { icon: "👥", title: "Reach Dancers Directly", desc: "Be found by Utah dancers actively searching for specialists who understand their needs — filtered by certification, location, and insurance." },
    { icon: "✅", title: "Build Your Reputation", desc: "A listing on Utah Dance Medicine signals to the community that you have sought out training relevant to dancer care." },
    { icon: "📊", title: "Stay in Control", desc: "Update your availability, accepting status, and profile details at any time. Your profile reflects your practice as it actually is." },
  ];

  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #f4f2fb 0%, #fdf2f6 100%)", padding: "80px 32px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#5a4a8a", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>For Healthcare Providers</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 52, fontWeight: 300, color: "#1a1a1a", margin: "0 0 20px", lineHeight: 1.2 }}>Join the<br /><em>Directory</em></h1>
        <p style={{ fontSize: 17, color: "#666", maxWidth: 520, margin: "0 auto", lineHeight: 1.8, fontWeight: 300, fontFamily: "'Inter',sans-serif" }}>Connect with Utah's dance community and make it easy for dancers to find you.</p>
      </div>
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

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "40px 32px 80px" }}>
        <h2 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 38, fontWeight: 300, color: "#1a1a1a", marginBottom: 8 }}>Apply to be Listed</h2>
        <p style={{ fontSize: 14, color: "#999", marginBottom: 40, fontFamily: "'Inter',sans-serif" }}>Applications are reviewed within 5–7 business days. We'll reach out at the private contact you provide below.</p>

        {submitted ? (
          <div style={{ textAlign: "center", padding: "60px 40px", background: "#fff", borderRadius: 20, border: "1px solid #a8e6c0" }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
            <h3 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 400, color: "#1a1a1a", marginBottom: 12 }}>Application Received</h3>
            <p style={{ fontSize: 14, color: "#666", fontFamily: "'Inter',sans-serif", lineHeight: 1.7 }}>Thank you for applying. We'll review your credentials and be in touch within 5–7 business days.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 0 }}>

            {/* ── SECTION 1: Profile info ── */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #ede8e4", marginBottom: 20 }}>
              <p style={sectionLabelStyle}>Your Profile (shown publicly on the directory)</p>
              <div style={dividerStyle} />
              <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={labelStyle}>Full Name *</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Dr. Jane Smith" /></div>
                  <div><label style={labelStyle}>Credentials / Degrees *</label><input required value={form.credentials} onChange={(e) => setForm((f) => ({ ...f, credentials: e.target.value }))} style={inputStyle} placeholder="PT, DPT, OCS" /></div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div><label style={labelStyle}>Practice / Clinic Name</label><input value={form.practiceName} onChange={(e) => setForm((f) => ({ ...f, practiceName: e.target.value }))} style={inputStyle} placeholder="Your clinic or practice name" /></div>
                  <div><label style={labelStyle}>Website URL</label><input value={form.website} onChange={(e) => setForm((f) => ({ ...f, website: e.target.value }))} style={inputStyle} placeholder="https://yourpractice.com" /></div>
                </div>
              </div>
            </div>

            {/* ── SECTION 2: How can dancers contact you ── */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #ede8e4", marginBottom: 20 }}>
              <p style={sectionLabelStyle}>Contact Information (publicly displayed)</p>
              <div style={dividerStyle} />
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: "0 0 20px", fontFamily: "'Inter',sans-serif" }}>
                Fill in whichever contact methods you'd like visible on your directory card. At least one is required.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={labelStyle}>Clinic Phone</label><input value={form.clinicPhone} onChange={(e) => setForm((f) => ({ ...f, clinicPhone: e.target.value }))} style={inputStyle} placeholder="(801) 555-0100" /></div>
                <div><label style={labelStyle}>Clinic Email</label><input type="email" value={form.clinicEmail} onChange={(e) => setForm((f) => ({ ...f, clinicEmail: e.target.value }))} style={inputStyle} placeholder="info@yourclinic.com" /></div>
                <div><label style={labelStyle}>Direct Phone</label><input value={form.personalPhone} onChange={(e) => setForm((f) => ({ ...f, personalPhone: e.target.value }))} style={inputStyle} placeholder="(801) 555-0100" /></div>
                <div><label style={labelStyle}>Direct Email</label><input type="email" value={form.personalEmail} onChange={(e) => setForm((f) => ({ ...f, personalEmail: e.target.value }))} style={inputStyle} placeholder="you@example.com" /></div>
              </div>
            </div>

            {/* ── SECTION 3: Private / Admin contact ── */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #ede8e4", marginBottom: 20 }}>
              <p style={{ ...sectionLabelStyle, color: "#5a4a8a" }}>How can we contact you? (private — never shown to dancers)</p>
              <div style={dividerStyle} />
              <p style={{ fontSize: 13, color: "#666", lineHeight: 1.7, margin: "0 0 20px", fontFamily: "'Inter',sans-serif" }}>
                This is how our team will reach you to discuss your application and keep your profile up to date. This information is never shared or displayed publicly.
              </p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div><label style={labelStyle}>Your Email *</label><input required type="email" value={form.adminEmail} onChange={(e) => setForm((f) => ({ ...f, adminEmail: e.target.value }))} style={inputStyle} placeholder="your personal email" /></div>
                <div><label style={labelStyle}>Your Phone *</label><input required value={form.adminPhone} onChange={(e) => setForm((f) => ({ ...f, adminPhone: e.target.value }))} style={inputStyle} placeholder="(801) 555-0100" /></div>
              </div>
            </div>

            {/* ── SECTION 4: Practice details ── */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #ede8e4", marginBottom: 20 }}>
              <p style={{ ...sectionLabelStyle, color: "#2d7a6e" }}>Practice Details</p>
              <div style={dividerStyle} />
              <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div>
                  <label style={labelStyle}>Practice Address *</label>
                  <input required value={form.practiceAddress} onChange={(e) => setForm((f) => ({ ...f, practiceAddress: e.target.value }))} style={inputStyle} placeholder="123 Main St, Salt Lake City, UT 84101" />
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 6, fontFamily: "'Inter',sans-serif" }}>Used to show your location on the map and enable radius search for patients.</p>
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
                  <label style={labelStyle}>Insurances Accepted *</label>
                  <input required value={form.insurances} onChange={(e) => setForm((f) => ({ ...f, insurances: e.target.value }))} style={inputStyle} placeholder="e.g. SelectHealth, Blue Cross, Aetna, Medicaid" />
                  <p style={{ fontSize: 11, color: "#aaa", marginTop: 6, fontFamily: "'Inter',sans-serif" }}>Separate multiple insurances with commas. Write "Cash pay only" if you don't accept insurance.</p>
                </div>
                <div>
                  <label style={labelStyle}>Accepting New Patients? *</label>
                  <div style={{ display: "flex", gap: 12, marginTop: 8, flexWrap: "wrap" }}>
                    {[["yes", "Yes — accepting now"], ["waitlist", "Waitlist only"], ["no", "Not currently accepting"]].map(([val, label]) => (
                      <label key={val} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, cursor: "pointer", fontFamily: "'Inter',sans-serif", padding: "8px 16px", borderRadius: 99, border: "1.5px solid " + (form.accepting === val ? "#1a7a45" : "#e0dbd6"), background: form.accepting === val ? "#e6f8ee" : "#faf9f8", color: form.accepting === val ? "#1a5a35" : "#555" }}>
                        <input type="radio" name="accepting" value={val} required checked={form.accepting === val} onChange={() => setForm((f) => ({ ...f, accepting: val }))} style={{ accentColor: "#1a7a45" }} />
                        {label}
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* ── SECTION 5: Bio ── */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #ede8e4", marginBottom: 20 }}>
              <p style={{ ...sectionLabelStyle, color: "#a06030" }}>Your Bio (shown publicly)</p>
              <div style={dividerStyle} />
              <label style={labelStyle}>Tell dancers about yourself *</label>
              <textarea required value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} style={{ ...inputStyle, minHeight: 130, resize: "vertical" }} placeholder="Share your background, training in dance medicine, types of dancers you work with, and what sets your approach apart..." />
            </div>

            {/* ── SECTION 6: Onsite interest ── */}
            <div style={{ background: "#fff", borderRadius: 20, padding: "32px", border: "1px solid #ede8e4", marginBottom: 28 }}>
              <p style={{ ...sectionLabelStyle, color: "#100818" }}>Onsite & Backstage</p>
              <div style={dividerStyle} />
              <label style={{ ...labelStyle, textTransform: "none", fontSize: 14, letterSpacing: 0, fontWeight: 500, color: "#333" }}>
                Are you interested in providing onsite or backstage treatments outside of your current practice or contracts (e.g. performances, intensives, competitions)?
              </label>
              <div style={{ display: "flex", gap: 12, marginTop: 12, flexWrap: "wrap" }}>
                {[["yes", "Yes, I'm interested"], ["maybe", "Maybe — feel free to ask"], ["no", "Not at this time"]].map(([val, label]) => (
                  <label key={val} style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 14, cursor: "pointer", fontFamily: "'Inter',sans-serif", padding: "8px 16px", borderRadius: 99, border: "1.5px solid " + (form.onsiteInterest === val ? "#9d4e6e" : "#e0dbd6"), background: form.onsiteInterest === val ? "#fce8f1" : "#faf9f8", color: form.onsiteInterest === val ? "#7a2d4f" : "#555" }}>
                    <input type="radio" name="onsiteInterest" value={val} checked={form.onsiteInterest === val} onChange={() => setForm((f) => ({ ...f, onsiteInterest: val }))} style={{ accentColor: "#9d4e6e" }} />
                    {label}
                  </label>
                ))}
              </div>
              <p style={{ fontSize: 12, color: "#aaa", marginTop: 12, fontFamily: "'Inter',sans-serif", lineHeight: 1.6 }}>This only affects whether we may contact you when an onsite inquiry comes in. It is not displayed on your public profile.</p>
            </div>

            {submitError && (
              <p style={{ fontSize: 13, color: "#b03030", fontFamily: "'Inter',sans-serif", marginBottom: 12 }}>Something went wrong submitting your application. Please try again or email us directly at providers@utahdancemedicine.com.</p>
            )}

            <button type="submit" disabled={submitting} style={{ padding: "16px 36px", borderRadius: 50, background: submitting ? "#c49" : "#9d4e6e", border: "none", color: "#fff", fontSize: 14, fontWeight: 600, cursor: submitting ? "default" : "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "flex-start" }}>
              {submitting ? "Sending…" : "Submit Application →"}
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
  const handleSubmit = (e) => { e.preventDefault(); setSubmitted(true); };
  const inputStyle = { width: "100%", padding: "12px 16px", borderRadius: 10, border: "1.5px solid #e0dbd6", fontSize: 14, fontFamily: "'Inter',sans-serif", color: "#222", background: "#faf9f8", outline: "none", boxSizing: "border-box" };
  const labelStyle = { display: "block", fontSize: 12, fontWeight: 600, color: "#555", marginBottom: 6, letterSpacing: "0.06em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif" };
  const contactCards = [
    { icon: "✉️", title: "General Inquiries", value: "info@utahdancemedicine.com" },
    { icon: "🏥", title: "Provider Relations", value: "providers@utahdancemedicine.com" },
    { icon: "📢", title: "Press & Partnerships", value: "press@utahdancemedicine.com" },
  ];
  return (
    <div style={{ background: "#f9f7f4", minHeight: "100vh" }}>
      <div style={{ background: "linear-gradient(135deg, #f0faf8 0%, #fdf2f6 100%)", padding: "80px 32px 60px", textAlign: "center" }}>
        <p style={{ fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase", color: "#2d7a6e", fontWeight: 600, marginBottom: 16, fontFamily: "'Inter',sans-serif" }}>We'd Love to Hear From You</p>
        <h1 style={{ fontFamily: "'Cormorant Garamond',Georgia,serif", fontSize: 52, fontWeight: 300, color: "#1a1a1a", margin: "0 0 20px", lineHeight: 1.2 }}>Get in<br /><em>Touch</em></h1>
      </div>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 32px 80px", display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 48, alignItems: "start" }}>
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
            {contactCards.map((card) => (
              <div key={card.title} style={{ background: "#fff", borderRadius: 16, padding: "24px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)", border: "1px solid #ede8e4" }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{card.icon}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#999", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Inter',sans-serif", marginBottom: 4 }}>{card.title}</div>
                <div style={{ fontSize: 14, color: "#333", fontFamily: "'Inter',sans-serif" }}>{card.value}</div>
              </div>
            ))}
          </div>
          <div style={{ background: "linear-gradient(135deg,#fdf2f6,#f4f2fb)", borderRadius: 16, padding: "24px", border: "1px solid #e8c0da" }}>
            <div style={{ fontSize: 20, marginBottom: 10 }}>🩰</div>
            <p style={{ fontSize: 13, color: "#555", lineHeight: 1.7, margin: "0 0 16px", fontFamily: "'Inter',sans-serif" }}>Looking for a specialist? Use our directory to find practitioners near you.</p>
            <button onClick={() => onNav("directory")} style={{ padding: "10px 20px", borderRadius: 50, background: "#9d4e6e", border: "none", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}>Search Directory →</button>
          </div>
        </div>
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
                <div><label style={labelStyle}>Name *</label><input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} style={inputStyle} placeholder="Your name" /></div>
                <div><label style={labelStyle}>Email *</label><input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} style={inputStyle} placeholder="you@example.com" /></div>
              </div>
              <div>
                <label style={labelStyle}>Subject</label>
                <select value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} style={inputStyle}>
                  <option value="">Select a topic...</option>
                  <option>General Question</option>
                  <option>Provider Inquiry</option>
                  <option>Onsite Services</option>
                  <option>Partnership Opportunity</option>
                  <option>Other</option>
                </select>
              </div>
              <div><label style={labelStyle}>Message *</label><textarea required value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} style={{ ...inputStyle, minHeight: 140, resize: "vertical" }} placeholder="How can we help?" /></div>
              <button type="submit" style={{ padding: "15px 30px", borderRadius: 50, background: "#9d4e6e", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", fontFamily: "'Inter',sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", alignSelf: "flex-start" }}>Send Message →</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── ROOT APP ─────────────────────────────────────────────────────────────────
export default function App() {
  useFonts();
  const [page, setPage] = useState("directory");
  useSEO(page);

  const pages = {
    directory: <DirectoryPage onNav={setPage} />,
    about: <AboutPage onNav={setPage} />,
    onsite: <OnsitePage />,
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
