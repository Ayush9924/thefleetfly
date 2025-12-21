const Maintenance = require('../models/Maintenance');
const Vehicle = require('../models/Vehicle');
const NotificationLog = require('../models/NotificationLog');

/**
 * Calculate the next scheduled date based on frequency
 * @param {Date} currentDate - The reference date
 * @param {String} frequency - The frequency type (daily, weekly, etc.)
 * @returns {Date|null} The next scheduled date
 */
const calculateNextScheduledDate = (currentDate, frequency) => {
  const date = new Date(currentDate);
  
  switch (frequency) {
    case 'daily':
      date.setDate(date.getDate() + 1);
      break;
    case 'weekly':
      date.setDate(date.getDate() + 7);
      break;
    case 'bi-weekly':
      date.setDate(date.getDate() + 14);
      break;
    case 'monthly':
      date.setMonth(date.getMonth() + 1);
      break;
    case 'quarterly':
      date.setMonth(date.getMonth() + 3);
      break;
    case 'semi-annual':
      date.setMonth(date.getMonth() + 6);
      break;
    case 'annual':
      date.setFullYear(date.getFullYear() + 1);
      break;
    default:
      return null;
  }
  
  return date;
};

/**
 * Calculate reminder date (7 days before scheduled date)
 * @param {Date} scheduledDate - The scheduled maintenance date
 * @returns {Date} The reminder date
 */
const calculateReminderDate = (scheduledDate) => {
  const reminderDate = new Date(scheduledDate);
  reminderDate.setDate(reminderDate.getDate() - 7);
  return reminderDate;
};

/**
 * Create a reminder notification for scheduled maintenance
 * @param {Object} maintenance - The maintenance record
 */
const createScheduleReminder = async (maintenance) => {
  try {
    const vehicle = await Vehicle.findById(maintenance.vehicle);
    
    if (!vehicle) {
      console.warn(`Vehicle not found for maintenance ${maintenance._id}`);
      return;
    }

    const notification = new NotificationLog({
      type: 'maintenance_scheduled',
      title: `Maintenance Scheduled: ${maintenance.description}`,
      message: `${vehicle.plateNumber} has scheduled maintenance on ${maintenance.scheduledDate.toLocaleDateString()}`,
      relatedId: maintenance._id,
      relatedModel: 'Maintenance',
      priority: maintenance.priority,
      status: 'unread'
    });
    
    await notification.save();
  } catch (error) {
    console.error('Error creating reminder notification:', error);
  }
};

/**
 * Create a scheduled maintenance record
 * @param {Object} maintenanceData - The maintenance data
 * @returns {Object} The created maintenance record
 */
const createScheduledMaintenance = async (maintenanceData) => {
  const {
    vehicle,
    description,
    cost,
    scheduleType,
    frequency,
    scheduledDate,
    recurrenceEndDate,
    maintenanceType,
    estimatedDuration,
    priority,
    notes,
    estimatedMileage
  } = maintenanceData;

  // Validate vehicle exists
  const vehicleDoc = await Vehicle.findById(vehicle);
  if (!vehicleDoc) {
    throw new Error('Vehicle not found');
  }

  // Validate scheduledDate is a valid date
  const parsedScheduledDate = new Date(scheduledDate);
  if (isNaN(parsedScheduledDate.getTime())) {
    throw new Error('Invalid scheduledDate');
  }

  let parsedCost = null;
  if (cost !== undefined && cost !== null) {
    parsedCost = parseFloat(cost);
    if (isNaN(parsedCost)) {
      throw new Error('Invalid cost value');
    }
  }

  const maintenance = new Maintenance({
    vehicle,
    description,
    cost: parsedCost,
    // Do NOT set 'date' for scheduled maintenance — only set on completion
    scheduledDate: parsedScheduledDate,
    nextScheduledDate: scheduleType === 'recurring' ? parsedScheduledDate : null,
    isScheduled: true,
    status: 'scheduled',
    scheduleType,
    frequency: scheduleType === 'recurring' ? frequency : null,
    maintenanceType,
    estimatedDuration,
    priority,
    notes,
    recurrenceEndDate: recurrenceEndDate ? new Date(recurrenceEndDate) : null,
    estimatedMileage,
    reminderDate: calculateReminderDate(parsedScheduledDate)
  });

  await maintenance.save();
  
  // Create reminder notification
  await createScheduleReminder(maintenance);
  
  return maintenance;
};

