"""
Configuration module for the FleetFly ML Service.
Safely resolves MongoDB connection strings and project directories.
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Base paths
SRC_DIR = Path(__file__).resolve().parent
ML_SERVICE_DIR = SRC_DIR.parent
PROJECT_ROOT = ML_SERVICE_DIR.parent
DATA_DIR = ML_SERVICE_DIR / "data"
MODELS_DIR = ML_SERVICE_DIR / "models"
RESULTS_DIR = ML_SERVICE_DIR / "results"

# Ensure runtime directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
RESULTS_DIR.mkdir(parents=True, exist_ok=True)

# Load environment variables from backend or ml_service .env
env_candidates = [
    ML_SERVICE_DIR / ".env",
    PROJECT_ROOT / "backend" / ".env",
    PROJECT_ROOT / ".env"
]
loaded_env_path = None
for env_path in env_candidates:
    if env_path.exists():
        load_dotenv(dotenv_path=env_path)
        loaded_env_path = env_path
        break

# MongoDB URI resolution
MONGODB_URI = os.getenv("MONGODB_URI") or os.getenv("MONGO_URI") or "mongodb://localhost:27017/fleetdb"
DB_NAME = os.getenv("DB_NAME", "fleetdb")
ML_MODE = os.getenv("ML_MODE", "cloud")

# File paths
CSV_DATASET_PATH = DATA_DIR / "auto_mpg.csv"
METRICS_JSON_PATH = RESULTS_DIR / "metrics.json"
REGRESSION_MODEL_PATH = MODELS_DIR / "linear_regression.joblib"
CLASSIFICATION_MODEL_PATH = MODELS_DIR / "decision_tree.joblib"
SCALER_PATH = MODELS_DIR / "scaler.joblib"

RANDOM_SEED = 42
TEST_SIZE = 0.20

