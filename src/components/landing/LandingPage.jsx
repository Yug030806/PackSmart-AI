import React, { useState, useEffect } from "react";
import {
  ArrowRight, ShieldCheck, Check, Database, Zap, Leaf,
  Layers, Package, Wind, ChevronRight, User, Wrench, Crown, Key,
  Sliders, FileText, ArrowDown, Droplets, Clock, DollarSign, Truck
} from "lucide-react";
import { AnimatedNumber } from "../common/AnimatedNumber";
import { PackagingVisualizer } from "../packaging/PackagingVisualizer";

export function LandingPage({ onNavigate, onQuickSwitch, backendHealthy }) {
  // Subtle animation sequence for the visual workflow hero
  const [activeWorkflowStep, setActiveWorkflowStep] = useState(0);

  const workflowSteps = [
    { num: "01", title: "Food Product", desc: "Moisture, lipid, respiration & pH matrix", icon: Droplets },
    { num: "02", title: "Packaging Requirements", desc: "Shelf life, temperature & logistics constraints", icon: Clock },
    { num: "03", title: "Material Analysis", desc: "OTR, WVTR & ASTM barrier calculations", icon: Wind },
    { num: "04", title: "Shelf-Life / Safety", desc: "Kinetic Arrhenius & microbial simulation", icon: ShieldCheck },
    { num: "05", title: "Cost + Sustainability", desc: "Polymer mass, unit economics & circularity", icon: Leaf },
    { num: "06", title: "Recommended Package", desc: "Pareto-optimal substrate & gauge sizing", icon: Package }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveWorkflowStep(prev => (prev + 1) % workflowSteps.length);
    }, 2800);
    return () => clearInterval(timer);
  }, [workflowSteps.length]);

  return (
    <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
      {/* ================= HERO SECTION ================= */}
      <section className="landing-hero-industrial">
        <div style={{ textAlign: "center", maxWidth: "880px", margin: "0 auto" }}>
          <div className="spec-tag green" style={{ marginBottom: "14px" }}>
            <ShieldCheck size={12} /> Packaging Intelligence Platform
          </div>

          <h1 className="hero-main-title">
            Choose the right package<br />
            before production.
          </h1>

          <p className="hero-supporting-text">
            Engineering-grade decision intelligence for shelf life, barrier kinetics, unit economics, and circularity.
          </p>

          <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap", marginBottom: "28px" }}>
            <button
              className="btn btn-primary"
              style={{ padding: "13px 26px", fontSize: "14.5px" }}
              onClick={() => onNavigate("workbench")}
            >
              Open Decision Workbench <ArrowRight size={17} />
            </button>
            <button
              className="btn btn-secondary"
              style={{ padding: "13px 22px", fontSize: "14.5px" }}
              onClick={() => onNavigate("advisor")}
            >
              Start 5-Step Analysis
            </button>
            <button
              className="btn btn-outline"
              style={{ padding: "13px 20px", fontSize: "14.5px" }}
              onClick={() => onNavigate("brainstorm")}
            >
              Packaging Brainstorm Canvas
            </button>
          </div>

          <div style={{ display: "flex", gap: "24px", justifyContent: "center", flexWrap: "wrap", fontSize: "12px", color: "var(--text-secondary)", borderTop: "1px solid var(--border-subtle)", paddingTop: "16px" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={15} style={{ color: "var(--accent-green)" }} /> ASTM Permeation Calibrated
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={15} style={{ color: "var(--accent-green)" }} /> Deterministic Verification
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Check size={15} style={{ color: "var(--accent-green)" }} /> LCA & Spoilage Economics
            </span>
          </div>
        </div>

        {/* Real Packaging Decision Workflow Hero */}
        <div className="workflow-hero-container">
          <div className="workflow-hero-header">
            <div>
              <span className="spec-tag green">Decision Pipeline</span>
              <h3 style={{ fontSize: "17px", fontWeight: 700, margin: "2px 0 0", color: "var(--color-primary-dark)" }}>
                The Packaging Engineering Workflow
              </h3>
            </div>
            <span style={{ fontSize: "11.5px", fontFamily: "var(--font-mono)", color: "var(--text-muted)" }}>
              Step {activeWorkflowStep + 1} of 6: <b>{workflowSteps[activeWorkflowStep].title}</b>
            </span>
          </div>

          <div className="workflow-steps-horizontal">
            {workflowSteps.map((step, idx) => {
              const StepIcon = step.icon;
              const isActive = activeWorkflowStep === idx;

              return (
                <React.Fragment key={step.num}>
                  <div
                    className={`workflow-step-card ${isActive ? "active" : ""}`}
                    onClick={() => setActiveWorkflowStep(idx)}
                    style={{ cursor: "pointer" }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span className="step-card-num">{step.num}</span>
                      <StepIcon size={14} style={{ color: isActive ? "var(--accent-green)" : "var(--text-muted)" }} />
                    </div>
                    <div className="step-card-title">{step.title}</div>
                    <div className="step-card-desc">{step.desc}</div>
                  </div>

                  {idx < workflowSteps.length - 1 && (
                    <div className="workflow-arrow-divider">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= REAL-WORLD PACKAGING VISUALIZATION GALLERY ================= */}
      <section style={{ margin: "20px 0 50px" }}>
        <PackagingVisualizer
          onSelectFormat={(format) => {
            onNavigate("workbench");
          }}
        />
      </section>

      {/* ================= CORE ENGINEERING PILLARS ================= */}
      <section style={{ margin: "50px 0", borderTop: "1px solid var(--border-subtle)", paddingTop: "40px" }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <span className="spec-tag green" style={{ marginBottom: "6px" }}>
            Technical Capabilities
          </span>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-primary-dark)" }}>
            Engineered for real food manufacturing decisions.
          </h2>
          <p style={{ maxWidth: "620px", margin: "6px auto 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Replace guesswork with rigorous barrier kinetics, temperature sensitivity modeling, and total cost of ownership.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "18px" }}>
          <div className="glass-card" style={{ padding: "22px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--accent-green-subtle)", display: "grid", placeItems: "center", color: "var(--accent-green)", marginBottom: "14px" }}>
              <Wind size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "var(--color-primary-dark)" }}>
              ASTM Barrier Kinetics
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.45" }}>
              Calculates critical OTR and WVTR limits directly from food moisture sorption and lipid oxidation limits.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "22px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--bg-subtle)", display: "grid", placeItems: "center", color: "var(--color-primary-dark)", marginBottom: "14px" }}>
              <Clock size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "var(--color-primary-dark)" }}>
              Arrhenius Shelf-Life
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.45" }}>
              Simulates temperature abuse and humidity shifts across distribution networks with kinetic Q₁₀ rate modeling.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "22px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--warning-subtle)", display: "grid", placeItems: "center", color: "var(--warning-amber)", marginBottom: "14px" }}>
              <DollarSign size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "var(--color-primary-dark)" }}>
              Unit Economics
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.45" }}>
              Balances packaging substrate mass against food spoilage loss to find the true Pareto optimum per pack.
            </p>
          </div>

          <div className="glass-card" style={{ padding: "22px" }}>
            <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "var(--accent-green-subtle)", display: "grid", placeItems: "center", color: "var(--accent-green)", marginBottom: "14px" }}>
              <Leaf size={20} />
            </div>
            <h3 style={{ fontSize: "16px", fontWeight: 700, marginBottom: "6px", color: "var(--color-primary-dark)" }}>
              Circularity & LCA
            </h3>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.45" }}>
              Evaluates recyclability streams (RIC), polymer mass ratios, and cradle-to-gate carbon footprints.
            </p>
          </div>
        </div>
      </section>

      {/* ================= 3-TIER ROLE-BASED ACCESS CONTROL SHOWCASE ================= */}
      <section style={{
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "50px",
        marginBottom: "50px"
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div className="spec-tag green" style={{ marginBottom: "6px" }}>
            <ShieldCheck size={12} style={{ display: "inline", marginRight: "4px" }} /> Enterprise Governance
          </div>
          <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--color-primary-dark)" }}>
            3-Tier Role-Based Access Control
          </h2>
          <p style={{ maxWidth: "600px", margin: "6px auto 0", fontSize: "14px", color: "var(--text-secondary)" }}>
            Separation of duties from packaging development to executive operations.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "18px" }}>
          {/* User Card */}
          <div className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-primary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <User size={18} style={{ color: "var(--accent-green)" }} /> Packaging Engineer
                </span>
                <span className="badge-pass">Tier 1</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                Workbench, 5-step advisor, material comparison, simulator, and PDF reports.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                <span className="spec-chip">✓ Decision Workbench</span>
                <span className="spec-chip">✓ Material Benchmarks</span>
                <span className="spec-chip">✓ PDF Audits</span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: "100%", fontSize: "12.5px" }}
              onClick={() => { onQuickSwitch("user"); onNavigate("workbench"); }}
            >
              Test Packaging Engineer Persona
            </button>
          </div>

          {/* System Manager Card */}
          <div className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-primary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Wrench size={18} style={{ color: "var(--accent-cyan)" }} /> Quality & Operations
                </span>
                <span className="badge-pass" style={{ background: "var(--accent-cyan-subtle)", color: "var(--accent-cyan)", borderColor: "rgba(47, 106, 136, 0.3)" }}>
                  Tier 2
                </span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                All engineer tools plus catalog management, food presets, and team audits.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                <span className="spec-chip">✓ All Engineer Privileges</span>
                <span className="spec-chip">✓ Catalog Management</span>
                <span className="spec-chip">✓ Operational Audits</span>
              </div>
            </div>
            <button
              className="btn btn-secondary"
              style={{ width: "100%", fontSize: "12.5px" }}
              onClick={() => { onQuickSwitch("system_manager"); onNavigate("management"); }}
            >
              Test Operations Manager Persona
            </button>
          </div>

          {/* Super Admin Card */}
          <div className="glass-card" style={{ padding: "22px", display: "flex", flexDirection: "column", justifyContent: "space-between", borderColor: "rgba(213, 154, 56, 0.4)" }}>
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--color-primary-dark)", display: "flex", alignItems: "center", gap: "8px" }}>
                  <Crown size={18} style={{ color: "var(--warning-amber)" }} /> Super Administrator
                </span>
                <span className="badge-marginal">Tier 3</span>
              </div>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "14px" }}>
                Root system controls: user provisioning, security policies, and database access.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "18px" }}>
                <span className="spec-chip">✓ User Provisioning</span>
                <span className="spec-chip">✓ 17-Point Permissions</span>
                <span className="spec-chip" style={{ color: "var(--warning-amber)" }}>★ Root Database</span>
              </div>
            </div>
            <button
              className="btn btn-primary"
              style={{ width: "100%", fontSize: "12.5px" }}
              onClick={() => { onQuickSwitch("super_admin"); onNavigate("admin"); }}
            >
              Test Super Admin Persona
            </button>
          </div>
        </div>

        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <button className="btn btn-outline" onClick={() => onNavigate("login")}>
            <Key size={14} /> Open Full RBAC Authentication Gateway →
          </button>
        </div>
      </section>
    </div>
  );
}
