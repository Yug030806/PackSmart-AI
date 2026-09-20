"""
Scientific Shelf-Life Prediction Model based on Coupled Degradation Kinetics:
1. Microbial growth kinetics (modified Gompertz / Ratkowsky square-root model)
2. Lipid oxidation kinetics (oxygen mass flux and peroxide formation)
3. Moisture sorption/desiccation kinetics (Fickian vapor transmission)
4. Produce respiratory senescence & anaerobic thresholds

Outputs predicted shelf-life (days), limiting degradation factor, and experimental validation status.
"""

import math
from typing import Dict, Any, Tuple, List, Optional
from .schemas import FoodInput, ShelfLifePredictionResult, ShelfLifePredictionRequest
from .barrier_calc import estimate_water_activity, calculate_food_barrier_requirements
from .data.materials_data import PACKAGING_MATERIALS


MICROBIAL_QUALITY_MAP = {
    "High Hygiene (<10² CFU/g)": 2.0,
    "Standard (<10³ CFU/g)": 3.0,
    "Standard Grade (<10³ CFU/g)": 3.0,
    "Elevated Load (>10⁴ CFU/g)": 4.5
}


def predict_shelf_life(
    inp: FoodInput,
    actual_otr: float,
    actual_wvtr: float,
    material_id: Optional[str] = None
) -> ShelfLifePredictionResult:
    """
    Computes shelf-life across all degradation pathways and identifies the limiting factor.
    """
    req_days = inp.shelf_life_days
    temp_c = inp.temperature_c
    humidity_pct = inp.humidity_pct
    fat_pct = inp.fat_pct
    moisture_pct = inp.moisture_pct
    ph = inp.ph
    weight_g = inp.package_weight_g
    area_m2 = inp.package_surface_area_m2 or round(0.045 * ((weight_g / 250.0) ** (2.0 / 3.0)), 3)

    is_produce = "produce" in inp.category.lower() or inp.respiration_rate in ["Medium", "High"]
    is_frozen = inp.storage_type.lower() == "frozen" or temp_c <= -10.0
    aw = estimate_water_activity(inp.category, moisture_pct)
    erh_pct = aw * 100.0

    # Initial log CFU/g
    log_n0 = MICROBIAL_QUALITY_MAP.get(inp.initial_microbial_quality, 3.0)
    log_nspoil = 7.0  # standard sensory spoilage threshold log CFU/g

    # -------------------------------------------------------------
    # 1. MICROBIAL GROWTH KINETICS
    # -------------------------------------------------------------
    if is_frozen:
        # Frozen storage halts all microbial growth
        microbial_days = 999
    elif aw < 0.62:
        # Dry foods: microbial growth biologically impossible below aw 0.60
        microbial_days = 800
    else:
        # Ratkowsky square root growth rate model
        # sqrt(mu_max) = b * (T - T_min) * sqrt(aw - aw_min) * sqrt((pH - pH_min)/(7 - pH_min))
        t_min = -2.0  # psychrotrophic threshold
        t_eff = max(0.0, temp_c - t_min)
        aw_eff = max(0.0, aw - 0.60)
        ph_eff = max(0.0, (ph - 3.8) / 3.2) if ph > 3.8 else 0.0

        if ph_eff <= 0.05 or aw_eff <= 0.05 or t_eff <= 0.5:
            growth_rate = 0.005  # extremely slow / dormant
        else:
            # Calibrated Ratkowsky parameter for psychrotrophic and mesophilic spoilage organisms
            b = 0.22
            sqrt_mu = b * t_eff * math.sqrt(aw_eff) * math.sqrt(ph_eff)
            growth_rate = sqrt_mu ** 2  # ln(CFU)/day

        # MAP CO2 inhibition factor
        if "dairy" in inp.category.lower() or "meat" in inp.category.lower():
            # 20-30% CO2 in MAP reduces growth rate by ~40%
            growth_rate *= 0.60

        generation_time_days = math.log(2) / max(0.002, growth_rate)
        lag_time_days = generation_time_days * 1.8
        delta_log_n = max(0.5, log_nspoil - log_n0)
        microbial_days = max(2, round(lag_time_days + (delta_log_n * generation_time_days / math.log10(2))))

    # -------------------------------------------------------------
    # 2. LIPID OXIDATION KINETICS
    # -------------------------------------------------------------
    if fat_pct < 0.5:
        oxidation_days = 999
    else:
        fat_mass_g = (fat_pct / 100.0) * weight_g
        # Allowable oxygen uptake volume before hexanal / peroxide threshold
        if fat_pct >= 20.0:
            allowable_o2_per_g_fat = 0.75  # cc O2 / g fat
        elif fat_pct >= 5.0:
            allowable_o2_per_g_fat = 1.20
        else:
            allowable_o2_per_g_fat = 2.00

        critical_o2_vol = fat_mass_g * allowable_o2_per_g_fat

        # Oxygen flux into package: J_O2 = OTR * Area * delta_P_O2
        # If MAP gas flush (<0.5% residual O2), driving force is 0.21 atm
        delta_p_o2 = 0.21
        daily_o2_ingress = max(0.001, actual_otr * area_m2 * delta_p_o2)

        # Arrhenius temperature factor on oxidation reaction rate
        temp_accel = 2.0 ** ((temp_c - 20.0) / 10.0) if temp_c > 20 else max(0.4, 1.0 - (20 - temp_c) * 0.03)

        effective_daily_consumption = daily_o2_ingress * temp_accel
        oxidation_days = max(2, round(critical_o2_vol / effective_daily_consumption))

    # -------------------------------------------------------------
    # 3. MOISTURE SORPTION & DESICCATION KINETICS
    # -------------------------------------------------------------
    # Critical allowable moisture change
    cat_lower = inp.category.lower()
    if "snack" in cat_lower or "chip" in cat_lower:
        delta_m_pct = 1.8
    elif "bakery" in cat_lower or "biscuit" in cat_lower:
        delta_m_pct = 2.5
    elif "grain" in cat_lower or "cereal" in cat_lower or "powder" in cat_lower:
        delta_m_pct = 3.0
    elif is_produce:
        delta_m_pct = 5.0  # wilting threshold
    elif "dairy" in cat_lower or "meat" in cat_lower:
        delta_m_pct = 3.5
    else:
        delta_m_pct = 2.5

    critical_moisture_g = (delta_m_pct / 100.0) * weight_g

    # Moisture flux across packaging film:
    rh_gradient = max(5.0, abs(humidity_pct - erh_pct))
    p_sat_t = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
    p_sat_38 = 0.61078 * math.exp((17.27 * 38.0) / (38.0 + 237.3))
    vp_ratio = max(0.15, p_sat_t / p_sat_38)

    # Actual daily water transfer through barrier:
    daily_moisture_flux = max(0.001, (actual_wvtr * area_m2 * (rh_gradient / 90.0) * vp_ratio))
    moisture_days = max(2, round(critical_moisture_g / daily_moisture_flux))

    # -------------------------------------------------------------
    # 4. PRODUCE SENESCENCE KINETICS
    # -------------------------------------------------------------
    produce_days = 999
    if is_produce:
        # Fresh produce has a physiological baseline lifespan under optimal chilled conditions
        base_lifespan = 21 if "tomato" in inp.food_id.lower() else 35
        temp_decay = 2.2 ** ((temp_c - 10.0) / 10.0)
        produce_lifespan = max(3, round(base_lifespan / temp_decay))

        # Check for catastrophic anaerobic fermentation if film is hermetic
        if actual_otr < 1000.0:
            # Hermetic film suffocates respiring produce within 2-4 days!
            produce_days = 3
        else:
            produce_days = produce_lifespan

    # -------------------------------------------------------------
    # 5. COUPLED LIMITING FACTOR DETERMINATION
    # -------------------------------------------------------------
    pathways = {
        "Lipid Oxidation / Rancidity": oxidation_days,
        "Moisture Sorption / Staling": moisture_days,
        "Microbial Spoilage": microbial_days
    }
    if is_produce:
        pathways["Respiratory Senescence / Hypoxia"] = produce_days

    # Find the minimum (limiting) pathway
    limiting_factor, predicted_shelf_life = min(pathways.items(), key=lambda x: x[1])

    # Realistic physical ceiling (e.g. 540 days / 18 months for room ambient)
    predicted_shelf_life = min(540, predicted_shelf_life)

    target_achievable = predicted_shelf_life >= req_days
    safety_margin = predicted_shelf_life - req_days

    status_label = "✓ Target achievable" if target_achievable else "⚠ Target not met (early degradation)"

    ci_min = max(1, round(predicted_shelf_life * 0.90))
    ci_max = round(predicted_shelf_life * 1.12)

    disclaimer = (
        "Kinetic degradation simulation based on ASTM permeation and Arrhenius temperature dependency. "
        "Scientifically valid for comparative decision support. Production release requires validation "
        "with proper experimental/accelerated shelf-life testing (ASLT) data."
    )

    return ShelfLifePredictionResult(
        required_shelf_life_days=req_days,
        predicted_shelf_life_days=predicted_shelf_life,
        target_achievable=target_achievable,
        status_label=status_label,
        limiting_degradation_factor=limiting_factor,
        safety_margin_days=safety_margin,
        microbial_spoilage_days=min(540, microbial_days),
        lipid_oxidation_days=min(540, oxidation_days),
        moisture_staling_days=min(540, moisture_days),
        confidence_interval_days=[ci_min, ci_max],
        scientific_validation_disclaimer=disclaimer
    )
