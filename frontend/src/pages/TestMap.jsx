import React, { useState, useEffect } from 'react';
import LiveMapTracker from '../components/LiveMapTracker';

export default function TestMap() {
  const [testDrivers, setTestDrivers] = useState([]);

  useEffect(() => {
    // Create simple test data
    const drivers = [
      {
        driverId: 'DRV-001',
        latitude: 40.7128,
        longitude: -74.0060,
        speed: 45.5,
        status: 'active',
        vehicleType: 'Truck',
        fuel: 85,
        battery: 92,
        timestamp: Date.now()
      },
      {
        driverId: 'DRV-002',
        latitude: 40.7580,
        longitude: -73.9855,
        speed: 32.1,
        status: 'idle',
        vehicleType: 'Van',
        fuel: 45,
        battery: 78,
        timestamp: Date.now()
      },
      {
        driverId: 'DRV-003',
        latitude: 40.7505,
        longitude: -74.0060,
        speed: 0,
        status: 'stopped',
        vehicleType: 'Car',
        fuel: 65,
        battery: 88,
        timestamp: Date.now()
      }
    ];
    
    setTestDrivers(drivers);
    
    // Update positions every 5 seconds
    const interval = setInterval(() => {
      setTestDrivers(prev => prev.map(driver => ({
        ...driver,
        latitude: driver.latitude + (Math.random() - 0.5) * 0.001,
        longitude: driver.longitude + (Math.random() - 0.5) * 0.001,
        speed: Math.max(0, driver.speed + (Math.random() - 0.5) * 5),
        timestamp: Date.now()
      })));
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const handleDriverClick = (driverId) => {
    console.log('Driver clicked:', driverId);
  };

  return (
    <div className="min-h-screen bg-gray-950 p-8">
      <h1 className="text-2xl font-bold text-white mb-6">Map Test Page</h1>
      <p className="text-gray-400 mb-4">This is a simple test to verify the map loads correctly.</p>
      
      <div className="h-[600px] w-full bg-gray-900 rounded-xl overflow-hidden">
        <LiveMapTracker 
          drivers={testDrivers}
          onDriverClick={handleDriverClick}
        />
      </div>
      
      <div className="mt-6 p-4 bg-gray-900 rounded-xl">
        <h2 className="text-lg font-semibold text-white mb-3">Test Data</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {testDrivers.map(driver => (
            <div key={driver.driverId} className="p-4 bg-gray-800 rounded-lg">
              <h3 className="font-medium text-white">{driver.driverId}</h3>
              <p className="text-sm text-gray-400">Type: {driver.vehicleType}</p>
              <p className="text-sm text-gray-400">Status: {driver.status}</p>
              <p className="text-sm text-gray-400">Speed: {driver.speed.toFixed(1)} km/h</p>
              <p className="text-sm text-gray-400">
                Location: {driver.latitude.toFixed(4)}, {driver.longitude.toFixed(4)}
              </p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-900/20 border border-blue-800 rounded-xl">
        <h3 className="text-lg font-semibold text-blue-300 mb-2">Troubleshooting Tips</h3>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>✓ Check browser console for errors (F12)</li>
          <li>✓ Verify Leaflet is installed: <code>npm list leaflet</code></li>
          <li>✓ Check if map container has proper height</li>
          <li>✓ Try disabling browser extensions</li>
          <li>✓ Test in incognito/private mode</li>
        </ul>
      </div>
    </div>
  );
}
