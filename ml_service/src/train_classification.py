"""
Decision Tree Classification Model for Vehicle Fuel Efficiency Tier Categorization.
Evaluates Accuracy, Precision, Recall, and F1 Score.
"""
import joblib
import numpy as np
from sklearn.tree import DecisionTreeClassifier
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix

from .config import CLASSIFICATION_MODEL_PATH, RANDOM_SEED

def train_classification_model(data_dict):
    """
    Trains a Decision Tree Classifier to predict whether a vehicle achieves
    High Fuel Efficiency (Class 1) or Standard/Low Efficiency (Class 0).
    """
    X_train = data_dict["X_train_scaled"]
    y_train = data_dict["y_clf_train"]
    X_test = data_dict["X_test_scaled"]
    y_test = data_dict["y_clf_test"]
    features = data_dict["features"]

    print("\n--- Training Decision Tree Classifier (Efficiency Tier) ---")
    # max_depth=4 prevents overfitting and ensures high interpretability
    clf = DecisionTreeClassifier(
        max_depth=4,
        random_state=RANDOM_SEED,
        criterion="gini"
    )
    clf.fit(X_train, y_train)

    # Evaluate on held-out test set
    y_pred = clf.predict(X_test)

    accuracy = float(accuracy_score(y_test, y_pred))
    # Explicit positive class = 1 (High Efficiency)
    precision = float(precision_score(y_test, y_pred, pos_label=1, zero_division=0))
    recall = float(recall_score(y_test, y_pred, pos_label=1, zero_division=0))
    f1 = float(f1_score(y_test, y_pred, pos_label=1, zero_division=0))
    cm = confusion_matrix(y_test, y_pred).tolist()

    feature_importances = {
        feat: round(float(imp), 4) for feat, imp in zip(features, clf.feature_importances_)
    }

    print(f"Classification Test Results (Positive Class = 'High Efficiency'):")
    print(f"  - Accuracy:  {accuracy:.4f} ({accuracy*100:.1f}%)")
    print(f"  - Precision: {precision:.4f}")
    print(f"  - Recall:    {recall:.4f}")
    print(f"  - F1 Score:  {f1:.4f}")
    print(f"  - Confusion Matrix (TN, FP / FN, TP): {cm}")
    print(f"  - Feature Importances: {feature_importances}")

    # Persist model
    joblib.dump(clf, CLASSIFICATION_MODEL_PATH)
    print(f"  - Saved model to {CLASSIFICATION_MODEL_PATH}")

    return {
        "model_name": "Decision Tree Classifier",
        "algorithm": "DecisionTreeClassifier (max_depth=4, criterion='gini')",
        "target_variable": "high_efficiency (1: High Efficiency >= median, 0: Standard)",
        "positive_class": "1 (High Efficiency)",
        "test_samples": len(y_test),
        "train_samples": len(y_train),
        "accuracy": round(accuracy, 4),
        "precision": round(precision, 4),
        "recall": round(recall, 4),
        "f1_score": round(f1, 4),
        "confusion_matrix": cm,
        "feature_importances": feature_importances
    }

if __name__ == "__main__":
    from .preprocess import load_and_preprocess_benchmark_data
    data = load_and_preprocess_benchmark_data()
    train_classification_model(data)

