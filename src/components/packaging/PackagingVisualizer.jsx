import React, { useState } from "react";
import {
  ShieldCheck, Check, Info, Layers, Wind, Droplets,
  Recycle, Truck, ArrowUpRight, X, Sparkles, Box
} from "lucide-react";
import { REAL_PACKAGING_FORMATS } from "./PackagingCatalogData";

// Engineering vector illustrations for each packaging format
function PackagingIllustration({ type, isSelected }) {
  const stroke = isSelected ? "#3F7658" : "#2D3E35";
  const accent = isSelected ? "#3F7658" : "#73977C";

  switch (type) {
    case "bottle":
      return (
        <svg viewBox="0 0 100 140" width="70" height="98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Cap */}
          <rect x="42" y="10" width="16" height="12" rx="2" stroke={stroke} strokeWidth="2.5" fill="#E9E2D4" />
          <line x1="42" y1="16" x2="58" y2="16" stroke={stroke} strokeWidth="1.5" />
          {/* Neck */}
          <path d="M44 22V36L34 50V122C34 126.4 37.6 130 42 130H58C62.4 130 66 126.4 66 122V50L56 36V22" stroke={stroke} strokeWidth="2.5" fill="rgba(115, 151, 124, 0.08)" />
          {/* Grip rings / reinforcement ribs */}
          <path d="M36 70H64" stroke={accent} strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M36 84H64" stroke={accent} strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M36 98H64" stroke={accent} strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Fill level indicator */}
          <rect x="38" y="58" width="24" height="66" rx="2" fill="rgba(63, 118, 88, 0.12)" />
        </svg>
      );
    case "jar":
      return (
        <svg viewBox="0 0 100 140" width="70" height="98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Metal Lug Cap */}
          <rect x="30" y="24" width="40" height="12" rx="2" stroke={stroke} strokeWidth="2.5" fill="#D59A38" fillOpacity="0.25" />
          <line x1="30" y1="28" x2="70" y2="28" stroke={stroke} strokeWidth="1.5" />
          {/* Jar Body */}
          <path d="M34 36H66L74 48V120C74 124.4 70.4 128 66 128H34C29.6 128 26 124.4 26 120V48L34 36Z" stroke={stroke} strokeWidth="2.5" fill="rgba(233, 226, 212, 0.25)" />
          {/* Glass wall thickness bevel lines */}
          <path d="M31 52V122H69V52" stroke={accent} strokeWidth="1.2" strokeDasharray="2 2" />
          <rect x="33" y="60" width="34" height="42" rx="2" stroke={accent} strokeWidth="1.5" fill="rgba(63, 118, 88, 0.06)" />
        </svg>
      );
    case "carton":
      return (
        <svg viewBox="0 0 100 140" width="70" height="98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Gable / Flat top with spout */}
          <rect x="52" y="16" width="14" height="10" rx="2" stroke={stroke} strokeWidth="2" fill="#E9E2D4" />
          {/* Carton outline */}
          <path d="M30 32L50 22L70 32V124H30V32Z" stroke={stroke} strokeWidth="2.5" fill="rgba(233, 226, 212, 0.35)" />
          <path d="M50 22V124" stroke={stroke} strokeWidth="1.8" />
          <path d="M30 32L50 42L70 32" stroke={stroke} strokeWidth="2" />
          {/* Multi-ply layer indication */}
          <line x1="36" y1="70" x2="44" y2="74" stroke={accent} strokeWidth="1.5" />
          <line x1="36" y1="76" x2="44" y2="80" stroke={accent} strokeWidth="1.5" />
          <line x1="56" y1="74" x2="64" y2="70" stroke={accent} strokeWidth="1.5" />
        </svg>
      );
    case "can":
      return (
        <svg viewBox="0 0 100 140" width="70" height="98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Pull tab on top */}
          <ellipse cx="50" cy="24" rx="22" ry="7" stroke={stroke} strokeWidth="2.5" fill="#CBD5CC" />
          <ellipse cx="50" cy="24" rx="8" ry="3" stroke={stroke} strokeWidth="1.5" />
          {/* Can Cylinder */}
          <path d="M28 24V116C28 120 38 124 50 124C62 124 72 120 72 116V24" stroke={stroke} strokeWidth="2.5" fill="rgba(189, 200, 189, 0.2)" />
          {/* Metallic reflection highlights */}
          <line x1="36" y1="36" x2="36" y2="114" stroke="#FFFFFF" strokeWidth="2" strokeOpacity="0.8" />
          <line x1="40" y1="36" x2="40" y2="114" stroke="#FFFFFF" strokeWidth="1" strokeOpacity="0.5" />
          <line x1="62" y1="36" x2="62" y2="114" stroke={accent} strokeWidth="1" strokeOpacity="0.6" />
        </svg>
      );
    case "pouch":
      return (
        <svg viewBox="0 0 100 140" width="70" height="98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Top Seal / Tear Notch */}
          <path d="M28 24H72V34H28V24Z" stroke={stroke} strokeWidth="2.2" fill="#E9E2D4" />
          <line x1="28" y1="29" x2="32" y2="29" stroke="#C95B4A" strokeWidth="2.5" />
          {/* Standup Body */}
          <path d="M28 34L22 114C22 122 34 126 50 126C66 126 78 122 78 114L72 34" stroke={stroke} strokeWidth="2.5" fill="rgba(63, 118, 88, 0.1)" />
          {/* Side Fin seals */}
          <path d="M26 38L22 114" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 2" />
          <path d="M74 38L78 114" stroke={stroke} strokeWidth="1.5" strokeDasharray="3 2" />
          {/* Gusset fold bottom curve */}
          <path d="M30 114C40 120 60 120 70 114" stroke={accent} strokeWidth="2" fill="none" />
        </svg>
      );
    case "box":
      return (
        <svg viewBox="0 0 100 140" width="70" height="98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Isometric Corrugated Box */}
          <path d="M50 20L82 38L50 56L18 38L50 20Z" stroke={stroke} strokeWidth="2.5" fill="#E9E2D4" />
          <path d="M18 38V96L50 114V56L18 38Z" stroke={stroke} strokeWidth="2.5" fill="rgba(233, 226, 212, 0.6)" />
          <path d="M50 56V114L82 96V38L50 56Z" stroke={stroke} strokeWidth="2.5" fill="rgba(213, 154, 56, 0.15)" />
          {/* Tape line across top */}
          <path d="M50 20L50 56" stroke="#D59A38" strokeWidth="2.5" />
          {/* Flute wave pattern indicator on side */}
          <path d="M26 62C28 60 30 64 32 62C34 60 36 64 38 62" stroke={accent} strokeWidth="1.5" fill="none" />
          <path d="M26 74C28 72 30 76 32 74C34 72 36 76 38 74" stroke={accent} strokeWidth="1.5" fill="none" />
        </svg>
      );
    case "compostable":
    default:
      return (
        <svg viewBox="0 0 100 140" width="70" height="98" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Bio-film pouch with eco leaf insignia */}
          <path d="M30 26H70V34H30V26Z" stroke={stroke} strokeWidth="2.2" fill="#E9E2D4" />
          <path d="M30 34L26 116C26 122 36 126 50 126C64 126 74 122 74 116L70 34" stroke={stroke} strokeWidth="2.5" fill="rgba(115, 151, 124, 0.15)" />
          {/* Subtle natural texture lines */}
          <path d="M50 54C50 54 42 66 50 78C58 66 50 54 50 54Z" stroke={accent} strokeWidth="2" fill="rgba(63, 118, 88, 0.2)" />
          <line x1="50" y1="58" x2="50" y2="78" stroke={accent} strokeWidth="1.5" />
          <path d="M34 94H66" stroke={accent} strokeWidth="1.2" strokeDasharray="3 3" />
        </svg>
      );
  }
}

