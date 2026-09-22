import React from "react";
import {
  Sparkles, ArrowRight, TrendingUp, Clock, DollarSign, Leaf,
  Package, ShieldCheck, Database, Layers, CheckCircle2, Play,
  AlertTriangle, Sliders, FileText, ArrowUpRight, Activity
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
    { key: "chips", name: "Potato Chips", category: "Snacks", note: "Lipid Oxidation Critical · 120d" },
    { key: "biscuits", name: "Biscuits & Bakery", category: "Bakery", note: "Moisture Sorption Limit · 120d" },
    { key: "tomato", name: "Fresh Tomato", category: "Produce", note: "Active Respiration EMAP · 18d" },
    { key: "paneer", name: "Fresh Paneer", category: "Dairy", note: "Microbial Cold Chain · 14d" },
    { key: "nuts", name: "Roasted Almonds", category: "Snacks", note: "High OTR Barrier Shield · 180d" },
    { key: "chocolate", name: "Dark Chocolate", category: "Confectionery", note: "Fat Bloom Barrier · 365d" }
  ];

  const recentAnalyses = [
    {
      id: "rec-01",
      food: "Mango Juice",
      material: "PET Bottle (RIC 1)",
      condition: "Refrigerated 4°C · 30 days",
      status: "PASS",
      score: 92,
      risk: "Low",
      date: "Today, 09:14 AM"
    },
    {
      id: "rec-02",
      food: "Biscuits & Cookies",
      material: "Metallized Barrier Pouch",
      condition: "Ambient 25°C · 120 days",
      status: "PASS",
      score: 94,
      risk: "Low",
      date: "Yesterday"
    },
    {
      id: "rec-03",
      food: "Dairy Product (Paneer)",
      material: "HDPE Container",
      condition: "Chilled 4°C · 14 days",
      status: "HIGH RISK",
      score: 68,
      risk: "Critical microbial sensitivity if cold chain breaks",
      date: "2 days ago"
    },
    {
      id: "rec-04",
      food: "Fresh Tomato",
      material: "Micro-Perforated Breathable Film",
      condition: "Chilled 12°C · 18 days EMAP",
      status: "PASS",
      score: 89,
      risk: "Low",
      date: "3 days ago"
    }
  ];

  return (
    <div>
      {/* Operational Workspace Header */}
      <div className="page-header" style={{ marginBottom: "20px" }}>
        <div>
          <div className="spec-tag green" style={{ marginBottom: "6px" }}>
            <Activity size={12} /> Packaging Operations Workspace
          </div>
          <h1 className="page-title">Packaging Analysis</h1>
          <p className="page-desc">
            {getGreeting()}, {currentUser?.name ? currentUser.name.split(" ")[0] : "Engineer"}. Review active laboratory analyses, audit packaging trade-offs, or evaluate new product specifications.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            className="btn btn-secondary"
            onClick={() => onNavigate("workbench")}
          >
            <Sliders size={15} /> Decision Workbench
          </button>
          <button
            className="btn btn-primary"
            onClick={() => onNavigate("advisor")}
          >
            <Package size={15} /> + New Packaging Analysis
          </button>
        </div>
      </div>

      {/* Operational Workspace Summary Bar */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-md)",
        padding: "12px 18px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexWrap: "wrap",
        gap: "14px",
        boxShadow: "var(--shadow-sm)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "20px", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "var(--accent-green)" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary-dark)" }}>
              <b>3</b> Active Analyses
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "var(--accent-secondary-green)" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--color-primary-dark)" }}>
              <b>2</b> Recommendations Validated
            </span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "var(--warning-amber)" }} />
            <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--warning-amber)" }}>
              <b>1</b> High-Risk Case (Moisture Sorption Margin)
            </span>
          </div>
        </div>

        <div style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
          ASTM Verification: <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>ACTIVE</span>
        </div>
      </div>

      {/* Industrial KPI Metrics */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label">
            <span>Total Analyses Evaluated</span>
            <Package size={15} style={{ color: "var(--accent-green)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={128} />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> ↑ 12% laboratory runs this month
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Average Target Longevity</span>
            <Clock size={15} style={{ color: "var(--accent-cyan)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={142} suffix=" d" />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> +34-day average safety buffer
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Gauge Cost Savings</span>
            <DollarSign size={15} style={{ color: "var(--accent-green)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={42800} prefix="₹" />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> 18.5% polymer thickness reduction
          </div>
        </div>

        <div className="kpi-card">
          <div className="kpi-label">
            <span>Avoided Food Spoilage Carbon</span>
            <Leaf size={15} style={{ color: "var(--accent-secondary-green)" }} />
          </div>
          <div className="kpi-value">
            <AnimatedNumber value={1.84} decimals={2} suffix=" t" />
          </div>
          <div className="kpi-trend">
            <TrendingUp size={13} /> LCA net credit per batch
          </div>
        </div>
      </div>

      {/* Operational Recent Analyses Table */}
      <section style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--color-primary-dark)" }}>Recent Analyses</h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              Audit trail of recent food packaging evaluations and physical degradation forecasts.
            </p>
          </div>
          <button
            className="btn btn-outline"
            style={{ fontSize: "12px", padding: "5px 12px" }}
            onClick={() => onNavigate("history")}
          >
            View All History →
          </button>
        </div>

        <div style={{
          background: "#FFFFFF",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
          boxShadow: "var(--shadow-sm)"
        }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "var(--bg-subtle)", borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px", textTransform: "uppercase" }}>
                <th style={{ padding: "10px 16px" }}>Food Product</th>
                <th style={{ padding: "10px 16px" }}>Recommended Package</th>
                <th style={{ padding: "10px 16px" }}>Environmental Condition</th>
                <th style={{ padding: "10px 16px" }}>Suitability</th>
                <th style={{ padding: "10px 16px" }}>Risk Status</th>
                <th style={{ padding: "10px 16px", textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {recentAnalyses.map((item) => (
                <tr
                  key={item.id}
                  style={{ borderBottom: "1px solid var(--border-subtle)", transition: "background 0.15s" }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-card-hover)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "#FFFFFF"}
                >
                  <td style={{ padding: "12px 16px", fontWeight: 700, color: "var(--color-primary-dark)" }}>
                    {item.food}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    {item.material}
                  </td>
                  <td style={{ padding: "12px 16px", color: "var(--text-muted)", fontSize: "12px" }}>
                    {item.condition}
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 700, color: item.score >= 80 ? "var(--accent-green)" : "var(--warning-amber)" }}>
                      {item.score}%
                    </span>
                  </td>
                  <td style={{ padding: "12px 16px" }}>
                    {item.status === "PASS" ? (
                      <span className="badge-pass"><CheckCircle2 size={12} /> PASS</span>
                    ) : (
                      <span className="badge-fail"><AlertTriangle size={12} /> HIGH RISK</span>
                    )}
                  </td>
                  <td style={{ padding: "12px 16px", textAlign: "right" }}>
                    <button
                      className="btn btn-ghost"
                      style={{ fontSize: "12px", padding: "4px 8px", color: "var(--accent-green)" }}
                      onClick={() => onNavigate("workbench")}
                    >
                      Inspect in Workbench →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Quick Commodity Analysis Launcher */}
      <section style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
          <div>
            <h3 style={{ fontSize: "17px", fontWeight: 700, color: "var(--color-primary-dark)" }}>Quick Food Commodity Launcher</h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)" }}>
              Select a calibrated laboratory baseline to launch the 5-step packaging optimization advisor.
            </p>
          </div>
          <button
            className="btn btn-outline"
            style={{ fontSize: "12px", padding: "5px 12px" }}
            onClick={() => onNavigate("advisor")}
          >
            View All Presets →
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "12px" }}>
          {presetCommodities.map((c) => (
            <div
              key={c.key}
              className="glass-card glass-card-interactive"
              style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "8px" }}
              onClick={() => onSelectFoodAndLaunch(c.key)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <b style={{ fontSize: "14.5px", color: "var(--color-primary-dark)" }}>{c.name}</b>
                <span className="spec-chip">{c.category}</span>
              </div>
              <small style={{ color: "var(--text-secondary)", fontSize: "11.5px" }}>
                {c.note}
              </small>
              <div style={{ marginTop: "auto", display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", color: "var(--accent-green)", fontWeight: 600 }}>
                <Play size={11} fill="currentColor" /> Launch Analysis
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Telemetry & Engineering Tools Split */}
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: "18px" }}>
        {/* Telemetry Card */}
        <div className="glass-card" style={{ padding: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div>
              <span className="spec-tag green">Engine Telemetry</span>
              <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 0", color: "var(--color-primary-dark)" }}>
                Permeation & Predictive Pipeline
              </h3>
            </div>
            <span className="badge-pass">
              <CheckCircle2 size={12} /> Validated
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "14px" }}>
            <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Predictive Engine</span>
              <b style={{ display: "block", color: "var(--color-primary-dark)", fontSize: "13px", marginTop: "2px" }}>Random Forest MultiOutput</b>
              <small style={{ color: "var(--accent-cyan)", fontSize: "10.5px" }}>R² = 0.94 · 2,000 prototype samples</small>
            </div>

            <div style={{ background: "var(--bg-subtle)", padding: "10px 12px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <span style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>ASTM Verification</span>
              <b style={{ display: "block", color: "var(--color-primary-dark)", fontSize: "13px", marginTop: "2px" }}>F1249 (WVTR) · D3985 (OTR)</b>
              <small style={{ color: "var(--accent-green)", fontSize: "10.5px" }}>Arrhenius Temperature Scaled</small>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "10px" }}>
            <span>Backend: <b>{backendHealthy ? "FastAPI Core (Port 8000)" : "Local Thermodynamic Engine"}</b></span>
            <span>Security: <b>3-Tier RBAC Active</b></span>
          </div>
        </div>

        {/* Engineering Tools Card */}
        <div className="glass-card" style={{ padding: "20px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <span className="spec-tag cyan">Engineering Modules</span>
            <h3 style={{ fontSize: "16px", fontWeight: 700, margin: "2px 0 10px", color: "var(--color-primary-dark)" }}>Quick Access Lab Tools</h3>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start", width: "100%", fontSize: "12.5px" }}
                onClick={() => onNavigate("workbench")}
              >
                <Sliders size={14} style={{ color: "var(--accent-green)" }} /> Decision Workbench (3-Column)
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start", width: "100%", fontSize: "12.5px" }}
                onClick={() => onNavigate("brainstorm")}
              >
                <Layers size={14} style={{ color: "var(--accent-cyan)" }} /> Packaging Brainstorm Whiteboard
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start", width: "100%", fontSize: "12.5px" }}
                onClick={() => onNavigate("simulator")}
              >
                <Clock size={14} style={{ color: "var(--warning-amber)" }} /> What-If Degradation Simulator
              </button>
              <button
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start", width: "100%", fontSize: "12.5px" }}
                onClick={() => onNavigate("compare")}
              >
                <FileText size={14} style={{ color: "var(--text-secondary)" }} /> Material Comparison Matrix
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
