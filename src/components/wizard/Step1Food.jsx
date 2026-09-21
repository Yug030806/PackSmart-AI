import React, { useState } from "react";
import { Search, Check, Sparkles, Sliders, ChevronDown, ChevronUp } from "lucide-react";
import { FOODS, POPULAR_FOOD_TAGS } from "../../data/materials";

export function Step1Food({ input, setInput, onSelectFood, onNext }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [showAdvancedProps, setShowAdvancedProps] = useState(false);

  const categories = ["All", "Snacks", "Bakery / snacks", "Fresh produce", "Dairy", "Grains"];

  const filteredFoods = Object.entries(FOODS).filter(([key, f]) => {
    const matchesSearch = f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          f.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "All" || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const selectedFoodObj = FOODS[input.food] || {
    name: input.food_name || input.food,
    category: input.category,
    moisture: input.moisture,
    fat: input.fat,
    ph: input.ph,
    respiration: input.respiration,
    shelf: input.shelf
  };

  return (
    <div style={{ maxWidth: "960px", margin: "0 auto" }}>
      <div style={{ marginBottom: "24px", textAlign: "center" }}>
        <div className="micro-label green" style={{ marginBottom: "4px" }}>Step 01 / 05</div>
        <h2 style={{ fontSize: "26px", fontWeight: 800 }}>What are you packaging?</h2>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
          Select a food commodity or calibrate custom biochemical properties to compute exact critical barrier thresholds.
        </p>
      </div>

      {/* Search & Category Filter Bar */}
      <div className="glass-card" style={{ padding: "16px 20px", marginBottom: "20px" }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ position: "relative", flex: "1", minWidth: "240px" }}>
            <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-muted)" }} />
            <input
              type="text"
              placeholder="Search food type (e.g. Chips, Biscuits, Tomato, Dairy)..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: "100%",
                background: "var(--bg-input)",
                border: "1px solid var(--border-subtle)",
                borderRadius: "var(--radius-md)",
                padding: "9px 12px 9px 36px",
                color: "var(--text-primary)",
                fontSize: "13.5px"
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
            {categories.map(cat => (
              <button
                key={cat}
                type="button"
                className={`btn btn-ghost ${categoryFilter === cat ? "active" : ""}`}
                style={{
                  fontSize: "12px",
                  padding: "6px 12px",
                  borderRadius: "var(--radius-full)",
                  background: categoryFilter === cat ? "var(--accent-green-subtle)" : "rgba(255, 255, 255, 0.03)",
                  color: categoryFilter === cat ? "var(--accent-green)" : "var(--text-secondary)",
                  border: categoryFilter === cat ? "1px solid rgba(50, 213, 131, 0.3)" : "1px solid transparent"
                }}
                onClick={() => setCategoryFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Popular Options Quick Pills */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", flexWrap: "wrap" }}>
          <span style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase" }}>Popular Options:</span>
          {POPULAR_FOOD_TAGS.map(tag => (
            <button
              key={tag.id}
              type="button"
              className="btn btn-ghost"
              style={{
                fontSize: "11.5px",
                padding: "3px 9px",
                borderRadius: "var(--radius-full)",
                background: input.food === tag.key ? "rgba(50, 213, 131, 0.15)" : "var(--bg-input)",
                color: input.food === tag.key ? "var(--accent-green)" : "var(--text-secondary)",
                border: "1px solid var(--border-subtle)"
              }}
              onClick={() => onSelectFood(tag.key)}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Food Selection Grid */}
      <div className="food-grid" style={{ marginBottom: "24px" }}>
        {filteredFoods.map(([key, f]) => {
          const isSelected = input.food === key;
          return (
            <div
              key={key}
              className={`food-card ${isSelected ? "selected" : ""}`}
              onClick={() => onSelectFood(key)}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span className="food-card-icon">{f.icon || "📦"}</span>
                {isSelected && (
                  <span style={{
                    width: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "var(--accent-green)",
                    color: "#051410",
                    display: "grid",
                    placeItems: "center"
                  }}>
                    <Check size={14} strokeWidth={3} />
                  </span>
                )}
              </div>
              <div>
                <span className="food-card-name">{f.name}</span>
                <span className="food-card-category">{f.category}</span>
              </div>
              <p style={{ fontSize: "11.5px", color: "var(--text-secondary)", margin: "4px 0 0", lineHeight: "1.4" }}>
                {f.description || `Target Shelf-Life: ${f.shelf} days`}
              </p>
              <div className="food-card-specs">
                <span className="spec-chip">Moisture: {f.moisture}%</span>
                <span className="spec-chip">Fat: {f.fat}%</span>
                <span className="spec-chip">pH: {f.ph}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Food Properties Panel */}
      <div className="glass-card" style={{ padding: "20px 24px", marginBottom: "28px", borderColor: "rgba(50, 213, 131, 0.3)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
          <div>
            <span className="micro-label green">Selected Commodity Calibration</span>
            <h4 style={{ fontSize: "17px", color: "#fff", margin: "2px 0 0" }}>
              {selectedFoodObj.name} ({selectedFoodObj.category})
            </h4>
          </div>

          <button
            type="button"
            className="btn btn-secondary"
            style={{ fontSize: "12px", padding: "6px 12px" }}
            onClick={() => setShowAdvancedProps(!showAdvancedProps)}
          >
            <Sliders size={13} /> {showAdvancedProps ? "Hide Biochemical Specs" : "Customize Biochemical Specs"}
            {showAdvancedProps ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>

        {showAdvancedProps ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", paddingTop: "14px", borderTop: "1px solid var(--border-subtle)" }}>
            <div className="field">
              <label>Moisture Content (%)</label>
              <input
                type="number"
                step="0.1"
                value={input.moisture}
                onChange={e => setInput(v => ({ ...v, moisture: Number(e.target.value) }))}
              />
            </div>
            <div className="field">
              <label>Fat / Lipid Content (%)</label>
              <input
                type="number"
                step="0.1"
                value={input.fat}
                onChange={e => setInput(v => ({ ...v, fat: Number(e.target.value) }))}
              />
            </div>
            <div className="field">
              <label>pH Acidity Level</label>
              <input
                type="number"
                step="0.1"
                value={input.ph}
                onChange={e => setInput(v => ({ ...v, ph: Number(e.target.value) }))}
              />
            </div>
            <div className="field">
              <label>Respiration Rate</label>
              <select
                value={input.respiration}
                onChange={e => setInput(v => ({ ...v, respiration: e.target.value }))}
              >
                <option value="None">None (Dry/Processed)</option>
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High (Fresh Produce)</option>
              </select>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12.5px", color: "var(--text-secondary)" }}>
            <span>Moisture: <b style={{ color: "var(--text-primary)" }}>{input.moisture}%</b></span>
            <span>Lipids: <b style={{ color: "var(--text-primary)" }}>{input.fat}%</b></span>
            <span>pH: <b style={{ color: "var(--text-primary)" }}>{input.ph}</b></span>
            <span>Respiration: <b style={{ color: "var(--text-primary)" }}>{input.respiration}</b></span>
            <span>Default Shelf Target: <b style={{ color: "var(--accent-green)" }}>{input.shelf} days</b></span>
          </div>
        )}
      </div>

      {/* Wizard Step Action Bar */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button
          type="button"
          className="btn btn-primary"
          style={{ padding: "12px 28px", fontSize: "14px" }}
          onClick={onNext}
        >
          Proceed to Environmental Conditions →
        </button>
      </div>
    </div>
  );
}
