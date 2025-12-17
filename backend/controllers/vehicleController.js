const Vehicle = require('../models/Vehicle');

// @desc    Get all vehicles
// @route   GET /api/vehicles
const getVehicles = async (req, res) => {
  try {
    console.log('📋 Fetching vehicles from database...');
    const vehicles = await Vehicle.find().sort({ createdAt: -1 }).maxTimeMS(10000);
    console.log(`✅ Found ${vehicles.length} vehicles`);
    res.json(vehicles);
  } catch (error) {
    console.error('❌ Error fetching vehicles:', error.message);
    res.status(500).json({ 
      message: 'Failed to fetch vehicles. ' + error.message,
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// @desc    Create new vehicle
// @route   POST /api/vehicles
const createVehicle = async (req, res) => {
  try {
    const { plateNumber, make, model } = req.body;

    // Validate required fields
    if (!plateNumber || !make || !model) {
      return res.status(400).json({ 
        message: 'Plate number, make, and model are required' 
      });
    }

    // Check if plate number already exists
    const existingVehicle = await Vehicle.findOne({ plateNumber: plateNumber.toUpperCase() });
    if (existingVehicle) {
      return res.status(400).json({ 
        message: 'A vehicle with this plate number already exists' 
      });
    }

    const vehicle = new Vehicle(req.body);
    const createdVehicle = await vehicle.save();
    
    res.status(201).json({
      success: true,
      message: 'Vehicle created successfully',
      data: createdVehicle
    });
  } catch (error) {
    console.error('Error creating vehicle:', error);
    res.status(400).json({ 
      success: false,
      message: error.message || 'Failed to create vehicle',
      errors: error.errors
    });
  }
};

// @desc    Get vehicle by ID
// @route   GET /api/vehicles/:id
const getVehicleById = async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    res.json(vehicle);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update vehicle
// @route   PUT /api/vehicles/:id
const updateVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json(vehicle);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete vehicle
// @route   DELETE /api/vehicles/:id
const deleteVehicle = async (req, res) => {
  try {
    const vehicle = await Vehicle.findByIdAndDelete(req.params.id);
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }
    
    res.json({ message: 'Vehicle removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getVehicles,
  createVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle
};