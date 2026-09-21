import React, { useState, useEffect } from "react";
import { History, Eye, Copy, Download, Trash2, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { EmptyState } from "../common/FeedbackStates";
import { StatusBadge } from "../common/StatusBadge";

export function AnalysisHistory({ onSelectAnalysis, onDuplicateAnalysis, onDownloadReport, onLaunchNew }) {
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("packsmart_history");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    // Seed initial historical records if none exist
    return [
      {
        id: "rec-001",
        date: "2026-03-21",
        food: "Potato Chips",
        material: "Metallized Film (BOPP / Met-PET)",
        suitability: 94,
        shelfLife: 120,
        predictedShelfLife: 104,
        barrierStatus: "PASS",
        costPerPack: 0.066,
        sustainabilityScore: 78.4
      },
      {
        id: "rec-002",
        date: "2026-03-20",
        food: "Biscuits",
        material: "PET / PE Laminate",
        suitability: 91,
        shelfLife: 120,
        predictedShelfLife: 118,
        barrierStatus: "PASS",
        costPerPack: 0.058,
        sustainabilityScore: 72.0
      },
      {
        id: "rec-003",
        date: "2026-03-18",
        food: "Fresh Tomato",
        material: "Micro-Perforated Breathable Film",
        suitability: 89,
        shelfLife: 14,
        predictedShelfLife: 18,
        barrierStatus: "PASS",
        costPerPack: 0.042,
        sustainabilityScore: 82.5
      }
    ];
  });

  const handleDelete = (id) => {
    const updated = history.filter(item => item.id !== id);
    setHistory(updated);
    try {
      localStorage.setItem("packsmart_history", JSON.stringify(updated));
    } catch (e) {}
  };

  useEffect(() => {
    fetch("/api/history")
      .then(res => res.json())
      .then(dbRecords => {
        if (Array.isArray(dbRecords) && dbRecords.length > 0) {
          const mapped = dbRecords.map(r => ({
            id: r.id,
            date: r.created_at ? r.created_at.substring(0, 10) : new Date().toISOString().substring(0, 10),
            food: r.food_name || "Food Item",
            material: r.recommended_material_name || "Packaging Material",
            suitability: Math.round(Number(r.overall_score || 90)),
            shelfLife: r.input_conditions?.shelf_life_days || 120,
            predictedShelfLife: Number(r.predicted_shelf_life_days || 100),
            barrierStatus: r.barrier_status || "PASS",
            costPerPack: Number(r.total_cost_per_pack || 0.05),
            sustainabilityScore: Number(r.sustainability_index || 75)
          }));
          setHistory(prev => {
            const combined = [...mapped];
            prev.forEach(p => {
              if (!combined.find(c => c.id === p.id)) {
                combined.push(p);
              }
            });
            return combined;
          });
        }
      })
      .catch(err => console.warn("Supabase history sync fallback:", err));
  }, []);


  if (history.length === 0) {
    return (
      <EmptyState
        title="No analyses recorded yet"
        description="Run your first packaging analysis with the PackSmart AI advisor to predict barrier performance and store historical results."
        actionText="Launch New Analysis"
        onAction={onLaunchNew}
      />
    );
  }

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <History size={12} /> Calculation Audit Trail
          </div>
          <h1 className="page-title">My Analyses & Historical Reports</h1>
          <p className="page-desc">
            Review past packaging recommendations, duplicate input parameters, or export verified ASTM compliance records.
          </p>
        </div>

        <button className="btn btn-primary" onClick={onLaunchNew}>
          <Sparkles size={15} /> + New Analysis
        </button>
      </div>

      {/* History Table Card */}
      <div className="glass-card" style={{ padding: "24px", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid var(--border-subtle)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
              <th style={{ padding: "12px 14px" }}>DATE</th>
              <th style={{ padding: "12px 14px" }}>COMMODITY</th>
              <th style={{ padding: "12px 14px" }}>RECOMMENDED MATERIAL</th>
              <th style={{ padding: "12px 14px" }}>SUITABILITY</th>
              <th style={{ padding: "12px 14px" }}>PREDICTED SHELF LIFE</th>
              <th style={{ padding: "12px 14px" }}>BARRIER</th>
              <th style={{ padding: "12px 14px", textAlign: "right" }}>ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.04)" }}>
                <td style={{ padding: "14px", color: "var(--text-muted)", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
                  {item.date}
                </td>
                <td style={{ padding: "14px" }}>
                  <b style={{ color: "#fff" }}>{item.food}</b>
                </td>
                <td style={{ padding: "14px", color: "var(--text-secondary)", fontSize: "13px" }}>
                  {item.material}
                </td>
                <td style={{ padding: "14px" }}>
                  <span style={{ color: "var(--accent-green)", fontWeight: 700, fontFamily: "var(--font-mono)" }}>
                    {item.suitability}%
                  </span>
                </td>
                <td style={{ padding: "14px" }}>
                  <b style={{ color: "#fff" }}>{item.predictedShelfLife} days</b>
                  <small style={{ color: "var(--text-muted)", display: "block", fontSize: "11px" }}>Target: {item.shelfLife}d</small>
                </td>
                <td style={{ padding: "14px" }}>
                  <StatusBadge status={item.barrierStatus} />
                </td>
                <td style={{ padding: "14px", textAlign: "right" }}>
                  <div style={{ display: "inline-flex", gap: "6px" }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 10px", fontSize: "11.5px" }}
                      onClick={() => onSelectAnalysis(item)}
                      title="View Details"
                    >
                      <Eye size={13} /> View
                    </button>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: "6px 10px", fontSize: "11.5px" }}
                      onClick={() => onDuplicateAnalysis(item)}
                      title="Duplicate Parameters"
                    >
                      <Copy size={13} />
                    </button>
                    <button
                      className="btn btn-ghost"
                      style={{ padding: "6px 10px", color: "var(--error-red)" }}
                      onClick={() => handleDelete(item.id)}
                      title="Delete Record"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
