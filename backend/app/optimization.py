"""
Multi-Objective Optimization Engine for Packaging Selection and Material Gauge Sizing.

Incorporates:
- Real ASTM Barrier Verification (OTR, WVTR) and gauge thickness optimization.
- Real Cost Optimization:
  Material cost + Film thickness + Packaging area + Production cost + Transportation cost + Expected food loss
  Total cost = Packaging cost + Expected loss cost
- Real Quantitative Sustainability Indicator:
  Material weight + Recyclability + Recycled content + Renewable content +
  Packaging-to-product ratio (PPR) + Avoided food waste carbon credit + Net carbon footprint + End-of-life pathway
- Multi-Objective Pareto Optimization & Extraction of 4 Distinct Configurations:
  Option A → Maximum shelf life
  Option B → Lowest cost
  Option C → Higher sustainability
  Option D → Balanced solution (Pareto Compromise)
"""

import math
import numpy as np
from typing import Dict, Any, List, Tuple, Optional
from .schemas import (
    FoodInput,
    BarrierRequirement,
    OptimizedMaterialResult,
    MaterialBarrierCheck,
    ShelfLifePredictionResult,
    MAPGasRecommendation,
    CostBreakdown,
    SustainabilityIndicator,
    ParetoOptionItem
)
from .barrier_calc import evaluate_material_barrier
from .shelf_life_model import predict_shelf_life
from .map_optimizer import optimize_map_formulation
from .data.materials_data import PACKAGING_MATERIALS


def optimize_material_thickness(
    mat_id: str,
    req: BarrierRequirement,
    temperature_c: float,
    is_produce: bool
) -> Tuple[float, MaterialBarrierCheck]:
    """
    Finds the optimal minimum safe thickness within allowable manufacturing limits [t_min, t_max]
    that satisfies OTR and WVTR barrier thresholds, reducing unnecessary plastic use.
    """
    mat = PACKAGING_MATERIALS[mat_id]
    t_min, t_max = mat["thickness_range_um"]
    t_nom = float(mat["nominal_thickness_um"])

    if mat_id == "breathable":
        # For breathable films, perforations dictate barrier rather than film gauge
        opt_thickness = t_nom
    else:
        # Temperature factor
        temp_factor = math.exp(0.035 * (temperature_c - 23.0)) if temperature_c != 23.0 else 1.0

        # Required thickness to meet OTR: t >= t_nom * (nom_otr / req_otr) * temp_factor
        nom_otr = float(mat["nominal_otr"])
        nom_wvtr = float(mat["nominal_wvtr"])

        t_req_otr = t_nom * (nom_otr / req.target_otr_max) * temp_factor if req.target_otr_max > 0 else t_max
        t_req_wvtr = t_nom * (nom_wvtr / req.target_wvtr_max) * temp_factor if req.target_wvtr_max > 0 else t_max

        # Find safe thickness satisfying both constraints, with safety factor of 1.05
        t_target = max(t_req_otr, t_req_wvtr) * 1.05

        # Bound to realistic manufacturing thickness range
        opt_thickness = round(float(np.clip(t_target, t_min, t_max)), 1)

    # Re-evaluate barrier check at this optimal thickness
    barrier_check = evaluate_material_barrier(
        material_id=mat_id,
        thickness_um=opt_thickness,
        req=req,
        temperature_c=temperature_c,
        is_produce=is_produce
    )

    return opt_thickness, barrier_check


def determine_map_strategy(category: str, respiration: str, fat_pct: float) -> str:
    """Selects the optimal Modified Atmosphere Packaging (MAP) gas formulation."""
    cat = category.lower()
    if "produce" in cat or respiration in ["Medium", "High"]:
        return "Equilibrium MAP (EMAP): 3–5% O₂, 4–7% CO₂, balance N₂ (prevents hypoxia and mold)"
    elif fat_pct >= 20.0 or "snack" in cat or "chip" in cat:
        return "Hermetic Gas Flush: 99.5% N₂ (<0.5% residual O₂) to stop lipid rancidity"
    elif "dairy" in cat or "paneer" in cat or "cheese" in cat:
        return "Barrier Flush: 30% CO₂ (anti-microbial), 70% N₂ (prevents package collapse)"
    elif "bakery" in cat or "biscuit" in cat:
        return "Moisture Protection: 100% N₂ flush or ambient desiccant active packaging"
    elif "meat" in cat or "poultry" in cat:
        return "Protective MAP: 70% O₂ / 30% CO₂ (red meat bloom) or 20% CO₂ / 80% N₂ (poultry)"
    else:
        return "Standard Modified Atmosphere: 80% N₂ / 20% CO₂"


