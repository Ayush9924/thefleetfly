"""
Comprehensive Driver Script for FleetFly Fuel Intelligence & PyMongo Operations.
Executes end-to-end:
1. Database Connectivity & Inspection via PyMongo.
2. Demonstration of CRUD + Aggregation Pipeline operations.
3. Machine Learning Training (Regression + Classification).
4. Evaluation and Metrics persistence to MongoDB and metrics.json.
"""
import sys
from .config import CSV_DATASET_PATH, METRICS_JSON_PATH
from .mongo_client import mongo_client
from .evaluate import run_evaluation_pipeline

def demonstrate_pymongo_operations():
    print("\n" + "#" * 65)
    print("DEMONSTRATING PYMONGO DATABASE OPERATIONS FOR FLEETFLY")
    print("#" * 65)

    # 1. READ Vehicles
    print("\n[Operation 1/6] PyMongo: Reading existing fleet vehicles...")
    vehicles = mongo_client.get_vehicles()
    print(f"  -> Found {len(vehicles)} vehicle(s) in collection 'vehicles'.")
    for v in vehicles[:3]:
        print(f"     * {v.get('plateNumber', 'N/A')} - {v.get('make', '')} {v.get('model', '')} ({v.get('status', 'active')})")

    # 2. READ Fuel Logs
    print("\n[Operation 2/6] PyMongo: Reading existing fuel logs...")
    logs = mongo_client.get_fuel_logs()
    print(f"  -> Found {len(logs)} fuel log(s) in collection 'fuellogs'.")

    # 3. CREATE & READ Prediction Record
    print("\n[Operation 3/6] PyMongo: Inserting vehicle prediction record...")
    sample_pred = {
        "vehiclePlate": vehicles[0].get("plateNumber") if vehicles else "FL-DEMO",
        "cylinders": 4,
        "displacement": 140.0,
        "horsepower": 90.0,
        "weight": 2400.0,
        "acceleration": 15.5,
        "model_year": 82,
        "predicted_mpg": 31.85,
        "predicted_km_per_liter": 13.54,
        "efficiency_tier": "High Efficiency",
        "confidence": 0.88,
        "isBenchmarkDemo": True
    }
    pred_id = mongo_client.log_prediction(sample_pred)
    print(f"  -> Inserted prediction with ID: {pred_id}")

    # 4. READ WITH FILTER & UPDATE
    print("\n[Operation 4/6] PyMongo: Querying with filter & updating record...")
    history = mongo_client.get_prediction_history(limit=5, min_mpg=25.0)
    print(f"  -> Retrieved {len(history)} predictions with predicted_mpg >= 25.0")
    if history:
        target_id = history[0]["_id"]
        updated = mongo_client.update_prediction_note(target_id, "Verified by college ML evaluation script")
        print(f"  -> Updated prediction {target_id} user_notes: success={updated}")

    # 5. SAFE DELETE in Isolated Sandbox
    print("\n[Operation 5/6] PyMongo: Safe DELETE in isolated 'ml_demo_sandbox' collection...")
    delete_res = mongo_client.demonstrate_safe_delete()
    print(f"  -> Safe delete test result: {delete_res}")

    # 6. AGGREGATION PIPELINE
    print("\n[Operation 6/6] PyMongo: Executing Fuel Aggregation Pipeline...")
    agg_results = mongo_client.aggregate_fuel_stats()
    print(f"  -> Aggregation returned {len(agg_results)} aggregated vehicle summary(ies):")
    for r in agg_results[:3]:
        print(f"     * [{r.get('plateNumber')}] Total Liters: {r.get('totalLiters')}L | Cost: ${r.get('totalCost')} | Efficiency: {r.get('fuelEfficiencyKmPerLiter')} km/L")

def main():
    print("=================================================================")
    print("FLEETFLY FUEL INTELLIGENCE - COMPLETE ML & MONGODB PIPELINE")
    print("=================================================================")

    # Step 1: Demonstrate PyMongo Operations
    demonstrate_pymongo_operations()

    # Step 2: Run ML Training & Evaluation
    print("\n" + "#" * 65)
    print("MACHINE LEARNING TRAINING & EVALUATION")
    print("#" * 65)
    evaluation_record = run_evaluation_pipeline()

    print("\n[SUCCESS] All PyMongo and Machine Learning workflows completed successfully!")

if __name__ == "__main__":
    main()
