# FLEETFLY: FUEL INTELLIGENCE AND PREDICTIVE EFFICIENCY ANALYSIS
## A Practical Integration of MongoDB, PyMongo, and Supervised Machine Learning in Fleet Management

**Degree Program**: Bachelor of Technology (B.Tech) in Computer Science & Engineering  
**Course / Subject**: Advanced Database Management Systems & Machine Learning Laboratory  
**Project Base**: FleetFly — Fleet Management System (https://www.thefleetfly.xyz/)  
**Date**: October 2026  

---

## Abstract
Fleet management applications generate substantial telemetry and operational logs, with fuel expenditure frequently constituting upwards of 35% to 40% of overall vehicle operating budgets. This project designs, implements, and evaluates **Fuel Intelligence**, a predictive and statistical enhancement integrated directly into the **FleetFly** fleet management platform. The system leverages **MongoDB** as a multi-model document database, utilizes **PyMongo** for Python database operations (CRUD, indexing, and multi-stage aggregation pipelines), and deploys supervised machine learning models (**Linear Regression** for continuous fuel economy estimation and **Decision Tree Classification** for fuel efficiency tier classification). Evaluated on the held-out test split of the verified UCI Auto MPG benchmark dataset, the Linear Regression model achieves an $R^2$ score of **0.7861** with a Mean Absolute Error (MAE) of **2.6732 MPG**, while the Decision Tree classifier achieves an Accuracy of **88.75%**, Precision of **0.8974**, Recall of **0.8750**, and an F1 Score of **0.8861**. All architectural components, data ingestion routines, and mathematical formulations are documented for full reproducibility.

---

## 1. Project Title
**FleetFly Fuel Intelligence: Integration of MongoDB Document Database, PyMongo Operations, and Supervised Machine Learning for Fleet Fuel Economy Prediction.**

---

## 2. Introduction
Fleet logistics and vehicular asset tracking involve continuous telemetry ingestion, maintenance scheduling, route coordination, and operational accounting. FleetFly is a full-stack fleet management platform engineered with React, Node.js, Express, and MongoDB. In production fleet operations, fuel consumption variability directly impacts profitability and operational carbon footprints. While telemetry devices track real-time spatial positioning via GPS, raw odometer readings alone do not provide proactive fuel efficiency intelligence.

This project introduces an intelligent analytical layer named **Fuel Intelligence** into the FleetFly ecosystem. The enhancement demonstrates how a modern document-oriented database (MongoDB) interacts seamlessly with a dedicated Python-based data science and machine learning pipeline via **PyMongo**, while preserving the existing Node.js/Express backend and React frontend architecture.

---

## 3. Problem Statement
Commercial fleet operators frequently face the following operational and computational challenges:
1. **Disparate Data Stores and Schema Rigidity**: Fuel purchase receipts, odometer readings, and vehicle specifications arrive in irregular intervals and varying formats. Relational database management systems impose rigid tabular schemas that demand complex normalization and alter-table migrations.
2. **Lack of Predictive Insights**: Legacy fleet software records past expenses retrospectively but fails to predict expected fuel consumption from vehicle mechanical attributes (displacement, cylinder count, engine horsepower, and curb weight).
3. **Absence of Standardized Benchmarks**: When newly acquired vehicles join a fleet without sufficient historical mileage logs, fleet managers cannot readily establish expected baseline fuel economy or classify vehicles into efficiency tiers.

---

## 4. Project Objectives
The primary technical and academic objectives of this project are:
1. **Database Integration with PyMongo**: Implement direct, robust database connectivity between Python machine learning services and MongoDB using the official `PyMongo` driver, reading from and writing to the active FleetFly `fleetdb` database.
2. **Polyglot Database Operations**: Demonstrate representative database operations:
   - Reading existing vehicle documents and fuel transaction records.
   - Inserting structured model evaluation metrics into an `ml_model_metrics` collection.
   - Inserting individual vehicle predictions into a `prediction_logs` collection.
   - Performing parameterized document queries with sorting and projection.
   - Updating prediction documents with audit notes.
   - Demonstrating safe deletion within an isolated sandbox collection (`ml_demo_sandbox`), preserving production fleet records.
   - Constructing a multi-stage **MongoDB Aggregation Pipeline** to compute total fuel volume, total expenditure, odometer travel distance, and fuel efficiency ($km/L$) grouped by vehicle.
   - Establishing query performance indexes on frequently accessed collections.
3. **Data Preprocessing & Validation**: Clean and preprocess automotive data, imputing missing horsepower entries via median imputation, standardizing feature distributions via `StandardScaler`, and establishing reproducible 80/20 train-test splits.
4. **Machine Learning Modeling**:
   - Train a **Linear Regression** model to predict continuous fuel economy ($MPG$).
   - Train a **Decision Tree Classifier** to classify vehicles into *High Efficiency* vs *Standard Efficiency* tiers.
5. **Rigorous Evaluation**: Measure actual performance on held-out test sets using standard metrics ($R^2$, MAE, Accuracy, Precision, Recall, F1 Score).
6. **Seamless Full-Stack Integration**: Enhance the existing FleetFly `FuelLogsPage` and `ReportsPage` without breaking existing routes or modifying unrelated services.

---

## 5. Existing System and Proposed Enhancement

| Dimension | Existing FleetFly System | Proposed Enhancement (Fuel Intelligence) |
| :--- | :--- | :--- |
| **Backend Stack** | Node.js, Express, Mongoose | Polyglot: Node.js/Mongoose + Python/PyMongo Service |
| **Fuel Logging** | Basic CRUD schema, placeholder UI | Full interactive logging, statistical aggregation & demo seeding |
| **Data Analytics** | Static placeholder cards | Multi-stage MongoDB Aggregation Pipeline for vehicle metrics |
| **Intelligence** | None (Static coming-soon pages) | Supervised Linear Regression + Decision Tree Classification |
| **Prediction Panel** | Not available | Interactive vehicle specification sliders with real-time ML inference |
| **Evaluation Reporting** | Not available | Formal ML metrics report card on Reports page ($R^2$, MAE, F1, Accuracy) |
| **Persistence** | Relational-style collections | Document-oriented collections with query indexes & schema flexibility |

---

## 6. System Architecture

The system utilizes a clean micro-service integration model:
```
+-------------------------------------------------------------------------+
|                           CLIENT TIER                                   |
|                React 18 + Vite + Tailwind CSS Dashboard                 |
|      [Fuel Logs Page]       [Reports Page]       [Maintenance Page]     |
|   (Interactive Sliders)    (ML Metric Cards)     (Cross-linking Pill)   |
+------------------------------------+------------------------------------+
                                     | HTTP / REST (Axios)
                                     v
+------------------------------------+------------------------------------+
|                          APPLICATION TIER                               |
|        Node.js + Express API Server (Port 5001 / Production)            |
|       - /api/fuels/intelligence/summary                                 |
|       - /api/fuels/intelligence/metrics                                 |
|       - /api/fuels/intelligence/predict                                 |
|       - /api/fuels/intelligence/predictions                             |
+-------------------+--------------------------------+--------------------+
                    | Mongoose Connection            | Subprocess / Shared DB
                    v                                v
+-------------------+--------------------------------+--------------------+
|                         DATABASE LAYER                                  |
|                      MongoDB Atlas (fleetdb)                            |
|   Collections: vehicles | fuellogs | prediction_logs | ml_model_metrics |
+------------------------------------+------------------------------------+
                                     ^
                                     | PyMongo Driver (Native BSON)
                                     |
+------------------------------------+------------------------------------+
|                       PYTHON ML SERVICE                                 |
|                   Python 3.14 + PyMongo Pipeline                        |
|   - mongo_client.py: CRUD operations & aggregation pipeline             |
|   - preprocess.py: Missing value imputation & StandardScaler            |
|   - train_regression.py: Linear Regression (R2, MAE, RMSE)              |
|   - train_classification.py: Decision Tree (Accuracy, Precision, F1)    |
|   - evaluate.py: Structured JSON metrics export & MongoDB persistence   |
+-------------------------------------------------------------------------+
```

---

## 7. Dataset Description and Source
Because the demonstration database currently contains 3 vehicle assets and zero historical consecutive fuel records, synthesizing fake records to train a deep ML model would violate academic rigor. In accordance with assignment instructions, the model is trained and benchmarked on the globally recognized **UCI Auto MPG Benchmark Dataset**.

- **Repository**: UCI Machine Learning Repository
- **Original Source**: Carnegie Mellon University, StatLib Library (Collected by Ernesto Ramos & David Donoho; Donated by Ross Quinlan)
- **Source URL**: `https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/auto-mpg.data`
- **Total Instances**: 398 vehicle records
- **Input Features ($X$)**:
  1. `cylinders`: Discrete (3, 4, 5, 6, 8)
  2. `displacement`: Engine displacement in cubic inches (continuous, range: $68.0 - 455.0$)
  3. `horsepower`: Brake horsepower in HP (continuous, range: $46.0 - 230.0$; 6 missing values imputed via median $93.5\text{ HP}$)
  4. `weight`: Curb weight in pounds (continuous, range: $1613 - 5140\text{ lbs}$)
  5. `acceleration`: Seconds elapsed from 0 to 60 mph (continuous, range: $8.0 - 24.8\text{ s}$)
  6. `model_year`: Vehicle production model year (range: $70 - 82$)
- **Continuous Target ($y_{reg}$)**: `mpg` (Miles Per Gallon, continuous, range: $9.0 - 46.6$)
- **Derived Classification Target ($y_{clf}$)**: `high_efficiency` (Binary variable: 1 if `mpg` $\ge$ sample median of $23.00\text{ MPG}$; 0 otherwise. Class distribution: 201 High Efficiency vs 197 Standard Efficiency).

---

## 8. MongoDB Database and Collection Design

The system organizes unstructured and semi-structured documents within the `fleetdb` database across four primary collections:

### A. Collection: `vehicles`
Stores physical and administrative metadata for fleet assets.
```json
{
  "_id": { "$oid": "6617..." },
  "plateNumber": "ABC-2519",
  "make": "Toyota",
  "model": "Fortuner",
  "year": 2022,
  "status": "active",
  "fuelType": "diesel",
  "odometer": 46630,
  "createdAt": { "$date": "2026-04-10T18:14:00Z" }
}
```

### B. Collection: `fuellogs`
Stores chronological fuel transactions.
```json
{
  "_id": { "$oid": "6618..." },
  "vehicle": { "$oid": "6617..." },
  "liters": 45.0,
  "cost": 67.5,
  "odometer": 45540,
  "date": { "$date": "2026-10-18T10:30:00Z" },
  "createdAt": { "$date": "2026-10-18T10:30:00Z" }
}
```

### C. Collection: `prediction_logs`
Logs live inferences made by the machine learning models.
```json
{
  "_id": { "$oid": "6ae3a18e85296d28fdbcb555" },
  "vehiclePlate": "Toyota Fortuner",
  "cylinders": 4,
  "displacement": 140.0,
  "horsepower": 90.0,
  "weight": 2400.0,
  "acceleration": 15.5,
  "model_year": 82,
  "predicted_mpg": 31.85,
  "predicted_km_per_liter": 13.54,
  "efficiency_tier": "High Efficiency",
  "isBenchmarkDemo": true,
  "user_notes": "Verified by college ML evaluation script",
  "createdAt": { "$date": "2026-10-29T19:42:00Z" }
}
```

### D. Collection: `ml_model_metrics`
Maintains immutable training and evaluation snapshots for compliance and auditability.
```json
{
  "_id": { "$oid": "6ae3a1cb26fd85c15e6d1635" },
  "project": "FleetFly Fuel Intelligence",
  "dataset": { "name": "UCI Auto MPG Benchmark Dataset", "total_records": 398 },
  "regression": { "model_name": "Linear Regression", "r2_score": 0.7861, "mae": 2.6732 },
  "classification": { "model_name": "Decision Tree Classifier", "accuracy": 0.8875, "f1_score": 0.8861 },
  "created_at": { "$date": "2026-10-29T19:42:06Z" }
}
```

---

## 9. PyMongo Implementation and Representative Queries

The module `ml_service/src/mongo_client.py` implements production-grade MongoDB interactions:

### 1. Connection Initialization
```python
from pymongo import MongoClient
client = MongoClient(os.getenv("MONGODB_URI"), serverSelectionTimeoutMS=5000)
db = client["fleetdb"]
```

### 2. Document Read Query with Projection
```python
vehicles = list(db.vehicles.find(
    {"status": "active"},
    {"plateNumber": 1, "make": 1, "model": 1, "odometer": 1}
))
```

### 3. Document Insertion
```python
record = {
    "vehiclePlate": "ABC-2519",
    "predicted_mpg": 31.85,
    "efficiency_tier": "High Efficiency",
    "createdAt": datetime.utcnow()
}
result = db.prediction_logs.insert_one(record)
```

### 4. Filtered Query & Update
```python
# Query with conditional filter
preds = list(db.prediction_logs.find({"predicted_mpg": {"$gte": 25.0}}).sort("createdAt", -1).limit(5))

# Document Update
db.prediction_logs.update_one(
    {"_id": preds[0]["_id"]},
    {"$set": {"user_notes": "Audited via college evaluation workflow", "updatedAt": datetime.utcnow()}}
)
```

### 5. Safe Sandbox Deletion
```python
# Isolated sandbox collection: NEVER touches real fleet data
temp_doc = db.ml_demo_sandbox.insert_one({"sandbox_test": True})
db.ml_demo_sandbox.delete_one({"_id": temp_doc.inserted_id})
```

### 6. Multi-Stage Aggregation Pipeline
```python
pipeline = [
    { "$match": { "liters": { "$gt": 0 }, "cost": { "$gt": 0 } } },
    {
        "$group": {
            "_id": "$vehicle",
            "totalLiters": { "$sum": "$liters" },
            "totalCost": { "$sum": "$cost" },
            "recordsCount": { "$sum": 1 },
            "minOdometer": { "$min": "$odometer" },
            "maxOdometer": { "$max": "$odometer" }
        }
    },
    {
        "$lookup": {
            "from": "vehicles",
            "localField": "_id",
            "foreignField": "_id",
            "as": "vehicleDetails"
        }
    },
    { "$unwind": { "path": "$vehicleDetails", "preserveNullAndEmptyArrays": True } },
    {
        "$project": {
            "plateNumber": { "$ifNull": ["$vehicleDetails.plateNumber", "Unknown"] },
            "totalLiters": { "$round": ["$totalLiters", 2] },
            "totalCost": { "$round": ["$totalCost", 2] },
            "distanceTraveled": { "$subtract": ["$maxOdometer", "$minOdometer"] }
        }
    }
]
results = list(db.fuellogs.aggregate(pipeline))
```

### 7. Index Creation
```python
db.prediction_logs.create_index([("createdAt", -1)])
db.prediction_logs.create_index([("predicted_mpg", 1)])
```

---

## 10. Data Preprocessing

1. **Handling Incomplete Records**: The raw dataset contains 6 instances with `?` as the horsepower value. Rather than discarding rows and truncating statistical power, median imputation was performed:
   $$\tilde{x}_{\text{hp}} = \text{median}(\text{horsepower}) = 93.5\text{ HP}$$
2. **Feature Scaling**: Due to disparate dimensional scales (curb weight spans thousands of pounds while cylinders range from 3 to 8), features were standardized using z-score normalization:
   $$z = \frac{x - \mu}{\sigma}$$
   The `StandardScaler` was fitted strictly on the training partition ($N_{\text{train}} = 318$) and applied to the test partition ($N_{\text{test}} = 80$) to prevent data leakage.
3. **Partitioning**: Stratified 80/20 train-test split with fixed random seed (`random_state=42`) guarantees exact experimental reproducibility across environments.
4. **Consecutive Odometer Validation**: In real fleet telemetry, fuel economy ($km/L$) is calculated strictly over consecutive chronological intervals:
   $$\Delta \text{distance}_i = \text{odometer}_i - \text{odometer}_{i-1}$$
   $$\text{Efficiency}_i = \frac{\Delta \text{distance}_i}{\text{Liters}_i}$$
   Intervals where $\Delta \text{distance} \le 0$ or exceed plausible fuel tank bounds ($> 5000\text{ km}$) are systematically flagged.

---

## 11. Machine Learning Algorithms and Their Purpose

### A. Linear Regression (Continuous Fuel Economy)
Linear Regression models the relationship between the scalar continuous target $y$ (Miles Per Gallon) and the normalized feature vector $\mathbf{z}$:
$$\hat{y} = \beta_0 + \sum_{j=1}^{p} \beta_j z_j$$
- **Optimization Criterion**: Ordinary Least Squares (OLS) minimizing Residual Sum of Squares (RSS):
  $$\min_{\boldsymbol{\beta}} \sum_{i=1}^{n} \left( y_i - \hat{y}_i \right)^2$$
- **Purpose**: Estimates fuel efficiency in continuous units, enabling fleet operators to project exact fuel costs.

### B. Decision Tree Classifier (Efficiency Tier Categorization)
A classification tree partitions the multi-dimensional feature space into rectangular subspaces using orthogonal decision thresholds:
- **Impurity Criterion**: Gini Impurity:
  $$I_G(t) = 1 - \sum_{k=1}^{K} p(k \mid t)^2$$
- **Hyperparameter Control**: `max_depth = 4` prevents complex branch memorization, minimizes variance, and produces clear, explainable decision paths.
- **Purpose**: Classifies vehicles into distinct fleet allocation tiers:
  - **High Efficiency** ($MPG \ge 23.00$)
  - **Standard Efficiency** ($MPG < 23.00$)

---

## 12. Training and Testing Methodology
- **Total Dataset Size**: 398 records.
- **Training Partition**: 318 records (80.0%).
- **Held-Out Test Partition**: 80 records (20.0%).
- **Evaluation Independence**: Models were fit exclusively on training vectors. Metric calculations were computed exclusively against the held-out test set.
- **Target Threshold**: Sample median $MPG = 23.00$ ensures balanced binary classification classes (201 High vs 197 Standard).

---

## 13. Actual Model Evaluation Results

All numerical values below represent **actual experimental findings** generated from `ml_service/results/metrics.json` and persisted in MongoDB record `6ae3a1cb26fd85c15e6d1635`.

### A. Regression Evaluation Metrics
| Metric | Mathematical Definition | Actual Test Value | Interpretation |
| :--- | :--- | :--- | :--- |
| **Coefficient of Determination ($R^2$)** | $1 - \frac{\sum (y_i - \hat{y}_i)^2}{\sum (y_i - \bar{y})^2}$ | **0.7861** | The model explains **78.61%** of fuel economy variance |
| **Mean Absolute Error (MAE)** | $\frac{1}{n} \sum \|y_i - \hat{y}_i\|$ | **2.6732 MPG** | Average prediction deviation is only $2.67\text{ MPG}$ |
| **Root Mean Squared Error (RMSE)** | $\sqrt{\frac{1}{n} \sum (y_i - \hat{y}_i)^2}$ | **3.5554 MPG** | Penalizes larger outlier deviations |
| **Model Intercept ($\beta_0$)** | Baseline value at $\mathbf{z} = \mathbf{0}$ | **23.4811** | Expected MPG at average vehicle specifications |

#### Regression Feature Coefficients ($\beta_j$ on Standardized Features)
| Feature Name | Coefficient ($\beta_j$) | Physical Significance |
| :--- | :--- | :--- |
| **weight** | **-5.9299** | Heaviest penalty: increased vehicle mass substantially degrades fuel economy |
| **cylinders** | **-0.9777** | Additional cylinders increase friction and fuel displacement |
| **horsepower** | **-0.2463** | Higher power output draws greater fuel per cycle |
| **displacement** | **+1.5617** | Combined interaction effect with engine geometry |
| **acceleration** | **+0.1456** | Slower acceleration (higher 0-60s) correlates with smaller engine tuning |
| **model_year** | **+2.9213** | Significant positive trend: automotive engineering improved efficiency over time |

### B. Classification Evaluation Metrics
| Metric | Mathematical Definition | Actual Test Value |
| :--- | :--- | :--- |
| **Accuracy** | $\frac{TP + TN}{TP + TN + FP + FN}$ | **0.8875 (88.75%)** |
| **Precision** (Positive: High Efficiency) | $\frac{TP}{TP + FP}$ | **0.8974 (89.74%)** |
| **Recall** (Sensitivity) | $\frac{TP}{TP + FN}$ | **0.8750 (87.50%)** |
| **F1 Score** | $2 \cdot \frac{\text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$ | **0.8861 (88.61%)** |

#### Confusion Matrix ($N = 80$ Test Samples)
| | Predicted Standard Efficiency (0) | Predicted High Efficiency (1) |
| :--- | :---: | :---: |
| **Actual Standard Efficiency (0)** | **36** (True Negative) | **4** (False Positive) |
| **Actual High Efficiency (1)** | **5** (False Negative) | **35** (True Positive) |

---

## 14. Discussion and Limitations
1. **Model Efficacy**: Achieving an $R^2$ of $0.7861$ with simple Linear Regression confirms that fundamental vehicle physical parameters (weight, displacement, cylinders, model year) strongly predict fuel economy without requiring non-linear deep neural networks.
2. **Feature Interpretability**: The Decision Tree feature importance demonstrates that engine displacement ($75.97\%$) and curb weight ($9.42\%$) represent the primary discriminating factors for vehicle efficiency tiers.
3. **Operational Assumptions & Limitations**:
   - The benchmark model reflects internal combustion engine dynamics and does not model electric vehicle (EV) battery degradation or kilowatt-hour consumption.
   - Real-world fuel consumption is also influenced by external variables not captured in static chassis specifications (e.g., driver acceleration profiles, ambient temperatures, aerodynamic drag at highway speeds, tire pressure, and road gradient).
   - In production, fuel purchases are assumed to replenish the tank; accurate empirical fuel efficiency requires full-to-full refuel logging protocols.

---

## 15. Conclusion and Future Scope
The **Fuel Intelligence** enhancement successfully incorporates document-oriented database design, polyglot persistence via PyMongo, and supervised machine learning within the FleetFly fleet management architecture. The integration proves that college-level database and machine learning requirements can be achieved within an enterprise-grade web application while strictly preserving code modularity, database integrity, and UI aesthetics.

### Future Scope
- **IoT Telemetry Streaming**: Ingest real-time CAN bus telemetry (instantaneous fuel flow sensors, RPM, throttle position) via MQTT/Kafka into MongoDB time-series collections.
- **Electric Vehicle Energy Modeling**: Train multi-target regression models predicting kilowatt-hours per kilometer ($kWh/km$) and state-of-charge decay.
- **Anomaly Detection**: Implement Isolation Forests to identify sudden fuel siphoning or fuel line leaks in commercial transport trucks.

---

## 16. References
1. Quinlan, J. R. (1993). *Combining Instance-Based and Model-Based Learning*. Proceedings of the Tenth International Conference on Machine Learning, 236–243.
2. UCI Machine Learning Repository: Auto MPG Dataset. Available: `https://archive.ics.uci.edu/ml/datasets/auto+mpg`
3. Chodorow, K. (2013). *MongoDB: The Definitive Guide* (2nd ed.). O'Reilly Media.
4. Pedregosa, F., et al. (2011). *Scikit-learn: Machine Learning in Python*. Journal of Machine Learning Research, 12, 2825–2830.
5. McKinney, W. (2010). *Data Structures for Statistical Computing in Python*. Proceedings of the 9th Python in Science Conference, 51–56.

---

## 17. Instructions to Run and Reproduce

### Step 1: Environment Setup
Ensure Node.js ($\ge 18$) and Python ($\ge 3.10$) are installed.
```bash
# Install Python packages
pip install -r ml_service/requirements.txt

# Install Backend and Frontend packages (already present in repository)
npm install --prefix backend
npm install --prefix frontend
```

### Step 2: Run End-to-End PyMongo & ML Pipeline
From the project root:
```bash
python -m ml_service.src.run_all
```
This executes dataset download, verifies PyMongo CRUD and aggregation against MongoDB, trains the models, saves artifacts to `ml_service/models/`, writes `ml_service/results/metrics.json`, and records the evaluation snapshot in the `ml_model_metrics` MongoDB collection.

### Step 3: Run the Web Application
Open two terminal windows:
```bash
# Terminal 1: Start Backend (Port 5001)
npm start --prefix backend

# Terminal 2: Start Frontend (Port 5173)
npm run dev --prefix frontend
```

### Step 4: Interact with Fuel Intelligence in Browser
1. Navigate to `http://localhost:5173` and log into FleetFly.
2. Open **Fuel Logs** (`/dashboard/fuels`):
   - View fleet metrics summary cards.
   - Click **"Load Demo Fleet Data"** to seed realistic consecutive fuel records and test the aggregation pipeline live.
   - Use the **Fuel Economy Prediction Panel** sliders (Cylinders, Displacement, HP, Weight, Model Year) and click **"Run ML Prediction"** to observe real-time regression and classification.
   - Click **"Add Fuel Entry"** to record custom fuel logs for existing vehicles.
3. Open **Reports** (`/dashboard/reports`) to inspect the verified **ML Model Evaluation Report** displaying the actual test metrics ($R^2 = 0.7861$, $\text{MAE} = 2.6732$, $\text{Accuracy} = 88.75\%$, $\text{F1} = 0.8861$).

