import React, { useState } from "react";
import {
  Crown, ShieldAlert, CheckCircle2, XCircle, Users, Shield, Sliders,
  Settings, Download, Plus, Trash2, Lock, Zap, Wrench
} from "lucide-react";
import { INITIAL_USERS, INITIAL_LOGS, PERMISSIONS_MATRIX } from "../../data/materials";

export function AdminPortal({ currentUser, onNavigate, onQuickSwitch, authToken }) {
  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState(INITIAL_USERS);
  const [logs, setLogs] = useState(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState("ALL");
  const [safetyMargin, setSafetyMargin] = useState(1.15);
  const [sessionTimeout, setSessionTimeout] = useState(30);
  const [mfaEnforced, setMfaEnforced] = useState(true);
  const [rateLimit, setRateLimit] = useState(120);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", role: "user" });
  const [toast, setToast] = useState(null);

  const isSuperAdmin = currentUser && currentUser.role === "super_admin";

  const showNotification = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  React.useEffect(() => {
    if (!isSuperAdmin) return;
    const headers = {};
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    fetch("/api/admin/users", { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setUsers(data);
      })
      .catch(() => {});

    fetch("/api/admin/logs", { headers })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) setLogs(data);
      })
      .catch(() => {});
  }, [authToken, isSuperAdmin]);

  if (!isSuperAdmin) {
    return (
      <div className="glass-card" style={{ maxWidth: "560px", margin: "40px auto", padding: "40px 24px", textAlign: "center" }}>
        <Crown size={48} style={{ color: "var(--color-warning-amber)", margin: "0 auto 16px" }} />
        <h2 style={{ color: "var(--color-primary-dark)", marginBottom: "8px" }}>Super Admin Access Required</h2>
        <p style={{ color: "var(--text-secondary)", fontSize: "13.5px", marginBottom: "24px" }}>
          The Super Admin Console gives unrestricted access to security controls, user management, and system configuration.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: "12px" }}>
          <button className="btn btn-primary" onClick={() => onQuickSwitch("super_admin")}>
            Switch to Super Admin Persona
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate("dashboard")}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleRoleChange = (userId, newRole) => {
    const roleLabels = { super_admin: "Super Admin", system_manager: "System Manager", user: "Standard User" };
    const accessLevels = { super_admin: "Full", system_manager: "Management", user: "Basic" };

    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        return {
          ...u,
          role: newRole,
          role_title: roleLabels[newRole],
          access_level: accessLevels[newRole]
        };
      }
      return u;
    }));

    const updatedUser = users.find(u => u.id === userId);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: currentUser?.email || "admin@packsmart.ai",
      role: "super_admin",
      action: "ROLE_PERMISSION",
      details: `Changed role of ${updatedUser?.name || userId} to ${roleLabels[newRole]}`
    };
    setLogs(prev => [newLog, ...prev]);
    showNotification(`User role updated to ${roleLabels[newRole]}. Audit log generated.`);

    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    fetch("/api/admin/users/update", {
      method: "POST",
      headers,
      body: JSON.stringify({ user_id: userId, role: newRole })
    }).catch(err => console.warn("Supabase user update error:", err));
  };

  const handleToggleStatus = (userId) => {
    let targetStatus = "Active";
    setUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === "Active" ? "Suspended" : "Active";
        targetStatus = nextStatus;
        const newLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
          user: currentUser?.email || "admin@packsmart.ai",
          role: "super_admin",
          action: "USER_STATUS",
          details: `Updated account status for ${u.name} to ${nextStatus}`
        };
        setLogs(l => [newLog, ...l]);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
    showNotification("User account status updated.");

    const headers = { "Content-Type": "application/json" };
    if (authToken) headers["Authorization"] = `Bearer ${authToken}`;

    fetch("/api/admin/users/update", {
      method: "POST",
      headers,
      body: JSON.stringify({ user_id: userId, status: targetStatus })
    }).catch(err => console.warn("Supabase status update error:", err));
  };


  const handleAddUser = (e) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;

    const roleLabels = { super_admin: "Super Admin", system_manager: "System Manager", user: "Standard User" };
    const accessLevels = { super_admin: "Full", system_manager: "Management", user: "Basic" };

    const created = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      role_title: roleLabels[newUser.role],
      access_level: accessLevels[newUser.role],
      status: "Active",
      created_at: new Date().toISOString().substring(0, 10)
    };

    setUsers(prev => [...prev, created]);
    const newLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString().replace("T", " ").substring(0, 19),
      user: currentUser?.email || "admin@packsmart.ai",
      role: "super_admin",
      action: "USER_CREATED",
      details: `Provisioned account ${newUser.email} with ${roleLabels[newUser.role]} permissions`
    };
    setLogs(prev => [newLog, ...prev]);
    setNewUser({ name: "", email: "", role: "user" });
    setShowAddUser(false);
    showNotification(`New user ${created.name} provisioned successfully.`);
  };

  const exportBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      packsmart_version: "2.4.0",
      users,
      permissions: PERMISSIONS_MATRIX,
      system_config: { safetyMargin, sessionTimeout, mfaEnforced, rateLimit },
      audit_logs: logs
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `packsmart_system_backup_${Date.now()}.json`;
    a.click();
    showNotification("Complete system database backup downloaded.");
  };

  const filteredLogs = logFilter === "ALL" ? logs : logs.filter(l => l.action === logFilter);

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <div className="micro-label amber" style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "4px" }}>
            <Crown size={12} /> Root Security Authority
          </div>
          <h1 className="page-title">Super Admin Console</h1>
          <p className="page-desc">
            Full authority across users, system managers, security policies, RBAC permissions, and physics calibration.
          </p>
        </div>

        <div style={{ display: "flex", gap: "10px" }}>
          <button className="btn btn-secondary" onClick={exportBackup}>
            <Download size={14} /> Export Backup
          </button>
        </div>
      </div>

      {toast && (
        <div style={{ background: "rgba(50, 213, 131, 0.12)", border: "1px solid var(--accent-green)", color: "var(--accent-green)", padding: "10px 16px", borderRadius: "8px", marginBottom: "20px", fontSize: "13px", display: "flex", alignItems: "center", gap: "8px" }}>
          <CheckCircle2 size={16} /> {toast}
        </div>
      )}

      {/* Admin KPI Stats */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-label"><span>Total Users</span><Users size={15} /></div>
          <div className="kpi-value">{users.length}</div>
          <div className="kpi-trend">Active Directory</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label"><span>Super Admins</span><Crown size={15} style={{ color: "var(--warning-amber)" }} /></div>
          <div className="kpi-value" style={{ color: "var(--warning-amber)" }}>
            {users.filter(u => u.role === "super_admin").length}
          </div>
          <div className="kpi-trend">Full Root Access</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label"><span>System Managers</span><Wrench size={15} style={{ color: "var(--accent-cyan)" }} /></div>
          <div className="kpi-value" style={{ color: "var(--accent-cyan)" }}>
            {users.filter(u => u.role === "system_manager").length}
          </div>
          <div className="kpi-trend">Management Tier</div>
        </div>
        <div className="kpi-card">
          <div className="kpi-label"><span>Active Privileges</span><Shield size={15} style={{ color: "var(--accent-green)" }} /></div>
          <div className="kpi-value" style={{ color: "var(--accent-green)" }}>17 / 17</div>
          <div className="kpi-trend">100% RBAC Coverage</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "20px", flexWrap: "wrap" }}>
        <button
          className={`btn ${activeTab === "users" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("users")}
        >
          <Users size={15} /> Users & Managers ({users.length})
        </button>
        <button
          className={`btn ${activeTab === "roles" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("roles")}
        >
          <Shield size={15} /> Roles & Permissions (17)
        </button>
        <button
          className={`btn ${activeTab === "logs" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("logs")}
        >
          <Sliders size={15} /> Audit Logs ({logs.length})
        </button>
        <button
          className={`btn ${activeTab === "security" ? "btn-primary" : "btn-secondary"}`}
          onClick={() => setActiveTab("security")}
        >
          <Settings size={15} /> System Configuration & Security
        </button>
      </div>

      {/* Tab 1: Users */}
      {activeTab === "users" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h3 style={{ fontSize: "17px", color: "var(--color-primary-dark)", margin: 0 }}>Manage User Accounts</h3>
              <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", margin: "2px 0 0" }}>
                Super Admin capability: modify roles, elevate system managers, or suspend accounts.
              </p>
            </div>
            <button className="btn btn-primary" style={{ fontSize: "12px" }} onClick={() => setShowAddUser(!showAddUser)}>
              <Plus size={14} /> {showAddUser ? "Cancel" : "Provision Account"}
            </button>
          </div>

          {showAddUser && (
            <form onSubmit={handleAddUser} style={{ background: "var(--color-bg-base)", padding: "16px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)", marginBottom: "18px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr) auto", gap: "10px", alignItems: "flex-end" }}>
                <div className="field" style={{ margin: 0 }}>
                  <label>Full Name</label>
                  <input required placeholder="Dr. Jane Doe" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Email Address</label>
                  <input required type="email" placeholder="jane@packsmart.ai" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })} />
                </div>
                <div className="field" style={{ margin: 0 }}>
                  <label>Role</label>
                  <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="user">User (Basic)</option>
                    <option value="system_manager">System Manager (Management)</option>
                    <option value="super_admin">Super Admin (Full)</option>
                  </select>
                </div>
                <button type="submit" className="btn btn-primary" style={{ height: "40px" }}>Add Account</button>
              </div>
            </form>
          )}

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                  <th style={{ padding: "12px 10px" }}>USER IDENTITY</th>
                  <th style={{ padding: "12px 10px" }}>EMAIL</th>
                  <th style={{ padding: "12px 10px" }}>ACCESS LEVEL</th>
                  <th style={{ padding: "12px 10px" }}>STATUS</th>
                  <th style={{ padding: "12px 10px" }}>ROLE MUTATION</th>
                  <th style={{ padding: "12px 10px", textAlign: "right" }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                    <td style={{ padding: "12px 10px" }}>
                      <b style={{ color: "var(--color-primary-dark)" }}>{u.name}</b>
                      <small style={{ color: "var(--text-muted)", display: "block", fontSize: "10px" }}>{u.id}</small>
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--text-secondary)" }}>{u.email}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span className="spec-chip" style={{ color: u.role === "super_admin" ? "var(--color-warning-amber)" : u.role === "system_manager" ? "var(--color-data-slate)" : "var(--color-muted-green)" }}>
                        {u.access_level} Access
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <span style={{ color: u.status === "Active" ? "var(--color-muted-green)" : "var(--color-risk-red)", fontWeight: 700, fontSize: "11px" }}>
                        {u.status === "Active" ? "● Active" : "○ Suspended"}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <select
                        value={u.role}
                        onChange={e => handleRoleChange(u.id, e.target.value)}
                        style={{ background: "#FFFFFF", border: "1px solid var(--border-color)", borderRadius: "6px", color: "var(--color-primary-dark)", padding: "4px 8px", fontSize: "11.5px" }}
                      >
                        <option value="user">User</option>
                        <option value="system_manager">System Manager</option>
                        <option value="super_admin">Super Admin</option>
                      </select>
                    </td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>
                      <button
                        className="btn btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                        onClick={() => handleToggleStatus(u.id)}
                      >
                        {u.status === "Active" ? "Suspend" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Roles Matrix */}
      {activeTab === "roles" && (
        <div className="glass-card" style={{ padding: "24px", overflowX: "auto" }}>
          <h3 style={{ fontSize: "17px", color: "var(--color-primary-dark)", marginBottom: "14px" }}>
            17-Point Role & Permission Entitlement Matrix
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid var(--border-color)", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "11px" }}>
                <th style={{ padding: "12px 10px" }}>SYSTEM PRIVILEGE</th>
                <th style={{ padding: "12px 10px" }}>CATEGORY</th>
                <th style={{ padding: "12px 10px", textAlign: "center" }}>USER</th>
                <th style={{ padding: "12px 10px", textAlign: "center" }}>MANAGER</th>
                <th style={{ padding: "12px 10px", textAlign: "center" }}>SUPER ADMIN</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS_MATRIX.map(perm => (
                <tr key={perm.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "10px" }}>
                    <b style={{ color: "var(--color-primary-dark)" }}>{perm.name}</b>
                    <div style={{ fontSize: "10.5px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{perm.id}</div>
                  </td>
                  <td style={{ padding: "10px", color: "var(--text-secondary)" }}>{perm.category}</td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {perm.user ? <CheckCircle2 size={16} style={{ color: "var(--color-muted-green)", margin: "0 auto" }} /> : <XCircle size={16} style={{ color: "var(--text-muted)", margin: "0 auto" }} />}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    {perm.manager ? <CheckCircle2 size={16} style={{ color: "var(--color-data-slate)", margin: "0 auto" }} /> : <XCircle size={16} style={{ color: "var(--text-muted)", margin: "0 auto" }} />}
                  </td>
                  <td style={{ padding: "10px", textAlign: "center" }}>
                    <CheckCircle2 size={16} style={{ color: "var(--color-warning-amber)", margin: "0 auto" }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Logs */}
      {activeTab === "logs" && (
        <div className="glass-card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "17px", color: "var(--color-primary-dark)", margin: 0 }}>System Security & Activity Audit Trail</h3>
            <select
              value={logFilter}
              onChange={e => setLogFilter(e.target.value)}
              style={{ background: "#FFFFFF", border: "1px solid var(--border-color)", color: "var(--color-primary-dark)", padding: "6px 10px", borderRadius: "6px", fontSize: "12px" }}
            >
              <option value="ALL">All Event Types</option>
              <option value="AUTH_LOGIN">AUTH_LOGIN</option>
              <option value="ROLE_PERMISSION">ROLE_PERMISSION</option>
              <option value="POLICY_UPDATE">POLICY_UPDATE</option>
              <option value="USER_STATUS">USER_STATUS</option>
              <option value="DB_SYNC">DB_SYNC</option>
              <option value="ML_CALCULATION">ML_CALCULATION</option>
            </select>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {filteredLogs.map(log => (
              <div key={log.id} style={{ background: "var(--color-bg-base)", padding: "12px", borderRadius: "8px", border: "1px solid var(--border-color)", display: "grid", gridTemplateColumns: "160px 180px 140px 1fr", gap: "10px", fontSize: "12px", alignItems: "center" }}>
                <span style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>{log.timestamp}</span>
                <span style={{ color: "var(--color-primary-dark)", fontWeight: 600 }}>{log.user}</span>
                <span className="spec-chip" style={{ color: "var(--color-data-slate)", width: "fit-content" }}>{log.action}</span>
                <span style={{ color: "var(--text-secondary)" }}>{log.details}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Security & System Config */}
      {activeTab === "security" && (
        <div className="glass-card" style={{ padding: "28px" }}>
          <h3 style={{ fontSize: "17px", color: "var(--color-primary-dark)", marginBottom: "18px" }}>System Configuration & Security Controls</h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
            <div style={{ background: "var(--color-bg-base)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-color)" }}>
              <h4 style={{ fontSize: "15px", color: "var(--color-data-slate)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Lock size={15} /> Authentication & Security Policies
              </h4>

              <div className="field">
                <label>Admin Session Inactivity Timeout</label>
                <select value={sessionTimeout} onChange={e => setSessionTimeout(Number(e.target.value))}>
                  <option value={15}>15 Minutes</option>
                  <option value={30}>30 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes</option>
                </select>
              </div>

              <div className="field">
                <label>API Rate Limiting (Requests / Min / IP)</label>
                <input type="number" value={rateLimit} onChange={e => setRateLimit(Number(e.target.value))} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: "10px", borderTop: "1px solid var(--border-color)" }}>
                <div>
                  <b style={{ color: "var(--color-primary-dark)", fontSize: "13px", display: "block" }}>Enforce Multi-Factor Authentication</b>
                  <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Require TOTP for admin accounts</small>
                </div>
                <input
                  type="checkbox"
                  checked={mfaEnforced}
                  onChange={e => setMfaEnforced(e.target.checked)}
                  style={{ width: "18px", height: "18px", accentColor: "var(--color-muted-green)" }}
                />
              </div>
            </div>

            <div style={{ background: "var(--bg-input)", padding: "20px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
              <h4 style={{ fontSize: "15px", color: "var(--warning-amber)", marginBottom: "14px", display: "flex", alignItems: "center", gap: "6px" }}>
                <Zap size={15} /> Barrier Physics Calibration
              </h4>

              <div className="range-wrap">
                <div className="range-header">
                  <span>Safety Margin Multiplier:</span>
                  <span className="range-val">{safetyMargin}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="1.5"
                  step="0.05"
                  value={safetyMargin}
                  onChange={e => setSafetyMargin(Number(e.target.value))}
                />
                <small style={{ color: "var(--text-muted)", fontSize: "11px" }}>Protects against pinholes & micro-cracks in barrier films</small>
              </div>

              <div style={{ marginTop: "24px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
                <b style={{ color: "var(--warning-amber)", fontSize: "12px", display: "block", marginBottom: "4px" }}>Complete Database Snapshot</b>
                <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", marginBottom: "10px" }}>
                  Super Admin has unrestricted authority to download complete machine learning model weights, material tables, and logs.
                </p>
                <button className="btn btn-primary" style={{ width: "100%", fontSize: "12px" }} onClick={exportBackup}>
                  <Download size={14} /> Download System Snapshot (JSON)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
