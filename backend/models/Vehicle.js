const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  // Basic Information
  plateNumber: { 
    type: String, 
    required: [true, 'Plate number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  make: { 
    type: String, 
    required: [true, 'Make is required'],
    trim: true
  },
  model: { 
    type: String, 
    required: [true, 'Model is required'],
    trim: true
  },
  year: {
    type: Number,
    min: [1990, 'Year must be at least 1990'],
    max: [new Date().getFullYear() + 1, 'Year cannot be in the future']
  },
  vin: {
    type: String,
    trim: true
  },
  registrationNumber: {
    type: String,
    trim: true
  },

  // Vehicle Details
  status: {
    type: String,
    enum: ['active', 'inactive', 'maintenance', 'retired'],
    default: 'active'
  },
  fuelType: {
    type: String,
    enum: ['petrol', 'diesel', 'electric', 'hybrid'],
    default: 'diesel'
  },
  mileage: {
    type: Number,
    default: 0,
    min: 0
  },

  // Service Dates
  lastServiceDate: Date,
  nextServiceDate: Date,
  insuranceExpiry: Date,

  // Location Information
  latitude: {
    type: Number,
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    min: -180,
    max: 180
  },
  address: {
    type: String,
    trim: true
  },

  // Additional Info
  notes: String,

  // Tracking
  lastUpdatedLocation: Date,
  locationHistory: [{
    latitude: Number,
    longitude: Number,
    address: String,
    timestamp: { type: Date, default: Date.now }
  }]

}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
vehicleSchema.index({ status: 1 });
vehicleSchema.index({ make: 1, model: 1 });
vehicleSchema.index({ createdAt: -1 });
vehicleSchema.index({ 'latitude': 1, 'longitude': 1 });

module.exports = mongoose.model('Vehicle', vehicleSchema);