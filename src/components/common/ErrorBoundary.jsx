import React from "react";
import { AlertTriangle, RefreshCw, RotateCcw, Home } from "lucide-react";

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[PackSmart AI ErrorBoundary caught an exception]:", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    if (this.props.onReset) {
      this.props.onReset();
    } else {
      try {
        window.location.href = "/";
      } catch (e) {}
    }
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: "40px 20px", minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div
            className="glass-card"
            style={{
              maxWidth: "580px",
              width: "100%",
              padding: "36px 30px",
              textAlign: "center",
              borderColor: "rgba(240, 68, 56, 0.4)",
              boxShadow: "0 12px 36px rgba(0,0,0,0.4)"
            }}
          >
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "50%",
                background: "rgba(240, 68, 56, 0.12)",
                border: "1px solid rgba(240, 68, 56, 0.3)",
                display: "grid",
                placeItems: "center",
                color: "var(--accent-red)",
                margin: "0 auto 16px"
              }}
            >
              <AlertTriangle size={28} />
            </div>

            <span className="micro-label" style={{ color: "var(--accent-red)", letterSpacing: "0.06em", display: "block", marginBottom: "6px" }}>
              APPLICATION RECOVERY SHIELD
            </span>

            <h2 style={{ fontSize: "22px", color: "#fff", margin: "0 0 10px" }}>
              Something went wrong in this module
            </h2>

            <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", lineHeight: "1.5", margin: "0 0 24px" }}>
              PackSmart AI caught an unexpected component error. Your active session data is preserved. You can try recovering or reloading the platform.
            </p>

            {/* Error Actions */}
            <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap", marginBottom: "20px" }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={this.handleReset}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RotateCcw size={15} /> Try Recovering State
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={this.handleReload}
                style={{ display: "flex", alignItems: "center", gap: "6px" }}
              >
                <RefreshCw size={15} /> Reload Application
              </button>
            </div>

            {/* Collapsible Technical Diagnostics */}
            <div style={{ borderTop: "1px solid var(--border-subtle)", paddingTop: "14px", textAlign: "left" }}>
              <button
                type="button"
                className="btn btn-ghost"
                style={{ fontSize: "11px", padding: "4px 8px", color: "var(--text-muted)" }}
                onClick={() => this.setState({ showDetails: !this.state.showDetails })}
              >
                {this.state.showDetails ? "Hide technical diagnostic" : "Show technical diagnostic"}
              </button>

              {this.state.showDetails && (
                <div style={{ marginTop: "10px" }}>
                  <div style={{ fontSize: "12px", color: "var(--accent-red)", fontFamily: "var(--font-mono)", marginBottom: "6px" }}>
                    {this.state.error?.toString()}
                  </div>
                  <pre
                    style={{
                      maxHeight: "160px",
                      overflowY: "auto",
                      background: "var(--bg-input)",
                      padding: "10px",
                      borderRadius: "6px",
                      fontSize: "10.5px",
                      fontFamily: "var(--font-mono)",
                      color: "var(--text-secondary)",
                      whiteSpace: "pre-wrap"
                    }}
                  >
                    {this.state.errorInfo?.componentStack || "No stack trace available."}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
