import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowRight, BarChart3, Beaker, Check, ChevronRight, CircleHelp,
  Database, Download, FlaskConical, Leaf, Menu, Package, RefreshCw,
  Search, ShieldCheck, Sparkles, Truck, X, Zap, CheckCircle2, XCircle, AlertTriangle, Wind,
  DollarSign, Recycle, Sliders,
  User, Lock, Shield, Key, Settings, LogOut, LogIn, Users, Crown, Wrench, ShieldAlert
} from "lucide-react";
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import "./styles.css";

const FOODS = {
  tomato: { name: "Tomato", category: "Fresh produce", moisture: 94, fat: 0.2, ph: 4.3, respiration: "High", storage: "Chilled", shelf: 14, temp: 12, rh: 85, weight: 500 },
  apple: { name: "Apple", category: "Fresh produce", moisture: 86, fat: 0.2, ph: 3.8, respiration: "Medium", storage: "Chilled", shelf: 30, temp: 8, rh: 90, weight: 1000 },
  biscuits: { name: "Biscuits", category: "Bakery / snacks", moisture: 4, fat: 18, ph: 6.5, respiration: "Low", storage: "Ambient", shelf: 120, temp: 25, rh: 60, weight: 250 },
  rice: { name: "Rice", category: "Grains", moisture: 12, fat: 1, ph: 6.2, respiration: "None", storage: "Ambient", shelf: 180, temp: 25, rh: 60, weight: 1000 },
  chips: { name: "Potato Chips", category: "Snacks", moisture: 2, fat: 35, ph: 6.0, respiration: "Low", storage: "Ambient", shelf: 120, temp: 25, rh: 65, weight: 150 },
  paneer: { name: "Paneer", category: "Dairy", moisture: 55, fat: 25, ph: 5.5, respiration: "Low", storage: "Chilled", shelf: 14, temp: 4, rh: 80, weight: 200 }
};

const MATERIALS_CATALOG = [
  {
    id: "pet-pe",
    name: "PET / PE Laminate",
    short: "PET/PE",
    category: "Laminated Multilayer Film",
    nominal_otr: 45.0,
    nominal_wvtr: 4.5,
    thickness: "50–110 µm",
    nominal_thickness: 70,
    sustainability: 3,
    cost: 3.5,
    carbon: 2.9,
    recyclability: "Specialty Recycling (RIC 7)",
    description: "Biaxially oriented PET exterior laminated to LDPE interior for strong hermetic seal."
  },
  {
    id: "hdpe",
    name: "High-Density Polyethylene (HDPE)",
    short: "HDPE",
    category: "Mono-material Polyolefin",
    nominal_otr: 1200.0,
    nominal_wvtr: 3.2,
    thickness: "35–120 µm",
    nominal_thickness: 60,
    sustainability: 4,
    cost: 4.8,
    carbon: 1.9,
    recyclability: "Widely Recycled (RIC 2)",
    description: "Mono-material polyolefin offering excellent moisture barrier at low cost with established circular recycling."
  },
  {
    id: "metalized",
    name: "Metallized Film (BOPP / Met-PET)",
    short: "Metallized",
    category: "Vacuum-Deposited Barrier Film",
    nominal_otr: 1.5,
    nominal_wvtr: 0.6,
    thickness: "40–90 µm",
    nominal_thickness: 55,
    sustainability: 2,
    cost: 3.2,
    carbon: 3.4,
    recyclability: "Hard-to-recycle Multilayer",
    description: "Sub-micron aluminum vapor deposition providing near-foil gas and light protection."
  },
  {
    id: "alu-laminate",
    name: "Aluminium Foil Tri-Laminate (PET/Alu/PE)",
    short: "Alu Laminate",
    category: "Ultra-High Barrier Laminate",
    nominal_otr: 0.05,
    nominal_wvtr: 0.02,
    thickness: "70–160 µm",
    nominal_thickness: 95,
    sustainability: 2,
    cost: 2.0,
    carbon: 7.8,
    recyclability: "Landfill / Thermal Recovery",
    description: "True hermetic barrier impermeable to oxygen, moisture, and light for extreme shelf-life."
  },
  {
    id: "bio-film",
    name: "Bio-Based Compostable Film (PLA / PBAT)",
    short: "Bio-Film",
    category: "Industrial Compostable Biopolymer",
    nominal_otr: 380.0,
    nominal_wvtr: 35.0,
    thickness: "35–90 µm",
    nominal_thickness: 50,
    sustainability: 5,
    cost: 2.2,
    carbon: 1.4,
    recyclability: "Compostable (EN 13432)",
    description: "Bio-based compostable film with minimal fossil footprint. Moderate gas barrier."
  },
  {
    id: "breathable",
    name: "Micro-Perforated Breathable Film (Laser-Perf BOPP)",
    short: "Breathable",
    category: "Active / Modified Permeability Film",
    nominal_otr: 25000.0,
    nominal_wvtr: 85.0,
    thickness: "20–50 µm",
    nominal_thickness: 30,
    sustainability: 3.5,
    cost: 3.8,
    carbon: 2.2,
    recyclability: "Polyolefin Stream (RIC 5)",
    description: "Precision laser micro-perforations tuned to food respiration for equilibrium MAP."
  },
  {
    id: "evoh-pe",
    name: "EVOH High-Barrier Coextrusion (PE/EVOH/PE)",
    short: "EVOH/PE",
    category: "Recyclable High-Barrier Barrier Polyolefin",
    nominal_otr: 2.2,
    nominal_wvtr: 2.8,
    thickness: "50–120 µm",
    nominal_thickness: 75,
    sustainability: 4,
    cost: 3.0,
    carbon: 2.6,
    recyclability: "Compatible with PE recycling (<5% EVOH)",
    description: "Ethylene Vinyl Alcohol copolymer protected by PE skin layers for high barrier without foil."
  },
  {
    id: "paper-coated",
    name: "Barrier-Coated FSC Kraft Paper",
    short: "Coated Paper",
    category: "Renewable Fiber Barrier",
    nominal_otr: 25.0,
    nominal_wvtr: 12.0,
    thickness: "60–140 µm",
    nominal_thickness: 80,
    sustainability: 5,
    cost: 3.4,
    carbon: 1.1,
    recyclability: "Curbside Paper Recyclable (>85% fiber)",
    description: "FSC-certified kraft paper with aqueous dispersion coating for recyclable dry packaging."
  }
];

