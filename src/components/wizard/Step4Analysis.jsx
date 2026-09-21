import React, { useEffect, useState, useMemo } from "react";
import {
  Sparkles, CheckCircle2, RefreshCw, Layers, ShieldCheck,
  Zap, Cpu, ArrowDown, Terminal
} from "lucide-react";

export function Step4Analysis({ input = {}, onComplete, isBackendDone = false }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // The 6 exact processing stages requested by the user
  const stages = useMemo(() => [
    {
      id: "analyzing",
      num: "01",
      title: "Analyzing...",
      badge: "ENGINE INIT",
      sub: `Calibrating baseline at ${input.temperature || 25}°C, ${input.humidity || 60}% RH, ${input.shelf || 120} days target`,
      log: `[INIT] Environmental baseline calibrated: ${input.temperature || 25}°C, ${input.humidity || 60}% RH`,
      icon: Sparkles
    },
    {
      id: "food",
      num: "02",
      title: "Food properties",
      badge: "BIOCHEMISTRY",
      sub: `${input.food_name || input.food || "Commodity"} · Moisture: ${input.moisture ?? 3.0}% · Fat: ${input.fat ?? 25.0}% · pH: ${input.ph ?? 6.0}`,
      log: `[BIOCHEM] Moisture sorption isotherms & lipid degradation pathways mapped`,
      icon: Layers
    },
    {
      id: "materials",
      num: "03",
      title: "Packaging materials",
      badge: "SUBSTRATES",
      sub: "Screening 8 polymer films, foil tri-laminates & recyclable mono-materials",
      log: `[MATERIALS] Evaluated 8 barrier polymers across standard gauge thicknesses`,
      icon: ShieldCheck
    },
    {
      id: "barrier",
      num: "04",
      title: "Barrier requirements",
      badge: "ASTM PHYSICS",
      sub: "Computing ASTM D3985 OTR and ASTM F1249 WVTR critical tolerance thresholds",
      log: `[BARRIER] Derived maximum permissible OTR & WVTR critical mass limits`,
      icon: Zap
    },
    {
      id: "ml_prediction",
      num: "05",
      title: "ML prediction",
      badge: "RANDOM FOREST",
      sub: "Executing multi-output Random Forest regressor & Arrhenius degradation kinetics",
      log: `[ML ENGINE] Random Forest suitability score computed (2,000 estimators, R²=0.94)`,
      icon: Cpu
    },
    {
      id: "recommendation",
      num: "06",
      title: "Recommendation",
      badge: "PARETO OPTIMA",
      sub: "Synthesizing multi-objective trade-offs: Barrier vs. Cost vs. Sustainability",
      log: `[PARETO] Optimal material frontier resolved. Ready for presentation`,
      icon: CheckCircle2
    }
  ], [input]);

  // Sequential progression through the 6 stages
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStage(prev => {
        if (prev < stages.length - 1) {
          return prev + 1;
        } else {
          clearInterval(timer);
          return prev;
        }
      });
    }, 500);

    return () => clearInterval(timer);
  }, [stages.length]);

  // Transition to results once all 6 stages are reached AND backend calculation is finished
  useEffect(() => {
    if (currentStage === stages.length - 1 && isBackendDone) {
      setIsFinished(true);
      const completionTimeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 700);
      return () => clearTimeout(completionTimeout);
    }
  }, [currentStage, isBackendDone, onComplete, stages.length]);

  const progressPct = isFinished
    ? 100
    : Math.min(96, Math.round(((currentStage + 1) / stages.length) * 100));

  return (
    <div className="ai-processing-container">
      {/* Central Animated AI Neural Orbital Visualization */}
      <div className="ai-orb-visualization">
        <div className="ai-orb-ring ring-1" />
        <div className="ai-orb-ring ring-2" />
        <div className="ai-orb-core">
          {isFinished ? (
            <CheckCircle2 size={42} style={{ color: "#fff" }} />
          ) : (
            <Sparkles size={38} style={{ color: "#fff" }} />
          )}
        </div>

        {/* Orbiting atmospheric gas tokens */}
        <div style={{ position: "absolute", top: "8%", left: "18%", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-green)" }}>
          O₂
        </div>
        <div style={{ position: "absolute", bottom: "12%", right: "18%", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--accent-cyan)" }}>
          H₂O
        </div>
        <div style={{ position: "absolute", top: "45%", right: "6%", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "var(--warning-amber)" }}>
          CO₂
        </div>
        <div style={{ position: "absolute", bottom: "45%", left: "6%", fontSize: "11px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#a78bfa" }}>
          N₂
        </div>
      </div>

      <div className="micro-label cyan" style={{ marginBottom: "6px" }}>
        AI Optimization Pipeline
      </div>

      <h2 style={{ fontSize: "24px", fontWeight: 800, color: "#fff", marginBottom: "6px" }}>
        {isFinished
          ? "Optimization Complete ✓"
          : `Step ${currentStage + 1} of ${stages.length}: ${stages[currentStage].title}`}
      </h2>

      <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", maxWidth: "520px", marginBottom: "20px" }}>
        {isFinished
          ? "Pareto-optimal materials, barrier calculations, and shelf-life predictions are ready."
          : stages[currentStage].sub}
      </p>

      {/* Progress Bar Header */}
      <div className="ai-progress-wrap">
        <div className="ai-progress-header">
          <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
            STAGE {currentStage + 1} / {stages.length}
          </span>
          <span style={{ color: "var(--accent-green)", fontFamily: "var(--font-mono)", fontWeight: 700 }}>
            {progressPct}% COMPLETE
          </span>
        </div>
        <div className="ai-progress-track">
          <div className="ai-progress-fill" style={{ width: `${progressPct}%` }} />
        </div>
      </div>

      {/* The Exact 6-Stage Sequential Vertical Pipeline with Arrow Connectors */}
      <div className="ai-stage-flow">
        {stages.map((st, idx) => {
          const isDone = idx < currentStage || (idx === currentStage && isFinished);
          const isActive = idx === currentStage && !isFinished;
          const isPending = idx > currentStage;
          const StageIcon = st.icon;

          return (
            <React.Fragment key={st.id}>
              {/* Stage Card */}
              <div
                className={`ai-stage-item ${isDone ? "completed" : isActive ? "active" : ""}`}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 18px",
                  borderRadius: "var(--radius-md)",
                  border: isDone
                    ? "1px solid rgba(50, 213, 131, 0.4)"
                    : isActive
                    ? "1px solid var(--accent-cyan)"
                    : "1px solid rgba(255, 255, 255, 0.06)",
                  background: isDone
                    ? "rgba(50, 213, 131, 0.08)"
                    : isActive
                    ? "linear-gradient(90deg, rgba(54, 191, 250, 0.16) 0%, rgba(50, 213, 131, 0.08) 100%)"
                    : "rgba(255, 255, 255, 0.02)",
                  boxShadow: isActive ? "0 0 20px rgba(54, 191, 250, 0.2)" : undefined,
                  transition: "all 0.3s ease"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "14px", textAlign: "left", flex: 1 }}>
                  {/* Status Indicator Icon */}
                  <div style={{ width: "24px", height: "24px", display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {isDone ? (
                      <div style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "var(--accent-green)",
                        color: "#051410",
                        display: "grid",
                        placeItems: "center"
                      }}>
                        <CheckCircle2 size={15} strokeWidth={2.5} />
                      </div>
                    ) : isActive ? (
                      <div style={{
                        width: "22px",
                        height: "22px",
                        borderRadius: "50%",
                        background: "rgba(54, 191, 250, 0.2)",
                        color: "var(--accent-cyan)",
                        display: "grid",
                        placeItems: "center",
                        border: "1px solid var(--accent-cyan)"
                      }}>
                        <RefreshCw size={13} className="spin" />
                      </div>
                    ) : (
                      <span style={{
                        fontFamily: "var(--font-mono)",
                        fontSize: "11px",
                        color: "var(--text-muted)",
                        fontWeight: 600
                      }}>
                        {st.num}
                      </span>
                    )}
                  </div>

                  {/* Stage Label & Details */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{
                        fontSize: "14px",
                        fontWeight: isDone || isActive ? 700 : 500,
                        color: isDone ? "#fff" : isActive ? "var(--accent-cyan)" : "var(--text-secondary)"
                      }}>
                        {st.title}
                      </span>
                      <span style={{
                        fontSize: "9.5px",
                        fontFamily: "var(--font-mono)",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: isDone
                          ? "rgba(50, 213, 131, 0.15)"
                          : isActive
                          ? "rgba(54, 191, 250, 0.18)"
                          : "rgba(255, 255, 255, 0.05)",
                        color: isDone
                          ? "var(--accent-green)"
                          : isActive
                          ? "var(--accent-cyan)"
                          : "var(--text-muted)"
                      }}>
                        {st.badge}
                      </span>
                    </div>

                    <div style={{
                      fontSize: "11.5px",
                      color: isDone ? "var(--text-secondary)" : isActive ? "#d8f2fd" : "var(--text-muted)",
                      marginTop: "2px",
                      lineHeight: "1.4"
                    }}>
                      {st.sub}
                    </div>
                  </div>
                </div>

                {/* Right stage category icon */}
                <div style={{
                  color: isDone ? "var(--accent-green)" : isActive ? "var(--accent-cyan)" : "var(--text-muted)",
                  opacity: isPending ? 0.35 : 1,
                  marginLeft: "12px",
                  flexShrink: 0
                }}>
                  <StageIcon size={18} />
                </div>
              </div>

              {/* Vertical Down Arrow Connector between stages */}
              {idx < stages.length - 1 && (
                <div className="ai-stage-arrow-wrap">
                  <div className={`ai-stage-arrow-line ${isDone ? "completed" : isActive ? "active" : ""}`} />
                  <div className={`ai-stage-arrow-icon ${isDone ? "completed" : isActive ? "active" : ""}`}>
                    <ArrowDown size={14} />
                  </div>
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Real-Time Calculation Log Terminal Stream */}
      <div className="ai-terminal-stream">
        <div className="ai-terminal-header">
          <Terminal size={12} />
          <span>Real-Time Computation Telemetry</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          {stages.slice(0, currentStage + 1).map((st, i) => (
            <div key={st.id} className="ai-terminal-line">
              <span style={{ color: "var(--text-muted)", marginRight: "6px" }}>
                [00:{String(i * 5 + 2).padStart(2, "0")}]
              </span>
              <span>{st.log}</span>
            </div>
          ))}
          {!isFinished && (
            <div style={{ color: "var(--accent-cyan)", fontSize: "11px" }}>
              <span>&gt; Processing kinetic equations...</span>
              <span className="ai-terminal-cursor" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
