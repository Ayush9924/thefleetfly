# FleetFly — Fuel Intelligence Service
### Machine Learning & MongoDB PyMongo Pipeline

Fuel Intelligence is an enhancement to **FleetFly — Fleet Management System** developed for the College MongoDB + Machine Learning coursework. It combines MongoDB polyglot persistence (Node.js/Mongoose and Python/PyMongo) with predictive analytics to analyze fleet fuel consumption and predict vehicle fuel efficiency.

---

## 1. Architecture Overview

- **Database Layer**: MongoDB (`fleetdb`), collections: `vehicles`, `fuellogs`, `prediction_logs`, `ml_model_metrics`, `ml_demo_sandbox`.
- **Python ML Pipeline (`ml_service/`)**:
  - **PyMongo**: CRUD operations, multi-stage aggregation pipeline, and query indexing.
  - **scikit-learn**:
    - **Linear Regression**: Predicts continuous Fuel Economy (MPG & km/L) from physical vehicle specifications.
    - **Decision Tree Classifier**: Classifies vehicles into Fuel Efficiency Tiers (`High Efficiency` vs `Standard Efficiency`).
  - **pandas & NumPy**: Missing-value imputation and feature engineering.
  - **joblib**: Model artifact serialization.
- **Backend (`backend/`)**: Node.js & Express REST API bridging MongoDB with the web client.
- **Frontend (`frontend/`)**: React + Tailwind CSS dashboard with interactive prediction sliders, real-time metrics, and live log tables.

---

## 2. Benchmark Dataset & Academic Attribution

- **Dataset**: UCI Auto MPG Benchmark Dataset
- **Source**: UCI Machine Learning Repository / Carnegie Mellon University (StatLib)
- **URL**: https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/
- **Instances**: 398 vehicles
- **Features Used**:
  1. `cylinders`: Engine cylinder count
  2. `displacement`: Engine displacement (cubic inches)
  3. `horsepower`: Power output in HP (missing values imputed via median: 93.5 HP)
  4. `weight`: Curb weight in pounds
  5. `acceleration`: 0–60 mph acceleration time (seconds)
  6. `model_year`: Model year
- **Continuous Target ($y_{reg}$)**: `mpg` (Miles Per Gallon)
- **Classification Target ($y_{clf}$)**: `high_efficiency` (Binary: 1 if `mpg` $\ge$ median threshold 23.00, 0 otherwise)

---

## 3. Evaluation Results (Actual Held-Out Test Data)

Evaluation performed on a 20% held-out test set ($N = 80$ samples, fixed `random_state=42`):

### Regression Model (Linear Regression)
| Metric | Value | Description |
| :--- | :--- | :--- |
| **$R^2$ Score** | **0.7861** | Explains 78.61% of fuel economy variance |
| **MAE** | **2.6732 MPG** | Mean Absolute Error |
| **RMSE** | **3.5554 MPG** | Root Mean Squared Error |
| **Intercept** | **23.4811** | Baseline economy |

### Classification Model (Decision Tree Classifier, max_depth=4)
| Metric | Value | Description |
| :--- | :--- | :--- |
| **Accuracy** | **0.8875 (88.8%)** | Overall correct classifications |
| **Precision** | **0.8974** | Positive class: High Efficiency |
| **Recall** | **0.8750** | Sensitivity for high efficiency |
| **F1 Score** | **0.8861** | Harmonic mean of precision & recall |
| **Confusion Matrix** | `[[36, 4], [5, 35]]` | TN: 36, FP: 4, FN: 5, TP: 35 |

---

## 4. PyMongo Operations Demonstrated

The Python module `ml_service/src/mongo_client.py` implements all required MongoDB operations:
1. **Connection**: Authenticates via `MONGODB_URI` / `MONGO_URI` loaded from `.env`.
2. **Read**: Fetches real fleet vehicles (`get_vehicles()`) and fuel logs (`get_fuel_logs()`).
3. **Insert**: Stores evaluation records in `ml_model_metrics` and vehicle predictions in `prediction_logs`.
4. **Filtered Query**: Filters predictions (`predicted_mpg >= 25.0`) with chronological sort.
5. **Update**: Updates user notes on predictions (`update_prediction_note()`).
6. **Safe Delete**: Demonstrates `delete_one()` strictly within an isolated sandbox collection (`ml_demo_sandbox`), preserving all production fleet data.
7. **Aggregation Pipeline**: Multi-stage aggregation (`$match`, `$group`, `$lookup`, `$unwind`, `$project`) to compute total liters, total cost, distance traveled, and km/L by vehicle.
8. **Index Management**: Creates descending indexes on `prediction_logs.createdAt` and `prediction_logs.predicted_mpg`.

---

## 5. Execution Instructions

### A. Install Python Dependencies
```bash
pip install -r ml_service/requirements.txt
```

### B. Run Complete ML & PyMongo Workflow
From the project root:
```bash
python -m ml_service.src.run_all
```
This single command:
1. Verifies/downloads the dataset.
2. Demonstrates all PyMongo CRUD & aggregation queries against MongoDB.
3. Preprocesses data and fits standardizers.
4. Trains and evaluates both Linear Regression and Decision Tree models.
5. Exports `ml_service/results/metrics.json`.
6. Saves evaluation records to MongoDB collection `ml_model_metrics`.

### C. Individual Training & Evaluation Commands
```bash
# Data preparation & download
python ml_service/data/download_dataset.py

# Train Regression
python -m ml_service.src.train_regression

# Train Classification
python -m ml_service.src.train_classification

# Run Evaluation & MongoDB Export
python -m ml_service.src.evaluate
```

---

## 6. Directory Structure
```
ml_service/
  requirements.txt        # Python package dependencies
  .env.example            # Environment template without credentials
  README.md               # Complete service documentation
  data/
    README.md             # Dataset documentation & attribution
    download_dataset.py   # Dataset ingestion and cleaning script
    auto-mpg.data         # Raw benchmark data
    auto_mpg.csv          # Cleaned CSV dataset
  models/
    linear_regression.joblib  # Trained Linear Regression model
    decision_tree.joblib      # Trained Decision Tree classifier
    scaler.joblib             # Fitted StandardScaler
  results/
    metrics.json          # Machine-readable evaluation results
  src/
    config.py             # Path & configuration resolver
    mongo_client.py       # PyMongo CRUD & aggregation operations
    preprocess.py         # Data preprocessing and scaling
    train_regression.py   # Linear Regression training script
    train_classification.py # Decision Tree training script
    evaluate.py           # Evaluation runner & JSON/MongoDB exporter
    run_all.py            # Complete end-to-end driver script
```

