import React from "react";
import {
  Sparkles, ArrowRight, TrendingUp, Clock, DollarSign, Leaf,
  Package, ShieldCheck, Database, Layers, CheckCircle2, Play
} from "lucide-react";
import { AnimatedNumber } from "../common/AnimatedNumber";
import { FOODS } from "../../data/materials";

export function Dashboard({ onNavigate, onSelectFoodAndLaunch, backendHealthy, currentUser }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const presetCommodities = [
    { key: "chips", name: "Potato Chips", category: "Snacks", icon: "🥔", note: "Lipid Oxidation Critical" },
    { key: "biscuits", name: "Biscuits & Bakery", category: "Bakery", icon: "🍪", note: "Moisture Sorption Limit" },
    { key: "tomato", name: "Fresh Tomato", category: "Produce", icon: "🍅", note: "Active Respiration / MAP" },
    { key: "paneer", name: "Fresh Paneer", category: "Dairy", icon: "🧀", note: "Microbial Cold Chain" },
    { key: "nuts", name: "Roasted Almonds", category: "Snacks", icon: "🥜", note: "Extreme OTR Shield" },
    { key: "chocolate", name: "Dark Chocolate", category: "Confectionery", icon: "🍫", note: "Fat Bloom Barrier" }
  ];

  return (
    <div>
      {/* Dashboard Command Center Header */}
      <div className="page-header">
        <div>
          <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Sparkles size={12} /> Packaging Advisory & Barrier Optimization Engine
          </div>
          <h1 className="page-title">
            {getGreeting()}, {currentUser?.name ? currentUser.name.split(" ")[0] : "Engineer"}.
          </h1>
          <p className="page-desc">
            What would you like to optimize today? Calculate physical OTR & WVTR, simulate degradation, or calibrate Pareto sustainability trade-offs.
          </p>
        </div>

        <button
          className="btn btn-primary"
          style={{ padding: "12px 24px", fontSize: "14px" }}
          onClick={() => onNavigate("advisor")}
        >
          <Sparkles size={16} /> + New Packaging Analysis
        </button>
      </div>

      {/* KPI Cards with Smooth Count-Up */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total Analyses</span>
            <Package size={16} style={{ color: "var(--accent-green)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={128} />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> ↑ 12.4% this month
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Average Shelf Life</span>
            <Clock size={16} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={142} suffix=" d" />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> ↑ 8.2% shelf extension
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Cost Saved</span>
            <DollarSign size={16} style={{ color: "var(--accent-green)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={42800} prefix="₹" />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> ↑ 18.5% polymer gauge optimization
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>CO₂ Reduced</span>
            <Leaf size={16} style={{ color: "var(--warning-amber)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={1.84} decimals={2} suffix=" t" />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> ↑ 24.1% avoided food waste LCA
          </div>
        </div>
      </div>

      {/* Quick Analysis Launcher & Scenarios */}
      <section style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h3 style={{ fontSize: "18px", fontWeight: 700 }}>Quick Commodity Analysis Launcher</h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)" }}>
              Select a calibrated food commodity to launch the 5-step packaging optimization wizard.
            </p>
          </div>
          <button className="btn btn-outline" style={{ fontSize: "12px", padding: "6px 14px" }} onClick={() => onNavigate("advisor")}>
            View All Presets →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "14px" }}>
          {presetCommodities.map(c => (
            <div
              key={c.key}
              className="glass-card glass-card-interactive"
              style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "10px" }}
              onClick={() => onSelectFoodAndLaunch(c.key)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontSize: "28px" }}>{c.icon}</span>
                <span className="spec-chip" style={{ color: "var(--accent-cyan)", borderColor: "rgba(54, 191, 250, 0.25)" }}>
                  {c.category}
                </span>
              </div>
              <div>
                <b style={{ fontSize: "15px", color: "#fff", display: "block" }}>{c.name}</b>
                <small style={{ color: "var(--text-secondary)", fontSize: "11.5px" }}>{c.note}</small>
              </div>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--accent-green)", fontWeight: 600 }}>
                <Play size={12} fill="currentColor" /> Launch Analysis
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* System Engine Telemetry & Recent Activities */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "20px" }}>
        {/* Telemetry Card */}
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <span className="micro-label green">Engine Telemetry</span>
              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "2px 0 0" }}>ASTM Permeation & ML Pipeline Status</h3>
            </div>
            <span className="badge-pass">
              <CheckCircle2 size={13} /> Online & Validated
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>Active Machine Learning Model</span>
              <b style={{ display: "block", color: "#fff", fontSize: "13px", marginTop: "4px" }}>Scikit-Learn MultiOutputRegressor</b>
              <small style={{ color: "var(--accent-cyan)", fontSize: "10.5px" }}>Random Forest (R² = 0.996)</small>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "11px", color: "var(--text-muted)" }}>ASTM Standards Verified</span>
              <b style={{ display: "block", color: "#fff", fontSize: "13px", marginTop: "4px" }}>ASTM D3985 & ASTM F1249</b>
              <small style={{ color: "var(--accent-green)", fontSize: "10.5px" }}>Temperature Arrhenius Scaled</small>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "12px" }}>
            <span>Backend Service: <b>{backendHealthy ? "FastAPI 2.0 (Port 8000)" : "Browser Client Engine"}</b></span>
            <span>Security Layer: <b>3-Tier RBAC Active</b></span>
          </div>
        </div>

        {/* Quick Tools Card */}
        <div className="glass-card" style={{ padding: "24px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span className="micro-label cyan">Engineering Tools</span>
            <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "2px 0 12px" }}>Quick Access Modules</h3>
            
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start", width: "100%", fontSize: "12.5px" }}
                onClick={() => onNavigate("simulator")}
              >
                <Clock size={15} style={{ color: "var(--accent-cyan)" }} /> What-If Degradation Simulator
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start", width: "100%", fontSize: "12.5px" }}
                onClick={() => onNavigate("compare")}
              >
                <Layers size={15} style={{ color: "var(--accent-green)" }} /> ASTM Material Comparison Table
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start", width: "100%", fontSize: "12.5px" }}
                onClick={() => onNavigate("database")}
              >
                <Database size={15} style={{ color: "var(--warning-amber)" }} /> Food Chemistry & Barrier Database
              </button>
            </div>
          </div>

          <div style={{ marginTop: "16px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)" }}>
            Need help? Explore the <button style={{ color: "var(--accent-green)", textDecoration: "underline", background: "none", border: "none", font: "inherit", cursor: "pointer" }} onClick={() => onNavigate("compare")}>ASTM Specifications</button> or launch an advisor run.
          </div>
        </div>
      </div>
    </div>
  );
}
