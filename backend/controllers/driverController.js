const Driver = require('../models/Driver');

// @desc    Get all drivers
// @route   GET /api/drivers
const getDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create new driver
// @route   POST /api/drivers
const createDriver = async (req, res) => {
  try {
    const driver = new Driver(req.body);
    const createdDriver = await driver.save();
    res.status(201).json(createdDriver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get driver by ID
// @route   GET /api/drivers/:id
const getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.json(driver);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update driver
// @route   PUT /api/drivers/:id
const updateDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json(driver);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete driver
// @route   DELETE /api/drivers/:id
const deleteDriver = async (req, res) => {
  try {
    const driver = await Driver.findByIdAndDelete(req.params.id);
    
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    
    res.json({ message: 'Driver removed' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDrivers,
  createDriver,
  getDriverById,
  updateDriver,
  deleteDriver
};