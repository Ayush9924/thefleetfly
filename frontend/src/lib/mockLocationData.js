/**
 * Mock Location Data Generator
 * Generates simulated driver location data for testing and demo purposes
 */

// Sample driver locations (coordinates with realistic data)
const SAMPLE_DRIVERS = [
  {
    driverId: 'DRV001',
    name: 'John Smith',
    latitude: 40.7128,
    longitude: -74.0060,
    speed: 45.5,
  },
  {
    driverId: 'DRV002',
    name: 'Maria Garcia',
    latitude: 40.7282,
    longitude: -73.7949,
    speed: 62.3,
  },
  {
    driverId: 'DRV003',
    name: 'Ahmed Hassan',
    latitude: 40.6892,
    longitude: -74.0445,
    speed: 38.7,
  },
  {
    driverId: 'DRV004',
    name: 'Sarah Johnson',
    latitude: 40.7505,
    longitude: -73.9972,
    speed: 25.1,
  },
  {
    driverId: 'DRV005',
    name: 'Mike Chen',
    latitude: 40.7614,
    longitude: -73.9776,
    speed: 52.8,
  },
];

/**
 * Generate mock location updates with slight variations
 * Simulates drivers moving on the map
 */
export const generateMockLocationUpdates = () => {
  return SAMPLE_DRIVERS.map(driver => ({
    driverId: driver.driverId,
    latitude: driver.latitude + (Math.random() - 0.5) * 0.05,
    longitude: driver.longitude + (Math.random() - 0.5) * 0.05,
    speed: Math.max(0, driver.speed + (Math.random() - 0.5) * 20),
    timestamp: new Date().toISOString(),
  }));
};

/**
 * Get all sample driver IDs
 */
export const getSampleDriverIds = () => {
  return SAMPLE_DRIVERS.map(d => d.driverId);
};

/**
 * Get mock driver details
 */
export const getMockDriver = (driverId) => {
  return SAMPLE_DRIVERS.find(d => d.driverId === driverId);
};
