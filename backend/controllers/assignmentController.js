const Assignment = require('../models/Assignment');
const Driver = require('../models/Driver');
const Vehicle = require('../models/Vehicle');

// @desc    Create new assignment
// @route   POST /api/assignments
const createAssignment = async (req, res) => {
  try {
    const { vehicle, driver, startDate } = req.body;

    // Check if vehicle exists and is available
    const vehicleDoc = await Vehicle.findById(vehicle);
    if (!vehicleDoc) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    if (vehicleDoc.status !== 'active') {
      return res.status(400).json({ 
        message: 'Vehicle is not available for assignment' 
      });
    }

    // Check if driver exists and is available
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    if (driverDoc.status !== 'available') {
      return res.status(400).json({ 
        message: 'Driver is not available for assignment' 
      });
    }

    // Check for existing active assignments
    const existingAssignment = await Assignment.findOne({
      $or: [
        { vehicle, isActive: true },
        { driver, isActive: true }
      ]
    });

    if (existingAssignment) {
      return res.status(400).json({ 
        message: existingAssignment.vehicle.toString() === vehicle 
          ? 'Vehicle is already assigned to another driver' 
          : 'Driver is already assigned to another vehicle'
      });
    }

    // Create assignment
    const assignment = new Assignment({
      vehicle,
      driver,
      startDate: startDate || new Date()
    });

    await assignment.save();

    // Update statuses
    vehicleDoc.status = 'inactive'; // Mark as in-use
    driverDoc.status = 'assigned';
    
    await Promise.all([vehicleDoc.save(), driverDoc.save()]);

    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all assignments
// @route   GET /api/assignments
const getAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find()
      .populate('vehicle', 'plateNumber make model')
      .populate('driver', 'name licenseNumber')
      .sort({ startDate: -1 });
    
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    End an assignment
// @route   PUT /api/assignments/:id/end
const endAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    if (!assignment.isActive) {
      return res.status(400).json({ message: 'Assignment is already ended' });
    }

    // End the assignment
    assignment.isActive = false;
    assignment.endDate = new Date();
    await assignment.save();

    // Update vehicle and driver status
    const vehicle = await Vehicle.findById(assignment.vehicle);
    const driver = await Driver.findById(assignment.driver);
    
    if (vehicle) {
      vehicle.status = 'active'; // Back to available
      await vehicle.save();
    }
    
    if (driver) {
      driver.status = 'available';
      await driver.save();
    }

    res.json({ ...assignment.toObject(), message: 'Assignment ended successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createAssignment,
  getAssignments,
  endAssignment
};