export function PackagingVisualizer({ onSelectFormat, activeFormatId = null, interactive = true }) {
  const [selectedFormat, setSelectedFormat] = useState(
    REAL_PACKAGING_FORMATS.find(f => f.id === activeFormatId) || REAL_PACKAGING_FORMATS[0]
  );
  const [hoveredFormatId, setHoveredFormatId] = useState(null);

  const handleCardClick = (format) => {
    setSelectedFormat(format);
    if (onSelectFormat) {
      onSelectFormat(format);
    }
  };

  return (
    <div className="packaging-visualizer-container">
      {/* Visual Header */}
      <div className="section-head-industrial">
        <div>
          <span className="spec-tag green">Standard ASTM / ISO Substrates</span>
          <h3 className="section-title-industrial">Primary & Secondary Packaging Formats</h3>
          <p className="section-desc-industrial">
            Explore realistic physical packaging solutions. Hover to inspect barrier performance, tare weight, typical applications, and circular recycling pathways.
          </p>
        </div>
      </div>

      {/* Grid of Realistic Packaging Formats */}
      <div className="packaging-grid-industrial">
        {REAL_PACKAGING_FORMATS.map((item) => {
          const isSelected = selectedFormat?.id === item.id;
          const isHovered = hoveredFormatId === item.id;

          return (
            <div
              key={item.id}
              className={`packaging-card-industrial ${isSelected ? "selected" : ""} ${isHovered ? "hovered" : ""}`}
              onMouseEnter={() => setHoveredFormatId(item.id)}
              onMouseLeave={() => setHoveredFormatId(null)}
              onClick={() => handleCardClick(item)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === "Enter" && handleCardClick(item)}
            >
              {/* Top Code Badge */}
              <div className="packaging-card-header">
                <span className="packaging-code-badge">{item.code}</span>
                <span className="packaging-recyc-indicator" title={item.recyclability}>
                  <Recycle size={13} /> {item.circularityScore}%
                </span>
              </div>

              {/* Central Technical Vector Illustration with Subtle Motion Lift */}
              <div className="packaging-illustration-frame">
                <PackagingIllustration type={item.iconType} isSelected={isSelected || isHovered} />
              </div>

              {/* Title & Material Specs */}
              <div className="packaging-info-block">
                <h4 className="packaging-name">{item.name}</h4>
                <div className="packaging-material-name">{item.material}</div>
              </div>

              {/* Key Engineering Barrier Metrics */}
              <div className="packaging-metrics-row">
                <div className="packaging-metric-mini">
                  <span className="metric-mini-label"><Wind size={11} /> OTR</span>
                  <span className="metric-mini-val">{item.barrierRatings.oxygen.split(" ")[0]}</span>
                </div>
                <div className="packaging-metric-mini">
                  <span className="metric-mini-label"><Droplets size={11} /> WVTR</span>
                  <span className="metric-mini-val">{item.barrierRatings.moisture.split(" ")[0]}</span>
                </div>
                <div className="packaging-metric-mini">
                  <span className="metric-mini-label"><Truck size={11} /> Durability</span>
                  <span className="metric-mini-val">{item.durability.split(" ")[0]}</span>
                </div>
              </div>

              {/* Quick Typical Use Pill */}
              <div className="packaging-typical-use">
                <b>Typical use:</b> {item.typicalUse}
              </div>

              {/* Bottom selection indicator */}
              <div className="packaging-card-footer">
                <span className="inspect-link">
                  {isSelected ? "Active in Lab ✓" : "Inspect Specifications →"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Packaging Technical Inspection Drawer */}
      {selectedFormat && (
        <div className="packaging-spec-sheet">
          <div className="spec-sheet-header">
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div className="spec-sheet-icon-frame">
                <PackagingIllustration type={selectedFormat.iconType} isSelected={true} />
              </div>
              <div>
                <span className="spec-tag">{selectedFormat.category}</span>
                <h3 style={{ margin: "2px 0", fontSize: "20px", color: "var(--color-primary-dark)" }}>
                  {selectedFormat.name} — Technical Specification Sheet
                </h3>
                <span style={{ fontSize: "12.5px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                  Chemical Matrix: {selectedFormat.material} · Classification: {selectedFormat.code}
                </span>
              </div>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <span className="badge-circ">
                Circularity Index: {selectedFormat.circularityScore}/100
              </span>
            </div>
          </div>

          <div className="spec-sheet-grid">
            <div className="spec-sheet-col">
              <span className="spec-col-label">Barrier Performance</span>
              <ul className="spec-list">
                <li>
                  <strong>Oxygen Barrier:</strong> {selectedFormat.barrierRatings.oxygen}
                </li>
                <li>
                  <strong>Moisture Barrier (WVTR):</strong> {selectedFormat.barrierRatings.moisture}
                </li>
                <li>
                  <strong>Light & UV Barrier:</strong> {selectedFormat.barrierRatings.light}
                </li>
              </ul>
            </div>

            <div className="spec-sheet-col">
              <span className="spec-col-label">Mechanical & Logistics</span>
              <ul className="spec-list">
                <li>
                  <strong>Durability Rating:</strong> {selectedFormat.durability}
                </li>
                <li>
                  <strong>Nominal Tare Weight:</strong> {selectedFormat.nominalWeight}
                </li>
                <li>
                  <strong>Logistics Protection:</strong> {selectedFormat.transportProtection}
                </li>
              </ul>
            </div>

            <div className="spec-sheet-col">
              <span className="spec-col-label">Sustainability & End-of-Life</span>
              <ul className="spec-list">
                <li>
                  <strong>Recycling Stream:</strong> {selectedFormat.recyclability}
                </li>
                <li>
                  <strong>Embodied Footprint:</strong> {selectedFormat.carbonFootprint}
                </li>
                <li>
                  <strong>Engineering Note:</strong> {selectedFormat.engineeringNotes}
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
