const mongoose = require('mongoose');

const predictionLogSchema = new mongoose.Schema({
  vehiclePlate: {
    type: String,
    trim: true,
    default: 'DEMO-VEHICLE'
  },
  cylinders: {
    type: Number,
    required: true,
    min: 2,
    max: 16
  },
  displacement: {
    type: Number,
    required: true,
    min: 40
  },
  horsepower: {
    type: Number,
    required: true,
    min: 30
  },
  weight: {
    type: Number,
    required: true,
    min: 500
  },
  acceleration: {
    type: Number,
    default: 15.5
  },
  model_year: {
    type: Number,
    default: 82
  },
  predicted_mpg: {
    type: Number,
    required: true
  },
  predicted_km_per_liter: {
    type: Number,
    required: true
  },
  efficiency_tier: {
    type: String,
    enum: ['High Efficiency', 'Standard Efficiency'],
    required: true
  },
  isBenchmarkDemo: {
    type: Boolean,
    default: true
  },
  user_notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true,
  collection: 'prediction_logs' // Matches PyMongo collection name exactly
});

predictionLogSchema.index({ createdAt: -1 });
predictionLogSchema.index({ predicted_mpg: 1 });

module.exports = mongoose.model('PredictionLog', predictionLogSchema, 'prediction_logs');

