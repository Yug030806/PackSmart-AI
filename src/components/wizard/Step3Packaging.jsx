import React, { useState, useEffect } from "react";
import {
  Layers, Check, Sparkles, ArrowLeft, ArrowRight, ShieldCheck,
  Recycle, DollarSign, Leaf, Sliders, RefreshCw
} from "lucide-react";
import { MATERIALS_CATALOG } from "../../data/materials";

export function Step3Packaging({ input, setInput, isAnalyzing = false, onBack, onRunAnalysis }) {
  const [materials, setMaterials] = useState(MATERIALS_CATALOG);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    input.preferred_material || "metalized"
  );

  // Fetch materials dynamically from backend / Supabase
  useEffect(() => {
    fetch("/api/materials")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const normalized = data.map(m => ({
            id: m.id,
            short: m.short || m.name,
            name: m.name,
            category: m.category || "Polymer Barrier",
            nominal_otr: m.nominal_otr,
            nominal_wvtr: m.nominal_wvtr,
            thickness: m.thickness || `${m.nominal_thickness_um || 50} µm`,
            carbon: m.carbon !== undefined ? m.carbon : (m.carbon_kg_co2_kg || 2.5),
            recyclability: m.recyclability || m.recyclability_code || "RIC #7 Other",
            description: m.description || "Multi-layer barrier laminate"
          }));
          setMaterials(normalized);
        }
      })
      .catch(() => {});
  }, []);

  const set = (k, v) => setInput(x => ({ ...x, [k]: v }));

  const activeMaterial = materials.find(m => m.id === selectedMaterialId) || materials[0] || MATERIALS_CATALOG[2];

  return (
    <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <div className="micro-label green" style={{ marginBottom: "4px" }}>Step 03 / 05</div>
        <h2 style={{ fontSize: "26px", fontWeight: 800 }}>Packaging Materials & Multi-Objective Weights</h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Browse candidate polymer laminates and configure optimization priorities across barrier, carbon, and economics.
        </p>
      </div>

      {/* Multi-Objective Pareto Weights Sliders */}
      <div className="glass-card" style={{ padding: "22px 26px", marginBottom: "24px", borderColor: "rgba(54, 191, 250, 0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span className="micro-label cyan" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Sliders size={12} /> Optimization Criteria
            </span>
            <h3 style={{ fontSize: "17px", color: "#fff", margin: "2px 0 0" }}>
              Pareto Trade-Off Calibration
            </h3>
          </div>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            Weights: 0 (Min) – 100 (Max)
          </span>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
          <div className="range-wrap" style={{ margin: 0 }}>
            <div className="range-header">
              <span style={{ color: "var(--accent-green)", fontWeight: 600 }}>Food Protection Priority</span>
              <span className="range-val">{input.protection}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={input.protection}
              onChange={e => set("protection", Number(e.target.value))}
            />
            <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Weights barrier safety margin</small>
          </div>

          <div className="range-wrap" style={{ margin: 0 }}>
            <div className="range-header">
              <span style={{ color: "var(--accent-cyan)", fontWeight: 600 }}>Sustainability Priority</span>
              <span className="range-val">{input.sustainability}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={input.sustainability}
              onChange={e => set("sustainability", Number(e.target.value))}
            />
            <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Weights recyclability & low LCA carbon</small>
          </div>

          <div className="range-wrap" style={{ margin: 0 }}>
            <div className="range-header">
              <span style={{ color: "var(--warning-amber)", fontWeight: 600 }}>Cost Economy Priority</span>
              <span className="range-val">{input.costPriority}</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={input.costPriority}
              onChange={e => set("costPriority", Number(e.target.value))}
            />
            <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Weights low resin mass & slitting cost</small>
          </div>
        </div>
      </div>

      {/* Materials Candidate Cards */}
      <div style={{ marginBottom: "14px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span className="micro-label">Candidate Polymer Structures (ASTM D3985 / F1249 Specifications)</span>
        <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
          {materials.length} Standard Material Grades Available
        </span>
      </div>

      <div className="material-grid" style={{ marginBottom: "24px" }}>
        {materials.map(m => {
          const isSelected = selectedMaterialId === m.id;
          return (
            <div
              key={m.id}
              className={`material-card ${isSelected ? "selected" : ""}`}
              onClick={() => {
                setSelectedMaterialId(m.id);
                set("preferred_material", m.id);
              }}
            >
              <div className="material-card-top">
                <div>
                  <span className="material-card-title">{m.short}</span>
                  <div className="material-card-category">{m.category}</div>
                </div>
                {isSelected && (
                  <span style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--accent-green)",
                    color: "#051410",
                    display: "grid",
                    placeItems: "center"
                  }}>
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </div>

              <div className="barrier-metric-row">
                <div className="barrier-metric-val">
                  <span>Nominal OTR</span>
                  <b>{m.nominal_otr} <small style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>cc/m²·d</small></b>
                </div>
                <div className="barrier-metric-val">
                  <span>Nominal WVTR</span>
                  <b>{m.nominal_wvtr} <small style={{ fontSize: "10px", color: "var(--text-muted)", fontWeight: 400 }}>g/m²·d</small></b>
                </div>
              </div>

              <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: "0", lineHeight: "1.4" }}>
                {m.description}
              </p>

              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginTop: "auto", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)" }}>
                <span>Gauge: {m.thickness}</span>
                <span>·</span>
                <span>{m.recyclability.split("(")[0]}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Material Comparison Panel Preview */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "28px", borderColor: "rgba(50, 213, 131, 0.35)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <span className="micro-label green">Active Focus Material</span>
            <h4 style={{ fontSize: "17px", color: "#fff", margin: "2px 0 0" }}>
              {activeMaterial.name}
            </h4>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
              {activeMaterial.category} · Standard Gauge {activeMaterial.thickness} · Embodied Carbon {activeMaterial.carbon} kg CO₂e/kg
            </p>
          </div>

          <div style={{ display: "flex", gap: "12px" }}>
            <div style={{ textAlign: "right" }}>
              <span className="micro-label">ASTM Gas OTR</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "16px" }}>
                {activeMaterial.nominal_otr} <small style={{ fontSize: "11px", color: "var(--text-secondary)" }}>cc</small>
              </b>
            </div>
            <div style={{ textAlign: "right" }}>
              <span className="micro-label">ASTM Vapor WVTR</span>
              <b style={{ display: "block", color: "var(--accent-cyan)", fontSize: "16px" }}>
                {activeMaterial.nominal_wvtr} <small style={{ fontSize: "11px", color: "var(--text-secondary)" }}>g</small>
              </b>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <button
          type="button"
          className="btn btn-secondary"
          style={{ padding: "12px 24px", fontSize: "14px" }}
          onClick={onBack}
        >
          <ArrowLeft size={16} /> Back to Conditions
        </button>

        <button
          type="button"
          className="btn btn-primary"
          style={{
            padding: "12px 28px",
            fontSize: "14px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            opacity: isAnalyzing ? 0.85 : 1,
            cursor: isAnalyzing ? "wait" : "pointer"
          }}
          disabled={isAnalyzing}
          onClick={onRunAnalysis}
        >
          {isAnalyzing ? (
            <>
              <RefreshCw size={16} className="spin" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Run AI Analysis & Optimize →</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