def calculate_real_cost_breakdown(
    inp: FoodInput,
    mat: Dict[str, Any],
    opt_thickness_um: float,
    area_m2: float,
    barrier_check: MaterialBarrierCheck,
    shelf_life_res: ShelfLifePredictionResult
) -> CostBreakdown:
    """
    Computes rigorous unit economics:
    Material cost + Film thickness + Packaging area + Production cost + Transportation cost + Expected food loss
    Total cost = Packaging cost + Expected loss cost
    """
    density = float(mat.get("density_g_cm3", 1.0))
    vol_m3 = area_m2 * (opt_thickness_um * 1e-6)
    film_weight_kg = vol_m3 * (density * 1000.0)

    # 1. Raw material resin cost ($/pack)
    resin_price_kg = float(mat.get("raw_resin_cost_per_kg", 2.20))
    raw_mat_cost = round(film_weight_kg * resin_price_kg, 4)

    # 2. Production conversion cost ($/pack) (extrusion, lamination, slitting, printing, micro-perf)
    conv_cost_m2 = float(mat.get("conversion_cost_per_m2", 0.15))
    prod_cost = round(area_m2 * conv_cost_m2, 4)

    # 3. Transportation cost ($/pack) (freight based on gross weight & cold chain)
    trans_rates = {
        "Refrigerated": 0.22,
        "Long distance": 0.18,
        "High humidity": 0.14,
        "Normal": 0.08
    }
    freight_rate = trans_rates.get(inp.transport_mode, 0.10)
    gross_pkg_kg = (inp.package_weight_g / 1000.0) + film_weight_kg
    transport_cost = round(gross_pkg_kg * freight_rate * 0.35, 4)

    # Packaging cost per pack: Material + Production + Transport
    packaging_cost = round(raw_mat_cost + prod_cost + transport_cost, 4)

    # 4. Food Commercial Value ($/pack)
    cat = inp.category.lower()
    if "dairy" in cat or "cheese" in cat or "paneer" in cat:
        base_val = 4.20
    elif "meat" in cat or "poultry" in cat:
        base_val = 6.50
    elif "snack" in cat or "chip" in cat:
        base_val = 2.10
    elif "produce" in cat:
        base_val = 2.60
    elif "bakery" in cat:
        base_val = 2.80
    else:
        base_val = 2.00
    food_val = round(base_val * (inp.package_weight_g / 250.0), 2)

    # 5. Spoilage Loss Probability P_loss (%)
    p_loss = 1.5  # baseline logistics loss
    if barrier_check.otr_status == "FAIL":
        p_loss += 18.0
    elif barrier_check.otr_status == "MARGINAL":
        p_loss += 6.0

    if barrier_check.wvtr_status == "FAIL":
        p_loss += 22.0
    elif barrier_check.wvtr_status == "MARGINAL":
        p_loss += 7.0

    # Shelf life deficit penalty
    if shelf_life_res.predicted_shelf_life_days < inp.shelf_life_days:
        deficit_pct = (inp.shelf_life_days - shelf_life_res.predicted_shelf_life_days) / max(1, inp.shelf_life_days)
        p_loss += min(40.0, deficit_pct * 55.0)

    # Mechanical puncture risk in long transit
    if inp.transport_mode == "Long distance" and mat.get("mechanical_strength", 4.0) < 3.8:
        p_loss += 3.5

    p_loss = round(min(80.0, max(1.2, p_loss)), 1)

    # Expected food loss cost: Spoilage Risk * Food Value
    expected_loss_cost = round((p_loss / 100.0) * food_val, 4)

    # Total cost = Packaging cost + Expected loss cost
    total_cost = round(packaging_cost + expected_loss_cost, 4)
    total_1000 = round(total_cost * 1000.0, 2)

    formula_label = f"Pkg (${packaging_cost:.3f}) + Expected Spoilage Loss (${expected_loss_cost:.3f}) = Total (${total_cost:.3f}/pack)"

    return CostBreakdown(
        raw_material_cost_per_pack=raw_mat_cost,
        film_thickness_um=opt_thickness_um,
        packaging_surface_area_m2=area_m2,
        production_conversion_cost_per_pack=prod_cost,
        transportation_cost_per_pack=transport_cost,
        packaging_cost_per_pack=packaging_cost,
        food_value_per_pack=food_val,
        spoilage_risk_pct=p_loss,
        expected_food_loss_cost_per_pack=expected_loss_cost,
        total_cost_per_pack=total_cost,
        total_cost_per_1000_packs=total_1000,
        cost_formula_label=formula_label
    )


