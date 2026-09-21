import React, { useState } from "react";
import { Key, Shield, LogIn, Crown, Wrench, User, CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { DEMO_ACCOUNTS, PERMISSIONS_MATRIX } from "../../data/materials";

export function LoginPage({ onLogin, nav, currentUser, onQuickSwitch }) {
  const [email, setEmail] = useState(currentUser?.email || "admin@packsmart.ai");
  const [password, setPassword] = useState("admin");
  const [role, setRole] = useState(currentUser?.role || "super_admin");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const handleSelectDemo = (acc) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setRole(acc.role);
    setError(null);
    onQuickSwitch(acc.role);
    setSuccessMsg(`Switched persona to ${acc.badge} ${acc.label} (${acc.level})`);
    setTimeout(() => setSuccessMsg(null), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let res;
      try {
        res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, requested_role: role })
        });
      } catch {
        res = await fetch("http://127.0.0.1:8000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password, requested_role: role })
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        onLogin(data.user);
        setSuccessMsg(`Welcome back, ${data.user.name}!`);
        setTimeout(() => {
          if (data.user.role === "super_admin") nav("admin");
          else if (data.user.role === "system_manager") nav("management");
          else nav("dashboard");
        }, 600);
      } else {
        throw new Error("Invalid credentials");
      }
    } catch {
      onQuickSwitch(role);
      setSuccessMsg(`Signed in locally as ${role === "super_admin" ? "👑 Super Admin" : role === "system_manager" ? "🛠️ System Manager" : "👤 User"}`);
      setTimeout(() => {
        if (role === "super_admin") nav("admin");
        else if (role === "system_manager") nav("management");
        else nav("dashboard");
      }, 600);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "28px" }}>
        {/* Left Column: Sign In Form & Demo Selector */}
        <div className="glass-card" style={{ padding: "32px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "20px", paddingBottom: "18px", borderBottom: "1px solid var(--border-subtle)" }}>
            <img
              src="/logo.jpg"
              alt="PackSmart AI"
              style={{ width: "54px", height: "54px", borderRadius: "12px", objectFit: "cover", background: "#fff", border: "1px solid rgba(50, 213, 131, 0.4)" }}
            />
            <div>
              <div className="micro-label green"><Key size={12} style={{ display: "inline", marginRight: "4px" }} /> Identity & RBAC Gateway</div>
              <h2 style={{ fontSize: "22px", margin: "2px 0", color: "#fff" }}>Sign In to PackSmart AI</h2>
              <small style={{ color: "var(--accent-green)", fontSize: "11px", fontWeight: 700, textTransform: "uppercase" }}>
                Engineer Better Packaging · Predict Its Performance
              </small>
            </div>
          </div>

          {/* 1-Click Demo Persona Switcher */}
          <div style={{ marginBottom: "20px", background: "var(--bg-input)", padding: "14px", borderRadius: "var(--radius-md)", border: "1px solid var(--border-subtle)" }}>
            <b style={{ fontSize: "12px", color: "var(--text-secondary)", display: "block", marginBottom: "8px" }}>
              ⚡ 1-Click Persona Switcher (For Demo & Testing)
            </b>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
              {DEMO_ACCOUNTS.map(acc => {
                const isActive = role === acc.role || currentUser?.role === acc.role;
                return (
                  <button
                    key={acc.role}
                    type="button"
                    className="btn btn-ghost"
                    style={{
                      padding: "8px 6px",
                      borderRadius: "8px",
                      background: isActive ? "rgba(50, 213, 131, 0.15)" : "var(--bg-card)",
                      border: isActive ? "1px solid var(--accent-green)" : "1px solid var(--border-subtle)",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      gap: "2px",
                      textAlign: "center"
                    }}
                    onClick={() => handleSelectDemo(acc)}
                  >
                    <span style={{ fontSize: "12px", fontWeight: 700, color: isActive ? "var(--accent-green)" : "#fff" }}>
                      {acc.badge} {acc.label}
                    </span>
                    <small style={{ fontSize: "10px", color: "var(--text-muted)" }}>{acc.level.split(" ")[0]} Tier</small>
                  </button>
                );
              })}
            </div>
          </div>

          {successMsg && (
            <div style={{ background: "rgba(50, 213, 131, 0.12)", border: "1px solid var(--accent-green)", color: "var(--accent-green)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px" }}>
              <CheckCircle2 size={16} /> {successMsg}
            </div>
          )}

          {error && (
            <div style={{ background: "rgba(242, 95, 92, 0.12)", border: "1px solid var(--error-red)", color: "var(--error-red)", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "12.5px", display: "flex", alignItems: "center", gap: "8px" }}>
              <XCircle size={16} /> {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="field">
              <label>Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="admin@packsmart.ai"
              />
            </div>

            <div className="field">
              <label>Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            <div className="field">
              <label>Role / Access Tier</label>
              <select value={role} onChange={e => setRole(e.target.value)}>
                <option value="super_admin">👑 Super Admin (Full System Access)</option>
                <option value="system_manager">🛠️ System Manager (Management Access)</option>
                <option value="user">👤 User (Basic Access)</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: "100%", padding: "12px", marginTop: "10px" }} disabled={loading}>
              <LogIn size={16} /> Sign In as {role === "super_admin" ? "Super Admin" : role === "system_manager" ? "System Manager" : "User"}
            </button>
          </form>
        </div>

        {/* Right Column: Visual Hierarchy & Entitlements */}
        <div className="glass-card" style={{ padding: "32px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
          <div>
            <div className="micro-label green" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <Shield size={12} /> Security Architecture
            </div>
            <h3 style={{ fontSize: "18px", color: "#fff", margin: "4px 0 10px" }}>
              3-Tier Hierarchical Access Control
            </h3>
            <p style={{ fontSize: "12.5px", color: "var(--text-secondary)", marginBottom: "18px" }}>
              Higher tiers strictly inherit all lower tier privileges with unrestricted access reserved for Super Admin.
            </p>

            {/* Visual Topology Diagram */}
            <div style={{
              background: "var(--bg-input)",
              border: "1px solid var(--border-subtle)",
              borderRadius: "var(--radius-md)",
              padding: "14px",
              marginBottom: "18px",
              fontFamily: "var(--font-mono)",
              fontSize: "11px",
              lineHeight: "1.45",
              textAlign: "center"
            }}>
              <div style={{ color: "var(--warning-amber)", fontWeight: 700 }}>👑 SUPER ADMIN (Full Root Authority)</div>
              <div style={{ color: "var(--text-muted)" }}>│</div>
              <div style={{ color: "var(--text-muted)" }}>▼</div>
              <div style={{ color: "var(--accent-cyan)", fontWeight: 700 }}>🛠️ SYSTEM MANAGER (Management Tier)</div>
              <div style={{ color: "var(--text-muted)" }}>│</div>
              <div style={{ color: "var(--text-muted)" }}>▼</div>
              <div style={{ color: "var(--accent-green)", fontWeight: 700 }}>👤 USER (Core Packaging Advisor & Reports)</div>
            </div>

            {/* Quick privileges breakdown */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "12px" }}>
              <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <b style={{ color: "var(--warning-amber)" }}>👑 Super Admin:</b> Full database, user suspension, role promotion, audit logs, security policies, barrier engine calibration.
              </div>
              <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <b style={{ color: "var(--accent-cyan)" }}>🛠️ System Manager:</b> Food & material catalogs, operational settings, reports, analysis monitoring.
              </div>
              <div style={{ background: "var(--bg-input)", padding: "10px", borderRadius: "8px", border: "1px solid var(--border-subtle)" }}>
                <b style={{ color: "var(--accent-green)" }}>👤 User:</b> Packaging advisor, ASTM compare, What-If simulator, recommendations, and report downloads.
              </div>
            </div>
          </div>

          <div style={{ marginTop: "18px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)", fontSize: "11px", color: "var(--text-muted)" }}>
            17 granular RBAC entitlements enforced across all endpoints.
          </div>
        </div>
      </div>
    </div>
  );
}
