const Vehicle = require('../models/Vehicle');
const FuelLog = require('../models/FuelLog');
const Maintenance = require('../models/Maintenance');

// @desc    Get cost per km report
// @route   GET /api/reports/cost-per-km
const getCostPerKmReport = async (req, res) => {
  try {
    const { vehicleId, from, to } = req.query;
    
    if (!vehicleId) {
      return res.status(400).json({ message: 'vehicleId is required' });
    }

    let dateFilter = {};
    if (from || to) {
      dateFilter = {};
      if (from) dateFilter.$gte = new Date(from);
      if (to) dateFilter.$lte = new Date(to);
    }

    // Get vehicle
    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Get fuel logs
    const fuelLogs = await FuelLog.find({ 
      vehicle: vehicleId, 
      date: dateFilter 
    }).sort({ date: 1 });

    // Get maintenance records
    const maintenanceRecords = await Maintenance.find({ 
      vehicle: vehicleId, 
      date: dateFilter,
      status: 'completed'
    });

    if (fuelLogs.length === 0) {
      return res.status(404).json({ message: 'No fuel logs found for this period' });
    }

    // Calculate total costs
    const fuelCost = fuelLogs.reduce((sum, log) => sum + log.cost, 0);
    const maintenanceCost = maintenanceRecords.reduce((sum, rec) => sum + rec.cost, 0);
    const totalCost = fuelCost + maintenanceCost;

    // Calculate distance
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
      fuelCost,
      maintenanceCost,
      totalCost,
      distance,
      costPerKm: distance > 0 ? totalCost / distance : 0,
      fuelLogs: fuelLogs.map(log => ({
        date: log.date,
        cost: log.cost,
        liters: log.liters,
        odometer: log.odometer
      })),
      maintenanceRecords: maintenanceRecords.map(rec => ({
        date: rec.date,
        cost: rec.cost,
        description: rec.description
      }))
    };

    res.json(report);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getCostPerKmReport
};