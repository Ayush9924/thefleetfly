const FuelLog = require('../models/FuelLog');
const Vehicle = require('../models/Vehicle');

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
        plateNumber: vehicle.plateNumber,
        make: vehicle.make,
        model: vehicle.model
      },
      period: {
        from: from || fuelLogs[0].date,
        to: to || fuelLogs[fuelLogs.length - 1].date
      },
      totalCost,
      totalLiters,
      distance,
      costPerLiter: totalCost / totalLiters,
      costPerKm: distance > 0 ? totalCost / distance : 0
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getFuelLogs,
  createFuelLog,
  getFuelCostReport
};