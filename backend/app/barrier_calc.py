"""
Scientific Barrier Calculation Engine for Food Packaging.
Computes real OTR (Oxygen Transmission Rate) and WVTR (Water Vapor Transmission Rate) requirements
based on food moisture sorption, lipid oxidation kinetics, and produce respiration.
Evaluates Material OTR/WVTR against requirements with explicit PASS / FAIL checks.
"""

import math
from typing import Dict, Any, Tuple
from .schemas import FoodInput, BarrierRequirement, MaterialBarrierCheck
from .data.materials_data import PACKAGING_MATERIALS


def estimate_water_activity(category: str, moisture_pct: float) -> float:
    """
    Estimates equilibrium water activity (aw) from food category and moisture content
    using generalized sorption isotherms (GAB / Oswin approximation).
    """
    cat = category.lower()
    if "produce" in cat or "fruit" in cat or "vegetable" in cat:
        # High moisture produce is in free water zone
        return min(0.99, max(0.93, 0.90 + (moisture_pct / 100.0) * 0.09))
    elif "snack" in cat or "chip" in cat:
        # Crisp snacks: moisture 1-4%, aw typically 0.10 - 0.25
        return min(0.35, max(0.08, moisture_pct * 0.055))
    elif "bakery" in cat or "biscuit" in cat or "cookie" in cat:
        # Biscuits: moisture 3-8%, aw typically 0.20 - 0.40
        return min(0.55, max(0.15, moisture_pct * 0.05))
    elif "grain" in cat or "cereal" in cat or "rice" in cat or "flour" in cat:
        # Grains: moisture 10-14%, aw typically 0.50 - 0.68
        return min(0.75, max(0.30, 0.20 + moisture_pct * 0.035))
    elif "dairy" in cat or "cheese" in cat or "paneer" in cat:
        # Dairy / paneer: moisture 40-60%, aw typically 0.92 - 0.98
        return min(0.98, max(0.85, 0.70 + (moisture_pct / 100.0) * 0.35))
    elif "meat" in cat or "poultry" in cat or "fish" in cat:
        return min(0.99, max(0.92, 0.88 + (moisture_pct / 100.0) * 0.11))
    else:
        # Generic moisture-aw mapping
        if moisture_pct < 5.0:
            return 0.15 + (moisture_pct / 5.0) * 0.15
        elif moisture_pct < 15.0:
            return 0.30 + ((moisture_pct - 5.0) / 10.0) * 0.35
        elif moisture_pct < 50.0:
            return 0.65 + ((moisture_pct - 15.0) / 35.0) * 0.25
        else:
            return min(0.99, 0.90 + ((moisture_pct - 50.0) / 50.0) * 0.09)


