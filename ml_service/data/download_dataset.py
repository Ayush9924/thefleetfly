"""
Script to download and prepare the UCI Auto MPG benchmark dataset.
UCI Machine Learning Repository: Auto MPG Dataset
Source URL: https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/auto-mpg.data
"""
import os
import urllib.request
import pandas as pd

DATA_DIR = os.path.dirname(os.path.abspath(__file__))
RAW_FILE = os.path.join(DATA_DIR, "auto-mpg.data")
CSV_FILE = os.path.join(DATA_DIR, "auto_mpg.csv")

COLUMN_NAMES = [
    "mpg",
    "cylinders",
    "displacement",
    "horsepower",
    "weight",
    "acceleration",
    "model_year",
    "origin",
    "car_name"
]

def download_and_prepare():
    os.makedirs(DATA_DIR, exist_ok=True)
    
    # 1. Download raw data if not present
    if not os.path.exists(RAW_FILE):
        url = "https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/auto-mpg.data"
        print(f"Downloading UCI Auto MPG dataset from {url}...")
        try:
            urllib.request.urlretrieve(url, RAW_FILE)
            print(f"Downloaded to {RAW_FILE}")
        except Exception as e:
            print(f"Error downloading: {e}")
            raise
    else:
        print(f"Raw data already exists at {RAW_FILE}")

    # In pandas 3.x, use sep=r"\s+" instead of delim_whitespace=True
    # The car_name is at the end of each line enclosed in quotes.
    # Lines look like: 18.0   8   307.0      130.0      3504.      12.0   70  1\t"chevrolet chevelle malibu"
    records = []
    with open(RAW_FILE, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split('\t', 1)
            numeric_part = parts[0].strip().split()
            car_name = parts[1].strip().strip('"') if len(parts) > 1 else ""
            if len(numeric_part) >= 8:
                row = {
                    "mpg": float(numeric_part[0]) if numeric_part[0] != '?' else None,
                    "cylinders": int(numeric_part[1]) if numeric_part[1] != '?' else None,
                    "displacement": float(numeric_part[2]) if numeric_part[2] != '?' else None,
                    "horsepower": float(numeric_part[3]) if numeric_part[3] != '?' else None,
                    "weight": float(numeric_part[4]) if numeric_part[4] != '?' else None,
                    "acceleration": float(numeric_part[5]) if numeric_part[5] != '?' else None,
                    "model_year": int(numeric_part[6]) if numeric_part[6] != '?' else None,
                    "origin": int(numeric_part[7]) if numeric_part[7] != '?' else None,
                    "car_name": car_name
                }
                records.append(row)
    df = pd.DataFrame(records)

    # 3. Save clean CSV
    df.to_csv(CSV_FILE, index=False)
    print(f"Saved clean CSV dataset with {len(df)} rows to {CSV_FILE}")
    print(df.head())
    print("\nMissing values per column:")
    print(df.isnull().sum())

if __name__ == "__main__":
    download_and_prepare()
