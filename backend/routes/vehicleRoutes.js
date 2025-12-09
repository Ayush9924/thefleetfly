const express = require('express');
const router = express.Router();
const { 
  getVehicles, 
  createVehicle, 
  getVehicleById, 
  updateVehicle, 
  deleteVehicle 
} = require('../controllers/vehicleController');
const { protect, authorize } = require('../middleware/auth');

// Apply auth middleware to all routes
router.use(protect);

// Admin/Manager only routes
router
  .route('/')
  .get(getVehicles)
  .post(authorize('admin', 'manager'), createVehicle);

router
  .route('/:id')
  .get(getVehicleById)
  .put(authorize('admin', 'manager'), updateVehicle)
  .delete(authorize('admin'), deleteVehicle);

module.exports = router;