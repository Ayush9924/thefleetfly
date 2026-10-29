# FleetFly — Fleet Management System with Fuel Intelligence

[![Live Deployment](https://img.shields.io/badge/Live-thefleetfly.xyz-brightgreen)](https://www.thefleetfly.xyz/)
[![Database](https://img.shields.io/badge/MongoDB-Atlas%20%26%20PyMongo-green)](https://www.mongodb.com/)
[![Machine Learning](https://img.shields.io/badge/ML-scikit--learn-orange)](https://scikit-learn.org/)

**FleetFly** is a comprehensive, modern Fleet Management System designed for tracking commercial transport assets, scheduling preventive maintenance, logging fuel transactions, optimizing routes, and providing predictive vehicle analytics.

This repository features the **Fuel Intelligence** module developed for the College MongoDB + Machine Learning coursework, integrating MongoDB polyglot persistence (Node.js/Mongoose + Python/PyMongo) and supervised machine learning (**Linear Regression** and **Decision Tree Classification**).

---

## 🚀 Key Features

1. **Fleet Tracking & Asset Management**: Real-time vehicle status tracking, GPS coordinates, vehicle registration, and status indicators.
2. **Maintenance Scheduling**: Preventive maintenance planning, overdue alerts, and service logs.
3. **Fuel Intelligence & Logging**:
   - Total records, fuel volume, and total expenditure tracking via MongoDB.
   - Per-vehicle consecutive odometer distance and real fuel efficiency ($km/L$) calculation.
   - Interactive **Machine Learning Fuel Economy Prediction Panel** with vehicle attribute sliders.
   - Demonstration dataset loader for testing without production records.
4. **Machine Learning Model Evaluation**:
   - **Linear Regression**: Predicts continuous Fuel Economy (MPG & km/L) from physical vehicle specifications ($R^2 = 0.7861$, $\text{MAE} = 2.67\text{ MPG}$).
   - **Decision Tree Classifier**: Categorizes vehicles into *High Efficiency* vs *Standard Efficiency* tiers ($\text{Accuracy} = 88.8\%$, $\text{F1} = 0.8861$).
5. **PyMongo Integration**: Demonstrates full CRUD operations, index creation, safe sandbox deletions, and multi-stage aggregation pipelines.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons, Framer Motion, Axios
- **Backend API**: Node.js, Express, Mongoose, Socket.io
- **Machine Learning & PyMongo**: Python 3.10+, PyMongo, scikit-learn, pandas, NumPy, joblib, ReportLab
- **Database**: MongoDB (Atlas cloud cluster or local instance, database: `fleetdb`)

---

## 📁 Repository Structure

```
thefleetfly/
├── backend/                  # Node.js Express REST API server
│   ├── config/               # Database connection configuration
│   ├── controllers/          # Request handlers (including Fuel Intelligence)
│   ├── models/               # Mongoose schemas (Vehicle, FuelLog, PredictionLog)
│   └── routes/               # API route definitions
├── frontend/                 # React 18 + Vite frontend
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   ├── pages/            # FuelLogsPage, ReportsPage, MaintenancePage, etc.
│   │   └── services/         # Axios API clients
├── ml_service/               # Python MongoDB + Machine Learning Service
│   ├── data/                 # Benchmark dataset (UCI Auto MPG) & downloader
│   ├── models/               # Serialized models (.joblib) & scaler
│   ├── results/              # Evaluation metrics (metrics.json)
│   ├── src/
│   │   ├── config.py         # Paths and environment resolution
│   │   ├── mongo_client.py   # PyMongo CRUD & aggregation pipeline
│   │   ├── preprocess.py     # Imputation, standardization, train/test split
│   │   ├── train_regression.py     # Linear Regression training
│   │   ├── train_classification.py # Decision Tree training
│   │   ├── evaluate.py       # Metrics evaluator & MongoDB persistence
│   │   └── run_all.py        # End-to-end driver script
│   ├── requirements.txt      # Python dependencies
│   └── README.md             # Detailed ML service documentation
├── report/                   # College Project Report
│   ├── FUEL_INTELLIGENCE_PROJECT_REPORT.md  # Comprehensive Markdown Report
│   ├── FUEL_INTELLIGENCE_PROJECT_REPORT.pdf # Polished Printable PDF Report
│   └── generate_pdf_report.py               # PDF generation script
├── package.json              # Root project configuration
└── README.md                 # Project README
```

---

## ⚡ Quick Start & Execution Instructions

### 1. Install Dependencies
```bash
# Backend dependencies
npm install --prefix backend

# Frontend dependencies
npm install --prefix frontend

# Python ML & PyMongo dependencies
pip install -r ml_service/requirements.txt
```

### 2. Run the Python PyMongo & ML Pipeline
From the project root:
```bash
python -m ml_service.src.run_all
```
This single command will:
- Download and verify the benchmark dataset.
- Demonstrate PyMongo CRUD and aggregation queries against MongoDB.
- Train the Linear Regression and Decision Tree models.
- Output evaluation results to `ml_service/results/metrics.json`.
- Persist evaluation snapshots into the MongoDB collection `ml_model_metrics`.

### 3. Run the Web Application
Open two separate terminal windows:

**Terminal 1 (Backend Server):**
```bash
npm start --prefix backend
# Server runs on http://localhost:5001
```

**Terminal 2 (Frontend Client):**
```bash
npm run dev --prefix frontend
# Client runs on http://localhost:5173
```

---

## 📊 Actual Machine Learning Results (Held-Out Test Set)

Evaluated on 80 held-out test vehicles from the UCI Auto MPG benchmark dataset:

### Linear Regression (Continuous Fuel Economy)
- **$R^2$ Score**: **0.7861** (Explains 78.61% of fuel variance)
- **Mean Absolute Error (MAE)**: **2.6732 MPG**
- **Root Mean Squared Error (RMSE)**: **3.5554 MPG**
- **Model Intercept**: **23.4811**

### Decision Tree Classifier (Efficiency Tier, max_depth=4)
- **Accuracy**: **0.8875 (88.75%)**
- **Precision (High Efficiency)**: **0.8974**
- **Recall (Sensitivity)**: **0.8750**
- **F1 Score**: **0.8861**
- **Confusion Matrix**: `[[36, 4], [5, 35]]` (TN: 36, FP: 4, FN: 5, TP: 35)

---

## 📑 Project Report

The complete academic college submission report is available in both formats:
- **Markdown**: [`report/FUEL_INTELLIGENCE_PROJECT_REPORT.md`](report/FUEL_INTELLIGENCE_PROJECT_REPORT.md)
- **Printable PDF**: [`report/FUEL_INTELLIGENCE_PROJECT_REPORT.pdf`](report/FUEL_INTELLIGENCE_PROJECT_REPORT.pdf)

To regenerate the PDF report at any time:
```bash
python report/generate_pdf_report.py
```
