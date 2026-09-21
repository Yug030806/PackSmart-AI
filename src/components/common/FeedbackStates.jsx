import React from "react";
import { CircleHelp, ArrowRight } from "lucide-react";

export function EmptyState({
  title = "No analyses yet",
  description = "Start your first packaging analysis and let PackSmart AI evaluate the best solution based on barrier physics.",
  actionText = "Start Analysis →",
  onAction
}) {
  return (
    <div className="glass-card" style={{ padding: "48px 24px", textAlign: "center", display: "grid", placeItems: "center", maxWidth: "560px", margin: "40px auto" }}>
      <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(50, 213, 131, 0.1)", display: "grid", placeItems: "center", color: "var(--accent-green)", marginBottom: "16px" }}>
        <CircleHelp size={28} />
      </div>
      <h3 style={{ fontSize: "20px", color: "#fff", marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "13.5px", color: "var(--text-secondary)", marginBottom: "24px", maxWidth: "420px" }}>{description}</p>
      {onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          {actionText} <ArrowRight size={16} />
        </button>
      )}
    </div>
  );
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't complete the packaging analysis.",
  details,
  onRetry
}) {
  const [showDetails, setShowDetails] = React.useState(false);

  return (
    <div className="glass-card" style={{ padding: "36px 24px", textAlign: "center", maxWidth: "520px", margin: "40px auto", borderColor: "rgba(242, 95, 92, 0.3)" }}>
      <div style={{ width: "52px", height: "52px", borderRadius: "50%", background: "rgba(242, 95, 92, 0.12)", display: "grid", placeItems: "center", color: "var(--error-red)", margin: "0 auto 16px" }}>
        <span style={{ fontSize: "24px" }}>⚠</span>
      </div>
      <h3 style={{ fontSize: "19px", color: "#fff", marginBottom: "8px" }}>{title}</h3>
      <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "20px" }}>{message}</p>
      
      {onRetry && (
        <button className="btn btn-primary" onClick={onRetry} style={{ marginBottom: "14px" }}>
          Try Again
        </button>
      )}

      {details && (
        <div style={{ marginTop: "16px", textAlign: "left" }}>
          <button
            className="btn btn-ghost"
            style={{ fontSize: "11px", padding: "4px 8px", color: "var(--text-muted)" }}
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? "Hide technical diagnostic" : "Show technical diagnostic"}
          </button>
          {showDetails && (
            <pre style={{
              marginTop: "8px",
              padding: "10px",
              background: "var(--bg-input)",
              borderRadius: "6px",
              fontSize: "11px",
              fontFamily: "var(--font-mono)",
              color: "#ff8591",
              overflowX: "auto",
              whiteSpace: "pre-wrap"
            }}>
              {typeof details === "string" ? details : JSON.stringify(details, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

export function SkeletonLoader({ type = "card", count = 1 }) {
  return (
    <div style={{ display: "grid", gap: "16px", width: "100%" }}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="glass-card"
          style={{
            height: type === "card" ? "140px" : type === "table" ? "240px" : "80px",
            background: "linear-gradient(90deg, #10211D 25%, #172F29 50%, #10211D 75%)",
            backgroundSize: "200% 100%",
            animation: "skeleton-shimmer 1.8s infinite",
            borderRadius: "var(--radius-lg)"
          }}
        />
      ))}
      <style>{`
        @keyframes skeleton-shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
