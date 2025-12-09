const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  plateNumber: { type: String, required: true, unique: true },
  make: String,
  model: String,
  year: Number,
  odometer: { type: Number, default: 0 },
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('Vehicle', vehicleSchema);