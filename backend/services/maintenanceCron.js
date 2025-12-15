const cron = require('node-cron');
const Maintenance = require('../models/Maintenance');
const NotificationLog = require('../models/NotificationLog');
const Vehicle = require('../models/Vehicle');

/**
 * Initialize all maintenance cron jobs
 */
const initializeMaintenanceCrons = () => {
  // Run every day at 8:00 AM
  const reminderJob = cron.schedule('0 8 * * *', async () => {
    console.log('🔔 Running maintenance reminder job...');
    try {
      await sendMaintenanceReminders();
      console.log('✅ Maintenance reminders sent');
    } catch (error) {
      console.error('❌ Error sending maintenance reminders:', error.message);
    }
  });

  // Run every hour to check for overdue maintenance
  const overdueJob = cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running overdue maintenance check...');
    try {
      await markOverdueMaintenance();
      console.log('✅ Overdue maintenance marked');
    } catch (error) {
      console.error('❌ Error marking overdue maintenance:', error.message);
    }
  });

  // Run every week to cleanup old notifications (optional)
  const cleanupJob = cron.schedule('0 0 * * 0', async () => {
    console.log('🧹 Running notification cleanup job...');
    try {
      await cleanupOldNotifications();
      console.log('✅ Notification cleanup completed');
    } catch (error) {
      console.error('❌ Error during notification cleanup:', error.message);
    }
  });

  console.log('🚀 Maintenance background jobs initialized');

  return {
    reminderJob,
    overdueJob,
    cleanupJob
  };
};

/**
 * Send reminders for upcoming scheduled maintenance
 * Triggers when reminderDate <= today
 */
const sendMaintenanceReminders = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find scheduled maintenance that needs reminders
    const maintenanceToRemind = await Maintenance.find({
      status: 'scheduled',
      reminderDate: { $lte: today },
      reminderSent: false
    }).populate('vehicle');

    console.log(`📍 Found ${maintenanceToRemind.length} maintenance records needing reminders`);

    for (const maintenance of maintenanceToRemind) {
      try {
        const vehicle = maintenance.vehicle;
        
        // Create reminder notification
        const notification = new NotificationLog({
          type: 'maintenance_scheduled',
          title: `Maintenance Reminder: ${maintenance.description}`,
          message: `${vehicle?.plateNumber || 'Vehicle'} requires ${maintenance.description} on ${new Date(maintenance.nextScheduledDate).toLocaleDateString()}. Priority: ${maintenance.priority}`,
          relatedId: maintenance._id,
          relatedModel: 'Maintenance',
          priority: maintenance.priority,
          status: 'unread'
        });

        await notification.save();

        // Mark reminder as sent
        maintenance.reminderSent = true;
        await maintenance.save();

        console.log(`✉️  Reminder sent for maintenance ID: ${maintenance._id}`);
      } catch (error) {
        console.error(`⚠️  Failed to send reminder for maintenance ${maintenance._id}:`, error.message);
      }
    }

    return maintenanceToRemind.length;
  } catch (error) {
    console.error('Error in sendMaintenanceReminders:', error);
    throw error;
  }
};

/**
 * Mark scheduled maintenance as overdue if nextScheduledDate has passed
 */
const markOverdueMaintenance = async () => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Find scheduled maintenance that is overdue
    const overdueRecords = await Maintenance.find({
      status: 'scheduled',
      nextScheduledDate: { $lt: today }
    }).populate('vehicle');

    console.log(`📍 Found ${overdueRecords.length} overdue maintenance records`);

    for (const maintenance of overdueRecords) {
      try {
        const vehicle = maintenance.vehicle;
        const daysOverdue = Math.floor((today - new Date(maintenance.nextScheduledDate)) / (1000 * 60 * 60 * 24));

        // Update status to overdue
        maintenance.status = 'overdue';
        await maintenance.save();

        // Create overdue notification
        const notification = new NotificationLog({
          type: 'maintenance_due',
          title: `⚠️ Overdue Maintenance: ${maintenance.description}`,
          message: `${vehicle?.plateNumber || 'Vehicle'} has overdue ${maintenance.description} (${daysOverdue} days overdue). Priority: ${maintenance.priority}`,
          relatedId: maintenance._id,
          relatedModel: 'Maintenance',
          priority: maintenance.priority === 'low' ? 'high' : maintenance.priority,
          status: 'unread'
        });

        await notification.save();

        // Update vehicle status if critical priority
        if (maintenance.priority === 'critical') {
          await Vehicle.findByIdAndUpdate(
            vehicle._id,
            { status: 'maintenance' },
            { new: true }
          );
        }

        console.log(`⚠️  Marked maintenance ${maintenance._id} as overdue (${daysOverdue} days)`);
      } catch (error) {
        console.error(`⚠️  Failed to mark maintenance ${maintenance._id} as overdue:`, error.message);
      }
    }

    return overdueRecords.length;
  } catch (error) {
    console.error('Error in markOverdueMaintenance:', error);
    throw error;
  }
};

/**
 * Cleanup old notifications (older than 90 days)
 */
const cleanupOldNotifications = async () => {
  try {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const result = await NotificationLog.deleteMany({
      createdAt: { $lt: ninetyDaysAgo },
      status: 'read'
    });

    console.log(`🗑️  Deleted ${result.deletedCount} old notifications`);
    return result.deletedCount;
  } catch (error) {
    console.error('Error in cleanupOldNotifications:', error);
    throw error;
  }
};

/**
 * Get cron job stats
 */
const getMaintenanceCronStats = async () => {
  try {
    const scheduled = await Maintenance.countDocuments({ status: 'scheduled' });
    const overdue = await Maintenance.countDocuments({ status: 'overdue' });
    const completed = await Maintenance.countDocuments({ status: 'completed' });
    const needsReminder = await Maintenance.countDocuments({
      status: 'scheduled',
      reminderDate: { $lte: new Date() },
      reminderSent: false
    });

    return {
      scheduled,
      overdue,
      completed,
      needsReminder,
      lastRun: new Date()
    };
  } catch (error) {
    console.error('Error getting cron stats:', error);
    throw error;
  }
};

module.exports = {
  initializeMaintenanceCrons,
  sendMaintenanceReminders,
  markOverdueMaintenance,
  cleanupOldNotifications,
  getMaintenanceCronStats
};
