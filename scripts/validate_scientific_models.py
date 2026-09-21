"""
PackSmart AI — Scientific Model Validation & Sensibility Suite
Validates mathematical and physical formulations across:
1. Barrier Analysis: OTR, WVTR, oxygen requirement, moisture requirement, safety margin
2. Shelf-Life Kinetics: Monotonic response to Temperature ↑, Humidity ↑, Barrier ↓
3. MAP Optimization: O2, CO2, N2 gas sum constraints (100%), equilibrium states, collapse risk
4. Fresh Produce Respiration: Realistic physiological rates, Q10 scaling, micro-perforation pore mechanics
"""

import sys
import math
from typing import Dict, Any

from backend.app.schemas import FoodInput, ProduceRespirationRequest, MAPOptimizationRequest
from backend.app.barrier_calc import calculate_food_barrier_requirements, evaluate_material_barrier
from backend.app.shelf_life_model import predict_shelf_life
from backend.app.map_optimizer import optimize_map_formulation
from backend.app.respiration_model import calculate_produce_respiration, PRODUCE_DATABASE

def header(title: str):
    print("\n" + "=" * 75)
    print(f"🔬 {title.upper()}")
    print("=" * 75)

def check(condition: bool, label: str, details: str = ""):
    mark = "✅ PASS" if condition else "❌ FAIL"
    print(f"{mark} | {label:<50} | {details}")
    if not condition:
        raise AssertionError(f"Validation failed for: {label} ({details})")

