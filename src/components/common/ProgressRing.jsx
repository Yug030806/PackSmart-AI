import React from "react";
import { AnimatedNumber } from "./AnimatedNumber";

export function ProgressRing({
  value = 0,
  size = 140,
  strokeWidth = 10,
  label = "Overall Suitability",
  color = "#32D583"
}) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  return (
    <div className="progress-ring-wrap" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id="suitabilityGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#32D583" />
            <stop offset="100%" stopColor="#36BFFA" />
          </linearGradient>
        </defs>
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#182D27"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        {/* Animated value arc */}
        <circle
          className="progress-ring-circle"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#suitabilityGradient)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
        />
      </svg>
      <div className="progress-ring-center">
        <div style={{ fontFamily: "var(--font-heading)", fontSize: "28px", fontWeight: 800, color: "var(--color-primary-dark)", lineHeight: 1 }}>
          <AnimatedNumber value={value} suffix="%" />
        </div>
        {label && (
          <small style={{ display: "block", fontSize: "10px", color: "var(--text-secondary)", marginTop: "4px", textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "var(--font-mono)" }}>
            {label}
          </small>
        )}
      </div>
    </div>
  );
}
