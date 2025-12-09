const express = require('express');
const router = express.Router();
const { 
  getFuelLogs, 
  createFuelLog,
  getFuelCostReport
} = require('../controllers/fuelLogController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getFuelLogs)
  .post(authorize('admin', 'manager'), createFuelLog);

router.get('/reports/fuel-cost', authorize('admin', 'manager'), getFuelCostReport);

module.exports = router;