def validate_all():
    print("===========================================================================")
    print("PACKSMART AI — COMPREHENSIVE SCIENTIFIC CALCULATIONS VALIDATION SUITE")
    print("===========================================================================")

    # -------------------------------------------------------------------------
    # 1. BARRIER ANALYSIS VALIDATION
    # -------------------------------------------------------------------------
    header("1. Barrier Physics Validation (OTR, WVTR, Limits & Safety Margins)")

    chips_input = FoodInput(
        food_id="chips",
        food_name="Artisan Potato Crisps",
        category="Snacks",
        moisture_pct=2.5,
        fat_pct=32.0,
        ph=6.2,
        respiration_rate="Low",
        storage_type="Ambient",
        temperature_c=25.0,
        humidity_pct=65.0,
        shelf_life_days=180.0,
        package_weight_g=200.0,
        package_surface_area_m2=0.08
    )

    req = calculate_food_barrier_requirements(chips_input)

    # 1.1 Moisture requirement: Delta M_crit
    # For 200g chips, max delta moisture is 1.8% -> 3.6g
    check(
        req.critical_moisture_gain_g == 3.6,
        "Critical Moisture Uptake Limit",
        f"Expected: 3.60 g, Got: {req.critical_moisture_gain_g:.2f} g"
    )

    # 1.2 Oxygen requirement: High fat chips (32% fat = 64g fat)
    # 64g fat * 0.75 cc O2/g fat = 48.0 cc O2
    check(
        req.critical_oxygen_uptake_cc == 48.0,
        "Critical Oxygen Uptake Limit",
        f"Expected: 48.0 cc O₂, Got: {req.critical_oxygen_uptake_cc:.1f} cc"
    )

    # 1.3 OTR & WVTR Stringency Limits for 180-day shelf life
    check(
        req.target_otr_max is not None and 5.0 <= req.target_otr_max <= 20.0,
        "Permissible Target OTR Max",
        f"Got: {req.target_otr_max} cc/(m²·d·atm) [Typical snack limit: 5-20 cc]"
    )
    check(
        req.target_wvtr_max is not None and 0.5 <= req.target_wvtr_max <= 3.0,
        "Permissible Target WVTR Max",
        f"Got: {req.target_wvtr_max} g/(m²·d) [Typical crisp snack limit: 0.5-3.0 g]"
    )

    # 1.4 Material evaluation and Safety Margin Check
    # Metalized BOPP (nominal OTR ~1.2, WVTR ~0.5)
    met_check = evaluate_material_barrier("metalized", 40.0, req, 25.0, is_produce=False)
    check(
        met_check.overall_barrier_status == "PASS" and met_check.otr_margin_pct > 50,
        "High-Barrier Foil/Met-PET Pass Verdict",
        f"OTR Margin: +{met_check.otr_margin_pct}%, WVTR Margin: +{met_check.wvtr_margin_pct}%"
    )

    # Breathable film (nominal OTR ~8500, WVTR ~45)
    breath_check = evaluate_material_barrier("breathable", 35.0, req, 25.0, is_produce=False)
    check(
        breath_check.overall_barrier_status == "FAIL" and breath_check.otr_margin_pct < 0,
        "Low-Barrier Breathable Film Fail Verdict",
        f"OTR Status: {breath_check.otr_status}, WVTR Status: {breath_check.wvtr_status}"
    )

    # -------------------------------------------------------------------------
    # 2. SHELF LIFE KINETICS & SENSIBILITY VALIDATION
    # -------------------------------------------------------------------------
    header("2. Shelf-Life Kinetics Sensibility (Temp ↑, RH ↑, Barrier ↓)")

    # Baseline: Potato chips in Metallized film (OTR=1.2, WVTR=0.5) at 20°C, 50% RH
    base_sl = predict_shelf_life(
        FoodInput(
            food_id="chips", category="Snacks", moisture_pct=2.5, fat_pct=32.0, ph=6.2,
            temperature_c=20.0, humidity_pct=50.0, shelf_life_days=180.0, package_weight_g=200.0
        ),
        actual_otr=1.2, actual_wvtr=0.5
    )
    base_days = base_sl.predicted_shelf_life_days
    print(f"  [Baseline] 20°C, 50% RH, High Barrier -> Predicted Shelf Life: {base_days} days (Limiting: {base_sl.limiting_degradation_factor})")

    # 2.1 Temperature Sensitivity (20°C -> 30°C -> 40°C)
    sl_temp30 = predict_shelf_life(
        FoodInput(
            food_id="chips", category="Snacks", moisture_pct=2.5, fat_pct=32.0, ph=6.2,
            temperature_c=30.0, humidity_pct=50.0, shelf_life_days=180.0, package_weight_g=200.0
        ),
        actual_otr=1.2, actual_wvtr=0.5
    )
    sl_temp40 = predict_shelf_life(
        FoodInput(
            food_id="chips", category="Snacks", moisture_pct=2.5, fat_pct=32.0, ph=6.2,
            temperature_c=40.0, humidity_pct=50.0, shelf_life_days=180.0, package_weight_g=200.0
        ),
        actual_otr=1.2, actual_wvtr=0.5
    )
    check(
        base_days > sl_temp30.predicted_shelf_life_days > sl_temp40.predicted_shelf_life_days,
        "Temperature ↑ Causes Monotonic Shelf-Life Decay",
        f"20°C: {base_days}d -> 30°C: {sl_temp30.predicted_shelf_life_days}d -> 40°C: {sl_temp40.predicted_shelf_life_days}d"
    )

    # 2.2 Humidity Sensitivity (40% RH -> 65% RH -> 90% RH)
    sl_rh40 = predict_shelf_life(
        FoodInput(
            food_id="chips", category="Snacks", moisture_pct=2.5, fat_pct=32.0, ph=6.2,
            temperature_c=25.0, humidity_pct=40.0, shelf_life_days=180.0, package_weight_g=200.0
        ),
        actual_otr=1.2, actual_wvtr=0.8
    )
    sl_rh65 = predict_shelf_life(
        FoodInput(
            food_id="chips", category="Snacks", moisture_pct=2.5, fat_pct=32.0, ph=6.2,
            temperature_c=25.0, humidity_pct=65.0, shelf_life_days=180.0, package_weight_g=200.0
        ),
        actual_otr=1.2, actual_wvtr=0.8
    )
    sl_rh90 = predict_shelf_life(
        FoodInput(
            food_id="chips", category="Snacks", moisture_pct=2.5, fat_pct=32.0, ph=6.2,
            temperature_c=25.0, humidity_pct=90.0, shelf_life_days=180.0, package_weight_g=200.0
        ),
        actual_otr=1.2, actual_wvtr=0.8
    )
    check(
        sl_rh40.predicted_shelf_life_days > sl_rh65.predicted_shelf_life_days > sl_rh90.predicted_shelf_life_days,
        "Humidity ↑ Accelerates Moisture Staling",
        f"40% RH: {sl_rh40.predicted_shelf_life_days}d -> 65% RH: {sl_rh65.predicted_shelf_life_days}d -> 90% RH: {sl_rh90.predicted_shelf_life_days}d"
    )

    # 2.3 Barrier Performance Sensitivity (Barrier ↓ -> Shelf Life ↓)
    # High Barrier (Metalized) vs Moderate Barrier (PET/PE) vs Uncoated Film
    sl_mat_high = predict_shelf_life(chips_input, actual_otr=1.2, actual_wvtr=0.5)
    sl_mat_med = predict_shelf_life(chips_input, actual_otr=45.0, actual_wvtr=4.5)
    sl_mat_low = predict_shelf_life(chips_input, actual_otr=800.0, actual_wvtr=25.0)

    check(
        sl_mat_high.predicted_shelf_life_days > sl_mat_med.predicted_shelf_life_days > sl_mat_low.predicted_shelf_life_days,
        "Barrier Performance ↓ Causes Sharp Lifespan Drop",
        f"Foil: {sl_mat_high.predicted_shelf_life_days}d -> PET/PE: {sl_mat_med.predicted_shelf_life_days}d -> Poly: {sl_mat_low.predicted_shelf_life_days}d"
    )

    # -------------------------------------------------------------------------
    # 3. MAP GAS OPTIMIZATION & MASS BALANCE VALIDATION
    # -------------------------------------------------------------------------
    header("3. MAP Gas Balance Validation (O₂, CO₂, N₂ & Headspace Ratios)")

    # 3.1 Snack Food Nitrogen Flush
    map_snack = optimize_map_formulation(
        inp=FoodInput(food_id="chips", category="Snacks", moisture_pct=2.5, fat_pct=32.0, temperature_c=25.0),
        material_id="metalized",
        actual_otr=1.2,
        headspace_ratio=2.0
    )
    snack_sum = round(map_snack.initial_flush_o2_pct + map_snack.initial_flush_co2_pct + map_snack.initial_flush_n2_pct, 2)
    check(
        snack_sum == 100.0 and map_snack.initial_flush_o2_pct < 0.5 and map_snack.initial_flush_n2_pct > 99.0,
        "Snack Inert Flush: O₂ <0.5%, N₂ >99%, Sum = 100%",
        f"O₂: {map_snack.initial_flush_o2_pct}%, CO₂: {map_snack.initial_flush_co2_pct}%, N₂: {map_snack.initial_flush_n2_pct}% (Sum: {snack_sum}%)"
    )

    # 3.2 Chilled Dairy / Paneer MAP (Bacteriostatic CO2)
    map_dairy = optimize_map_formulation(
        inp=FoodInput(food_id="paneer", category="Dairy", moisture_pct=50.0, fat_pct=22.0, temperature_c=4.0),
        material_id="pet-pe",
        actual_otr=45.0,
        headspace_ratio=1.5
    )
    dairy_sum = round(map_dairy.initial_flush_o2_pct + map_dairy.initial_flush_co2_pct + map_dairy.initial_flush_n2_pct, 2)
    check(
        dairy_sum == 100.0 and map_dairy.initial_flush_co2_pct >= 25.0,
        "Chilled Dairy MAP: CO₂ >=25%, Sum = 100%",
        f"O₂: {map_dairy.initial_flush_o2_pct}%, CO₂: {map_dairy.initial_flush_co2_pct}%, N₂: {map_dairy.initial_flush_n2_pct}% (Sum: {dairy_sum}%)"
    )

    # 3.3 Fresh Produce EMAP (Equilibrium O2 & CO2)
    map_produce = optimize_map_formulation(
        inp=FoodInput(food_id="tomato", category="Fresh produce", moisture_pct=94.0, fat_pct=0.2, respiration_rate="Medium", temperature_c=10.0, package_weight_g=200.0, package_surface_area_m2=0.08),
        material_id="breathable",
        actual_otr=8000.0,
        headspace_ratio=2.0
    )
    prod_init_sum = round(map_produce.initial_flush_o2_pct + map_produce.initial_flush_co2_pct + map_produce.initial_flush_n2_pct, 2)
    prod_eq_sum = round(map_produce.equilibrium_headspace_o2_pct + map_produce.equilibrium_headspace_co2_pct + map_produce.equilibrium_headspace_n2_pct, 2)
    check(
        prod_init_sum == 100.0 and prod_eq_sum == 100.0 and 2.0 <= map_produce.equilibrium_headspace_o2_pct <= 6.5,
        "Fresh Produce EMAP: Safe Aerobic Equilibrium (2-6.5% O₂, Sum = 100%)",
        f"Equilibrium O₂: {map_produce.equilibrium_headspace_o2_pct}%, CO₂: {map_produce.equilibrium_headspace_co2_pct}%, N₂: {map_produce.equilibrium_headspace_n2_pct}% (Sums: Init={prod_init_sum}%, Eq={prod_eq_sum}%)"
    )

    # -------------------------------------------------------------------------
    # 4. FRESH PRODUCE RESPIRATION & PORE MECHANICS VALIDATION
    # -------------------------------------------------------------------------
    header("4. Fresh Produce Respiration & 4-Way Decision Validation")

    # 4.1 Low Respiration Commodity (Apple at 4°C vs 20°C)
    resp_apple_cold = calculate_produce_respiration(commodity_key="apple", temperature_c=4.0, weight_g=500.0, surface_area_m2=0.08)
    resp_apple_warm = calculate_produce_respiration(commodity_key="apple", temperature_c=20.0, weight_g=500.0, surface_area_m2=0.08)
    check(
        resp_apple_warm.respiration_rate_ml_kg_hr > resp_apple_cold.respiration_rate_ml_kg_hr * 2.0,
        "Arrhenius Q10 Respiration Scaling (Apple)",
        f"4°C: {resp_apple_cold.respiration_rate_ml_kg_hr} ml/(kg·h) -> 20°C: {resp_apple_warm.respiration_rate_ml_kg_hr} ml/(kg·h)"
    )

    # 4.2 High Respiration Commodity (Broccoli at 10°C)
    resp_broccoli = calculate_produce_respiration(commodity_key="broccoli", temperature_c=10.0, weight_g=400.0, surface_area_m2=0.07)
    check(
        resp_broccoli.final_decision in ["Micro-perforated film", "Breathable film"] and resp_broccoli.micro_perforation_specs.is_required,
        "High Respiration Triggers Laser Micro-Perforations",
        f"Decision: {resp_broccoli.final_decision} ({resp_broccoli.micro_perforation_specs.hole_count} holes @ {resp_broccoli.micro_perforation_specs.hole_diameter_um} µm)"
    )

    # 4.3 Fresh-cut Wound Respiration
    resp_lettuce_whole = calculate_produce_respiration(commodity_key="tomato", temperature_c=10.0, weight_g=300.0, surface_area_m2=0.05, is_fresh_cut=False)
    resp_lettuce_cut = calculate_produce_respiration(commodity_key="tomato", temperature_c=10.0, weight_g=300.0, surface_area_m2=0.05, is_fresh_cut=True)
    check(
        resp_lettuce_cut.respiration_rate_ml_kg_hr > resp_lettuce_whole.respiration_rate_ml_kg_hr,
        "Fresh-Cut / Slicing Accelerates Wound Respiration Rate",
        f"Intact: {resp_lettuce_whole.respiration_rate_ml_kg_hr} ml/(kg·h) -> Sliced: {resp_lettuce_cut.respiration_rate_ml_kg_hr} ml/(kg·h)"
    )

    # 4.4 Hermetic Film Suffocation Check
    # Verify that Normal Hermetic Film fails for respiring produce
    normal_film_eval = next(opt for opt in resp_broccoli.options_comparison if opt.option_type == "Normal film")
    check(
        normal_film_eval.status.startswith("FAIL"),
        "Hermetic Barrier Film Fails Respiring Produce (Suffocation)",
        f"Normal Film Status: {normal_film_eval.status} (Failure Risk: {normal_film_eval.failure_risk})"
    )

    print("\n" + "=" * 75)
    print("🏆 ALL SCIENTIFIC AND PHYSICAL VALIDATION CHECKS PASSED SUCCESSFULLY")
    print("=" * 75)

if __name__ == "__main__":
    validate_all()
