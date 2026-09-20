"""
Data Preprocessing and Feature Engineering Pipeline using Pandas and NumPy.
Transforms raw User Input into machine learning feature matrices and scientific interaction terms.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple, List
from .schemas import FoodInput
from .barrier_calc import estimate_water_activity


FEATURE_COLUMNS = [
    "moisture_pct",
    "fat_pct",
    "ph",
    "temperature_c",
    "humidity_pct",
    "shelf_life_days",
    "package_weight_g",
    "aw_estimated",
    "moisture_fat_ratio",
    "oxidation_risk_index",
    "moisture_stress_index",
    "thermal_load",
    "respiration_level",
    "is_produce",
    "is_frozen",
    "is_chilled",
    "transport_stress_factor",
    "budget_score",
    "protection_priority",
    "sustainability_priority",
    "cost_priority"
]

RESPIRATION_MAP = {"None": 0.0, "Low": 1.0, "Medium": 2.0, "High": 3.0}
TRANSPORT_MAP = {"Normal": 1.0, "Refrigerated": 1.2, "High humidity": 1.5, "Long distance": 2.0}
BUDGET_MAP = {"Low": 1.0, "Medium": 2.0, "High": 3.0}


def extract_features_from_input(inp: FoodInput) -> pd.DataFrame:
    """
    Constructs a feature-engineered DataFrame from FoodInput.
    """
    moisture = float(inp.moisture_pct)
    fat = float(inp.fat_pct)
    temp = float(inp.temperature_c)
    humidity = float(inp.humidity_pct)
    shelf = float(inp.shelf_life_days)
    weight = float(inp.package_weight_g)

    # Derived scientific indices
    aw = estimate_water_activity(inp.category, moisture)
    moisture_fat_ratio = moisture / (fat + 0.5)

    # Oxidation Risk Index: accounts for lipid fraction, thermal acceleration, and exposure days
    temp_factor = 1.0 + 0.04 * max(0.0, temp - 20.0)
    oxidation_risk_index = (fat / 100.0) * temp_factor * (shelf / 30.0)

    # Moisture stress: driving humidity differential integrated over time
    driving_rh = abs(humidity - (aw * 100.0))
    moisture_stress_index = (driving_rh / 100.0) * (shelf / 30.0)

    # Thermal load
    thermal_load = max(0.0, temp - 10.0) * (shelf / 10.0)

    # Categorical encodings
    respiration_level = RESPIRATION_MAP.get(inp.respiration_rate, 0.0)
    is_produce = 1.0 if ("produce" in inp.category.lower() or respiration_level >= 2.0) else 0.0
    is_frozen = 1.0 if inp.storage_type.lower() == "frozen" else 0.0
    is_chilled = 1.0 if inp.storage_type.lower() == "chilled" else 0.0

    transport_stress = TRANSPORT_MAP.get(inp.transport_mode, 1.0)
    budget_score = BUDGET_MAP.get(inp.budget_level, 2.0)

    row = {
        "moisture_pct": moisture,
        "fat_pct": fat,
        "ph": float(inp.ph),
        "temperature_c": temp,
        "humidity_pct": humidity,
        "shelf_life_days": shelf,
        "package_weight_g": weight,
        "aw_estimated": aw,
        "moisture_fat_ratio": round(moisture_fat_ratio, 3),
        "oxidation_risk_index": round(oxidation_risk_index, 3),
        "moisture_stress_index": round(moisture_stress_index, 3),
        "thermal_load": round(thermal_load, 3),
        "respiration_level": respiration_level,
        "is_produce": is_produce,
        "is_frozen": is_frozen,
        "is_chilled": is_chilled,
        "transport_stress_factor": transport_stress,
        "budget_score": budget_score,
        "protection_priority": float(inp.protection_priority),
        "sustainability_priority": float(inp.sustainability_priority),
        "cost_priority": float(inp.cost_priority)
    }

    df = pd.DataFrame([row], columns=FEATURE_COLUMNS)
    return df
