import api from '@/services/api';

/**
 * Push a fresh GPS position to the server (REST fallback).
 * The primary real-time pathway is Socket.io (driver:location_update).

 * @param {number} lat
 * @param {number} lng
 * @param {number|null} accuracy
 */
export const updateLocation = async (lat, lng, accuracy = null) => {
  const { data } = await api.post('/location/update', { lat, lng, accuracy });
  return data;
};

/**
 * Fetch the latest known location for a single driver.
 * @param {string} driverId
 */
export const getLocation = async (driverId) => {
  const { data } = await api.get(`/location/${driverId}`);
  return data.data;
};

/**
 * Fetch all drivers that sent a location update in the last 30 seconds.
 */
export const getAllLocations = async () => {
  const { data } = await api.get('/location/all');
  return data.data;
};

// ── Backward-compat aliases (used by MaintenancePage / PublicLiveTracking) ───
export const getAllVehiclesLocations = getAllLocations;
export const getVehicleLocation = (vehicleId) => getLocation(vehicleId);

/** Calculate distance between two coordinates in km */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const toRad = (v) => (v * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))).toFixed(2);
};

/** Format time difference for display */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  const diffMs   = Date.now() - new Date(timestamp).getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHrs  = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHrs / 24);
  if (diffMins < 1)  return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHrs < 24)  return `${diffHrs} hour${diffHrs > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};

