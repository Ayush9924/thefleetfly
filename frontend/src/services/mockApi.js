/**
 * Mock API Service for Fleet Management Testing
 * Provides realistic simulated vehicle data and real-time updates
 */

export const mockFleetData = {
  // Generate mock vehicle data
  getVehicles: async (count = 15) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const vehicles = [];
    const cities = [
      { name: 'New York', lat: 40.7128, lng: -74.0060 },
      { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
      { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
      { name: 'Houston', lat: 29.7604, lng: -95.3698 },
      { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    ];
    
    for (let i = 1; i <= count; i++) {
      const city = cities[Math.floor(Math.random() * cities.length)];
      const speed = Math.random() * 80;
      const status = speed > 15 ? 'active' : speed > 0 ? 'idle' : 'stopped';
      
      vehicles.push({
        driverId: `DRV-${String(i).padStart(3, '0')}`,
        vehicleId: `VH-${String(i).padStart(3, '0')}`,
        vehicleType: ['Truck', 'Van', 'Car'][Math.floor(Math.random() * 3)],
        licensePlate: `ABC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
        latitude: city.lat + (Math.random() - 0.5) * 0.1,
        longitude: city.lng + (Math.random() - 0.5) * 0.1,
        speed: speed,
        heading: Math.random() * 360,
        status: status,
        timestamp: Date.now() - Math.random() * 300000,
        battery: Math.floor(Math.random() * 30) + 70,
        fuel: Math.floor(Math.random() * 40) + 60,
        temperature: Math.floor(Math.random() * 15) + 20,
        driverName: `Driver ${i}`,
        phone: `+1 (555) ${Math.floor(100 + Math.random() * 900)}-${Math.floor(1000 + Math.random() * 9000)}`
      });
    }
    
    return vehicles;
  },

  // Subscribe to real-time updates
  subscribeToUpdates: (callback, interval = 3000) => {
    let intervalId;
    
    const start = async () => {
      const updateData = async () => {
        const vehicles = await mockFleetData.getVehicles(15);
        
        // Simulate moving vehicles
        const updatedVehicles = vehicles.map(vehicle => {
          if (vehicle.status === 'active' && Math.random() > 0.3) {
            return {
              ...vehicle,
              latitude: vehicle.latitude + (Math.random() - 0.5) * 0.001,
              longitude: vehicle.longitude + (Math.random() - 0.5) * 0.001,
              speed: Math.max(0, vehicle.speed + (Math.random() - 0.5) * 5),
              heading: (vehicle.heading + (Math.random() - 0.5) * 10) % 360,
              timestamp: Date.now()
            };
          }
          return { ...vehicle, timestamp: Date.now() };
        });
        
        callback(updatedVehicles);
      };
      
      // Initial data
      updateData();
      
      // Set up interval
      intervalId = setInterval(updateData, interval);
    };
    
    const stop = () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
    
    return { start, stop };
  },

  // Get vehicle statistics
  getStats: async () => {
    const vehicles = await mockFleetData.getVehicles();
    
    return {
      total: vehicles.length,
      active: vehicles.filter(v => v.status === 'active').length,
      idle: vehicles.filter(v => v.status === 'idle').length,
      stopped: vehicles.filter(v => v.status === 'stopped').length,
      averageSpeed: vehicles.reduce((sum, v) => sum + v.speed, 0) / vehicles.length,
      totalDistance: vehicles.reduce((sum, v) => sum + (v.speed * 0.1), 0),
      maintenance: Math.floor(Math.random() * 3),
      alerts: Math.floor(Math.random() * 2),
    };
  },

  // Get vehicle history
  getVehicleHistory: async (vehicleId, hours = 24) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const history = [];
    const baseLat = 40.7128;
    const baseLng = -74.0060;
    
    for (let i = hours; i >= 0; i--) {
      history.push({
        timestamp: Date.now() - (i * 3600000),
        latitude: baseLat + (Math.random() - 0.5) * 0.05,
        longitude: baseLng + (Math.random() - 0.5) * 0.05,
        speed: Math.random() * 80,
        heading: Math.random() * 360,
        status: Math.random() > 0.5 ? 'active' : 'idle'
      });
    }
    
    return history;
  }
};
