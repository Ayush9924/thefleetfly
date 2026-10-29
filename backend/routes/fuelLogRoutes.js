const express = require('express');
const router = express.Router();
const { 
  getFuelLogs, 
  createFuelLog,
  getFuelCostReport,
  getFuelIntelligenceSummary,
  getFuelIntelligenceMetrics,
  predictFuelEfficiency,
  getPredictionHistory,
  seedDemoFuelLogs,
  clearDemoFuelLogs
} = require('../controllers/fuelLogController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

// Base fuel logs
router.route('/')
  .get(getFuelLogs)
  .post(authorize('admin', 'manager'), createFuelLog);

router.get('/reports/fuel-cost', authorize('admin', 'manager'), getFuelCostReport);

// Fuel Intelligence Endpoints
router.get('/intelligence/summary', getFuelIntelligenceSummary);
router.get('/intelligence/metrics', getFuelIntelligenceMetrics);
router.post('/intelligence/predict', predictFuelEfficiency);
router.get('/intelligence/predictions', getPredictionHistory);

// Demo Data Management for assignment evaluation
router.post('/seed-demo', authorize('admin', 'manager'), seedDemoFuelLogs);
router.post('/clear-demo', authorize('admin', 'manager'), clearDemoFuelLogs);

module.exports = router;
