const mongoose = require('mongoose');

const locationHistorySchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  vehicleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicle' },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  speed: Number,
  accuracy: Number,
  timestamp: { type: Date, default: Date.now, expires: 2592000 }, // 30 days TTL
});

locationHistorySchema.index({ driverId: 1, timestamp: -1 });
module.exports = mongoose.model('LocationHistory', locationHistorySchema);