const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const locationService = require('../services/locationService');

// Rate limiter: max 1 REST update per second per driver (in-memory, no packages)
const rateLimitMap = new Map(); // driverId -> timestamp of last update

function haversineMetres(lat1, lon1, lat2, lon2) {
  const R = 6_371_000;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ─── POST /api/location/update ───────────────────────────────────────────────
// Body: { driver_id?, lat, lng, accuracy }
// driver_id defaults to the authenticated user's _id
router.post('/update', protect, (req, res) => {
  try {
    const driverId = req.body.driver_id || req.user._id.toString();
    const { lat, lng, accuracy } = req.body;

    // Validate
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);
    if (isNaN(latitude) || isNaN(longitude) ||
        Math.abs(latitude) > 90 || Math.abs(longitude) > 180) {
      return res.status(400).json({ success: false, message: 'Invalid coordinates' });
    }

    // Rate limit: 1 update/second per driver
    const lastCall = rateLimitMap.get(driverId) || 0;
    const now = Date.now();
    if (now - lastCall < 1000) {
      return res.status(429).json({ success: false, message: 'Rate limit: max 1 update/second' });
    }
    rateLimitMap.set(driverId, now);

    // Compute is_moving vs previous
    const prev = locationService.getLocation(driverId);
    let is_moving = true;
    if (prev) {
      const dist = haversineMetres(prev.latitude, prev.longitude, latitude, longitude);
      is_moving = dist >= 5; // less than 5 m → treat as stopped
    }

    // Persist in memory (existing service)
    const location = locationService.updateLocation(driverId, {
      latitude,
      longitude,
      speed: 0,
      heading: 0,
      accuracy: accuracy ? parseFloat(accuracy) : null,
      timestamp: now,
    });

    return res.json({ success: true, data: { ...location, is_moving } });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/location/all ────────────────────────────────────────────────────
// Returns all drivers updated in the last 30 seconds
router.get('/all', protect, (req, res) => {
  try {
    const all = locationService.getAllActiveLocations();
    const cutoff = Date.now() - 30_000;
    const active = Object.entries(all)
      .filter(([, loc]) => loc && loc.timestamp >= cutoff)
      .map(([driverId, loc]) => ({ driverId, ...loc }));
    return res.json({ success: true, data: active });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ─── GET /api/location/:driver_id ────────────────────────────────────────────
router.get('/:driver_id', protect, (req, res) => {
  try {
    const loc = locationService.getLocation(req.params.driver_id);
    if (!loc) return res.status(404).json({ success: false, message: 'Location not found' });
    return res.json({ success: true, data: loc });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
