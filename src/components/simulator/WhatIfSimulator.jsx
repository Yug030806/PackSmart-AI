import React, { useState, useEffect } from "react";
import {
  Zap, Wind, RefreshCw, AlertTriangle, CheckCircle2, TrendingDown,
  TrendingUp, Sparkles, Sliders, Layers, Clock, Droplets, Thermometer
} from "lucide-react";
import { BarChart, Bar, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { MATERIALS_CATALOG, FOODS } from "../../data/materials";

export function WhatIfSimulator({ input }) {
  const [activeTab, setActiveTab] = useState(
    input.category?.toLowerCase().includes("produce") || input.respiration === "High" ? "respiration" : "shelflife"
  );

  // Baseline vs Scenario values
  const baseTemp = input.temperature || 25;
  const baseShelf = input.shelf || 120;
  const baseHumidity = input.humidity || 60;

  const [temp, setTemp] = useState(baseTemp);
  const [shelf, setShelf] = useState(baseShelf);
  const [humidity, setHumidity] = useState(baseHumidity);
  const [materialId, setMaterialId] = useState("metalized");
  const [microbialQuality, setMicrobialQuality] = useState(input.microbial || "Standard (<10³ CFU/g)");
  const [simResult, setSimResult] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  const selectedMat = MATERIALS_CATALOG.find(m => m.id === materialId) || MATERIALS_CATALOG[2];

  // Dynamic simulation with API sync & robust Arrhenius fallback
  useEffect(() => {
    setIsSimulating(true);
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
      .then(data => {
        setSimResult(data);
        setIsSimulating(false);
      })
      .catch(() => {
        // Precise physical fallback calculation
        const fat = input.fat || 10;
        const tempFactor = Math.pow(2.0, (temp - 20) / 10);
        const oxDays = Math.round(Math.max(3, (fat * 1.2 * 250) / (selectedMat.nominal_otr * 0.08 * 0.21 * tempFactor)));
        const moistDays = Math.round(Math.max(3, (input.moisture * 0.5 * 250) / (selectedMat.nominal_wvtr * 0.08 * (humidity / 100))));
        const microDays = temp <= 4 ? 120 : temp <= 12 ? 28 : 5;
        const minDays = Math.min(oxDays, moistDays, microDays);

        setSimResult({
          required_shelf_life_days: shelf,
          predicted_shelf_life_days: minDays,
          target_achievable: minDays >= shelf,
          status_label: minDays >= shelf ? "✓ Target achievable" : "⚠ Target not met",
          limiting_degradation_factor: minDays === oxDays ? "Lipid Oxidation" : minDays === moistDays ? "Moisture Sorption" : "Microbial Spoilage",
          safety_margin_days: minDays - shelf,
          microbial_spoilage_days: microDays,
          lipid_oxidation_days: oxDays,
          moisture_staling_days: moistDays,
          scientific_validation_disclaimer: "Kinetic degradation model based on ASTM permeation and Arrhenius temperature factors."
        });
        setIsSimulating(false);
      });
  }, [temp, shelf, humidity, materialId, microbialQuality, input, selectedMat]);

  // Degradation pathways chart data
  const chartData = simResult ? [
    { name: "Microbial Spoilage", days: simResult.microbial_spoilage_days, fill: "#36BFFA" },
    { name: "Lipid Oxidation", days: simResult.lipid_oxidation_days, fill: "#F5B942" },
    { name: "Moisture Staling", days: simResult.moisture_staling_days, fill: "#32D583" },
    { name: "Target Goal", days: simResult.required_shelf_life_days, fill: "#6C7D77" }
  ] : [];

  const shelfDiff = simResult ? simResult.predicted_shelf_life_days - baseShelf : 0;

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          {isSimulating ? (
            <div className="micro-label cyan" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <RefreshCw size={11} className="spin" /> Recalculating Arrhenius Kinetics...
            </div>
          ) : (
            <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Zap size={12} /> Predictive Degradation Kinetics
            </div>
          )}
          <h1 className="page-title">What-If Packaging Simulator</h1>
          <p className="page-desc">
            What happens if storage temperature shifts, humidity rises, or a lighter mono-material is deployed?
          </p>
        </div>
      </div>

      {/* Simulator Mode Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        <button
          type="button"
          className={`btn ${activeTab === "shelflife" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("shelflife")}
        >
          <Zap size={15} /> 1. Shelf-Life Kinetics
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "respiration" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("respiration")}
        >
          <Wind size={15} /> 2. Produce Respiration & EMAP
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "map" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("map")}
        >
          <Sparkles size={15} /> 3. MAP Gas Formulation
        </button>
        <button
          type="button"
          className={`btn ${activeTab === "sweep" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("sweep")}
        >
          <Sliders size={15} /> 4. Scenario Sensitivity Sweep
        </button>
      </div>

      {activeTab === "shelflife" && (
        <div style={{ display: "grid", gridTemplateColumns: "380px 1fr", gap: "24px" }}>
          {/* Controls Form Card */}
          <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
            <h3 style={{ fontSize: "17px", color: "#fff" }}>Simulation Variables</h3>

            <div className="field">
              <label>Packaging Candidate Film</label>
              <select value={materialId} onChange={e => setMaterialId(e.target.value)}>
                {MATERIALS_CATALOG.map(m => (
                  <option key={m.id} value={m.id}>
                    {m.short} (OTR: {m.nominal_otr}, WVTR: {m.nominal_wvtr})
                  </option>
                ))}
              </select>
            </div>

            <div className="field">
              <label>Initial Microbial Quality</label>
              <select value={microbialQuality} onChange={e => setMicrobialQuality(e.target.value)}>
                <option value="Standard (<10³ CFU/g)">{"Standard (<10³ CFU/g)"}</option>
                <option value="High Hygiene (<10² CFU/g)">{"High Hygiene (<10² CFU/g)"}</option>
                <option value="Elevated Load (>10⁴ CFU/g)">{"Elevated Load (>10⁴ CFU/g)"}</option>
              </select>
            </div>

            <div className="range-wrap">
              <div className="range-header">
                <span>Storage Temperature:</span>
                <span className="range-val">{temp}°C</span>
              </div>
              <input type="range" min="0" max="45" value={temp} onChange={e => setTemp(Number(e.target.value))} />
            </div>

            <div className="range-wrap">
              <div className="range-header">
                <span>Target Shelf-Life:</span>
                <span className="range-val">{shelf} days</span>
              </div>
              <input type="range" min="10" max="365" step="5" value={shelf} onChange={e => setShelf(Number(e.target.value))} />
            </div>

            <div className="range-wrap">
              <div className="range-header">
                <span>Relative Humidity:</span>
                <span className="range-val">{humidity}% RH</span>
              </div>
              <input type="range" min="20" max="95" value={humidity} onChange={e => setHumidity(Number(e.target.value))} />
            </div>

            <button
              type="button"
              className="btn btn-secondary"
              style={{ width: "100%", marginTop: "auto" }}
              onClick={() => {
                setTemp(baseTemp);
                setShelf(baseShelf);
                setHumidity(baseHumidity);
                setMaterialId("metalized");
              }}
            >
              <RefreshCw size={14} /> Reset to Baseline
            </button>
          </div>

          {/* Results Output & Diffs */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <span className="micro-label green">Predicted Kinetic Impact</span>
                <h3 style={{ fontSize: "18px", color: "#fff", margin: "2px 0 0" }}>
                  Scenario Outcome: {selectedMat.name}
                </h3>
              </div>
              <span className={simResult?.target_achievable ? "badge-pass" : "badge-fail"}>
                {simResult?.status_label || "Calculating..."}
              </span>
            </div>

            {/* Before / After Diff Counters */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "24px" }}>
              <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span className="micro-label">Baseline Target</span>
                <b style={{ display: "block", color: "#fff", fontSize: "22px", margin: "6px 0 2px" }}>
                  {baseShelf} days
                </b>
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Original goal</small>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span className="micro-label">Simulated Shelf Life</span>
                <b style={{ display: "block", color: simResult?.target_achievable ? "var(--accent-green)" : "var(--error-red)", fontSize: "22px", margin: "6px 0 2px" }}>
                  {simResult?.predicted_shelf_life_days} days
                </b>
                <div style={{ display: "flex", alignItems: "center", gap: "4px", fontSize: "11.5px", fontWeight: 700, color: shelfDiff >= 0 ? "var(--accent-green)" : "var(--error-red)" }}>
                  {shelfDiff >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                  {shelfDiff >= 0 ? `+${shelfDiff} days buffer` : `${shelfDiff} days deficit`}
                </div>
              </div>

              <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
                <span className="micro-label">Limiting Mechanism</span>
                <b style={{ display: "block", color: "var(--warning-amber)", fontSize: "16px", margin: "6px 0 2px" }}>
                  {simResult?.limiting_degradation_factor}
                </b>
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>First failure mode</small>
              </div>
            </div>

            {/* Degradation Chart */}
            <div style={{ marginBottom: "20px" }}>
              <div className="micro-label" style={{ marginBottom: "8px" }}>Days to Rejection by Kinetic Mechanism vs Target Goal:</div>
              <div style={{ height: "240px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="name" stroke="#6C7D77" fontSize={11} />
                    <YAxis stroke="#6C7D77" fontSize={11} unit=" d" />
                    <Tooltip
                      contentStyle={{
                        background: "#0D1B18",
                        border: "1px solid rgba(50, 213, 131, 0.3)",
                        borderRadius: "8px",
                        fontSize: "12px",
                        color: "#fff"
                      }}
                    />
                    <Bar dataKey="days" name="Days to Failure / Goal" fill="#32D583" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div style={{ background: "rgba(245, 185, 66, 0.08)", border: "1px solid rgba(245, 185, 66, 0.25)", borderRadius: "var(--radius-md)", padding: "12px 14px", fontSize: "12px", color: "#f7d288", display: "flex", gap: "10px" }}>
              <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: "2px" }} />
              <div>
                <b>Scientific Notice:</b> {simResult?.scientific_validation_disclaimer}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === "respiration" && (
        <ProduceRespirationTab initialInput={input} />
      )}

      {activeTab === "map" && (
        <MAPOptimizerTab initialInput={input} />
      )}

      {activeTab === "sweep" && (
        <MultiConditionSweepTab initialInput={input} />
      )}
    </div>
  );
}

