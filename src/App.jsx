import { useState, useMemo, useEffect } from "react";
import specialistsData from "./specialists.json";

const HERO_IMAGE = "/hero.jpg";

// ─── SPECIALIST DATA ───
const specialists = specialistsData;

const certificationOptions = [
  "Dance Medicine Specialist",
  "Pilates Certified",
  "Orthopedic Certified Specialist",
  "Board Certified Orthopedics",
  "Board Certified Rheumatology",
  "Alexander Technique",
  "Sports Medicine Specialist"
];

// ─── DROPDOWN COMPONENT ───
const Dropdown = ({ label, options, value, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div style={ position: "relative", marginBottom: "1rem" }>
      <label style={
        display: "block",
        fontSize: "0.875rem",
        fontWeight: "600",
        marginBottom: "0.5rem",
        color: "#100818"
      }>
        {label}
      </label>
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={
          width: "100%",
          padding: "0.75rem",
          border: "1px solid #e0d5cc",
          borderRadius: "0.5rem",
          backgroundColor: "#ffffff",
          cursor: "pointer",
          textAlign: "left",
          fontSize: "1rem",
          color: value ? "#100818" : "#999",
          transition: "border-color 0.2s"
        }
      >
        {value ? options.find(o => o.value === value)?.label : "Select..."}
      </button>
      {isOpen && (
        <div style={
          position: "absolute",
          top: "100%",
          left: "0",
          right: "0",
          backgroundColor: "#fff",
          border: "1px solid #e0d5cc",
          borderRadius: "0.5rem",
          marginTop: "0.25rem",
          zIndex: "10",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
        }>
          {options.map(option => (
            <div
              key={option.value}
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              style={
                padding: "0.75rem",
                cursor: "pointer",
                backgroundColor: value === option.value ? "#f4f2fb" : "#fff",
                borderBottom: "1px solid #f0f0f0",
                color: "#100818",
                transition: "background-color 0.2s"
              }
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── SPECIALIST CARD ───
const SpecialistCard = ({ specialist }) => {
  const [expanded, setExpanded] = useState(false);
  return (
    <div style={
      border: "1px solid #e0d5cc",
      borderRadius: "0.5rem",
      padding: "1.5rem",
      backgroundColor: "#fff",
      transition: "all 0.3s",
      cursor: "pointer"
    }
    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 24px rgba(157, 78, 110, 0.15)"}
    onMouseLeave={e => e.currentTarget.style.boxShadow = "none"}
    >
      <div style={ marginBottom: "1rem" }>
        <h3 style={
          margin: "0 0 0.5rem 0",
          fontSize: "1.25rem",
          fontFamily: "'Cormorant Garamond', serif",
          color: "#100818",
          fontWeight: "600"
        }>
          {specialist.name}
        </h3>
        <p style={
          margin: "0",
          fontSize: "0.875rem",
          color: "#9d4e6e",
          fontWeight: "500"
        }>
          {specialist.title}
        </p>
      </div>

      {specialist.specialty && (
        <p style={
          margin: "0.75rem 0",
          fontSize: "0.875rem",
          color: "#666",
          fontStyle: "italic"
        }>
          Specialty: {specialist.specialty}
        </p>
      )}

      {specialist.locations && specialist.locations.length > 0 && (
        <p style={
          margin: "0.75rem 0",
          fontSize: "0.875rem",
          color: "#666"
        }>
          📍 {specialist.locations.join(", ")}
        </p>
      )}

      {specialist.accepting && (
        <p style={
          margin: "0.75rem 0",
          fontSize: "0.875rem",
          color: "#27a745",
          fontWeight: "600"
        }>
          ✓ Accepting new patients
        </p>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        style={
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          backgroundColor: "#9d4e6e",
          color: "#fff",
          border: "none",
          borderRadius: "0.375rem",
          cursor: "pointer",
          fontSize: "0.875rem",
          fontWeight: "500",
          transition: "background-color 0.2s"
        }
        onMouseEnter={e => e.target.style.backgroundColor = "#7a3a52"}
        onMouseLeave={e => e.target.style.backgroundColor = "#9d4e6e"}
      >
        {expanded ? "Show Less" : "View Details"}
      </button>

      {expanded && (
        <div style={ marginTop: "1rem", paddingTop: "1rem", borderTop: "1px solid #e0d5cc" }>
          {specialist.bio && (
            <p style={
              margin: "0.75rem 0",
              fontSize: "0.875rem",
              color: "#666",
              lineHeight: "1.5"
            }>
              {specialist.bio}
            </p>
          )}

          {specialist.certifications && specialist.certifications.length > 0 && (
            <div style={ margin: "0.75rem 0" }>
              <p style={
                margin: "0 0 0.5rem 0",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#100818",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }>
                Certifications
              </p>
              <ul style={
                margin: "0",
                paddingLeft: "1.25rem",
                fontSize: "0.875rem",
                color: "#666"
              }>
                {specialist.certifications.map((cert, idx) => (
                  <li key={idx} style={ marginBottom: "0.25rem" }>{cert}</li>
                ))}
              </ul>
            </div>
          )}

          {specialist.insurances && specialist.insurances.length > 0 && (
            <div style={ margin: "0.75rem 0" }>
              <p style={
                margin: "0 0 0.5rem 0",
                fontSize: "0.75rem",
                fontWeight: "600",
                color: "#100818",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }>
                Insurances Accepted
              </p>
              <p style={
                margin: "0",
                fontSize: "0.875rem",
                color: "#666"
              }>
                {specialist.insurances.join(", ")}
              </p>
            </div>
          )}

          {specialist.onsite && (
            <p style={
              margin: "0.75rem 0",
              fontSize: "0.875rem",
              color: "#27a745",
              fontWeight: "500"
            }>
              ✓ Onsite/Backstage availability
            </p>
          )}

          {specialist.website && (
            <p style={ margin: "0.75rem 0" }>
              <a href={specialist.website} target="_blank" rel="noopener noreferrer" style={
                fontSize: "0.875rem",
                color: "#9d4e6e",
                textDecoration: "none",
                fontWeight: "500"
              }>
                Visit Website →
              </a>
            </p>
          )}
        </div>
      )}
    </div>
  );
};

// ─── SHARED HEADER/NAV ───
const SharedNav = ({ currentPage, setCurrentPage }) => {
  const navItems = [
    { key: "directory", label: "Directory" },
    { key: "about", label: "About" },
    { key: "providers", label: "For Providers" },
    { key: "contact", label: "Contact" }
  ];

  return (
    <nav style={
      position: "sticky",
      top: "0",
      zIndex: "100",
      backgroundColor: "#fff",
      borderBottom: "1px solid #e0d5cc",
      padding: "1rem 2rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }>
      <div style={
        fontSize: "1.5rem",
        fontFamily: "'Cormorant Garamond', serif",
        fontWeight: "700",
        color: "#100818",
        cursor: "pointer"
      }
      onClick={() => setCurrentPage("directory")}
      >
        💃 Utah Dance Medicine
      </div>
      <div style={ display: "flex", gap: "2rem" }>
        {navItems.map(item => (
          <button
            key={item.key}
            onClick={() => setCurrentPage(item.key)}
            style={
              backgroundColor: "transparent",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              color: currentPage === item.key ? "#9d4e6e" : "#666",
              fontWeight: currentPage === item.key ? "600" : "400",
              borderBottom: currentPage === item.key ? "2px solid #9d4e6e" : "none",
              paddingBottom: currentPage === item.key ? "0.25rem" : "0.25rem",
              transition: "all 0.2s"
            }
            onMouseEnter={e => {
              if (currentPage !== item.key) {
                e.target.style.color = "#9d4e6e";
              }
            }}
            onMouseLeave={e => {
              if (currentPage !== item.key) {
                e.target.style.color = "#666";
              }
            }}
          >
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
};

// ─── SHARED FOOTER ───
const SharedFooter = ({ setCurrentPage }) => {
  return (
    <footer style={
      backgroundColor: "#100818",
      color: "#f9f7f4",
      padding: "3rem 2rem",
      marginTop: "4rem"
    }>
      <div style={
        maxWidth: "1200px",
        margin: "0 auto",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
        gap: "2rem",
        paddingBottom: "2rem",
        borderBottom: "1px solid rgba(157, 78, 110, 0.3)"
      }>
        <div>
          <h4 style={
            fontSize: "1.25rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 0.5rem 0",
            color: "#9d4e6e"
          }>
            💃 Utah Dance Medicine
          </h4>
          <p style={
            margin: "0.5rem 0 0 0",
            fontSize: "0.875rem",
            color: "#b8b0a8",
            lineHeight: "1.6"
          }>
            Connecting dancers with specialized healthcare providers across Utah.
          </p>
        </div>
        <div>
          <h5 style={
            fontSize: "0.875rem",
            fontWeight: "600",
            margin: "0 0 1rem 0",
            color: "#f9f7f4",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }>
            Navigation
          </h5>
          {["directory", "about", "providers", "contact"].map(page => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              style={
                display: "block",
                backgroundColor: "transparent",
                border: "none",
                color: "#b8b0a8",
                cursor: "pointer",
                marginBottom: "0.5rem",
                fontSize: "0.875rem",
                textAlign: "left",
                transition: "color 0.2s"
              }
              onMouseEnter={e => e.target.style.color = "#9d4e6e"}
              onMouseLeave={e => e.target.style.color = "#b8b0a8"}
            >
              {page.charAt(0).toUpperCase() + page.slice(1)}
            </button>
          ))}
        </div>
        <div>
          <h5 style={
            fontSize: "0.875rem",
            fontWeight: "600",
            margin: "0 0 1rem 0",
            color: "#f9f7f4",
            textTransform: "uppercase",
            letterSpacing: "0.05em"
          }>
            Contact
          </h5>
          <p style={
            margin: "0 0 0.5rem 0",
            fontSize: "0.875rem",
            color: "#b8b0a8"
          }>
            info@utahdancespecialists.com
          </p>
          <p style={
            margin: "0",
            fontSize: "0.875rem",
            color: "#b8b0a8"
          }>
            (801) 555-DANCE
          </p>
        </div>
      </div>
      <div style={
        marginTop: "2rem",
        textAlign: "center",
        fontSize: "0.75rem",
        color: "#8b7d75"
      }>
        <p style={ margin: "0" }>
          © 2026 Utah Dance Medicine. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

// ─── PAGE: DIRECTORY ───
const DirectoryPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState("");
  const [acceptingOnly, setAcceptingOnly] = useState(false);

  const filteredSpecialists = useMemo(() => {
    return specialists.filter(spec => {
      const matchesSearch = spec.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        spec.specialty.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty = !selectedSpecialty || spec.specialty === selectedSpecialty;
      const matchesAccepting = !acceptingOnly || spec.accepting;
      return matchesSearch && matchesSpecialty && matchesAccepting;
    });
  }, [searchTerm, selectedSpecialty, acceptingOnly]);

  const specialties = [...new Set(specialists.map(s => s.specialty))];

  return (
    <div style={ flex: "1" }>
      {/* HERO SECTION */}
      <div style={
        backgroundImage: `url('${HERO_IMAGE}')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        height: "400px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        textAlign: "center",
        position: "relative"
      }>
        <div style={
          position: "absolute",
          top: "0",
          left: "0",
          right: "0",
          bottom: "0",
          backgroundColor: "rgba(0,0,0,0.35)"
        }></div>
        <div style={ position: "relative", zIndex: "2" }>
          <h1 style={
            fontSize: "3.5rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 1rem 0",
            fontWeight: "700"
          }>
            Find Your Dance Medicine Specialist
          </h1>
          <p style={
            fontSize: "1.125rem",
            margin: "0",
            fontWeight: "300"
          }>
            Utah's most trusted resource for dancers seeking specialized healthcare
          </p>
        </div>
      </div>

      {/* SEARCH SECTION */}
      <div style={
        backgroundColor: "#f9f7f4",
        padding: "3rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }>
        <div style={ marginBottom: "2rem" }>
          <input
            type="text"
            placeholder="Search by name, title, or specialty..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={
              width: "100%",
              padding: "1rem",
              fontSize: "1rem",
              border: "2px solid #e0d5cc",
              borderRadius: "0.5rem",
              fontFamily: "'Inter', sans-serif",
              boxSizing: "border-box"
            }
          />
        </div>

        <div style={
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
          marginBottom: "2rem"
        }>
          <Dropdown
            label="Filter by Specialty"
            options={[
              { label: "All Specialties", value: "" },
              ...specialties.map(s => ({ label: s, value: s }))
            ]}
            value={selectedSpecialty}
            onChange={setSelectedSpecialty}
          />

          <div>
            <label style={
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              fontSize: "0.875rem",
              color: "#100818"
            }>
              <input
                type="checkbox"
                checked={acceptingOnly}
                onChange={e => setAcceptingOnly(e.target.checked)}
                style={
                  marginRight: "0.5rem",
                  cursor: "pointer",
                  width: "1rem",
                  height: "1rem"
                }
              />
              Accepting new patients only
            </label>
          </div>
        </div>

        <p style={
          fontSize: "0.875rem",
          color: "#666",
          marginBottom: "2rem"
        }>
          {filteredSpecialists.length} specialist{filteredSpecialists.length !== 1 ? "s" : ""} found
        </p>

        <div style={
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "2rem"
        }>
          {filteredSpecialists.map(specialist => (
            <SpecialistCard key={specialist.id} specialist={specialist} />
          ))}
        </div>

        {filteredSpecialists.length === 0 && (
          <div style={
            textAlign: "center",
            padding: "3rem 2rem",
            color: "#999"
          }>
            <p style={ fontSize: "1rem", margin: "0" }>
              No specialists found matching your criteria. Try adjusting your filters.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── PAGE: ABOUT ───
const AboutPage = () => {
  const missionCards = [
    {
      icon: "🩰",
      title: "Built for Dancers",
      description: "Designed around how dancers actually seek care"
    },
    {
      icon: "🏥",
      title: "Verified Specialists",
      description: "Every provider is vetted for dance-relevant experience"
    },
    {
      icon: "📍",
      title: "Utah-Focused",
      description: "Serving dancers from St. George to Logan"
    }
  ];

  const stats = [
    { number: "6+", label: "Specialists" },
    { number: "5", label: "Cities" },
    { number: "10+", label: "Insurances Accepted" },
    { number: "Statewide", label: "Coverage" }
  ];

  return (
    <div style={ flex: "1" }>
      {/* HERO SECTION */}
      <div style={
        background: "linear-gradient(135deg, #fdf2f6 0%, #f4f2fb 100%)",
        padding: "5rem 2rem",
        textAlign: "center"
      }>
        <h1 style={
          fontSize: "3rem",
          fontFamily: "'Cormorant Garamond', serif",
          margin: "0 0 1rem 0",
          color: "#100818",
          fontWeight: "700"
        }>
          Where Dance Meets Medicine
        </h1>
        <p style={
          fontSize: "1.25rem",
          color: "#666",
          margin: "0",
          maxWidth: "700px",
          marginLeft: "auto",
          marginRight: "auto"
        }>
          Utah's dedicated resource for dancers seeking specialized care
        </p>
      </div>

      {/* MISSION CARDS */}
      <div style={
        backgroundColor: "#f9f7f4",
        padding: "3rem 2rem",
        maxWidth: "1200px",
        margin: "0 auto"
      }>
        <div style={
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "2rem",
          marginBottom: "4rem"
        }>
          {missionCards.map((card, idx) => (
            <div key={idx} style={
              backgroundColor: "#fff",
              padding: "2rem",
              borderRadius: "0.5rem",
              border: "1px solid #e0d5cc",
              textAlign: "center"
            }>
              <div style={
                fontSize: "2.5rem",
                marginBottom: "1rem"
              }>
                {card.icon}
              </div>
              <h3 style={
                fontSize: "1.25rem",
                fontFamily: "'Cormorant Garamond', serif",
                margin: "0 0 0.5rem 0",
                color: "#100818",
                fontWeight: "600"
              }>
                {card.title}
              </h3>
              <p style={
                margin: "0",
                fontSize: "0.95rem",
                color: "#666",
                lineHeight: "1.6"
              }>
                {card.description}
              </p>
            </div>
          ))}
        </div>

        {/* OUR STORY */}
        <div style={ marginBottom: "4rem" }>
          <h2 style={
            fontSize: "2rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 1.5rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            Our Story
          </h2>
          <div style={
            maxWidth: "800px"
          }>
            <p style={
              fontSize: "1rem",
              lineHeight: "1.8",
              color: "#666",
              marginBottom: "1.5rem"
            }>
              Dance medicine is a specialized field that bridges the worlds of performing arts and healthcare. Dancers have unique biomechanical needs and face distinct injury patterns that general practitioners often don't understand. Yet finding a doctor or physical therapist who truly gets dance can be incredibly challenging, especially outside major metropolitan centers like New York or Los Angeles.
            </p>
            <p style={
              fontSize: "1rem",
              lineHeight: "1.8",
              color: "#666",
              marginBottom: "1.5rem"
            }>
              Utah has a vibrant dance community—from professional companies to thriving university programs and independent studios. But dancers here often struggle to find specialists who understand their art form and the physical demands they face. We created Utah Dance Medicine to bridge that gap.
            </p>
            <p style={
              fontSize: "1rem",
              lineHeight: "1.8",
              color: "#666"
            }>
              Our mission is to make quality dance medicine accessible across the state, ensuring that every dancer—whether they're a recreational student in Logan or a professional in Salt Lake City—can find the care they deserve from providers who truly understand their world.
            </p>
          </div>
        </div>

        {/* WHO WE SERVE */}
        <div style={ marginBottom: "4rem" }>
          <h2 style={
            fontSize: "2rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 1.5rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            Who We Serve
          </h2>
          <div style={
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem"
          }>
            {[
              { title: "Individual Dancers", description: "Students, pre-professional, professional, and recreational dancers seeking specialized care" },
              { title: "Dance Companies", description: "Professional and semi-professional companies accessing resources for their ensembles" },
              { title: "Studios & Schools", description: "Dance education institutions finding specialists for their students" },
              { title: "Performing Arts Organizations", description: "Theater companies, opera companies, and festivals with dance components" }
            ].map((item, idx) => (
              <div key={idx} style={
                backgroundColor: "#fff",
                padding: "1.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #e0d5cc"
              }>
                <h4 style={
                  fontSize: "1rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                  color: "#9d4e6e"
                }>
                  {item.title}
                </h4>
                <p style={
                  fontSize: "0.875rem",
                  color: "#666",
                  lineHeight: "1.6",
                  margin: "0"
                }>
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* STATS */}
        <div style={
          backgroundColor: "#fff",
          padding: "3rem 2rem",
          borderRadius: "0.5rem",
          border: "1px solid #e0d5cc"
        }>
          <div style={
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "2rem",
            textAlign: "center"
          }>
            {stats.map((stat, idx) => (
              <div key={idx}>
                <div style={
                  fontSize: "2.5rem",
                  fontFamily: "'Cormorant Garamond', serif",
                  fontWeight: "700",
                  color: "#9d4e6e",
                  marginBottom: "0.5rem"
                }>
                  {stat.number}
                </div>
                <p style={
                  fontSize: "0.875rem",
                  color: "#666",
                  margin: "0",
                  fontWeight: "500"
                }>
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── PAGE: FOR PROVIDERS ───
const ProvidersPage = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    credentials: "",
    practiceName: "",
    phone: "",
    email: "",
    locations: "",
    certifications: [],
    insurances: "",
    acceptingNewPatients: "yes",
    onsiteAvailable: "yes",
    bio: "",
    website: ""
  });

  const [formSubmitted, setFormSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCertificationChange = (cert) => {
    setFormData(prev => ({
      ...prev,
      certifications: prev.certifications.includes(cert)
        ? prev.certifications.filter(c => c !== cert)
        : [...prev.certifications, cert]
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormSubmitted(true);
    setTimeout(() => {
      setFormData({
        fullName: "",
        credentials: "",
        practiceName: "",
        phone: "",
        email: "",
        locations: "",
        certifications: [],
        insurances: "",
        acceptingNewPatients: "yes",
        onsiteAvailable: "yes",
        bio: "",
        website: ""
      });
      setFormSubmitted(false);
    }, 3000);
  };

  const benefits = [
    {
      icon: "👥",
      title: "Reach Dancers Directly",
      description: "Be found by dancers actively seeking specialized care"
    },
    {
      icon: "✅",
      title: "Build Your Reputation",
      description: "Position yourself as a dance medicine specialist in Utah"
    },
    {
      icon: "📊",
      title: "Stay Connected",
      description: "Keep your profile current and manage your availability"
    }
  ];

  const profileFields = [
    "Name & degrees",
    "Certifications",
    "Locations",
    "Insurances",
    "Contact method",
    "Accepting patients status",
    "Bio",
    "Website link",
    "Onsite/Backstage availability"
  ];

  const steps = [
    { number: 1, title: "Fill Out the Form", description: "Complete your profile information below" },
    { number: 2, title: "We Review Your Credentials", description: "Our team verifies your qualifications (5-7 days)" },
    { number: 3, title: "Your Profile Goes Live", description: "Start reaching dancers in Utah" }
  ];

  return (
    <div style={ flex: "1" }>
      {/* HEADER */}
      <div style={
        backgroundColor: "#f9f7f4",
        padding: "4rem 2rem",
        textAlign: "center"
      }>
        <h1 style={
          fontSize: "2.5rem",
          fontFamily: "'Cormorant Garamond', serif",
          margin: "0 0 1rem 0",
          color: "#100818",
          fontWeight: "700"
        }>
          Join the Directory
        </h1>
        <p style={
          fontSize: "1.125rem",
          color: "#666",
          margin: "0",
          maxWidth: "600px",
          marginLeft: "auto",
          marginRight: "auto"
        }>
          Connect with dancers seeking specialized care in Utah
        </p>
      </div>

      <div style={
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "3rem 2rem"
      }>
        {/* WHY GET LISTED */}
        <section style={ marginBottom: "4rem" }>
          <h2 style={
            fontSize: "2rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 2rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            Why Get Listed
          </h2>
          <div style={
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: "2rem"
          }>
            {benefits.map((benefit, idx) => (
              <div key={idx} style={
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "0.5rem",
                border: "1px solid #e0d5cc",
                textAlign: "center"
              }>
                <div style={ fontSize: "2.5rem", marginBottom: "1rem" }>
                  {benefit.icon}
                </div>
                <h3 style={
                  fontSize: "1.25rem",
                  fontFamily: "'Cormorant Garamond', serif",
                  margin: "0 0 0.5rem 0",
                  color: "#100818",
                  fontWeight: "600"
                }>
                  {benefit.title}
                </h3>
                <p style={
                  fontSize: "0.95rem",
                  color: "#666",
                  margin: "0",
                  lineHeight: "1.6"
                }>
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* PROFILE FIELDS */}
        <section style={ marginBottom: "4rem" }>
          <h2 style={
            fontSize: "2rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 2rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            What's Included in Your Profile
          </h2>
          <div style={
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "0.5rem",
            border: "1px solid #e0d5cc"
          }>
            <ul style={
              margin: "0",
              paddingLeft: "1.5rem",
              listStyle: "none"
            }>
              {profileFields.map((field, idx) => (
                <li key={idx} style={
                  padding: "0.75rem 0",
                  paddingLeft: "1.75rem",
                  position: "relative",
                  fontSize: "1rem",
                  color: "#666",
                  borderBottom: idx < profileFields.length - 1 ? "1px solid #f0f0f0" : "none"
                }>
                  <span style={
                    position: "absolute",
                    left: "0",
                    color: "#9d4e6e",
                    fontWeight: "600"
                  }>
                    ✓
                  </span>
                  {field}
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* HOW TO APPLY */}
        <section style={ marginBottom: "4rem" }>
          <h2 style={
            fontSize: "2rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 2rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            How to Apply
          </h2>
          <div style={
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "2rem"
          }>
            {steps.map((step) => (
              <div key={step.number} style={
                backgroundColor: "#fff",
                padding: "2rem",
                borderRadius: "0.5rem",
                border: "1px solid #e0d5cc"
              }>
                <div style={
                  width: "3rem",
                  height: "3rem",
                  backgroundColor: "#9d4e6e",
                  color: "#fff",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  marginBottom: "1rem",
                  fontFamily: "'Cormorant Garamond', serif"
                }>
                  {step.number}
                </div>
                <h3 style={
                  fontSize: "1.125rem",
                  fontWeight: "600",
                  margin: "0 0 0.5rem 0",
                  color: "#100818"
                }>
                  {step.title}
                </h3>
                <p style={
                  fontSize: "0.875rem",
                  color: "#666",
                  margin: "0",
                  lineHeight: "1.6"
                }>
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* APPLICATION FORM */}
        <section>
          <h2 style={
            fontSize: "2rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 2rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            Application Form
          </h2>

          {formSubmitted && (
            <div style={
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
              textAlign: "center",
              fontSize: "1rem"
            }>
              ✓ Thank you! We've received your application. We'll review your credentials and contact you within 5-7 days.
            </div>
          )}

          <form onSubmit={handleSubmit} style={
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "0.5rem",
            border: "1px solid #e0d5cc"
          }>
            <div style={
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem"
            }>
              <div>
                <label style={
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#100818"
                }>
                  Full Name *
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  style={
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5cc",
                    borderRadius: "0.375rem",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }
                />
              </div>

              <div>
                <label style={
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#100818"
                }>
                  Practice Name
                </label>
                <input
                  type="text"
                  name="practiceName"
                  value={formData.practiceName}
                  onChange={handleInputChange}
                  style={
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5cc",
                    borderRadius: "0.375rem",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }
                />
              </div>
            </div>

            <div style={
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem"
            }>
              <div>
                <label style={
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#100818"
                }>
                  Phone
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  style={
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5cc",
                    borderRadius: "0.375rem",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }
                />
              </div>

              <div>
                <label style={
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "0.5rem",
                  color: "#100818"
                }>
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  style={
                    width: "100%",
                    padding: "0.75rem",
                    border: "1px solid #e0d5cc",
                    borderRadius: "0.375rem",
                    fontSize: "1rem",
                    boxSizing: "border-box"
                  }
                />
              </div>
            </div>

            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Credentials/Degrees (e.g., PT, DPT, MD, MS)
              </label>
              <input
                type="text"
                name="credentials"
                value={formData.credentials}
                onChange={handleInputChange}
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }
              />
            </div>

            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Location(s) in Utah
              </label>
              <input
                type="text"
                name="locations"
                value={formData.locations}
                onChange={handleInputChange}
                placeholder="e.g., Salt Lake City, Provo"
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }
              />
            </div>

            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "1rem",
                color: "#100818"
              }>
                Certifications (select all that apply)
              </label>
              <div style={
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "1rem"
              }>
                {certificationOptions.map(cert => (
                  <label key={cert} style={
                    display: "flex",
                    alignItems: "center",
                    cursor: "pointer",
                    fontSize: "0.875rem"
                  }>
                    <input
                      type="checkbox"
                      checked={formData.certifications.includes(cert)}
                      onChange={() => handleCertificationChange(cert)}
                      style={
                        marginRight: "0.5rem",
                        cursor: "pointer",
                        width: "1rem",
                        height: "1rem"
                      }
                    />
                    {cert}
                  </label>
                ))}
              </div>
            </div>

            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Insurances Accepted
              </label>
              <input
                type="text"
                name="insurances"
                value={formData.insurances}
                onChange={handleInputChange}
                placeholder="e.g., UnitedHealthcare, Aetna, Blue Cross"
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }
              />
            </div>

            <div style={
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
              gap: "1.5rem",
              marginBottom: "1.5rem"
            }>
              <div>
                <label style={
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "0.75rem",
                  color: "#100818"
                }>
                  Accepting New Patients
                </label>
                <div style={ display: "flex", gap: "1rem" }>
                  <label style={ display: "flex", alignItems: "center", cursor: "pointer" }>
                    <input
                      type="radio"
                      name="acceptingNewPatients"
                      value="yes"
                      checked={formData.acceptingNewPatients === "yes"}
                      onChange={handleInputChange}
                      style={ marginRight: "0.5rem", cursor: "pointer" }
                    />
                    <span style={ fontSize: "0.875rem" }>Yes</span>
                  </label>
                  <label style={ display: "flex", alignItems: "center", cursor: "pointer" }>
                    <input
                      type="radio"
                      name="acceptingNewPatients"
                      value="no"
                      checked={formData.acceptingNewPatients === "no"}
                      onChange={handleInputChange}
                      style={ marginRight: "0.5rem", cursor: "pointer" }
                    />
                    <span style={ fontSize: "0.875rem" }>No</span>
                  </label>
                </div>
              </div>

              <div>
                <label style={
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "600",
                  marginBottom: "0.75rem",
                  color: "#100818"
                }>
                  Onsite/Backstage Available
                </label>
                <div style={ display: "flex", gap: "1rem" }>
                  <label style={ display: "flex", alignItems: "center", cursor: "pointer" }>
                    <input
                      type="radio"
                      name="onsiteAvailable"
                      value="yes"
                      checked={formData.onsiteAvailable === "yes"}
                      onChange={handleInputChange}
                      style={ marginRight: "0.5rem", cursor: "pointer" }
                    />
                    <span style={ fontSize: "0.875rem" }>Yes</span>
                  </label>
                  <label style={ display: "flex", alignItems: "center", cursor: "pointer" }>
                    <input
                      type="radio"
                      name="onsiteAvailable"
                      value="no"
                      checked={formData.onsiteAvailable === "no"}
                      onChange={handleInputChange}
                      style={ marginRight: "0.5rem", cursor: "pointer" }
                    />
                    <span style={ fontSize: "0.875rem" }>No</span>
                  </label>
                </div>
              </div>
            </div>

            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Professional Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell dancers about your experience and approach to care..."
                rows="4"
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: "border-box",
                  resize: "vertical"
                }
              />
            </div>

            <div style={ marginBottom: "2rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Website URL
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleInputChange}
                placeholder="https://example.com"
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }
              />
            </div>

            <button
              type="submit"
              style={
                width: "100%",
                padding: "1rem",
                backgroundColor: "#9d4e6e",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }
              onMouseEnter={e => e.target.style.backgroundColor = "#7a3a52"}
              onMouseLeave={e => e.target.style.backgroundColor = "#9d4e6e"}
            >
              Submit Application
            </button>
          </form>
        </section>
      </div>
    </div>
  );
};

// ─── PAGE: CONTACT ───
const ContactPage = ({ setCurrentPage }) => {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });

  const [contactSubmitted, setContactSubmitted] = useState(false);

  const handleContactChange = (e) => {
    const { name, value } = e.target;
    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleContactSubmit = (e) => {
    e.preventDefault();
    setContactSubmitted(true);
    setTimeout(() => {
      setContactForm({
        name: "",
        email: "",
        subject: "",
        message: ""
      });
      setContactSubmitted(false);
    }, 3000);
  };

  const subjects = [
    { label: "General Question", value: "general" },
    { label: "Provider Inquiry", value: "provider" },
    { label: "Partnership", value: "partnership" },
    { label: "Other", value: "other" }
  ];

  return (
    <div style={ flex: "1" }>
      {/* HEADER */}
      <div style={
        backgroundColor: "#f9f7f4",
        padding: "4rem 2rem",
        textAlign: "center"
      }>
        <h1 style={
          fontSize: "2.5rem",
          fontFamily: "'Cormorant Garamond', serif",
          margin: "0 0 1rem 0",
          color: "#100818",
          fontWeight: "700"
        }>
          Get in Touch
        </h1>
        <p style={
          fontSize: "1.125rem",
          color: "#666",
          margin: "0"
        }>
          We'd love to hear from you. Reach out with any questions or inquiries.
        </p>
      </div>

      <div style={
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "3rem 2rem",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "3rem"
      }>
        {/* CONTACT INFO */}
        <div>
          <h2 style={
            fontSize: "1.5rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 2rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            Contact Information
          </h2>

          {/* CONTACT CARDS */}
          <div style={ marginBottom: "2rem" }>
            <div style={
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #e0d5cc",
              marginBottom: "1.5rem"
            }>
              <h4 style={
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#100818",
                margin: "0 0 0.5rem 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }>
                General Inquiries
              </h4>
              <p style={
                margin: "0",
                fontSize: "1rem",
                color: "#9d4e6e",
                fontWeight: "500"
              }>
                info@utahdancespecialists.com
              </p>
            </div>

            <div style={
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #e0d5cc",
              marginBottom: "1.5rem"
            }>
              <h4 style={
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#100818",
                margin: "0 0 0.5rem 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }>
                Provider Relations
              </h4>
              <p style={
                margin: "0",
                fontSize: "1rem",
                color: "#9d4e6e",
                fontWeight: "500"
              }>
                providers@utahdancespecialists.com
              </p>
            </div>

            <div style={
              backgroundColor: "#fff",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #e0d5cc"
            }>
              <h4 style={
                fontSize: "0.875rem",
                fontWeight: "600",
                color: "#100818",
                margin: "0 0 0.5rem 0",
                textTransform: "uppercase",
                letterSpacing: "0.05em"
              }>
                Press & Partnerships
              </h4>
              <p style={
                margin: "0",
                fontSize: "1rem",
                color: "#9d4e6e",
                fontWeight: "500"
              }>
                press@utahdancespecialists.com
              </p>
            </div>
          </div>

          {/* CALLOUT BOX */}
          <div style={
            backgroundColor: "#fdf2f6",
            padding: "2rem",
            borderRadius: "0.5rem",
            border: "2px solid #9d4e6e",
            marginTop: "2rem"
          }>
            <h4 style={
              fontSize: "1rem",
              fontFamily: "'Cormorant Garamond', serif",
              margin: "0 0 1rem 0",
              color: "#100818",
              fontWeight: "600"
            }>
              For Dancers
            </h4>
            <p style={
              margin: "0 0 1rem 0",
              fontSize: "0.95rem",
              color: "#666",
              lineHeight: "1.6"
            }>
              Looking for a specialist? Use our directory search to find practitioners near you accepting new patients.
            </p>
            <button
              onClick={() => setCurrentPage("directory")}
              style={
                backgroundColor: "#9d4e6e",
                color: "#fff",
                border: "none",
                padding: "0.75rem 1.5rem",
                borderRadius: "0.375rem",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "600",
                transition: "background-color 0.2s"
              }
              onMouseEnter={e => e.target.style.backgroundColor = "#7a3a52"}
              onMouseLeave={e => e.target.style.backgroundColor = "#9d4e6e"}
            >
              View Directory
            </button>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div>
          <h2 style={
            fontSize: "1.5rem",
            fontFamily: "'Cormorant Garamond', serif",
            margin: "0 0 2rem 0",
            color: "#100818",
            fontWeight: "700"
          }>
            Send us a Message
          </h2>

          {contactSubmitted && (
            <div style={
              backgroundColor: "#d4edda",
              border: "1px solid #c3e6cb",
              color: "#155724",
              padding: "1.5rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
              textAlign: "center",
              fontSize: "0.95rem"
            }>
              ✓ Thank you for your message. We'll get back to you as soon as possible.
            </div>
          )}

          <form onSubmit={handleContactSubmit} style={
            backgroundColor: "#fff",
            padding: "2rem",
            borderRadius: "0.5rem",
            border: "1px solid #e0d5cc"
          }>
            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Name *
              </label>
              <input
                type="text"
                name="name"
                value={contactForm.name}
                onChange={handleContactChange}
                required
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }
              />
            </div>

            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={contactForm.email}
                onChange={handleContactChange}
                required
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  boxSizing: "border-box"
                }
              />
            </div>

            <div style={ marginBottom: "1.5rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Subject *
              </label>
              <select
                name="subject"
                value={contactForm.subject}
                onChange={handleContactChange}
                required
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  boxSizing: "border-box",
                  backgroundColor: "#fff",
                  cursor: "pointer"
                }
              >
                <option value="">Select a subject...</option>
                {subjects.map(subj => (
                  <option key={subj.value} value={subj.value}>
                    {subj.label}
                  </option>
                ))}
              </select>
            </div>

            <div style={ marginBottom: "2rem" }>
              <label style={
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "600",
                marginBottom: "0.5rem",
                color: "#100818"
              }>
                Message *
              </label>
              <textarea
                name="message"
                value={contactForm.message}
                onChange={handleContactChange}
                required
                rows="5"
                style={
                  width: "100%",
                  padding: "0.75rem",
                  border: "1px solid #e0d5cc",
                  borderRadius: "0.375rem",
                  fontSize: "1rem",
                  fontFamily: "'Inter', sans-serif",
                  boxSizing: "border-box",
                  resize: "vertical"
                }
              />
            </div>

            <button
              type="submit"
              style={
                width: "100%",
                padding: "1rem",
                backgroundColor: "#9d4e6e",
                color: "#fff",
                border: "none",
                borderRadius: "0.375rem",
                fontSize: "1rem",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s"
              }
              onMouseEnter={e => e.target.style.backgroundColor = "#7a3a52"}
              onMouseLeave={e => e.target.style.backgroundColor = "#9d4e6e"}
            >
              Send Message
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ───
export default function App() {
  const [currentPage, setCurrentPage] = useState("directory");

  const renderPage = () => {
    switch (currentPage) {
      case "directory":
        return <DirectoryPage />;
      case "about":
        return <AboutPage />;
      case "providers":
        return <ProvidersPage />;
      case "contact":
        return <ContactPage setCurrentPage={setCurrentPage} />;
      default:
        return <DirectoryPage />;
    }
  };

  return (
    <div style={
      display: "flex",
      flexDirection: "column",
      minHeight: "100vh",
      fontFamily: "'Inter', sans-serif",
      backgroundColor: "#f9f7f4"
    }>
      <SharedNav currentPage={currentPage} setCurrentPage={setCurrentPage} />
      {renderPage()}
      <SharedFooter setCurrentPage={setCurrentPage} />
    </div>
  );
}