/**
 * Get all upcoming scheduled maintenance
 * @param {Number} daysAhead - Number of days to look ahead (default 30)
 * @returns {Array} Array of upcoming maintenance records
 */
const getUpcomingScheduledMaintenance = async (daysAhead = 30) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Start of today
  
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  futureDate.setHours(23, 59, 59, 999); // End of future date

  return await Maintenance.find({
    status: 'scheduled',
    isScheduled: true,
    // For one-time maintenance, check scheduledDate. For recurring, check nextScheduledDate
    $or: [
      {
        scheduleType: 'one-time',
        scheduledDate: {
          $gte: today,
          $lte: futureDate
        }
      },
      {
        scheduleType: 'recurring',
        nextScheduledDate: {
          $gte: today,
          $lte: futureDate
        }
      }
    ]
  })
  .populate('vehicle', 'plateNumber make model')
  .sort({ scheduledDate: 1, nextScheduledDate: 1 });
};

/**
 * Get overdue scheduled maintenance
 * @returns {Array} Array of overdue maintenance records
 */
const getOverdueScheduledMaintenance = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset to start of day

  return await Maintenance.find({
    isScheduled: true,
    $or: [
      {
        status: 'scheduled',
        scheduleType: 'one-time',
        scheduledDate: { $lt: today }
      },
      {
        status: 'scheduled',
        scheduleType: 'recurring',
        nextScheduledDate: { $lt: today }
      },
      {
        status: 'overdue'
      }
    ]
  })
  .populate('vehicle', 'plateNumber make model')
  .sort({ scheduledDate: 1, nextScheduledDate: 1 });
};

/**
 * Complete a scheduled maintenance and create next occurrence if recurring
 * @param {String} maintenanceId - The maintenance record ID
 * @param {Object} completionData - Completion details (cost, actualMileage, etc.)
 */
const completeScheduledMaintenance = async (maintenanceId, completionData = {}) => {
  const maintenance = await Maintenance.findById(maintenanceId);
  
  if (!maintenance) {
    throw new Error('Maintenance record not found');
  }

  if (maintenance.status === 'completed') {
    throw new Error('Maintenance is already completed');
  }

  // Update the current record
  maintenance.status = 'completed';
  maintenance.completedAt = new Date(); // Set completion timestamp

  if (completionData.actualCost !== undefined && completionData.actualCost !== null) {
    const parsedCost = parseFloat(completionData.actualCost);
    if (isNaN(parsedCost)) {
      throw new Error('Invalid actualCost value');
    }
    maintenance.cost = parsedCost;
  }
  if (completionData.currentMileage !== undefined) {
    maintenance.currentMileage = completionData.currentMileage;
  }

  await maintenance.save();

  // If recurring, create next occurrence
  if (maintenance.scheduleType === 'recurring' && maintenance.frequency) {
    const nextDate = calculateNextScheduledDate(maintenance.nextScheduledDate, maintenance.frequency);
    
    if (nextDate && (!maintenance.recurrenceEndDate || nextDate <= maintenance.recurrenceEndDate)) {
      const nextMaintenance = new Maintenance({
        vehicle: maintenance.vehicle,
        description: maintenance.description,
        cost: maintenance.cost,
        scheduledDate: nextDate,
        nextScheduledDate: nextDate,
        isScheduled: true,
        status: 'scheduled',
        scheduleType: 'recurring',
        frequency: maintenance.frequency,
        maintenanceType: maintenance.maintenanceType,
        estimatedDuration: maintenance.estimatedDuration,
        priority: maintenance.priority,
        notes: maintenance.notes,
        recurrenceEndDate: maintenance.recurrenceEndDate,
        estimatedMileage: maintenance.estimatedMileage,
        reminderDate: calculateReminderDate(nextDate)
      });

      await nextMaintenance.save();
      await createScheduleReminder(nextMaintenance);
    }
  }

  return maintenance;
};

