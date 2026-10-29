const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');
const PredictionLog = require('../models/PredictionLog');

// @desc    Get all fuel logs
// @route   GET /api/fuels
const getFuelLogs = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    let filter = {};
    
    if (vehicleId) filter.vehicle = vehicleId;
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = new Date(from);
      if (to) filter.date.$lte = new Date(to);
    }

    const fuelLogs = await FuelLog.find(filter)
      .populate('vehicle', 'plateNumber make model')
      .sort({ date: -1 });
    
    res.json(fuelLogs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create fuel log
// @route   POST /api/fuels
const createFuelLog = async (req, res) => {
  try {
    const { vehicle, liters, cost, date, odometer } = req.body;
    
    // Check if vehicle exists
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Create fuel log
    const fuelLog = new FuelLog({
      vehicle,
      liters: parseFloat(liters),
      cost: parseFloat(cost),
      date: date || new Date(),
      odometer: parseInt(odometer)
    });

    await fuelLog.save();

    // Update vehicle odometer if new reading is higher
    if (odometer > vehicleDoc.odometer) {
      vehicleDoc.odometer = odometer;
      await vehicleDoc.save();
    }

    res.status(201).json(fuelLog);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get fuel cost report
// @route   GET /api/reports/fuel-cost
const getFuelCostReport = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    
    if (!vehicleId) {
      return res.status(400).json({ message: 'vehicleId is required' });
    }

    let filter = {
      vehicle: vehicleId,
      date: {}
    };
    
    if (from) filter.date.$gte = new Date(from);
    if (to) filter.date.$lte = new Date(to);

    const fuelLogs = await FuelLog.find(filter).sort({ date: 1 });
    
    if (fuelLogs.length === 0) {
      return res.status(404).json({ message: 'No fuel logs found for this period' });
    }

    // Calculate total cost and fuel
    const totalCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const totalLiters = fuelLogs.reduce((sum, log) => sum + log.liters, 0);
    
    // Get vehicle for odometer readings
    const vehicle = await Vehicle.findById(vehicleId);
    const startOdometer = fuelLogs[0].odometer;
    const endOdometer = fuelLogs[fuelLogs.length - 1].odometer;
    const distance = endOdometer - startOdometer;

    const report = {
      vehicle: {
        plateNumber: vehicle?.plateNumber || 'Unknown',
        make: vehicle?.make || '',
        model: vehicle?.model || ''
      },
      period: {
        from: from || fuelLogs[0].date,
        to: to || fuelLogs[fuelLogs.length - 1].date
      },
      totalCost,
      totalLiters,
      distance,
      costPerLiter: totalLiters > 0 ? totalCost / totalLiters : 0,
      costPerKm: distance > 0 ? totalCost / distance : 0
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
// FUEL INTELLIGENCE ENHANCEMENTS
// ==========================================

// Helper: load model metrics from MongoDB or fallback to metrics.json
const loadMetrics = async () => {
  try {
    const db = mongoose.connection.db;
    if (db) {
      const dbMetric = await db.collection('ml_model_metrics')
        .find()
        .sort({ created_at: -1 })
        .limit(1)
        .toArray();
      if (dbMetric && dbMetric.length > 0) {
        return dbMetric[0];
      }
    }
  } catch (err) {
    console.warn('[Fuel Intelligence] Could not read metrics from MongoDB collection:', err.message);
  }

  // Fallback to local metrics.json file
  const metricsPath = path.join(__dirname, '..', '..', 'ml_service', 'results', 'metrics.json');
  if (fs.existsSync(metricsPath)) {
    return JSON.parse(fs.readFileSync(metricsPath, 'utf8'));
  }

  // Static fallback if file is not found
  return {
    summary: {
      r2_score: 0.7861,
      mae: 2.6732,
      accuracy: 0.8875,
      precision: 0.8974,
      recall: 0.875,
      f1_score: 0.8861
    },
    regression: {
      model_name: "Linear Regression",
      r2_score: 0.7861,
      mae: 2.6732,
      intercept: 23.4811,
      coefficients: {
        cylinders: -0.9777,
        displacement: 1.5617,
        horsepower: -0.2463,
        weight: -5.9299,
        acceleration: 0.1456,
        model_year: 2.9213
      }
    },
    classification: {
      model_name: "Decision Tree Classifier",
      accuracy: 0.8875,
      precision: 0.8974,
      recall: 0.875,
      f1_score: 0.8861
    },
    dataset: {
      name: "UCI Auto MPG Benchmark Dataset",
      median_mpg_threshold: 23.0
    }
  };
};

// @desc    Get Fuel Intelligence Summary (Aggregated real fleet logs + stats)
// @route   GET /api/fuels/intelligence/summary
const getFuelIntelligenceSummary = async (req, res) => {
  try {
    const totalLogs = await FuelLog.countDocuments();
    
    if (totalLogs === 0) {
      return res.json({
        hasRealData: false,
        totalRecords: 0,
        totalLiters: 0,
        totalCost: 0,
        avgCostPerLiter: 0,
        fleetEfficiencyKmPerLiter: null,
        perVehicleStats: [],
        message: 'No real fuel logs recorded yet. You can add entries or load the demo dataset to preview analytics.'
      });
    }

    // MongoDB Aggregation Pipeline: group by vehicle
    const pipeline = [
      {
        $match: {
          liters: { $gt: 0 },
          cost: { $gt: 0 }
        }
      },
      {
        $group: {
          _id: "$vehicle",
          totalLiters: { $sum: "$liters" },
          totalCost: { $sum: "$cost" },
          recordsCount: { $sum: 1 },
          minOdometer: { $min: "$odometer" },
          maxOdometer: { $max: "$odometer" }
        }
      },
      {
        $lookup: {
          from: "vehicles",
          localField: "_id",
          foreignField: "_id",
          as: "vehicleDetails"
        }
      },
      {
        $unwind: {
          path: "$vehicleDetails",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          vehicleId: "$_id",
          plateNumber: { $ifNull: ["$vehicleDetails.plateNumber", "Unknown"] },
          make: { $ifNull: ["$vehicleDetails.make", ""] },
          model: { $ifNull: ["$vehicleDetails.model", ""] },
          totalLiters: { $round: ["$totalLiters", 2] },
          totalCost: { $round: ["$totalCost", 2] },
          recordsCount: 1,
          distanceTraveled: { $subtract: ["$maxOdometer", "$minOdometer"] }
        }
      }
    ];

    const perVehicle = await FuelLog.aggregate(pipeline);

    let totalLiters = 0;
    let totalCost = 0;
    let totalDistance = 0;

    perVehicle.forEach(v => {
      totalLiters += v.totalLiters || 0;
      totalCost += v.totalCost || 0;
      const dist = v.distanceTraveled || 0;
      totalDistance += dist > 0 ? dist : 0;
      
      // Calculate efficiency if distance > 0 and liters > 0
      v.kmPerLiter = (dist > 0 && v.totalLiters > 0)
        ? Math.round((dist / v.totalLiters) * 100) / 100
        : null;
      v.costPerKm = (dist > 0 && v.totalCost > 0)
        ? Math.round((v.totalCost / dist) * 100) / 100
        : null;
    });

    const fleetEfficiency = (totalDistance > 0 && totalLiters > 0)
      ? Math.round((totalDistance / totalLiters) * 100) / 100
      : null;

    res.json({
      hasRealData: true,
      totalRecords: totalLogs,
      totalLiters: Math.round(totalLiters * 100) / 100,
      totalCost: Math.round(totalCost * 100) / 100,
      avgCostPerLiter: totalLiters > 0 ? Math.round((totalCost / totalLiters) * 100) / 100 : 0,
      fleetEfficiencyKmPerLiter: fleetEfficiency,
      perVehicleStats: perVehicle
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get ML Model Evaluation Metrics
// @route   GET /api/fuels/intelligence/metrics
const getFuelIntelligenceMetrics = async (req, res) => {
  try {
    const metrics = await loadMetrics();
    res.json({ success: true, metrics });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Predict vehicle fuel efficiency & log prediction to MongoDB
// @route   POST /api/fuels/intelligence/predict
const predictFuelEfficiency = async (req, res) => {
  try {
    const {
      cylinders = 4,
      displacement = 140,
      horsepower = 90,
      weight = 2500,
      acceleration = 15.5,
      model_year = 82,
      vehiclePlate = 'DEMO-VEHICLE',
      user_notes = ''
    } = req.body;

    const metrics = await loadMetrics();
    const lr = metrics.regression || {};
    const intercept = lr.intercept || 23.4811;
    const coef = lr.coefficients || {
      cylinders: -0.9777,
      displacement: 1.5617,
      horsepower: -0.2463,
      weight: -5.9299,
      acceleration: 0.1456,
      model_year: 2.9213
    };

    // Scaler parameters from training
    const scalerMean = metrics.dataset?.scaler_params?.mean || [5.484, 194.618, 104.69, 2966.02, 15.482, 75.808];
    const scalerScale = metrics.dataset?.scaler_params?.scale || [1.71, 106.166, 38.656, 855.314, 2.833, 3.663];

    // Standardize input features
    const rawInputs = [
      Number(cylinders),
      Number(displacement),
      Number(horsepower),
      Number(weight),
      Number(acceleration),
      Number(model_year)
    ];

    const scaledInputs = rawInputs.map((val, idx) => (val - scalerMean[idx]) / scalerScale[idx]);

    // Linear Regression Formula: y = intercept + sum(coef_i * z_i)
    let predictedMpg = intercept +
      (coef.cylinders * scaledInputs[0]) +
      (coef.displacement * scaledInputs[1]) +
      (coef.horsepower * scaledInputs[2]) +
      (coef.weight * scaledInputs[3]) +
      (coef.acceleration * scaledInputs[4]) +
      (coef.model_year * scaledInputs[5]);

    // Clamp to plausible bounds
    predictedMpg = Math.max(5.0, Math.min(65.0, predictedMpg));
    predictedMpg = Math.round(predictedMpg * 100) / 100;

    // Convert MPG to Km/L (1 MPG ≈ 0.425144 km/L)
    const predictedKmPerLiter = Math.round((predictedMpg * 0.425144) * 100) / 100;

    // Decision Tree Classification: Threshold is median MPG (23.0 MPG)
    const threshold = metrics.dataset?.median_mpg_threshold || 23.0;
    const efficiencyTier = predictedMpg >= threshold ? 'High Efficiency' : 'Standard Efficiency';

    // Persist prediction document to MongoDB 'prediction_logs'
    const newPrediction = new PredictionLog({
      vehiclePlate: vehiclePlate || 'DEMO-VEHICLE',
      cylinders: Number(cylinders),
      displacement: Number(displacement),
      horsepower: Number(horsepower),
      weight: Number(weight),
      acceleration: Number(acceleration),
      model_year: Number(model_year),
      predicted_mpg: predictedMpg,
      predicted_km_per_liter: predictedKmPerLiter,
      efficiency_tier: efficiencyTier,
      isBenchmarkDemo: true,
      user_notes: user_notes || ''
    });

    await newPrediction.save();

    // Retrieve recent history
    const recentPredictions = await PredictionLog.find().sort({ createdAt: -1 }).limit(10);

    res.json({
      success: true,
      prediction: {
        _id: newPrediction._id,
        predictedMpg,
        predictedKmPerLiter,
        efficiencyTier,
        threshold,
        vehiclePlate: newPrediction.vehiclePlate,
        createdAt: newPrediction.createdAt
      },
      recentPredictions
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recent prediction logs from MongoDB
// @route   GET /api/fuels/intelligence/predictions
const getPredictionHistory = async (req, res) => {
  try {
    const history = await PredictionLog.find().sort({ createdAt: -1 }).limit(15);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Seed realistic demo fuel logs for demonstration
// @route   POST /api/fuels/seed-demo
const seedDemoFuelLogs = async (req, res) => {
  try {
    let vehicles = await Vehicle.find().limit(2);
    if (vehicles.length === 0) {
      const v1 = new Vehicle({
        plateNumber: 'FL-DEMO-01',
        make: 'Toyota',
        model: 'Fortuner',
        year: 2022,
        status: 'active',
        fuelType: 'diesel'
      });
      const v2 = new Vehicle({
        plateNumber: 'FL-DEMO-02',
        make: 'Ford',
        model: 'Transit',
        year: 2021,
        status: 'active',
        fuelType: 'diesel'
      });
      await v1.save();
      await v2.save();
      vehicles = [v1, v2];
    }

    const v1Id = vehicles[0]._id;
    const v2Id = vehicles[1]?._id || vehicles[0]._id;

    // Realistic consecutive entries
    const demoLogs = [
      // Vehicle 1
      { vehicle: v1Id, liters: 45.0, cost: 67.5, odometer: 45000, date: new Date(Date.now() - 25 * 86400000) },
      { vehicle: v1Id, liters: 44.5, cost: 66.75, odometer: 45540, date: new Date(Date.now() - 18 * 86400000) }, // 540km / 44.5L = 12.13 km/L
      { vehicle: v1Id, liters: 43.0, cost: 64.5, odometer: 46070, date: new Date(Date.now() - 11 * 86400000) },  // 530km / 43L = 12.33 km/L
      { vehicle: v1Id, liters: 46.2, cost: 69.3, odometer: 46630, date: new Date(Date.now() - 3 * 86400000) },   // 560km / 46.2L = 12.12 km/L
      // Vehicle 2
      { vehicle: v2Id, liters: 55.0, cost: 82.5, odometer: 82000, date: new Date(Date.now() - 24 * 86400000) },
      { vehicle: v2Id, liters: 56.5, cost: 84.75, odometer: 82510, date: new Date(Date.now() - 16 * 86400000) }, // 510km / 56.5L = 9.03 km/L
      { vehicle: v2Id, liters: 54.0, cost: 81.0, odometer: 83015, date: new Date(Date.now() - 9 * 86400000) },   // 505km / 54L = 9.35 km/L
      { vehicle: v2Id, liters: 57.2, cost: 85.8, odometer: 83540, date: new Date(Date.now() - 2 * 86400000) }    // 525km / 57.2L = 9.18 km/L
    ];

    await FuelLog.insertMany(demoLogs);

    res.json({
      success: true,
      message: 'Demo fuel logs successfully seeded with valid consecutive odometer records.',
      count: demoLogs.length
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Clear demo fuel logs
// @route   POST /api/fuels/clear-demo
const clearDemoFuelLogs = async (req, res) => {
  try {
    const result = await FuelLog.deleteMany({});
    res.json({
      success: true,
      message: 'All fuel logs cleared successfully.',
      deletedCount: result.deletedCount
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFuelLogs,
  createFuelLog,
  getFuelCostReport,
  getFuelIntelligenceSummary,
  getFuelIntelligenceMetrics,
  predictFuelEfficiency,
  getPredictionHistory,
  seedDemoFuelLogs,
  clearDemoFuelLogs
};
