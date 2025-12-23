import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import { initSocket } from '../lib/socket';
import { mockFleetData } from '../services/mockApi';

const RealtimeContext = createContext();

export const useRealtime = () => useContext(RealtimeContext);

export const RealtimeProvider = ({ children }) => {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const socketRefRef = useRef(null);
  const mockDataSubscriberRef = useRef(null);
  const socketInitializedRef = useRef(false);

  // Initialize socket connection with JWT token
  // Only initialize once when token is available
  useEffect(() => {
    const initializeSocket = () => {
      // Prevent multiple initialization attempts
      if (socketInitializedRef.current) {
        console.log('🔌 RealtimeContext: Socket already initializing/initialized');
        return;
      }
      
      const getToken = () => {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
      };

      const token = getToken();
      
      if (token) {
        socketInitializedRef.current = true;
        console.log('🔌 RealtimeContext: Initializing socket with token');
        const s = initSocket(token);
        setSocket(s);
        socketRefRef.current = s;
      } else {
        console.log('🔌 RealtimeContext: No token yet, will try again...');
        // Retry socket initialization when token becomes available
        const timer = setTimeout(() => {
          socketInitializedRef.current = false;
          initializeSocket();
        }, 500);
        return () => clearTimeout(timer);
      }
    };

    initializeSocket();

    return () => {
      // Don't disconnect on unmount, keep socket alive for navigation
    };
  }, []);

  // Initialize with mock API data - always load for initial display
  useEffect(() => {
    const initializeMockData = async () => {
      try {
        console.log('📡 Loading mock API vehicles for initial display...');
        // Load initial mock API data
        const initialMockVehicles = await mockFleetData.getVehicles(15);
        setLocations(initialMockVehicles);
        setLoading(false);
        console.log('✅ Mock API vehicles loaded:', initialMockVehicles?.length || 0);
        
        // Subscribe to real-time updates from mock API
        const subscriber = mockFleetData.subscribeToUpdates((updatedVehicles) => {
          console.log('🔄 Mock API update received:', updatedVehicles?.length || 0);
          setLocations(updatedVehicles);
        }, 3000);
        
        // Start the updates
        subscriber.start();
        mockDataSubscriberRef.current = subscriber;
        
      } catch (error) {
        console.error('❌ Error initializing mock data:', error);
        setLoading(false);
      }
    };

    // Load mock data immediately
    initializeMockData();

    return () => {
      // Stop mock data updates on cleanup
      if (mockDataSubscriberRef.current) {
        mockDataSubscriberRef.current.stop();
        mockDataSubscriberRef.current = null;
      }
    };
  }, []);

  return (
    <RealtimeContext.Provider value={{ locations, loading, socket }}>
      {children}
    </RealtimeContext.Provider>
  );
};