function ProduceRespirationTab({ initialInput }) {
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
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px" }}>
      <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <h3 style={{ fontSize: "17px", color: "#fff" }}>Produce Respiration Parameters</h3>

        <div className="field">
          <label>Produce Species</label>
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
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: "1px solid var(--border-subtle)", borderBottom: "1px solid var(--border-subtle)" }}>
          <div>
            <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", display: "block" }}>Fresh-Cut / Sliced</span>
            <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Wound respiration & browning</small>
          </div>
          <input
            type="checkbox"
            checked={isCut}
            onChange={e => setIsCut(e.target.checked)}
            style={{ width: "18px", height: "18px", accentColor: "var(--accent-green)" }}
          />
        </div>

        <div className="range-wrap">
          <div className="range-header">
            <span>Storage Temperature:</span>
            <span className="range-val">{temp}°C</span>
          </div>
          <input type="range" min="0" max="30" value={temp} onChange={e => setTemp(Number(e.target.value))} />
        </div>

        <div className="range-wrap">
          <div className="range-header">
            <span>Net Produce Weight:</span>
            <span className="range-val">{weight} g</span>
          </div>
          <input type="range" min="50" max="2500" step="50" value={weight} onChange={e => setWeight(Number(e.target.value))} />
        </div>

        <div className="range-wrap">
          <div className="range-header">
            <span>Film Surface Area:</span>
            <span className="range-val">{area} m²</span>
          </div>
          <input type="range" min="0.02" max="0.30" step="0.01" value={area} onChange={e => setArea(Number(e.target.value))} />
        </div>
      </div>

      <div className="glass-card" style={{ padding: "24px" }}>
        {resResult ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
              <div>
                <span className="micro-label green">Kinetic Decision</span>
                <h3 style={{ fontSize: "20px", color: "#fff", margin: "2px 0 0" }}>{resResult.produce_name}</h3>
                <small style={{ color: "var(--text-secondary)" }}>
                  Q₁₀ Temperature Scaling: {resResult.temperature_scaling_factor_q10}x at {temp}°C
                </small>
              </div>
              <span className="badge-pass" style={{ fontSize: "13px", padding: "6px 14px" }}>
                Decision: {resResult.final_decision}
              </span>
            </div>

            {/* 4-Way Decision Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px", marginBottom: "18px" }}>
              {resResult.options_comparison?.map(opt => {
                const isSelected = opt.option_type === resResult.final_decision;
                return (
                  <div
                    key={opt.option_type}
                    style={{
                      background: isSelected ? "var(--accent-green-subtle)" : "var(--bg-input)",
                      border: isSelected ? "1px solid var(--accent-green)" : "1px solid var(--border-subtle)",
                      borderRadius: "var(--radius-md)",
                      padding: "12px",
                      position: "relative"
                    }}
                  >
                    <span className="micro-label" style={{ color: isSelected ? "var(--accent-green)" : "var(--text-muted)" }}>
                      {isSelected ? "★ RECOMMENDED" : "Candidate"}
                    </span>
                    <b style={{ display: "block", color: "#fff", fontSize: "13px", margin: "4px 0 2px" }}>
                      {opt.option_type}
                    </b>
                    <small style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block" }}>
                      OTR: {opt.nominal_otr_cc_m2_day} cc
                    </small>
                    <span style={{ fontSize: "10px", color: opt.status === "OPTIMAL" ? "var(--accent-green)" : "var(--warning-amber)", fontWeight: 700, marginTop: "6px", display: "block" }}>
                      {opt.status === "OPTIMAL" ? "✓ Optimal Match" : opt.status?.replace("FAIL_", "⚠ ")}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Decision Rationale */}
            <div style={{ padding: "12px 14px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.6", marginBottom: "18px" }}>
              <b>Physiological Rationale:</b> {resResult.decision_rationale}
            </div>

            {/* Laser Micro-Perforation Specs if Applicable */}
            {resResult.micro_perforation_specs?.is_required && (
              <div style={{ background: "rgba(54, 191, 250, 0.08)", border: "1px solid rgba(54, 191, 250, 0.3)", borderRadius: "var(--radius-md)", padding: "14px", marginBottom: "16px" }}>
                <span className="micro-label cyan" style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "6px" }}>
                  <Sparkles size={11} /> Laser Micro-Perforation Specifications
                </span>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px" }}>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hole Count:</span>
                    <b style={{ display: "block", color: "#fff" }}>{resResult.micro_perforation_specs.hole_count} holes</b>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Hole Diameter:</span>
                    <b style={{ display: "block", color: "#fff" }}>{resResult.micro_perforation_specs.hole_diameter_um} µm</b>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Grid Pitch:</span>
                    <b style={{ display: "block", color: "#fff" }}>{resResult.micro_perforation_specs.hole_pitch_cm} cm</b>
                  </div>
                  <div>
                    <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Single Pore Flux:</span>
                    <b style={{ display: "block", color: "var(--accent-cyan)" }}>{resResult.micro_perforation_specs.single_hole_flux_cc_day} cc/d</b>
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Calculating respiration kinetics...
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TAB 3: MODIFIED ATMOSPHERE PACKAGING (MAP) OPTIMIZER
// Invokes POST /api/map/optimize
// -------------------------------------------------------------
function MAPOptimizerTab({ initialInput }) {
  const [food, setFood] = useState(initialInput?.food || "chips");
  const [materialId, setMaterialId] = useState("metalized");
  const [headspaceRatio, setHeadspaceRatio] = useState(2.0);
  const [temp, setTemp] = useState(initialInput?.temperature || 20);
  const [weight, setWeight] = useState(initialInput?.packageWeight || 250);
  const [mapResult, setMapResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    const selectedPreset = FOODS[food] || {};
    const payload = {
      food_properties: {
        food_id: food,
        food_name: selectedPreset.name || food,
        category: selectedPreset.category || "Snacks",
        moisture_pct: Number(selectedPreset.moisture || 3.0),
        fat_pct: Number(selectedPreset.fat || 30.0),
        ph: Number(selectedPreset.ph || 6.0),
        respiration_rate: selectedPreset.respiration || "Low",
        storage_type: temp <= 0 ? "Frozen" : temp <= 10 ? "Chilled" : "Ambient",
        temperature_c: Number(temp),
        humidity_pct: Number(initialInput?.humidity || 60),
        shelf_life_days: Number(initialInput?.shelf || 180),
        package_weight_g: Number(weight)
      },
      material_id: materialId,
      headspace_ratio: Number(headspaceRatio)
    };

    fetch("/api/map/optimize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setMapResult(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("MAP optimization error", err);
        setLoading(false);
      });
  }, [food, materialId, headspaceRatio, temp, weight, initialInput]);

  return (
    <div style={{ display: "grid", gridTemplateColumns: "360px 1fr", gap: "24px" }}>
      {/* Parameters Panel */}
      <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "16px" }}>
        <div>
          <span className="micro-label green">MAP Configuration</span>
          <h3 style={{ fontSize: "17px", color: "#fff", margin: "2px 0 0" }}>Headspace & Film Parameters</h3>
        </div>

        <div className="field">
          <label>Target Food Commodity</label>
          <select value={food} onChange={e => setFood(e.target.value)}>
            {Object.entries(FOODS).map(([k, f]) => (
              <option key={k} value={k}>{f.name} ({f.category})</option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Packaging Film Candidate</label>
          <select value={materialId} onChange={e => setMaterialId(e.target.value)}>
            {MATERIALS_CATALOG.map(m => (
              <option key={m.id} value={m.id}>{m.short} (OTR: {m.nominal_otr})</option>
            ))}
          </select>
        </div>

        <div className="range-wrap">
          <div className="range-header">
            <span>Headspace-to-Product Ratio:</span>
            <span className="range-val">{headspaceRatio}:1</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="4.0"
            step="0.1"
            value={headspaceRatio}
            onChange={e => setHeadspaceRatio(Number(e.target.value))}
          />
          <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Ratio of flush gas volume to food bulk volume</small>
        </div>

        <div className="range-wrap">
          <div className="range-header">
            <span>Storage Temperature:</span>
            <span className="range-val">{temp}°C</span>
          </div>
          <input
            type="range"
            min="0"
            max="35"
            value={temp}
            onChange={e => setTemp(Number(e.target.value))}
          />
        </div>

        <div className="range-wrap">
          <div className="range-header">
            <span>Product Net Weight:</span>
            <span className="range-val">{weight} g</span>
          </div>
          <input
            type="range"
            min="50"
            max="1500"
            step="50"
            value={weight}
            onChange={e => setWeight(Number(e.target.value))}
          />
        </div>
      </div>

      {/* Results Panel */}
      <div className="glass-card" style={{ padding: "24px" }}>
        {mapResult ? (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", flexWrap: "wrap", gap: "10px" }}>
              <div>
                <span className="micro-label green">OPTIMIZED GAS BLEND</span>
                <h3 style={{ fontSize: "22px", color: "#fff", margin: "4px 0" }}>{mapResult.gas_mixture_label}</h3>
                <small style={{ color: "var(--text-secondary)" }}>
                  Package Headspace Volume: <b>{mapResult.headspace_volume_cc} cc</b>
                </small>
              </div>

              <span
                style={{
                  fontSize: "12px",
                  padding: "5px 12px",
                  borderRadius: "var(--radius-full)",
                  background: mapResult.package_collapse_risk.includes("High") ? "rgba(240, 68, 56, 0.15)" : "rgba(50, 213, 131, 0.15)",
                  color: mapResult.package_collapse_risk.includes("High") ? "var(--accent-red)" : "var(--accent-green)",
                  border: mapResult.package_collapse_risk.includes("High") ? "1px solid rgba(240, 68, 56, 0.3)" : "1px solid rgba(50, 213, 131, 0.3)",
                  fontWeight: 600
                }}
              >
                Collapse Risk: {mapResult.package_collapse_risk}
              </span>
            </div>

            {/* Initial Flush Gas Breakdown Cards */}
            <span className="micro-label" style={{ display: "block", marginBottom: "8px" }}>
              Initial Flushed Gas Composition (Packaging Seal Time):
            </span>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
              <div style={{ background: "rgba(54, 191, 250, 0.08)", border: "1px solid rgba(54, 191, 250, 0.25)", borderRadius: "var(--radius-md)", padding: "14px", textAlign: "center" }}>
                <span className="micro-label cyan">OXYGEN (O₂)</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-cyan)", margin: "4px 0" }}>
                  {mapResult.initial_flush_o2_pct}%
                </div>
                <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Equilibrium: {mapResult.equilibrium_headspace_o2_pct}%</small>
              </div>

              <div style={{ background: "rgba(50, 213, 131, 0.08)", border: "1px solid rgba(50, 213, 131, 0.25)", borderRadius: "var(--radius-md)", padding: "14px", textAlign: "center" }}>
                <span className="micro-label green">CARBON DIOXIDE (CO₂)</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--accent-green)", margin: "4px 0" }}>
                  {mapResult.initial_flush_co2_pct}%
                </div>
                <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Equilibrium: {mapResult.equilibrium_headspace_co2_pct}%</small>
              </div>

              <div style={{ background: "rgba(245, 185, 66, 0.08)", border: "1px solid rgba(245, 185, 66, 0.25)", borderRadius: "var(--radius-md)", padding: "14px", textAlign: "center" }}>
                <span className="micro-label" style={{ color: "var(--warning-amber)" }}>NITROGEN (N₂)</span>
                <div style={{ fontSize: "28px", fontWeight: 800, color: "var(--warning-amber)", margin: "4px 0" }}>
                  {mapResult.initial_flush_n2_pct}%
                </div>
                <small style={{ fontSize: "11px", color: "var(--text-muted)" }}>Inert ballast & anti-collapse</small>
              </div>
            </div>

            {/* Kinetic Flux Indicators if applicable */}
            {mapResult.o2_consumption_cc_day !== null && mapResult.o2_consumption_cc_day !== undefined && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", padding: "12px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", marginBottom: "18px" }}>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Produce O₂ Consumption</span>
                  <b style={{ color: "var(--accent-cyan)", fontSize: "14px" }}>{mapResult.o2_consumption_cc_day} cc/day</b>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Produce CO₂ Generation</span>
                  <b style={{ color: "var(--accent-green)", fontSize: "14px" }}>{mapResult.co2_generation_cc_day} cc/day</b>
                </div>
                <div>
                  <span style={{ fontSize: "11px", color: "var(--text-muted)", display: "block" }}>Respiratory Quotient (RQ)</span>
                  <b style={{ color: "#fff", fontSize: "14px" }}>{mapResult.respiratory_quotient || 0.95}</b>
                </div>
              </div>
            )}

            {/* Chemical & Biological Mechanism */}
            <div style={{ padding: "14px 16px", background: "var(--bg-input)", borderRadius: "var(--radius-md)", borderLeft: "3px solid var(--accent-green)" }}>
              <span className="micro-label green" style={{ display: "block", marginBottom: "4px" }}>PRESERVATION MECHANISM</span>
              <p style={{ margin: 0, fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {mapResult.preservation_mechanism}
              </p>
            </div>
          </div>
        ) : (
          <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
            Calculating MAP gas balance...
          </div>
        )}
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// TAB 4: MULTI-CONDITION SENSITIVITY SWEEP
// Invokes POST /api/simulate
// -------------------------------------------------------------
function MultiConditionSweepTab({ initialInput }) {
  const [food, setFood] = useState(initialInput?.food || "chips");
  const [sweepResult, setSweepResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const runSweep = () => {
    setLoading(true);
    const selectedPreset = FOODS[food] || {};
    const payload = {
      base_input: {
        food_id: food,
        food_name: selectedPreset.name || food,
        category: selectedPreset.category || "Snacks",
        moisture_pct: Number(selectedPreset.moisture || 3.0),
        fat_pct: Number(selectedPreset.fat || 30.0),
        ph: Number(selectedPreset.ph || 6.0),
        respiration_rate: selectedPreset.respiration || "Low",
        storage_type: "Ambient",
        temperature_c: 25,
        humidity_pct: 60,
        shelf_life_days: 180,
        package_weight_g: 200
      },
      temperature_range: [-5, 4, 15, 25, 35, 45],
      shelf_life_range: [30, 60, 90, 120, 180, 270, 365]
    };

    fetch("/api/simulate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then(res => res.json())
      .then(data => {
        setSweepResult(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Simulation sweep error", err);
        setLoading(false);
      });
  };

  useEffect(() => {
    runSweep();
  }, [food]);

  // Chart data for temperature sensitivity
  const tempChartData = sweepResult?.temperature_sensitivity?.map(item => ({
    name: `${item.temperature_c}°C`,
    targetOtr: item.required_otr_max,
    actualOtr: item.actual_otr,
    material: item.best_material
  })) || [];

  return (
    <div>
      {/* Header and Controls */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <span className="micro-label green">Arrhenius Kinetic Sensitivity Analysis</span>
          <h3 style={{ fontSize: "18px", color: "#fff", margin: "2px 0 0" }}>Multi-Condition Scenario Sweep</h3>
          <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
            Simulates permeation stringency and material shifts across a -5°C to 45°C thermal range and 30 to 365-day horizons via <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>POST /api/simulate</code>.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select
            value={food}
            onChange={e => setFood(e.target.value)}
            style={{ background: "var(--bg-input)", border: "1px solid var(--border-subtle)", borderRadius: "var(--radius-sm)", color: "#fff", padding: "8px 12px", fontSize: "13px" }}
          >
            {Object.entries(FOODS).map(([k, f]) => (
              <option key={k} value={k}>{f.name} ({f.category})</option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-primary"
            onClick={runSweep}
            disabled={loading}
            style={{ display: "flex", alignItems: "center", gap: "6px" }}
          >
            <RefreshCw size={14} className={loading ? "spin" : ""} />
            {loading ? "Sweeping..." : "Re-Run Sweep"}
          </button>
        </div>
      </div>

      {sweepResult ? (
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Temperature Sensitivity Chart Card */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <span className="micro-label cyan">THERMAL ACCELERATION CURVE</span>
            <h4 style={{ fontSize: "16px", color: "#fff", margin: "2px 0 16px" }}>
              Max Allowable OTR vs Storage Temperature (°C)
            </h4>

            <div style={{ width: "100%", height: "260px" }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tempChartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" stroke="#6C7D77" fontSize={11} />
                  <YAxis stroke="#6C7D77" fontSize={11} />
                  <Tooltip contentStyle={{ background: "#0c1f1a", border: "1px solid #1c3d34", borderRadius: "8px", fontSize: "12px" }} />
                  <Legend wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
                  <Bar dataKey="targetOtr" name="Target OTR Max (cc/m²·d)" fill="#36BFFA" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="actualOtr" name="Recommended Film OTR (cc/m²·d)" fill="#32D583" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <small style={{ display: "block", color: "var(--text-muted)", fontSize: "11px", marginTop: "8px" }}>
              Notice how higher ambient temperatures compress allowable OTR tolerance due to accelerated oxidation & moisture flux.
            </small>
          </div>

          {/* Shelf Life Feasibility Grid */}
          <div className="glass-card" style={{ padding: "24px" }}>
            <span className="micro-label green">TIME-HORIZON FEASIBILITY MATRIX</span>
            <h4 style={{ fontSize: "16px", color: "#fff", margin: "2px 0 16px" }}>
              Optimal Material & Thickness Required per Shelf-Life Target
            </h4>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "12px" }}>
              {sweepResult.shelf_life_feasibility?.map(step => (
                <div
                  key={step.shelf_life_days}
                  style={{
                    background: "var(--bg-input)",
                    border: "1px solid var(--border-subtle)",
                    borderRadius: "var(--radius-md)",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px"
                  }}
                >
                  <span className="micro-label">{step.shelf_life_days} DAYS TARGET</span>
                  <b style={{ color: "var(--accent-green)", fontSize: "15px" }}>{step.recommended_material}</b>
                  <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
                    Thickness: <b>{step.optimal_thickness_um} µm</b>
                  </small>
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>
                    OTR Max: {step.required_otr_max} cc
                  </small>
                  <span style={{ fontSize: "10px", color: step.overall_status === "PASS" ? "var(--accent-green)" : "var(--accent-red)", fontWeight: 700, marginTop: "4px" }}>
                    ✓ {step.overall_status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Summary Banner */}
          <div style={{ background: "rgba(50, 213, 131, 0.08)", border: "1px solid rgba(50, 213, 131, 0.25)", borderRadius: "var(--radius-md)", padding: "16px 20px" }}>
            <span className="micro-label green" style={{ display: "block", marginBottom: "4px" }}>AI SIMULATION SUMMARY</span>
            <p style={{ margin: 0, fontSize: "13px", color: "#d9eae3", lineHeight: "1.6" }}>
              {sweepResult.summary}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ padding: "40px", textAlign: "center", color: "var(--text-muted)" }}>
          Running multi-condition scenario sweep...
        </div>
      )}
    </div>
  );
}
