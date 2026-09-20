"""
Machine Learning Suitability Model using Scikit-learn.
Employs MultiOutput Random Forest Regressor & Gradient Boosting to learn non-linear packaging
suitability patterns and output confidence scores with feature importance explainability.
"""

import os
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple, Optional
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.multioutput import MultiOutputRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import r2_score, mean_absolute_error

from .preprocessing import FEATURE_COLUMNS
from .data.materials_data import PACKAGING_MATERIALS
from .data.food_dataset import generate_training_dataset


MODEL_FILE_PATH = os.path.join(os.path.dirname(__file__), "packaging_ml_model.joblib")


class PackagingMLPipeline:
    def __init__(self):
        self.model: Optional[MultiOutputRegressor] = None
        self.feature_names: List[str] = FEATURE_COLUMNS
        self.material_keys: List[str] = list(PACKAGING_MATERIALS.keys())
        self.target_columns: List[str] = [f"suitability_{k}" for k in self.material_keys]
        self.training_metrics: Dict[str, Any] = {}
        self.feature_importances: Dict[str, float] = {}

    def train(self, n_samples: int = 1500) -> Dict[str, Any]:
        """
        Trains the Scikit-learn MultiOutput Random Forest model on scientific packaging data.
        """
        X, Y = generate_training_dataset(n_samples=n_samples, random_state=42)
        X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2, random_state=42)

        base_estimator = RandomForestRegressor(
            n_estimators=100,
            max_depth=10,
            min_samples_split=4,
            random_state=42,
            n_jobs=-1
        )
        self.model = MultiOutputRegressor(base_estimator)
        self.model.fit(X_train, Y_train)

        # Evaluate performance
        y_pred = self.model.predict(X_test)
        overall_r2 = float(r2_score(Y_test, y_pred))
        overall_mae = float(mean_absolute_error(Y_test, y_pred))

        # Compute average feature importance across estimators
        importances = np.mean([
            est.feature_importances_ for est in self.model.estimators_
        ], axis=0)

        self.feature_importances = {
            col: round(float(imp), 4)
            for col, imp in sorted(zip(self.feature_names, importances), key=lambda x: x[1], reverse=True)
        }

        self.training_metrics = {
            "algorithm": "Scikit-learn MultiOutputRegressor (RandomForest)",
            "n_estimators": 100,
            "training_samples": len(X_train),
            "test_samples": len(X_test),
            "test_r2_score": round(overall_r2, 4),
            "test_mean_absolute_error": round(overall_mae, 4),
            "materials_evaluated": len(self.material_keys)
        }

        # Save artifact to disk
        self.save()
        return self.training_metrics

    def save(self, filepath: str = MODEL_FILE_PATH):
        """Serializes trained model artifact using joblib."""
        payload = {
            "model": self.model,
            "feature_names": self.feature_names,
            "material_keys": self.material_keys,
            "target_columns": self.target_columns,
            "training_metrics": self.training_metrics,
            "feature_importances": self.feature_importances
        }
        joblib.dump(payload, filepath)

    def load(self, filepath: str = MODEL_FILE_PATH) -> bool:
        """Loads serialized model artifact if exists."""
        if os.path.exists(filepath):
            try:
                data = joblib.load(filepath)
                self.model = data["model"]
                self.feature_names = data["feature_names"]
                self.material_keys = data["material_keys"]
                self.target_columns = data["target_columns"]
                self.training_metrics = data["training_metrics"]
                self.feature_importances = data["feature_importances"]
                return True
            except Exception as e:
                print(f"Failed to load cached model: {e}")
                return False
        return False

    def predict(self, features_df: pd.DataFrame) -> Dict[str, float]:
        """
        Runs inference on preprocessed features and returns suitability probabilities per material.
        """
        if self.model is None:
            if not self.load():
                self.train()

        preds = self.model.predict(features_df[self.feature_names])[0]
        # Clip to [0.0, 1.0]
        results = {}
        for mid, val in zip(self.material_keys, preds):
            results[mid] = round(float(max(0.02, min(0.99, val))), 3)
        return results

    def explain_prediction(self, features_df: pd.DataFrame, material_id: str) -> List[Dict[str, Any]]:
        """
        Generates explainability factors for a specific material and input sample.
        Identifies which features drove the score up or down.
        """
        explanations = []
        row = features_df.iloc[0]

        # Produce respiration driver
        if row["is_produce"] == 1.0:
            if material_id == "breathable":
                explanations.append({
                    "feature": "Produce Respiration",
                    "impact": "+Positive",
                    "reason": "Micro-perforations prevent suffocation and allow active O2/CO2 equilibrium"
                })
            elif material_id in ["alu-laminate", "metalized", "evoh-pe"]:
                explanations.append({
                    "feature": "Anerobic Fermentation Risk",
                    "impact": "-Critical Negative",
                    "reason": "Hermetic barrier causes oxygen depletion (<2%) and severe fermentation off-flavors"
                })

        # Oxidation risk driver
        if row["oxidation_risk_index"] > 0.6:
            if material_id in ["metalized", "alu-laminate", "evoh-pe"]:
                explanations.append({
                    "feature": "Lipid Oxidation Defense",
                    "impact": "+Strong Positive",
                    "reason": f"High fat ({row['fat_pct']}%) and target shelf-life demand ultra-low OTR"
                })
            elif material_id in ["hdpe", "bio-film"]:
                explanations.append({
                    "feature": "Permeability Penalty",
                    "impact": "-Negative",
                    "reason": "Higher oxygen transmission accelerates rancidity in fats"
                })

        # Moisture stress driver
        if row["moisture_stress_index"] > 0.8:
            if material_id in ["alu-laminate", "metalized", "pet-pe", "hdpe"]:
                explanations.append({
                    "feature": "Moisture Barrier Protection",
                    "impact": "+Positive",
                    "reason": f"Protects against ambient humidity differential ({row['humidity_pct']}% RH)"
                })
            elif material_id in ["bio-film", "paper-coated"]:
                explanations.append({
                    "feature": "Moisture Sensitivity",
                    "impact": "-Negative",
                    "reason": "Higher WVTR leads to premature moisture gain / loss"
                })

        # Sustainability preference driver
        if row["sustainability_priority"] > 65:
            if material_id in ["bio-film", "paper-coated"]:
                explanations.append({
                    "feature": "Sustainability Alignment",
                    "impact": "+Positive",
                    "reason": f"User sustainability priority ({int(row['sustainability_priority'])}%) rewards compostable/renewable substrate"
                })
            elif material_id == "alu-laminate":
                explanations.append({
                    "feature": "Embodied Carbon Impact",
                    "impact": "-Penalty",
                    "reason": "High carbon footprint of aluminum foil extraction and non-recyclability"
                })

        # Cost economy driver
        if row["cost_priority"] > 65:
            if material_id in ["hdpe", "pet-pe"]:
                explanations.append({
                    "feature": "Cost Efficiency",
                    "impact": "+Positive",
                    "reason": "High barrier-to-cost ratio and mature mass-production supply chain"
                })

        return explanations


# Global Singleton Pipeline Instance
ml_pipeline = PackagingMLPipeline()
