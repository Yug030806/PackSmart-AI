import React from "react";
import { ShieldCheck, Menu, Shield, User, Wrench, Crown, Bell, Sliders } from "lucide-react";

export function Topbar({
  currentPage,
  onNavigate,
  backendHealthy,
  currentUser,
  onQuickSwitch,
  onToggleMobile
}) {
  const getPageTitle = (p) => {
    switch (p) {
      case "dashboard": return "Command Center";
      case "workbench": return "Packaging Decision Workbench";
      case "advisor": return "Packaging Analysis Wizard";
      case "advisor-result": return "Recommendation & Technical Audit";
      case "brainstorm": return "Packaging Brainstorm Whiteboard";
      case "simulator": return "What-If Degradation Simulator";
      case "compare": return "Materials Benchmark Matrix";
      case "database": return "Knowledge Base & Food Chemistry";
      case "history": return "My Analyses & Reports";
      case "management": return "Operations & Management Portal";
      case "admin": return "Super Admin Console";
      case "login": return "Authentication & RBAC Gateway";
      case "home": return "Overview";
      default: return "PackSmart AI";
    }
  };

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button
          className="btn btn-ghost"
          style={{ padding: "8px", display: "none" }}
          onClick={onToggleMobile}
          id="mobile-menu-trigger"
        >
          <Menu size={20} />
        </button>

        <div>
          <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <ShieldCheck size={11} /> ASTM Permeation Laboratory
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0, color: "var(--color-primary-dark)" }}>
            {getPageTitle(currentPage)}
          </h2>
        </div>
      </div>

      <div className="topbar-right">
        {/* 1-Click Role Quick-Switching Pills for seamless grading/demoing */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "#FFFFFF", padding: "3px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <button
            className="btn btn-ghost"
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "5px",
              background: currentUser?.role === "user" ? "var(--accent-green-subtle)" : "transparent",
              color: currentUser?.role === "user" ? "var(--accent-green)" : "var(--text-muted)"
            }}
            onClick={() => onQuickSwitch("user")}
            title="Switch persona to Packaging Engineer"
          >
            Engineer
          </button>
          <button
            className="btn btn-ghost"
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "5px",
              background: currentUser?.role === "system_manager" ? "var(--accent-cyan-subtle)" : "transparent",
              color: currentUser?.role === "system_manager" ? "var(--accent-cyan)" : "var(--text-muted)"
            }}
            onClick={() => onQuickSwitch("system_manager")}
            title="Switch persona to System Manager"
          >
            Manager
          </button>
          <button
            className="btn btn-ghost"
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "5px",
              background: currentUser?.role === "super_admin" ? "var(--warning-subtle)" : "transparent",
              color: currentUser?.role === "super_admin" ? "var(--warning-amber)" : "var(--text-muted)"
            }}
            onClick={() => onQuickSwitch("super_admin")}
            title="Switch persona to Super Admin"
          >
            Admin
          </button>
        </div>

        {currentPage !== "workbench" && (
          <button
            className="btn btn-secondary"
            style={{ padding: "6px 12px", fontSize: "12px" }}
            onClick={() => onNavigate("workbench")}
          >
            <Sliders size={13} /> Workbench
          </button>
        )}

        {currentPage !== "advisor" && (
          <button
            className="btn btn-primary"
            style={{ padding: "6px 14px", fontSize: "12px" }}
            onClick={() => onNavigate("advisor")}
          >
            + New Analysis
          </button>
        )}
      </div>

      <style>{`
        @media (max-width: 768px) {
          #mobile-menu-trigger {
            display: block !important;
          }
        }
      `}</style>
    </header>
  );
}
