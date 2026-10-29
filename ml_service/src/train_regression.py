"""
Linear Regression Model for Continuous Fuel Economy Prediction (MPG).
Computes R² Score and Mean Absolute Error (MAE).
"""
import joblib
import numpy as np
from sklearn.linear_model import LinearRegression
from sklearn.metrics import r2_score, mean_absolute_error, root_mean_squared_error

from .config import REGRESSION_MODEL_PATH

def train_regression_model(data_dict):
    """
    Trains a Linear Regression model on standardized vehicle features.
    Evaluates on the 20% held-out test set.
    """
    X_train = data_dict["X_train_scaled"]
    y_train = data_dict["y_reg_train"]
    X_test = data_dict["X_test_scaled"]
    y_test = data_dict["y_reg_test"]
    features = data_dict["features"]

    print("\n--- Training Linear Regression (Fuel Economy MPG) ---")
    model = LinearRegression()
    model.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = model.predict(X_test)

    r2 = float(r2_score(y_test, y_pred))
    mae = float(mean_absolute_error(y_test, y_pred))
    rmse = float(root_mean_squared_error(y_test, y_pred))

    # Feature weights (coefficients)
    coef_dict = {
        feat: round(float(c), 4) for feat, c in zip(features, model.coef_)
    }

    print(f"Regression Test Results:")
    print(f"  - R^2 Score: {r2:.4f}")
    print(f"  - Mean Absolute Error (MAE): {mae:.4f} MPG")
    print(f"  - Root Mean Squared Error (RMSE): {rmse:.4f} MPG")
    print(f"  - Intercept: {model.intercept_:.4f}")
    print(f"  - Feature Coefficients: {coef_dict}")

    # Persist model
    joblib.dump(model, REGRESSION_MODEL_PATH)
    print(f"  - Saved model to {REGRESSION_MODEL_PATH}")

    return {
        "model_name": "Linear Regression",
        "algorithm": "LinearRegression (Ordinary Least Squares)",
        "target_variable": "mpg (Miles Per Gallon continuous)",
        "test_samples": len(y_test),
        "train_samples": len(y_train),
        "r2_score": round(r2, 4),
        "mae": round(mae, 4),
        "rmse": round(rmse, 4),
        "intercept": round(float(model.intercept_), 4),
        "coefficients": coef_dict
    }

if __name__ == "__main__":
    from .preprocess import load_and_preprocess_benchmark_data
    data = load_and_preprocess_benchmark_data()
    train_regression_model(data)