/**
 * Update a scheduled maintenance record
 * @param {String} maintenanceId - The maintenance record ID
 * @param {Object} updateData - The data to update
 */
const updateScheduledMaintenance = async (maintenanceId, updateData) => {
  const maintenance = await Maintenance.findById(maintenanceId);
  
  if (!maintenance) {
    throw new Error('Maintenance record not found');
  }

  if (maintenance.status !== 'scheduled') {
    throw new Error('Cannot update maintenance that is not scheduled');
  }

  const allowedFields = [
    'description',
    'cost',
    'scheduledDate',
    'estimatedDuration',
    'priority',
    'notes',
    'frequency',
    'recurrenceEndDate',
    'maintenanceType',
    'estimatedMileage'
  ];

  for (const field of allowedFields) {
    if (updateData[field] !== undefined) {
      if (['scheduledDate', 'recurrenceEndDate'].includes(field)) {
        const dateVal = new Date(updateData[field]);
        if (isNaN(dateVal.getTime())) {
          throw new Error(`Invalid date for field: ${field}`);
        }
        maintenance[field] = dateVal;
      } else if (field === 'cost') {
        const numVal = parseFloat(updateData[field]);
        if (isNaN(numVal)) {
          throw new Error('Invalid cost value');
        }
        maintenance[field] = numVal;
      } else {
        maintenance[field] = updateData[field];
      }
    }
  }

  // For recurring, update nextScheduledDate to match scheduledDate
  if (updateData.scheduledDate && maintenance.scheduleType === 'recurring') {
    maintenance.nextScheduledDate = maintenance.scheduledDate;
  }

  // Recalculate reminder if scheduled date changed
  if (updateData.scheduledDate) {
    maintenance.reminderDate = calculateReminderDate(maintenance.scheduledDate);
  }

  await maintenance.save();
  return maintenance;
};

/**
 * Cancel a scheduled maintenance
 * @param {String} maintenanceId - The maintenance record ID
 * @param {String} reason - Reason for cancellation
 */
const cancelScheduledMaintenance = async (maintenanceId, reason = '') => {
  const maintenance = await Maintenance.findById(maintenanceId);
  
  if (!maintenance) {
    throw new Error('Maintenance record not found');
  }

  if (maintenance.status !== 'scheduled') {
    throw new Error('Only scheduled maintenance can be cancelled');
  }

  maintenance.status = 'cancelled';
  maintenance.notes = `${maintenance.notes || ''}\nCancellation reason: ${reason}`.trim();
  
  await maintenance.save();
  return maintenance;
};

/**
 * Get maintenance statistics
 * @param {String} vehicleId - Optional vehicle ID to filter by
 */
const getMaintenanceStats = async (vehicleId = null) => {
  const query = vehicleId ? { vehicle: vehicleId } : {};

  const [
    totalScheduled,
    totalCompleted,
    totalPending,
    totalCancelled,
    upcomingCount,
    avgResult,
    totalRecords
  ] = await Promise.all([
    Maintenance.countDocuments({ ...query, status: 'scheduled' }),
    Maintenance.countDocuments({ ...query, status: 'completed' }),
    Maintenance.countDocuments({ ...query, status: 'pending' }),
    Maintenance.countDocuments({ ...query, status: 'cancelled' }),
    Maintenance.countDocuments({
      ...query,
      status: 'scheduled',
      nextScheduledDate: {
        $gte: new Date(),
        $lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
      }
    }),
    Maintenance.aggregate([
      { $match: { ...query, cost: { $ne: null, $gt: 0 } } },
      { $group: { _id: null, avgCost: { $avg: '$cost' } } }
    ]),
    Maintenance.countDocuments(query)
  ]);

  return {
    totalScheduled,
    totalCompleted,
    totalPending,
    totalCancelled,
    upcomingCount,
    totalRecords,
    averageCost: avgResult[0]?.avgCost || 0
  };
};

module.exports = {
  createScheduledMaintenance,
  completeScheduledMaintenance,
  updateScheduledMaintenance,
  cancelScheduledMaintenance,
  getUpcomingScheduledMaintenance,
  getOverdueScheduledMaintenance,
  getMaintenanceStats,
  calculateNextScheduledDate,
  calculateReminderDate
};