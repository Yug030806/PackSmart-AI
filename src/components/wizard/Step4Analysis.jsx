import React, { useEffect, useState, useMemo } from "react";
import {
  CheckCircle2, RefreshCw, Layers, ShieldCheck,
  Zap, Cpu, ArrowDown, Terminal, DollarSign, Leaf, Clock, Package
} from "lucide-react";

export function Step4Analysis({ input = {}, onComplete, isBackendDone = false }) {
  const [currentStage, setCurrentStage] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Exact 6-stage sequence requested by the user
  const stages = useMemo(() => [
    {
      id: "requirements",
      num: "01",
      title: "Analyzing product requirements…",
      badge: "REQUIREMENTS",
      sub: `${input.food_name || input.food || "Product"} · Moisture: ${input.moisture ?? 4}% · Fat: ${input.fat ?? 18}% · Storage: ${input.storage || "Ambient"} (${input.temperature || 25}°C, ${input.humidity || 60}% RH)`,
      log: `[PARAM] Evaluated biochemical moisture sorption limits and target longevity: ${input.shelf || 120} days`,
      icon: Layers
    },
    {
      id: "materials",
      num: "02",
      title: "Evaluating material properties…",
      badge: "SUBSTRATES",
      sub: "Screening ASTM calibrated barrier films: OTR (ASTM D3985) & WVTR (ASTM F1249)",
      log: `[MATERIALS] Benchmarked 8 standard substrates across nominal gauge thicknesses (35–140 µm)`,
      icon: ShieldCheck
    },
    {
      id: "shelflife",
      num: "03",
      title: "Checking shelf-life constraints…",
      badge: "KINETICS",
      sub: "Arrhenius degradation kinetics: microbial stability, lipid oxidation, and moisture staling",
      log: `[KINETICS] Derived allowable oxygen uptake and critical moisture sorption tolerance thresholds`,
      icon: Clock
    },
    {
      id: "cost",
      num: "04",
      title: "Comparing cost…",
      badge: "ECONOMICS",
      sub: "Unit total cost of ownership: substrate material mass + expected spoilage loss value",
      log: `[ECONOMICS] Calculated unit package cost ($/pack) and shelf-loss risk for '${input.budget || "Medium"}' budget`,
      icon: DollarSign
    },
    {
      id: "sustainability",
      num: "05",
      title: "Evaluating sustainability…",
      badge: "CIRCULARITY",
      sub: "Packaging-to-product ratio (PPR), recyclability stream (RIC), and avoided food waste LCA",
      log: `[CIRCULARITY] Calculated carbon footprint and circularity index across recyclable polyolefins`,
      icon: Leaf
    },
    {
      id: "ready",
      num: "06",
      title: "Recommendation ready.",
      badge: "PARETO OPTIMA",
      sub: "Multi-objective Pareto compromise synthesized with explainable engineering notes",
      log: `[COMPLETE] Optimal substrate identified. Presenting recommendation workbench`,
      icon: Package
    }
  ], [input]);

  // Sequential progression through stages during analysis
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
    }, 450);

    return () => clearInterval(timer);
  }, [stages.length]);

  useEffect(() => {
    if (currentStage === stages.length - 1 && isBackendDone) {
      setIsFinished(true);
      const completionTimeout = setTimeout(() => {
        if (onComplete) onComplete();
      }, 600);
      return () => clearTimeout(completionTimeout);
    }
  }, [currentStage, isBackendDone, onComplete, stages.length]);

  const progressPct = isFinished
    ? 100
    : Math.min(96, Math.round(((currentStage + 1) / stages.length) * 100));

  return (
    <div style={{ maxWidth: "780px", margin: "0 auto", padding: "20px 0" }}>
      {/* Clean Industrial Header */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid var(--border-card)",
        borderRadius: "var(--radius-xl)",
        padding: "28px 24px",
        textAlign: "center",
        boxShadow: "var(--shadow-sm)",
        marginBottom: "20px"
      }}>
        <div style={{
          width: "56px",
          height: "56px",
          borderRadius: "50%",
          background: isFinished ? "var(--accent-green)" : "var(--accent-green-subtle)",
          color: isFinished ? "#FFFFFF" : "var(--accent-green)",
          display: "grid",
          placeItems: "center",
          margin: "0 auto 14px",
          border: "1px solid var(--border-green)"
        }}>
          {isFinished ? (
            <CheckCircle2 size={32} strokeWidth={2.5} />
          ) : (
            <RefreshCw size={26} className="spin" />
          )}
        </div>

        <div className="spec-tag green" style={{ marginBottom: "8px" }}>
          Laboratory Decision Engine
        </div>

        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--color-primary-dark)", margin: "0 0 6px" }}>
          {isFinished ? "Recommendation Ready ✓" : stages[currentStage].title}
        </h2>

        <p style={{ fontSize: "13px", color: "var(--text-secondary)", maxWidth: "560px", margin: "0 auto 18px" }}>
          {isFinished ? "Multi-objective Pareto compromise calculated with explainable technical reasoning." : stages[currentStage].sub}
        </p>

        {/* Progress Bar */}
        <div style={{ maxWidth: "480px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", fontFamily: "var(--font-mono)", color: "var(--text-muted)", marginBottom: "6px" }}>
            <span>STAGE {currentStage + 1} OF {stages.length}</span>
            <span style={{ fontWeight: 700, color: "var(--accent-green)" }}>{progressPct}% COMPLETE</span>
          </div>
          <div style={{ height: "6px", background: "#DDE4DC", borderRadius: "9999px", overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${progressPct}%`, background: "var(--accent-green)", borderRadius: "9999px", transition: "width 0.3s ease" }} />
          </div>
        </div>
      </div>

      {/* Sequential 6-Stage Timeline */}
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {stages.map((st, idx) => {
          const isDone = idx < currentStage || (idx === currentStage && isFinished);
          const isActive = idx === currentStage && !isFinished;
          const StageIcon = st.icon;

          return (
            <div
              key={st.id}
              style={{
                background: isDone ? "#FAFCF9" : isActive ? "#FFFFFF" : "#FFFFFF",
                border: isDone
                  ? "1px solid rgba(63, 118, 88, 0.4)"
                  : isActive
                  ? "1px solid var(--accent-green)"
                  : "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "12px 16px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                boxShadow: isActive ? "var(--shadow-md)" : "none",
                transition: "all 0.2s ease"
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "12px", textAlign: "left", flex: 1 }}>
                <div style={{ width: "22px", height: "22px", borderRadius: "50%", display: "grid", placeItems: "center", flexShrink: 0 }}>
                  {isDone ? (
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent-green)", color: "#FFFFFF", display: "grid", placeItems: "center" }}>
                      <CheckCircle2 size={13} strokeWidth={2.5} />
                    </div>
                  ) : isActive ? (
                    <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "var(--accent-green-subtle)", color: "var(--accent-green)", display: "grid", placeItems: "center", border: "1px solid var(--accent-green)" }}>
                      <RefreshCw size={11} className="spin" />
                    </div>
                  ) : (
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--text-muted)", fontWeight: 700 }}>
                      {st.num}
                    </span>
                  )}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "13.5px", fontWeight: isDone || isActive ? 700 : 500, color: isDone || isActive ? "var(--color-primary-dark)" : "var(--text-muted)" }}>
                      {st.title}
                    </span>
                    <span className="spec-tag" style={{ fontSize: "9px", padding: "1px 5px" }}>
                      {st.badge}
                    </span>
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "1px" }}>
                    {st.sub}
                  </div>
                </div>
              </div>

              <div style={{ color: isDone || isActive ? "var(--accent-green)" : "var(--text-muted)", opacity: isDone || isActive ? 1 : 0.4, marginLeft: "12px" }}>
                <StageIcon size={16} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Telemetry Stream Box */}
      <div style={{
        marginTop: "16px",
        background: "var(--color-primary-dark)",
        borderRadius: "var(--radius-md)",
        padding: "14px 16px",
        fontFamily: "var(--font-mono)",
        fontSize: "11px",
        color: "#CBD5CC"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--paper-beige)", marginBottom: "8px", fontWeight: 700 }}>
          <Terminal size={12} />
          <span>Real-Time Computation Telemetry</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {stages.slice(0, currentStage + 1).map((st, i) => (
            <div key={st.id} style={{ display: "flex", gap: "8px" }}>
              <span style={{ color: "var(--text-muted)" }}>[00:0{i * 2 + 1}]</span>
              <span>{st.log}</span>
            </div>
          ))}
          {!isFinished && (
            <div style={{ color: "var(--accent-secondary-green)", marginTop: "2px" }}>
              &gt; Resolving kinetic equations...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
