import React from "react";
import {
  Sparkles, ArrowRight, ShieldCheck, Check, Database, Zap, Leaf,
  Layers, Package, Wind, ChevronRight, User, Wrench, Crown, Key
} from "lucide-react";
import { AnimatedNumber } from "../common/AnimatedNumber";

export function LandingPage({ onNavigate, onQuickSwitch, backendHealthy }) {
  return (
    <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
      {/* Hero Section */}
      <section className="landing-hero">
        <div className="hero-content">
          <div className="micro-label green" style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(50, 213, 131, 0.1)", padding: "6px 14px", borderRadius: "9999px", marginBottom: "18px", border: "1px solid rgba(50, 213, 131, 0.25)" }}>
            <Sparkles size={13} /> ASTM D3985 / F1249 Physics + Scikit-Learn ML
          </div>

          <h1>
            PACKSMART AI<br />
            <span className="hero-highlight">Engineer better packaging.</span><br />
            Predict its performance.
          </h1>

          <p className="hero-subhead">
            Intelligent food packaging optimization combining physical oxygen & water vapor barrier kinetics, shelf-life prediction, unit economics and circular sustainability.
          </p>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <button className="btn btn-primary" style={{ padding: "14px 28px", fontSize: "15px" }} onClick={() => onNavigate("advisor")}>
              Start Analysis <ArrowRight size={18} />
            </button>
            <button className="btn btn-secondary" style={{ padding: "14px 24px", fontSize: "15px" }} onClick={() => onNavigate("dashboard")}>
              Explore Platform
            </button>
          </div>

          <div style={{ display: "flex", gap: "20px", marginTop: "36px", flexWrap: "wrap", fontSize: "12.5px", color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={16} style={{ color: "var(--accent-green)" }} /> Real OTR (cc/m²·day) & WVTR (g/m²·day)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={16} style={{ color: "var(--accent-green)" }} /> Deterministic PASS / FAIL validation
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={16} style={{ color: "var(--accent-cyan)" }} /> MultiOutput Random Forest
            </span>
          </div>
        </div>

        {/* Hero Scientific Packaging Visualization */}
        <div className="hero-package-viz">
          {/* Orbiting Particles & Gas molecules */}
          <div style={{
            position: "absolute",
            width: "320px",
            height: "320px",
            borderRadius: "50%",
            border: "1px dashed rgba(54, 191, 250, 0.2)",
            animation: "spin-ring 24s linear infinite"
          }} />
          <div style={{
            position: "absolute",
            width: "260px",
            height: "260px",
            borderRadius: "50%",
            border: "1px dashed rgba(50, 213, 131, 0.25)",
            animation: "spin-ring 18s linear infinite reverse"
          }} />

          {/* Center Floating Packaging Container */}
          <div className="hero-package-box">
            <Package size={52} style={{ color: "var(--accent-green)" }} />
            <div style={{ textAlign: "center" }}>
              <b style={{ color: "#fff", fontSize: "13px", display: "block", fontFamily: "var(--font-heading)" }}>Hermetic Pouch</b>
              <small style={{ color: "var(--accent-cyan)", fontSize: "10px", fontFamily: "var(--font-mono)" }}>ASTM Verified</small>
            </div>
            <div style={{ display: "flex", gap: "4px" }}>
              <span style={{ fontSize: "9px", background: "rgba(50, 213, 131, 0.15)", color: "var(--accent-green)", padding: "2px 6px", borderRadius: "4px" }}>
                OTR: 1.5
              </span>
              <span style={{ fontSize: "9px", background: "rgba(54, 191, 250, 0.15)", color: "var(--accent-cyan)", padding: "2px 6px", borderRadius: "4px" }}>
                WVTR: 0.6
              </span>
            </div>
          </div>

          {/* Technical metric cards positioned around */}
          <div className="hero-metric-badge hero-badge-1">
            <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>OTR ↓</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>0.82 cc/m²·d</span>
          </div>

          <div className="hero-metric-badge hero-badge-2">
            <span style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>WVTR ↓</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>0.45 g/m²·d</span>
          </div>

          <div className="hero-metric-badge hero-badge-3">
            <span style={{ color: "var(--accent-green)", fontWeight: 700 }}>Shelf Life ↑</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>+45 days buffer</span>
          </div>

          <div className="hero-metric-badge hero-badge-4">
            <span style={{ color: "var(--warning-amber)", fontWeight: 700 }}>CO₂ ↓</span>
            <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>-159g LCA Credit</span>
          </div>

          {/* Floating Subtle Ambient Particles */}
          <div style={{ position: "absolute", top: "25%", left: "15%", fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(54, 191, 250, 0.6)", pointerEvents: "none" }}>O₂</div>
          <div style={{ position: "absolute", top: "35%", right: "18%", fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(50, 213, 131, 0.6)", pointerEvents: "none" }}>H₂O</div>
          <div style={{ position: "absolute", bottom: "30%", left: "22%", fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(245, 185, 66, 0.6)", pointerEvents: "none" }}>CO₂</div>
          <div style={{ position: "absolute", bottom: "22%", right: "24%", fontSize: "11px", fontFamily: "var(--font-mono)", color: "rgba(255, 255, 255, 0.4)", pointerEvents: "none" }}>25°C · 60% RH</div>
        </div>
      </section>

      {/* Real ML Pipeline Flow */}
      <section style={{ margin: "50px 0 70px" }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div className="micro-label cyan" style={{ marginBottom: "6px" }}>Scientific Architecture</div>
          <h2 style={{ fontSize: "32px", fontWeight: 800 }}>
            From <span style={{ color: "var(--accent-green)" }}>food chemistry</span> to verified barrier specs.
          </h2>
          <p style={{ maxWidth: "600px", margin: "10px auto 0", fontSize: "14px" }}>
            The engine calculates maximum allowable oxygen absorption from lipid oxidation kinetics and moisture sorption isotherms.
          </p>
        </div>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: "12px",
          background: "var(--bg-card)",
          border: "1px solid var(--border-card)",
          borderRadius: "var(--radius-xl)",
          padding: "24px 20px"
        }}>
          {[
            { step: "01", title: "User Input", desc: "Food chemistry & storage" },
            { step: "02", title: "Preprocessing", desc: "Sorption isotherms" },
            { step: "03", title: "ML Pipeline", desc: "MultiOutput Random Forest" },
            { step: "04", title: "Barrier Check", desc: "ASTM OTR & WVTR pass/fail" },
            { step: "05", title: "Optimization", desc: "Pareto & gauge sizing" },
            { step: "06", title: "Recommendation", desc: "Explainable result" }
          ].map((item, idx) => (
            <div key={item.step} style={{ textAlign: "center", position: "relative" }}>
              <div style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: "var(--bg-surface)",
                border: "1px solid var(--border-subtle)",
                display: "grid",
                placeItems: "center",
                margin: "0 auto 10px",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                fontWeight: 700,
                color: "var(--accent-green)"
              }}>
                {item.step}
              </div>
              <b style={{ display: "block", color: "#fff", fontSize: "13px", marginBottom: "4px" }}>{item.title}</b>
              <small style={{ color: "var(--text-muted)", fontSize: "11px", lineHeight: "1.4", display: "block" }}>{item.desc}</small>
            </div>
          ))}
        </div>
      </section>

      {/* 3-Tier Role-Based Access Control Showcase */}
      <section style={{
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "60px",
        marginBottom: "60px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "36px" }}>
          <div className="micro-label green" style={{ marginBottom: "6px" }}>
            <ShieldCheck size={13} style={{ display: "inline", marginRight: "4px" }} /> Enterprise Security Architecture
          </div>
          <h2 style={{ fontSize: "32px", fontWeight: 800 }}>
            3-Tier <span style={{ color: "var(--accent-green)" }}>Role-Based Access Control</span> (RBAC)
          </h2>
          <p style={{ maxWidth: "600px", margin: "10px auto 0", fontSize: "14px" }}>
            PackSmart AI enforces strict separation of concerns from laboratory researchers to enterprise system administrators.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" }}>
          {/* User Card */}
          <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={18} style={{ color: "var(--accent-green)" }} /> 👤 User
                </span>
                <span className="badge-pass" style={{ fontSize: "10.5px" }}>Basic Access</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "18px" }}>
                Use packaging advisor, compare materials, What-If simulator, recommendations, reports, and history.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                <span className="spec-chip">✓ Packaging Advisor</span>
                <span className="spec-chip">✓ Compare Materials</span>
                <span className="spec-chip">✓ What-If Simulator</span>
                <span className="spec-chip">✓ Recommendations</span>
                <span className="spec-chip">✓ Reports & History</span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: "100%", fontSize: "12.5px" }}
              onClick={() => { onQuickSwitch("user"); onNavigate("advisor"); }}
            >
              Test User Persona 👤
            </button>
          </div>

          {/* System Manager Card */}
          <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Wrench size={18} style={{ color: "var(--accent-cyan)" }} /> 🛠️ System Manager
                </span>
                <span className="badge-pass" style={{ fontSize: "10.5px", background: "rgba(54, 191, 250, 0.12)", color: "var(--accent-cyan)", borderColor: "rgba(54, 191, 250, 0.35)" }}>
                  Management Access
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "18px" }}>
                Everything a User can do + manage users, food/material data, recommendations, reports, and application settings.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                <span className="spec-chip">✓ All User Privileges</span>
                <span className="spec-chip">✓ Manage Users</span>
                <span className="spec-chip">✓ Food/Material Catalogs</span>
                <span className="spec-chip">✓ Recommendations & Reports</span>
                <span className="spec-chip">✓ Application Settings</span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: "100%", fontSize: "12.5px" }}
              onClick={() => { onQuickSwitch("system_manager"); onNavigate("management"); }}
            >
              Test System Manager Persona 🛠️
            </button>
          </div>

          {/* Super Admin Card */}
          <div className="glass-card" style={{ padding: "28px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderColor: "rgba(245, 185, 66, 0.35)" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span style={{ fontSize: "18px", fontWeight: 700, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Crown size={18} style={{ color: "var(--warning-amber)" }} /> 👑 Super Admin
                </span>
                <span className="badge-marginal" style={{ fontSize: "10.5px" }}>Full System Access</span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "18px" }}>
                Unrestricted root access: manage System Managers, roles/permissions, system configuration, security, and complete database access.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "24px" }}>
                <span className="spec-chip">✓ Manage Users & Managers</span>
                <span className="spec-chip">✓ Roles & Permissions Matrix</span>
                <span className="spec-chip">✓ Activity & Audit Logs</span>
                <span className="spec-chip">✓ Security & MFA Policies</span>
                <span className="spec-chip" style={{ color: "var(--warning-amber)" }}>★ Complete Database Access</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", fontSize: "12.5px" }}
              onClick={() => { onQuickSwitch("super_admin"); onNavigate("admin"); }}
            >
              Test Super Admin Persona 👑
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "28px" }}>
          <button className="btn btn-outline" onClick={() => onNavigate("login")}>
            <Key size={14} /> Open Full RBAC Authentication Gateway →
          </button>
        </div>
      </section>
    </div>
  );
}
