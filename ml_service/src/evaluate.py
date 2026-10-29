"""
Model Evaluation and Metrics Exporter for FleetFly Fuel Intelligence.
Generates metrics.json and persists results into MongoDB 'ml_model_metrics'.
"""
import json
from datetime import datetime

from .config import METRICS_JSON_PATH, RANDOM_SEED, TEST_SIZE
from .preprocess import load_and_preprocess_benchmark_data
from .train_regression import train_regression_model
from .train_classification import train_classification_model
from .mongo_client import mongo_client

def run_evaluation_pipeline():
    print("=" * 65)
    print("FLEETFLY FUEL INTELLIGENCE - ML EVALUATION PIPELINE")
    print("=" * 65)

    # 1. Preprocess Data
    data = load_and_preprocess_benchmark_data()

    # 2. Train & Evaluate Regression Model
    reg_metrics = train_regression_model(data)

    # 3. Train & Evaluate Classification Model
    clf_metrics = train_classification_model(data)

    # 4. Compile Structured Metrics Document
    evaluation_record = {
        "project": "FleetFly Fuel Intelligence",
        "timestamp": datetime.utcnow().isoformat(),
        "dataset": {
            "name": "UCI Auto MPG Benchmark Dataset",
            "source": "https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/",
            "total_records": len(data["df"]),
            "train_records": len(data["X_train"]),
            "test_records": len(data["X_test"]),
            "test_split_ratio": TEST_SIZE,
            "random_seed": RANDOM_SEED,
            "features": data["features"],
            "median_mpg_threshold": round(data["median_mpg"], 2),
            "scaler_params": {
                "mean": [round(float(m), 6) for m in data["scaler"].mean_],
                "scale": [round(float(s), 6) for s in data["scaler"].scale_]
            }
        },
        "regression": reg_metrics,
        "classification": clf_metrics,
        "summary": {
            "r2_score": reg_metrics["r2_score"],
            "mae": reg_metrics["mae"],
            "accuracy": clf_metrics["accuracy"],
            "precision": clf_metrics["precision"],
            "recall": clf_metrics["recall"],
            "f1_score": clf_metrics["f1_score"]
        }
    }

    # 5. Save metrics.json
    with open(METRICS_JSON_PATH, "w", encoding="utf-8") as f:
        json.dump(evaluation_record, f, indent=2)
    print(f"\n[Artifact] Successfully wrote evaluation results to {METRICS_JSON_PATH}")

    # 6. Store in MongoDB via PyMongo
    print("\n[PyMongo] Persisting evaluation metrics into MongoDB...")
    inserted_id = mongo_client.save_evaluation_metrics(evaluation_record)
    mongo_client.create_indexes()

    print("\n" + "=" * 65)
    print("EVALUATION SUMMARY:")
    print(f"  Linear Regression:      R^2 = {reg_metrics['r2_score']} | MAE = {reg_metrics['mae']} MPG")
    print(f"  Decision Tree (Tier):   Acc = {clf_metrics['accuracy']} | Precision = {clf_metrics['precision']} | Recall = {clf_metrics['recall']} | F1 = {clf_metrics['f1_score']}")
    print(f"  MongoDB Record ID:      {inserted_id}")
    print("=" * 65)

    return evaluation_record

if __name__ == "__main__":
    run_evaluation_pipeline()
