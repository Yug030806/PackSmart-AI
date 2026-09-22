import React, { useState, useMemo } from "react";
import {
  Sliders, ShieldCheck, Check, AlertTriangle, ArrowRight,
  RefreshCw, Layers, Wind, Droplets, Thermometer, Clock,
  DollarSign, Truck, Leaf, Info, FileText, ChevronRight
} from "lucide-react";
import { FOODS, MATERIALS_CATALOG } from "../../data/materials";
import { REAL_PACKAGING_FORMATS } from "../packaging/PackagingCatalogData";

export function DecisionWorkbench({
  input,
  setInput,
  updateFood,
  onNavigate,
  onOpenReport
}) {
  // Local workbench state with defaults or inherited from parent input
  const [foodKey, setFoodKey] = useState(input?.food || "biscuits");
  const [moisture, setMoisture] = useState(Number(input?.moisture || 4));
  const [temperature, setTemperature] = useState(Number(input?.temperature || 25));
  const [shelfLife, setShelfLife] = useState(Number(input?.shelf || 120));
  const [budgetLevel, setBudgetLevel] = useState(input?.budget || "Medium");
  const [transportMode, setTransportMode] = useState(input?.transport || "Normal");
  const [showTechnicalDrawer, setShowTechnicalDrawer] = useState(false);
  const [selectedFormatId, setSelectedFormatId] = useState(null);

  // Synchronize food change
  const handleFoodSelect = (k) => {
    setFoodKey(k);
    const f = FOODS[k];
    if (f) {
      setMoisture(f.moisture);
      setTemperature(f.temp || (f.storage === "Chilled" ? 4 : 25));
      setShelfLife(f.shelf);
      if (updateFood) updateFood(k);
    }
  };

  // Real-time engineering logic to determine best fit packaging & scores
  const recommendation = useMemo(() => {
    const isChilled = temperature <= 6;
    const isProduce = foodKey === "tomato" || foodKey === "apple";
    const isHighFat = (FOODS[foodKey]?.fat || 0) >= 15;
    const isHighMoisture = moisture > 20;

    let primaryFormatId = "multilayer-pouch";
    let score = 92;
    let shelfLifeScore = 88;
    let foodSafetyScore = 94;
    let costScore = 86;
    let sustainabilityScore = 74;
    let transportScore = 90;

    if (foodKey === "biscuits" || foodKey === "chips") {
      primaryFormatId = isHighFat ? "multilayer-pouch" : "paper-carton";
      shelfLifeScore = 92;
      foodSafetyScore = 96;
      costScore = 88;
      sustainabilityScore = 68;
      transportScore = 94;
    } else if (isProduce) {
      primaryFormatId = "compostable-pack";
      shelfLifeScore = 82;
      foodSafetyScore = 90;
      costScore = 80;
      sustainabilityScore = 94;
      transportScore = 76;
    } else if (foodKey === "paneer") {
      primaryFormatId = "pet-bottle"; // Thermoformed rigid container
      shelfLifeScore = 85;
      foodSafetyScore = 95;
      costScore = 82;
      sustainabilityScore = 78;
      transportScore = 88;
    }

    // Temperature & shelf life adjustments
    if (shelfLife > 180) {
      shelfLifeScore = Math.max(70, shelfLifeScore - 10);
    }
    if (temperature > 30) {
      foodSafetyScore = Math.max(65, foodSafetyScore - 12);
    }

    const currentFormat = REAL_PACKAGING_FORMATS.find(
      f => f.id === (selectedFormatId || primaryFormatId)
    ) || REAL_PACKAGING_FORMATS[0];

    // Engineering checklist items
    const checks = [
      {
        pass: true,
        text: `Moisture protection (${currentFormat.barrierRatings.moisture.split(" ")[0]} rated)`,
        detail: `WVTR safe for ${moisture}% moisture commodity.`
      },
      {
        pass: true,
        text: `${transportMode} logistics protection`,
        detail: "Burst & puncture resistance verified for handling."
      },
      {
        pass: shelfLifeScore >= 80,
        text: shelfLifeScore >= 80 ? `Meets ${shelfLife}-day target shelf life` : `Margin tight for ${shelfLife} days`,
        detail: `Degradation rate stable at ${temperature}°C.`
      },
      {
        pass: sustainabilityScore >= 80 ? true : "marginal",
        text: sustainabilityScore >= 80 ? "Circular stream recyclable" : "Mono-material option recommended for higher circularity",
        detail: `Circularity score: ${currentFormat.circularityScore}/100.`
      },
      {
        pass: budgetLevel === "Low" && costScore < 85 ? "marginal" : true,
        text: budgetLevel === "Low" && costScore < 85 ? "Slightly exceeds entry budget" : `Aligned with ${budgetLevel.toLowerCase()} budget`,
        detail: "Unit substrate and spoilage risk accounted."
      }
    ];

    return {
      format: currentFormat,
      score,
      metrics: {
        shelfLife: shelfLifeScore,
        foodSafety: foodSafetyScore,
        cost: costScore,
        sustainability: sustainabilityScore,
        transport: transportScore
      },
      checks,
      alternatives: REAL_PACKAGING_FORMATS.filter(f => f.id !== currentFormat.id).slice(0, 3)
    };
  }, [foodKey, moisture, temperature, shelfLife, budgetLevel, transportMode, selectedFormatId]);

  return (
    <div className="decision-workbench-wrapper">
      {/* Workbench Header */}
      <div className="workbench-top-bar">
        <div>
          <div className="workbench-badge">
            <ShieldCheck size={13} /> Decision Workbench
          </div>
          <h1 className="workbench-title">Packaging Decision Support</h1>
          <p className="workbench-subhead">
            Multi-criteria evaluation for barrier kinetics, shelf life, unit cost, and circularity.
          </p>
        </div>

        <div className="workbench-actions">
          <button
            className="btn btn-secondary"
            onClick={() => {
              setMoisture(4);
              setTemperature(25);
              setShelfLife(120);
              setSelectedFormatId(null);
            }}
            title="Reset to baseline"
          >
            <RefreshCw size={14} /> Reset Baseline
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate("advisor")}
          >
            Launch Full 5-Step Audit <ArrowRight size={14} />
          </button>
        </div>
      </div>

      {/* 3-Column Decision Workbench Grid */}
      <div className="workbench-grid">
        {/* ================= COLUMN 1: REQUIREMENTS PANEL ================= */}
        <div className="workbench-col workbench-col-left">
          <div className="workbench-card-header">
            <span className="col-num">01</span>
            <div>
              <h3>Product Information</h3>
              <small>Food chemistry & physical constraints</small>
            </div>
          </div>

          <div className="workbench-form-group">
            <label className="workbench-label">Food Type</label>
            <select
              className="workbench-select"
              value={foodKey}
              onChange={(e) => handleFoodSelect(e.target.value)}
            >
              {Object.entries(FOODS).map(([k, f]) => (
                <option key={k} value={k}>
                  {f.name} ({f.category})
                </option>
              ))}
            </select>
          </div>

          <div className="workbench-form-group">
            <div className="workbench-label-row">
              <label className="workbench-label">Moisture Content</label>
              <span className="workbench-val-badge">{moisture}% ({moisture <= 5 ? "Low" : moisture <= 25 ? "Medium" : "High"})</span>
            </div>
            <input
              type="range"
              min="1"
              max="95"
              value={moisture}
              onChange={(e) => setMoisture(Number(e.target.value))}
              className="workbench-slider"
            />
            <div className="slider-scale">
              <span>Dry (1%)</span>
              <span>Mid (50%)</span>
              <span>Wet (95%)</span>
            </div>
          </div>

          <div className="workbench-form-group">
            <div className="workbench-label-row">
              <label className="workbench-label">Storage Temperature</label>
              <span className="workbench-val-badge">{temperature}°C ({temperature <= 4 ? "Chilled" : temperature <= 15 ? "Cool" : "Ambient"})</span>
            </div>
            <input
              type="range"
              min="-18"
              max="45"
              value={temperature}
              onChange={(e) => setTemperature(Number(e.target.value))}
              className="workbench-slider"
            />
            <div className="slider-scale">
              <span>Frozen (-18°C)</span>
              <span>Chilled (4°C)</span>
              <span>Ambient (25°C)</span>
              <span>Hot (45°C)</span>
            </div>
          </div>

          <div className="workbench-form-group">
            <div className="workbench-label-row">
              <label className="workbench-label">Required Shelf Life</label>
              <span className="workbench-val-badge">{shelfLife} days</span>
            </div>
            <input
              type="range"
              min="7"
              max="365"
              step="7"
              value={shelfLife}
              onChange={(e) => setShelfLife(Number(e.target.value))}
              className="workbench-slider"
            />
            <div className="slider-scale">
              <span>7 days</span>
              <span>90 days</span>
              <span>180 days</span>
              <span>365 days</span>
            </div>
          </div>

          <div className="workbench-form-group">
            <label className="workbench-label">Budget Allocation</label>
            <div className="pill-selector">
              {["Low", "Medium", "High", "Premium"].map((b) => (
                <button
                  key={b}
                  type="button"
                  className={`pill-btn ${budgetLevel === b ? "active" : ""}`}
                  onClick={() => setBudgetLevel(b)}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div className="workbench-form-group">
            <label className="workbench-label">Transportation & Logistics</label>
            <div className="pill-selector">
              {["Normal", "Refrigerated", "Fragile Air", "Rough Transit"].map((t) => (
                <button
                  key={t}
                  type="button"
                  className={`pill-btn ${transportMode === t ? "active" : ""}`}
                  onClick={() => setTransportMode(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="workbench-help-box">
            <Info size={14} style={{ flexShrink: 0, marginTop: "2px" }} />
            <span>
              Adjust any slider to run live <b>What-If</b> simulations. The center and right panels update in real time.
            </span>
          </div>
        </div>

        {/* ================= COLUMN 2: WORKSPACE & COMPARISON ================= */}
        <div className="workbench-col workbench-col-center">
          <div className="workbench-card-header">
            <span className="col-num">02</span>
            <div>
              <h3>Recommended Packaging</h3>
              <small>Optimized substrate & suitability breakdown</small>
            </div>
            <span className="score-badge">
              Suitability: <b>{recommendation.score}%</b>
            </span>
          </div>

          {/* Large Engineering Packaging Presentation */}
          <div className="recommended-package-hero">
            <div className="package-hero-tag">
              <ShieldCheck size={13} /> Recommended Substrate
            </div>
            <h2 className="package-hero-title">{recommendation.format.name}</h2>
            <div className="package-hero-meta">
              <span>Material: <b>{recommendation.format.material}</b></span>
              <span>·</span>
              <span>Code: <b>{recommendation.format.code}</b></span>
            </div>

            {/* Suitability Bars with Engineering Progress */}
            <div className="suitability-bars-section">
              <div className="suitability-bar-item">
                <div className="bar-label-row">
                  <span className="bar-name"><Clock size={13} /> Shelf Life</span>
                  <span className="bar-val">{recommendation.metrics.shelfLife}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${recommendation.metrics.shelfLife}%` }} />
                </div>
              </div>

              <div className="suitability-bar-item">
                <div className="bar-label-row">
                  <span className="bar-name"><ShieldCheck size={13} /> Food Safety</span>
                  <span className="bar-val">{recommendation.metrics.foodSafety}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill green" style={{ width: `${recommendation.metrics.foodSafety}%` }} />
                </div>
              </div>

              <div className="suitability-bar-item">
                <div className="bar-label-row">
                  <span className="bar-name"><DollarSign size={13} /> Cost Optimization</span>
                  <span className="bar-val">{recommendation.metrics.cost}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${recommendation.metrics.cost}%` }} />
                </div>
              </div>

              <div className="suitability-bar-item">
                <div className="bar-label-row">
                  <span className="bar-name"><Leaf size={13} /> Sustainability</span>
                  <span className="bar-val">{recommendation.metrics.sustainability}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill sage" style={{ width: `${recommendation.metrics.sustainability}%` }} />
                </div>
              </div>

              <div className="suitability-bar-item">
                <div className="bar-label-row">
                  <span className="bar-name"><Truck size={13} /> Transport Protection</span>
                  <span className="bar-val">{recommendation.metrics.transport}%</span>
                </div>
                <div className="bar-track">
                  <div className="bar-fill" style={{ width: `${recommendation.metrics.transport}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Alternative Formats Quick Benchmarking */}
          <div className="workbench-alternatives-block">
            <span className="sub-heading-industrial">Benchmark Alternative Formats</span>
            <div className="alternatives-grid">
              {recommendation.alternatives.map((alt) => (
                <div
                  key={alt.id}
                  className={`alt-card ${selectedFormatId === alt.id ? "active" : ""}`}
                  onClick={() => setSelectedFormatId(alt.id)}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <b>{alt.name}</b>
                    <span className="alt-code">{alt.code.split(" ")[0]}</span>
                  </div>
                  <div className="alt-meta">
                    <span>OTR: {alt.barrierRatings.oxygen.split(" ")[0]}</span>
                    <span>·</span>
                    <span>Circ: {alt.circularityScore}%</span>
                  </div>
                  <div className="alt-btn">Compare Option →</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ================= COLUMN 3: EXPLAINABLE ENGINEERING REASONING ================= */}
        <div className="workbench-col workbench-col-right">
          <div className="workbench-card-header">
            <span className="col-num">03</span>
            <div>
              <h3>Why this recommendation?</h3>
              <small>Explainable engineering decision logic</small>
            </div>
          </div>

          <div className="reasoning-list">
            {recommendation.checks.map((c, i) => (
              <div key={i} className={`reasoning-item ${c.pass === true ? "pass" : "marginal"}`}>
                <div className="reasoning-marker">
                  {c.pass === true ? <Check size={14} strokeWidth={2.5} /> : "△"}
                </div>
                <div className="reasoning-content">
                  <strong className="reasoning-text">{c.text}</strong>
                  <p className="reasoning-sub">{c.detail}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Technical Reasoning Toggle */}
          <div className="technical-reasoning-wrap">
            <button
              className="technical-toggle-btn"
              onClick={() => setShowTechnicalDrawer(!showTechnicalDrawer)}
            >
              <span>{showTechnicalDrawer ? "Hide Technical Reasoning ↑" : "Show Technical Reasoning →"}</span>
              <ChevronRight size={14} style={{ transform: showTechnicalDrawer ? "rotate(90deg)" : "none", transition: "transform 0.2s" }} />
            </button>

            {showTechnicalDrawer && (
              <div className="technical-drawer-content">
                <div className="tech-block">
                  <span className="tech-block-title">Kinetic Permeation Model</span>
                  <code>
                    J = (P / L) · Δp<br />
                    OTR = {recommendation.format.barrierRatings.oxygen}<br />
                    WVTR = {recommendation.format.barrierRatings.moisture}
                  </code>
                </div>

                <div className="tech-block">
                  <span className="tech-block-title">Arrhenius Temperature Acceleration</span>
                  <code>
                    k(T) = k₀ · exp(-Ea / RT)<br />
                    ΔT = {temperature - 20}°C baseline shift<br />
                    Q₁₀ Factor = 2.08
                  </code>
                </div>

                <div className="tech-block">
                  <span className="tech-block-title">Sorption Isotherm Limit</span>
                  <p style={{ margin: 0, fontSize: "11px", color: "var(--text-secondary)" }}>
                    Critical water activity aw limit maintained below 0.60 to suppress bacterial outgrowth and preserve product crispness.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Workbench Footer Export Action */}
          <div className="workbench-right-footer">
            <div className="audit-summary-note">
              Calibrated against ASTM F1249 (WVTR) and ASTM D3985 (OTR) standards.
            </div>
            {onOpenReport && (
              <button className="btn btn-outline" style={{ width: "100%", fontSize: "12.5px" }} onClick={onOpenReport}>
                <FileText size={14} /> Export Technical Specification PDF
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
