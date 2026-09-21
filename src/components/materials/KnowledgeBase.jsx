import React, { useState } from "react";
import { Database, Package, Beaker, Search } from "lucide-react";
import { MATERIALS_CATALOG, FOODS } from "../../data/materials";

export function KnowledgeBase() {
  const [activeTab, setActiveTab] = useState("materials");
  const [search, setSearch] = useState("");

  const filteredMaterials = MATERIALS_CATALOG.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredFoods = Object.entries(FOODS).filter(([k, f]) =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Database size={12} /> Food & Material Specifications
          </div>
          <h1 className="page-title">Packaging Knowledge Base</h1>
          <p className="page-desc">
            Scientific barrier benchmarks and equilibrium sorption isotherm data configured for the PackSmart ML pipeline.
          </p>
        </div>
      </div>

      {/* Tabs & Search Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div style={{ display: "flex", gap: "10px" }}>
          <button
            type="button"
            className={`btn ${activeTab === "materials" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("materials")}
          >
            <Package size={16} /> Packaging Materials ({MATERIALS_CATALOG.length})
          </button>
          <button
            type="button"
            className={`btn ${activeTab === "foods" ? "btn-primary" : "btn-secondary"}`}
            onClick={() => setActiveTab("foods")}
          >
            <Beaker size={16} /> Food Chemistry Presets ({Object.keys(FOODS).length})
          </button>
        </div>

        <div style={{ position: "relative", width: "260px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
          <input
            type="text"
            placeholder="Search catalog..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%",
              background: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "8px 12px 8px 34px",
              color: "var(--text-primary)",
              fontSize: "13px"
            }}
          />
        </div>
      </div>

      {/* Content Grid */}
      {activeTab === "materials" ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
          {filteredMaterials.map(m => (
            <div key={m.id} className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="spec-chip" style={{ color: "var(--accent-cyan)", borderColor: "rgba(54, 191, 250, 0.25)" }}>
                  {m.category}
                </span>
                <Package size={18} style={{ color: "var(--accent-green)" }} />
              </div>

              <div>
                <h3 style={{ fontSize: "16px", color: "#fff", margin: "0 0 4px" }}>{m.name}</h3>
                <small style={{ color: "var(--text-secondary)", fontSize: "12px" }}>Gauge: {m.thickness} · Embodied Carbon: {m.carbon} kg CO₂e/kg</small>
              </div>

              <div className="barrier-metric-row">
                <div className="barrier-metric-val">
                  <span>Barrier OTR</span>
                  <b>{m.nominal_otr} <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>cc/m²·d</small></b>
                </div>
                <div className="barrier-metric-val">
                  <span>Barrier WVTR</span>
                  <b>{m.nominal_wvtr} <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>g/m²·d</small></b>
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
                {m.description}
              </p>

              <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)" }}>
                Recyclability: <b style={{ color: "var(--text-secondary)" }}>{m.recyclability}</b>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "18px" }}>
          {filteredFoods.map(([k, f]) => (
            <div key={k} className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="spec-chip" style={{ color: "var(--accent-green)", borderColor: "rgba(50, 213, 131, 0.25)" }}>
                  {f.category}
                </span>
              </div>

              <div>
                <h3 style={{ fontSize: "17px", color: "#fff", margin: "0 0 4px" }}>{f.name}</h3>
                <small style={{ color: "var(--text-secondary)", fontSize: "12px" }}>
                  Storage: {f.storage} · Target Shelf-Life: {f.shelf} days
                </small>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", background: "var(--bg-input)", padding: "10px", borderRadius: "var(--radius-md)" }}>
                <div>
                  <span className="micro-label">Moisture</span>
                  <b style={{ display: "block", color: "#fff", fontSize: "14px", marginTop: "2px" }}>{f.moisture}%</b>
                </div>
                <div>
                  <span className="micro-label">Lipid (Fat)</span>
                  <b style={{ display: "block", color: "#fff", fontSize: "14px", marginTop: "2px" }}>{f.fat}%</b>
                </div>
                <div>
                  <span className="micro-label">Acidity pH</span>
                  <b style={{ display: "block", color: "#fff", fontSize: "14px", marginTop: "2px" }}>{f.ph}</b>
                </div>
              </div>

              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5", margin: 0 }}>
                {f.description || "Equilibrium sorption isotherm and lipid oxidation kinetics parameters configured for PackSmart ML engine."}
              </p>

              <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)" }}>
                Respiration: <b style={{ color: f.respiration === "High" ? "var(--warning-amber)" : "var(--accent-green)" }}>{f.respiration}</b>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
