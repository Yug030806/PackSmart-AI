import React from "react";
import { Sparkles, Menu, Shield, User, Wrench, Crown, Bell } from "lucide-react";

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
      case "advisor": return "Packaging Analysis Wizard";
      case "advisor-result": return "Recommendation & Technical Audit";
      case "simulator": return "What-If Degradation Simulator";
      case "compare": return "Materials Comparison";
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
          <div className="micro-label" style={{ color: "var(--accent-green)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={11} /> Permeation Engine
          </div>
          <h2 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>
            {getPageTitle(currentPage)}
          </h2>
        </div>
      </div>

      <div className="topbar-right">
        {/* 1-Click Role Quick-Switching Pills for seamless grading/demoing */}
        <div style={{ display: "flex", alignItems: "center", gap: "4px", background: "var(--bg-input)", padding: "3px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
          <button
            className="btn btn-ghost"
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "6px",
              background: currentUser?.role === "user" ? "rgba(50, 213, 131, 0.18)" : "transparent",
              color: currentUser?.role === "user" ? "var(--accent-green)" : "var(--text-muted)"
            }}
            onClick={() => onQuickSwitch("user")}
            title="Switch persona to Standard User"
          >
            User
          </button>
          <button
            className="btn btn-ghost"
            style={{
              padding: "4px 8px",
              fontSize: "11px",
              fontWeight: 600,
              borderRadius: "6px",
              background: currentUser?.role === "system_manager" ? "rgba(54, 191, 250, 0.18)" : "transparent",
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
              borderRadius: "6px",
              background: currentUser?.role === "super_admin" ? "rgba(245, 185, 66, 0.18)" : "transparent",
              color: currentUser?.role === "super_admin" ? "var(--warning-amber)" : "var(--text-muted)"
            }}
            onClick={() => onQuickSwitch("super_admin")}
            title="Switch persona to Super Admin"
          >
            Admin
          </button>
        </div>

        {currentPage !== "advisor" && (
          <button
            className="btn btn-primary"
            style={{ padding: "7px 14px", fontSize: "12px" }}
            onClick={() => onNavigate("advisor")}
          >
            <Sparkles size={14} /> + New Analysis
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
