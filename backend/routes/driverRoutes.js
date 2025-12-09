const express = require('express');
const router = express.Router();
const { 
  getDrivers, 
  createDriver, 
  getDriverById, 
  updateDriver, 
  deleteDriver 
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router
  .route('/')
  .get(getDrivers)
  .post(authorize('admin', 'manager'), createDriver);

router
  .route('/:id')
  .get(getDriverById)
  .put(authorize('admin', 'manager'), updateDriver)
  .delete(authorize('admin'), deleteDriver);

module.exports = router;