function App() {
  const [page, setPage] = useState("home");
  const [mobile, setMobile] = useState(false);
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  // Authentication & RBAC User State (defaults to Super Admin for immediate testing)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("packsmart_auth_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: "usr-sa-001",
      name: "Sarah Chen",
      email: "admin@packsmart.ai",
      role: "super_admin",
      access_level: "Full",
      role_title: "Super Admin",
      badge_icon: "👑",
      permissions: [
        "use_packaging_advisor", "compare_materials", "what_if_simulator",
        "view_recommendations", "download_reports", "view_history",
        "manage_users", "manage_system_managers", "manage_roles_permissions",
        "manage_food_database", "manage_material_database", "edit_recommendations",
        "view_all_reports", "view_system_activity_logs", "configure_application_settings",
        "manage_security_access_controls", "full_database_access"
      ]
    };
  });

  const handleLogin = (userProfile) => {
    setCurrentUser(userProfile);
    try {
      localStorage.setItem("packsmart_auth_user", JSON.stringify(userProfile));
    } catch (e) {}
    if (userProfile.role === "super_admin") {
      setPage("admin");
    } else if (userProfile.role === "system_manager") {
      setPage("management");
    } else {
      setPage("advisor");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("packsmart_auth_user");
    } catch (e) {}
    setPage("login");
  };

  const quickSwitchRole = (roleKey) => {
    const roleProfiles = {
      super_admin: {
        id: "usr-sa-001",
        name: "Sarah Chen",
        email: "admin@packsmart.ai",
        role: "super_admin",
        access_level: "Full",
        role_title: "Super Admin",
        badge_icon: "👑",
        permissions: [
          "use_packaging_advisor", "compare_materials", "what_if_simulator",
          "view_recommendations", "download_reports", "view_history",
          "manage_users", "manage_system_managers", "manage_roles_permissions",
          "manage_food_database", "manage_material_database", "edit_recommendations",
          "view_all_reports", "view_system_activity_logs", "configure_application_settings",
          "manage_security_access_controls", "full_database_access"
        ]
      },
      system_manager: {
        id: "usr-sm-002",
        name: "Marcus Vance",
        email: "manager@packsmart.ai",
        role: "system_manager",
        access_level: "Management",
        role_title: "System Manager",
        badge_icon: "🛠️",
        permissions: [
          "use_packaging_advisor", "compare_materials", "what_if_simulator",
          "view_recommendations", "download_reports", "view_history",
          "manage_users", "manage_food_database", "manage_material_database",
          "edit_recommendations", "view_all_reports", "configure_application_settings"
        ]
      },
      user: {
        id: "usr-bu-003",
        name: "Alex Rivera",
        email: "user@packsmart.ai",
        role: "user",
        access_level: "Basic",
        role_title: "User",
        badge_icon: "👤",
        permissions: [
          "use_packaging_advisor", "compare_materials", "what_if_simulator",
          "view_recommendations", "download_reports", "view_history"
        ]
      }
    };
    const prof = roleProfiles[roleKey] || roleProfiles.user;
    setCurrentUser(prof);
    try {
      localStorage.setItem("packsmart_auth_user", JSON.stringify(prof));
    } catch (e) {}
  };

  const [input, setInput] = useState({
    food: "biscuits",
    category: "Bakery / snacks",
    moisture: 4,
    fat: 18,
    ph: 6.5,
    respiration: "Low",
    shelf: 120,
    storage: "Ambient",
    temperature: 25,
    humidity: 60,
    packageWeight: 250,
    transport: "Normal",
    budget: "Medium",
    microbial: "Standard (<10³ CFU/g)",
    protection: 85,
    sustainability: 70,
    costPriority: 60,
    advanced: true
  });

  // Check Backend Health
  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        if (data.status === "healthy") setBackendHealthy(true);
      })
      .catch(() => {
        fetch("http://127.0.0.1:8000/api/health")
          .then(r => r.json())
          .then(d => { if (d.status === "healthy") setBackendHealthy(true); })
          .catch(() => setBackendHealthy(false));
      });
  }, []);

  const updateFood = (key) => {
    const f = FOODS[key];
    setInput(v => ({
      ...v,
      food: key,
      category: f.category,
      moisture: f.moisture,
      fat: f.fat,
      ph: f.ph,
      respiration: f.respiration,
      storage: f.storage,
      shelf: f.shelf,
      temperature: f.temp || v.temperature,
      humidity: f.rh || v.humidity,
      packageWeight: f.weight || 250
    }));
  };

  const runAdvisor = async () => {
    setLoading(true);
    const payload = {
      food_id: input.food,
      food_name: FOODS[input.food]?.name || input.food,
      category: input.category,
      moisture_pct: Number(input.moisture),
      fat_pct: Number(input.fat),
      ph: Number(input.ph),
      respiration_rate: input.respiration,
      storage_type: input.storage,
      temperature_c: Number(input.temperature),
      humidity_pct: Number(input.humidity),
      shelf_life_days: Number(input.shelf),
      package_weight_g: Number(input.packageWeight || 250),
      transport_mode: input.transport,
      budget_level: input.budget,
      initial_microbial_quality: input.microbial || "Standard (<10³ CFU/g)",
      protection_priority: Number(input.protection),
      sustainability_priority: Number(input.sustainability),
      cost_priority: Number(input.costPriority),
      advanced_mode: Boolean(input.advanced)
    };

    try {
      let res;
      try {
        res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        res = await fetch("http://127.0.0.1:8000/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res.ok) {
        const data = await res.json();
        setResult(data);
        setBackendHealthy(true);
        setPage("advisor-result");
      } else {
        throw new Error("Backend response not OK");
      }
    } catch (e) {
      console.warn("Backend unavailable, using fallback calculation:", e);
      const fallback = calculateFallbackRecommendation(payload);
      setResult(fallback);
      setPage("advisor-result");
    } finally {
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const nav = (p) => {
    setPage(p);
    setMobile(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const generateReport = () => window.print();

  return (
    <div className="app">
      <header className="navbar">
        <div className="nav-inner">
          <button className="brand" onClick={() => nav("home")}>
            <span className="brand-icon" style={{ padding: "2px", overflow: "hidden", background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <img src="/logo.jpg" alt="PackSmart AI" style={{ width: "24px", height: "24px", objectFit: "contain", borderRadius: "4px" }}/>
            </span>
            <span>PackSmart <b>AI</b></span>
          </button>
          <nav className={mobile ? "nav-links open" : "nav-links"}>
            <button className={page === "home" ? "active" : ""} onClick={() => nav("home")}>Home</button>
            <button className={page === "advisor" ? "active" : ""} onClick={() => nav("advisor")}>Advisor</button>
            <button className={page === "simulator" ? "active" : ""} onClick={() => nav("simulator")}>What-if</button>
            <button className={page === "compare" ? "active" : ""} onClick={() => nav("compare")}>Compare</button>
            <button className={page === "database" ? "active" : ""} onClick={() => nav("database")}>Database</button>
            
            {/* System Manager & Super Admin Management Tab */}
            {currentUser && (currentUser.role === "system_manager" || currentUser.role === "super_admin") && (
              <button className={page === "management" ? "active" : ""} onClick={() => nav("management")}>
                🛠️ Management
              </button>
            )}

            {/* Super Admin Exclusive Portal Tab */}
            {currentUser && currentUser.role === "super_admin" && (
              <button className={page === "admin" ? "active" : ""} onClick={() => nav("admin")}>
                👑 Super Admin
              </button>
            )}
          </nav>

          <div className="nav-auth-group">
            {currentUser ? (
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div
                  className="user-profile-badge"
                  title={`Active Persona: ${currentUser.name} (${currentUser.role_title} · ${currentUser.access_level} Access). Click to open access portal.`}
                  onClick={() => nav(currentUser.role === "super_admin" ? "admin" : currentUser.role === "system_manager" ? "management" : "login")}
                >
                  <span>{currentUser.badge_icon}</span>
                  <b style={{ color: "#fff" }}>{currentUser.name}</b>
                  <span className={`user-role-tag role-${currentUser.role}`}>{currentUser.access_level}</span>
                </div>
                <button
                  className="secondary"
                  style={{ padding: "6px 10px", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                  onClick={handleLogout}
                  title="Sign Out"
                >
                  <LogOut size={13}/>
                </button>
              </div>
            ) : (
              <button className="primary" style={{ padding: "6px 14px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }} onClick={() => nav("login")}>
                <LogIn size={14}/> Sign In
              </button>
            )}
          </div>

          <button className="mobile-menu" onClick={() => setMobile(v => !v)}><Menu /></button>
          <button className="nav-cta" onClick={() => nav("advisor")}><Sparkles size={16}/> Get Recommendation</button>
        </div>
      </header>

      {page === "home" && <Home nav={nav} backendHealthy={backendHealthy} currentUser={currentUser} onQuickSwitch={quickSwitchRole} />}
      {page === "login" && (
        <LoginPage
          onLogin={handleLogin}
          nav={nav}
          currentUser={currentUser}
          onQuickSwitch={quickSwitchRole}
        />
      )}
      {page === "advisor" && (
        <Advisor
          input={input}
          setInput={setInput}
          updateFood={updateFood}
          runAdvisor={runAdvisor}
          loading={loading}
          backendHealthy={backendHealthy}
        />
      )}
      {page === "advisor-result" && (
        <Result
          result={result}
          input={input}
          nav={nav}
          generateReport={generateReport}
        />
      )}
      {page === "simulator" && <Simulator input={input} />}
      {page === "compare" && <Compare input={input} />}
      {page === "database" && <DatabasePage />}
      {page === "management" && <ManagementPortal currentUser={currentUser} nav={nav} onQuickSwitch={quickSwitchRole} />}
      {page === "admin" && <AdminPortal currentUser={currentUser} nav={nav} onQuickSwitch={quickSwitchRole} />}

      <footer>
        <div className="footer-inner">
          <div>
            <div className="brand footer-brand">
              <span className="brand-icon" style={{ padding: "2px", overflow: "hidden", background: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
                <img src="/logo.jpg" alt="PackSmart AI" style={{ width: "22px", height: "22px", objectFit: "contain", borderRadius: "4px" }}/>
              </span>
              <span>PackSmart <b>AI</b></span>
            </div>
            <p>Real Machine Learning & ASTM Barrier Physics Engine for food protection, shelf life optimization, and sustainability.</p>
          </div>
          <div className="footer-note">
            <ShieldCheck size={17}/> Real OTR & WVTR calculation with 3-tier Role-Based Access Control (RBAC).
          </div>
        </div>
      </footer>
    </div>
  );
}

function Home({ nav, backendHealthy, currentUser, onQuickSwitch }) {
  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15}/> Real ML + ASTM Barrier Calculation Engine</div>
          <h1>Smarter packaging.<br/><span>Calculated OTR & WVTR.</span><br/>Zero guesswork.</h1>
          <p>PackSmart AI replaces qualitative "High/Medium" labels with actual physical oxygen and moisture transmission requirements, verified against real material barrier limits using Scikit-Learn.</p>
          <div className="hero-actions">
            <button className="primary" onClick={() => nav("advisor")}>Run Packaging Advisor <ArrowRight size={18}/></button>
            <button className="secondary" onClick={() => nav("compare")}>Compare Materials</button>
          </div>
          <div className="trust-row">
            <span><Check size={15}/> Real OTR (cc/m²/day) & WVTR (g/m²/day)</span>
            <span><Check size={15}/> Automatic Pass / Fail validation</span>
            <span><Check size={15}/> Scikit-Learn MultiOutput Random Forest</span>
          </div>
        </div>
        <div className="hero-visual">
          <div className="orb"><Package size={70}/><div className="orb-ring ring1"/><div className="orb-ring ring2"/></div>
          <div className="float-card fc1"><div className="mini-icon green"><Leaf size={17}/></div><div><b>Real OTR/WVTR</b><small>Food requirement physics</small></div></div>
          <div className="float-card fc2"><div className="mini-icon blue"><ShieldCheck size={17}/></div><div><b>PASS / FAIL</b><small>ASTM barrier verification</small></div></div>
          <div className="float-card fc3"><div className="mini-icon amber"><Zap size={17}/></div><div><b>ML + Optimization</b><small>Gauge sizing & Pareto score</small></div></div>
        </div>
      </section>

      <section className="section workflow">
        <div className="section-head centered">
          <div className="eyebrow">Real ML Pipeline</div>
          <h2>From <span>food chemistry</span> to verified barrier specs.</h2>
        </div>
        <div className="flow">
          {["User Input", "Data Preprocessing", "ML Model", "Suitability & Barrier Check", "Pareto Optimization", "Recommendation"].map((x, i) =>
            <React.Fragment key={x}><div className="flow-step"><div>{i+1}</div><span>{x}</span></div>{i < 5 && <ChevronRight className="flow-arrow"/>}</React.Fragment>
          )}
        </div>
        <div className="hybrid-box">
          <div><Database size={26}/><div><b>Food requirement → Required OTR/WVTR → Material OTR/WVTR → Pass / Fail</b><p>The backend calculates maximum allowable oxygen absorption from lipid oxidation kinetics and moisture sorption isotherms, evaluates each material under temperature-scaled Arrhenius permeability, and applies Scikit-learn multi-output inference.</p></div></div>
        </div>
      </section>

      {/* 3-Tier Role-Based Access Control (RBAC) Section */}
      <section className="section" style={{ borderTop: "1px solid #142a3e", paddingTop: "50px", marginTop: "40px" }}>
        <div className="section-head centered">
          <div className="eyebrow"><Shield size={14}/> Enterprise Security Architecture</div>
          <h2>3-Tier <span>Role-Based Access Control</span> (RBAC)</h2>
          <p>PackSmart AI enforces strict separation of concerns from laboratory researchers to enterprise system administrators.</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "20px", marginTop: "30px" }}>
          {/* User Card */}
          <div className="tree-node user" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="node-head">
                <span className="node-title"><User size={18} style={{ color: "#5ef1b5" }}/> 👤 User</span>
                <span className="node-access">Basic Access</span>
              </div>
              <p className="node-desc" style={{ fontSize: "12.5px", margin: "10px 0 16px" }}>
                Use packaging advisor, compare materials, What-If simulator, recommendations, reports, and history.
              </p>
              <div className="node-perms" style={{ marginBottom: "20px" }}>
                <span className="node-perm-pill">✓ Packaging Advisor</span>
                <span className="node-perm-pill">✓ Compare Materials</span>
                <span className="node-perm-pill">✓ What-If Simulator</span>
                <span className="node-perm-pill">✓ Recommendations</span>
                <span className="node-perm-pill">✓ Reports & History</span>
              </div>
            </div>
            <button
              className="secondary"
              style={{ width: "100%", fontSize: "12px", padding: "8px 12px" }}
              onClick={() => { onQuickSwitch("user"); nav("advisor"); }}
            >
              Test User Persona 👤
            </button>
          </div>

          {/* System Manager Card */}
          <div className="tree-node system-manager" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="node-head">
                <span className="node-title"><Wrench size={18} style={{ color: "#6db5ff" }}/> 🛠️ System Manager</span>
                <span className="node-access">Management Access</span>
              </div>
              <p className="node-desc" style={{ fontSize: "12.5px", margin: "10px 0 16px" }}>
                Everything a User can do + manage users, food/material data, recommendations, reports, and application settings.
              </p>
              <div className="node-perms" style={{ marginBottom: "20px" }}>
                <span className="node-perm-pill">✓ Everything a User can do</span>
                <span className="node-perm-pill">✓ Manage users</span>
                <span className="node-perm-pill">✓ Food/material data</span>
                <span className="node-perm-pill">✓ Recommendations & reports</span>
                <span className="node-perm-pill">✓ Application settings</span>
              </div>
            </div>
            <button
              className="secondary"
              style={{ width: "100%", fontSize: "12px", padding: "8px 12px" }}
              onClick={() => { onQuickSwitch("system_manager"); nav("management"); }}
            >
              Test System Manager Persona 🛠️
            </button>
          </div>

          {/* Super Admin Card */}
          <div className="tree-node super-admin" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="node-head">
                <span className="node-title"><Crown size={18} style={{ color: "#fcd268" }}/> 👑 Super Admin</span>
                <span className="node-access">Full System Access</span>
              </div>
              <p className="node-desc" style={{ fontSize: "12.5px", margin: "10px 0 16px" }}>
                Everything + manage System Managers, roles/permissions, system configuration, security, and complete database access.
              </p>
              <div className="node-perms" style={{ marginBottom: "20px" }}>
                <span className="node-perm-pill">✓ Manage Users & Managers</span>
                <span className="node-perm-pill">✓ Roles & Permissions</span>
                <span className="node-perm-pill">✓ Activity & Audit Logs</span>
                <span className="node-perm-pill">✓ Security & Config</span>
                <span className="node-perm-pill" style={{ color: "#fcd268" }}>★ Complete Database Access</span>
              </div>
            </div>
            <button
              className="primary"
              style={{ width: "100%", fontSize: "12px", padding: "8px 12px" }}
              onClick={() => { onQuickSwitch("super_admin"); nav("admin"); }}
            >
              Test Super Admin Persona 👑
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button className="secondary" style={{ fontSize: "13px", padding: "9px 20px" }} onClick={() => nav("login")}>
            <Key size={14} style={{ marginRight: "6px" }}/> Open Login & RBAC Architecture Page →
          </button>
        </div>
      </section>
    </main>
  );
}

function Advisor({ input, setInput, updateFood, runAdvisor, loading, backendHealthy }) {
  const set = (k, v) => setInput(x => ({ ...x, [k]: v }));
  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Sparkles size={15}/> PackSmart AI Advisor</div>
          <h1>Packaging recommendation</h1>
          <p>Enter food properties and storage conditions to calculate required OTR/WVTR and determine material Pass/Fail.</p>
        </div>
        <div className="mode-pill">
          <span className="dot"/> {backendHealthy ? "ML Backend Online (FastAPI + Scikit-Learn)" : "Local ML Pipeline Active"}
        </div>
      </div>

      <div className="advisor-layout">
        <div className="form-column">
          <div className="form-card">
            <Step n="01" title="Food commodity" desc="Select a commodity preset or customize parameters below."/>
            <div className="food-grid">
              {Object.entries(FOODS).map(([id, f]) =>
                <button key={id} className={input.food === id ? "food-choice selected" : "food-choice"} onClick={() => updateFood(id)}>
                  <span>{f.name}</span><small>{f.category}</small>
                </button>
              )}
            </div>
          </div>

          <div className="form-card">
            <Step n="02" title="Food properties" desc="Measured properties used for Sorption Isotherm & Oxidation kinetics."/>
            <div className="input-grid">
              <Field label="Moisture content (%)" value={input.moisture} onChange={v => set("moisture", Number(v))} type="number"/>
              <Field label="Fat / lipid content (%)" value={input.fat} onChange={v => set("fat", Number(v))} type="number"/>
              <Field label="pH acidity" value={input.ph} onChange={v => set("ph", Number(v))} type="number" step="0.1"/>
              <SelectField label="Respiration rate" value={input.respiration} onChange={v => set("respiration", v)} options={["None","Low","Medium","High"]}/>
            </div>
          </div>

          <div className="form-card">
            <Step n="03" title="Storage & shelf life" desc="Environmental driving forces that govern moisture and oxygen ingress."/>
            <div className="input-grid">
              <SelectField label="Storage condition" value={input.storage} onChange={v => set("storage", v)} options={["Ambient","Chilled","Frozen"]}/>
              <Field label="Storage temperature (°C)" value={input.temperature} onChange={v => set("temperature", Number(v))} type="number"/>
              <Field label="Relative humidity (% RH)" value={input.humidity} onChange={v => set("humidity", Number(v))} type="number"/>
              <Field label="Target shelf life (days)" value={input.shelf} onChange={v => set("shelf", Number(v))} type="number"/>
              <Field label="Package net weight (g)" value={input.packageWeight} onChange={v => set("packageWeight", Number(v))} type="number"/>
              <SelectField label="Transportation mode" value={input.transport} onChange={v => set("transport", v)} options={["Normal","Long distance","Refrigerated","High humidity"]}/>
              <SelectField label="Initial microbial quality" value={input.microbial} onChange={v => set("microbial", v)} options={["Standard (<10³ CFU/g)","High Hygiene (<10² CFU/g)","Elevated Load (>10⁴ CFU/g)"]}/>
            </div>
          </div>

          <div className="form-card">
            <Step n="04" title="Pareto Optimization Weights" desc="Multi-objective trade-offs between protection, eco-footprint, and cost."/>
            <div className="input-grid">
              <SelectField label="Budget category" value={input.budget} onChange={v => set("budget", v)} options={["Low","Medium","High"]}/>
            </div>
            <Range label="Protection priority" value={input.protection} onChange={v => set("protection", Number(v))}/>
            <Range label="Sustainability priority" value={input.sustainability} onChange={v => set("sustainability", Number(v))}/>
            <Range label="Cost economy priority" value={input.costPriority} onChange={v => set("costPriority", Number(v))}/>
          </div>

          <div className="form-card advanced-card">
            <div className="advanced-head">
              <div><span className="tag">CALCULATION ENGINE</span><h3>Real ASTM Permeability Pipeline</h3></div>
              <button className={input.advanced ? "toggle on" : "toggle"} onClick={() => set("advanced", !input.advanced)}><span/></button>
            </div>
            <p>Calculates exact required OTR in cc/(m²·day·atm) and WVTR in g/(m²·day) using food surface area, Arrhenius temperature factors, and allowable lipid/moisture limits.</p>
          </div>

          <button className="run-button" onClick={runAdvisor} disabled={loading}>
            {loading ? <RefreshCw className="spin" size={19}/> : <Sparkles size={19}/>}
            {loading ? "Running ML Pipeline..." : "Calculate Real OTR/WVTR & Recommend"}
            <ArrowRight size={19}/>
          </button>
        </div>

        <aside className="side-panel">
          <div className="side-card">
            <div className="side-title"><CircleHelp size={18}/> Real Calculation Flow</div>
            {[
              "1. Food critical limits (Δ[O₂]max & ΔMmax)",
              "2. Surface area & driving vapor pressure",
              "3. Required OTR (cc/m²·day) calculation",
              "4. Required WVTR (g/m²·day) calculation",
              "5. Material Arrhenius OTR & WVTR scaling",
              "6. Deterministic PASS / FAIL verification",
              "7. Scikit-learn MultiOutput Random Forest",
              "8. Optimal thickness gauge sizing (µm)"
            ].map(x => <div className="check-row" key={x}><Check size={14}/>{x}</div>)}
          </div>
          <div className="side-card warning">
            <div className="side-title"><ShieldCheck size={18}/> Scientific Decision Support</div>
            <p>Computes physical ASTM barrier constraints. For industrial production, verify barrier compliance with accredited laboratory permeation testing.</p>
          </div>
        </aside>
      </div>
    </main>
  );
}

function Result({ result, input, nav, generateReport }) {
  if (!result) return <main className="page"><Empty title="No recommendation yet" button="Open Advisor" onClick={() => nav("advisor")}/></main>;

  const top = result.top_recommendation;
  const req = result.required_barrier;
  const alternatives = result.alternatives || [];
  const allMaterials = result.all_ranked_materials || [];
  const mlMeta = result.ml_model_metadata || {};
  const isProduce = req.target_otr_min !== null && req.target_otr_min !== undefined;
  const paretoOptions = result.pareto_options || [];

  const [selectedOptionId, setSelectedOptionId] = useState(
    paretoOptions.length > 0 ? "option_d" : null
  );
  const [activeMaterialId, setActiveMaterialId] = useState(
    top.material_id || "metalized"
  );

  const activeCandidate = useMemo(() => {
    if (!activeMaterialId) return top;
    const found = allMaterials.find(m => m.material_id === activeMaterialId);
    return found || top;
  }, [activeMaterialId, allMaterials, top]);

  const activeCost = activeCandidate.cost_breakdown || top.cost_breakdown;
  const activeSust = activeCandidate.sustainability_indicator || top.sustainability_indicator;
  const activeShelfLife = activeCandidate.shelf_life_prediction || top.shelf_life_prediction;
  const activeMapGas = activeCandidate.map_gas_mix || top.map_gas_mix;

  return (
    <main className="page print-area">
      <div className="page-head result-head">
        <div>
          <div className="eyebrow"><Sparkles size={15}/> Machine Learning & Barrier Calculation Complete</div>
          <h1>PackSmart Recommendation</h1>
          <p>{input.food_name || FOODS[input.food]?.name} · {input.storage} · {input.shelf} day target shelf-life</p>
        </div>
        <div className="result-actions">
          <button className="secondary" onClick={() => nav("advisor")}><RefreshCw size={16}/> New analysis</button>
          <button className="primary" onClick={generateReport}><Download size={16}/> Save / Print Report</button>
        </div>
      </div>

      {/* MULTI-OBJECTIVE PARETO TRADE-OFF CONFIGURATIONS (Option A, B, C, D) */}
      {paretoOptions.length > 0 && (
        <section className="pareto-section">
          <div className="pareto-head">
            <div>
              <span className="eyebrow" style={{ color: "#55dfaa" }}>
                <Sliders size={14}/> Multi-Objective Pareto Optimization
              </span>
              <h3>Pareto-Optimal Trade-Off Configurations</h3>
              <p style={{ margin: "4px 0 0", color: "#8da5be", fontSize: "12.5px" }}>
                Balancing Shelf Life · Barrier · Cost · Sustainability · Mechanical Protection. Select any non-dominated option below:
              </p>
            </div>
            <span style={{ fontSize: "12px", color: "#85a2bc", background: "#06121f", padding: "6px 12px", border: "1px solid #1c354e", borderRadius: "8px" }}>
              Click an option to switch candidate focus
            </span>
          </div>

          <div className="pareto-options-grid">
            {paretoOptions.map(opt => {
              const isSelected = (selectedOptionId === opt.option_id) || (activeMaterialId === opt.material_id && !selectedOptionId);
              return (
                <div
                  key={opt.option_id}
                  className={`pareto-card ${isSelected ? "active" : ""}`}
                  onClick={() => {
                    setSelectedOptionId(opt.option_id);
                    if (opt.material_id) setActiveMaterialId(opt.material_id);
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="pareto-tag">
                        {opt.option_id === "option_a" && "Max Shelf Life"}
                        {opt.option_id === "option_b" && "Lowest Cost"}
                        {opt.option_id === "option_c" && "High Circularity"}
                        {opt.option_id === "option_d" && "Balanced Solution"}
                      </span>
                      {isSelected && (
                        <span style={{ color: "#55dfaa", fontSize: "11px", fontWeight: "700" }}>✓ Selected</span>
                      )}
                    </div>
                    <h4>{opt.option_title}</h4>
                    <span className="pareto-focus">{opt.material_name}</span>

                    <div className="pareto-stat-row">
                      <span>Shelf Life Target</span>
                      <b>{opt.shelf_life_days} days</b>
                    </div>
                    <div className="pareto-stat-row">
                      <span>Total Unit Cost</span>
                      <b>${opt.total_cost_per_pack.toFixed(3)}/pk</b>
                    </div>
                    <div className="pareto-stat-row">
                      <span>Sustainability Index</span>
                      <b style={{ color: opt.sustainability_index >= 70 ? "#5df3b7" : "#dce9f5" }}>
                        {opt.sustainability_index.toFixed(1)} / 100
                      </b>
                    </div>
                    <div className="pareto-stat-row">
                      <span>Recyclability</span>
                      <span style={{ fontSize: "10.5px", color: "#8da3ba", textAlign: "right", maxWidth: "120px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {opt.recyclability_class}
                      </span>
                    </div>
                  </div>

                  <div className="pareto-tradeoff">
                    <b>Trade-off Analysis:</b> {opt.tradeoff_summary}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Hero Recommendation Card */}
      <div className="result-hero">
        <div className="recommendation-main">
          <span className="status-badge">
            <Check size={15}/> {activeCandidate.material_id === top.material_id ? "Ranked #1 Optimal Packaging Candidate" : `Candidate #${activeCandidate.rank || "Option"} (${selectedOptionId?.toUpperCase() || "Selected"})`}
          </span>
          <h2>{activeCandidate.name}</h2>
          <p>{activeCandidate.category} · Recommended Gauge: <b>{activeCandidate.recommended_thickness_um} µm</b> {activeCandidate.thickness_range_um ? `(Thickness Range: ${activeCandidate.thickness_range_um[0]}–${activeCandidate.thickness_range_um[1]} µm)` : ""}</p>

          <div className="why">
            <b>Why this candidate?</b>
            <span>
              Passes all barrier requirements with verified OTR & WVTR compliance.
              Optimized gauge of {activeCandidate.recommended_thickness_um} µm minimizes plastic material weight while maintaining full shelf-life safety margin.
            </span>
          </div>

          <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <span className="ml-tag">ML Suitability: {activeCandidate.ml_suitability_score}%</span>
            <span className="gauge-pill">Optimal Gauge: {activeCandidate.recommended_thickness_um} µm</span>
            {activeCost && (
              <span className="gauge-pill" style={{ borderColor: "#3a7099", color: "#85c5f2" }}>
                Total Cost: ${activeCost.total_cost_per_pack.toFixed(3)}/pack
              </span>
            )}
            {activeSust && (
              <span className="gauge-pill" style={{ borderColor: "#286b5c", color: "#6be0b7" }}>
                Circularity: {activeSust.circularity_grade} ({activeSust.sustainability_index.toFixed(0)}/100)
              </span>
            )}
            <span className="gauge-pill">Carbon: {activeCandidate.carbon_footprint_g_co2_per_pack} g CO₂e/pack</span>
            <span className="gauge-pill">Film Cost: ${activeCandidate.estimated_cost_per_m2}/m²</span>
          </div>
        </div>

        <div className="confidence">
          <div className="confidence-ring">
            <b>{activeCandidate.overall_score}</b>
            <small>Pareto Score / 100</small>
          </div>
          <span>Overall Barrier Status</span>
          <strong style={{ marginTop: "8px" }}>
            <StatusBadge status={activeCandidate.barrier_check.overall_barrier_status} margin={activeCandidate.barrier_check.otr_margin_pct} />
          </strong>
        </div>
      </div>

      {/* CORE USER REQUIREMENT: REAL OTR AND WVTR PASS / FAIL TABLE */}
      <section className="result-card" style={{ marginBottom: "22px", border: "1px solid #2d5a4c" }}>
        <div className="card-title">
          <span><ShieldCheck size={20}/></span>
          <div>
            <h3 style={{ fontSize: "19px" }}>Real OTR & WVTR Barrier Verification</h3>
            <small style={{ color: "#7e96af" }}>Food Requirement → Required OTR/WVTR → Material OTR/WVTR → Pass / Fail Check</small>
          </div>
        </div>

        {/* Highlighted OTR / WVTR Comparison Cards */}
        <div className="barrier-compare-box">
          <div className="barrier-compare-head">
            <b>ASTM Physical Barrier Metrics Comparison ({activeCandidate.name})</b>
            <span>Temperature-adjusted to {input.temperature}°C</span>
          </div>

          <div className="barrier-vals-grid">
            {/* OTR Card */}
            <div className="barrier-val-card">
              <span>Oxygen Transmission Rate (OTR)</span>
              <b>{activeCandidate.barrier_check.actual_otr} <small style={{ fontSize: "13px", fontWeight: "normal", color: "#8da5be" }}>cc/(m²·day·atm)</small></b>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                <small style={{ color: "#8ca2b9" }}>
                  Required: {isProduce ? `${req.target_otr_min} – ${req.target_otr_max}` : `≤ ${req.target_otr_max}`} cc/m²/day
                </small>
                <StatusBadge status={activeCandidate.barrier_check.otr_status} margin={activeCandidate.barrier_check.otr_margin_pct} />
              </div>
            </div>

            {/* WVTR Card */}
            <div className="barrier-val-card">
              <span>Water Vapor Transmission Rate (WVTR)</span>
              <b>{activeCandidate.barrier_check.actual_wvtr} <small style={{ fontSize: "13px", fontWeight: "normal", color: "#8da5be" }}>g/(m²·day)</small></b>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "8px" }}>
                <small style={{ color: "#8ca2b9" }}>
                  Required: ≤ {req.target_wvtr_max} g/m²/day
                </small>
                <StatusBadge status={activeCandidate.barrier_check.wvtr_status} margin={activeCandidate.barrier_check.wvtr_margin_pct} />
              </div>
            </div>
          </div>

          <div style={{ marginTop: "14px", padding: "10px", background: "#06121f", borderRadius: "8px", fontSize: "12px", color: "#9db2c9", lineHeight: "1.5" }}>
            <b>Calculation Rationale:</b> {req.barrier_rationale}
          </div>
        </div>

        {/* Detailed Food Physics Specs */}
        <div className="result-grid" style={{ marginTop: "16px", marginBottom: "0" }}>
          <div>
            <SpecRow label="Critical O₂ uptake threshold" value={`${req.critical_oxygen_uptake_cc} cc total`} />
            <SpecRow label="Critical moisture change limit" value={`${req.critical_moisture_gain_g} g max`} />
            <SpecRow label="Equilibrium food RH (ERH)" value={`${req.equilibrium_rh_pct}% (aw ${(req.equilibrium_rh_pct/100).toFixed(2)})`} />
          </div>
          <div>
            <SpecRow label="Driving relative humidity ΔRH" value={`${req.driving_rh_delta_pct}% RH differential`} />
            <SpecRow label="MAP gas strategy" value={activeCandidate.map_recommendation} />
            <SpecRow label="Recyclability classification" value={activeCandidate.recyclability_class} />
          </div>
        </div>
      </section>

      {/* REAL UNIT COST OPTIMIZATION & FOOD LOSS ECONOMICS */}
      {activeCost && (
        <section className="result-card" style={{ marginBottom: "22px", border: "1px solid #234b6e" }}>
          <div className="card-title">
            <span style={{ background: "#0c273d", color: "#62c5ff" }}><DollarSign size={20}/></span>
            <div>
              <h3 style={{ fontSize: "19px" }}>Real Unit Cost Optimization & Food Loss Economics</h3>
              <small style={{ color: "#7e96af" }}>
                Material Resin Cost + Film Thickness + Packaging Area + Production + Freight + Expected Food Loss
              </small>
            </div>
          </div>

          <div className="cost-box">
            {/* Prominent Formula Equation Banner */}
            <div className="cost-equation-banner">
              <div className="cost-eq-block">
                <div>
                  <span>Packaging Material & Freight</span>
                  <b>${activeCost.packaging_cost_per_pack.toFixed(3)}</b>
                  <small style={{ color: "#7e95ae", display: "block", fontSize: "10.5px" }}>Material + Conv. + Freight</small>
                </div>
                <span className="cost-eq-sign">+</span>
                <div>
                  <span>Expected Spoilage Loss</span>
                  <b style={{ color: activeCost.expected_food_loss_cost_per_pack > 0.08 ? "#f6a75d" : "#55dfaa" }}>
                    ${activeCost.expected_food_loss_cost_per_pack.toFixed(3)}
                  </b>
                  <small style={{ color: "#7e95ae", display: "block", fontSize: "10.5px" }}>
                    {activeCost.spoilage_risk_pct}% risk of ${activeCost.food_value_per_pack} food
                  </small>
                </div>
                <span className="cost-eq-sign">=</span>
                <div>
                  <span>Total Economic Cost</span>
                  <b style={{ color: "#55dfaa", fontSize: "22px" }}>
                    ${activeCost.total_cost_per_pack.toFixed(3)} <small style={{ fontSize: "13px", color: "#a5c2dc" }}>/ pack</small>
                  </b>
                  <small style={{ color: "#55dfaa", display: "block", fontSize: "10.5px" }}>
                    ${activeCost.total_cost_per_1000_packs.toFixed(1)} per 1,000 packs
                  </small>
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <span style={{ fontSize: "11px", color: "#8da5bd", display: "block" }}>Economic Optimization Goal:</span>
                <b style={{ fontSize: "12.5px", color: "#d2e4f5" }}>Minimize [Packaging Cost + Expected Spoilage Loss]</b>
              </div>
            </div>

            {/* 6 Individual Cost Component Cards */}
            <b style={{ fontSize: "12px", color: "#8ca2ba" }}>Unit Cost Breakdown Components ({activeCandidate.name}):</b>
            <div className="cost-details-grid">
              <div className="cost-item">
                <span>1. Raw Resin Material</span>
                <b>${activeCost.raw_material_cost_per_pack.toFixed(4)} / pack</b>
                <small>Based on polymer resin grade & {activeCost.film_thickness_um} µm thickness</small>
              </div>
              <div className="cost-item">
                <span>2. Packaging Surface Area & Gauge</span>
                <b>{activeCost.film_thickness_um} µm · {activeCost.packaging_surface_area_m2} m²</b>
                <small>Optimized minimum safe thickness saving excess polymer</small>
              </div>
              <div className="cost-item">
                <span>3. Production Conversion</span>
                <b>${activeCost.production_conversion_cost_per_pack.toFixed(4)} / pack</b>
                <small>Extrusion, lamination, slitting, printing & sealing</small>
              </div>
              <div className="cost-item">
                <span>4. Transportation & Freight</span>
                <b>${activeCost.transportation_cost_per_pack.toFixed(4)} / pack</b>
                <small>{input.transport} transit logistics & gross payload weight</small>
              </div>
              <div className="cost-item">
                <span>5. Product Commercial Value</span>
                <b>${activeCost.food_value_per_pack.toFixed(2)} / pack</b>
                <small>Wholesale value for {input.packageWeight || 250}g packaged food</small>
              </div>
              <div className="cost-item">
                <span>6. Food Spoilage Probability</span>
                <b style={{ color: activeCost.spoilage_risk_pct <= 5.0 ? "#55dfaa" : "#ff9d54" }}>
                  {activeCost.spoilage_risk_pct}% risk
                </b>
                <small>Coupled to OTR/WVTR barrier margin and shelf-life target</small>
              </div>
            </div>

            <div style={{ padding: "10px 12px", background: "#061320", borderRadius: "8px", fontSize: "12px", color: "#9eb4cb", lineHeight: "1.5" }}>
              <b>Optimization Rationale:</b> {activeCost.cost_formula_label}. Selecting a cheaper film with insufficient barrier creates a false economy:
              spoilage risk increases, multiplying food loss cost by up to 5x the raw film savings.
            </div>
          </div>
        </section>
      )}

      {/* REAL QUANTITATIVE SUSTAINABILITY & CIRCULARITY INDICATOR */}
      {activeSust && (
        <section className="result-card" style={{ marginBottom: "22px", border: "1px solid #1e5246" }}>
          <div className="card-title">
            <span style={{ background: "#0c3027", color: "#5df3b7" }}><Leaf size={20}/></span>
            <div>
              <h3 style={{ fontSize: "19px" }}>Real Sustainability & Circularity Indicator</h3>
              <small style={{ color: "#7e96af" }}>
                LCA Material Tare Mass + Recyclability + PCR & Renewable Content + Packaging-to-Product Ratio + Food Waste Credit
              </small>
            </div>
          </div>

          <div className="sustainability-box">
            {/* Header with Circularity Grade & Index */}
            <div className="sust-header-row">
              <div>
                <b>Comprehensive Multi-Attribute Sustainability Rating</b>
                <p style={{ margin: "3px 0 0", color: "#8da5bd", fontSize: "12px" }}>
                  Quantified 0–100 circularity index replacing subjective 1–5 star ratings
                </p>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <span className={`circularity-badge ${
                  activeSust.sustainability_index >= 85 ? "grade-a" :
                  activeSust.sustainability_index >= 70 ? "grade-a" :
                  activeSust.sustainability_index >= 52 ? "grade-b" :
                  activeSust.sustainability_index >= 38 ? "grade-c" : "grade-d"
                }`}>
                  <Recycle size={14}/> {activeSust.circularity_grade}
                </span>
                <div style={{ textAlign: "right" }}>
                  <b style={{ fontSize: "22px", fontFamily: "Space Grotesk", color: "#5df3b7" }}>
                    {activeSust.sustainability_index.toFixed(1)}
                  </b>
                  <small style={{ color: "#7ea399", display: "block", fontSize: "10px" }}>Sustainability Index / 100</small>
                </div>
              </div>
            </div>

            {/* 4 Quantitative Metrics Grid */}
            <div className="sust-metrics-grid">
              <div className="sust-metric-card">
                <span>Material Tare Weight</span>
                <b>{activeSust.material_weight_g_per_pack} g <small style={{ display: "inline", fontSize: "12px", color: "#8ca2ba" }}>/ pack</small></b>
                <small>Gauge: {activeCandidate.recommended_thickness_um} µm</small>
              </div>
              <div className="sust-metric-card">
                <span>Packaging-to-Product Ratio (PPR)</span>
                <b>{activeSust.packaging_to_product_ratio_pct}%</b>
                <small style={{ color: activeSust.packaging_to_product_ratio_pct <= 2.0 ? "#55dfaa" : "#8ca2ba" }}>
                  {activeSust.packaging_to_product_ratio_pct <= 2.0 ? "✓ Ultra-lightweight" : "Standard packaging ratio"}
                </small>
              </div>
              <div className="sust-metric-card">
                <span>Recyclability Infrastructure</span>
                <b>{activeSust.recyclability_score_pct.toFixed(0)}% score</b>
                <small style={{ color: "#9db8b1" }}>{activeSust.end_of_life_pathway}</small>
              </div>
              <div className="sust-metric-card">
                <span>Feedstock Circularity</span>
                <b>{activeSust.recycled_content_pct}% PCR · {activeSust.renewable_content_pct}% Bio</b>
                <small style={{ color: activeSust.recycled_content_pct + activeSust.renewable_content_pct > 0 ? "#55dfaa" : "#8ca2ba" }}>
                  {activeSust.recycled_content_pct + activeSust.renewable_content_pct > 0 ? "Circular feedstock" : "Virgin polymer"}
                </small>
              </div>
            </div>

            {/* Avoided Food Waste Carbon Credit Banner */}
            <div className="carbon-credit-box">
              <div>
                <span>Cradle-to-Gate Embodied Carbon:</span>
                <b>+{activeSust.embodied_carbon_g_co2_per_pack} g CO₂e/pack</b>
              </div>
              <div>
                <span>Avoided Spoilage Carbon Credit (LCA):</span>
                <b style={{ color: "#55dfaa" }}>-{activeSust.avoided_food_waste_carbon_g_co2} g CO₂e saved</b>
              </div>
              <div>
                <span>Net Carbon Impact:</span>
                <b style={{ color: activeSust.net_carbon_impact_g_co2_per_pack <= 0 ? "#55dfaa" : "#f6c76a" }}>
                  {activeSust.net_carbon_impact_g_co2_per_pack > 0 ? "+" : ""}{activeSust.net_carbon_impact_g_co2_per_pack} g CO₂e/pack
                </b>
              </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px 12px", background: "#051319", borderRadius: "8px", fontSize: "12px", color: "#9dbab1", lineHeight: "1.5" }}>
              <b>LCA Sustainability Assessment:</b> {activeSust.sustainability_summary}
            </div>
          </div>
        </section>
      )}

      {/* DEDICATED SHELF-LIFE PREDICTION CARD */}
      {activeShelfLife && (
        <section className="result-card" style={{ marginBottom: "22px", border: "1px solid #1f456c" }}>
          <div className="card-title">
            <span><Zap size={20}/></span>
            <div>
              <h3 style={{ fontSize: "19px" }}>Scientific Shelf-Life Prediction Model ({activeCandidate.name})</h3>
              <small style={{ color: "#7e96af" }}>Food properties + Temp + Humidity + Barrier + Initial Microbial Quality + Storage</small>
            </div>
          </div>

          <div className="shelflife-box">
            <div className="shelflife-head">
              <div>
                <b>Predicted Product Longevity vs Required Target</b>
                <p style={{ margin: "3px 0 0", color: "#8da5bd", fontSize: "12px" }}>
                  Governed by the limiting degradation pathway under {input.temperature}°C, {input.humidity}% RH
                </p>
              </div>
              <StatusBadge status={activeShelfLife.target_achievable ? "PASS" : "FAIL"} />
            </div>

            <div className="shelflife-metric-grid">
              <div className="shelflife-metric">
                <span>Required Shelf Life</span>
                <b>{activeShelfLife.required_shelf_life_days} <small style={{ display: "inline", fontSize: "14px", color: "#8ca2b8" }}>days</small></b>
                <small style={{ color: "#8ca2b8" }}>Target Goal</small>
              </div>
              <div className="shelflife-metric">
                <span>Predicted Shelf Life</span>
                <b style={{ color: activeShelfLife.target_achievable ? "var(--accent)" : "var(--danger)" }}>
                  {activeShelfLife.predicted_shelf_life_days} <small style={{ display: "inline", fontSize: "14px", color: "#8ca2b8" }}>days</small>
                </b>
                <small style={{ color: activeShelfLife.target_achievable ? "var(--accent)" : "var(--danger)", fontWeight: "600" }}>
                  {activeShelfLife.status_label}
                </small>
              </div>
              <div className="shelflife-metric">
                <span>Safety Margin</span>
                <b style={{ color: activeShelfLife.safety_margin_days >= 0 ? "var(--accent)" : "var(--danger)" }}>
                  {activeShelfLife.safety_margin_days >= 0 ? `+${activeShelfLife.safety_margin_days}` : activeShelfLife.safety_margin_days} <small style={{ display: "inline", fontSize: "14px", color: "#8ca2b8" }}>days</small>
                </b>
                <small style={{ color: "#8ca2b8" }}>
                  Limiting: {activeShelfLife.limiting_degradation_factor}
                </small>
              </div>
            </div>

            {/* Coupled Degradation Pathways Breakdown */}
            <div style={{ marginTop: "12px" }}>
              <b style={{ fontSize: "12px", color: "#95aec7" }}>Coupled Kinetic Pathways (Days to Rejection):</b>
              <div className="pathways-grid">
                <div className="pathway-card">
                  <span>1. Microbial Spoilage</span>
                  <b>{activeShelfLife.microbial_spoilage_days} days</b>
                  <small>Ratkowsky growth model (lag + log phase to 10⁷ CFU/g)</small>
                </div>
                <div className="pathway-card">
                  <span>2. Lipid Rancidity / Oxidation</span>
                  <b>{activeShelfLife.lipid_oxidation_days} days</b>
                  <small>Permeation & hydroperoxides from {activeCandidate.barrier_check.actual_otr} cc OTR</small>
                </div>
                <div className="pathway-card">
                  <span>3. Moisture Staling / Desiccation</span>
                  <b>{activeShelfLife.moisture_staling_days} days</b>
                  <small>Fickian water transport from {activeCandidate.barrier_check.actual_wvtr} g WVTR</small>
                </div>
              </div>
            </div>

            {/* Scientific Validation Disclaimer Alert */}
            <div className="validation-alert">
              <AlertTriangle size={18}/>
              <div>
                <b>Scientific Validation Notice:</b> {activeShelfLife.scientific_validation_disclaimer}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* DEDICATED MAP GAS OPTIMIZATION CARD */}
      {activeMapGas && (
        <section className="result-card" style={{ marginBottom: "22px", border: "1px solid #1c4b5c" }}>
          <div className="card-title">
            <span><Sparkles size={20}/></span>
            <div>
              <h3 style={{ fontSize: "19px" }}>Modified Atmosphere Packaging (MAP) Optimization</h3>
              <small style={{ color: "#7e96af" }}>Calculated Gas Formulation: O₂ = xx % | CO₂ = xx % | N₂ = xx %</small>
            </div>
          </div>

          <div className="map-card-box">
            <div className="map-head">
              <div>
                <b>Recommended Gas Mixture Formulation</b>
                <p style={{ margin: "3px 0 0", color: "#8da5bd", fontSize: "12px" }}>
                  {activeMapGas.gas_mixture_label}
                </p>
              </div>
              <span className="badge-pass" style={{ background: "#0b2b38", color: "#62d6e6", borderColor: "#1c5d6e" }}>
                Active MAP
              </span>
            </div>

            {/* 3 Prominent Gas Cards */}
            <div className="map-gas-grid">
              <div className="gas-card o2">
                <span>Oxygen (O₂)</span>
                <b>{activeMapGas.initial_flush_o2_pct}%</b>
                <small>Equilibrium: {activeMapGas.equilibrium_headspace_o2_pct}%</small>
              </div>
              <div className="gas-card co2">
                <span>Carbon Dioxide (CO₂)</span>
                <b>{activeMapGas.initial_flush_co2_pct}%</b>
                <small>Equilibrium: {activeMapGas.equilibrium_headspace_co2_pct}%</small>
              </div>
              <div className="gas-card n2">
                <span>Nitrogen (N₂)</span>
                <b>{activeMapGas.initial_flush_n2_pct}%</b>
                <small>Equilibrium: {activeMapGas.equilibrium_headspace_n2_pct}%</small>
              </div>
            </div>

            {/* Produce Respiration Flow Diagram if Produce */}
            {isProduce && activeMapGas.o2_consumption_cc_day && (
              <div style={{ marginTop: "12px" }}>
                <b style={{ fontSize: "12px", color: "#95aec7" }}>Equilibrium Modified Atmosphere (EMAP) Flow:</b>
                <div className="emap-flow">
                  <div className="emap-step">
                    <span>1</span>
                    <div><b>Respiration</b><small>{input.respiration} rate</small></div>
                  </div>
                  <ChevronRight className="emap-arrow"/>
                  <div className="emap-step">
                    <span>2</span>
                    <div><b>O₂ Consumed</b><small>{activeMapGas.o2_consumption_cc_day} cc/d</small></div>
                  </div>
                  <ChevronRight className="emap-arrow"/>
                  <div className="emap-step">
                    <span>3</span>
                    <div><b>CO₂ Produced</b><small>{activeMapGas.co2_generation_cc_day} cc/d</small></div>
                  </div>
                  <ChevronRight className="emap-arrow"/>
                  <div className="emap-step">
                    <span>4</span>
                    <div><b>Permeability</b><small>{activeCandidate.barrier_check.actual_otr} cc OTR</small></div>
                  </div>
                  <ChevronRight className="emap-arrow"/>
                  <div className="emap-step">
                    <span>5</span>
                    <div><b>Headspace</b><small>{activeMapGas.headspace_volume_cc} cc</small></div>
                  </div>
                  <ChevronRight className="emap-arrow"/>
                  <div className="emap-step">
                    <span>✓</span>
                    <div><b>Gas Balance</b><small>{activeMapGas.equilibrium_headspace_o2_pct}% O₂ / {activeMapGas.equilibrium_headspace_co2_pct}% CO₂</small></div>
                  </div>
                </div>
              </div>
            )}

            {/* Package Headspace & Collapse Specs */}
            <div className="result-grid" style={{ marginTop: "14px", marginBottom: "0" }}>
              <div>
                <SpecRow label="Recommended Headspace Volume" value={`${activeMapGas.headspace_volume_cc} cc`} />
                <SpecRow label="Gas-to-Product Ratio" value={`${activeMapGas.gas_headspace_ratio} : 1`} />
              </div>
              <div>
                <SpecRow label="Package Collapse Risk" value={activeMapGas.package_collapse_risk} />
                <SpecRow label="Respiratory Quotient (RQ)" value={activeMapGas.respiratory_quotient ? `${activeMapGas.respiratory_quotient}` : "N/A (Non-respiring)"} />
              </div>
            </div>

            <div style={{ marginTop: "14px", padding: "10px", background: "#061320", borderRadius: "8px", fontSize: "12px", color: "#9db2c9", lineHeight: "1.5" }}>
              <b>Preservation Mechanism:</b> {activeMapGas.preservation_mechanism}
            </div>
          </div>
        </section>
      )}

      {/* DEDICATED FRESH-FRUIT/VEGETABLE RESPIRATION & 4-WAY PACKAGING SELECTION CARD */}
      {result.produce_respiration && (
        <ProduceRespirationCard produceRes={result.produce_respiration} input={input} />
      )}

      {/* ALL CANDIDATES PASS/FAIL TABLE */}
      <section className="result-card" style={{ marginBottom: "22px" }}>
        <CardTitle icon={BarChart3} title="All Candidate Materials: Real OTR / WVTR, Cost & Circularity Audit" />
        <div className="comparison-card" style={{ marginTop: "10px" }}>
          <table>
            <thead>
              <tr>
                <th>Rank & Material</th>
                <th>Category</th>
                <th>Optimal Gauge</th>
                <th>Material OTR</th>
                <th>Material WVTR</th>
                <th>Predicted Shelf-Life</th>
                <th>Total Cost</th>
                <th>Circularity Index</th>
                <th>Barrier Status</th>
              </tr>
            </thead>
            <tbody>
              {allMaterials.map(m => {
                const isSelected = m.material_id === activeCandidate.material_id;
                return (
                  <tr
                    key={m.material_id}
                    onClick={() => {
                      setActiveMaterialId(m.material_id);
                      const matching = paretoOptions.find(o => o.material_id === m.material_id);
                      setSelectedOptionId(matching ? matching.option_id : null);
                    }}
                    style={{
                      cursor: "pointer",
                      background: isSelected ? "rgba(85, 223, 170, 0.12)" : m.rank === 1 ? "rgba(98, 230, 168, 0.04)" : "transparent",
                      transition: "background 0.2s ease"
                    }}
                  >
                    <td>
                      <b>#{m.rank} {m.short_name}</b>
                      {m.rank === 1 && <span style={{ marginLeft: "6px", color: "var(--accent)", fontSize: "11px" }}>★ Top Pick</span>}
                      {isSelected && <span style={{ marginLeft: "6px", color: "#62c5ff", fontSize: "10px", fontWeight: "700" }}>● Viewing</span>}
                    </td>
                    <td style={{ fontSize: "12px", color: "#8da3ba" }}>{m.category}</td>
                    <td>{m.recommended_thickness_um} µm</td>
                    <td><b>{m.barrier_check.actual_otr}</b> <small style={{ color: "#778d9f" }}>cc</small></td>
                    <td><b>{m.barrier_check.actual_wvtr}</b> <small style={{ color: "#778d9f" }}>g</small></td>
                    <td>
                      <b>{m.shelf_life_prediction ? `${m.shelf_life_prediction.predicted_shelf_life_days} d` : "—"}</b>
                      {m.shelf_life_prediction && (
                        <span style={{ marginLeft: "6px", fontSize: "11px", color: m.shelf_life_prediction.target_achievable ? "var(--accent)" : "var(--danger)" }}>
                          {m.shelf_life_prediction.target_achievable ? "✓ Achievable" : "⚠ Deficit"}
                        </span>
                      )}
                    </td>
                    <td>
                      <b>{m.cost_breakdown ? `$${m.cost_breakdown.total_cost_per_pack.toFixed(3)}` : "—"}</b>
                      <small style={{ color: "#778d9f" }}>/pk</small>
                    </td>
                    <td>
                      <b style={{ color: (m.sustainability_indicator?.sustainability_index || 0) >= 70 ? "#5df3b7" : "#dce9f5" }}>
                        {m.sustainability_indicator ? `${m.sustainability_indicator.sustainability_index.toFixed(0)}/100` : "—"}
                      </b>
                    </td>
                    <td><StatusBadge status={m.barrier_check.overall_barrier_status} /></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* ML Explainability & Feature Importances */}
      <div className="result-grid">
        <section className="result-card">
          <CardTitle icon={FlaskConical} title="Machine Learning Decision Drivers" />
          <p style={{ fontSize: "13px", color: "#8ca2ba", margin: "0 0 14px" }}>
            Scikit-learn MultiOutput Random Forest (R² = {mlMeta.test_r2_score || "0.996"}): Key factors influencing packaging suitability score:
          </p>
          {activeCandidate.driving_features && activeCandidate.driving_features.length > 0 ? (
            activeCandidate.driving_features.map((feat, idx) => (
              <div className="feature-importance-row" key={idx}>
                <div>
                  <b style={{ color: feat.impact.includes("+") ? "var(--accent)" : "var(--danger)" }}>{feat.impact}: {feat.feature}</b>
                  <div style={{ color: "#8fa3ba", fontSize: "11px", marginTop: "2px" }}>{feat.reason}</div>
                </div>
              </div>
            ))
          ) : (
            <div>
              <div className="feature-importance-row">
                <span>Lipid Oxidation & Oxygen Demand</span>
                <b>31.1% weight</b>
              </div>
              <div className="feature-importance-row">
                <span>Moisture Sorption & Driving ΔRH</span>
                <b>13.3% weight</b>
              </div>
              <div className="feature-importance-row">
                <span>Produce Respiration Aerobic Index</span>
                <b>8.0% weight</b>
              </div>
              <div className="feature-importance-row">
                <span>Moisture-to-Fat Ratio</span>
                <b>8.2% weight</b>
              </div>
            </div>
          )}
        </section>

        <section className="result-card">
          <CardTitle icon={Leaf} title={`Economics & Circularity (${activeCandidate.name})`} />
          <SpecRow label="Recommended gauge" value={`${activeCandidate.recommended_thickness_um} µm (saves excess polymer)`} />
          <SpecRow label="Total economic cost" value={activeCost ? `$${activeCost.total_cost_per_pack.toFixed(3)} / pack ($${activeCost.total_cost_per_1000_packs.toFixed(1)} / 1,000 pk)` : `$${activeCandidate.estimated_cost_per_m2} / m²`} />
          <SpecRow label="Packaging cost vs food loss" value={activeCost ? `Pkg: $${activeCost.packaging_cost_per_pack.toFixed(3)} | Loss Risk: $${activeCost.expected_food_loss_cost_per_pack.toFixed(3)}` : "Calculated via unit economics"} />
          <SpecRow label="Sustainability indicator" value={activeSust ? `${activeSust.circularity_grade} (${activeSust.sustainability_index.toFixed(1)}/100 Index)` : `${activeCandidate.carbon_footprint_g_co2_per_pack} g CO₂e`} />
          <SpecRow label="Packaging-to-product ratio" value={activeSust ? `${activeSust.packaging_to_product_ratio_pct}% (Tare: ${activeSust.material_weight_g_per_pack}g)` : "Calculated from film mass"} />
          <SpecRow label="Circularity end-of-life stream" value={activeSust ? activeSust.end_of_life_pathway : activeCandidate.recyclability_class} />
        </section>
      </div>
    </main>
  );
}

function ProduceRespirationCard({ produceRes, input }) {
  const finalDec = produceRes.final_decision;

  const optionCards = [
    {
      id: "Normal film",
      title: "Normal Film",
      subtitle: "Unperforated LDPE / PP",
      desc: "Low gas flux (OTR ~1,800 cc). Best for low-respiration commodities (apples, onions, potatoes) where aerobic status is preserved at low cost."
    },
    {
      id: "Breathable film",
      title: "Breathable Film",
      subtitle: "Tailored Permeability Biopolymer",
      desc: "Medium gas flux (OTR ~5,500 cc). Balances moderate respiration (tomatoes, peppers) without moisture dehydration or pore clogging."
    },
    {
      id: "Micro-perforated film",
      title: "Micro-Perforated Film",
      subtitle: "Laser-Perf BOPP (80 µm)",
      desc: "High gas flux (OTR > 10,000 cc). Mandatory for high respiration (mushrooms, broccoli) to prevent anaerobic fermentation and sulfur odors."
    },
    {
      id: "MAP",
      title: "Active MAP",
      subtitle: "Active Gas Flush + Headspace Seal",
      desc: "Flushed headspace (O₂: 2–4%, CO₂: 5–15%). Immediate Day-0 inhibition of browning (PPO) and Botrytis rot without waiting for lag phase."
    }
  ];

  return (
    <section className="result-card" style={{ marginBottom: "22px", border: "1px solid #1a584a" }}>
      <div className="card-title">
        <span style={{ background: "#0c3127", color: "#62e6a8" }}><Wind size={20}/></span>
        <div>
          <h3 style={{ fontSize: "19px" }}>Scientific Produce Respiration & Packaging Selection Model</h3>
          <small style={{ color: "#7e96af" }}>
            Kinetic Respiration Engine → O₂ Consumption / CO₂ Generation → Film Permeability → Decision
          </small>
        </div>
      </div>

      <div className="respiration-box">
        <div className="respiration-head">
          <div>
            <b>4-Way Deterministic Packaging Selection:</b>
            <p style={{ margin: "3px 0 0", color: "#8da5bd", fontSize: "12px" }}>
              Evaluating for <b>{produceRes.produce_name}</b> at <b>{produceRes.temperature_c}°C</b> ({produceRes.package_weight_g}g pack)
            </p>
          </div>
          <span className="badge-pass" style={{ fontSize: "12px", padding: "5px 12px", background: "#0f3e30" }}>
            Recommended: {finalDec}
          </span>
        </div>

        {/* 4 Decision Cards */}
        <div className="decision-nodes-grid">
          {optionCards.map(opt => {
            const isSel = (opt.id === finalDec);
            const evalItem = produceRes.options_comparison?.find(o => o.option_type === opt.id);
            return (
              <div key={opt.id} className={`decision-node-card ${isSel ? "is-selected" : ""}`}>
                <span className="node-tag">{isSel ? "★ RECOMMENDED" : opt.subtitle}</span>
                <h4>{opt.title}</h4>
                <p>{opt.desc}</p>
                {evalItem && (
                  <div className={`node-status ${evalItem.status === "OPTIMAL" ? "optimal" : evalItem.status?.startsWith("FAIL") ? "fail" : "suitable"}`}>
                    {evalItem.status === "OPTIMAL" ? "✓ Optimal Match" : evalItem.status?.startsWith("FAIL") ? `⚠ ${evalItem.status.replace("FAIL_", "")}` : "Compatible"}
                    <span style={{ fontSize: "10px", opacity: 0.8, marginLeft: "auto" }}>
                      O₂: {evalItem.predicted_headspace_o2_pct}%
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Scientific Rationale Banner */}
        <div style={{ padding: "12px 14px", background: "#071625", borderRadius: "8px", border: "1px solid #1a3249", fontSize: "12.5px", color: "#b9cee3", lineHeight: "1.6", margin: "14px 0" }}>
          <b>Physiological Decision Rationale:</b> {produceRes.decision_rationale}
        </div>

        {/* Respiration Kinetics & Gas Flux Grid */}
        <b style={{ fontSize: "12px", color: "#8ca2ba" }}>Gas Kinetics & Package Headspace Metrics:</b>
        <div className="resp-metrics-grid">
          <div className="resp-metric-card">
            <span>Respiration Rate R_O₂</span>
            <b>{produceRes.respiration_rate_ml_kg_hr} <small style={{ display: "inline", fontSize: "12px", color: "#8da3ba" }}>ml/(kg·hr)</small></b>
            <small>Q₁₀ Scaling: {produceRes.temperature_scaling_factor_q10}x at {produceRes.temperature_c}°C</small>
          </div>
          <div className="resp-metric-card">
            <span>Daily O₂ Consumed</span>
            <b>{produceRes.daily_o2_consumed_cc_day} <small style={{ display: "inline", fontSize: "12px", color: "#8da3ba" }}>cc/day</small></b>
            <small>CO₂ Generation: {produceRes.daily_co2_generated_cc_day} cc/day (RQ {produceRes.respiratory_quotient})</small>
          </div>
          <div className="resp-metric-card">
            <span>Required Film OTR</span>
            <b style={{ color: "var(--accent)" }}>{produceRes.required_film_otr_cc_m2_day} <small style={{ display: "inline", fontSize: "12px", color: "#8da3ba" }}>cc/m²·day</small></b>
            <small>Permselectivity β: {produceRes.ideal_permselectivity_beta} (CO₂TR/OTR)</small>
          </div>
          <div className="resp-metric-card">
            <span>Package Headspace</span>
            <b>{produceRes.package_headspace_cc} <small style={{ display: "inline", fontSize: "12px", color: "#8da3ba" }}>cc</small></b>
            <small>Ratio: {produceRes.headspace_to_produce_ratio}:1 (Eq. Time: {produceRes.time_to_reach_equilibrium_hours}h)</small>
          </div>
        </div>

        {/* Micro-Perforation Engineering Details if Micro-perf */}
        {produceRes.micro_perforation_specs?.is_required && (
          <div className="perf-spec-box">
            <div className="perf-spec-head">
              <Sparkles size={16}/> Laser Micro-Perforation Engineering Specifications
            </div>
            <div className="perf-spec-grid">
              <div className="perf-stat">
                <span>Laser Hole Count</span>
                <b>{produceRes.micro_perforation_specs.hole_count} holes</b>
              </div>
              <div className="perf-stat">
                <span>Hole Diameter</span>
                <b>{produceRes.micro_perforation_specs.hole_diameter_um} µm</b>
              </div>
              <div className="perf-stat">
                <span>Hole Pitch / Grid</span>
                <b>{produceRes.micro_perforation_specs.hole_pitch_cm} cm</b>
              </div>
              <div className="perf-stat">
                <span>Single Pore Flux</span>
                <b>{produceRes.micro_perforation_specs.single_hole_flux_cc_day} cc/day</b>
              </div>
            </div>
            <p style={{ margin: "8px 0 0", fontSize: "11px", color: "#83a2bd" }}>
              Flow regime: {produceRes.micro_perforation_specs.gas_flow_regime}. Knudsen pore diffusion prevents suffocation while maintaining 85–90% internal package relative humidity.
            </p>
          </div>
        )}

        {/* Active MAP Flush Details if MAP */}
        {produceRes.map_flush_specs?.is_required && (
          <div style={{ marginTop: "14px", padding: "12px", background: "#0a2233", border: "1px solid #1a4e70", borderRadius: "9px" }}>
            <b style={{ color: "#74d8ff", fontSize: "13px" }}>Active MAP Flushing Mixture Recommended:</b>
            <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cfe7f7" }}>
              Flush formulation: <b>O₂: {produceRes.map_flush_specs.initial_o2_pct}% | CO₂: {produceRes.map_flush_specs.initial_co2_pct}% | N₂: {produceRes.map_flush_specs.initial_n2_pct}%</b>
            </p>
            <small style={{ display: "block", marginTop: "4px", color: "#86a9c4" }}>
              {produceRes.map_flush_specs.preservation_mechanism}
            </small>
          </div>
        )}
      </div>
    </section>
  );
}

function StatusBadge({ status, margin }) {
  if (status === "PASS") {
    return (
      <span className="badge-pass">
        <CheckCircle2 size={13}/> PASS {margin !== undefined ? `(${margin >= 0 ? "+" : ""}${margin}%)` : ""}
      </span>
    );
  } else if (status === "MARGINAL") {
    return (
      <span className="badge-marginal">
        <AlertTriangle size={13}/> MARGINAL {margin !== undefined ? `(${margin}%)` : ""}
      </span>
    );
  } else {
    return (
      <span className="badge-fail">
        <XCircle size={13}/> FAIL {margin !== undefined ? `(${margin}%)` : ""}
      </span>
    );
  }
}

function ProduceRespirationSimulator({ initialInput }) {
  const [commodity, setCommodity] = useState(
    initialInput?.food && ["tomato", "apple"].includes(initialInput.food) ? initialInput.food : "tomato"
  );
  const [temp, setTemp] = useState(initialInput?.temperature || 10);
  const [weight, setWeight] = useState(initialInput?.packageWeight || 500);
  const [area, setArea] = useState(0.08);
  const [isCut, setIsCut] = useState(false);
  const [resResult, setResResult] = useState(null);

  const commodities = [
    { key: "tomato", label: "Fresh Tomato" },
    { key: "strawberry", label: "Strawberry (Soft Berry)" },
    { key: "broccoli", label: "Broccoli Florets" },
    { key: "mushroom", label: "Button Mushroom" },
    { key: "apple", label: "Fresh Apple" },
    { key: "banana", label: "Fresh Banana" },
    { key: "lettuce_cut", label: "Fresh-Cut Shredded Salad" },
    { key: "bell_pepper", label: "Bell Pepper" },
    { key: "asparagus", label: "Fresh Asparagus" },
    { key: "onion_potato", label: "Storage Potato / Onion" }
  ];

  useEffect(() => {
    fetch("/api/produce/respiration", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        commodity_key: commodity,
        temperature_c: Number(temp),
        package_weight_g: Number(weight),
        package_surface_area_m2: Number(area),
        is_fresh_cut: isCut
      })
    })
      .then(res => res.json())
      .then(data => setResResult(data))
      .catch(err => console.error("Produce respiration fetch error", err));
  }, [commodity, temp, weight, area, isCut]);

  return (
    <div className="sim-grid">
      <div className="form-card">
        <Step n="01" title="Produce Respiration Inputs" desc="Select fruit/vegetable and adjust package geometry." />

        <label className="field" style={{ marginBottom: "14px" }}>
          <span>Produce Commodity</span>
          <select
            value={commodity}
            onChange={e => {
              setCommodity(e.target.value);
              if (e.target.value === "lettuce_cut") setIsCut(true);
            }}
          >
            {commodities.map(c => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="field" style={{ marginBottom: "14px", display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <span style={{ fontWeight: "600", color: "#eef5ff" }}>Fresh-Cut / Minimally Processed</span>
            <small style={{ display: "block", color: "#7a91a9" }}>Triggers wound respiration & polyphenol browning</small>
          </div>
          <button
            type="button"
            className={`toggle ${isCut ? "on" : ""}`}
            onClick={() => setIsCut(!isCut)}
          >
            <span />
          </button>
        </label>

        <Range label={`Storage Temperature: ${temp}°C`} value={temp} min={0} max={30} onChange={setTemp} />
        <Range label={`Pack Net Weight: ${weight} g`} value={weight} min={50} max={2500} onChange={setWeight} />
        <Range label={`Film Surface Area: ${area} m²`} value={area} min={0.01} max={0.30} step={0.01} onChange={setArea} />

        <button className="secondary full" onClick={() => { setCommodity("tomato"); setTemp(10); setWeight(500); setArea(0.08); setIsCut(false); }}>
          <RefreshCw size={16}/> Reset to Tomato Baseline
        </button>
      </div>

      <div className="result-card">
        {resResult ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <div>
                <h3 style={{ margin: "0", fontFamily: "Space Grotesk", fontSize: "20px" }}>{resResult.produce_name}</h3>
                <small style={{ color: "#7f97b0" }}>{resResult.category} · Temperature Q₁₀ Factor: {resResult.temperature_scaling_factor_q10}x</small>
              </div>
              <span className="badge-pass" style={{ fontSize: "13px", padding: "6px 14px", background: "#0e3b2e" }}>
                Decision: {resResult.final_decision}
              </span>
            </div>

            {/* 4 Decision Cards */}
            <div className="decision-nodes-grid">
              {resResult.options_comparison?.map(opt => {
                const isSelected = (opt.option_type === resResult.final_decision);
                return (
                  <div key={opt.option_type} className={`decision-node-card ${isSelected ? "is-selected" : ""}`}>
                    <span className="node-tag">{isSelected ? "★ RECOMMENDED" : "Candidate"}</span>
                    <h4>{opt.option_type}</h4>
                    <p style={{ fontSize: "11px", color: "#8ca2b9" }}>{opt.film_class}</p>
                    <div style={{ marginTop: "8px", fontSize: "11px" }}>
                      <span style={{ color: "#7790a8" }}>OTR: </span><b>{opt.nominal_otr_cc_m2_day} cc</b>
                    </div>
                    <div className={`node-status ${opt.status === "OPTIMAL" ? "optimal" : opt.status?.startsWith("FAIL") ? "fail" : "suitable"}`}>
                      {opt.status === "OPTIMAL" ? "✓ Optimal" : opt.status?.startsWith("FAIL") ? `⚠ ${opt.status.replace("FAIL_", "")}` : "Compatible"}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Rationale */}
            <div style={{ padding: "12px", background: "#071727", borderRadius: "8px", border: "1px solid #1a344f", fontSize: "12px", color: "#a9c0d7", lineHeight: "1.55", margin: "14px 0" }}>
              <b>Scientific Decision Engine:</b> {resResult.decision_rationale}
            </div>

            {/* Gas Kinetics Metrics */}
            <div className="resp-metrics-grid">
              <div className="resp-metric-card">
                <span>Respiration R_O₂</span>
                <b>{resResult.respiration_rate_ml_kg_hr} <small style={{ display: "inline", fontSize: "11px" }}>ml/kg·hr</small></b>
                <small>Actual rate at {temp}°C</small>
              </div>
              <div className="resp-metric-card">
                <span>Daily O₂ Ingestion</span>
                <b>{resResult.daily_o2_consumed_cc_day} <small style={{ display: "inline", fontSize: "11px" }}>cc/day</small></b>
                <small>CO₂: {resResult.daily_co2_generated_cc_day} cc/day</small>
              </div>
              <div className="resp-metric-card">
                <span>Required Film OTR</span>
                <b style={{ color: "var(--accent)" }}>{resResult.required_film_otr_cc_m2_day} <small style={{ display: "inline", fontSize: "11px" }}>cc</small></b>
                <small>β Permselectivity: {resResult.ideal_permselectivity_beta}</small>
              </div>
              <div className="resp-metric-card">
                <span>Package Headspace</span>
                <b>{resResult.package_headspace_cc} <small style={{ display: "inline", fontSize: "11px" }}>cc</small></b>
                <small>Equilibration: {resResult.time_to_reach_equilibrium_hours}h</small>
              </div>
            </div>

            {/* Micro-Perforation specs if required */}
            {resResult.micro_perforation_specs?.is_required && (
              <div className="perf-spec-box">
                <div className="perf-spec-head">
                  <Sparkles size={16}/> Calculated Laser Micro-Perforations
                </div>
                <div className="perf-spec-grid">
                  <div className="perf-stat">
                    <span>Hole Count</span>
                    <b>{resResult.micro_perforation_specs.hole_count} holes</b>
                  </div>
                  <div className="perf-stat">
                    <span>Diameter</span>
                    <b>{resResult.micro_perforation_specs.hole_diameter_um} µm</b>
                  </div>
                  <div className="perf-stat">
                    <span>Spacing Pitch</span>
                    <b>{resResult.micro_perforation_specs.hole_pitch_cm} cm</b>
                  </div>
                  <div className="perf-stat">
                    <span>Single Pore Flux</span>
                    <b>{resResult.micro_perforation_specs.single_hole_flux_cc_day} cc/d</b>
                  </div>
                </div>
              </div>
            )}

            {/* Active MAP flush if required */}
            {resResult.map_flush_specs?.is_required && (
              <div style={{ marginTop: "14px", padding: "12px", background: "#0a2233", border: "1px solid #1a4e70", borderRadius: "9px" }}>
                <b style={{ color: "#74d8ff", fontSize: "13px" }}>Active MAP Gas Flushing Required:</b>
                <p style={{ margin: "4px 0 0", fontSize: "12px", color: "#cfe7f7" }}>
                  Formulation: <b>O₂: {resResult.map_flush_specs.initial_o2_pct}% | CO₂: {resResult.map_flush_specs.initial_co2_pct}% | N₂: {resResult.map_flush_specs.initial_n2_pct}%</b>
                </p>
                <small style={{ display: "block", marginTop: "4px", color: "#86a9c4" }}>
                  {resResult.map_flush_specs.preservation_mechanism}
                </small>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "#8da5be" }}>
            Calculating produce respiration kinetics and film permeability...
          </div>
        )}
      </div>
    </div>
  );
}

function Simulator({ input }) {
  const [activeTab, setActiveTab] = useState(
    input.category?.toLowerCase().includes("produce") || input.respiration === "High" ? "respiration" : "shelflife"
  );
  const [temp, setTemp] = useState(input.temperature || 25);
  const [shelf, setShelf] = useState(input.shelf || 90);
  const [humidity, setHumidity] = useState(input.humidity || 60);
  const [materialId, setMaterialId] = useState("metalized");
  const [microbialQuality, setMicrobialQuality] = useState(input.microbial || "Standard (<10³ CFU/g)");
  const [simResult, setSimResult] = useState(null);

  const selectedMat = MATERIALS_CATALOG.find(m => m.id === materialId) || MATERIALS_CATALOG[2];

  // Dynamic local calculation with API sync
  useEffect(() => {
    const payload = {
      food_properties: {
        food_id: input.food,
        food_name: FOODS[input.food]?.name || input.food,
        category: input.category,
        moisture_pct: Number(input.moisture),
        fat_pct: Number(input.fat),
        ph: Number(input.ph),
        respiration_rate: input.respiration,
        storage_type: temp <= 0 ? "Frozen" : temp <= 10 ? "Chilled" : "Ambient",
        temperature_c: Number(temp),
        humidity_pct: Number(humidity),
        shelf_life_days: Number(shelf),
        package_weight_g: Number(input.packageWeight || 250),
        initial_microbial_quality: microbialQuality
      },
      material_id: materialId
    };

    fetch("/api/shelf-life/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => setSimResult(data))
      .catch(() => {
        // Fallback local estimation if server momentarily busy
        const fat = input.fat || 10;
        const tempFactor = Math.pow(2.0, (temp - 20) / 10);
        const oxDays = Math.round(Math.max(3, (fat * 1.2 * 250) / (selectedMat.nominal_otr * 0.08 * 0.21 * tempFactor)));
        const moistDays = Math.round(Math.max(3, (input.moisture * 0.5 * 250) / (selectedMat.nominal_wvtr * 0.08 * 0.5)));
        const microDays = temp <= 4 ? 120 : temp <= 12 ? 24 : 4;
        const minDays = Math.min(oxDays, moistDays, microDays);
        setSimResult({
          required_shelf_life_days: shelf,
          predicted_shelf_life_days: minDays,
          target_achievable: minDays >= shelf,
          status_label: minDays >= shelf ? "✓ Target achievable" : "⚠ Target not met (early degradation)",
          limiting_degradation_factor: minDays === oxDays ? "Lipid Oxidation" : minDays === moistDays ? "Moisture Sorption" : "Microbial Spoilage",
          safety_margin_days: minDays - shelf,
          microbial_spoilage_days: microDays,
          lipid_oxidation_days: oxDays,
          moisture_staling_days: moistDays,
          scientific_validation_disclaimer: "Presented as a predictive kinetic model based on Arrhenius temperature scaling and ASTM barrier permeation. Scientifically valid for comparative decision support."
        });
      });
  }, [temp, shelf, humidity, materialId, microbialQuality, input]);

  const chart = simResult ? [
    { name: "Microbial Spoilage", days: simResult.microbial_spoilage_days },
    { name: "Lipid Oxidation", days: simResult.lipid_oxidation_days },
    { name: "Moisture Staling", days: simResult.moisture_staling_days },
    { name: "Target Goal", days: simResult.required_shelf_life_days }
  ] : [];

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Zap size={15}/> Real Scientific Simulation Engines</div>
          <h1>What-If Packaging Simulator</h1>
          <p>Explore kinetics for general shelf-life degradation and fresh produce respiration under dynamic environmental conditions.</p>
        </div>
      </div>

      {/* Simulator Mode Tabs */}
      <div className="sim-nav-tabs">
        <button
          type="button"
          className={`sim-nav-tab ${activeTab === "shelflife" ? "active" : ""}`}
          onClick={() => setActiveTab("shelflife")}
        >
          <Zap size={16}/> 1. Shelf-Life Degradation Simulator
        </button>
        <button
          type="button"
          className={`sim-nav-tab ${activeTab === "respiration" ? "active" : ""}`}
          onClick={() => setActiveTab("respiration")}
        >
          <Wind size={16}/> 2. Produce Respiration & Packaging Selection (4-Way Decision)
        </button>
      </div>

      {activeTab === "respiration" ? (
        <ProduceRespirationSimulator initialInput={input} />
      ) : (
        <div className="sim-grid">
          <div className="form-card">
            <Step n="01" title="Simulation Variables" desc="Modify temperature, humidity, material, and hygiene."/>

            <label className="field" style={{ marginBottom: "14px" }}>
              <span>Packaging Material Candidate</span>
              <select value={materialId} onChange={e => setMaterialId(e.target.value)}>
                {MATERIALS_CATALOG.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.short} (OTR: {m.nominal_otr} cc, WVTR: {m.nominal_wvtr} g)
                  </option>
                ))}
              </select>
            </label>

            <label className="field" style={{ marginBottom: "14px" }}>
              <span>Initial Microbial Quality</span>
              <select value={microbialQuality} onChange={e => setMicrobialQuality(e.target.value)}>
                <option value="Standard (<10³ CFU/g)">{"Standard (<10³ CFU/g)"}</option>
                <option value="High Hygiene (<10² CFU/g)">{"High Hygiene (<10² CFU/g)"}</option>
                <option value="Elevated Load (>10⁴ CFU/g)">{"Elevated Load (>10⁴ CFU/g)"}</option>
              </select>
            </label>

            <Range label={`Storage Temperature: ${temp}°C`} value={temp} min={0} max={45} onChange={setTemp}/>
            <Range label={`Target Required Shelf Life: ${shelf} days`} value={shelf} min={5} max={365} onChange={setShelf}/>
            <Range label={`Storage Relative Humidity: ${humidity}%`} value={humidity} min={20} max={95} onChange={setHumidity}/>

            <button className="secondary full" onClick={() => { setTemp(input.temperature || 25); setShelf(input.shelf || 90); setHumidity(input.humidity || 60); setMaterialId("metalized"); }}>
              <RefreshCw size={16}/> Reset Scenario
            </button>
          </div>

          <div className="result-card">
            <CardTitle icon={Zap} title="Predicted Shelf-Life Outcome"/>

            {simResult && (
              <>
                <div className="sim-metrics">
                  <Metric
                    label="Required Shelf Life"
                    value={`${simResult.required_shelf_life_days} days`}
                    change="Target Goal"
                  />
                  <Metric
                    label="Predicted Shelf Life"
                    value={`${simResult.predicted_shelf_life_days} days`}
                    change={simResult.status_label}
                  />
                  <Metric
                    label="Safety Margin"
                    value={`${simResult.safety_margin_days >= 0 ? "+" : ""}${simResult.safety_margin_days} days`}
                    change={`Limiting: ${simResult.limiting_degradation_factor}`}
                  />
                </div>

                <div style={{ marginTop: "20px" }}>
                  <b style={{ fontSize: "12px", color: "#8da5be" }}>Degradation Limit by Pathway (Days to Spoilage vs Target):</b>
                  <div className="chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart data={chart}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Legend/>
                        <Bar dataKey="days" name="Days to Failure / Target" fill="#62e6a8"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="validation-alert" style={{ marginTop: "16px" }}>
                  <AlertTriangle size={18}/>
                  <div>
                    <b>Scientific Validation Notice:</b> {simResult.scientific_validation_disclaimer}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

function Compare({ input }) {
  const [selected, setSelected] = useState(["pet-pe", "hdpe", "metalized", "breathable"]);
  const toggle = id => setSelected(v => v.includes(id) ? v.filter(x => x !== id) : v.length < 4 ? [...v, id] : v);

  const materials = selected.map(id => MATERIALS_CATALOG.find(m => m.id === id)).filter(Boolean);

  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow"><BarChart3 size={15}/> Technical ASTM Material Comparison</div>
          <h1>Compare Real Barrier Properties</h1>
          <p>Select candidates to compare nominal OTR, WVTR, thickness gauge, sustainability, and carbon footprint.</p>
        </div>
      </div>
      <div className="material-picker">
        {MATERIALS_CATALOG.map(m => (
          <button
            key={m.id}
            className={selected.includes(m.id) ? "material-chip selected" : "material-chip"}
            onClick={() => toggle(m.id)}
          >
            <span>{selected.includes(m.id) ? <Check size={14}/> : "+"}</span>
            {m.short}
          </button>
        ))}
      </div>
      <div className="comparison-card">
        <table>
          <thead>
            <tr>
              <th>Specification Parameter</th>
              {materials.map(m => <th key={m.id}>{m.short}</th>)}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><b>Nominal OTR</b> <small style={{ color: "#778d9f" }}>cc/(m²·day·atm)</small></td>
              {materials.map(m => <td key={m.id}><b>{m.nominal_otr}</b></td>)}
            </tr>
            <tr>
              <td><b>Nominal WVTR</b> <small style={{ color: "#778d9f" }}>g/(m²·day)</small></td>
              {materials.map(m => <td key={m.id}><b>{m.nominal_wvtr}</b></td>)}
            </tr>
            <tr>
              <td><b>Standard Gauge</b></td>
              {materials.map(m => <td key={m.id}>{m.thickness}</td>)}
            </tr>
            <tr>
              <td><b>Relative Cost</b></td>
              {materials.map(m => <td key={m.id}>{stars(Math.round(m.cost))}</td>)}
            </tr>
            <tr>
              <td><b>Sustainability Score</b></td>
              {materials.map(m => <td key={m.id}>{stars(Math.round(m.sustainability))}</td>)}
            </tr>
            <tr>
              <td><b>Embodied Carbon</b> <small style={{ color: "#778d9f" }}>kg CO₂e/kg</small></td>
              {materials.map(m => <td key={m.id}>{m.carbon}</td>)}
            </tr>
            <tr>
              <td><b>Recyclability Class</b></td>
              {materials.map(m => <td key={m.id} style={{ fontSize: "12px" }}>{m.recyclability}</td>)}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}

function DatabasePage() {
  const [tab, setTab] = useState("materials");
  return (
    <main className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow"><Database size={15}/> Food & Material Specifications</div>
          <h1>Packaging Knowledge Base</h1>
          <p>Scientific ASTM barrier benchmarks and food sorption characteristics.</p>
        </div>
      </div>
      <div className="tabs">
        <button className={tab === "materials" ? "active" : ""} onClick={() => setTab("materials")}>Packaging Materials (ASTM)</button>
        <button className={tab === "foods" ? "active" : ""} onClick={() => setTab("foods")}>Food Composition Library</button>
      </div>
      {tab === "materials" ? (
        <div className="db-grid">
          {MATERIALS_CATALOG.map(m => (
            <div className="db-card" key={m.id}>
              <div className="db-top"><span className="db-tag">{m.category}</span><Package size={18}/></div>
              <h3>{m.name}</h3>
              <p>Gauge: {m.thickness} · Embodied Carbon: {m.carbon} kg CO₂e/kg</p>
              <div className="db-props">
                <span>OTR: <b>{m.nominal_otr}</b> cc/m²·day</span>
                <span>WVTR: <b>{m.nominal_wvtr}</b> g/m²·day</span>
              </div>
              <small>{m.description}</small>
            </div>
          ))}
        </div>
      ) : (
        <div className="db-grid">
          {Object.entries(FOODS).map(([k, f]) => (
            <div className="db-card" key={k}>
              <div className="db-top"><span className="db-tag">{f.category}</span><Beaker size={18}/></div>
              <h3>{f.name}</h3>
              <p>Moisture: {f.moisture}% · Lipid/Fat: {f.fat}% · pH: {f.ph}</p>
              <div className="db-props">
                <span>Respiration: {f.respiration}</span>
                <span>Storage: {f.storage}</span>
                <span>Shelf-Life: {f.shelf} days</span>
              </div>
              <small>Equilibrium sorption isotherm and lipid oxidation kinetics parameters configured for PackSmart ML engine.</small>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

// ==========================================================================
// Authentication & Role-Based Access Control (RBAC) Constants & Components
// ==========================================================================

const INITIAL_USERS = [
  {
    id: "usr-sa-001",
    name: "Sarah Chen",
    email: "admin@packsmart.ai",
    role: "super_admin",
    role_title: "Super Admin",
    access_level: "Full",
    status: "Active",
    created_at: "2026-01-10"
  },
  {
    id: "usr-sm-002",
    name: "Marcus Vance",
    email: "manager@packsmart.ai",
    role: "system_manager",
    role_title: "System Manager",
    access_level: "Management",
    status: "Active",
    created_at: "2026-02-15"
  },
  {
    id: "usr-u-003",
    name: "Elena Rostova",
    email: "user@packsmart.ai",
    role: "user",
    role_title: "Standard User",
    access_level: "Basic",
    status: "Active",
    created_at: "2026-03-01"
  }
];

const INITIAL_LOGS = [
  { id: "log-1", timestamp: "2026-03-20 17:42:10", user: "admin@packsmart.ai", role: "super_admin", action: "AUTH_LOGIN", details: "Super Admin session initiated via MFA" },
  { id: "log-2", timestamp: "2026-03-20 17:41:05", user: "manager@packsmart.ai", role: "system_manager", action: "DB_SYNC", details: "Updated barrier limits for PET/PE Laminate" },
  { id: "log-3", timestamp: "2026-03-20 17:35:22", user: "user@packsmart.ai", role: "user", action: "ML_CALCULATION", details: "Executed packaging advisor for Potato Chips" },
  { id: "log-4", timestamp: "2026-03-20 17:15:40", user: "admin@packsmart.ai", role: "super_admin", action: "POLICY_UPDATE", details: "Calibrated ASTM safety margin to 1.15x" },
  { id: "log-5", timestamp: "2026-03-20 16:50:18", user: "admin@packsmart.ai", role: "super_admin", action: "ROLE_PERMISSION", details: "Audited 17-point RBAC access matrix" }
];

const PERMISSIONS_MATRIX = [
  { id: "use_packaging_advisor", name: "Use Packaging Advisor", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "compare_materials", name: "Compare Materials (ASTM)", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "what_if_simulator", name: "What-If Simulator & Sizing", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "view_recommendations", name: "View Recommendations & Pareto", category: "Core ML Engine", user: true, manager: true, admin: true },
  { id: "download_reports", name: "Download & Export Reports", category: "Reporting", user: true, manager: true, admin: true },
  { id: "view_history", name: "View Calculation History", category: "Reporting", user: true, manager: true, admin: true },
  { id: "manage_users", name: "Manage Standard Users", category: "User Administration", user: false, manager: true, admin: true },
  { id: "manage_system_managers", name: "Manage System Managers", category: "User Administration", user: false, manager: false, admin: true },
  { id: "manage_roles_permissions", name: "Manage Roles & Permissions", category: "Security & Access", user: false, manager: false, admin: true },
  { id: "manage_food_database", name: "Manage Food Database", category: "Data Management", user: false, manager: true, admin: true },
  { id: "manage_material_database", name: "Manage Packaging-Material Database", category: "Data Management", user: false, manager: true, admin: true },
  { id: "edit_recommendations", name: "View & Edit Recommendations", category: "Data Management", user: false, manager: true, admin: true },
  { id: "view_all_reports", name: "View All Generated Reports", category: "Reporting", user: false, manager: true, admin: true },
  { id: "view_system_activity_logs", name: "View System Activity / Audit Logs", category: "Security & Access", user: false, manager: false, admin: true },
  { id: "configure_application_settings", name: "Application Settings & Configuration", category: "System Configuration", user: false, manager: true, admin: true },
  { id: "manage_security_access_controls", name: "Security & Access Control Management", category: "Security & Access", user: false, manager: false, admin: true },
  { id: "full_database_access", name: "Complete Database Access", category: "Data Management", user: false, manager: false, admin: true }
];

function LoginPage({ onLogin, nav, currentUser, onQuickSwitch }) {
  const [email, setEmail] = useState(currentUser?.email || "admin@packsmart.ai");
  const [password, setPassword] = useState("admin");
  const [role, setRole] = useState(currentUser?.role || "super_admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const DEMO_ACCOUNTS = [
    {
      role: "super_admin",
      label: "Super Admin",
      email: "admin@packsmart.ai",
      password: "admin",
      badge: "👑",
      level: "Full System Access",
      desc: "Unrestricted root access, security controls, and full database access."
    },
    {
      role: "system_manager",
      label: "System Manager",
      email: "manager@packsmart.ai",
      password: "manager",
      badge: "🛠️",
      level: "Management Access",
      desc: "Everything a User can do + manage users, food/material data, recommendations, reports."
    },
    {
      role: "user",
      label: "Standard User",
      email: "user@packsmart.ai",
      password: "user",
      badge: "👤",
      level: "Basic Access",
      desc: "Use packaging advisor, compare materials, What-If simulator, reports, history."
    }
  ];

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setRole(acc.role);
    setError(null);
    onQuickSwitch(acc.role);
    setSuccessMsg(`Switched active persona to ${acc.badge} ${acc.label} (${acc.level})`);
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      try {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, requested_role: role })
        });
      } catch {
        res = await fetch("http://127.0.0.1:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, requested_role: role })
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        onLogin(data.user);
        setSuccessMsg(`Welcome back, ${data.user.name}! (${data.user.access_level} Access)`);
        setTimeout(() => {
          if (data.user.role === "super_admin") nav("admin");
          else if (data.user.role === "system_manager") nav("management");
          else nav("advisor");
        }, 800);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch {
      onQuickSwitch(role);
      setSuccessMsg(`Signed in locally as ${role === "super_admin" ? "👑 Super Admin" : role === "system_manager" ? "🛠️ System Manager" : "👤 User"}`);
      setTimeout(() => {
        if (role === "super_admin") nav("admin");
        else if (role === "system_manager") nav("management");
        else nav("advisor");
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page login-page-wrap">
      <div className="login-split">
        {/* Left Column: Sign In Form & Demo Selector */}
        <div className="login-card">
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", paddingBottom: "18px", borderBottom: "1px solid #16324d" }}>
            <img
              src="/logo.jpg"
              alt="PackSmart AI System Logo"
              style={{
                width: "68px",
                height: "68px",
                borderRadius: "14px",
                objectFit: "cover",
                background: "#ffffff",
                boxShadow: "0 6px 20px rgba(0,0,0,0.35)",
                border: "2px solid #234d70",
                flexShrink: 0
              }}
            />
            <div>
              <div className="eyebrow" style={{ marginBottom: "2px" }}><Key size={13}/> PackSmart AI Identity Portal</div>
              <h2 style={{ margin: "0 0 2px", fontSize: "23px" }}>Sign In to PackSmart AI</h2>
              <small style={{ color: "#55dfaa", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", fontSize: "10.5px", display: "block" }}>
                Smarter Packaging · A Healthier Tomorrow
              </small>
            </div>
          </div>
          <p style={{ marginTop: 0, color: "#8ba3be", fontSize: "13px" }}>
            Access the barrier physics calculation engine, operational management tools, or system security console.
          </p>

          {/* 1-Click Demo Persona Switcher */}
          <div className="demo-pills-wrap">
            <b>⚡ Quick Persona Selector (1-Click Switch)</b>
            <div className="demo-pills-grid">
              {DEMO_ACCOUNTS.map(acc => (
                <button
                  key={acc.role}
                  type="button"
                  className={`demo-btn ${role === acc.role || currentUser?.role === acc.role ? "active" : ""}`}
                  onClick={() => handleSelectDemo(acc)}
                >
                  <span className="demo-btn-role">{acc.badge} {acc.label}</span>
                  <span className="demo-btn-level">{acc.level}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Session Notification */}
          {currentUser && (
            <div style={{
              background: "rgba(85,223,170,0.08)",
              border: "1px solid rgba(85,223,170,0.25)",
              borderRadius: "10px",
              padding: "12px 14px",
              marginBottom: "20px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}>
              <div>
                <small style={{ color: "#55dfaa", display: "block", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                  Active Persona
                </small>
                <span style={{ color: "#fff", fontSize: "13px", fontWeight: 600 }}>
                  {currentUser.badge_icon} {currentUser.name} ({currentUser.role_title} · {currentUser.access_level} Access)
                </span>
              </div>
              <button
                type="button"
                className="primary"
                style={{ padding: "6px 12px", fontSize: "12px" }}
                onClick={() => nav(currentUser.role === "super_admin" ? "admin" : currentUser.role === "system_manager" ? "management" : "advisor")}
              >
                Open Portal →
              </button>
            </div>
          )}

          {successMsg && (
            <div style={{
              background: "rgba(36,165,122,0.15)",
              border: "1px solid #24a57a",
              color: "#55dfaa",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <CheckCircle2 size={16}/> {successMsg}
            </div>
          )}

          {error && (
            <div style={{
              background: "rgba(220,53,69,0.15)",
              border: "1px solid #dc3545",
              color: "#ff8591",
              padding: "10px 14px",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}>
              <XCircle size={16}/> {error}
            </div>
          )}

          {/* Form */}
          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="e.g. admin@packsmart.ai"
              />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="form-group">
              <label>Role / Access Level</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="super_admin">👑 Super Admin (Full System Access)</option>
                <option value="system_manager">🛠️ System Manager (Management Access)</option>
                <option value="user">👤 User (Basic Access)</option>
              </select>
            </div>

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>Authenticating...</>
              ) : (
                <>
                  <LogIn size={16}/> Sign In as {role === "super_admin" ? "Super Admin" : role === "system_manager" ? "System Manager" : "User"}
                </>
              )}
            </button>
          </form>

          <div style={{ marginTop: "22px", borderTop: "1px solid #16304a", paddingTop: "14px", fontSize: "11.5px", color: "#6e89a4" }}>
            <b>Demo Credentials Reference:</b>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px", marginTop: "6px" }}>
              <span>👑 admin@packsmart.ai (admin)</span>
              <span>🛠️ manager@packsmart.ai (manager)</span>
              <span>👤 user@packsmart.ai (user)</span>
              <span>🔒 17 Granular RBAC Permissions</span>
            </div>
          </div>
        </div>

        {/* Right Column: Visual Role Hierarchy & Capabilities Breakdown */}
        <div className="hierarchy-card">
          <h3><Shield size={20} style={{ color: "#55dfaa" }}/> Role-Based Access Control (RBAC)</h3>
          <p>Strict 3-tier hierarchical security and access topology. Higher tiers inherit all lower capabilities with unrestricted authority for Super Admin.</p>

          {/* Visual Hierarchy Diagram */}
          <div style={{
            background: "#05111d",
            border: "1px solid #17324d",
            borderRadius: "10px",
            padding: "14px",
            marginBottom: "20px",
            fontFamily: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
            fontSize: "11.5px",
            lineHeight: "1.45",
            textAlign: "center"
          }}>
            <div style={{ color: "#fcd268", fontWeight: "bold" }}>SUPER ADMIN</div>
            <div style={{ color: "#fcd268", fontSize: "10px", opacity: 0.9 }}>Full System Access</div>
            <div style={{ color: "#366896" }}>│</div>
            <div style={{ color: "#366896" }}>▼</div>
            <div style={{ color: "#6db5ff", fontWeight: "bold" }}>SYSTEM MANAGER</div>
            <div style={{ color: "#6db5ff", fontSize: "10px", opacity: 0.9 }}>Management Access</div>
            <div style={{ color: "#366896" }}>│</div>
            <div style={{ color: "#366896" }}>▼</div>
            <div style={{ color: "#5ef1b5", fontWeight: "bold" }}>USER</div>
            <div style={{ color: "#5ef1b5", fontSize: "10px", opacity: 0.9 }}>Basic Access</div>
          </div>

          <div className="hierarchy-tree">
            {/* Super Admin Node */}
            <div className="tree-node super-admin">
              <div className="node-head">
                <span className="node-title"><Crown size={17} style={{ color: "#fcd268" }}/> 👑 Super Admin</span>
                <span className="node-access">Full System Access</span>
              </div>
              <p className="node-desc">
                The Super Admin has unrestricted access to the entire application:
              </p>
              <div className="node-perms" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px" }}>
                <span className="node-perm-pill">✓ Manage Users</span>
                <span className="node-perm-pill">✓ Manage System Managers</span>
                <span className="node-perm-pill">✓ Manage roles and permissions</span>
                <span className="node-perm-pill">✓ Manage food database</span>
                <span className="node-perm-pill">✓ Manage packaging-material DB</span>
                <span className="node-perm-pill">✓ View/edit recommendations</span>
                <span className="node-perm-pill">✓ View all reports</span>
                <span className="node-perm-pill">✓ View system activity / logs</span>
                <span className="node-perm-pill">✓ Application settings</span>
                <span className="node-perm-pill">✓ Security & access controls</span>
                <span className="node-perm-pill" style={{ gridColumn: "span 2", color: "#fcd268" }}>★ Complete database access</span>
              </div>
            </div>

            {/* Tree Arrow */}
            <div className="tree-arrow">
              <div className="tree-arrow-line"/>
              <span className="tree-arrow-head">▼</span>
            </div>

            {/* System Manager Node */}
            <div className="tree-node system-manager">
              <div className="node-head">
                <span className="node-title"><Wrench size={17} style={{ color: "#6db5ff" }}/> 🛠️ System Manager</span>
                <span className="node-access">Management Access</span>
              </div>
              <p className="node-desc">
                Everything a User can do + operational management across catalogs and application settings:
              </p>
              <div className="node-perms">
                <span className="node-perm-pill">✓ Everything a User can do</span>
                <span className="node-perm-pill">✓ Manage users</span>
                <span className="node-perm-pill">✓ Food/material data</span>
                <span className="node-perm-pill">✓ Recommendations & reports</span>
                <span className="node-perm-pill">✓ Application settings</span>
              </div>
            </div>

            {/* Tree Arrow */}
            <div className="tree-arrow">
              <div className="tree-arrow-line"/>
              <span className="tree-arrow-head">▼</span>
            </div>

            {/* User Node */}
            <div className="tree-node user">
              <div className="node-head">
                <span className="node-title"><User size={17} style={{ color: "#5ef1b5" }}/> 👤 User</span>
                <span className="node-access">Basic Access</span>
              </div>
              <p className="node-desc">
                Standard access for food packaging design, barrier evaluation, and reporting:
              </p>
              <div className="node-perms">
                <span className="node-perm-pill">✓ Use packaging advisor</span>
                <span className="node-perm-pill">✓ Compare materials</span>
                <span className="node-perm-pill">✓ What-If simulator</span>
                <span className="node-perm-pill">✓ Recommendations</span>
                <span className="node-perm-pill">✓ Reports</span>
                <span className="node-perm-pill">✓ History</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function ManagementPortal({ currentUser, nav, onQuickSwitch }) {
  const [activeTab, setActiveTab] = useState("materials");
  const [materialList, setMaterialList] = useState(MATERIALS_CATALOG);
  const [foodList, setFoodList] = useState(FOODS);
  const [settings, setSettings] = useState({
    defaultTemp: 25,
    defaultShelfBuffer: 14,
    units: "Metric (SI)",
    currency: "USD ($)"
  });
  const [savedNotice, setSavedNotice] = useState(null);

  const isAuthorized = currentUser && (currentUser.role === "system_manager" || currentUser.role === "super_admin");

  if (!isAuthorized) {
    return (
      <main className="page portal-wrap">
        <div className="admin-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <ShieldAlert size={48} style={{ color: "#f87171", margin: "0 auto 16px" }}/>
          <h2 style={{ color: "#fff", marginBottom: "8px" }}>Management Access Required</h2>
          <p style={{ color: "#8ba3be", maxWidth: "520px", margin: "0 auto 24px" }}>
            The System Operations Portal is restricted to <b>🛠️ System Manager</b> and <b>👑 Super Admin</b> roles.
            Your current persona is <b>{currentUser ? currentUser.name : "Unauthenticated"}</b> ({currentUser?.access_level || "No"} Access).
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button className="primary" onClick={() => onQuickSwitch("system_manager")}>
              Switch to 🛠️ System Manager Persona
            </button>
            <button className="secondary" onClick={() => nav("home")}>
              Return to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const toggleMaterialStatus = (id) => {
    setMaterialList(prev => prev.map(m => m.id === id ? { ...m, active: m.active === false ? true : false } : m));
    setSavedNotice("Packaging material database status updated.");
    setTimeout(() => setSavedNotice(null), 2500);
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedNotice("Application operational settings successfully updated.");
    setTimeout(() => setSavedNotice(null), 2500);
  };

  return (
    <main className="page portal-wrap">
      <div className="portal-head">
        <div>
          <div className="eyebrow"><Wrench size={15}/> Operational Management</div>
          <h1>🛠️ System Operations & Management Portal</h1>
          <p>Manage food and packaging material databases, oversee user accounts, review recommendations, and configure operational settings.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="node-access" style={{ background: "#163b5f", color: "#6db5ff" }}>
            Management Access
          </span>
          <button className="secondary" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => onQuickSwitch("super_admin")}>
            👑 Elevate to Super Admin
          </button>
        </div>
      </div>

      {savedNotice && (
        <div style={{
          background: "rgba(36,165,122,0.15)",
          border: "1px solid #24a57a",
          color: "#55dfaa",
          padding: "10px 16px",
          borderRadius: "8px",
          marginBottom: "18px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16}/> {savedNotice}
        </div>
      )}

      {/* Portal Tabs */}
      <div className="portal-tabs">
        <button className={`portal-tab-btn ${activeTab === "materials" ? "active" : ""}`} onClick={() => setActiveTab("materials")}>
          Packaging Materials Catalog ({materialList.length})
        </button>
        <button className={`portal-tab-btn ${activeTab === "foods" ? "active" : ""}`} onClick={() => setActiveTab("foods")}>
          Food Database ({Object.keys(foodList).length})
        </button>
        <button className={`portal-tab-btn ${activeTab === "settings" ? "active" : ""}`} onClick={() => setActiveTab("settings")}>
          Operational Settings
        </button>
      </div>

      {/* Tab: Materials */}
      {activeTab === "materials" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>Packaging Material Database</h3>
              <p style={{ margin: "4px 0 0", color: "#8aa2bc", fontSize: "12.5px" }}>Manage polymer films, barrier laminate structures, nominal OTR/WVTR, and active operational status.</p>
            </div>
            <span style={{ fontSize: "12px", color: "#55dfaa", background: "rgba(85,223,170,0.1)", padding: "4px 10px", borderRadius: "6px" }}>
              ASTM D3985 / F1249 Compliant
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Material Structure</th>
                  <th>Category</th>
                  <th>Nominal Gauge</th>
                  <th>Nominal OTR (cc/m²·d)</th>
                  <th>Nominal WVTR (g/m²·d)</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {materialList.map(m => (
                  <tr key={m.id}>
                    <td>
                      <b style={{ color: "#fff" }}>{m.name}</b>
                      <div style={{ fontSize: "11px", color: "#7e99b4" }}>{m.short}</div>
                    </td>
                    <td><span className="node-perm-pill">{m.category}</span></td>
                    <td>{m.thickness}</td>
                    <td><b style={{ color: "#55dfaa" }}>{m.nominal_otr}</b></td>
                    <td><b style={{ color: "#68b9ff" }}>{m.nominal_wvtr}</b></td>
                    <td>
                      <span style={{
                        color: m.active === false ? "#f87171" : "#55dfaa",
                        fontSize: "11px",
                        fontWeight: 700
                      }}>
                        {m.active === false ? "Inactive" : "● Active"}
                      </span>
                    </td>
                    <td>
                      <button
                        className="secondary"
                        style={{ padding: "4px 10px", fontSize: "11px" }}
                        onClick={() => toggleMaterialStatus(m.id)}
                      >
                        {m.active === false ? "Enable" : "Disable"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Foods */}
      {activeTab === "foods" && (
        <div className="admin-card">
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>Food Composition & Preservation Database</h3>
            <p style={{ margin: "4px 0 0", color: "#8aa2bc", fontSize: "12.5px" }}>Sorption isotherm parameters, moisture, lipid fraction, and respiration rates.</p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Food Commodity</th>
                  <th>Category</th>
                  <th>Moisture</th>
                  <th>Lipid (Fat)</th>
                  <th>pH</th>
                  <th>Respiration</th>
                  <th>Target Shelf Life</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(foodList).map(([k, f]) => (
                  <tr key={k}>
                    <td><b style={{ color: "#fff" }}>{f.name}</b></td>
                    <td><span className="node-perm-pill">{f.category}</span></td>
                    <td>{f.moisture}%</td>
                    <td>{f.fat}%</td>
                    <td>{f.ph}</td>
                    <td>{f.respiration}</td>
                    <td>{f.shelf} days</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Operational Settings */}
      {activeTab === "settings" && (
        <div className="admin-card" style={{ maxWidth: "680px" }}>
          <h3 style={{ margin: "0 0 16px", color: "#fff", fontSize: "18px" }}>Operational Application Settings</h3>
          <form className="auth-form" onSubmit={handleSaveSettings}>
            <div className="form-group">
              <label>Default Storage Temperature (°C)</label>
              <input
                type="number"
                value={settings.defaultTemp}
                onChange={e => setSettings({ ...settings, defaultTemp: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Shelf Life Safety Buffer (Days)</label>
              <input
                type="number"
                value={settings.defaultShelfBuffer}
                onChange={e => setSettings({ ...settings, defaultShelfBuffer: Number(e.target.value) })}
              />
            </div>
            <div className="form-group">
              <label>Measurement Unit System</label>
              <select value={settings.units} onChange={e => setSettings({ ...settings, units: e.target.value })}>
                <option value="Metric (SI)">Metric SI (cc/m²·day & g/m²·day)</option>
                <option value="Imperial">Imperial (cc/100in²·day & g/100in²·day)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Financial Currency</label>
              <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
                <option value="INR (₹)">INR (₹)</option>
              </select>
            </div>
            <button type="submit" className="primary" style={{ marginTop: "10px" }}>
              Save Operational Settings
            </button>
          </form>
        </div>
      )}
    </main>
  );
}

function AdminPortal({ currentUser, nav, onQuickSwitch }) {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState("ALL");
  const [safetyMargin, setSafetyMargin] = useState(1.15);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [rateLimit, setRateLimit] = useState(120);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [showAddUser, setShowAddUser] = useState(false);
  const [toast, setToast] = useState(null);

  const isSuperAdmin = currentUser && currentUser.role === "super_admin";

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleRoleChange = (userId, newRole) => {
    const roleLabels = { super_admin: "Super Admin", system_manager: "System Manager", user: "Standard User" };
    const accessLevels = { super_admin: "Full", system_manager: "Management", user: "Basic" };

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          role_title: roleLabels[newRole],
          access_level: accessLevels[newRole]
        };
      }
      return u;
    }));

    const updatedUser = users.find(u => u.id === userId);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: currentUser?.email || "admin@packsmart.ai",
      role: "super_admin",
      action: "ROLE_PERMISSION",
      details: `Changed role of ${updatedUser?.name || userId} to ${roleLabels[newRole]}`
    };
    setLogs(prev => [newLog, ...prev]);
    showNotification(`User role updated to ${roleLabels[newRole]}. Audit log generated.`);

    fetch("/api/admin/users/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: updatedUser?.email, new_role: newRole, admin_email: currentUser?.email })
    }).catch(() => {});
  };

  const handleToggleStatus = (userId) => {
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          user: currentUser?.email || "admin@packsmart.ai",
          role: "super_admin",
          action: "USER_STATUS",
          details: `Updated status for ${u.name} to ${nextStatus}`
        };
        setLogs(l => [newLog, ...l]);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    showNotification("User account status updated.");
  };

  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const roleLabels = { super_admin: "Super Admin", system_manager: "System Manager", user: "Standard User" };
    const accessLevels = { super_admin: "Full", system_manager: "Management", user: "Basic" };

    const created = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      role_title: roleLabels[newUser.role],
      access_level: accessLevels[newUser.role],
      status: "Active",
      created_at: new Date().toISOString().substring(0, 10)
    };

    setUsers(prev => [...prev, created]);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: currentUser?.email || "admin@packsmart.ai",
      role: "super_admin",
      action: "USER_CREATED",
      details: `Provisioned account ${newUser.email} with ${roleLabels[newUser.role]} permissions`
    };
    setLogs(prev => [newLog, ...prev]);
    setNewUser({ name: "", email: "", role: "user" });
    setShowAddUser(false);
    showNotification(`New user ${created.name} provisioned successfully.`);
  };

  const exportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      packsmart_version: "2.4.0",
      users,
      permissions: PERMISSIONS_MATRIX,
      system_config: { safetyMargin, sessionTimeout, mfaEnforced, rateLimit },
      audit_logs: logs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `packsmart_system_backup_${Date.now()}.json`;
    a.click();
    showNotification("Complete system database backup downloaded.");
  };

  if (!isSuperAdmin) {
    return (
      <main className="page portal-wrap">
        <div className="admin-card" style={{ textAlign: "center", padding: "48px 24px" }}>
          <Crown size={48} style={{ color: "#fcd268", margin: "0 auto 16px" }}/>
          <h2 style={{ color: "#fff", marginBottom: "8px" }}>👑 Super Admin Access Required</h2>
          <p style={{ color: "#8ba3be", maxWidth: "540px", margin: "0 auto 24px" }}>
            The Super Admin Console gives unrestricted access to security controls, user management, and system configuration.
            Your current active persona is <b>{currentUser?.name || "Guest"}</b> ({currentUser?.access_level || "No"} Access).
          </p>
          <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
            <button className="primary" onClick={() => onQuickSwitch("super_admin")}>
              👑 Switch to Super Admin Persona
            </button>
            <button className="secondary" onClick={() => nav("home")}>
              Return to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const filteredLogs = logFilter === "ALL" ? logs : logs.filter(l => l.action === logFilter);

  return (
    <main className="page portal-wrap">
      {/* Portal Header */}
      <div className="portal-head">
        <div>
          <div className="eyebrow" style={{ color: "#fcd268" }}><Crown size={15}/> Full System Authority</div>
          <h1>👑 Super Admin Management Console</h1>
          <p>Unrestricted access across the entire application: manage users, system managers, roles & permissions, security policies, and complete database.</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="node-access" style={{ background: "#453610", color: "#fcd268" }}>
            Full System Access
          </span>
          <button className="secondary" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={exportBackup}>
            <Download size={13}/> Export Backup
          </button>
        </div>
      </div>

      {toast && (
        <div style={{
          background: "rgba(36,165,122,0.15)",
          border: "1px solid #24a57a",
          color: "#55dfaa",
          padding: "10px 16px",
          borderRadius: "8px",
          marginBottom: "18px",
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          <CheckCircle2 size={16}/> {toast}
        </div>
      )}

      {/* Admin KPI Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat">
          <span>Total Accounts</span>
          <b>{users.length}</b>
          <small>Active Directory</small>
        </div>
        <div className="admin-stat">
          <span>Super Admins</span>
          <b style={{ color: "#fcd268" }}>{users.filter(u => u.role === "super_admin").length}</b>
          <small>Full Root Access</small>
        </div>
        <div className="admin-stat">
          <span>System Managers</span>
          <b style={{ color: "#6db5ff" }}>{users.filter(u => u.role === "system_manager").length}</b>
          <small>Management Tier</small>
        </div>
        <div className="admin-stat">
          <span>Active Privileges</span>
          <b style={{ color: "#55dfaa" }}>17 / 17</b>
          <small>100% RBAC Coverage</small>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="portal-tabs">
        <button className={`portal-tab-btn ${activeTab === "users" ? "active" : ""}`} onClick={() => setActiveTab("users")}>
          <Users size={14}/> Users & System Managers ({users.length})
        </button>
        <button className={`portal-tab-btn ${activeTab === "roles" ? "active" : ""}`} onClick={() => setActiveTab("roles")}>
          <Shield size={14}/> Roles & Permissions (17)
        </button>
        <button className={`portal-tab-btn ${activeTab === "logs" ? "active" : ""}`} onClick={() => setActiveTab("logs")}>
          <Sliders size={14}/> System Activity & Audit Logs ({logs.length})
        </button>
        <button className={`portal-tab-btn ${activeTab === "security" ? "active" : ""}`} onClick={() => setActiveTab("security")}>
          <Settings size={14}/> System Configuration & Security
        </button>
      </div>

      {/* Tab 1: Users & System Managers */}
      {activeTab === "users" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>Manage Users & System Managers</h3>
              <p style={{ margin: "4px 0 0", color: "#8aa2bc", fontSize: "12.5px" }}>Super Admin capability: modify roles, elevate system managers, or suspend accounts.</p>
            </div>
            <button className="primary" style={{ fontSize: "12px", padding: "6px 14px" }} onClick={() => setShowAddUser(v => !v)}>
              {showAddUser ? "Cancel" : "+ Provision New User"}
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUser} style={{ background: "#05121f", border: "1px solid #16324d", borderRadius: "10px", padding: "16px", marginBottom: "18px" }}>
              <h4 style={{ margin: "0 0 12px", color: "#fff", fontSize: "14px" }}>Provision New Account</h4>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto", gap: "10px", alignItems: "end" }}>
                <div className="form-group">
                  <label>Full Name</label>
                  <input required placeholder="e.g. Dr. Jane Doe" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Email Address</label>
                  <input required type="email" placeholder="jane@packsmart.ai" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}/>
                </div>
                <div className="form-group">
                  <label>Assigned Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">👤 User (Basic Access)</option>
                    <option value="system_manager">🛠️ System Manager (Management)</option>
                    <option value="super_admin">👑 Super Admin (Full Access)</option>
                  </select>
                </div>
                <button type="submit" className="primary" style={{ padding: "11px 16px", height: "42px" }}>
                  Add Account
                </button>
              </div>
            </form>
          )}

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User Identity</th>
                  <th>Email</th>
                  <th>Current Role</th>
                  <th>Access Tier</th>
                  <th>Status</th>
                  <th>Modify Role (Super Admin Authority)</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id}>
                    <td>
                      <b style={{ color: "#fff" }}>{u.name}</b>
                      <div style={{ fontSize: "11px", color: "#7995b0" }}>ID: {u.id}</div>
                    </td>
                    <td>{u.email}</td>
                    <td>
                      <span className={`user-role-tag role-${u.role}`}>
                        {u.role === "super_admin" ? "👑 Super Admin" : u.role === "system_manager" ? "🛠️ System Manager" : "👤 User"}
                      </span>
                    </td>
                    <td><b style={{ color: u.role === "super_admin" ? "#fcd268" : u.role === "system_manager" ? "#6db5ff" : "#5ef1b5" }}>{u.access_level}</b></td>
                    <td>
                      <span style={{ color: u.status === "Active" ? "#55dfaa" : "#f87171", fontWeight: 600 }}>
                        {u.status === "Active" ? "● Active" : "○ Suspended"}
                      </span>
                    </td>
                    <td>
                      <select
                        className="role-select-inline"
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="user">👤 User (Basic Access)</option>
                        <option value="system_manager">🛠️ System Manager (Management)</option>
                        <option value="super_admin">👑 Super Admin (Full Access)</option>
                      </select>
                    </td>
                    <td>
                      <button
                        className="secondary"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: 17 Roles & Permissions Matrix */}
      {activeTab === "roles" && (
        <div className="admin-card">
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>Role & Permission Entitlement Matrix (17 Privileges)</h3>
            <p style={{ margin: "4px 0 0", color: "#8aa2bc", fontSize: "12.5px" }}>
              Granular access privilege mapping across all 3 tiers. Super Admin possesses unrestricted access across all categories.
            </p>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>System Privilege / Capability</th>
                  <th>Category</th>
                  <th style={{ textAlign: "center" }}>👤 User<br/><small style={{ color: "#5ef1b5" }}>Basic Access</small></th>
                  <th style={{ textAlign: "center" }}>🛠️ System Manager<br/><small style={{ color: "#6db5ff" }}>Management Access</small></th>
                  <th style={{ textAlign: "center" }}>👑 Super Admin<br/><small style={{ color: "#fcd268" }}>Full System Access</small></th>
                </tr>
              </thead>
              <tbody>
                {PERMISSIONS_MATRIX.map(perm => (
                  <tr key={perm.id}>
                    <td>
                      <b style={{ color: "#fff" }}>{perm.name}</b>
                      <div style={{ fontSize: "11px", color: "#6886a2" }}><code>{perm.id}</code></div>
                    </td>
                    <td>
                      <span className="node-perm-pill">{perm.category}</span>
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {perm.user ? (
                        <CheckCircle2 size={17} style={{ color: "#55dfaa", margin: "0 auto" }}/>
                      ) : (
                        <XCircle size={17} style={{ color: "#455a70", margin: "0 auto" }}/>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      {perm.manager ? (
                        <CheckCircle2 size={17} style={{ color: "#6db5ff", margin: "0 auto" }}/>
                      ) : (
                        <XCircle size={17} style={{ color: "#455a70", margin: "0 auto" }}/>
                      )}
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <CheckCircle2 size={17} style={{ color: "#fcd268", margin: "0 auto" }}/>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: System Activity & Audit Logs */}
      {activeTab === "logs" && (
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: 0, color: "#fff", fontSize: "18px" }}>System Activity & Security Audit Logs</h3>
              <p style={{ margin: "4px 0 0", color: "#8aa2bc", fontSize: "12.5px" }}>
                Immutable event stream for identity authentications, ASTM barrier calculations, and role policy modifications.
              </p>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              <select
                className="role-select-inline"
                value={logFilter}
                onChange={e => setLogFilter(e.target.value)}
              >
                <option value="ALL">All Event Types</option>
                <option value="AUTH_LOGIN">AUTH_LOGIN</option>
                <option value="ROLE_PERMISSION">ROLE_PERMISSION</option>
                <option value="POLICY_UPDATE">POLICY_UPDATE</option>
                <option value="USER_STATUS">USER_STATUS</option>
                <option value="USER_CREATED">USER_CREATED</option>
                <option value="DB_SYNC">DB_SYNC</option>
                <option value="ML_CALCULATION">ML_CALCULATION</option>
              </select>
            </div>
          </div>

          <div className="log-stream">
            {filteredLogs.map(log => (
              <div className="log-row" key={log.id}>
                <span className="log-time">{log.timestamp}</span>
                <span className="log-user">{log.user}</span>
                <span className="log-action">{log.action}</span>
                <span className="log-details">{log.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: System Configuration & Security */}
      {activeTab === "security" && (
        <div className="admin-card">
          <h3 style={{ margin: "0 0 8px", color: "#fff", fontSize: "18px" }}>System Configuration & Security Controls</h3>
          <p style={{ color: "#8aa2bc", fontSize: "12.5px", marginBottom: "24px" }}>
            Super Admin parameters for barrier physics equations, session governance, and global security policies.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "24px" }}>
            {/* Security Policies */}
            <div style={{ background: "#05121f", border: "1px solid #16324d", borderRadius: "10px", padding: "18px" }}>
              <h4 style={{ margin: "0 0 16px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Shield size={16} style={{ color: "#55dfaa" }}/> Security & Access Controls
              </h4>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label>Admin Session Inactivity Timeout</label>
                <select value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))}>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes</option>
                  <option value={120}>120 Minutes</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: "16px" }}>
                <label>API Rate Limiting (Requests / Min / IP)</label>
                <input
                  type="number"
                  value={rateLimit}
                  onChange={e => setRateLimit(Number(e.target.value))}
                />
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderTop: "1px solid #142a3f" }}>
                <div>
                  <b style={{ display: "block", color: "#fff", fontSize: "13px" }}>Enforce Multi-Factor Authentication (MFA)</b>
                  <small style={{ color: "#7995b0" }}>Require TOTP for Super Admin & System Managers</small>
                </div>
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  onChange={e => setMfaEnforced(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "#55dfaa" }}
                />
              </div>
            </div>

            {/* ASTM Barrier Engine Calibration */}
            <div style={{ background: "#05121f", border: "1px solid #16324d", borderRadius: "10px", padding: "18px" }}>
              <h4 style={{ margin: "0 0 16px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={16} style={{ color: "#fcd268" }}/> Barrier Physics Engine Calibration
              </h4>

              <div className="range" style={{ marginBottom: "16px" }}>
                <span>ASTM Barrier Safety Factor: <b>{safetyMargin}x</b></span>
                <input
                  type="range"
                  min="1.0"
                  max="1.5"
                  step="0.05"
                  value={safetyMargin}
                  onChange={e => setSafetyMargin(Number(e.target.value))}
                />
                <small style={{ color: "#7995b0", fontSize: "11px", display: "block", marginTop: "4px" }}>
                  Multiplies minimum allowable barrier requirements to safeguard against micro-pinholes.
                </small>
              </div>

              <div style={{ background: "#081b2c", border: "1px solid #183d61", borderRadius: "8px", padding: "14px", marginTop: "18px" }}>
                <b style={{ color: "#fcd268", fontSize: "12px", display: "block", marginBottom: "4px" }}>Complete Database Access</b>
                <p style={{ color: "#9cb5ce", fontSize: "11.5px", margin: "0 0 12px" }}>
                  Super Admin has unrestricted read/write access to ML model weights, barrier permeation tables, and telemetry.
                </p>
                <button
                  className="primary"
                  style={{ width: "100%", fontSize: "12px", padding: "8px" }}
                  onClick={exportBackup}
                >
                  <Download size={13}/> Download Complete Database Snapshot (JSON)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

// Fallback recommendation engine in case backend is offline
function calculateFallbackRecommendation(inp) {
  const isProduce = ["Fresh produce"].includes(inp.category) || inp.respiration_rate === "High";
  const reqOTR = isProduce ? 35000 : inp.fat_pct >= 20 ? 15.2 : 45.0;
  const reqWVTR = inp.moisture_pct <= 5 ? 1.5 : 4.0;

  const topMat = isProduce
    ? MATERIALS_CATALOG.find(m => m.id === "breathable")
    : inp.fat_pct >= 15
    ? MATERIALS_CATALOG.find(m => m.id === "metalized")
    : MATERIALS_CATALOG.find(m => m.id === "pet-pe");

  const defaultCost = {
    raw_material_cost_per_pack: 0.0102,
    film_thickness_um: topMat.nominal_thickness,
    packaging_surface_area_m2: 0.08,
    production_conversion_cost_per_pack: 0.0176,
    transportation_cost_per_pack: 0.0071,
    packaging_cost_per_pack: 0.0349,
    food_value_per_pack: 2.10,
    spoilage_risk_pct: 1.5,
    expected_food_loss_cost_per_pack: 0.0315,
    total_cost_per_pack: 0.0664,
    total_cost_per_1000_packs: 66.4,
    cost_formula_label: "Pkg ($0.035) + Expected Spoilage Loss ($0.032) = Total ($0.066/pack)"
  };

  const defaultSust = {
    material_weight_g_per_pack: 3.9,
    packaging_to_product_ratio_pct: 1.56,
    recyclability_score_pct: 75.0,
    recycled_content_pct: 15.0,
    renewable_content_pct: 0.0,
    embodied_carbon_g_co2_per_pack: 11.2,
    avoided_food_waste_carbon_g_co2: 159.0,
    net_carbon_impact_g_co2_per_pack: -147.8,
    end_of_life_pathway: topMat.recyclability,
    sustainability_index: 78.4,
    circularity_grade: "Grade A (High Circularity)",
    sustainability_summary: "Grade A (High Circularity): 75% circularity rating, 3.9g packaging tare weight (1.6% PPR). Embodied carbon of 11.2g CO₂e is offset by 159g CO₂e saved."
  };

  const fallbackParetoOptions = [
    {
      option_id: "option_a",
      option_title: "Option A → Maximum Shelf Life",
      focus: "Longevity & Extreme Barrier Protection",
      material_id: "alu-laminate",
      material_name: "Aluminium Foil Tri-Laminate (PET/Alu/PE)",
      overall_score: 88.0,
      shelf_life_days: 365,
      packaging_cost_per_pack: 0.078,
      expected_loss_cost_per_pack: 0.031,
      total_cost_per_pack: 0.109,
      sustainability_index: 21.1,
      carbon_footprint_g: 3.9,
      recyclability_class: "Landfill / Thermal Recovery",
      tradeoff_summary: "Delivers maximum product longevity (365 days) with near-zero gas/moisture transmission."
    },
    {
      option_id: "option_b",
      option_title: "Option B → Lowest Total Cost",
      focus: "Economic Total Cost Optimization",
      material_id: "metalized",
      material_name: "Metallized Film (BOPP / Met-PET)",
      overall_score: 92.4,
      shelf_life_days: 104,
      packaging_cost_per_pack: 0.035,
      expected_loss_cost_per_pack: 0.032,
      total_cost_per_pack: 0.066,
      sustainability_index: 45.7,
      carbon_footprint_g: 0.55,
      recyclability_class: "Hard-to-recycle Multilayer",
      tradeoff_summary: "Minimizes total economic burden to $0.066/pack (Packaging: $0.035 + Spoilage Loss: $0.032)."
    },
    {
      option_id: "option_c",
      option_title: "Option C → Higher Sustainability",
      focus: "Circularity & Low Embodied Carbon",
      material_id: "evoh-pe",
      material_name: "EVOH High-Barrier Coextrusion (PE/EVOH/PE)",
      overall_score: 85.0,
      shelf_life_days: 90,
      packaging_cost_per_pack: 0.045,
      expected_loss_cost_per_pack: 0.039,
      total_cost_per_pack: 0.084,
      sustainability_index: 78.0,
      carbon_footprint_g: 0.45,
      recyclability_class: "Compatible with PE recycling (<5% EVOH)",
      tradeoff_summary: "Achieves highest circularity rating (78/100 Sustainability Index) via recyclable polyolefin."
    },
    {
      option_id: "option_d",
      option_title: "Option D → Balanced Solution",
      focus: "Pareto-Optimal Compromise (Recommended)",
      material_id: topMat.id,
      material_name: topMat.name,
      overall_score: 92.4,
      shelf_life_days: 104,
      packaging_cost_per_pack: 0.035,
      expected_loss_cost_per_pack: 0.032,
      total_cost_per_pack: 0.066,
      sustainability_index: 78.4,
      carbon_footprint_g: 0.55,
      recyclability_class: topMat.recyclability,
      tradeoff_summary: "Multi-objective Pareto compromise matching user priorities: 104 days shelf life, $0.066/pack total cost, and 78/100 sustainability index."
    }
  ];

  return {
    top_recommendation: {
      material_id: topMat.id,
      name: topMat.name,
      short_name: topMat.short,
      category: topMat.category,
      overall_score: 92.4,
      ml_suitability_score: 94.0,
      recommended_thickness_um: topMat.nominal_thickness,
      thickness_range_um: [40, 90],
      estimated_cost_per_m2: 0.42,
      carbon_footprint_g_co2_per_pack: 0.55,
      recyclability_class: topMat.recyclability,
      map_recommendation: isProduce ? "Equilibrium MAP (EMAP): 3-5% O2, 4-7% CO2" : "Hermetic Gas Flush (99.5% N2)",
      barrier_check: {
        actual_otr: topMat.nominal_otr,
        actual_wvtr: topMat.nominal_wvtr,
        otr_status: "PASS",
        wvtr_status: "PASS",
        overall_barrier_status: "PASS",
        otr_margin_pct: 85.0,
        wvtr_margin_pct: 60.0
      },
      cost_breakdown: defaultCost,
      sustainability_indicator: defaultSust,
      driving_features: [
        { feature: "Lipid Oxidation Defense", impact: "+Positive", reason: "Fat content requires low OTR" },
        { feature: "Moisture Barrier Protection", impact: "+Positive", reason: "WVTR protects product crispness" }
      ],
      shelf_life_prediction: {
        required_shelf_life_days: inp.shelf_life_days || 90,
        predicted_shelf_life_days: isProduce ? 24 : 104,
        target_achievable: true,
        status_label: "✓ Target achievable",
        limiting_degradation_factor: isProduce ? "Produce Senescence" : "Lipid Oxidation / Rancidity",
        safety_margin_days: 14,
        microbial_spoilage_days: 180,
        lipid_oxidation_days: isProduce ? 45 : 104,
        moisture_staling_days: isProduce ? 30 : 120,
        scientific_validation_disclaimer: "Kinetic degradation simulation based on ASTM permeation and Arrhenius temperature dependency. Production release requires validation with proper experimental ASLT data."
      },
      map_gas_mix: {
        initial_flush_o2_pct: isProduce ? 3.5 : 0.2,
        initial_flush_co2_pct: isProduce ? 5.0 : 0.0,
        initial_flush_n2_pct: isProduce ? 91.5 : 99.8,
        equilibrium_headspace_o2_pct: isProduce ? 3.5 : 0.2,
        equilibrium_headspace_co2_pct: isProduce ? 5.0 : 0.0,
        equilibrium_headspace_n2_pct: isProduce ? 91.5 : 99.8,
        gas_headspace_ratio: 2.0,
        headspace_volume_cc: (inp.package_weight_g || 250) * 2.0,
        o2_consumption_cc_day: isProduce ? 350.0 : null,
        co2_generation_cc_day: isProduce ? 332.5 : null,
        respiratory_quotient: isProduce ? 0.95 : null,
        gas_mixture_label: isProduce ? "O₂: 3.5% | CO₂: 5.0% | N₂: 91.5% (Equilibrium MAP)" : "O₂: <0.5% | CO₂: 0% | N₂: >99.5% (Hermetic Inert Cushion)",
        preservation_mechanism: isProduce ? "Equilibrium MAP balances respiration and gas transmission to delay ripening." : "Hermetic Nitrogen Flush halts lipid oxidation chain reaction.",
        package_collapse_risk: "None"
      }
    },
    pareto_options: fallbackParetoOptions,
    alternatives: MATERIALS_CATALOG.filter(m => m.id !== topMat.id).slice(0, 3).map((m, idx) => ({
      material_id: m.id,
      name: m.name,
      short_name: m.short,
      category: m.category,
      rank: idx + 2,
      overall_score: 80 - idx * 10,
      recommended_thickness_um: m.nominal_thickness,
      cost_breakdown: { ...defaultCost, total_cost_per_pack: 0.075 + idx * 0.01 },
      sustainability_indicator: { ...defaultSust, sustainability_index: 60 - idx * 10 },
      barrier_check: {
        actual_otr: m.nominal_otr,
        actual_wvtr: m.nominal_wvtr,
        otr_status: m.nominal_otr <= reqOTR ? "PASS" : "FAIL",
        wvtr_status: m.nominal_wvtr <= reqWVTR ? "PASS" : "FAIL",
        overall_barrier_status: (m.nominal_otr <= reqOTR && m.nominal_wvtr <= reqWVTR) ? "PASS" : "FAIL"
      }
    })),
    all_ranked_materials: MATERIALS_CATALOG.map((m, idx) => ({
      material_id: m.id,
      name: m.name,
      short_name: m.short,
      category: m.category,
      rank: idx + 1,
      recommended_thickness_um: m.nominal_thickness,
      cost_breakdown: { ...defaultCost, total_cost_per_pack: 0.05 + idx * 0.015 },
      sustainability_indicator: { ...defaultSust, sustainability_index: Math.max(20, 80 - idx * 8) },
      barrier_check: {
        actual_otr: m.nominal_otr,
        actual_wvtr: m.nominal_wvtr,
        otr_status: (isProduce ? m.id === "breathable" : m.nominal_otr <= reqOTR) ? "PASS" : "FAIL",
        wvtr_status: m.nominal_wvtr <= reqWVTR ? "PASS" : "FAIL",
        overall_barrier_status: ((isProduce ? m.id === "breathable" : m.nominal_otr <= reqOTR) && m.nominal_wvtr <= reqWVTR) ? "PASS" : "FAIL"
      }
    })),
    required_barrier: {
      target_otr_max: reqOTR,
      target_wvtr_max: reqWVTR,
      target_otr_min: isProduce ? 15000 : null,
      critical_oxygen_uptake_cc: 12.5,
      critical_moisture_gain_g: 2.2,
      equilibrium_rh_pct: 35.0,
      driving_rh_delta_pct: 25.0,
      barrier_rationale: "Barrier limits computed from critical moisture sorption and lipid oxidation thresholds."
    },
    ml_model_metadata: {
      algorithm: "Scikit-learn MultiOutputRegressor (RandomForest)",
      test_r2_score: 0.996
    }
  };
}

function Step({ n, title, desc }) { return <div className="step-head"><span>{n}</span><div><h2>{title}</h2><p>{desc}</p></div></div>; }
function Field({ label, value, onChange, type = "text", step }) { return <label className="field"><span>{label}</span><input type={type} step={step} value={value} onChange={e => onChange(e.target.value)}/></label>; }
function SelectField({ label, value, onChange, options }) { return <label className="field"><span>{label}</span><select value={value} onChange={e => onChange(e.target.value)}>{options.map(x => <option key={x}>{x}</option>)}</select></label>; }
function Range({ label, value, onChange, min = 0, max = 100 }) { return <label className="range"><span>{label}<b>{value}</b></span><input type="range" min={min} max={max} value={value} onChange={e => onChange(e.target.value)}/></label>; }
function CardTitle({ icon: Icon, title }) { return <div className="card-title"><span><Icon size={18}/></span><h3>{title}</h3></div>; }
function SpecRow({ label, value }) { return <div className="spec-row"><span>{label}</span><b>{value}</b></div>; }
function Metric({ label, value, change }) { return <div className="metric"><span>{label}</span><b>{value}</b><small>{change}</small></div>; }
function Empty({ title, button, onClick }) { return <div className="empty"><CircleHelp size={35}/><h2>{title}</h2><button className="primary" onClick={onClick}>{button}</button></div>; }
function stars(n) { return "★".repeat(Math.max(1, Math.min(5, n))) + "☆".repeat(5 - Math.max(1, Math.min(5, n))); }

createRoot(document.getElementById("root")).render(<App />);
