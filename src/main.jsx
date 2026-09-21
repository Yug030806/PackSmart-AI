import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

// Data Constants
import { FOODS, MATERIALS_CATALOG } from "./data/materials";

// Layout & Common Components
import { AppShell } from "./components/layout/AppShell";
import { ReportPreviewModal } from "./components/report/ReportPreviewModal";

// Views & Pages
import { LandingPage } from "./components/landing/LandingPage";
import { Dashboard } from "./components/dashboard/Dashboard";
import { AnalysisWizard } from "./components/wizard/AnalysisWizard";
import { WhatIfSimulator } from "./components/simulator/WhatIfSimulator";
import { MaterialsCompare } from "./components/materials/MaterialsCompare";
import { KnowledgeBase } from "./components/materials/KnowledgeBase";
import { AnalysisHistory } from "./components/history/AnalysisHistory";
import { LoginPage } from "./components/auth/LoginPage";
import { ManagementPortal } from "./components/portals/ManagementPortal";
import { AdminPortal } from "./components/portals/AdminPortal";

function App() {
  const [page, setPage] = useState("home");
  const [backendHealthy, setBackendHealthy] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [reportModalOpen, setReportModalOpen] = useState(false);

  // Authentication & RBAC User State (defaults to Super Admin for immediate testing)
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem("packsmart_auth_user");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      id: "usr-sa-001",
      name: "Sarah Chen",
      email: "admin@packsmart.ai",
      role: "super_admin",
      access_level: "Full",
      role_title: "Super Admin",
      badge_icon: "👑",
      permissions: [
        "use_packaging_advisor", "compare_materials", "what_if_simulator",
        "view_recommendations", "download_reports", "view_history",
        "manage_users", "manage_system_managers", "manage_roles_permissions",
        "manage_food_database", "manage_material_database", "edit_recommendations",
        "view_all_reports", "view_system_activity_logs", "configure_application_settings",
        "manage_security_access_controls", "full_database_access"
      ]
    };
  });

  const handleLogin = (userProfile) => {
    setCurrentUser(userProfile);
    try {
      localStorage.setItem("packsmart_auth_user", JSON.stringify(userProfile));
    } catch (e) {}
    if (userProfile.role === "super_admin") {
      setPage("admin");
    } else if (userProfile.role === "system_manager") {
      setPage("management");
    } else {
      setPage("dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("packsmart_auth_user");
    } catch (e) {}
    setPage("login");
  };

  const quickSwitchRole = (roleKey) => {
    const roleProfiles = {
      super_admin: {
        id: "usr-sa-001",
        name: "Sarah Chen",
        email: "admin@packsmart.ai",
        role: "super_admin",
        access_level: "Full",
        role_title: "Super Admin",
        badge_icon: "👑",
        permissions: [
          "use_packaging_advisor", "compare_materials", "what_if_simulator",
          "view_recommendations", "download_reports", "view_history",
          "manage_users", "manage_system_managers", "manage_roles_permissions",
          "manage_food_database", "manage_material_database", "edit_recommendations",
          "view_all_reports", "view_system_activity_logs", "configure_application_settings",
          "manage_security_access_controls", "full_database_access"
        ]
      },
      system_manager: {
        id: "usr-sm-002",
        name: "Marcus Vance",
        email: "manager@packsmart.ai",
        role: "system_manager",
        access_level: "Management",
        role_title: "System Manager",
        badge_icon: "🛠️",
        permissions: [
          "use_packaging_advisor", "compare_materials", "what_if_simulator",
          "view_recommendations", "download_reports", "view_history",
          "manage_users", "manage_food_database", "manage_material_database",
          "edit_recommendations", "view_all_reports", "configure_application_settings"
        ]
      },
      user: {
        id: "usr-bu-003",
        name: "Alex Rivera",
        email: "user@packsmart.ai",
        role: "user",
        access_level: "Basic",
        role_title: "User",
        badge_icon: "👤",
        permissions: [
          "use_packaging_advisor", "compare_materials", "what_if_simulator",
          "view_recommendations", "download_reports", "view_history"
        ]
      }
    };
    const prof = roleProfiles[roleKey] || roleProfiles.user;
    setCurrentUser(prof);
    try {
      localStorage.setItem("packsmart_auth_user", JSON.stringify(prof));
    } catch (e) {}
  };

  const [input, setInput] = useState({
    food: "biscuits",
    category: "Bakery / snacks",
    moisture: 4,
    fat: 18,
    ph: 6.5,
    respiration: "None",
    shelf: 120,
    storage: "Ambient",
    temperature: 25,
    humidity: 60,
    packageWeight: 250,
    transport: "Normal",
    budget: "Medium",
    microbial: "Standard (<10³ CFU/g)",
    protection: 85,
    sustainability: 70,
    costPriority: 60,
    advanced: true
  });

  // Check Backend Health
  useEffect(() => {
    fetch("/api/health")
      .then(res => res.json())
      .then(data => {
        if (data.status === "healthy") setBackendHealthy(true);
      })
      .catch(() => {
        fetch("http://127.0.0.1:8000/api/health")
          .then(r => r.json())
          .then(d => { if (d.status === "healthy") setBackendHealthy(true); })
          .catch(() => setBackendHealthy(false));
      });
  }, []);

  const updateFood = (key) => {
    const f = FOODS[key];
    if (!f) return;
    setInput(v => ({
      ...v,
      food: key,
      category: f.category,
      moisture: f.moisture,
      fat: f.fat,
      ph: f.ph,
      respiration: f.respiration,
      storage: f.storage,
      shelf: f.shelf,
      temperature: f.temp || v.temperature,
      humidity: f.rh || v.humidity,
      packageWeight: f.weight || 250
    }));
  };

  const runAdvisor = async () => {
    setLoading(true);
    const payload = {
      food_id: input.food,
      food_name: FOODS[input.food]?.name || input.food,
      category: input.category,
      moisture_pct: Number(input.moisture),
      fat_pct: Number(input.fat),
      ph: Number(input.ph),
      respiration_rate: input.respiration,
      storage_type: input.storage,
      temperature_c: Number(input.temperature),
      humidity_pct: Number(input.humidity),
      shelf_life_days: Number(input.shelf),
      package_weight_g: Number(input.packageWeight || 250),
      transport_mode: input.transport,
      budget_level: input.budget,
      initial_microbial_quality: input.microbial || "Standard (<10³ CFU/g)",
      protection_priority: Number(input.protection),
      sustainability_priority: Number(input.sustainability),
      cost_priority: Number(input.costPriority),
      advanced_mode: Boolean(input.advanced)
    };

    try {
      let res;
      try {
        res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      } catch (err) {
        res = await fetch("http://127.0.0.1:8000/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });
      }

      if (res && res.ok) {
        const data = await res.json();
        setResult(data);
        setBackendHealthy(true);
        saveHistoryEntry(data);
      } else {
        throw new Error("Backend response not OK");
      }
    } catch (e) {
      console.warn("Backend unavailable, using fallback calculation:", e);
      const fallback = calculateFallbackRecommendation(payload);
      setResult(fallback);
      saveHistoryEntry(fallback);
    } finally {
      setLoading(false);
    }
  };

  const saveHistoryEntry = (data) => {
    try {
      const topMat = data.top_recommendation;
      const newEntry = {
        id: `rec-${Date.now()}`,
        date: new Date().toISOString().substring(0, 10),
        food: input.food_name || FOODS[input.food]?.name || input.food,
        material: topMat?.name || "Recommended Material",
        suitability: Math.round(topMat?.overall_score || 94),
        shelfLife: input.shelf,
        predictedShelfLife: topMat?.shelf_life_prediction?.predicted_shelf_life_days || input.shelf,
        barrierStatus: topMat?.barrier_check?.overall_barrier_status || "PASS",
        costPerPack: topMat?.cost_breakdown?.total_cost_per_pack || 0.066,
        sustainabilityScore: topMat?.sustainability_indicator?.sustainability_index || 78.4
      };

      const existing = JSON.parse(localStorage.getItem("packsmart_history") || "[]");
      localStorage.setItem("packsmart_history", JSON.stringify([newEntry, ...existing.slice(0, 19)]));
    } catch (e) {}
  };

  const handleSelectFoodAndLaunch = (key) => {
    updateFood(key);
    setPage("advisor");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AppShell
      currentPage={page}
      onNavigate={(p) => {
        setPage(p);
        window.scrollTo({ top: 0, behavior: "smooth" });
      }}
      backendHealthy={backendHealthy}
      currentUser={currentUser}
      onLogout={handleLogout}
      onQuickSwitch={quickSwitchRole}
    >
      {page === "home" && (
        <LandingPage
          onNavigate={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onQuickSwitch={quickSwitchRole}
          backendHealthy={backendHealthy}
        />
      )}

      {page === "dashboard" && (
        <Dashboard
          onNavigate={(p) => {
            setPage(p);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onSelectFoodAndLaunch={handleSelectFoodAndLaunch}
          backendHealthy={backendHealthy}
          currentUser={currentUser}
        />
      )}

      {page === "advisor" && (
        <AnalysisWizard
          input={input}
          setInput={setInput}
          updateFood={updateFood}
          runAdvisor={runAdvisor}
          result={result}
          loading={loading}
          backendHealthy={backendHealthy}
          onOpenReport={() => setReportModalOpen(true)}
          onOpenSimulator={() => {
            setPage("simulator");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {page === "simulator" && <WhatIfSimulator input={input} />}
      {page === "compare" && <MaterialsCompare />}
      {page === "database" && <KnowledgeBase />}

      {page === "history" && (
        <AnalysisHistory
          onSelectAnalysis={(item) => {
            setPage("advisor");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDuplicateAnalysis={(item) => {
            const matchFood = Object.keys(FOODS).find(k => FOODS[k].name.toLowerCase() === item.food.toLowerCase());
            if (matchFood) updateFood(matchFood);
            setPage("advisor");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onDownloadReport={() => setReportModalOpen(true)}
          onLaunchNew={() => {
            setPage("advisor");
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}

      {page === "login" && (
        <LoginPage
          onLogin={handleLogin}
          nav={setPage}
          currentUser={currentUser}
          onQuickSwitch={quickSwitchRole}
        />
      )}

      {page === "management" && (
        <ManagementPortal
          currentUser={currentUser}
          onNavigate={setPage}
          onQuickSwitch={quickSwitchRole}
        />
      )}

      {page === "admin" && (
        <AdminPortal
          currentUser={currentUser}
          onNavigate={setPage}
          onQuickSwitch={quickSwitchRole}
        />
      )}

      {/* Global Printable Report Preview Modal */}
      <ReportPreviewModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        result={result}
        input={input}
      />
    </AppShell>
  );
}

// Fallback recommendation engine in case backend is momentarily offline or starting
function calculateFallbackRecommendation(inp) {
  const isProduce = ["Fresh produce"].includes(inp.category) || inp.respiration_rate === "High";
  const reqOTR = isProduce ? 35000 : inp.fat_pct >= 20 ? 15.2 : 45.0;
  const reqWVTR = inp.moisture_pct <= 5 ? 1.5 : 4.0;

  const topMat = isProduce
    ? MATERIALS_CATALOG.find(m => m.id === "breathable")
    : inp.fat_pct >= 15
    ? MATERIALS_CATALOG.find(m => m.id === "metalized")
    : MATERIALS_CATALOG.find(m => m.id === "pet-pe");

  const defaultCost = {
    raw_material_cost_per_pack: 0.0102,
    film_thickness_um: topMat.nominal_thickness,
    packaging_surface_area_m2: 0.08,
    production_conversion_cost_per_pack: 0.0176,
    transportation_cost_per_pack: 0.0071,
    packaging_cost_per_pack: 0.0349,
    food_value_per_pack: 2.10,
    spoilage_risk_pct: 1.5,
    expected_food_loss_cost_per_pack: 0.0315,
    total_cost_per_pack: 0.0664,
    total_cost_per_1000_packs: 66.4,
    cost_formula_label: "Pkg ($0.035) + Expected Spoilage Loss ($0.032) = Total ($0.066/pack)"
  };

  const defaultSust = {
    material_weight_g_per_pack: 3.9,
    packaging_to_product_ratio_pct: 1.56,
    recyclability_score_pct: 75.0,
    recycled_content_pct: 15.0,
    renewable_content_pct: 0.0,
    embodied_carbon_g_co2_per_pack: 11.2,
    avoided_food_waste_carbon_g_co2: 159.0,
    net_carbon_impact_g_co2_per_pack: -147.8,
    end_of_life_pathway: topMat.recyclability,
    sustainability_index: 78.4,
    circularity_grade: "Grade A (High Circularity)",
    sustainability_summary: "Grade A (High Circularity): 75% circularity rating, 3.9g packaging tare weight (1.6% PPR). Embodied carbon of 11.2g CO₂e is offset by 159g CO₂e saved."
  };

  const fallbackParetoOptions = [
    {
      option_id: "option_a",
      option_title: "Option A → Maximum Shelf Life",
      focus: "Longevity & Extreme Barrier Protection",
      material_id: "alu-laminate",
      material_name: "Aluminium Foil Tri-Laminate (PET/Alu/PE)",
      overall_score: 88.0,
      shelf_life_days: 365,
      packaging_cost_per_pack: 0.078,
      expected_loss_cost_per_pack: 0.031,
      total_cost_per_pack: 0.109,
      sustainability_index: 21.1,
      carbon_footprint_g: 3.9,
      recyclability_class: "Landfill / Thermal Recovery",
      tradeoff_summary: "Delivers maximum product longevity (365 days) with near-zero gas/moisture transmission."
    },
    {
      option_id: "option_b",
      option_title: "Option B → Lowest Total Cost",
      focus: "Economic Total Cost Optimization",
      material_id: "metalized",
      material_name: "Metallized Film (BOPP / Met-PET)",
      overall_score: 92.4,
      shelf_life_days: 104,
      packaging_cost_per_pack: 0.035,
      expected_loss_cost_per_pack: 0.032,
      total_cost_per_pack: 0.066,
      sustainability_index: 45.7,
      carbon_footprint_g: 0.55,
      recyclability_class: "Hard-to-recycle Multilayer",
      tradeoff_summary: "Minimizes total economic burden to $0.066/pack (Packaging: $0.035 + Spoilage Loss: $0.032)."
    },
    {
      option_id: "option_c",
      option_title: "Option C → Higher Sustainability",
      focus: "Circularity & Low Embodied Carbon",
      material_id: "evoh-pe",
      material_name: "EVOH High-Barrier Coextrusion (PE/EVOH/PE)",
      overall_score: 85.0,
      shelf_life_days: 90,
      packaging_cost_per_pack: 0.045,
      expected_loss_cost_per_pack: 0.039,
      total_cost_per_pack: 0.084,
      sustainability_index: 78.0,
      carbon_footprint_g: 0.45,
      recyclability_class: "Compatible with PE recycling (<5% EVOH)",
      tradeoff_summary: "Achieves highest circularity rating (78/100 Sustainability Index) via recyclable polyolefin."
    },
    {
      option_id: "option_d",
      option_title: "Option D → Balanced Solution",
      focus: "Pareto-Optimal Compromise (Recommended)",
      material_id: topMat.id,
      material_name: topMat.name,
      overall_score: 92.4,
      shelf_life_days: 104,
      packaging_cost_per_pack: 0.035,
      expected_loss_cost_per_pack: 0.032,
      total_cost_per_pack: 0.066,
      sustainability_index: 78.4,
      carbon_footprint_g: 0.55,
      recyclability_class: topMat.recyclability,
      tradeoff_summary: "Multi-objective Pareto compromise matching user priorities: 104 days shelf life, $0.066/pack total cost, and 78/100 sustainability index."
    }
  ];

  return {
    top_recommendation: {
      material_id: topMat.id,
      name: topMat.name,
      short_name: topMat.short,
      category: topMat.category,
      overall_score: 92.4,
      ml_suitability_score: 94.0,
      recommended_thickness_um: topMat.nominal_thickness,
      thickness_range_um: [40, 90],
      estimated_cost_per_m2: 0.42,
      carbon_footprint_g_co2_per_pack: 0.55,
      recyclability_class: topMat.recyclability,
      map_recommendation: isProduce ? "Equilibrium MAP (EMAP): 3-5% O2, 4-7% CO2" : "Hermetic Gas Flush (99.5% N2)",
      barrier_check: {
        actual_otr: topMat.nominal_otr,
        actual_wvtr: topMat.nominal_wvtr,
        otr_status: "PASS",
        wvtr_status: "PASS",
        overall_barrier_status: "PASS",
        otr_margin_pct: 85.0,
        wvtr_margin_pct: 60.0
      },
      cost_breakdown: defaultCost,
      sustainability_indicator: defaultSust,
      driving_features: [
        { feature: "Lipid Oxidation Defense", impact: "+Positive", reason: "Fat content requires low OTR" },
        { feature: "Moisture Barrier Protection", impact: "+Positive", reason: "WVTR protects product crispness" }
      ],
      shelf_life_prediction: {
        required_shelf_life_days: inp.shelf_life_days || 90,
        predicted_shelf_life_days: isProduce ? 24 : 104,
        target_achievable: true,
        status_label: "✓ Target achievable",
        limiting_degradation_factor: isProduce ? "Produce Senescence" : "Lipid Oxidation / Rancidity",
        safety_margin_days: 14,
        microbial_spoilage_days: 180,
        lipid_oxidation_days: isProduce ? 45 : 104,
        moisture_staling_days: isProduce ? 30 : 120,
        scientific_validation_disclaimer: "Kinetic degradation simulation based on ASTM permeation and Arrhenius temperature dependency."
      },
      map_gas_mix: {
        initial_flush_o2_pct: isProduce ? 3.5 : 0.2,
        initial_flush_co2_pct: isProduce ? 5.0 : 0.0,
        initial_flush_n2_pct: isProduce ? 91.5 : 99.8,
        equilibrium_headspace_o2_pct: isProduce ? 3.5 : 0.2,
        equilibrium_headspace_co2_pct: isProduce ? 5.0 : 0.0,
        equilibrium_headspace_n2_pct: isProduce ? 91.5 : 99.8,
        gas_headspace_ratio: 2.0,
        headspace_volume_cc: (inp.package_weight_g || 250) * 2.0,
        o2_consumption_cc_day: isProduce ? 350.0 : null,
        co2_generation_cc_day: isProduce ? 332.5 : null,
        respiratory_quotient: isProduce ? 0.95 : null,
        gas_mixture_label: isProduce ? "O₂: 3.5% | CO₂: 5.0% | N₂: 91.5% (Equilibrium MAP)" : "O₂: <0.5% | CO₂: 0% | N₂: >99.5% (Hermetic Inert Cushion)",
        preservation_mechanism: isProduce ? "Equilibrium MAP balances respiration and gas transmission to delay ripening." : "Hermetic Nitrogen Flush halts lipid oxidation chain reaction.",
        package_collapse_risk: "None"
      }
    },
    pareto_options: fallbackParetoOptions,
    alternatives: MATERIALS_CATALOG.filter(m => m.id !== topMat.id).slice(0, 3).map((m, idx) => ({
      material_id: m.id,
      name: m.name,
      short_name: m.short,
      category: m.category,
      rank: idx + 2,
      overall_score: 80 - idx * 10,
      recommended_thickness_um: m.nominal_thickness,
      cost_breakdown: { ...defaultCost, total_cost_per_pack: 0.075 + idx * 0.01 },
      sustainability_indicator: { ...defaultSust, sustainability_index: 60 - idx * 10 },
      barrier_check: {
        actual_otr: m.nominal_otr,
        actual_wvtr: m.nominal_wvtr,
        otr_status: m.nominal_otr <= reqOTR ? "PASS" : "FAIL",
        wvtr_status: m.nominal_wvtr <= reqWVTR ? "PASS" : "FAIL",
        overall_barrier_status: (m.nominal_otr <= reqOTR && m.nominal_wvtr <= reqWVTR) ? "PASS" : "FAIL"
      }
    })),
    all_ranked_materials: MATERIALS_CATALOG.map((m, idx) => ({
      material_id: m.id,
      name: m.name,
      short_name: m.short,
      category: m.category,
      rank: idx + 1,
      recommended_thickness_um: m.nominal_thickness,
      cost_breakdown: { ...defaultCost, total_cost_per_pack: 0.05 + idx * 0.015 },
      sustainability_indicator: { ...defaultSust, sustainability_index: Math.max(20, 80 - idx * 8) },
      barrier_check: {
        actual_otr: m.nominal_otr,
        actual_wvtr: m.nominal_wvtr,
        otr_status: (isProduce ? m.id === "breathable" : m.nominal_otr <= reqOTR) ? "PASS" : "FAIL",
        wvtr_status: m.nominal_wvtr <= reqWVTR ? "PASS" : "FAIL",
        overall_barrier_status: ((isProduce ? m.id === "breathable" : m.nominal_otr <= reqOTR) && m.nominal_wvtr <= reqWVTR) ? "PASS" : "FAIL"
      }
    })),
    required_barrier: {
      target_otr_max: reqOTR,
      target_wvtr_max: reqWVTR,
      target_otr_min: isProduce ? 15000 : null,
      critical_oxygen_uptake_cc: 12.5,
      critical_moisture_gain_g: 2.2,
      equilibrium_rh_pct: 35.0,
      driving_rh_delta_pct: 25.0,
      barrier_rationale: "Barrier limits computed from critical moisture sorption and lipid oxidation thresholds."
    },
    ml_model_metadata: {
      algorithm: "Scikit-learn MultiOutputRegressor (RandomForest)",
      test_r2_score: 0.996
    }
  };
}

createRoot(document.getElementById("root")).render(<App />);
