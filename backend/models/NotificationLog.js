const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['assignment_created', 'delivery_started', 'delivery_completed', 'vehicle_alert', 'maintenance_due'], required: true },
  title: String,
  message: String,
  relatedId: mongoose.Schema.Types.ObjectId,
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now, expires: 2592000 }, // 30 days
});

notificationSchema.index({ userId: 1, createdAt: -1 });
module.exports = mongoose.model('NotificationLog', notificationSchema);