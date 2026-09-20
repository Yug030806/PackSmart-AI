"""
Scientific Modified Atmosphere Packaging (MAP) Optimization Engine.
Calculates exact initial flush gas formulation and steady-state equilibrium headspace:
O2 = xx %, CO2 = xx %, N2 = xx %
Incorporates produce respiration kinetics, beta permselectivity ratio,
package headspace sizing, and gas dissolution collapse risk.
"""

import math
from typing import Dict, Any, Optional
from .schemas import FoodInput, MAPGasRecommendation
from .data.materials_data import PACKAGING_MATERIALS


def optimize_map_formulation(
    inp: FoodInput,
    material_id: str,
    actual_otr: float,
    headspace_ratio: float = 2.0
) -> MAPGasRecommendation:
    """
    Computes optimal gas concentrations (O2 %, CO2 %, N2 %) and packaging headspace parameters.
    """
    cat_lower = inp.category.lower()
    is_produce = "produce" in cat_lower or inp.respiration_rate in ["Medium", "High"]
    weight_g = inp.package_weight_g
    area_m2 = inp.package_surface_area_m2 or round(0.045 * ((weight_g / 250.0) ** (2.0 / 3.0)), 3)
    temp_c = inp.temperature_c

    # Density approximation (g/cm3)
    density = 0.95 if is_produce else 0.45 if ("snack" in cat_lower or "chip" in cat_lower) else 1.05
    food_volume_cc = weight_g / density
    headspace_volume_cc = round(food_volume_cc * headspace_ratio, 1)

    # -------------------------------------------------------------
    # 1. FRESH PRODUCE — EQUILIBRIUM MAP (EMAP)
    # -------------------------------------------------------------
    if is_produce:
        # Respiration kinetics:
        # Arrhenius Q10 ~ 2.2 for produce respiration
        q10 = 2.2
        t_ref = 10.0
        t_factor = q10 ** ((temp_c - t_ref) / 10.0)

        base_respiration_rates = {
            "Low": 8.0,      # apples, potatoes
            "Medium": 20.0,  # tomatoes, peaches
            "High": 55.0,    # mushrooms, broccoli
            "None": 8.0
        }
        r_o2_base = base_respiration_rates.get(inp.respiration_rate, 20.0)
        r_o2_actual = max(2.0, r_o2_base * t_factor)  # ml/(kg·hr)

        produce_kg = weight_g / 1000.0
        daily_o2_consumed = round(r_o2_actual * produce_kg * 24.0, 1)  # cc O2 / day

        # Respiratory Quotient (RQ = CO2 produced / O2 consumed)
        rq = 0.95
        daily_co2_generated = round(daily_o2_consumed * rq, 1)  # cc CO2 / day

        # Film Permselectivity:
        # For micro-perforated breathable film: Knudsen/Poiseuille flow beta = P_CO2 / P_O2 ~ 0.90
        # For continuous film: beta ~ 4.0
        is_breathable = (material_id == "breathable" or actual_otr > 5000.0)
        beta_permselectivity = 0.92 if is_breathable else 4.2
        actual_co2tr = actual_otr * beta_permselectivity

        # Steady-state Equilibrium Gas Concentrations (EMAP):
        # Permeation = Respiration Consumption
        # J_O2 = OTR * Area * (0.209 - y_O2) = daily_o2_consumed
        # y_O2 = 0.209 - (daily_o2_consumed / (OTR * Area))
        delta_y_o2 = daily_o2_consumed / max(1.0, actual_otr * area_m2)
        eq_o2_pct = max(1.5, min(19.0, (0.209 - delta_y_o2) * 100.0))

        # J_CO2 = CO2TR * Area * (y_CO2 - 0) = daily_co2_generated
        # y_CO2 = daily_co2_generated / (CO2TR * Area)
        delta_y_co2 = daily_co2_generated / max(1.0, actual_co2tr * area_m2)
        eq_co2_pct = max(0.5, min(18.0, delta_y_co2 * 100.0))

        eq_n2_pct = max(65.0, 100.0 - eq_o2_pct - eq_co2_pct)

        # Initial Flush Gas Formulation:
        # Rapidly establishes target equilibrium (3-5% O2, 4-6% CO2, balance N2) without lag
        init_o2 = 3.5
        init_co2 = 5.0
        init_n2 = round(100.0 - init_o2 - init_co2, 1)

        mechanism = (
            f"Equilibrium Modified Atmosphere Packaging (EMAP): Balances active produce respiration "
            f"({daily_o2_consumed:.1f} cc O₂/day consumed, {daily_co2_generated:.1f} cc CO₂/day produced at {temp_c}°C) "
            f"with film gas transmission. Maintains 3–5% O₂ to avoid anaerobic ethanol fermentation, "
            f"and 4–6% CO₂ to delay chlorophyll breakdown and ethylene synthesis."
        )

        return MAPGasRecommendation(
            initial_flush_o2_pct=init_o2,
            initial_flush_co2_pct=init_co2,
            initial_flush_n2_pct=init_n2,
            equilibrium_headspace_o2_pct=round(eq_o2_pct, 1),
            equilibrium_headspace_co2_pct=round(eq_co2_pct, 1),
            equilibrium_headspace_n2_pct=round(eq_n2_pct, 1),
            gas_headspace_ratio=headspace_ratio,
            headspace_volume_cc=headspace_volume_cc,
            o2_consumption_cc_day=daily_o2_consumed,
            co2_generation_cc_day=daily_co2_generated,
            respiratory_quotient=rq,
            gas_mixture_label=f"O₂: {init_o2}% | CO₂: {init_co2}% | N₂: {init_n2}% (Equilibrium: {round(eq_o2_pct,1)}% O₂ / {round(eq_co2_pct,1)}% CO₂)",
            preservation_mechanism=mechanism,
            package_collapse_risk="None (equilibrium gas exchange with atmosphere)"
        )

    # -------------------------------------------------------------
    # 2. CHILLED DAIRY & FRESH PANEER (Cheese, Paneer, Curd)
    # -------------------------------------------------------------
    elif "dairy" in cat_lower or "paneer" in cat_lower or "cheese" in cat_lower:
        init_o2 = 0.1
        init_co2 = 30.0
        init_n2 = 69.9

        mechanism = (
            f"Bacteriostatic Chilled MAP (30% CO₂ / 70% N₂): Carbon dioxide dissolves into aqueous phase "
            f"forming carbonic acid (H₂CO₃), decreasing surface pH and inhibiting psychrotrophic bacteria "
            f"(Pseudomonas, coliforms). 70% N₂ acts as insoluble filler gas to prevent package collapse."
        )

        return MAPGasRecommendation(
            initial_flush_o2_pct=init_o2,
            initial_flush_co2_pct=init_co2,
            initial_flush_n2_pct=init_n2,
            equilibrium_headspace_o2_pct=init_o2,
            equilibrium_headspace_co2_pct=22.0,  # ~8% dissolves into water phase
            equilibrium_headspace_n2_pct=77.9,
            gas_headspace_ratio=headspace_ratio,
            headspace_volume_cc=headspace_volume_cc,
            o2_consumption_cc_day=None,
            co2_generation_cc_day=None,
            respiratory_quotient=None,
            gas_mixture_label=f"O₂: 0% | CO₂: 30% | N₂: 70% (Bacteriostatic Flush)",
            preservation_mechanism=mechanism,
            package_collapse_risk="Moderate (CO₂ dissolution in water phase buffered by 70% N₂)"
        )

    # -------------------------------------------------------------
    # 3. HIGH FAT / CRISP SNACKS & DRY BAKERY (Chips, Biscuits, Nuts)
    # -------------------------------------------------------------
    elif inp.fat_pct >= 10.0 or "snack" in cat_lower or "chip" in cat_lower or "biscuit" in cat_lower:
        init_o2 = 0.2
        init_co2 = 0.0
        init_n2 = 99.8

        mechanism = (
            f"Hermetic Nitrogen Gas Flush (99.8% N₂): Displaces oxygen to residual level <0.5%, "
            f"halting the free-radical lipid oxidation cascade and hexanal formation in fats ({inp.fat_pct}%). "
            f"Inert nitrogen cushion ({headspace_volume_cc} cc) absorbs mechanical shock and prevents physical crushing."
        )

        return MAPGasRecommendation(
            initial_flush_o2_pct=init_o2,
            initial_flush_co2_pct=init_co2,
            initial_flush_n2_pct=init_n2,
            equilibrium_headspace_o2_pct=init_o2,
            equilibrium_headspace_co2_pct=init_co2,
            equilibrium_headspace_n2_pct=init_n2,
            gas_headspace_ratio=headspace_ratio,
            headspace_volume_cc=headspace_volume_cc,
            o2_consumption_cc_day=None,
            co2_generation_cc_day=None,
            respiratory_quotient=None,
            gas_mixture_label=f"O₂: <0.5% | CO₂: 0% | N₂: >99.5% (Hermetic Inert Cushion)",
            preservation_mechanism=mechanism,
            package_collapse_risk="None (Nitrogen is insoluble in lipid phase)"
        )

    # -------------------------------------------------------------
    # 4. FRESH MEAT & POULTRY
    # -------------------------------------------------------------
    elif "meat" in cat_lower or "poultry" in cat_lower or "beef" in cat_lower:
        is_red_meat = "poultry" not in cat_lower and "chicken" not in cat_lower
        if is_red_meat:
            init_o2 = 70.0
            init_co2 = 30.0
            init_n2 = 0.0
            label = "O₂: 70% | CO₂: 30% | N₂: 0% (High-Oxygen Bloom MAP)"
            mechanism = "High oxygen (70%) promotes oxygenated oxymyoglobin (bright red meat bloom), while 30% CO₂ suppresses aerobic spoilage bacteria."
        else:
            init_o2 = 0.5
            init_co2 = 30.0
            init_n2 = 69.5
            label = "O₂: <1% | CO₂: 30% | N₂: 70% (Anaerobic Poultry MAP)"
            mechanism = "Low oxygen prevents lipid oxidation and rancidity in dark poultry meat, while 30% CO₂ extends lag phase of psychrotrophs."

        return MAPGasRecommendation(
            initial_flush_o2_pct=init_o2,
            initial_flush_co2_pct=init_co2,
            initial_flush_n2_pct=init_n2,
            equilibrium_headspace_o2_pct=init_o2,
            equilibrium_headspace_co2_pct=init_co2,
            equilibrium_headspace_n2_pct=init_n2,
            gas_headspace_ratio=headspace_ratio,
            headspace_volume_cc=headspace_volume_cc,
            o2_consumption_cc_day=None,
            co2_generation_cc_day=None,
            respiratory_quotient=None,
            gas_mixture_label=label,
            preservation_mechanism=mechanism,
            package_collapse_risk="Low to Moderate"
        )

    # -------------------------------------------------------------
    # 5. DRY GRAINS, POWDERS, GENERAL DRY FOODS
    # -------------------------------------------------------------
    else:
        init_o2 = 1.0
        init_co2 = 0.0
        init_n2 = 99.0

        return MAPGasRecommendation(
            initial_flush_o2_pct=init_o2,
            initial_flush_co2_pct=init_co2,
            initial_flush_n2_pct=init_n2,
            equilibrium_headspace_o2_pct=init_o2,
            equilibrium_headspace_co2_pct=init_co2,
            equilibrium_headspace_n2_pct=init_n2,
            gas_headspace_ratio=headspace_ratio,
            headspace_volume_cc=headspace_volume_cc,
            o2_consumption_cc_day=None,
            co2_generation_cc_day=None,
            respiratory_quotient=None,
            gas_mixture_label="O₂: <1% | CO₂: 0% | N₂: 99% (Standard Inert Flush)",
            preservation_mechanism="Oxygen reduction prevents insect infestation and oxidative staling in dry shelf-stable goods.",
            package_collapse_risk="None"
        )