def calculate_real_sustainability_indicator(
    inp: FoodInput,
    mat: Dict[str, Any],
    opt_thickness_um: float,
    area_m2: float,
    film_weight_g: float,
    barrier_check: MaterialBarrierCheck,
    cost_breakdown: CostBreakdown
) -> SustainabilityIndicator:
    """
    Computes rigorous circularity and life-cycle sustainability indicator:
    material weight, recyclability, recycled content, renewable content,
    packaging-to-product ratio (PPR), expected food waste avoided, and end-of-life pathway.
    """
    food_weight_g = max(10.0, inp.package_weight_g)
    ppr_pct = round((film_weight_g / food_weight_g) * 100.0, 2)

    recyclability_pct = float(mat.get("circularity_score", 50.0))
    pcr_pct = float(mat.get("recycled_content_pct", 0.0))
    renewable_pct = float(mat.get("renewable_content_pct", 0.0))
    eol_path = mat.get("end_of_life_pathway", "General Municipal Stream")

    # Embodied carbon of packaging film
    embodied_carbon = round((film_weight_g / 1000.0) * float(mat.get("embodied_carbon_kg_co2_per_kg", 2.5)) * 1000.0, 2)

    # Avoided Food Waste Carbon Credit (LCA)
    cat = inp.category.lower()
    lca_food_carbon = 3.8 if ("dairy" in cat or "cheese" in cat) else 12.0 if "meat" in cat else 1.9 if "produce" in cat else 2.4
    avoided_loss_fraction = max(0.0, (28.0 - cost_breakdown.spoilage_risk_pct) / 100.0)
    avoided_food_kg = (food_weight_g / 1000.0) * avoided_loss_fraction
    avoided_carbon = round(avoided_food_kg * lca_food_carbon * 1000.0, 2)

    # Net carbon footprint per pack
    net_carbon = round(embodied_carbon - avoided_carbon, 2)

    # Composite Sustainability Index (0 to 100)
    emb_score = max(0.0, 100.0 - (embodied_carbon * 4.5))
    ppr_score = max(0.0, 100.0 - (ppr_pct * 12.0))
    circular_feedstock_score = (pcr_pct * 0.5) + (renewable_pct * 0.5)
    waste_credit_score = min(100.0, (avoided_carbon / max(1.0, embodied_carbon)) * 25.0)

    raw_sust_index = (
        0.30 * recyclability_pct +
        0.25 * emb_score +
        0.15 * ppr_score +
        0.15 * circular_feedstock_score +
        0.15 * waste_credit_score
    )
    sust_index = round(float(np.clip(raw_sust_index, 12.0, 98.0)), 1)

    if sust_index >= 85.0:
        grade = "Grade A+ (Circular Leader)"
    elif sust_index >= 70.0:
        grade = "Grade A (High Circularity)"
    elif sust_index >= 52.0:
        grade = "Grade B (Moderate Recyclability)"
    elif sust_index >= 38.0:
        grade = "Grade C (Limited Circularity)"
    else:
        grade = "Grade D (Linear Stream / High Carbon)"

    summary = (
        f"{grade}: {recyclability_pct:.0f}% circularity rating, {film_weight_g:.1f}g packaging tare weight "
        f"({ppr_pct:.1f}% packaging-to-product ratio). Embodied footprint of {embodied_carbon:.1f}g CO₂e is offset by "
        f"{avoided_carbon:.1f}g CO₂e from avoided food spoilage (Net Carbon: {net_carbon:+.1f}g CO₂e/pack)."
    )

    return SustainabilityIndicator(
        material_weight_g_per_pack=film_weight_g,
        packaging_to_product_ratio_pct=ppr_pct,
        recyclability_score_pct=recyclability_pct,
        recycled_content_pct=pcr_pct,
        renewable_content_pct=renewable_pct,
        embodied_carbon_g_co2_per_pack=embodied_carbon,
        avoided_food_waste_carbon_g_co2=avoided_carbon,
        net_carbon_impact_g_co2_per_pack=net_carbon,
        end_of_life_pathway=eol_path,
        sustainability_index=sust_index,
        circularity_grade=grade,
        sustainability_summary=summary
    )


