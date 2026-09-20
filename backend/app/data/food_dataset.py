"""
Dataset Generator for Food Packaging Machine Learning.
Synthesizes scientific training data covering hundreds of food formulations,
environmental stress scenarios, and verified packaging suitability outcomes.
"""

import numpy as np
import pandas as pd
from typing import Tuple, List, Dict
from ..preprocessing import FEATURE_COLUMNS, RESPIRATION_MAP, TRANSPORT_MAP, BUDGET_MAP
from ..data.materials_data import PACKAGING_MATERIALS


def generate_training_dataset(n_samples: int = 1200, random_state: int = 42) -> Tuple[pd.DataFrame, pd.DataFrame]:
    """
    Generates realistic food preservation feature matrices X and multi-material suitability labels Y.
    Incorporates empirical food science guidelines:
    - High respiration produce -> breathable films required; hermetic foils cause anaerobic failure.
    - High fat, long shelf life snacks -> metallized / alu foil / EVOH required to prevent rancidity.
    - Moisture-sensitive dry goods -> low WVTR (PET/PE, HDPE, Metallized).
    - Chilled dairy/meat -> EVOH/PE, PET/PE for oxygen barrier and hygiene.
    - Short-turnover organic -> Bio-film or paper coated.
    """
    np.random.seed(random_state)
    records = []
    suitability_targets = []

    categories = [
        ("Fresh produce", (80.0, 96.0), (0.0, 1.5), (3.5, 6.5), "Chilled", (2.0, 15.0), ["Medium", "High"], (4, 30)),
        ("Crisp snacks", (1.0, 4.0), (20.0, 40.0), (5.5, 6.8), "Ambient", (18.0, 35.0), ["None", "Low"], (45, 180)),
        ("Bakery & Biscuits", (3.0, 9.0), (8.0, 24.0), (5.0, 7.0), "Ambient", (18.0, 30.0), ["None", "Low"], (30, 180)),
        ("Grains & Cereals", (9.0, 14.0), (1.0, 4.0), (6.0, 7.0), "Ambient", (15.0, 32.0), ["None", "Low"], (90, 365)),
        ("Chilled Dairy & Paneer", (45.0, 65.0), (15.0, 30.0), (5.0, 6.6), "Chilled", (2.0, 8.0), ["None", "Low"], (7, 45)),
        ("Fresh Meat & Poultry", (60.0, 75.0), (5.0, 25.0), (5.4, 6.2), "Chilled", (0.0, 6.0), ["None", "Low"], (5, 21)),
        ("Dry Powders & Spices", (2.0, 8.0), (2.0, 15.0), (5.0, 7.0), "Ambient", (18.0, 35.0), ["None"], (90, 365)),
        ("Frozen Foods", (50.0, 80.0), (5.0, 20.0), (5.0, 7.0), "Frozen", (-20.0, -10.0), ["None"], (60, 365)),
    ]

    material_keys = list(PACKAGING_MATERIALS.keys())

    for i in range(n_samples):
        # Pick category
        cat_meta = categories[i % len(categories)]
        cat_name, m_range, f_range, ph_range, storage, temp_range, resp_options, shelf_range = cat_meta

        moisture = np.random.uniform(*m_range)
        fat = np.random.uniform(*f_range)
        ph = np.random.uniform(*ph_range)
        temp = np.random.uniform(*temp_range)
        humidity = np.random.uniform(30.0, 85.0)
        shelf = int(np.random.uniform(*shelf_range))
        weight = float(np.random.choice([100, 200, 250, 400, 500, 1000]))
        respiration = np.random.choice(resp_options)
        transport = np.random.choice(["Normal", "Long distance", "Refrigerated", "High humidity"])
        budget = np.random.choice(["Low", "Medium", "High"])
        protection_pri = np.random.uniform(40, 100)
        sustainability_pri = np.random.uniform(20, 100)
        cost_pri = np.random.uniform(30, 100)

        # Derived physics
        if "produce" in cat_name.lower():
            aw = min(0.99, max(0.92, 0.90 + (moisture / 100.0) * 0.09))
            is_produce = 1.0
        elif "snack" in cat_name.lower():
            aw = min(0.35, max(0.08, moisture * 0.055))
            is_produce = 0.0
        elif "dairy" in cat_name.lower() or "meat" in cat_name.lower():
            aw = min(0.99, 0.85 + (moisture / 100.0) * 0.13)
            is_produce = 0.0
        else:
            aw = min(0.85, max(0.15, moisture * 0.05))
            is_produce = 0.0

        moisture_fat_ratio = moisture / (fat + 0.5)
        temp_factor = 1.0 + 0.04 * max(0.0, temp - 20.0)
        oxidation_risk_index = (fat / 100.0) * temp_factor * (shelf / 30.0)
        driving_rh = abs(humidity - (aw * 100.0))
        moisture_stress_index = (driving_rh / 100.0) * (shelf / 30.0)
        thermal_load = max(0.0, temp - 10.0) * (shelf / 10.0)

        resp_num = RESPIRATION_MAP.get(respiration, 0.0)
        is_frozen = 1.0 if storage == "Frozen" else 0.0
        is_chilled = 1.0 if storage == "Chilled" else 0.0
        trans_num = TRANSPORT_MAP.get(transport, 1.0)
        budget_num = BUDGET_MAP.get(budget, 2.0)

        row = {
            "moisture_pct": moisture,
            "fat_pct": fat,
            "ph": ph,
            "temperature_c": temp,
            "humidity_pct": humidity,
            "shelf_life_days": shelf,
            "package_weight_g": weight,
            "aw_estimated": aw,
            "moisture_fat_ratio": moisture_fat_ratio,
            "oxidation_risk_index": oxidation_risk_index,
            "moisture_stress_index": moisture_stress_index,
            "thermal_load": thermal_load,
            "respiration_level": resp_num,
            "is_produce": is_produce,
            "is_frozen": is_frozen,
            "is_chilled": is_chilled,
            "transport_stress_factor": trans_num,
            "budget_score": budget_num,
            "protection_priority": protection_pri,
            "sustainability_priority": sustainability_pri,
            "cost_priority": cost_pri
        }
        records.append(row)

        # Compute Ground Truth Suitability Probability for each material
        # Incorporating rigorous barrier match and food safety physics
        mat_suit = {}
        for mid in material_keys:
            score = 0.5  # baseline probability

            if is_produce == 1.0:
                # Produce requires breathability (EMAP)
                if mid == "breathable":
                    score += 0.45
                elif mid == "hdpe":
                    score += 0.05
                elif mid in ["alu-laminate", "metalized", "evoh-pe"]:
                    score -= 0.45  # Causes severe anaerobic fermentation
                elif mid == "bio-film":
                    score += 0.15 if shelf < 14 else -0.15
            else:
                # Non-produce
                if mid == "breathable":
                    score -= 0.40  # Staling & oxidation disaster for dry foods

                # High oxidation risk (high fat or long shelf life)
                if oxidation_risk_index > 0.8:
                    if mid in ["metalized", "alu-laminate", "evoh-pe"]:
                        score += 0.35
                    elif mid in ["hdpe", "bio-film", "paper-coated"]:
                        score -= 0.35

                # High moisture stress
                if moisture_stress_index > 1.2:
                    if mid in ["alu-laminate", "metalized", "pet-pe"]:
                        score += 0.25
                    elif mid in ["bio-film", "paper-coated"]:
                        score -= 0.30

                # Chilled/frozen meat or dairy
                if is_chilled or is_frozen:
                    if mid in ["evoh-pe", "pet-pe"]:
                        score += 0.30
                    elif mid == "paper-coated":
                        score -= 0.35

                # Low budget priority
                if budget == "Low":
                    if mid in ["hdpe", "pet-pe"]:
                        score += 0.15
                    elif mid in ["alu-laminate", "evoh-pe"]:
                        score -= 0.15

                # Sustainability priority
                if sustainability_pri > 75:
                    if mid in ["bio-film", "paper-coated", "hdpe"]:
                        score += 0.20
                    elif mid == "alu-laminate":
                        score -= 0.20

            # Clamp probability [0.05, 0.98]
            prob = max(0.05, min(0.98, score))
            mat_suit[f"suitability_{mid}"] = prob

        suitability_targets.append(mat_suit)

    df_x = pd.DataFrame(records, columns=FEATURE_COLUMNS)
    df_y = pd.DataFrame(suitability_targets)

    return df_x, df_y
