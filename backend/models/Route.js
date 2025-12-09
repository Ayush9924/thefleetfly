const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  waypoints: [{
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  }],
  distance: {
    type: Number, // in kilometers
    required: true
  },
  duration: {
    type: Number, // in seconds
    required: true
  },
  geometry: String // encoded polyline
}, {
  timestamps: true
});

module.exports = mongoose.model('Route', routeSchema);