def run_multi_objective_optimization(
    inp: FoodInput,
    suitability_results: Dict[str, Dict[str, Any]],
    barrier_req: BarrierRequirement
) -> List[OptimizedMaterialResult]:
    """
    Executes constrained Pareto optimization incorporating real cost,
    real sustainability, barrier physics, and shelf-life prediction.
    """
    is_produce = "produce" in inp.category.lower() or inp.respiration_rate in ["Medium", "High"]
    temp_c = inp.temperature_c
    area_m2 = inp.package_surface_area_m2 or round(0.045 * ((inp.package_weight_g / 250.0) ** (2.0 / 3.0)), 3)

    w_prot = inp.protection_priority / 100.0
    w_sust = inp.sustainability_priority / 100.0
    w_cost = inp.cost_priority / 100.0
    w_sum = max(0.01, w_prot + w_sust + w_cost)

    nw_prot = w_prot / w_sum
    nw_sust = w_sust / w_sum
    nw_cost = w_cost / w_sum

    ranked_list = []

    for mat_id, suit in suitability_results.items():
        mat = PACKAGING_MATERIALS[mat_id]

        # 1. Optimize gauge thickness
        opt_thickness, barrier_check = optimize_material_thickness(
            mat_id=mat_id,
            req=barrier_req,
            temperature_c=temp_c,
            is_produce=is_produce
        )

        density = float(mat.get("density_g_cm3", 1.0))
        vol_m3 = area_m2 * (opt_thickness * 1e-6)
        mass_kg = vol_m3 * (density * 1000.0)
        film_weight_g = round(mass_kg * 1000.0, 2)
        carbon_g = round(mass_kg * float(mat["embodied_carbon_kg_co2_per_kg"]) * 1000.0, 2)
        thickness_ratio = opt_thickness / float(mat["nominal_thickness_um"])
        est_cost_m2 = round(float(mat["base_cost_per_m2"]) * (0.8 + 0.2 * thickness_ratio), 3)

        # 2. Compute real kinetic shelf-life prediction
        shelf_life_res = predict_shelf_life(
            inp=inp,
            actual_otr=barrier_check.actual_otr,
            actual_wvtr=barrier_check.actual_wvtr,
            material_id=mat_id
        )

        # 3. Compute Real Cost Optimization Breakdown
        cost_breakdown = calculate_real_cost_breakdown(
            inp=inp,
            mat=mat,
            opt_thickness_um=opt_thickness,
            area_m2=area_m2,
            barrier_check=barrier_check,
            shelf_life_res=shelf_life_res
        )

        # 4. Compute Real Sustainability & Circularity Indicator
        sustainability_indicator = calculate_real_sustainability_indicator(
            inp=inp,
            mat=mat,
            opt_thickness_um=opt_thickness,
            area_m2=area_m2,
            film_weight_g=film_weight_g,
            barrier_check=barrier_check,
            cost_breakdown=cost_breakdown
        )

        # 5. Scientific MAP gas formulation
        map_gas_mix = optimize_map_formulation(
            inp=inp,
            material_id=mat_id,
            actual_otr=barrier_check.actual_otr
        )

        # 6. Multi-Objective Pareto Aggregation
        prot_component = suit["feasibility_score"]  # 0 to 100
        sust_component = sustainability_indicator.sustainability_index
        # Normalized economic cost score (lower total cost -> higher score)
        cost_component = max(5.0, min(98.0, 100.0 - (cost_breakdown.total_cost_per_pack * 120.0)))

        penalty = 0.0
        if suit["disallowed_reasons"]:
            penalty += 70.0
        elif barrier_check.overall_barrier_status == "FAIL":
            penalty += 45.0
        elif barrier_check.overall_barrier_status == "MARGINAL":
            penalty += 15.0

        if inp.transport_mode == "Long distance" and mat.get("mechanical_strength", 4.0) < 4.0:
            penalty += 10.0

        raw_score = (
            nw_prot * prot_component +
            nw_sust * sust_component +
            nw_cost * cost_component
        ) - penalty

        overall_score = round(float(np.clip(raw_score, 5.0, 99.0)), 1)

        # Strengths and Risks
        strengths = []
        risks = []

        if barrier_check.overall_barrier_status == "PASS":
            strengths.append(f"Verified barrier compliance at optimized {opt_thickness} µm gauge")
        if sustainability_indicator.sustainability_index >= 75.0:
            strengths.append(f"High circularity ({sustainability_indicator.circularity_grade})")
        if cost_breakdown.total_cost_per_pack <= 0.15:
            strengths.append(f"Low total cost (${cost_breakdown.total_cost_per_pack:.3f}/pack including food loss)")
        if mat.get("mechanical_strength", 4.0) >= 4.5:
            strengths.append("High puncture and tensile resistance for rough logistics")

        if barrier_check.otr_status == "FAIL":
            risks.append(f"OTR ({barrier_check.actual_otr} cc) fails required barrier")
        if barrier_check.wvtr_status == "FAIL":
            risks.append(f"WVTR ({barrier_check.actual_wvtr} g) fails moisture threshold")
        if suit["disallowed_reasons"]:
            risks.extend(suit["disallowed_reasons"])
        if sustainability_indicator.sustainability_index <= 35.0:
            risks.append("Linear lifecycle / hard-to-recycle multi-layer stream")

        map_strat = determine_map_strategy(inp.category, inp.respiration_rate, inp.fat_pct)

        ranked_list.append(OptimizedMaterialResult(
            material_id=mat_id,
            name=mat["name"],
            short_name=mat["short"],
            category=mat["category"],
            rank=0,
            overall_score=overall_score,
            ml_suitability_score=round(suit["feasibility_score"], 1),
            barrier_check=barrier_check,
            recommended_thickness_um=opt_thickness,
            thickness_range_um=[float(mat["thickness_range_um"][0]), float(mat["thickness_range_um"][1])],
            estimated_cost_per_m2=est_cost_m2,
            carbon_footprint_g_co2_per_pack=carbon_g,
            recyclability_class=mat["recyclability_class"],
            map_recommendation=map_strat,
            shelf_life_prediction=shelf_life_res,
            map_gas_mix=map_gas_mix,
            cost_breakdown=cost_breakdown,
            sustainability_indicator=sustainability_indicator,
            key_strengths=strengths if strengths else ["Baseline food contact compliance"],
            potential_risks=risks if risks else ["No critical barrier violations observed"]
        ))

    # Sort by overall Pareto score descending
    ranked_list.sort(key=lambda x: x.overall_score, reverse=True)
    for idx, item in enumerate(ranked_list):
        item.rank = idx + 1

    return ranked_list


