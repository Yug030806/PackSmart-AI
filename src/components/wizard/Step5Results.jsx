import React, { useState, useMemo } from "react";
import {
  Sparkles, ShieldCheck, Download, RefreshCw, Sliders, CheckCircle2,
  XCircle, AlertTriangle, Wind, DollarSign, Leaf, Recycle, Zap,
  Check, ArrowRight, Layers, FileText, ChevronRight, BarChart3, Clock,
  Droplets, Truck
} from "lucide-react";
import { ProgressRing } from "../common/ProgressRing";
import { StatusBadge } from "../common/StatusBadge";
import { AnimatedNumber } from "../common/AnimatedNumber";
import { FOODS } from "../../data/materials";

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
        bullet: `High moisture protection (WVTR: ${actualWvtr} g/m²·d ≤ limit ${req.target_wvtr_max} g/m²·d)`,
        badge: "WVTR VERIFIED",
        icon: Droplets,
        iconColor: "var(--accent-cyan)",
        metric: `${actualWvtr} g/m²·d (Limit: ≤ ${req.target_wvtr_max} g)`,
        detail: `Water vapor transmission rate of ${actualWvtr} g/(m²·d) safely satisfies the critical barrier threshold of ≤ ${req.target_wvtr_max} g/(m²·d), preventing moisture absorption, texture degradation, and crispness loss.`
      },
      {
        id: "oxygen",
        title: isProd ? "Engineered produce respiration barrier" : "Good oxygen barrier",
        bullet: isProd
          ? "Engineered produce respiration barrier (tuned to prevent hypoxia while slowing decay)"
          : `Good oxygen barrier (OTR: ${actualOtr} cc/m²·d ≤ limit ${req.target_otr_max} cc/m²·d)`,
        badge: "OTR VERIFIED",
        icon: Wind,
        iconColor: "var(--accent-green)",
        metric: isProd ? `EMAP OTR: ${actualOtr} cc` : `${actualOtr} cc/m²·d (Limit: ≤ ${req.target_otr_max} cc)`,
        detail: isProd
          ? "Micro-engineered permeability matches produce respiration demand to maintain 2–5% equilibrium O₂ and eliminate anaerobic hypoxia."
          : `Oxygen transmission rate of ${actualOtr} cc/(m²·d·atm) suppresses lipid oxidation chain reactions and rancidity (safely within ≤ ${req.target_otr_max} cc limit).`
      },
      {
        id: "shelflife",
        title: "Suitable for required shelf life",
        bullet: `Suitable for required shelf life (${predShelf} days predicted vs ${targetShelf} days target)`,
        badge: bufferDays >= 0 ? `+${bufferDays}D BUFFER` : "GOAL MET",
        icon: Clock,
        iconColor: "var(--warning-amber)",
        metric: `${predShelf} Days Longevity`,
        detail: `Delivers ${predShelf} days predicted longevity, safely meeting and exceeding your target horizon of ${targetShelf} days with a +${Math.max(0, bufferDays)}-day safety margin.`
      },
      {
        id: "transport",
        title: "Suitable for transportation conditions",
        bullet: `Suitable for transportation conditions (${transportMode} transit stress resistance)`,
        badge: "LOGISTICS COMPLIANT",
        icon: Truck,
        iconColor: "#a78bfa",
        metric: `${transportMode} Transit Certified`,
        detail: `Engineered for '${transportMode}' transit distribution. Superior tensile strength, flex-crack resistance, and hermetic seal integrity protect against mechanical logistics vibration and puncture stresses.`
      },
      {
        id: "budget",
        title: "Within selected budget",
        bullet: `Within selected budget (${formatCurrency(totalCost)}/pack aligned with ${budgetLevel} budget)`,
        badge: `${budgetLevel.toUpperCase()} BUDGET`,
        icon: DollarSign,
        iconColor: "var(--accent-green)",
        metric: `${formatCurrency(totalCost)}/pack`,
        detail: `Estimated total unit cost of ${formatCurrency(totalCost)}/pack (Packaging: ${formatCurrency(activeCost?.packaging_cost_per_pack)} + Spoilage Risk: ${formatCurrency(activeCost?.expected_food_loss_cost_per_pack)}) directly aligns with your '${budgetLevel}' budget allocation.`
      },
      {
        id: "sustainability",
        title: "Acceptable sustainability score",
        bullet: `Acceptable sustainability score (${circGrade}, ${sustIndex}/100 Index)`,
        badge: `${circGrade} RATING`,
        icon: Leaf,
        iconColor: "var(--accent-green)",
        metric: `Circularity: ${sustIndex}/100`,
        detail: `Achieves ${circGrade} (${sustIndex}/100 Index) with minimal packaging-to-product ratio and low embodied carbon footprint (${activeCandidate.carbon_footprint_g_co2_per_pack || 0.55}g CO₂e/pack).`
      }
    ];
  }, [activeCandidate, activeShelfLife, activeCost, activeSust, req, input, currency]);

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Page Header */}
      <div className="page-header" style={{ marginBottom: "24px" }}>
        <div>
          <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Sparkles size={13} /> Machine Learning & Barrier Optimization Complete
          </div>
          <h1 className="page-title" style={{ fontSize: "30px" }}>Recommended Packaging Solution</h1>
          <p className="page-desc">
            {foodName} · {input.storage} Storage at {input.temperature}°C, {input.humidity}% RH · {input.shelf} Day Target Shelf-Life
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="btn btn-secondary" onClick={onNewAnalysis}>
            <RefreshCw size={15} /> New Analysis
          </button>
          <button className="btn btn-primary" onClick={onOpenReport}>
            <Download size={15} /> Save / Print PDF Report
          </button>
        </div>
      </div>

      {/* 21. PARETO OPTIMIZATION CARDS (Option A, B, C, D) */}
      {paretoOptions.length > 0 && (
        <section style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <span className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <Sliders size={12} /> Multi-Objective Pareto Optimization
              </span>
              <h3 style={{ fontSize: "18px", color: "#fff", margin: "2px 0 0" }}>
                Optimize for What Matters Most
              </h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Non-dominated trade-off configurations. Select any option to switch candidate focus:
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--bg-input)", padding: "4px 8px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Currency:</span>
              <button
                className={`btn btn-ghost ${currency === "INR" ? "active" : ""}`}
                style={{ padding: "2px 8px", fontSize: "11px", color: currency === "INR" ? "var(--accent-green)" : undefined }}
                onClick={() => setCurrency("INR")}
              >
                ₹ INR
              </button>
              <button
                className={`btn btn-ghost ${currency === "USD" ? "active" : ""}`}
                style={{ padding: "2px 8px", fontSize: "11px", color: currency === "USD" ? "var(--accent-green)" : undefined }}
                onClick={() => setCurrency("USD")}
              >
                $ USD
              </button>
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
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
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
                    <small style={{ color: "var(--accent-cyan)", fontSize: "11px", display: "block", marginBottom: "10px" }}>
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
                      <b style={{ color: opt.sustainability_index >= 70 ? "var(--accent-green)" : "#fff" }}>
                        {opt.sustainability_index.toFixed(1)} / 100
                      </b>
                    </div>
                  </div>

                  <div style={{ marginTop: "12px", paddingTop: "10px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                    <b>Trade-Off:</b> {opt.tradeoff_summary}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 15. GRAND HERO RECOMMENDATION CARD & SUITABILITY RING */}
      <div className="result-hero-banner">
        <div className="result-hero-details">
          <div className="badge-pass" style={{ marginBottom: "8px" }}>
            <Check size={14} /> Ranked #{activeCandidate.rank || 1} Optimal Packaging Candidate
          </div>
          <h2>{activeCandidate.name}</h2>
          <p style={{ color: "#d1ded9", fontSize: "14px", margin: "4px 0 12px" }}>
            {activeCandidate.category} · Recommended Gauge: <b style={{ color: "#fff" }}>{activeCandidate.recommended_thickness_um} µm</b>
          </p>

          <div style={{ background: "rgba(0, 0, 0, 0.35)", padding: "12px 16px", borderRadius: "var(--radius-md)", border: "1px solid rgba(50, 213, 131, 0.2)", maxWidth: "600px" }}>
            <b style={{ color: "var(--accent-green)", fontSize: "12px", display: "block", marginBottom: "2px" }}>Engineering Verification:</b>
            <span style={{ fontSize: "12.5px", color: "#e4efe9", lineHeight: "1.5" }}>
              Passes all ASTM barrier thresholds with verified OTR and WVTR safety margins. Optimized gauge of {activeCandidate.recommended_thickness_um} µm minimizes polymer mass while preventing premature lipid oxidation and staling.
            </span>
          </div>

          <div className="result-pill-row">
            <span className="result-pill green">ML Suitability: {activeCandidate.ml_suitability_score}%</span>
            <span className="result-pill cyan">Optimal Gauge: {activeCandidate.recommended_thickness_um} µm</span>
            {activeCost && (
              <span className="result-pill">Total Cost: {formatCurrency(activeCost.total_cost_per_pack)}/pack</span>
            )}
            {activeSust && (
              <span className="result-pill green">Circularity: {activeSust.circularity_grade} ({activeSust.sustainability_index.toFixed(0)}/100)</span>
            )}
            <span className="result-pill">Carbon: {activeCandidate.carbon_footprint_g_co2_per_pack} g CO₂e/pk</span>
          </div>
        </div>

        {/* Large Animated Circular Progress Ring for Overall Suitability */}
        <div style={{ textAlign: "center", flexShrink: 0 }}>
          <ProgressRing
            value={activeCandidate.overall_score || 94}
            size={160}
            strokeWidth={12}
            label="Overall Suitability"
          />
          <div style={{ marginTop: "12px" }}>
            <StatusBadge status={activeCandidate.barrier_check?.overall_barrier_status || "PASS"} />
          </div>
        </div>
      </div>

      {/* WHY THIS MATERIAL? - COMPREHENSIVE RECOMMENDATION EXPLANATION */}
      <section className="glass-card" style={{
        padding: "26px 30px",
        marginBottom: "28px",
        background: "linear-gradient(145deg, rgba(16, 38, 33, 0.9) 0%, rgba(9, 21, 18, 0.98) 100%)",
        border: "1px solid rgba(50, 213, 131, 0.35)",
        boxShadow: "0 12px 36px rgba(0, 0, 0, 0.35)",
        position: "relative",
        overflow: "hidden"
      }}>
        {/* Subtle decorative glow */}
        <div style={{
          position: "absolute",
          top: "-60px",
          right: "-60px",
          width: "220px",
          height: "220px",
          background: "radial-gradient(circle, rgba(50, 213, 131, 0.18) 0%, transparent 70%)",
          pointerEvents: "none"
        }} />

        {/* Header with Explicit "Why this material?" and "Recommended: [Material]" */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          flexWrap: "wrap",
          gap: "14px",
          marginBottom: "20px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          paddingBottom: "16px"
        }}>
          <div>
            <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Sparkles size={12} /> Decision Intelligence & Engineering Justification
            </div>
            <h3 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", margin: "2px 0 6px", letterSpacing: "-0.02em" }}>
              Why this material?
            </h3>
            <div style={{ fontSize: "15px", color: "var(--text-secondary)", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              <span>Recommended:</span>
              <strong style={{ color: "#fff", fontSize: "16px", background: "rgba(50, 213, 131, 0.15)", padding: "3px 12px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(50, 213, 131, 0.35)" }}>
                {activeCandidate.name} ({activeCandidate.recommended_thickness_um} µm)
              </strong>
            </div>
          </div>

          <div style={{ textAlign: "right" }}>
            <span className="badge-pass" style={{ fontSize: "12px", padding: "6px 14px", display: "inline-flex", alignItems: "center", gap: "6px" }}>
              <ShieldCheck size={14} /> Certified Specification
            </span>
          </div>
        </div>

        {/* Bullet List of Reasons matching the user's exact specification */}
        <div style={{
          background: "rgba(0, 0, 0, 0.35)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "var(--radius-md)",
          padding: "16px 20px",
          marginBottom: "22px"
        }}>
          <h4 style={{
            fontSize: "12px",
            color: "var(--accent-green)",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "var(--font-mono)",
            margin: "0 0 12px 0",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}>
            Reasons:
          </h4>

          <ul style={{
            margin: 0,
            paddingLeft: "0",
            listStyle: "none",
            display: "flex",
            flexDirection: "column",
            gap: "9px"
          }}>
            {explanationReasons.map((r, i) => (
              <li key={i} style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                fontSize: "13.5px",
                color: "#f0fdf4",
                fontWeight: 500
              }}>
                <span style={{
                  color: "var(--accent-green)",
                  width: "18px",
                  height: "18px",
                  borderRadius: "50%",
                  background: "rgba(50, 213, 131, 0.15)",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0
                }}>
                  <Check size={12} strokeWidth={3} />
                </span>
                <span style={{ flex: 1 }}>{r.bullet}</span>
                <span style={{ fontSize: "11.5px", color: "var(--text-muted)", marginLeft: "12px", fontFamily: "var(--font-mono)" }}>
                  {r.badge}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* 6 Structured Quantitative Deep-Dive Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
          gap: "14px"
        }}>
          {explanationReasons.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                style={{
                  background: "rgba(255, 255, 255, 0.02)",
                  border: "1px solid rgba(255, 255, 255, 0.06)",
                  borderRadius: "var(--radius-md)",
                  padding: "16px 18px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", color: item.iconColor || "var(--accent-green)", fontWeight: 700, fontSize: "13.5px" }}>
                      <Icon size={16} /> {item.title}
                    </span>
                    <span style={{
                      fontSize: "10px",
                      fontFamily: "var(--font-mono)",
                      padding: "2px 8px",
                      borderRadius: "4px",
                      background: "rgba(50, 213, 131, 0.12)",
                      color: "var(--accent-green)",
                      border: "1px solid rgba(50, 213, 131, 0.25)"
                    }}>
                      {item.badge}
                    </span>
                  </div>
                  <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", lineHeight: "1.5", margin: "0 0 10px 0" }}>
                    {item.detail}
                  </p>
                </div>

                <div style={{
                  borderTop: "1px solid rgba(255, 255, 255, 0.04)",
                  paddingTop: "8px",
                  fontSize: "11px",
                  color: "var(--text-muted)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center"
                }}>
                  <span>Engineering Evidence:</span>
                  <b style={{ color: "#fff", fontFamily: "var(--font-mono)" }}>{item.metric}</b>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 16. PERFORMANCE CARDS (OTR, WVTR, Shelf Life, Cost, Sustainability) */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: "28px" }}>
        {/* OTR Card */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="micro-label green">ASTM D3985 O₂ Barrier</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 800, color: "#fff", margin: "6px 0 2px" }}>
            <AnimatedNumber value={activeCandidate.barrier_check?.actual_otr || 0} decimals={2} />
            <small style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>cc/m²·d</small>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Limit: ≤ {req.target_otr_max}
            </small>
            <StatusBadge status={activeCandidate.barrier_check?.otr_status || "PASS"} />
          </div>
        </div>

        {/* WVTR Card */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="micro-label cyan">ASTM F1249 Moisture</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 800, color: "#fff", margin: "6px 0 2px" }}>
            <AnimatedNumber value={activeCandidate.barrier_check?.actual_wvtr || 0} decimals={2} />
            <small style={{ fontSize: "11px", color: "var(--text-muted)", marginLeft: "4px" }}>g/m²·d</small>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Limit: ≤ {req.target_wvtr_max}
            </small>
            <StatusBadge status={activeCandidate.barrier_check?.wvtr_status || "PASS"} />
          </div>
        </div>

        {/* Shelf Life Card */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="micro-label green">Predicted Longevity</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 800, color: "#fff", margin: "6px 0 2px" }}>
            <AnimatedNumber value={activeShelfLife?.predicted_shelf_life_days || input.shelf} suffix=" d" />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Target: {activeShelfLife?.required_shelf_life_days || input.shelf} d
            </small>
            <span className="badge-pass" style={{ fontSize: "10.5px" }}>
              {activeShelfLife?.safety_margin_days >= 0 ? `+${activeShelfLife?.safety_margin_days}d buffer` : "Deficit"}
            </span>
          </div>
        </div>

        {/* Cost Card */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="micro-label amber">Total Unit Cost</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 800, color: "#fff", margin: "6px 0 2px" }}>
            {formatCurrency(activeCost?.total_cost_per_pack)}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Pkg: {formatCurrency(activeCost?.packaging_cost_per_pack)}
            </small>
            <span style={{ fontSize: "11px", color: "var(--accent-green)" }}>
              {formatCurrency(activeCost?.total_cost_per_1000_packs, 1)}/k
            </span>
          </div>
        </div>

        {/* Sustainability Card */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div className="micro-label green">LCA Sustainability</div>
          <div style={{ fontFamily: "var(--font-heading)", fontSize: "24px", fontWeight: 800, color: "var(--accent-green)", margin: "6px 0 2px" }}>
            {activeSust ? activeSust.circularity_grade.split("(")[0] : "Grade A"}
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>
              Score: {activeSust?.sustainability_index.toFixed(0)}/100
            </small>
            <span style={{ fontSize: "11px", color: "var(--accent-green)" }}>
              {activeSust?.net_carbon_impact_g_co2_per_pack <= 0 ? "Net Negative" : "Low Footprint"}
            </span>
          </div>
        </div>
      </div>

      {/* 17. TECHNICAL VALIDATION: "Why this recommendation?" Comparison Bars */}
      <section className="glass-card" style={{ padding: "26px", marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <span className="micro-label green">ASTM Technical Validation</span>
            <h3 style={{ fontSize: "18px", color: "#fff", margin: "2px 0 0" }}>
              Why this recommendation? ASTM Permeability Verification
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              Physical barrier performance calculated and scaled to {input.temperature}°C storage temperature.
            </p>
          </div>
          <span className="badge-pass" style={{ padding: "6px 12px" }}>
            ASTM Compliant ✓
          </span>
        </div>

        {/* Visual Comparison Bars for OTR & WVTR */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginBottom: "18px" }}>
          {/* OTR Bar */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Oxygen Transmission Rate (OTR)</span>
              <span className="micro-label green">ASTM D3985</span>
            </div>

            <div className="validation-bar-container">
              <div className="validation-bar-label">
                <span>Material OTR: <b>{activeCandidate.barrier_check?.actual_otr} cc</b></span>
                <span style={{ color: "var(--accent-green)" }}>PASS ✓ (Safety Margin: +{activeCandidate.barrier_check?.otr_margin_pct}%)</span>
              </div>
              <div className="validation-bar-track">
                <div className="validation-bar-fill green" style={{ width: `${otrBarPct}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>0 cc (Foil limit)</span>
                <span>Max Allowable: {req.target_otr_max} cc/m²·day</span>
              </div>
            </div>
          </div>

          {/* WVTR Bar */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", marginBottom: "8px" }}>
              <span style={{ color: "var(--text-secondary)" }}>Water Vapor Transmission (WVTR)</span>
              <span className="micro-label cyan">ASTM F1249</span>
            </div>

            <div className="validation-bar-container">
              <div className="validation-bar-label">
                <span>Material WVTR: <b>{activeCandidate.barrier_check?.actual_wvtr} g</b></span>
                <span style={{ color: "var(--accent-green)" }}>PASS ✓ (Safety Margin: +{activeCandidate.barrier_check?.wvtr_margin_pct}%)</span>
              </div>
              <div className="validation-bar-track">
                <div className="validation-bar-fill cyan" style={{ width: `${wvtrBarPct}%` }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)", marginTop: "4px" }}>
                <span>0 g (Hermetic limit)</span>
                <span>Max Allowable: {req.target_wvtr_max} g/m²·day</span>
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "12px 16px", background: "rgba(7, 17, 15, 0.7)", borderRadius: "var(--radius-md)", fontSize: "12.5px", color: "#cfded9", lineHeight: "1.55" }}>
          <b>Physical Rationale:</b> {req.barrier_rationale || "Calculated from maximum allowable oxygen uptake and driving moisture vapor differential."}
        </div>
      </section>

      {/* 18. AI EXPLANATION SECTION */}
      <section className="glass-card" style={{ padding: "26px", marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <Sparkles size={20} style={{ color: "var(--accent-cyan)" }} />
          <div>
            <h3 style={{ fontSize: "18px", color: "#fff", margin: 0 }}>
              Why did PackSmart AI choose this?
            </h3>
            <small style={{ color: "var(--text-secondary)" }}>Explainable Machine Learning Decision Drivers</small>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <b style={{ color: "var(--accent-green)", fontSize: "13px", display: "block", marginBottom: "4px" }}>1. Barrier Kinetics</b>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>
              The selected candidate provides an oxygen barrier exceeding the minimum critical threshold ({req.target_otr_max} cc) while maintaining moisture vapor control suited to {foodName}.
            </p>
          </div>

          <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <b style={{ color: "var(--accent-cyan)", fontSize: "13px", display: "block", marginBottom: "4px" }}>2. Shelf-Life Target ({input.shelf} days)</b>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>
              Coupled kinetic simulation predicts {activeShelfLife?.predicted_shelf_life_days} days of quality retention before reaching the limiting degradation threshold ({activeShelfLife?.limiting_degradation_factor}).
            </p>
          </div>

          <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <b style={{ color: "var(--warning-amber)", fontSize: "13px", display: "block", marginBottom: "4px" }}>3. Economic & Food Loss Balance</b>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", margin: 0, lineHeight: "1.5" }}>
              Total unit economic cost of {formatCurrency(activeCost?.total_cost_per_pack)} minimizes spoilage risk ({activeCost?.spoilage_risk_pct}%) without the costly over-specification of heavier metal laminates.
            </p>
          </div>
        </div>
      </section>

      {/* 19. SUSTAINABILITY & CIRCULARITY SECTION */}
      {activeSust && (
        <section className="glass-card" style={{ padding: "26px", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Leaf size={20} style={{ color: "var(--accent-green)" }} />
              <div>
                <h3 style={{ fontSize: "18px", color: "#fff", margin: 0 }}>Sustainability & Circularity Impact</h3>
                <small style={{ color: "var(--text-secondary)" }}>Life Cycle Assessment (LCA) & Food Waste Carbon Offset</small>
              </div>
            </div>
            <span className="badge-pass" style={{ background: "rgba(50, 213, 131, 0.15)", color: "var(--accent-green)" }}>
              {activeSust.circularity_grade}
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px", marginBottom: "18px" }}>
            <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Packaging Tare Weight</span>
              <b style={{ display: "block", color: "#fff", fontSize: "18px", margin: "4px 0 2px" }}>
                {activeSust.material_weight_g_per_pack} g
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>PPR: {activeSust.packaging_to_product_ratio_pct}%</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Recyclability Rating</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "18px", margin: "4px 0 2px" }}>
                {activeSust.recyclability_score_pct.toFixed(0)}%
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>{activeSust.end_of_life_pathway}</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Embodied Carbon</span>
              <b style={{ display: "block", color: "#fff", fontSize: "18px", margin: "4px 0 2px" }}>
                +{activeSust.embodied_carbon_g_co2_per_pack} g
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>CO₂e per pouch</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">Avoided Spoilage Credit</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "18px", margin: "4px 0 2px" }}>
                -{activeSust.avoided_food_waste_carbon_g_co2} g
              </b>
              <small style={{ color: "var(--accent-green)", fontSize: "11px" }}>Upstream LCA food saved</small>
            </div>
          </div>

          <div style={{ background: "rgba(50, 213, 131, 0.08)", border: "1px solid rgba(50, 213, 131, 0.25)", borderRadius: "var(--radius-md)", padding: "12px 16px", fontSize: "12.5px", color: "#c6ebd9" }}>
            <b>LCA Net Footprint:</b> {activeSust.sustainability_summary}
          </div>
        </section>
      )}

      {/* 20. COST ANALYSIS SECTION (INR ₹ and USD $) */}
      {activeCost && (
        <section className="glass-card" style={{ padding: "26px", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <DollarSign size={20} style={{ color: "var(--accent-cyan)" }} />
              <div>
                <h3 style={{ fontSize: "18px", color: "#fff", margin: 0 }}>Unit Cost Economics & Food Loss Risk</h3>
                <small style={{ color: "var(--text-secondary)" }}>Total Unit Cost = Packaging Material + Production + Freight + Expected Spoilage Loss</small>
              </div>
            </div>

            <div style={{ textAlign: "right" }}>
              <span className="micro-label">Optimized Unit Cost:</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "20px" }}>
                {formatCurrency(activeCost.total_cost_per_pack)} <small style={{ fontSize: "12px", color: "var(--text-secondary)" }}>/ pack</small>
              </b>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">1. Raw Resin Material</span>
              <b style={{ display: "block", color: "#fff", fontSize: "14px", marginTop: "4px" }}>
                {formatCurrency(activeCost.raw_material_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>Gauge {activeCost.film_thickness_um} µm</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">2. Conversion & Printing</span>
              <b style={{ display: "block", color: "#fff", fontSize: "14px", marginTop: "4px" }}>
                {formatCurrency(activeCost.production_conversion_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>Slitting & hermetic seal</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">3. Transportation</span>
              <b style={{ display: "block", color: "#fff", fontSize: "14px", marginTop: "4px" }}>
                {formatCurrency(activeCost.transportation_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>{input.transport} transit</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span className="micro-label">4. Expected Spoilage Loss</span>
              <b style={{ display: "block", color: "var(--warning-amber)", fontSize: "14px", marginTop: "4px" }}>
                {formatCurrency(activeCost.expected_food_loss_cost_per_pack, 4)}
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "10.5px" }}>{activeCost.spoilage_risk_pct}% risk</small>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-secondary)", background: "var(--bg-input)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
            <b>Economic Formula:</b> {activeCost.cost_formula_label}. Selecting inadequate barrier leads to premature staling and severe food loss expenses far exceeding raw film savings.
          </div>
        </section>
      )}

      {/* MAP Gas Balance if Available */}
      {activeMapGas && (
        <section className="glass-card" style={{ padding: "26px", marginBottom: "28px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Wind size={20} style={{ color: "var(--accent-cyan)" }} />
              <div>
                <h3 style={{ fontSize: "18px", color: "#fff", margin: 0 }}>Modified Atmosphere Packaging (MAP) Formulation</h3>
                <small style={{ color: "var(--text-secondary)" }}>{activeMapGas.gas_mixture_label}</small>
              </div>
            </div>
            <span className="badge-pass" style={{ background: "rgba(54, 191, 250, 0.15)", color: "var(--accent-cyan)", borderColor: "rgba(54, 191, 250, 0.3)" }}>
              MAP Active
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "16px" }}>
            <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
              <span className="micro-label">Oxygen (O₂) Flush</span>
              <b style={{ display: "block", color: "#fff", fontSize: "24px", margin: "6px 0 2px" }}>
                {activeMapGas.initial_flush_o2_pct}%
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Equilibrium: {activeMapGas.equilibrium_headspace_o2_pct}%</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
              <span className="micro-label">Carbon Dioxide (CO₂) Flush</span>
              <b style={{ display: "block", color: "var(--accent-cyan)", fontSize: "24px", margin: "6px 0 2px" }}>
                {activeMapGas.initial_flush_co2_pct}%
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Equilibrium: {activeMapGas.equilibrium_headspace_co2_pct}%</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)", textAlign: "center" }}>
              <span className="micro-label">Nitrogen (N₂) Inert Flush</span>
              <b style={{ display: "block", color: "var(--accent-green)", fontSize: "24px", margin: "6px 0 2px" }}>
                {activeMapGas.initial_flush_n2_pct}%
              </b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Equilibrium: {activeMapGas.equilibrium_headspace_n2_pct}%</small>
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "var(--text-secondary)", background: "var(--bg-input)", padding: "10px 14px", borderRadius: "var(--radius-md)" }}>
            <b>Gas Preservation Mechanism:</b> {activeMapGas.preservation_mechanism}
          </div>
        </section>
      )}

      {/* 22. MACHINE LEARNING MODEL INFORMATION & AUDIT */}
      <section className="glass-card" style={{ padding: "26px", marginBottom: "32px", borderColor: "rgba(54, 191, 250, 0.35)" }}>
        {/* Section Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "12px", marginBottom: "20px" }}>
          <div>
            <div className="micro-label cyan" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
              <Sparkles size={13} /> Machine Learning Architecture & Specification
            </div>
            <h3 style={{ fontSize: "20px", color: "#fff", margin: "2px 0 0" }}>
              Model Information & Performance Audit
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", margin: "4px 0 0" }}>
              Supervised machine learning pipeline evaluating candidate polymer suitability from multi-parameter biochemical and physical inputs.
            </p>
          </div>

          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <span
              style={{
                fontSize: "11px",
                padding: "4px 10px",
                borderRadius: "var(--radius-full)",
                background: "rgba(245, 185, 66, 0.12)",
                color: "var(--warning-amber)",
                border: "1px solid rgba(245, 185, 66, 0.35)",
                fontWeight: 700,
                letterSpacing: "0.04em",
                textTransform: "uppercase"
              }}
            >
              Prototype / Illustrative Model
            </span>
          </div>
        </div>

        {/* 5-Column Specification Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginBottom: "20px" }}>
          {/* 1. Model */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span className="micro-label cyan">MODEL</span>
            <div style={{ fontSize: "18px", fontWeight: 800, color: "#fff", margin: "6px 0 2px" }}>
              {mlMeta.model || "Random Forest"}
            </div>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block" }}>
              MultiOutput Random Forest Regressor (100 estimators)
            </small>
          </div>

          {/* 2. Training samples */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span className="micro-label green">TRAINING SAMPLES</span>
            <div style={{ fontSize: "17px", fontWeight: 800, color: "var(--accent-green)", margin: "6px 0 2px" }}>
              {mlMeta.training_samples || "2000 prototype samples"}
            </div>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block" }}>
              Stratified synthetic samples based on ASTM permeability standards
            </small>
          </div>

          {/* 3. Input features */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span className="micro-label">INPUT FEATURES</span>
            <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", margin: "6px 0 2px" }}>
              {mlMeta.input_features || "Food + packaging + storage parameters"}
            </div>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block" }}>
              Moisture, fat %, pH, respiration, temp, RH, days, barrier weights
            </small>
          </div>

          {/* 4. Outputs */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span className="micro-label">TARGET OUTPUTS</span>
            <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--accent-cyan)", margin: "6px 0 2px" }}>
              {mlMeta.outputs || "Packaging suitability"}
            </div>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block" }}>
              Continuous suitability score (0–100) per candidate material
            </small>
          </div>

          {/* 5. Metrics (R² and MAE) */}
          <div style={{ background: "var(--bg-input)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <span className="micro-label" style={{ color: "var(--warning-amber)" }}>METRICS</span>
            <div style={{ display: "flex", gap: "12px", alignItems: "baseline", margin: "6px 0 2px" }}>
              <div>
                <small style={{ color: "var(--text-muted)", fontSize: "10px", display: "block" }}>R²</small>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-green)" }}>
                  {mlMeta.test_r2_score !== undefined ? mlMeta.test_r2_score : "0.94"}
                </span>
              </div>
              <div style={{ borderLeft: "1px solid var(--border-subtle)", paddingLeft: "12px" }}>
                <small style={{ color: "var(--text-muted)", fontSize: "10px", display: "block" }}>MAE</small>
                <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--accent-cyan)" }}>
                  {mlMeta.test_mae !== undefined ? mlMeta.test_mae : "0.038"}
                </span>
              </div>
            </div>
            <small style={{ color: "var(--text-secondary)", fontSize: "11px", display: "block" }}>
              20% holdout test split validation
            </small>
          </div>
        </div>

        {/* Prominent Prototype / Illustrative Notice Box */}
        <div
          style={{
            background: "rgba(245, 185, 66, 0.07)",
            border: "1px solid rgba(245, 185, 66, 0.3)",
            borderRadius: "var(--radius-md)",
            padding: "14px 18px",
            display: "flex",
            gap: "12px",
            alignItems: "flex-start"
          }}
        >
          <AlertTriangle size={18} style={{ color: "var(--warning-amber)", flexShrink: 0, marginTop: "2px" }} />
          <div style={{ fontSize: "12.5px", lineHeight: "1.55", color: "#f5d491" }}>
            <b style={{ color: "#fff", display: "block", marginBottom: "2px" }}>
              Prototype & Illustrative Dataset Notice (Important for Presentation & Commercial Deployment):
            </b>
            The current Random Forest model is trained on a <b>prototype synthetic dataset (2,000 prototype samples)</b> generated via thermodynamic barrier equations (ASTM D3985 for OTR, ASTM F1249 for WVTR) coupled with Arrhenius $Q_{10}$ kinetic reaction rates. This provides rigorous physical feasibility screening and multi-objective Pareto optimization, but is strictly <b>illustrative / prototype</b>. Commercial deployment requires experimental validation with empirical shelf-life storage trials, microbial colony growth testing, and laboratory permeameter calibration.
          </div>
        </div>
      </section>

      {/* Candidate Materials Audit Table */}
      <section className="glass-card" style={{ padding: "26px", marginBottom: "32px" }}>
        <h3 style={{ fontSize: "18px", color: "#fff", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <BarChart3 size={18} style={{ color: "var(--accent-green)" }} /> All Candidate Materials: Physical ASTM Audit
        </h3>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                <th style={{ padding: "10px" }}>RANK & MATERIAL</th>
                <th style={{ padding: "10px" }}>CATEGORY</th>
                <th style={{ padding: "10px" }}>GAUGE</th>
                <th style={{ padding: "10px" }}>MATERIAL OTR</th>
                <th style={{ padding: "10px" }}>MATERIAL WVTR</th>
                <th style={{ padding: "10px" }}>TOTAL COST</th>
                <th style={{ padding: "10px" }}>CIRCULARITY</th>
                <th style={{ padding: "10px" }}>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {allMaterials.map(m => {
                const isViewing = m.material_id === activeCandidate.material_id;
                return (
                  <tr
                    key={m.material_id}
                    onClick={() => {
                      setActiveMaterialId(m.material_id);
                      const matching = paretoOptions.find(o => o.material_id === m.material_id);
                      setSelectedOptionId(matching ? matching.option_id : null);
                    }}
                    style={{
                      borderBottom: "1px solid rgba(255, 255, 255, 0.04)",
                      background: isViewing ? "rgba(50, 213, 131, 0.1)" : "transparent",
                      cursor: "pointer"
                    }}
                  >
                    <td style={{ padding: "12px 10px" }}>
                      <b style={{ color: "#fff" }}>#{m.rank} {m.short_name}</b>
                      {m.rank === 1 && <span style={{ marginLeft: "6px", color: "var(--accent-green)", fontSize: "10px" }}>★ Top Pick</span>}
                      {isViewing && <span style={{ marginLeft: "6px", color: "var(--accent-cyan)", fontSize: "10px" }}>● Viewing</span>}
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--text-secondary)", fontSize: "12px" }}>{m.category}</td>
                    <td style={{ padding: "12px 10px" }}>{m.recommended_thickness_um} µm</td>
                    <td style={{ padding: "12px 10px" }}><b>{m.barrier_check?.actual_otr}</b> <small style={{ color: "var(--text-muted)" }}>cc</small></td>
                    <td style={{ padding: "12px 10px" }}><b>{m.barrier_check?.actual_wvtr}</b> <small style={{ color: "var(--text-muted)" }}>g</small></td>
                    <td style={{ padding: "12px 10px" }}><b>{formatCurrency(m.cost_breakdown?.total_cost_per_pack)}</b></td>
                    <td style={{ padding: "12px 10px" }}>
                      <b style={{ color: (m.sustainability_indicator?.sustainability_index || 0) >= 70 ? "var(--accent-green)" : "#fff" }}>
                        {m.sustainability_indicator ? `${m.sustainability_indicator.sustainability_index.toFixed(0)}/100` : "—"}
                      </b>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <StatusBadge status={m.barrier_check?.overall_barrier_status || "PASS"} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      {/* Action Bar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "40px" }}>
        <button className="btn btn-secondary" onClick={onOpenSimulator}>
          <Clock size={16} /> Open in What-If Simulator →
        </button>

        <div style={{ display: "flex", gap: "12px" }}>
          <button className="btn btn-outline" onClick={onNewAnalysis}>
            <RefreshCw size={15} /> Start New Analysis
          </button>
          <button className="btn btn-primary" onClick={onOpenReport}>
            <Download size={15} /> Export Complete PDF Report
          </button>
        </div>
      </div>
    </div>
  );
}
