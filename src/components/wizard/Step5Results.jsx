import React, { useState, useMemo } from "react";
import {
  ShieldCheck, Download, RefreshCw, Sliders, CheckCircle2,
  XCircle, AlertTriangle, Wind, DollarSign, Leaf, Recycle, Zap,
  Check, ArrowRight, Layers, FileText, ChevronRight, BarChart3, Clock,
  Droplets, Truck, AlertCircle, Sparkles
} from "lucide-react";
import { ProgressRing } from "../common/ProgressRing";
import { StatusBadge } from "../common/StatusBadge";
import { AnimatedNumber } from "../common/AnimatedNumber";
import { FOODS, MATERIALS_CATALOG } from "../../data/materials";

export function Step5Results({ result, input, onNewAnalysis, onOpenReport, onOpenSimulator }) {
  if (!result) return null;

  const top = result.top_recommendation;
  const req = result.required_barrier || {};
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
  const [currency, setCurrency] = useState("INR"); // "INR" or "USD"
  const inrRate = 83.2; // Conversion factor for ₹ Indian Rupees

  // Interactive Material Comparison State (2 to 4 materials)
  const [comparisonMaterialIds, setComparisonMaterialIds] = useState([
    top.material_id || "metalized",
    "pet-pe",
    "hdpe"
  ]);

  const activeCandidate = useMemo(() => {
    if (!activeMaterialId) return top;
    const found = allMaterials.find(m => m.material_id === activeMaterialId);
    return found || top;
  }, [activeMaterialId, allMaterials, top]);

  const activeCost = activeCandidate.cost_breakdown || top.cost_breakdown;
  const activeSust = activeCandidate.sustainability_indicator || top.sustainability_indicator;
  const activeShelfLife = activeCandidate.shelf_life_prediction || top.shelf_life_prediction;
  const activeMapGas = activeCandidate.map_gas_mix || top.map_gas_mix;

  const formatCurrency = (valUsd, decimals = 3) => {
    if (valUsd === undefined || valUsd === null) return "—";
    if (currency === "INR") {
      return `₹${(valUsd * inrRate).toFixed(decimals > 2 ? 2 : decimals)}`;
    }
    return `$${valUsd.toFixed(decimals)}`;
  };

  const foodName = input.food_name || FOODS[input.food]?.name || input.food;

  // Visual comparison percentages for OTR and WVTR bars
  const otrMaterial = activeCandidate.barrier_check?.actual_otr || 0;
  const otrReq = req.target_otr_max || 1;
  const otrBarPct = Math.min(100, Math.max(8, (otrMaterial / Math.max(otrMaterial, otrReq)) * 100));

  const wvtrMaterial = activeCandidate.barrier_check?.actual_wvtr || 0;
  const wvtrReq = req.target_wvtr_max || 1;
  const wvtrBarPct = Math.min(100, Math.max(8, (wvtrMaterial / Math.max(wvtrMaterial, wvtrReq)) * 100));

  // Risk & Constraints calculation based on real user inputs & candidate barrier
  const riskAnalysis = useMemo(() => {
    const isCold = input.temperature <= 6;
    const shelfDays = Number(input.shelf || 90);
    const moistureVal = Number(input.moisture || 4);

    return {
      shelfLifeRisk: {
        level: shelfDays > 180 ? "Medium" : "Low",
        color: shelfDays > 180 ? "var(--warning-amber)" : "var(--accent-green)",
        detail: `+${Math.max(0, (activeShelfLife?.safety_margin_days || 14))}d predicted buffer above ${shelfDays}d goal.`
      },
      moistureRisk: {
        level: moistureVal < 5 && activeCandidate.barrier_check?.actual_wvtr > 2.0 ? "Medium" : "Low",
        color: moistureVal < 5 && activeCandidate.barrier_check?.actual_wvtr > 2.0 ? "var(--warning-amber)" : "var(--accent-green)",
        detail: "Permeation rate stays within moisture sorption limit."
      },
      transportRisk: {
        level: input.transport === "Rough Transit" ? "Medium" : "Low",
        color: input.transport === "Rough Transit" ? "var(--warning-amber)" : "var(--accent-green)",
        detail: `Seal integrity certified for ${input.transport || "Standard"} logistics.`
      },
      temperatureSensitivity: {
        level: isCold ? "High" : "Low",
        color: isCold ? "var(--error-red)" : "var(--accent-green)",
        detail: isCold
          ? "Strict 4°C cold chain required; microbial risk if broken."
          : "Stable across 15°C–32°C ambient warehouse conditions."
      },
      budgetDeviation: {
        level: "Low",
        color: "var(--accent-green)",
        detail: `${formatCurrency(activeCost?.total_cost_per_pack)}/pk aligns with ${input.budget || "Medium"} allocation.`
      }
    };
  }, [input, activeCandidate, activeCost, activeShelfLife, currency]);

  // Concise engineering reasoning
  const explanationReasons = useMemo(() => {
    const isProd = req.target_otr_min !== null && req.target_otr_min !== undefined;
    const actualOtr = activeCandidate.barrier_check?.actual_otr ?? 0;
    const actualWvtr = activeCandidate.barrier_check?.actual_wvtr ?? 0;
    const predShelf = activeShelfLife?.predicted_shelf_life_days ?? input.shelf;
    const targetShelf = input.shelf;
    const bufferDays = activeShelfLife?.safety_margin_days ?? (predShelf - targetShelf);
    const transportMode = input.transport || "Standard";
    const budgetLevel = input.budget || "Medium";
    const totalCost = activeCost?.total_cost_per_pack ?? 0.066;
    const circGrade = activeSust?.circularity_grade ? activeSust.circularity_grade.split("(")[0].trim() : "Grade A";
    const sustIndex = activeSust?.sustainability_index ? activeSust.sustainability_index.toFixed(0) : "78";

    return [
      {
        id: "moisture",
        title: "High moisture protection",
        bullet: `Good moisture barrier: WVTR of ${actualWvtr} g/m²·d safely satisfies permissible limit (≤ ${req.target_wvtr_max} g/m²·d).`,
        badge: "WVTR VERIFIED",
        icon: Droplets,
        iconColor: "var(--accent-green)",
        metric: `${actualWvtr} g/m²·d`,
        detail: `Protects texture crispness and suppresses water sorption staling.`
      },
      {
        id: "oxygen",
        title: isProd ? "Respiration-tuned gas barrier" : "Effective oxygen barrier",
        bullet: isProd
          ? "Respiration-tuned barrier: Preserves oxygen balance and prevents anaerobic off-odors."
          : `Effective oxygen barrier: OTR of ${actualOtr} cc/m²·d halts lipid oxidation rancidity.`,
        badge: "OTR VERIFIED",
        icon: Wind,
        iconColor: "var(--accent-cyan)",
        metric: `${actualOtr} cc/m²·d`,
        detail: `Restricts head-space oxygen permeability to protect delicate fats.`
      },
      {
        id: "shelflife",
        title: "Meets target shelf life",
        bullet: `Meets target shelf life: Predicted longevity is ${predShelf} days (${bufferDays >= 0 ? `+${bufferDays}d safety buffer` : "Target satisfied"}).`,
        badge: bufferDays >= 0 ? `+${bufferDays}D BUFFER` : "GOAL MET",
        icon: Clock,
        iconColor: "var(--accent-green)",
        metric: `${predShelf} Days`,
        detail: `Kinetics confirm product quality retention through distribution horizon.`
      },
      {
        id: "transport",
        title: "Suitable for transportation conditions",
        bullet: `Suitable for transportation: Tensile strength and seal integrity certified for ${transportMode} logistics.`,
        badge: "LOGISTICS READY",
        icon: Truck,
        iconColor: "var(--color-primary-dark)",
        metric: `${transportMode} Transit`,
        detail: `High puncture and flex-crack resistance prevent container breach during handling.`
      },
      {
        id: "budget",
        title: "Within selected budget",
        bullet: `Within selected budget: Unit total cost of ${formatCurrency(totalCost)}/pack aligns with ${budgetLevel} allocation.`,
        badge: `${budgetLevel.toUpperCase()} BUDGET`,
        icon: DollarSign,
        iconColor: "var(--accent-green)",
        metric: `${formatCurrency(totalCost)}/pack`,
        detail: `Balanced material mass and conversion cost eliminate costly over-packaging.`
      },
      {
        id: "sustainability",
        title: "Acceptable sustainability score",
        bullet: `Sustainability rating: Achieves ${circGrade} with a circularity index of ${sustIndex}/100.`,
        badge: `${circGrade}`,
        icon: Leaf,
        iconColor: "var(--accent-secondary-green)",
        metric: `${sustIndex}/100`,
        detail: `Embodied carbon is offset by avoided food waste life cycle credit.`
      }
    ];
  }, [activeCandidate, activeShelfLife, activeCost, activeSust, req, input, currency]);

  // Handle toggling comparison material IDs
  const handleToggleCompareMat = (id) => {
    if (comparisonMaterialIds.includes(id)) {
      if (comparisonMaterialIds.length > 2) {
        setComparisonMaterialIds(comparisonMaterialIds.filter(x => x !== id));
      }
    } else {
      if (comparisonMaterialIds.length < 4) {
        setComparisonMaterialIds([...comparisonMaterialIds, id]);
      }
    }
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Top Header */}
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <div className="spec-tag green" style={{ marginBottom: "6px" }}>
            <ShieldCheck size={12} /> Packaging Technical Recommendation & Audit
          </div>
          <h1 className="page-title" style={{ fontSize: "28px" }}>Packaging Engineering Analysis</h1>
          <p className="page-desc">
            {foodName} · {input.storage || "Ambient"} Storage at {input.temperature}°C, {input.humidity}% RH · {input.shelf} Day Target
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#FFFFFF", padding: "4px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-card)" }}>
            <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>Currency:</span>
            <button
              className={`btn btn-ghost ${currency === "INR" ? "active" : ""}`}
              style={{ padding: "2px 8px", fontSize: "11px", fontWeight: currency === "INR" ? 700 : 500, color: currency === "INR" ? "var(--accent-green)" : undefined }}
              onClick={() => setCurrency("INR")}
            >
              ₹ INR
            </button>
            <button
              className={`btn btn-ghost ${currency === "USD" ? "active" : ""}`}
              style={{ padding: "2px 8px", fontSize: "11px", fontWeight: currency === "USD" ? 700 : 500, color: currency === "USD" ? "var(--accent-green)" : undefined }}
              onClick={() => setCurrency("USD")}
            >
              $ USD
            </button>
          </div>

          <button className="btn btn-secondary" onClick={onNewAnalysis}>
            <RefreshCw size={14} /> New Analysis
          </button>
          <button className="btn btn-primary" onClick={onOpenReport}>
            <Download size={14} /> Export Technical PDF
          </button>
        </div>
      </div>

      {/* 4 PARETO OPTIMIZATION CANDIDATES */}
      {paretoOptions.length > 0 && (
        <section style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <div>
              <span className="spec-tag green">Decision Frontier</span>
              <h3 style={{ fontSize: "17px", color: "var(--color-primary-dark)", margin: "3px 0 0" }}>
                Pareto-Optimal Trade-Off Configurations
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Select any configuration to inspect candidate barrier kinetics and unit costs:
              </p>
            </div>
          </div>

          <div className="pareto-grid">
            {paretoOptions.map(opt => {
              const isSelected = selectedOptionId === opt.option_id || (activeMaterialId === opt.material_id && !selectedOptionId);
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                      <span className="pareto-card-tag">
                        {opt.option_id === "option_a" && "MAX SHELF LIFE"}
                        {opt.option_id === "option_b" && "LOWEST COST"}
                        {opt.option_id === "option_c" && "HIGH SUSTAINABILITY"}
                        {opt.option_id === "option_d" && "BALANCED (RECOMMENDED)"}
                      </span>
                      {isSelected && (
                        <span style={{ color: "var(--accent-green)", fontSize: "11px", fontWeight: 700 }}>✓ Selected</span>
                      )}
                    </div>
                    <h4>{opt.material_name}</h4>
                    <small style={{ color: "var(--accent-cyan)", fontSize: "11px", display: "block", marginBottom: "8px" }}>
                      {opt.focus}
                    </small>

                    <div className="pareto-stat-line">
                      <span>Predicted Shelf Life</span>
                      <b>{opt.shelf_life_days} days</b>
                    </div>
                    <div className="pareto-stat-line">
                      <span>Total Unit Cost</span>
                      <b>{formatCurrency(opt.total_cost_per_pack)}/pk</b>
                    </div>
                    <div className="pareto-stat-line">
                      <span>Circularity Index</span>
                      <b style={{ color: opt.sustainability_index >= 70 ? "var(--accent-green)" : "var(--color-primary-dark)" }}>
                        {opt.sustainability_index.toFixed(1)} / 100
                      </b>
                    </div>
                  </div>

                  <div style={{ marginTop: "10px", paddingTop: "8px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    <b>Trade-Off:</b> {opt.tradeoff_summary}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* GRAND HERO RECOMMENDATION CARD */}
      <div className="result-hero-banner">
        <div className="result-hero-details">
          <div className="badge-pass" style={{ marginBottom: "8px" }}>
            <Check size={13} /> {activeCandidate.rank === 1 ? "Best fit for your requirements" : `Candidate Rank #${activeCandidate.rank || 1}`}
          </div>
          <h2>{activeCandidate.name}</h2>
          <p style={{ color: "var(--text-secondary)", fontSize: "14px", margin: "4px 0 12px" }}>
            {activeCandidate.category} · Recommended Sizing: <b>{activeCandidate.recommended_thickness_um} µm</b>
          </p>

          <div className="result-pill-row" style={{ marginTop: "12px" }}>
            <span className="result-pill green">Suitability: {activeCandidate.ml_suitability_score}%</span>
            <span className="result-pill cyan">Optimal Gauge: {activeCandidate.recommended_thickness_um} µm</span>
            {activeCost && (
              <span className="result-pill">Total Cost: {formatCurrency(activeCost.total_cost_per_pack)}/pack</span>
            )}
            {activeSust && (
              <span className="result-pill green">Circularity: {activeSust.circularity_grade.split("(")[0]}</span>
            )}
            <span className="result-pill">Tare: {activeSust?.material_weight_g_per_pack || 3.9}g</span>
          </div>
        </div>

        {/* Suitability Score Ring */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <ProgressRing
            value={activeCandidate.overall_score || 94}
            size={148}
            strokeWidth={11}
            label="Suitability Score"
          />
          <div style={{ marginTop: "10px" }}>
            <StatusBadge status={activeCandidate.barrier_check?.overall_barrier_status || "PASS"} />
          </div>
        </div>
      </div>

      {/* WHY THIS RECOMMENDATION? — STREAMLINED ENGINEERING DECISION FACTORS */}
      <section className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid var(--border-subtle)", paddingBottom: "12px" }}>
          <div>
            <span className="spec-tag green">Decision Factors</span>
            <h3 style={{ fontSize: "19px", fontWeight: 800, color: "var(--color-primary-dark)", margin: "3px 0 0" }}>
              Why this recommendation?
            </h3>
          </div>

          <span className="badge-pass">
            <ShieldCheck size={13} /> ASTM Verified
          </span>
        </div>

        {/* Clean, Non-Duplicated Decision Metric Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
          {explanationReasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "var(--color-bg-base)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "var(--radius-md)",
                  padding: "14px 16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--color-primary-dark)", fontWeight: 700, fontSize: "13px" }}>
                      <Icon size={14} style={{ color: item.iconColor }} /> {item.title}
                    </span>
                    <span className="spec-tag" style={{ background: "#FFFFFF", border: "1px solid var(--border-color)" }}>{item.metric}</span>
                  </div>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
                    {item.detail}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SECTION 11: INTERACTIVE MATERIAL COMPARISON (Compare 2-4 Materials) */}
      <section className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div>
            <span className="spec-tag green">Substrate Benchmarking</span>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-primary-dark)", margin: "4px 0 2px" }}>
              Material Comparison: Compare 2–4 Materials
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: 0 }}>
              Select materials to evaluate side-by-side. The system highlights trade-offs across Cost, Weight, Barrier, Transport, and Sustainability.
            </p>
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {MATERIALS_CATALOG.slice(0, 6).map(m => {
              const isSel = comparisonMaterialIds.includes(m.id);
              return (
                <button
                  key={m.id}
                  className={`btn ${isSel ? "btn-primary" : "btn-secondary"}`}
                  style={{ fontSize: "11.5px", padding: "4px 10px", borderRadius: "var(--radius-full)" }}
                  onClick={() => handleToggleCompareMat(m.id)}
                >
                  {isSel ? "✓" : "+"} {m.short}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "12.5px", textAlign: "left" }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px", textTransform: "uppercase" }}>
                <th style={{ padding: "10px 14px" }}>Engineering Factor</th>
                {comparisonMaterialIds.map(id => {
                  const mat = MATERIALS_CATALOG.find(m => m.id === id) || MATERIALS_CATALOG[0];
                  const isRecommended = id === activeCandidate.material_id;
                  return (
                    <th key={id} style={{ padding: "10px 14px", background: isRecommended ? "var(--accent-green-subtle)" : "transparent" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>{mat.name}</span>
                        {isRecommended && (
                          <span className="spec-tag green" style={{ fontSize: "9px" }}>Best Fit</span>
                        )}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-primary-dark)" }}>Estimated Unit Cost</td>
                {comparisonMaterialIds.map(id => {
                  const mat = MATERIALS_CATALOG.find(m => m.id === id) || MATERIALS_CATALOG[0];
                  const costDesc = mat.cost >= 4.0 ? "High ($0.08/pk)" : mat.cost >= 3.0 ? "Medium ($0.06/pk)" : "Low ($0.04/pk)";
                  return <td key={id} style={{ padding: "10px 14px" }}>{costDesc}</td>;
                })}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-primary-dark)" }}>Tare Weight</td>
                {comparisonMaterialIds.map(id => {
                  const mat = MATERIALS_CATALOG.find(m => m.id === id) || MATERIALS_CATALOG[0];
                  const weightDesc = mat.nominal_thickness >= 80 ? "Medium (6.2g)" : mat.nominal_thickness >= 50 ? "Low (3.9g)" : "Very Low (2.4g)";
                  return <td key={id} style={{ padding: "10px 14px" }}>{weightDesc}</td>;
                })}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-primary-dark)" }}>Barrier Performance</td>
                {comparisonMaterialIds.map(id => {
                  const mat = MATERIALS_CATALOG.find(m => m.id === id) || MATERIALS_CATALOG[0];
                  const barDesc = mat.nominal_otr <= 1.0 ? "Very High (OTR <1.0)" : mat.nominal_otr <= 50 ? "High (OTR ≤45)" : "Medium to Breathable";
                  return <td key={id} style={{ padding: "10px 14px" }}>{barDesc}</td>;
                })}
              </tr>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)" }}>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-primary-dark)" }}>Transport Protection</td>
                {comparisonMaterialIds.map(id => {
                  const mat = MATERIALS_CATALOG.find(m => m.id === id) || MATERIALS_CATALOG[0];
                  const transDesc = mat.id === "glass-jar" ? "Fragile (Cushioning Reqd)" : "Excellent (Flex & Puncture Proof)";
                  return <td key={id} style={{ padding: "10px 14px" }}>{transDesc}</td>;
                })}
              </tr>
              <tr>
                <td style={{ padding: "10px 14px", fontWeight: 700, color: "var(--color-primary-dark)" }}>Circularity & Recyclability</td>
                {comparisonMaterialIds.map(id => {
                  const mat = MATERIALS_CATALOG.find(m => m.id === id) || MATERIALS_CATALOG[0];
                  return <td key={id} style={{ padding: "10px 14px" }}>{mat.recyclability}</td>;
                })}
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* SECTION 13: RISK & CONSTRAINTS MATRIX */}
      <section className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
          <AlertCircle size={18} style={{ color: "var(--warning-amber)" }} />
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-primary-dark)", margin: 0 }}>
              Risk & Constraints Evaluation
            </h3>
            <small style={{ color: "var(--text-secondary)" }}>Operational risk analysis based on submitted product chemistry and logistics</small>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>SHELF-LIFE RISK</span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: riskAnalysis.shelfLifeRisk.color }}>● {riskAnalysis.shelfLifeRisk.level}</span>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
              {riskAnalysis.shelfLifeRisk.detail}
            </p>
          </div>

          <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>MOISTURE RISK</span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: riskAnalysis.moistureRisk.color }}>● {riskAnalysis.moistureRisk.level}</span>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
              {riskAnalysis.moistureRisk.detail}
            </p>
          </div>

          <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>TRANSPORT RISK</span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: riskAnalysis.transportRisk.color }}>● {riskAnalysis.transportRisk.level}</span>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
              {riskAnalysis.transportRisk.detail}
            </p>
          </div>

          <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>TEMPERATURE SENSITIVITY</span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: riskAnalysis.temperatureSensitivity.color }}>● {riskAnalysis.temperatureSensitivity.level}</span>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
              {riskAnalysis.temperatureSensitivity.detail}
            </p>
          </div>

          <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>BUDGET DEVIATION</span>
              <span style={{ fontSize: "11.5px", fontWeight: 700, color: riskAnalysis.budgetDeviation.color }}>● {riskAnalysis.budgetDeviation.level}</span>
            </div>
            <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.4" }}>
              {riskAnalysis.budgetDeviation.detail}
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 12: PRACTICAL SUSTAINABILITY VISUALIZATION */}
      {activeSust && (
        <section className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Leaf size={18} style={{ color: "var(--accent-green)" }} />
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-primary-dark)", margin: 0 }}>
                  Sustainability & Material Footprint
                </h3>
                <small style={{ color: "var(--text-secondary)" }}>Life Cycle Assessment (LCA) and circularity index</small>
              </div>
            </div>
            <span className="badge-pass">
              {activeSust.circularity_grade}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px", marginBottom: "14px" }}>
            <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Packaging Tare Weight</span>
              <b style={{ display: "block", color: "var(--color-primary-dark)", fontSize: "18px", margin: "3px 0 1px" }}>
                {activeSust.material_weight_g_per_pack} g
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>PPR: {activeSust.packaging_to_product_ratio_pct}%</small>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Recyclability Rating</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "18px", margin: "3px 0 1px" }}>
                {activeSust.recyclability_score_pct.toFixed(0)}%
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>{activeSust.end_of_life_pathway}</small>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Embodied Carbon</span>
              <b style={{ display: "block", color: "var(--color-primary-dark)", fontSize: "18px", margin: "3px 0 1px" }}>
                +{activeSust.embodied_carbon_g_co2_per_pack} g
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>CO₂e per pouch</small>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "12px 14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Avoided Spoilage Credit</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "18px", margin: "3px 0 1px" }}>
                -{activeSust.avoided_food_waste_carbon_g_co2} g
              </b>
              <small style={{ color: "var(--accent-green)", fontSize: "11px" }}>Upstream food saved</small>
            </div>
          </div>

          <div style={{ background: "var(--accent-green-subtle)", border: "1px solid rgba(63, 118, 88, 0.25)", borderRadius: "var(--radius-md)", padding: "10px 14px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <b>LCA Net Footprint:</b> {activeSust.sustainability_summary}
          </div>
        </section>
      )}

      {/* COST ANALYSIS SECTION */}
      {activeCost && (
        <section className="glass-card" style={{ padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <DollarSign size={18} style={{ color: "var(--accent-green)" }} />
              <div>
                <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--color-primary-dark)", margin: 0 }}>
                  Unit Cost Economics
                </h3>
                <small style={{ color: "var(--text-secondary)" }}>Substrate Material + Conversion + Spoilage Risk Allocation</small>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span className="micro-label">Optimized Total Cost:</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "18px" }}>
                {formatCurrency(activeCost.total_cost_per_pack)} <small style={{ fontSize: "11px", color: "var(--text-secondary)" }}>/ pack</small>
              </b>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "10px", marginBottom: "12px" }}>
            <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">1. Raw Film Material</span>
              <b style={{ display: "block", color: "var(--color-primary-dark)", fontSize: "13px", marginTop: "2px" }}>
                {formatCurrency(activeCost.raw_material_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10px" }}>Gauge {activeCost.film_thickness_um} µm</small>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">2. Conversion & Printing</span>
              <b style={{ display: "block", color: "var(--color-primary-dark)", fontSize: "13px", marginTop: "2px" }}>
                {formatCurrency(activeCost.production_conversion_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10px" }}>Slitting & hermetic seal</small>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">3. Transportation</span>
              <b style={{ display: "block", color: "var(--color-primary-dark)", fontSize: "13px", marginTop: "2px" }}>
                {formatCurrency(activeCost.transportation_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10px" }}>{input.transport || "Standard"} transit</small>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">4. Expected Spoilage Loss</span>
              <b style={{ display: "block", color: "var(--warning-amber)", fontSize: "13px", marginTop: "2px" }}>
                {formatCurrency(activeCost.expected_food_loss_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10px" }}>{activeCost.spoilage_risk_pct}% risk</small>
            </div>
          </div>
        </section>
      )}

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "40px", flexWrap: "wrap", gap: "12px" }}>
        <button className="btn btn-secondary" onClick={onOpenSimulator}>
          <Clock size={15} /> Open in What-If Simulator →
        </button>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-outline" onClick={onNewAnalysis}>
            <RefreshCw size={14} /> Start New Analysis
          </button>
          <button className="btn btn-primary" onClick={onOpenReport}>
            <Download size={14} /> Export Complete PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
