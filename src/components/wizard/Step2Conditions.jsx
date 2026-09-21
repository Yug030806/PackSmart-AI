import React, { useMemo } from "react";
import {
  Thermometer, Droplets, Calendar, Truck, DollarSign, ArrowLeft, ArrowRight,
  TrendingDown, ShieldAlert, Sparkles
} from "lucide-react";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from "recharts";

export function Step2Conditions({ input, setInput, validationErrors = {}, onBack, onNext }) {
  const set = (k, v) => setInput(x => ({ ...x, [k]: v }));

  const transportOptions = [
    { id: "Normal", label: "Standard Transit", desc: "Ambient local distribution" },
    { id: "Long distance", label: "Long Distance Freight", desc: "Extended interstate logistics" },
    { id: "Refrigerated", label: "Refrigerated Cold Chain", desc: "Temperature controlled (2–8°C)" },
    { id: "High humidity", label: "Tropical / High Humidity", desc: "Monsoon & coastal exposure" }
  ];

  const budgetOptions = [
    { id: "Low", label: "Economy Priority", desc: "Low cost polymer mono-films" },
    { id: "Medium", label: "Standard Commercial", desc: "Balanced performance & margin" },
    { id: "High", label: "Premium Preservation", desc: "Ultra-barrier multi-layer foils" }
  ];

  // Calculate live Temperature vs Shelf-Life curve based on Arrhenius Q10 kinetics
  const temperatureCurveData = useMemo(() => {
    const baseTemp = Number(input.temperature) || 25;
    const baseDays = Number(input.shelf) || 120;
    const points = [];
    
    // Q10 degradation factor approx 2.0 per 10°C
    for (let t = 5; t <= 45; t += 5) {
      const deltaT = (t - baseTemp) / 10;
      const kineticShelf = Math.max(3, Math.round(baseDays / Math.pow(2.0, deltaT)));
      points.push({
        temp: `${t}°C`,
        shelfLife: kineticShelf,
        isCurrent: Math.abs(t - baseTemp) < 2.5
      });
    }
    return points;
  }, [input.temperature, input.shelf]);

  const changeShelf = (delta) => {
    const current = Number(input.shelf) || 120;
    const nextVal = Math.max(7, Math.min(1000, current + delta));
    set("shelf", nextVal);
  };

  return (
    <div style={{ maxWidth: "1020px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <div className="micro-label green" style={{ marginBottom: "4px" }}>Step 02 / 05</div>
        <h2 style={{ fontSize: "26px", fontWeight: 800 }}>Environmental & Storage Conditions</h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Define the ambient thermodynamics, transit stress, and product longevity goals.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", gap: "24px", marginBottom: "28px" }}>
        {/* Left Column: Interactive Controls */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "18px" }}>
          <h3 style={{ fontSize: "17px", color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <Thermometer size={18} style={{ color: "var(--accent-green)" }} /> Storage Temperature & Humidity
          </h3>

          {/* Temperature Slider */}
          <div className="range-wrap">
            <div className="range-header">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Thermometer size={15} style={{ color: "var(--accent-cyan)" }} /> Storage Temperature
              </span>
              <span className="range-val">{input.temperature}°C</span>
            </div>
            <input
              type="range"
              min="0"
              max="45"
              step="1"
              value={input.temperature}
              onChange={e => set("temperature", Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
              <span>0°C (Cold Chain)</span>
              <span>25°C (Ambient Standard)</span>
              <span>45°C (Hot Desert)</span>
            </div>
            {validationErrors.temperature && (
              <span style={{ color: "#f04438", fontSize: "11px", marginTop: "4px", display: "block" }}>
                {validationErrors.temperature}
              </span>
            )}
          </div>

          {/* Relative Humidity Slider */}
          <div className="range-wrap">
            <div className="range-header">
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <Droplets size={15} style={{ color: "var(--accent-cyan)" }} /> Ambient Relative Humidity
              </span>
              <span className="range-val">{input.humidity}% RH</span>
            </div>
            <input
              type="range"
              min="20"
              max="95"
              step="1"
              value={input.humidity}
              onChange={e => set("humidity", Number(e.target.value))}
            />
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-muted)" }}>
              <span>20% (Arid)</span>
              <span>60% (Standard Ambient)</span>
              <span>95% (Tropical Saturation)</span>
            </div>
            {validationErrors.humidity && (
              <span style={{ color: "#f04438", fontSize: "11px", marginTop: "4px", display: "block" }}>
                {validationErrors.humidity}
              </span>
            )}
          </div>

          {/* Required Shelf Life with [-] [+] Interactive Counter */}
          <div style={{
            padding: "14px 16px",
            background: "var(--bg-input)",
            borderRadius: "var(--radius-md)",
            border: validationErrors.shelf ? "1px solid #f04438" : "1px solid var(--border-subtle)"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <span style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block" }}>
                  Required Target Shelf-Life
                </span>
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Duration product must retain quality</small>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "36px", height: "36px", padding: 0, fontSize: "18px", borderRadius: "50%" }}
                  onClick={() => changeShelf(-15)}
                >
                  −
                </button>
                <div style={{ fontFamily: "var(--font-heading)", fontSize: "22px", fontWeight: 800, color: "var(--accent-green)", minWidth: "90px", textAlign: "center" }}>
                  {input.shelf} <span style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-secondary)" }}>days</span>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ width: "36px", height: "36px", padding: 0, fontSize: "18px", borderRadius: "50%" }}
                  onClick={() => changeShelf(15)}
                >
                  +
                </button>
              </div>
            </div>
            {validationErrors.shelf && (
              <span style={{ color: "#f04438", fontSize: "11px", marginTop: "6px", display: "block" }}>
                {validationErrors.shelf}
              </span>
            )}
          </div>

          {/* Net Package Weight & Storage Type */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <div className="field" style={{ margin: 0 }}>
              <label>Net Package Weight (grams)</label>
              <input
                type="number"
                value={input.packageWeight}
                style={{
                  borderColor: validationErrors.packageWeight ? "#f04438" : undefined
                }}
                onChange={e => set("packageWeight", Number(e.target.value))}
              />
              {validationErrors.packageWeight && (
                <span style={{ color: "#f04438", fontSize: "11px", marginTop: "4px", display: "block" }}>
                  {validationErrors.packageWeight}
                </span>
              )}
            </div>
            <div className="field" style={{ margin: 0 }}>
              <label>Storage Environment</label>
              <select
                value={input.storage}
                onChange={e => set("storage", e.target.value)}
              >
                <option value="Ambient">Ambient</option>
                <option value="Chilled">Chilled (Refrigerated)</option>
                <option value="Frozen">Frozen (-18°C)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Right Column: Live Kinetic Curve Visualization */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Sparkles size={11} /> Live Kinetic Visualization
            </div>
            <h3 style={{ fontSize: "17px", color: "#fff", margin: "4px 0 2px" }}>
              Temperature vs. Shelf-Life Decay
            </h3>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
              Arrhenius Q10 kinetic modeling shows how thermal abuse accelerates oxidative and microbial degradation.
            </p>

            {/* Smooth Animated Recharts Area Chart */}
            <div style={{ height: "200px", width: "100%" }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={temperatureCurveData}>
                  <defs>
                    <linearGradient id="shelfLifeArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#32D583" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#32D583" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="temp" stroke="#6C7D77" fontSize={11} />
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
                  <Area
                    type="monotone"
                    dataKey="shelfLife"
                    name="Estimated Shelf Life"
                    stroke="#32D583"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#shelfLifeArea)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{
            background: "rgba(54, 191, 250, 0.08)",
            border: "1px solid rgba(54, 191, 250, 0.2)",
            borderRadius: "var(--radius-md)",
            padding: "12px 14px",
            fontSize: "12px",
            color: "#b4d8ee",
            lineHeight: "1.5"
          }}>
            <b>Kinetic Insight:</b> At your selected <b>{input.temperature}°C</b> and <b>{input.humidity}% RH</b>, the driving moisture vapor differential requires a packaging film with high barrier integrity to avert premature staling.
          </div>
        </div>
      </div>

      {/* Transit & Budget Condition Cards */}
      <div className="glass-card" style={{ padding: "24px", marginBottom: "28px" }}>
        <h3 style={{ fontSize: "17px", color: "#fff", marginBottom: "14px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Truck size={18} style={{ color: "var(--accent-cyan)" }} /> Transportation & Economic Constraints
        </h3>

        <div style={{ marginBottom: "18px" }}>
          <span className="micro-label" style={{ display: "block", marginBottom: "8px" }}>Transportation Condition:</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px" }}>
            {transportOptions.map(opt => {
              const isSelected = input.transport === opt.id;
              return (
                <div
                  key={opt.id}
                  className={`glass-card glass-card-interactive ${isSelected ? "selected" : ""}`}
                  style={{
                    padding: "14px",
                    borderColor: isSelected ? "var(--accent-green)" : undefined,
                    background: isSelected ? "var(--accent-green-subtle)" : "var(--bg-input)"
                  }}
                  onClick={() => set("transport", opt.id)}
                >
                  <b style={{ display: "block", color: isSelected ? "var(--accent-green)" : "#fff", fontSize: "13px" }}>
                    {opt.label}
                  </b>
                  <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{opt.desc}</small>
                </div>
              );
            })}
          </div>
        </div>

        <div>
          <span className="micro-label" style={{ display: "block", marginBottom: "8px" }}>Target Cost & Budget Constraint:</span>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "10px" }}>
            {budgetOptions.map(b => {
              const isSelected = input.budget === b.id;
              return (
                <div
                  key={b.id}
                  className={`glass-card glass-card-interactive ${isSelected ? "selected" : ""}`}
                  style={{
                    padding: "14px",
                    borderColor: isSelected ? "var(--accent-green)" : undefined,
                    background: isSelected ? "var(--accent-green-subtle)" : "var(--bg-input)"
                  }}
                  onClick={() => set("budget", b.id)}
                >
                  <b style={{ display: "block", color: isSelected ? "var(--accent-green)" : "#fff", fontSize: "13px" }}>
                    {b.label}
                  </b>
                  <small style={{ color: "var(--text-secondary)", fontSize: "11px" }}>{b.desc}</small>
                </div>
              );
            })}
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
          <ArrowLeft size={16} /> Back to Food Profile
        </button>

        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: "12px 28px", fontSize: "14px" }}
          onClick={onNext}
        >
          Proceed to Packaging Materials →
        </button>
      </div>
    </div>
  );
}
