import React, { useState } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";
import { ShieldCheck } from "lucide-react";

export function AppShell({
  children,
  currentPage,
  onNavigate,
  backendHealthy,
  currentUser,
  onLogout,
  onQuickSwitch
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  return (
    <div className="app-shell bg-grid-pattern">
      <Sidebar
        currentPage={currentPage}
        onNavigate={onNavigate}
        currentUser={currentUser}
        onLogout={onLogout}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        isMobileOpen={isMobileOpen}
        onCloseMobile={() => setIsMobileOpen(false)}
      />

      <div className={`main-wrapper ${isCollapsed ? "expanded" : ""}`}>
        <Topbar
          currentPage={currentPage}
          onNavigate={onNavigate}
          backendHealthy={backendHealthy}
          currentUser={currentUser}
          onQuickSwitch={onQuickSwitch}
          onToggleMobile={() => setIsMobileOpen(!isMobileOpen)}
        />

        <main className="content-container">
          {children}
        </main>

        <footer style={{
          borderTop: "1px solid var(--border-subtle)",
          padding: "24px 36px",
          marginTop: "auto",
          background: "rgba(7, 17, 15, 0.75)",
          backdropFilter: "blur(8px)"
        }}>
          <div style={{
            maxWidth: "1380px",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "16px",
            fontSize: "12px",
            color: "var(--text-secondary)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <img src="/logo.jpg" alt="PackSmart AI" style={{ width: "20px", height: "20px", borderRadius: "4px" }} />
              <span><b>PackSmart AI</b> · Real Machine Learning & ASTM Barrier Physics Engine</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
              <ShieldCheck size={14} style={{ color: "var(--accent-green)" }} /> ASTM D3985 / ASTM F1249 · 3-Tier Enterprise RBAC
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
