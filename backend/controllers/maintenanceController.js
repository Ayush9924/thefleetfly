const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const upload = require('../middleware/upload');
const maintenanceScheduler = require('../services/maintenanceScheduler');
const path = require('path');
const fs = require('fs');

// @desc    Get all maintenance records
// @route   GET /api/maintenance
const getMaintenance = async (req, res) => {
  try {
    const maintenanceRecords = await Maintenance.find()
      .populate('vehicle', 'plateNumber make model')
      .sort({ date: -1 });
    
    res.json(maintenanceRecords);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get upcoming maintenance
// @route   GET /api/maintenance/upcoming
const getUpcomingMaintenance = async (req, res) => {
  try {
    const upcoming = await Maintenance.find({
      dueDate: { $gte: new Date() },
      status: 'pending'
    })
    .populate('vehicle', 'plateNumber make model')
    .sort({ dueDate: 1 });
    
    res.json(upcoming);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create maintenance record
// @route   POST /api/maintenance
const createMaintenance = async (req, res) => {
  try {
    const { vehicle, description, cost, date, dueDate, status } = req.body;
    
    // Check if vehicle exists
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    const maintenance = new Maintenance({
      vehicle,
      description,
      cost: parseFloat(cost),
      date: date || new Date(),
      dueDate: dueDate || null,
      status: status || 'pending'
    });

    // Handle file upload if exists
    if (req.file) {
      maintenance.invoiceImage = `/uploads/${req.file.filename}`;
    }

    await maintenance.save();
    
    // Update vehicle status if needed
    if (status === 'pending' && vehicleDoc.status !== 'maintenance') {
      vehicleDoc.status = 'maintenance';
      await vehicleDoc.save();
    }

    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update maintenance record
// @route   PUT /api/maintenance/:id
const updateMaintenance = async (req, res) => {
  try {
    const maintenance = await Maintenance.findById(req.params.id);
    if (!maintenance) {
      return res.status(404).json({ message: 'Maintenance record not found' });
    }

    // Update fields
    maintenance.description = req.body.description || maintenance.description;
    maintenance.cost = req.body.cost ? parseFloat(req.body.cost) : maintenance.cost;
    maintenance.date = req.body.date || maintenance.date;
    maintenance.dueDate = req.body.dueDate || maintenance.dueDate;
    maintenance.status = req.body.status || maintenance.status;

    // Handle new file upload
    if (req.file) {
      // Delete old file if exists
      if (maintenance.invoiceImage) {
        const oldFilePath = path.join(__dirname, '..', maintenance.invoiceImage);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }
      
      maintenance.invoiceImage = `/uploads/${req.file.filename}`;
    }

    await maintenance.save();

    // Update vehicle status if maintenance is completed
    if (req.body.status === 'completed' && maintenance.status !== 'completed') {
      const vehicle = await Vehicle.findById(maintenance.vehicle);
      if (vehicle && vehicle.status === 'maintenance') {
        // Check if there are other pending maintenance records
        const otherPending = await Maintenance.countDocuments({
          vehicle: maintenance.vehicle,
          status: 'pending'
        });
        
        if (otherPending === 0) {
          vehicle.status = 'active';
          await vehicle.save();
        }
      }
    }

    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Create scheduled maintenance
// @route   POST /api/maintenance/schedule
const createScheduledMaintenance = async (req, res) => {
  try {
    const maintenance = await maintenanceScheduler.createScheduledMaintenance(req.body);
    res.status(201).json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get upcoming scheduled maintenance
// @route   GET /api/maintenance/scheduled/upcoming
const getUpcomingScheduled = async (req, res) => {
  try {
    const daysAhead = req.query.days ? parseInt(req.query.days) : 30;
    const maintenance = await maintenanceScheduler.getUpcomingScheduledMaintenance(daysAhead);
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get overdue scheduled maintenance
// @route   GET /api/maintenance/scheduled/overdue
const getOverdueScheduled = async (req, res) => {
  try {
    const maintenance = await maintenanceScheduler.getOverdueScheduledMaintenance();
    res.json(maintenance);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Complete a scheduled maintenance
// @route   PUT /api/maintenance/schedule/:id/complete
const completeScheduled = async (req, res) => {
  try {
    const maintenance = await maintenanceScheduler.completeScheduledMaintenance(
      req.params.id,
      req.body
    );
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update scheduled maintenance
// @route   PUT /api/maintenance/schedule/:id
const updateScheduled = async (req, res) => {
  try {
    const maintenance = await maintenanceScheduler.updateScheduledMaintenance(
      req.params.id,
      req.body
    );
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Cancel scheduled maintenance
// @route   PUT /api/maintenance/schedule/:id/cancel
const cancelScheduled = async (req, res) => {
  try {
    const maintenance = await maintenanceScheduler.cancelScheduledMaintenance(
      req.params.id,
      req.body.reason || ''
    );
    res.json(maintenance);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get maintenance statistics
// @route   GET /api/maintenance/stats
const getMaintenanceStats = async (req, res) => {
  try {
    const vehicleId = req.query.vehicleId || null;
    const stats = await maintenanceScheduler.getMaintenanceStats(vehicleId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get maintenance schedule for vehicle
// @route   GET /api/maintenance/vehicle/:vehicleId/schedule
const getVehicleSchedule = async (req, res) => {
  try {
    const schedule = await Maintenance.find({
      vehicle: req.params.vehicleId,
      isScheduled: true,
      status: { $in: ['scheduled', 'pending'] }
    })
    .sort({ nextScheduledDate: 1 });
    
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMaintenance,
  getUpcomingMaintenance,
  createMaintenance: [upload.single('invoiceImage'), createMaintenance],
  updateMaintenance: [upload.single('invoiceImage'), updateMaintenance],
  createScheduledMaintenance,
  getUpcomingScheduled,
  getOverdueScheduled,
  completeScheduled,
  updateScheduled,
  cancelScheduled,
  getMaintenanceStats,
  getVehicleSchedule
};