import React, { useState } from "react";
import { Check, Layers, Sparkles, ShieldCheck } from "lucide-react";
import { MATERIALS_CATALOG } from "../../data/materials";

export function MaterialsCompare() {
  const [selectedIds, setSelectedIds] = useState(["pet-pe", "hdpe", "metalized", "breathable"]);

  const toggleSelect = (id) => {
    if (selectedIds.includes(id)) {
      if (selectedIds.length > 1) {
        setSelectedIds(selectedIds.filter(x => x !== id));
      }
    } else {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedMaterials = selectedIds
    .map(id => MATERIALS_CATALOG.find(m => m.id === id))
    .filter(Boolean);

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Layers size={12} /> ASTM Material Benchmark Matrix
          </div>
          <h1 className="page-title">Compare Barrier Properties</h1>
          <p className="page-desc">
            Evaluate side-by-side ASTM D3985 gas transmission rates, ASTM F1249 moisture barriers, and circular end-of-life streams.
          </p>
        </div>
      </div>

      {/* Selectable Material Chips */}
      <div className="glass-card" style={{ padding: "18px 22px", marginBottom: "24px" }}>
        <span className="micro-label" style={{ display: "block", marginBottom: "10px" }}>
          Select Materials to Compare (Up to 5 candidates):
        </span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {MATERIALS_CATALOG.map(m => {
            const isSel = selectedIds.includes(m.id);
            return (
              <button
                key={m.id}
                type="button"
                className={`btn ${isSel ? "btn-primary" : "btn-secondary"}`}
                style={{
                  fontSize: "12px",
                  padding: "7px 14px",
                  borderRadius: "var(--radius-full)",
                  background: isSel ? "var(--accent-green)" : "var(--bg-input)",
                  color: isSel ? "#051410" : "var(--text-secondary)",
                  border: isSel ? "1px solid var(--accent-green)" : "1px solid var(--border-subtle)"
                }}
                onClick={() => toggleSelect(m.id)}
              >
                {isSel ? <Check size={13} strokeWidth={3} /> : "+"} {m.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Table */}
      <div className="glass-card" style={{ padding: "24px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", minWidth: "750px" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
              <th style={{ padding: "14px 16px", textAlign: "left", width: "240px" }}>
                <span className="micro-label">SPECIFICATION PARAMETER</span>
              </th>
              {selectedMaterials.map(m => (
                <th key={m.id} style={{ padding: "14px 16px", textAlign: "left" }}>
                  <b style={{ color: "#fff", fontSize: "15px", display: "block" }}>{m.short}</b>
                  <small style={{ color: "var(--text-muted)", fontSize: "11px", fontWeight: 400 }}>{m.category}</small>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                <b>Nominal OTR</b>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ASTM D3985 · cc/(m²·day·atm)</div>
              </td>
              {selectedMaterials.map(m => (
                <td key={m.id} style={{ padding: "14px 16px" }}>
                  <b style={{ color: "var(--accent-green)", fontSize: "16px" }}>{m.nominal_otr}</b>
                  <small style={{ color: "var(--text-muted)", marginLeft: "4px" }}>cc</small>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                <b>Nominal WVTR</b>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>ASTM F1249 · g/(m²·day)</div>
              </td>
              {selectedMaterials.map(m => (
                <td key={m.id} style={{ padding: "14px 16px" }}>
                  <b style={{ color: "var(--accent-cyan)", fontSize: "16px" }}>{m.nominal_wvtr}</b>
                  <small style={{ color: "var(--text-muted)", marginLeft: "4px" }}>g</small>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                <b>Standard Gauge Range</b>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Recommended commercial thickness</div>
              </td>
              {selectedMaterials.map(m => (
                <td key={m.id} style={{ padding: "14px 16px", color: "#fff" }}>
                  {m.thickness}
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                <b>Embodied Carbon</b>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Cradle-to-gate LCA · kg CO₂e/kg</div>
              </td>
              {selectedMaterials.map(m => (
                <td key={m.id} style={{ padding: "14px 16px" }}>
                  <b style={{ color: m.carbon <= 2.0 ? "var(--accent-green)" : "#fff" }}>{m.carbon}</b>
                  <small style={{ color: "var(--text-muted)", marginLeft: "4px" }}>kg CO₂e</small>
                </td>
              ))}
            </tr>

            <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
              <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                <b>Recyclability Class</b>
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Post-consumer circular stream</div>
              </td>
              {selectedMaterials.map(m => (
                <td key={m.id} style={{ padding: "14px 16px", fontSize: "12.5px", color: "#d9eae3" }}>
                  {m.recyclability}
                </td>
              ))}
            </tr>

            <tr>
              <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                <b>Polymer Description</b>
              </td>
              {selectedMaterials.map(m => (
                <td key={m.id} style={{ padding: "14px 16px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                  {m.description}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
