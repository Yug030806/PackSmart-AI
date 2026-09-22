import React from "react";
import {
  LayoutDashboard, Sparkles, History, Layers, SlidersHorizontal,
  FileText, Settings, ShieldCheck, Wrench, Crown, LogOut, ChevronLeft, ChevronRight, X
} from "lucide-react";

export function Sidebar({
  currentPage,
  onNavigate,
  currentUser,
  onLogout,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile
}) {
  const isManager = currentUser && (currentUser.role === "system_manager" || currentUser.role === "super_admin");
  const isSuperAdmin = currentUser && currentUser.role === "super_admin";

  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "workbench", label: "Decision Workbench", icon: SlidersHorizontal, highlight: true },
    { id: "advisor", label: "New Analysis", icon: Sparkles },
    { id: "brainstorm", label: "Packaging Whiteboard", icon: Layers },
    { id: "history", label: "My Analyses", icon: History },
    { id: "compare", label: "Materials Benchmark", icon: FileText },
    { id: "simulator", label: "What-If Simulator", icon: SlidersHorizontal },
    { id: "database", label: "Knowledge Base", icon: FileText }
  ];

  const adminItems = [
    ...(isManager ? [{ id: "management", label: "Operations Portal", icon: Wrench, badge: "SM" }] : []),
    ...(isSuperAdmin ? [{ id: "admin", label: "Super Admin", icon: Crown, badge: "ROOT" }] : [])
  ];

  const handleLinkClick = (id) => {
    onNavigate(id);
    if (isMobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            zIndex: 95,
            backdropFilter: "blur(4px)"
          }}
        />
      )}

      <aside className={`sidebar ${isCollapsed ? "collapsed" : ""} ${isMobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <button
            className="sidebar-brand"
            onClick={() => handleLinkClick("home")}
            style={{ background: "transparent", border: "none", padding: 0, outline: "none", cursor: "pointer" }}
          >
            <img src="/logo.jpg" alt="PackSmart AI" className="sidebar-brand-logo" />
            {!isCollapsed && (
              <span style={{ color: "var(--color-primary-dark)", fontSize: "16px", fontWeight: 700 }}>
                PackSmart <b style={{ color: "var(--accent-green)", fontWeight: 800 }}>AI</b>
              </span>
            )}
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: "6px", display: isMobileOpen ? "block" : "none" }}
            onClick={onCloseMobile}
          >
            <X size={18} />
          </button>
          <button
            className="btn btn-ghost"
            style={{ padding: "6px", display: isMobileOpen ? "none" : "block" }}
            onClick={onToggleCollapse}
            title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-title">Navigation</div>
          {navItems.map(item => {
            const Icon = item.icon;
            const active = currentPage === item.id || (item.id === "advisor" && currentPage === "advisor-result");
            return (
              <button
                key={item.id}
                className={`sidebar-link ${active ? "active" : ""}`}
                onClick={() => handleLinkClick(item.id)}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon size={18} className="sidebar-link-icon" style={{ color: active ? "var(--accent-green)" : item.highlight ? "var(--accent-cyan)" : undefined }} />
                {!isCollapsed && <span>{item.label}</span>}
                {!isCollapsed && item.highlight && (
                  <span className="sidebar-link-badge" style={{ background: "var(--accent-green-subtle)", color: "var(--accent-green)", marginLeft: "auto" }}>
                    CORE
                  </span>
                )}
              </button>
            );
          })}

          {adminItems.length > 0 && (
            <>
              <div className="sidebar-section-title" style={{ marginTop: "12px" }}>System Management</div>
              {adminItems.map(item => {
                const Icon = item.icon;
                const active = currentPage === item.id;
                return (
                  <button
                    key={item.id}
                    className={`sidebar-link ${active ? "active" : ""}`}
                    onClick={() => handleLinkClick(item.id)}
                    title={isCollapsed ? item.label : undefined}
                  >
                    <Icon size={18} className="sidebar-link-icon" style={{ color: item.id === "admin" ? "var(--warning-amber)" : "var(--accent-cyan)" }} />
                    {!isCollapsed && <span>{item.label}</span>}
                    {!isCollapsed && (
                      <span className="sidebar-link-badge" style={{
                        background: item.id === "admin" ? "rgba(245, 185, 66, 0.15)" : "rgba(54, 191, 250, 0.15)",
                        color: item.id === "admin" ? "var(--warning-amber)" : "var(--accent-cyan)",
                        marginLeft: "auto"
                      }}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </>
          )}
        </div>

        <div className="sidebar-footer">
          {currentUser ? (
            <div
              className="sidebar-user"
              onClick={() => handleLinkClick(currentUser.role === "super_admin" ? "admin" : currentUser.role === "system_manager" ? "management" : "login")}
              title={`Logged in as ${currentUser.name} (${currentUser.role_title})`}
            >
              <div className="sidebar-user-avatar" style={{ fontWeight: 700, fontSize: "12px", color: "var(--accent-green)", background: "rgba(50, 213, 131, 0.12)", border: "1px solid rgba(50, 213, 131, 0.3)" }}>
                {currentUser.name ? currentUser.name.charAt(0) : "U"}
              </div>
              {!isCollapsed && (
                <div className="sidebar-user-info">
                  <span className="sidebar-user-name">{currentUser.name}</span>
                  <span className="sidebar-user-role">
                    <ShieldCheck size={11} /> {currentUser.access_level} Tier
                  </span>
                </div>
              )}
              {!isCollapsed && (
                <button
                  className="btn btn-ghost"
                  style={{ marginLeft: "auto", padding: "4px" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onLogout();
                  }}
                  title="Sign Out"
                >
                  <LogOut size={14} />
                </button>
              )}
            </div>
          ) : (
            <button
              className="btn btn-primary"
              style={{ width: "100%", fontSize: "12px", padding: "8px" }}
              onClick={() => handleLinkClick("login")}
            >
              Sign In
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
