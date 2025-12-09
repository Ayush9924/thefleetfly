const express = require('express');
const router = express.Router();
const { 
  getMaintenance, 
  getUpcomingMaintenance, 
  createMaintenance, 
  updateMaintenance 
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.route('/')
  .get(getMaintenance)
  .post(authorize('admin', 'manager', 'mechanic'), createMaintenance);

router.get('/upcoming', authorize('admin', 'manager'), getUpcomingMaintenance);

router.route('/:id')
  .put(authorize('admin', 'manager', 'mechanic'), updateMaintenance);

module.exports = router;