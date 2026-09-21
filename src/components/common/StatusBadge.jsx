import React from "react";
import { CheckCircle2, XCircle, AlertTriangle } from "lucide-react";

export function StatusBadge({ status, margin }) {
  if (status === "PASS") {
    return (
      <span className="badge-pass">
        <CheckCircle2 size={13} /> PASS {margin !== undefined && margin !== null ? `(${margin >= 0 ? "+" : ""}${Number(margin).toFixed(0)}%)` : ""}
      </span>
    );
  } else if (status === "MARGINAL") {
    return (
      <span className="badge-marginal">
        <AlertTriangle size={13} /> MARGINAL {margin !== undefined && margin !== null ? `(${Number(margin).toFixed(0)}%)` : ""}
      </span>
    );
  } else {
    return (
      <span className="badge-fail">
        <XCircle size={13} /> FAIL {margin !== undefined && margin !== null ? `(${Number(margin).toFixed(0)}%)` : ""}
      </span>
    );
  }
}
