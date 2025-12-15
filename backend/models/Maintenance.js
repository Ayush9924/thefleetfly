const mongoose = require('mongoose');

const maintenanceSchema = new mongoose.Schema({
  vehicle: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  description: {
    type: String,
    required: true
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  completedAt: {
    type: Date,
    default: null
  },
  dueDate: Date,
  invoiceImage: String, // Path to uploaded file
  status: {
    type: String,
    enum: ['pending', 'completed', 'scheduled', 'cancelled', 'overdue'],
    default: 'pending'
  },
  // Scheduling fields
  isScheduled: {
    type: Boolean,
    default: false
  },
  scheduleType: {
    type: String,
    enum: ['one-time', 'recurring'],
    default: 'one-time'
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'semi-annual', 'annual'],
    default: null
  },
  scheduledDate: {
    type: Date,
    default: null
  },
  nextScheduledDate: {
    type: Date,
    default: null
  },
  estimatedDuration: {
    type: Number, // in hours
    default: null
  },
  maintenanceType: {
    type: String,
    enum: ['routine', 'preventive', 'corrective', 'predictive'],
    default: 'routine'
  },
  recurrenceEndDate: Date,
  reminderDate: Date,
  reminderSent: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  notes: String,
  estimatedMileage: Number,
  currentMileage: Number
}, {
  timestamps: true
});

// Indexes for efficient querying
maintenanceSchema.index({ vehicle: 1, nextScheduledDate: 1 });
maintenanceSchema.index({ status: 1, nextScheduledDate: 1 });
maintenanceSchema.index({ vehicle: 1, status: 1 });
maintenanceSchema.index({ reminderDate: 1, reminderSent: 1 });
maintenanceSchema.index({ nextScheduledDate: 1, status: 1 });
maintenanceSchema.index({ isScheduled: 1, status: 1 });
maintenanceSchema.index({ createdAt: -1 });
maintenanceSchema.index({ completedAt: 1 });

module.exports = mongoose.model('Maintenance', maintenanceSchema);