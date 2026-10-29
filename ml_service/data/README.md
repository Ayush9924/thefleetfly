# UCI Auto MPG Benchmark Dataset

## Source & Attribution
- **Dataset Name**: Auto MPG Dataset
- **Repository**: UCI Machine Learning Repository
- **Original Source**: StatLib library, Carnegie Mellon University (collected by Ernesto Ramos and David Donoho)
- **Donor**: Quinlan, R. (1993). Combining Instance-Based and Model-Based Learning.
- **Source URL**: https://archive.ics.uci.edu/ml/machine-learning-databases/auto-mpg/
- **License / Terms**: Open access for research and education.

## Purpose in FleetFly
The FleetFly database in this demonstration environment contains fleet tracking records but insufficient historical consecutive odometer fuel logs (0 records) to train a high-capacity machine learning model without synthetic bias.
To adhere to academic integrity standards, the UCI Auto MPG benchmark dataset is used as a verified, reproducible public automotive dataset to train:
1. **Linear Regression** for continuous Fuel Economy prediction (Miles Per Gallon / Kilometers per Liter).
2. **Decision Tree Classification** for Vehicle Fuel Efficiency Tier categorization (High Efficiency vs Standard Efficiency).

Predictions and benchmarks derived from this dataset are clearly labeled as **Demonstration / Benchmark Results** across the FleetFly Fuel Intelligence interface.

## Dataset Structure
- **Total Instances**: 398 vehicles
- **Total Attributes**: 8 predictive features + 1 target
- **Target Variable (Regression)**: `mpg` (continuous, Miles Per Gallon)
- **Derived Target (Classification)**: `high_efficiency` (binary: 1 if `mpg` >= median, 0 otherwise)

### Features:
1. `cylinders`: Multi-valued discrete (3, 4, 5, 6, 8)
2. `displacement`: Engine displacement in cubic inches (continuous)
3. `horsepower`: Engine power in HP (continuous, 6 missing values imputed via median)
4. `weight`: Vehicle curb weight in pounds (continuous)
5. `acceleration`: Time to accelerate from 0 to 60 mph in seconds (continuous)
6. `model_year`: Model year (70–82, discrete)
7. `origin`: Geographic manufacturing origin (1: North America, 2: Europe, 3: Asia)
8. `car_name`: Vehicle model name (string)

