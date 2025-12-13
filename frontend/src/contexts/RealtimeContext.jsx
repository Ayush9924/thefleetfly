import React, { createContext, useState, useContext, useEffect } from 'react';
import { initSocket } from '../lib/socket';
import { getToken } from '../services/api';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);

  // Real US city coordinates for realistic data
  const realCities = [
    { name: 'New York', lat: 40.7128, lng: -74.0060 },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
    { name: 'Chicago', lat: 41.8781, lng: -87.6298 },
    { name: 'Houston', lat: 29.7604, lng: -95.3698 },
    { name: 'Phoenix', lat: 33.4484, lng: -112.0740 },
    { name: 'Philadelphia', lat: 39.9526, lng: -75.1652 },
    { name: 'San Antonio', lat: 29.4241, lng: -98.4936 },
    { name: 'San Diego', lat: 32.7157, lng: -117.1611 },
    { name: 'Dallas', lat: 32.7767, lng: -96.7970 },
    { name: 'San Jose', lat: 37.3382, lng: -121.8863 }
  ];

  // Generate realistic initial data
  const generateInitialData = () => {
    const vehicles = [];
    
    for (let i = 1; i <= 15; i++) {
      const city = realCities[Math.floor(Math.random() * realCities.length)];
      const speed = Math.random() * 80;
      const status = speed > 15 ? 'active' : speed > 0 ? 'idle' : 'stopped';
      
      vehicles.push({
        driverId: `DRV-${String(i).padStart(3, '0')}`,
        vehicleId: `VH-${String(i).padStart(3, '0')}`,
        vehicleType: ['Truck', 'Van', 'Car'][Math.floor(Math.random() * 3)],
        licensePlate: `${['CA','TX','FL','NY','IL'][Math.floor(Math.random() * 5)]}-${String(Math.floor(Math.random() * 900) + 100)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        latitude: city.lat + (Math.random() - 0.5) * 0.05,
        longitude: city.lng + (Math.random() - 0.5) * 0.05,
        speed: speed,
        heading: Math.floor(Math.random() * 360),
        status: status,
        timestamp: Date.now(),
        battery: Math.floor(Math.random() * 30) + 70,
        fuel: Math.floor(Math.random() * 40) + 60,
        temperature: Math.floor(Math.random() * 15) + 20,
        driverName: `Driver ${i}`,
        currentCity: city.name,
        eta: Math.floor(Math.random() * 120) + 30,
        routeProgress: Math.floor(Math.random() * 100)
      });
    }
    
    return vehicles;
  };

  // Initialize socket connection once with JWT token
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || getToken() : null;
    const s = initSocket(token);
    setSocket(s);

    return () => {
      // socket will auto-disconnect when page unloads
    };
  }, []);

  // Initialize with mock data
  useEffect(() => {
    const initialData = generateInitialData();
    setLocations(initialData);
    setLoading(false);
    
    // Set up real-time updates
    const interval = setInterval(() => {
      setLocations(prev => 
        prev.map(vehicle => {
          // Only move active vehicles
          if (vehicle.status === 'active' && Math.random() > 0.3) {
            const moveLat = (Math.random() - 0.5) * 0.001;
            const moveLng = (Math.random() - 0.5) * 0.001;
            
            return {
              ...vehicle,
              latitude: vehicle.latitude + moveLat,
              longitude: vehicle.longitude + moveLng,
              speed: Math.max(0, vehicle.speed + (Math.random() - 0.5) * 10),
              heading: (vehicle.heading + (Math.random() - 0.5) * 20) % 360,
              timestamp: Date.now(),
              fuel: Math.max(0, vehicle.fuel - 0.1),
              routeProgress: Math.min(100, vehicle.routeProgress + 1)
            };
          }
          return { ...vehicle, timestamp: Date.now() };
        })
      );
    }, 3000); // Update every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <RealtimeContext.Provider value={{ locations, loading, socket }}>
      {children}
    </RealtimeContext.Provider>
  );
};