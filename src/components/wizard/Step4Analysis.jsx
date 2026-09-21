import React, { useEffect, useState } from "react";
import { Sparkles, CheckCircle2, RefreshCw, Layers, ShieldCheck, Zap } from "lucide-react";

export function Step4Analysis({ onComplete, isBackendDone = false }) {
  const [currentStage, setCurrentStage] = useState(0);

  const stages = [
    { label: "Food chemistry analyzed", sub: "Lipid oxidation & moisture sorption isotherms calibrated" },
    { label: "Oxygen requirement calculated", sub: "Maximum allowable critical [O₂] uptake derived" },
    { label: "Moisture requirement calculated", sub: "Driving vapor pressure differential ΔRH verified" },
    { label: "Barrier verification completed", sub: "ASTM D3985 & F1249 deterministic pass/fail evaluated" },
    { label: "Shelf-life prediction completed", sub: "Coupled kinetic degradation pathways simulated" },
    { label: "Sustainability analysis completed", sub: "LCA carbon footprint & packaging-to-product ratio quantified" },
    { label: "Cost analysis completed", sub: "Resin mass + conversion + expected food loss economics computed" },
    { label: "Optimization completed", sub: "Multi-objective Pareto-optimal trade-off frontier resolved" }
  ];

  useEffect(() => {
    // Progress sequentially through the 8 stages
    const interval = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          // When all stages done and backend is ready, transition smoothly
          setTimeout(() => {
            if (onComplete) onComplete();
          }, 800);
          return prev;
        }
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div className="ai-processing-container">
      {/* Central Animated AI Orbital Visualization */}
      <div className="ai-orb-visualization">
        <div className="ai-orb-ring ring-1" />
        <div className="ai-orb-ring ring-2" />
        <div className="ai-orb-core">
          {currentStage === stages.length - 1 ? (
            <CheckCircle2 size={42} style={{ color: "#fff" }} />
          ) : (
            <Sparkles size={38} style={{ color: "#fff" }} />
          )}
        </div>

        {/* Orbiting particles */}
        <div style={{ position: "absolute", top: "10%", left: "20%", fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-green)" }}>
          O₂
        </div>
        <div style={{ position: "absolute", bottom: "15%", right: "20%", fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>
          H₂O
        </div>
        <div style={{ position: "absolute", top: "45%", right: "8%", fontSize: "10px", fontFamily: "var(--font-mono)", color: "var(--warning-amber)" }}>
          CO₂
        </div>
      </div>

      <div className="micro-label cyan" style={{ marginBottom: "6px" }}>
        AI Optimization Pipeline
      </div>
      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "8px" }}>
        {currentStage === stages.length - 1
          ? "Analysis Complete ✓"
          : "PackSmart AI is analyzing your packaging..."}
      </h2>
      <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", maxWidth: "480px" }}>
        Executing multi-output Scikit-learn regressors and temperature-scaled Arrhenius ASTM equations.
      </p>

      {/* Sequential Activation Stage List */}
      <div className="ai-stage-list">
        {stages.map((st, i) => {
          const isDone = i < currentStage || currentStage === stages.length - 1;
          const isActive = i === currentStage && currentStage < stages.length - 1;

          return (
            <div
              key={st.label}
              className={`ai-stage-item ${isDone ? "completed" : isActive ? "active" : ""}`}
            >
              <div style={{ width: "20px", display: "grid", placeItems: "center" }}>
                {isDone ? (
                  <CheckCircle2 size={16} style={{ color: "var(--accent-green)" }} />
                ) : isActive ? (
                  <RefreshCw size={14} className="spin" style={{ color: "var(--accent-cyan)" }} />
                ) : (
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "var(--border-subtle)" }} />
                )}
              </div>
              <div style={{ flex: 1 }}>
                <span style={{ display: "block", fontSize: "13px", fontWeight: isDone || isActive ? 600 : 400 }}>
                  {st.label}
                </span>
                <small style={{ display: "block", fontSize: "11px", color: "var(--text-muted)", marginTop: "1px" }}>
                  {st.sub}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      <style>{`
        .spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
