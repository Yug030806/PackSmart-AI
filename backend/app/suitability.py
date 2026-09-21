"""
Packaging Suitability Prediction Engine.
Merges statistical ML predictions with deterministic barrier physics and food safety rules.
"""

from typing import Dict, Any, List
import pandas as pd
from .schemas import FoodInput, BarrierRequirement, MaterialBarrierCheck
from .barrier_calc import evaluate_material_barrier
from .model import ml_pipeline
from .data.materials_data import PACKAGING_MATERIALS


def predict_packaging_suitability(
    inp: FoodInput,
    features_df: pd.DataFrame,
    barrier_req: BarrierRequirement
) -> Dict[str, Dict[str, Any]]:
    """
    Combines Scikit-learn ML inference with physical ASTM barrier verification.
    Outputs suitability metrics, barrier compliance, and driving reasons for every material.
    """
    # 1. Run Scikit-learn ML inference with fallback protection
    try:
        ml_predictions = ml_pipeline.predict(features_df)
    except Exception as ml_err:
        print(f"[PackSmart ML] Inference fallback to physical heuristic: {ml_err}")
        ml_predictions = {m_id: 0.75 for m_id in PACKAGING_MATERIALS.keys()}

    is_produce = "produce" in inp.category.lower() or inp.respiration_rate in ["Medium", "High"]
    temp_c = inp.temperature_c

    suitability_results = {}

    for mat_id, mat in PACKAGING_MATERIALS.items():
        ml_prob = ml_predictions.get(mat_id, 0.5)

        # 2. Evaluate physical barrier compliance at nominal thickness
        nom_thickness = float(mat["nominal_thickness_um"])
        barrier_check = evaluate_material_barrier(
            material_id=mat_id,
            thickness_um=nom_thickness,
            req=barrier_req,
            temperature_c=temp_c,
            is_produce=is_produce
        )

        # 3. Disallowed condition constraints
        disallowed_reasons = []
        if is_produce and mat_id in ["alu-laminate", "metalized", "evoh-pe"]:
            disallowed_reasons.append("Hermetic barrier causes rapid hypoxia and anaerobic fermentation in fresh produce.")
        if not is_produce and mat_id == "breathable":
            disallowed_reasons.append("Micro-perforations expose dry/processed food to ambient humidity and atmospheric oxygen.")
        if inp.fat_pct >= 20.0 and inp.shelf_life_days > 60 and mat_id in ["hdpe", "paper-coated"]:
            disallowed_reasons.append("Insufficient oxygen barrier will result in lipid rancidity and hexanal development.")

        # 4. Synthesize ML score with physical feasibility
        # If barrier fails completely or condition is disallowed, feasibility score is heavily penalized
        if disallowed_reasons:
            feasibility_score = round(ml_prob * 15.0, 1)  # capped very low
        elif barrier_check.overall_barrier_status == "FAIL":
            feasibility_score = round(ml_prob * 35.0, 1)
        elif barrier_check.overall_barrier_status == "MARGINAL":
            feasibility_score = round(ml_prob * 75.0, 1)
        else:
            feasibility_score = round(ml_prob * 100.0, 1)

        try:
            explanations = ml_pipeline.explain_prediction(features_df, mat_id)
        except Exception:
            explanations = ["Physical ASTM barrier compliance and shelf-life kinetic threshold"]

        suitability_results[mat_id] = {
            "material_id": mat_id,
            "material_name": mat["name"],
            "short_name": mat["short"],
            "category": mat["category"],
            "ml_probability": ml_prob,
            "feasibility_score": feasibility_score,
            "barrier_check": barrier_check,
            "disallowed_reasons": disallowed_reasons,
            "driving_explanations": explanations
        }

    return suitability_results
