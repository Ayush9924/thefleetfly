"""
Data Preprocessing Module for FleetFly Fuel Intelligence.
Handles:
1. Loading and cleaning the Auto MPG benchmark dataset.
2. Missing value imputation (horsepower median imputation).
3. Target derivation for Classification (High Efficiency >= median).
4. Train/Test splitting with fixed random seed (42).
5. Feature scaling via StandardScaler.
6. Real fleet fuel log preprocessing (consecutive odometer validation).
"""
import os
import joblib
import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler

from .config import CSV_DATASET_PATH, SCALER_PATH, RANDOM_SEED, TEST_SIZE

# Primary numerical features representing vehicle physical specifications
FEATURE_COLUMNS = [
    "cylinders",
    "displacement",
    "horsepower",
    "weight",
    "acceleration",
    "model_year"
]

def load_and_preprocess_benchmark_data():
    """
    Loads auto_mpg.csv, handles missing values, generates regression and
    classification targets, splits train/test sets, and standardizes features.
    """
    if not os.path.exists(CSV_DATASET_PATH):
        from ..data.download_dataset import download_and_prepare
        download_and_prepare()

    df = pd.read_csv(CSV_DATASET_PATH)

    # 1. Missing Value Imputation
    # Auto MPG contains 6 missing values in 'horsepower'
    if df["horsepower"].isnull().sum() > 0:
        median_hp = df["horsepower"].median()
        df["horsepower"] = df["horsepower"].fillna(median_hp)
        print(f"[Preprocessing] Imputed {df['horsepower'].isnull().sum()} missing horsepower values with median ({median_hp} HP)")

    # 2. Derive Targets
    # Continuous regression target: mpg
    y_reg = df["mpg"].values

    # Derived binary classification target: High Efficiency vehicle
    # Class 1: High Efficiency (mpg >= median)
    # Class 0: Standard / Low Efficiency (mpg < median)
    median_mpg = float(np.median(y_reg))
    df["high_efficiency"] = (df["mpg"] >= median_mpg).astype(int)
    y_clf = df["high_efficiency"].values

    print(f"[Preprocessing] Derived Classification Target threshold: median MPG = {median_mpg:.2f}")
    print(f"[Preprocessing] Class distribution: {dict(df['high_efficiency'].value_counts())}")

    X = df[FEATURE_COLUMNS].values

    # 3. Train-Test Split (Reproducible with fixed random seed)
    X_train, X_test, y_reg_train, y_reg_test, y_clf_train, y_clf_test = train_test_split(
        X, y_reg, y_clf,
        test_size=TEST_SIZE,
        random_state=RANDOM_SEED,
        stratify=y_clf
    )

    # 4. Feature Standardization
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Save fitted scaler for production inference
    joblib.dump(scaler, SCALER_PATH)
    print(f"[Preprocessing] StandardScaler fitted on {len(X_train)} train samples, evaluated on {len(X_test)} test samples.")
    print(f"[Preprocessing] Saved scaler to {SCALER_PATH}")

    return {
        "df": df,
        "features": FEATURE_COLUMNS,
        "X_train": X_train,
        "X_test": X_test,
        "X_train_scaled": X_train_scaled,
        "X_test_scaled": X_test_scaled,
        "y_reg_train": y_reg_train,
        "y_reg_test": y_reg_test,
        "y_clf_train": y_clf_train,
        "y_clf_test": y_clf_test,
        "median_mpg": median_mpg,
        "scaler": scaler
    }

def preprocess_fleet_fuel_logs(logs):
    """
    Validates and calculates distance and fuel efficiency from real FleetFly fuel logs.
    
    Methodology:
    - Sorts records chronologically per vehicle.
    - Odometer reading must be monotonically increasing.
    - Distance is derived strictly from consecutive odometer readings.
    - Prevents negative distances, duplicate readings, and impossible outlier spikes.
    """
    if not logs:
        return []

    df = pd.DataFrame(logs)
    if "date" in df.columns:
        df["date"] = pd.to_datetime(df["date"])
        df = df.sort_values(by=["vehicle", "date"]).reset_index(drop=True)

    valid_intervals = []
    for vehicle_id, group in df.groupby("vehicle"):
        group = group.sort_values("date").reset_index(drop=True)
        for i in range(1, len(group)):
            prev_row = group.iloc[i - 1]
            curr_row = group.iloc[i]

            prev_odo = prev_row.get("odometer", 0)
            curr_odo = curr_row.get("odometer", 0)
            liters = curr_row.get("liters", 0)
            cost = curr_row.get("cost", 0)

            # Verification of consecutive odometer reading
            delta_distance = curr_odo - prev_odo

            is_valid = (
                delta_distance > 0 and
                liters > 0 and
                delta_distance <= 5000  # realistic max interval for single tank
            )

            if is_valid:
                km_per_liter = delta_distance / liters
                cost_per_km = cost / delta_distance
                valid_intervals.append({
                    "vehicle": vehicle_id,
                    "date": curr_row["date"],
                    "deltaDistance": delta_distance,
                    "liters": liters,
                    "cost": cost,
                    "kmPerLiter": round(km_per_liter, 2),
                    "costPerKm": round(cost_per_km, 2)
                })

    return valid_intervals