def extract_pareto_options(ranked_materials: List[OptimizedMaterialResult], inp: FoodInput) -> List[ParetoOptionItem]:
    """
    Extracts the 4 distinct Pareto-optimal configurations from the candidate pool:
    - Option A: Maximum Shelf Life (Maximum barrier longevity)
    - Option B: Lowest Total Cost (Optimal economic total cost per unit)
    - Option C: Highest Sustainability (Maximum circularity & lowest footprint)
    - Option D: Balanced Solution (Pareto compromise matching user priorities)
    """
    if not ranked_materials:
        return []

    # Option D: Balanced solution is always the multi-objective highest ranked result
    balanced = ranked_materials[0]

    # Valid pool preferring materials that pass barrier checks
    viable_pool = [m for m in ranked_materials if m.barrier_check.overall_barrier_status != "FAIL"]
    if not viable_pool:
        viable_pool = ranked_materials

    # Option A: Maximum shelf life
    opt_a_mat = max(viable_pool, key=lambda m: (m.shelf_life_prediction.predicted_shelf_life_days if m.shelf_life_prediction else 0, m.overall_score))

    # Option B: Lowest total cost (minimizes packaging cost + expected food loss)
    opt_b_mat = min(viable_pool, key=lambda m: (m.cost_breakdown.total_cost_per_pack if m.cost_breakdown else 999.0, -m.overall_score))

    # Option C: Highest sustainability (maximizes circularity & sustainability index among viable options)
    opt_c_mat = max(viable_pool, key=lambda m: (m.sustainability_indicator.sustainability_index if m.sustainability_indicator else 0, m.overall_score))

    def make_pareto_item(opt_id: str, title: str, focus: str, mat: OptimizedMaterialResult, tradeoff: str) -> ParetoOptionItem:
        sl_days = mat.shelf_life_prediction.predicted_shelf_life_days if mat.shelf_life_prediction else inp.shelf_life_days
        pkg_cost = mat.cost_breakdown.packaging_cost_per_pack if mat.cost_breakdown else mat.estimated_cost_per_m2 * 0.08
        loss_cost = mat.cost_breakdown.expected_food_loss_cost_per_pack if mat.cost_breakdown else 0.05
        tot_cost = mat.cost_breakdown.total_cost_per_pack if mat.cost_breakdown else pkg_cost + loss_cost
        sust_idx = mat.sustainability_indicator.sustainability_index if mat.sustainability_indicator else 50.0

        return ParetoOptionItem(
            option_id=opt_id,
            option_title=title,
            focus=focus,
            material_id=mat.material_id,
            material_name=mat.name,
            overall_score=mat.overall_score,
            shelf_life_days=sl_days,
            packaging_cost_per_pack=round(pkg_cost, 3),
            expected_loss_cost_per_pack=round(loss_cost, 3),
            total_cost_per_pack=round(tot_cost, 3),
            sustainability_index=sust_idx,
            carbon_footprint_g=mat.carbon_footprint_g_co2_per_pack,
            recyclability_class=mat.recyclability_class,
            tradeoff_summary=tradeoff
        )

    options = [
        make_pareto_item(
            "option_a",
            "Option A → Maximum Shelf Life",
            "Longevity & Extreme Barrier Protection",
            opt_a_mat,
            f"Delivers maximum product longevity of {opt_a_mat.shelf_life_prediction.predicted_shelf_life_days if opt_a_mat.shelf_life_prediction else 'N/A'} days. "
            f"Prioritizes near-zero gas/moisture transmission, ideal for long-distance export or extended supply chains."
        ),
        make_pareto_item(
            "option_b",
            "Option B → Lowest Total Cost",
            "Economic Total Cost Optimization",
            opt_b_mat,
            f"Minimizes total economic burden to ${opt_b_mat.cost_breakdown.total_cost_per_pack:.3f}/pack "
            f"(Packaging: ${opt_b_mat.cost_breakdown.packaging_cost_per_pack:.3f} + Expected Spoilage Loss: ${opt_b_mat.cost_breakdown.expected_food_loss_cost_per_pack:.3f}). "
            f"Optimized gauge thickness reduces raw material expense while controlling risk."
        ),
        make_pareto_item(
            "option_c",
            "Option C → Higher Sustainability",
            "Circularity & Low Embodied Carbon",
            opt_c_mat,
            f"Achieves highest circularity rating ({opt_c_mat.sustainability_indicator.sustainability_index:.0f}/100 Sustainability Index) "
            f"via {opt_c_mat.recyclability_class}. Designed for brand eco-commitments and packaging waste directive compliance."
        ),
        make_pareto_item(
            "option_d",
            "Option D → Balanced Solution",
            "Pareto-Optimal Compromise (Recommended)",
            balanced,
            f"Multi-objective Pareto-optimal trade-off matching user priorities: {balanced.shelf_life_prediction.predicted_shelf_life_days if balanced.shelf_life_prediction else 'N/A'} days shelf life, "
            f"${balanced.cost_breakdown.total_cost_per_pack:.3f}/pack total cost, and {balanced.sustainability_indicator.sustainability_index:.0f}/100 sustainability index."
        )
    ]
    return options
