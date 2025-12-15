/**
 * Get vehicle location data from live tracking
 */
export const getVehicleLocation = async (vehicleId) => {
  try {
    const response = await fetch(`/api/location/vehicle/${vehicleId}/latest`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicle location:', error);
    return null;
  }
};

/**
 * Get all vehicles locations
 */
export const getAllVehiclesLocations = async () => {
  try {
    const response = await fetch('/api/location/vehicles/latest', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) return [];
    return await response.json();
  } catch (error) {
    console.error('Error fetching vehicles locations:', error);
    return [];
  }
};

/**
 * Calculate distance between two coordinates (in km)
 */
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return (R * c).toFixed(2);
};

/**
 * Format time difference (minutes ago, hours ago, etc.)
 */
export const formatTimeAgo = (timestamp) => {
  if (!timestamp) return 'Unknown';
  
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
};
