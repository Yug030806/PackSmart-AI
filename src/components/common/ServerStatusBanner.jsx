import React, { useState } from "react";
import { WifiOff, RefreshCw, AlertCircle, CheckCircle2, ChevronDown, ChevronUp, Lock } from "lucide-react";

export function ServerStatusBanner({
  backendHealthy,
  onRetry,
  retrying,
  errorState,
  onClearError,
  onOpenLogin
}) {
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // If backend is offline or an explicit connection error exists
  const isOffline = backendHealthy === false || errorState?.type === "OFFLINE";
  const isTimeout = errorState?.type === "TIMEOUT";
  const isAuthExpired = errorState?.type === "AUTH_EXPIRED";

  if (!isOffline && !isTimeout && !isAuthExpired && !errorState) {
    return null;
  }

  return (
    <div
      style={{
        position: "sticky",
        top: "60px",
        zIndex: 900,
        margin: "0 auto 20px auto",
        maxWidth: "1140px",
        padding: "0 16px"
      }}
    >
      <div
        className="glass-card"
        style={{
          padding: "14px 20px",
          background: isAuthExpired
            ? "rgba(54, 191, 250, 0.12)"
            : "rgba(240, 68, 56, 0.14)",
          border: isAuthExpired
            ? "1px solid rgba(54, 191, 250, 0.4)"
            : "1px solid rgba(240, 68, 56, 0.4)",
          borderRadius: "var(--radius-md)",
          boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "50%",
                background: isAuthExpired ? "rgba(54, 191, 250, 0.2)" : "rgba(240, 68, 56, 0.2)",
                display: "grid",
                placeItems: "center",
                color: isAuthExpired ? "var(--accent-cyan)" : "var(--accent-red)",
                flexShrink: 0
              }}
            >
              {isAuthExpired ? <Lock size={18} /> : <WifiOff size={18} />}
            </div>

            <div>
              <b style={{ color: "var(--color-primary-dark)", fontSize: "14px", display: "block" }}>
                {isAuthExpired
                  ? "Authentication Session Expired"
                  : isTimeout
                  ? "API Request Timed Out"
                  : "Unable to connect to PackSmart AI server"}
              </b>
              <span style={{ color: "var(--text-secondary)", fontSize: "12.5px" }}>
                {isAuthExpired
                  ? "Your session has expired. Please log in again to sync recommendations and access team portals."
                  : isTimeout
                  ? "The calculation server took longer than 8 seconds to respond. You can retry the request."
                  : "Backend service is unreachable. The application is running in physical thermodynamic fallback mode."}
              </span>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            {isAuthExpired ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onOpenLogin}
                style={{ fontSize: "12px", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                Log In Again
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onRetry}
                disabled={retrying}
                style={{ fontSize: "12px", padding: "6px 14px", display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={13} className={retrying ? "spin" : ""} />
                {retrying ? "Reconnecting..." : "Retry Connection"}
              </button>
            )}

            {!isAuthExpired && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={() => setShowDiagnostics(!showDiagnostics)}
                style={{ fontSize: "11px", padding: "6px 10px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}
              >
                Diagnostics {showDiagnostics ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            )}

            {onClearError && (
              <button
                type="button"
                className="btn btn-ghost"
                onClick={onClearError}
                style={{ fontSize: "11px", padding: "4px 8px", color: "var(--text-muted)" }}
                title="Dismiss banner"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Diagnostics Dropdown */}
        {showDiagnostics && (
          <div
            style={{
              marginTop: "12px",
              paddingTop: "10px",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              fontSize: "11.5px",
              color: "var(--text-secondary)",
              lineHeight: "1.5"
            }}
          >
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "8px", marginBottom: "8px" }}>
              <div>• Target Backend URL: <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>http://127.0.0.1:8000</code></div>
              <div>• Active Health Check: <code style={{ color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>GET /api/health</code></div>
              <div>• Fallback Engine: <b style={{ color: "var(--accent-green)" }}>Active (Fickian Kinetics)</b></div>
            </div>
            <div style={{ color: "var(--text-muted)", fontSize: "11px" }}>
              <b>Troubleshooting:</b> Ensure the FastAPI backend is running via <code style={{ color: "var(--color-primary-dark)" }}>source .venv/bin/activate && python backend/run.py</code>. If you are behind a corporate proxy or firewall, check port 8000.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
