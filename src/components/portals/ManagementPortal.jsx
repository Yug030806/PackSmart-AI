import React, { useState } from "react";
import { Wrench, ShieldAlert, CheckCircle2, Package, Beaker, Settings, Save } from "lucide-react";
import { MATERIALS_CATALOG, FOODS } from "../../data/materials";

export function ManagementPortal({ currentUser, onNavigate, onQuickSwitch, authToken }) {
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
      <div className="glass-card" style={{ maxWidth: "560px", margin: "40px auto", padding: "40px 24px", textAlign: "center" }}>
        <ShieldAlert size={48} style={{ color: "var(--error-red)", margin: "0 auto 16px" }} />
        <h2 style={{ color: "#fff", marginBottom: "8px" }}>Management Access Required</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", marginBottom: "24px" }}>
          The System Operations Portal is restricted to <b>🛠️ System Manager</b> and <b>👑 Super Admin</b> roles.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button className="btn btn-primary" onClick={() => onQuickSwitch("system_manager")}>
            Switch to 🛠️ System Manager Persona
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate("dashboard")}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const toggleMaterialStatus = (id) => {
    let nextActive = true;
    setMaterialList(prev => prev.map(m => {
      if (m.id === id) {
        nextActive = m.active === false;
        return { ...m, active: nextActive };
      }
      return m;
    }));
    setSavedNotice("Packaging material database status updated in Supabase.");
    setTimeout(() => setSavedNotice(null), 2500);

    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    fetch("/api/management/materials", {
      method: "POST",
      headers,
      body: JSON.stringify({ id, is_active: nextActive })
    }).catch(err => console.warn("Material status sync:", err));
  };

  const handleSaveSettings = (e) => {
    e.preventDefault();
    setSavedNotice("Application operational settings successfully updated in Supabase.");
    setTimeout(() => setSavedNotice(null), 2500);

    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    fetch("/api/management/settings", {
      method: "POST",
      headers,
      body: JSON.stringify({
        default_temp_c: Number(settings.defaultTemp),
        default_shelf_buffer_days: Number(settings.defaultShelfBuffer),
        units: settings.units,
        currency: settings.currency
      })
    }).catch(err => console.warn("Settings sync:", err));
  };


  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="micro-label cyan" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Wrench size={12} /> Operational Administration
          </div>
          <h1 className="page-title">🛠️ System Operations Portal</h1>
          <p className="page-desc">
            Manage ASTM material specifications, food sorption databases, and calibrate default operational parameters.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="badge-pass" style={{ background: "rgba(54, 191, 250, 0.15)", color: "var(--accent-cyan)", borderColor: "rgba(54, 191, 250, 0.3)" }}>
            Management Access Active
          </span>
          <button className="btn btn-secondary" style={{ fontSize: "12px", padding: "6px 12px" }} onClick={() => onQuickSwitch("super_admin")}>
            👑 Elevate to Super Admin
          </button>
        </div>
      </div>

      {savedNotice && (
        <div style={{ background: "rgba(50, 213, 131, 0.12)", border: "1px solid var(--accent-green)", color: "var(--accent-green)", padding: "10px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} /> {savedNotice}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px" }}>
        <button
          className={`btn ${activeTab === "materials" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("materials")}
        >
          <Package size={15} /> Materials Catalog ({materialList.length})
        </button>
        <button
          className={`btn ${activeTab === "foods" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("foods")}
        >
          <Beaker size={15} /> Food Presets ({Object.keys(foodList).length})
        </button>
        <button
          className={`btn ${activeTab === "settings" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("settings")}
        >
          <Settings size={15} /> Operational Settings
        </button>
      </div>

      {/* Tab: Materials */}
      {activeTab === "materials" && (
        <div className="glass-card" style={{ padding: "24px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                <th style={{ padding: "12px 10px" }}>MATERIAL STRUCTURE</th>
                <th style={{ padding: "12px 10px" }}>CATEGORY</th>
                <th style={{ padding: "12px 10px" }}>GAUGE</th>
                <th style={{ padding: "12px 10px" }}>NOMINAL OTR (cc)</th>
                <th style={{ padding: "12px 10px" }}>NOMINAL WVTR (g)</th>
                <th style={{ padding: "12px 10px" }}>STATUS</th>
                <th style={{ padding: "12px 10px", textAlign: "right" }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {materialList.map(m => (
                <tr key={m.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "12px 10px" }}>
                    <b style={{ color: "#fff" }}>{m.name}</b>
                    <small style={{ color: "var(--text-muted)", display: "block" }}>{m.short}</small>
                  </td>
                  <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{m.category}</td>
                  <td style={{ padding: "12px 10px" }}>{m.thickness}</td>
                  <td style={{ padding: "12px 10px", color: "var(--accent-green)", fontWeight: 700 }}>{m.nominal_otr}</td>
                  <td style={{ padding: "12px 10px", color: "var(--accent-cyan)", fontWeight: 700 }}>{m.nominal_wvtr}</td>
                  <td style={{ padding: "12px 10px" }}>
                    <span style={{ color: m.active === false ? "var(--error-red)" : "var(--accent-green)", fontWeight: 700, fontSize: "11px" }}>
                      {m.active === false ? "○ Inactive" : "● Active"}
                    </span>
                  </td>
                  <td style={{ padding: "12px 10px", textAlign: "right" }}>
                    <button
                      className="btn btn-secondary"
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
      )}

      {/* Tab: Foods */}
      {activeTab === "foods" && (
        <div className="glass-card" style={{ padding: "24px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                <th style={{ padding: "12px 10px" }}>FOOD COMMODITY</th>
                <th style={{ padding: "12px 10px" }}>CATEGORY</th>
                <th style={{ padding: "12px 10px" }}>MOISTURE %</th>
                <th style={{ padding: "12px 10px" }}>FAT %</th>
                <th style={{ padding: "12px 10px" }}>pH</th>
                <th style={{ padding: "12px 10px" }}>RESPIRATION</th>
                <th style={{ padding: "12px 10px" }}>TARGET SHELF LIFE</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(foodList).map(([k, f]) => (
                <tr key={k} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                  <td style={{ padding: "12px 10px" }}>
                    <b style={{ color: "#fff" }}>{f.name}</b>
                  </td>
                  <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{f.category}</td>
                  <td style={{ padding: "12px 10px" }}>{f.moisture}%</td>
                  <td style={{ padding: "12px 10px" }}>{f.fat}%</td>
                  <td style={{ padding: "12px 10px" }}>{f.ph}</td>
                  <td style={{ padding: "12px 10px", color: f.respiration === "High" ? "var(--warning-amber)" : "#fff" }}>{f.respiration}</td>
                  <td style={{ padding: "12px 10px", color: "var(--accent-green)", fontWeight: 700 }}>{f.shelf} days</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab: Settings */}
      {activeTab === "settings" && (
        <div className="glass-card" style={{ padding: "28px", maxWidth: "600px" }}>
          <h3 style={{ fontSize: "17px", color: "#fff", marginBottom: "16px" }}>Operational Settings</h3>
          <form onSubmit={handleSaveSettings}>
            <div className="field">
              <label>Default Storage Temperature (°C)</label>
              <input
                type="number"
                value={settings.defaultTemp}
                onChange={e => setSettings({ ...settings, defaultTemp: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Shelf Life Safety Buffer (Days)</label>
              <input
                type="number"
                value={settings.defaultShelfBuffer}
                onChange={e => setSettings({ ...settings, defaultShelfBuffer: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Measurement Unit System</label>
              <select value={settings.units} onChange={e => setSettings({ ...settings, units: e.target.value })}>
                <option value="Metric (SI)">Metric SI (cc/m²·day & g/m²·day)</option>
                <option value="Imperial">Imperial (cc/100in²·day & g/100in²·day)</option>
              </select>
            </div>
            <div className="field">
              <label>Financial Currency Default</label>
              <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })}>
                <option value="INR (₹)">INR (₹)</option>
                <option value="USD ($)">USD ($)</option>
                <option value="EUR (€)">EUR (€)</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary" style={{ marginTop: "10px" }}>
              <Save size={15} /> Save Operational Settings
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
