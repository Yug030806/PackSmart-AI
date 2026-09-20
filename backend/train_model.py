"""
Standalone script to train and save the Scikit-learn packaging model.
"""

from app.model import ml_pipeline

if __name__ == "__main__":
    print("Starting training of Scikit-learn Packaging Suitability Model...")
    metrics = ml_pipeline.train(n_samples=2000)
    print("Training finished!")
    print("Metrics:", metrics)
    print("\nTop 5 Feature Importances:")
    for feat, imp in list(ml_pipeline.feature_importances.items())[:5]:
        print(f"  {feat}: {imp:.4f}")