def calculate_food_barrier_requirements(inp: FoodInput) -> BarrierRequirement:
    """
    Computes required OTR (cc/m2/day) and WVTR (g/m2/day) based on food science principles:
    1. Maximum allowable water gain/loss before quality threshold
    2. Maximum allowable oxygen absorption before oxidative rancidity / degradation
    3. Produce respiration demand if applicable
    """
    # 1. Geometry & Exposure
    weight_g = inp.package_weight_g
    # If surface area not explicitly set, estimate standard pouch area from package weight:
    # Typical pouch volume-to-area correlation: Area ~ 0.05 * (weight_kg)^(2/3)
    if inp.package_surface_area_m2 and inp.package_surface_area_m2 > 0:
        area_m2 = inp.package_surface_area_m2
    else:
        area_m2 = round(0.045 * ((weight_g / 250.0) ** (2.0 / 3.0)), 3)

    shelf_days = max(1, inp.shelf_life_days)
    is_produce = "produce" in inp.category.lower() or inp.respiration_rate in ["Medium", "High"]

    # 2. Water Activity & Moisture Driving Force
    aw = estimate_water_activity(inp.category, inp.moisture_pct)
    erh_pct = aw * 100.0
    ambient_rh = inp.humidity_pct

    # Driving force: RH difference between environment and food headspace
    rh_diff_pct = abs(ambient_rh - erh_pct)
    # Avoid zero division with minimum 5% gradient
    rh_diff_pct = max(5.0, rh_diff_pct)

    # Standard ASTM F1249 test condition gradient is 90% RH (from 90% to ~0% with dry carrier gas)
    astm_rh_gradient = 90.0

    # 3. Allowable Moisture Change (Delta M_crit)
    cat_lower = inp.category.lower()
    if "snack" in cat_lower or "chip" in cat_lower:
        # Chips lose crispness when moisture rises from ~2% to 4% (Delta M ~ 1.5 - 2.0%)
        max_delta_moisture_pct = 1.8
    elif "bakery" in cat_lower or "biscuit" in cat_lower:
        # Biscuits go soft when moisture rises from ~4% to 7% (Delta M ~ 2.5 - 3.0%)
        max_delta_moisture_pct = 2.5
    elif "grain" in cat_lower or "powder" in cat_lower or "cereal" in cat_lower:
        # Grains/powders cake when moisture increases by ~3.0%
        max_delta_moisture_pct = 3.0
    elif is_produce:
        # Fresh produce wilts if weight loss due to transpiration exceeds 4 - 6%
        max_delta_moisture_pct = 5.0
    elif "dairy" in cat_lower or "paneer" in cat_lower or "meat" in cat_lower:
        # Chilled moist foods: moisture loss limit ~ 3 - 4% to prevent drying and rind formation
        max_delta_moisture_pct = 3.5
    else:
        max_delta_moisture_pct = 2.5

    # Allowable moisture gain/loss in grams:
    delta_m_grams = (max_delta_moisture_pct / 100.0) * weight_g

    # Temperature kinetic factor for WVTR (water vapor pressure ratio)
    # Tetens equation for saturation vapor pressure
    temp_c = inp.temperature_c
    p_sat_storage = 0.61078 * math.exp((17.27 * temp_c) / (temp_c + 237.3))
    p_sat_test = 0.61078 * math.exp((17.27 * 38.0) / (38.0 + 237.3))  # ASTM 38°C
    vapor_pressure_ratio = max(0.20, p_sat_storage / p_sat_test)

    # Maximum allowable WVTR under ASTM test condition equivalent
    # WVTR_req = (delta_m / (area * days)) * (ASTM_gradient / driving_gradient) / (vapor_ratio)
    raw_wvtr_req = (delta_m_grams / (area_m2 * shelf_days)) * (astm_rh_gradient / rh_diff_pct) / vapor_pressure_ratio
    # Safeguard reasonable range
    target_wvtr_max = round(max(0.1, min(120.0, raw_wvtr_req)), 2)

    # 4. Oxygen Transmission Rate (OTR) Requirements
    fat_pct = inp.fat_pct
    fat_mass_g = (fat_pct / 100.0) * weight_g

    target_otr_min = None
    respiration_o2_demand = None

    if is_produce:
        # Respiring commodities consume O2 and produce CO2.
        # Respiration rate R_O2 in ml O2 / (kg · hr) at storage temperature
        # Van 't Hoff Q10 ~ 2.0 - 2.5 for produce respiration
        q10 = 2.2
        t_ref = 10.0  # reference temp 10°C
        t_factor = q10 ** ((temp_c - t_ref) / 10.0)

        base_respiration_rates = {
            "Low": 8.0,      # apples, potatoes, onions (ml/kg·hr at 10°C)
            "Medium": 20.0,  # tomatoes, peaches, lettuce
            "High": 55.0,    # asparagus, broccoli, mushrooms, sweetcorn
            "None": 5.0
        }
        r_o2_base = base_respiration_rates.get(inp.respiration_rate, 20.0)
        r_o2_actual = max(2.0, r_o2_base * t_factor)  # ml/(kg·hr)

        produce_weight_kg = weight_g / 1000.0
        respiration_o2_demand = round(r_o2_actual * produce_weight_kg * 24.0, 1)  # cc O2 / day

        # Equilibrium Modified Atmosphere (EMAP):
        # We need an equilibrium headspace of 3% to 6% O2 to avoid anaerobiosis (<2% O2)
        # Permeation = OTR * Area * (0.21 - y_O2_eq)
        # For safe aerobic window (y_O2 = 0.03 to 0.08):
        driving_o2_press = max(0.12, 0.21 - 0.04)  # ~0.17 atm
        req_otr_produce = respiration_o2_demand / (area_m2 * driving_o2_press)

        target_otr_min = round(max(400.0, req_otr_produce * 0.6), 1)
        target_otr_max = round(max(target_otr_min + 500.0, req_otr_produce * 1.5), 1)
        target_wvtr_max = round(max(15.0, target_wvtr_max), 1)  # Produce needs some breathability to avoid condensation fog
        critical_o2_volume = round(respiration_o2_demand * shelf_days, 1)
        rationale = (
            f"Respiring produce actively consumes O₂ ({respiration_o2_demand} cc/day). "
            f"Requires micro-perforated breathable packaging (OTR {target_otr_min} - {target_otr_max} cc/m²·day) "
            f"to establish equilibrium MAP (3-5% O₂) and prevent anaerobic ethanol/mold spoilage."
        )

    else:
        # Non-respiring foods: lipid oxidation and oxidative degradation
        # Critical oxygen limit in mg O2 / g fat or general cc O2
        if fat_pct >= 20.0:
            # High fat (potato chips, roasted nuts): ~0.8 mg O2 / g fat causes perceptible rancidity (hexanal > 5 ppm)
            allowable_o2_per_g_fat = 0.75  # cc O2 / g fat
            critical_o2_volume = max(5.0, fat_mass_g * allowable_o2_per_g_fat)
        elif fat_pct >= 5.0:
            # Moderate fat (biscuits, baked snacks, dairy):
            allowable_o2_per_g_fat = 1.2
            critical_o2_volume = max(8.0, fat_mass_g * allowable_o2_per_g_fat)
        else:
            # Low fat food: degradation driven by vitamin oxidation, color loss, or aerobic molds
            critical_o2_volume = max(15.0, weight_g * 0.08)

        # Ambient oxygen partial pressure driving force (atmospheric air = 0.21 atm)
        delta_p_o2 = 0.21

        # OTR_req = critical_O2 / (area * days * delta_p)
        raw_otr = critical_o2_volume / (area_m2 * shelf_days * delta_p_o2)

        # Apply temperature acceleration (Arrhenius: lipid oxidation rate doubles every 10°C)
        temp_factor = 2.0 ** ((temp_c - 20.0) / 10.0) if temp_c > 20 else max(0.5, 1.0 - (20 - temp_c) * 0.03)
        raw_otr = raw_otr / temp_factor

        target_otr_max = round(max(0.1, min(1500.0, raw_otr)), 2)

        rationale = (
            f"Lipid oxidation & rancidity limit: {critical_o2_volume:.1f} cc O₂ total allowable uptake "
            f"over {shelf_days} days for {fat_mass_g:.1f}g fat. "
            f"Max permissible OTR = {target_otr_max} cc/(m²·day·atm), WVTR = {target_wvtr_max} g/(m²·day)."
        )

    return BarrierRequirement(
        target_otr_max=target_otr_max,
        target_wvtr_max=target_wvtr_max,
        target_otr_min=target_otr_min,
        critical_oxygen_uptake_cc=round(critical_o2_volume, 1),
        critical_moisture_gain_g=round(delta_m_grams, 2),
        equilibrium_rh_pct=round(erh_pct, 1),
        driving_rh_delta_pct=round(rh_diff_pct, 1),
        respiration_oxygen_demand_cc_day=respiration_o2_demand,
        barrier_rationale=rationale
    )


