import React, { useState, useEffect } from "react";
import { Check, Layers, Sparkles, ShieldCheck, RefreshCw, Sliders, CheckCircle2, XCircle } from "lucide-react";
import { MATERIALS_CATALOG, FOODS } from "../../data/materials";

export function MaterialsCompare() {
  const [materialsList, setMaterialsList] = useState(MATERIALS_CATALOG);
  const [selectedIds, setSelectedIds] = useState(["pet-pe", "hdpe", "metalized", "breathable"]);
  const [loading, setLoading] = useState(false);

  // Live Barrier Analysis State
  const [barrierFood, setBarrierFood] = useState("chips");
  const [barrierTemp, setBarrierTemp] = useState(25);
  const [barrierHumidity, setBarrierHumidity] = useState(65);
  const [barrierShelfDays, setBarrierShelfDays] = useState(180);
  const [barrierCheckResult, setBarrierCheckResult] = useState(null);
  const [barrierLoading, setBarrierLoading] = useState(false);

  // Fetch materials from live backend / Supabase
  useEffect(() => {
    fetch("/api/materials")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // Normalize properties from API or fallback
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
          setMaterialsList(normalized);
        }
      })
      .catch(() => {
        setMaterialsList(MATERIALS_CATALOG);
      });
  }, []);

  // Run Barrier Analysis via /api/calculate-barrier
  const runBarrierCheck = () => {
    setBarrierLoading(true);
    const selectedPreset = FOODS[barrierFood] || {};
    const payload = {
      food_id: barrierFood,
      food_name: selectedPreset.name || barrierFood,
      category: selectedPreset.category || "Snacks",
      moisture_pct: Number(selectedPreset.moisture || 3.0),
      fat_pct: Number(selectedPreset.fat || 30.0),
      ph: Number(selectedPreset.ph || 6.0),
      respiration_rate: selectedPreset.respiration || "Low",
      storage_type: barrierTemp <= 0 ? "Frozen" : barrierTemp <= 10 ? "Chilled" : "Ambient",
      temperature_c: Number(barrierTemp),
      humidity_pct: Number(barrierHumidity),
      shelf_life_days: Number(barrierShelfDays),
      package_weight_g: 200
    };

    fetch("/api/calculate-barrier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setBarrierCheckResult(data);
        setBarrierLoading(false);
      })
      .catch(err => {
        console.error("Barrier calculation failed", err);
        setBarrierLoading(false);
      });
  };

  // Run on first load
  useEffect(() => {
    runBarrierCheck();
  }, [barrierFood]);

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
    .map(id => materialsList.find(m => m.id === id))
    .filter(Boolean);

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Layers size={12} /> Material Benchmark Matrix
          </div>
          <h1 className="page-title">Compare Barrier Properties</h1>
          <p className="page-desc">
            Evaluate side-by-side gas transmission rates (OTR), moisture barriers (WVTR), and circular end-of-life streams.
          </p>
        </div>
      </div>

      {/* Selectable Material Chips */}
      <div className="glass-card" style={{ padding: "18px 22px", marginBottom: "24px" }}>
        <span className="micro-label" style={{ display: "block", marginBottom: "10px" }}>
          Select Materials to Compare (Up to 5 candidates):
        </span>
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {materialsList.map(m => {
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
      <div className="glass-card" style={{ padding: "24px", overflowX: "auto", marginBottom: "28px" }}>
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
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Oxygen Flux · cc/(m²·day·atm)</div>
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
                <div style={{ fontSize: "11px", color: "var(--text-muted)" }}>Moisture Flux · g/(m²·day)</div>
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

      {/* Live Barrier Analysis Card (Calls /api/calculate-barrier) */}
      <div className="glass-card" style={{ padding: "26px", marginBottom: "32px", border: "1px solid rgba(50, 213, 131, 0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
          <div>
            <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <ShieldCheck size={13} /> Live Permeation & Barrier Validator
            </div>
            <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#fff" }}>
              Real-Time Barrier Thresholds & Material Suitability Matrix
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Sends commodity kinetics directly to <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>POST /api/calculate-barrier</code> to compute critical OTR/WVTR cutoffs and verify all candidate films.
            </p>
          </div>

          <button
            type="button"
            className="btn btn-primary"
            onClick={runBarrierCheck}
            disabled={barrierLoading}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            <RefreshCw size={14} className={barrierLoading ? "spin" : ""} />
            {barrierLoading ? "Calculating Permeation Kinetics..." : "Run Barrier Calculation"}
          </button>
        </div>

        {/* Input Parameters Controls */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", padding: "16px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", marginBottom: "22px" }}>
          <div className="field" style={{ margin: 0 }}>
            <label style={{ fontSize: "11px", textTransform: "uppercase", color: "var(--text-muted)", display: "block", marginBottom: "6px" }}>Food Preset</label>
            <select
              value={barrierFood}
              onChange={e => setBarrierFood(e.target.value)}
              style={{ width: "100%", background: "rgba(255,255,255,0.04)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", color: "#fff", padding: "8px 10px", fontSize: "13px" }}
            >
              {Object.entries(FOODS).map(([k, f]) => (
                <option key={k} value={k}>{f.name} ({f.category})</option>
              ))}
            </select>
          </div>

          <div className="range-wrap" style={{ margin: 0 }}>
            <div className="range-header" style={{ marginBottom: "4px" }}>
              <span style={{ fontSize: "11.5px" }}>Temp: <b>{barrierTemp}°C</b></span>
            </div>
            <input type="range" min="0" max="45" value={barrierTemp} onChange={e => setBarrierTemp(Number(e.target.value))} />
          </div>

          <div className="range-wrap" style={{ margin: 0 }}>
            <div className="range-header" style={{ marginBottom: "4px" }}>
              <span style={{ fontSize: "11.5px" }}>Humidity: <b>{barrierHumidity}% RH</b></span>
            </div>
            <input type="range" min="20" max="95" value={barrierHumidity} onChange={e => setBarrierHumidity(Number(e.target.value))} />
          </div>

          <div className="range-wrap" style={{ margin: 0 }}>
            <div className="range-header" style={{ marginBottom: "4px" }}>
              <span style={{ fontSize: "11.5px" }}>Target Shelf-Life: <b>{barrierShelfDays} d</b></span>
            </div>
            <input type="range" min="7" max="365" step="7" value={barrierShelfDays} onChange={e => setBarrierShelfDays(Number(e.target.value))} />
          </div>
        </div>

        {/* Results display from API */}
        {barrierCheckResult && (
          <div>
            {/* Required Thresholds Header */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(50, 213, 131, 0.08)", border: "1px solid rgba(50, 213, 131, 0.25)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                <span className="micro-label green">MAX ALLOWABLE OTR</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-green)", margin: "4px 0" }}>
                  {barrierCheckResult.required_barrier?.target_otr_max !== null ? barrierCheckResult.required_barrier?.target_otr_max : "N/A"}
                  <small style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "4px", fontWeight: 400 }}>cc/(m²·day·atm)</small>
                </div>
                <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Oxygen permeation limit (OTR)</small>
              </div>

              <div style={{ background: "rgba(54, 191, 250, 0.08)", border: "1px solid rgba(54, 191, 250, 0.25)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                <span className="micro-label cyan">MAX ALLOWABLE WVTR</span>
                <div style={{ fontSize: "22px", fontWeight: 800, color: "var(--accent-cyan)", margin: "4px 0" }}>
                  {barrierCheckResult.required_barrier?.target_wvtr_max !== null ? barrierCheckResult.required_barrier?.target_wvtr_max : "N/A"}
                  <small style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "4px", fontWeight: 400 }}>g/(m²·day)</small>
                </div>
                <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Moisture vapor flux limit (WVTR)</small>
              </div>

              <div style={{ background: "rgba(245, 185, 66, 0.08)", border: "1px solid rgba(245, 185, 66, 0.25)", borderRadius: "var(--radius-md)", padding: "14px" }}>
                <span className="micro-label" style={{ color: "var(--warning-amber)" }}>PRIMARY FAILURE RISKS</span>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "4px 0" }}>
                  {barrierCheckResult.required_barrier?.limiting_barrier_factor || "Moisture / Oxidation"}
                </div>
                <small style={{ fontSize: "11px", color: "var(--text-secondary)", display: "block" }}>
                  {barrierCheckResult.required_barrier?.barrier_rationale?.slice(0, 75)}...
                </small>
              </div>
            </div>

            {/* Matrix of Materials Checked */}
            <div style={{ overflowX: "auto" }}>
              <span className="micro-label" style={{ display: "block", marginBottom: "8px" }}>
                Specification Compliance Across All Materials:
              </span>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid var(--border-subtle)", textAlign: "left" }}>
                    <th style={{ padding: "10px 12px" }}>Material Structure</th>
                    <th style={{ padding: "10px 12px" }}>Actual OTR</th>
                    <th style={{ padding: "10px 12px" }}>Actual WVTR</th>
                    <th style={{ padding: "10px 12px" }}>OTR Check</th>
                    <th style={{ padding: "10px 12px" }}>WVTR Check</th>
                    <th style={{ padding: "10px 12px" }}>Verdict</th>
                  </tr>
                </thead>
                <tbody>
                  {barrierCheckResult.materials_barrier_check?.map(c => {
                    const isPass = c.overall_barrier_status === "PASS";
                    return (
                      <tr key={c.material_id} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: 600, color: "#fff" }}>
                          {c.material_name || c.material_id}
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {c.actual_otr} cc
                        </td>
                        <td style={{ padding: "10px 12px", fontFamily: "var(--font-mono)", color: "var(--text-secondary)" }}>
                          {c.actual_wvtr} g
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ color: c.otr_status === "PASS" ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600 }}>
                            {c.otr_status === "PASS" ? "✓ Pass" : "✕ Exceeds OTR"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span style={{ color: c.wvtr_status === "PASS" ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 600 }}>
                            {c.wvtr_status === "PASS" ? "✓ Pass" : "✕ Exceeds WVTR"}
                          </span>
                        </td>
                        <td style={{ padding: "10px 12px" }}>
                          <span className={isPass ? "badge-pass" : "badge-fail"} style={{ fontSize: "11px", padding: "3px 8px" }}>
                            {isPass ? "✓ SUITABLE" : "UNSUITABLE"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
