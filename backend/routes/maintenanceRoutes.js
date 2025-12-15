const express = require('express');
const router = express.Router();
const { 
  getMaintenance, 
  getUpcomingMaintenance,
  createMaintenance,
  updateMaintenance,
  createScheduledMaintenance,
  getUpcomingScheduled,
  getOverdueScheduled,
  completeScheduled,
  updateScheduled,
  cancelScheduled,
  getMaintenanceStats,
  getVehicleSchedule
} = require('../controllers/maintenanceController');
const { protect, authorize } = require('../middleware/auth');
const {
  validateRequest,
  createMaintenanceSchema,
  createScheduledMaintenanceSchema,
  updateScheduledMaintenanceSchema,
  completeScheduledMaintenanceSchema,
  cancelScheduledMaintenanceSchema
} = require('../validations/maintenanceValidation');

router.use(protect);

// Regular maintenance routes
router.route('/')
  .get(getMaintenance)
  .post(
    authorize('admin', 'manager', 'mechanic'),
    validateRequest(createMaintenanceSchema),
    createMaintenance
  );

router.get('/upcoming', authorize('admin', 'manager'), getUpcomingMaintenance);

// Scheduled maintenance routes - MUST COME BEFORE /schedule/:id routes
router.get('/scheduled/upcoming', authorize('admin', 'manager'), getUpcomingScheduled);

router.get('/scheduled/overdue', authorize('admin', 'manager'), getOverdueScheduled);

// Statistics route - MUST BE EARLY
router.get('/stats', authorize('admin', 'manager'), getMaintenanceStats);

// Vehicle schedule route
router.get('/vehicle/:vehicleId/schedule', authorize('admin', 'manager'), getVehicleSchedule);

// CREATE scheduled maintenance
router.post(
  '/schedule',
  authorize('admin', 'manager', 'mechanic'),
  validateRequest(createScheduledMaintenanceSchema),
  createScheduledMaintenance
);

// UPDATE scheduled maintenance
router.put(
  '/schedule/:id',
  authorize('admin', 'manager', 'mechanic'),
  validateRequest(updateScheduledMaintenanceSchema),
  updateScheduled
);

// COMPLETE scheduled maintenance
router.put(
  '/schedule/:id/complete',
  authorize('admin', 'manager', 'mechanic'),
  validateRequest(completeScheduledMaintenanceSchema),
  completeScheduled
);

// CANCEL scheduled maintenance
router.put(
  '/schedule/:id/cancel',
  authorize('admin', 'manager', 'mechanic'),
  validateRequest(cancelScheduledMaintenanceSchema),
  cancelScheduled
);

// Regular maintenance routes - LAST (generic :id route)
router.route('/:id')
  .put(authorize('admin', 'manager', 'mechanic'), updateMaintenance);

module.exports = router;