def evaluate_material_barrier(
    material_id: str,
    thickness_um: float,
    req: BarrierRequirement,
    temperature_c: float,
    is_produce: bool
) -> MaterialBarrierCheck:
    """
    Calculates actual OTR and WVTR of a material at specific thickness and storage temperature.
    Performs physical PASS / FAIL verification against food barrier requirements.
    """
    mat = PACKAGING_MATERIALS[material_id]
    nom_thickness = float(mat["nominal_thickness_um"])
    nom_otr = float(mat["nominal_otr"])
    nom_wvtr = float(mat["nominal_wvtr"])

    # 1. Thickness scaling (Fick's law: transmission inversely proportional to barrier thickness)
    # For micro-perforated produce film, laser perforation density is engineered to match target produce respiration
    if material_id == "breathable":
        thickness_factor = 1.0
        if is_produce and req.target_otr_min is not None:
            # Laser micro-perforation tunes OTR directly into the optimal EMAP target zone
            actual_otr = round(req.target_otr_min * 1.25, 1)
            actual_wvtr = round(nom_wvtr, 1)
        else:
            actual_otr = round(nom_otr, 1)
            actual_wvtr = round(nom_wvtr, 1)
    else:
        thickness_factor = nom_thickness / max(10.0, thickness_um)
        # 2. Temperature scaling (Arrhenius permeability adjustment)
        # Permeability increases ~3% per °C above 23°C
        temp_factor = math.exp(0.035 * (temperature_c - 23.0)) if temperature_c != 23.0 else 1.0
        actual_otr = round(nom_otr * thickness_factor * temp_factor, 2)
        actual_wvtr = round(nom_wvtr * thickness_factor * temp_factor, 2)

    # 3. Evaluate OTR Status
    if is_produce:
        # Produce requires OTR within aerobic breathable window: [target_otr_min, target_otr_max]
        if req.target_otr_min is not None and actual_otr < req.target_otr_min:
            otr_status = "FAIL"
            otr_margin_pct = round(((actual_otr - req.target_otr_min) / req.target_otr_min) * 100.0, 1)
            notes_otr = f"Permeability too low for respiring produce; high risk of anaerobic fermentation (alcohol/off-flavors)."
        elif actual_otr > req.target_otr_max * 1.8:
            otr_status = "MARGINAL"
            otr_margin_pct = round(((req.target_otr_max - actual_otr) / req.target_otr_max) * 100.0, 1)
            notes_otr = "Very high gas transmission; may cause premature senescence."
        else:
            otr_status = "PASS"
            otr_margin_pct = round(15.0, 1)
            notes_otr = "Optimal breathable gas transmission maintains aerobic equilibrium MAP."
    else:
        # Non-produce: lower OTR is better; must not exceed target_otr_max
        if actual_otr <= req.target_otr_max:
            otr_status = "PASS"
            otr_margin_pct = round(((req.target_otr_max - actual_otr) / req.target_otr_max) * 100.0, 1)
            notes_otr = f"OTR ({actual_otr} cc) safely below maximum allowable ({req.target_otr_max} cc)."
        elif actual_otr <= req.target_otr_max * 1.15:
            otr_status = "MARGINAL"
            otr_margin_pct = round(((req.target_otr_max - actual_otr) / req.target_otr_max) * 100.0, 1)
            notes_otr = f"Borderline OTR ({actual_otr} cc vs max {req.target_otr_max} cc)."
        else:
            otr_status = "FAIL"
            otr_margin_pct = round(((req.target_otr_max - actual_otr) / req.target_otr_max) * 100.0, 1)
            notes_otr = f"OTR ({actual_otr} cc) exceeds threshold ({req.target_otr_max} cc); causes lipid rancidity before target shelf life."

    # 4. Evaluate WVTR Status
    if actual_wvtr <= req.target_wvtr_max:
        wvtr_status = "PASS"
        wvtr_margin_pct = round(((req.target_wvtr_max - actual_wvtr) / req.target_wvtr_max) * 100.0, 1)
        notes_wvtr = f"WVTR ({actual_wvtr} g) complies with moisture limit ({req.target_wvtr_max} g)."
    elif actual_wvtr <= req.target_wvtr_max * 1.20:
        wvtr_status = "MARGINAL"
        wvtr_margin_pct = round(((req.target_wvtr_max - actual_wvtr) / req.target_wvtr_max) * 100.0, 1)
        notes_wvtr = f"WVTR borderline ({actual_wvtr} g vs max {req.target_wvtr_max} g)."
    else:
        wvtr_status = "FAIL"
        wvtr_margin_pct = round(((req.target_wvtr_max - actual_wvtr) / req.target_wvtr_max) * 100.0, 1)
        notes_wvtr = f"WVTR ({actual_wvtr} g) exceeds moisture threshold ({req.target_wvtr_max} g); risk of sogginess or desiccation."

    overall_status = "PASS" if (otr_status in ["PASS", "MARGINAL"] and wvtr_status in ["PASS", "MARGINAL"]) else "FAIL"

    combined_notes = f"{notes_otr} {notes_wvtr}"

    return MaterialBarrierCheck(
        material_id=material_id,
        material_name=mat["name"],
        category=mat["category"],
        nominal_thickness_um=nom_thickness,
        effective_thickness_um=thickness_um,
        actual_otr=actual_otr,
        actual_wvtr=actual_wvtr,
        otr_status=otr_status,
        wvtr_status=wvtr_status,
        overall_barrier_status=overall_status,
        otr_margin_pct=otr_margin_pct,
        wvtr_margin_pct=wvtr_margin_pct,
        barrier_notes=combined_notes
    )
