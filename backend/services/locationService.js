// backend/services/locationService.js
const { v4: uuidv4 } = require('uuid');

class LocationService {
  constructor() {
    // In-memory cache: { driverId: { location, history } }
    this.locations = new Map();
    this.historyLimit = 100;
  }

  updateLocation(driverId, data) {
    const { latitude, longitude, speed, heading, accuracy, timestamp = Date.now() } = data;

    // Validate GPS
    if (
      typeof latitude !== 'number' ||
      typeof longitude !== 'number' ||
      Math.abs(latitude) > 90 ||
      Math.abs(longitude) > 180 ||
      (accuracy && accuracy > parseInt(process.env.GPS_ACCURACY_THRESHOLD || '50'))
    ) {
      return null; // Invalid data
    }

    const location = { latitude, longitude, speed, heading, accuracy, timestamp };

    if (!this.locations.has(driverId)) {
      this.locations.set(driverId, {
        current: location,
        history: [],
      });
    }

    const driverData = this.locations.get(driverId);
    driverData.current = location;

    // Maintain last 100 points
    driverData.history.push(location);
    if (driverData.history.length > this.historyLimit) {
      driverData.history.shift();
    }

    return location;
  }

  getLocation(driverId) {
    return this.locations.get(driverId)?.current || null;
  }

  getLocationHistory(driverId) {
    return this.locations.get(driverId)?.history || [];
  }

  getAllActiveLocations() {
    const result = {};
    for (const [id, data] of this.locations.entries()) {
      result[id] = data.current;
    }
    return result;
  }

  isTracking(driverId) {
    return this.locations.has(driverId);
  }
}

module.exports = new LocationService();