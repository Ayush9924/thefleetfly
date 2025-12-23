import React, { createContext, useState, useContext, useEffect, useRef, useCallback } from 'react';
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
  const initTimeoutRef = useRef(null);

  // Initialize socket connection with JWT token
  // Reinitialize when token changes (on login/logout)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    if (token) {
      // Defer socket initialization to next tick to avoid blocking initial render
      const timeout = setTimeout(() => {
        console.log('🔌 RealtimeContext: Initializing socket with token');
        const s = initSocket(token);
        setSocket(s);
        socketRefRef.current = s;
      }, 100);
      
      initTimeoutRef.current = timeout;
    } else {
      console.log('🔌 RealtimeContext: No token, clearing socket');
      setSocket(null);
      socketRefRef.current = null;
    }

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, [typeof window !== 'undefined' ? localStorage.getItem('token') : null]);

  // Initialize with mock API data - now deferred
  useEffect(() => {
    const initializeMockData = async () => {
      try {
        console.log('📡 Loading mock API vehicles...');
        // Load initial mock API data
        const initialMockVehicles = await mockFleetData.getVehicles(15);
        setLocations(initialMockVehicles);
        setLoading(false);
        console.log('✅ Mock API vehicles loaded:', initialMockVehicles?.length || 0);
        
        // Subscribe to real-time updates from mock API - only if not using real backend
        const token = localStorage.getItem('token');
        if (!token) {
          const subscriber = mockFleetData.subscribeToUpdates((updatedVehicles) => {
            console.log('🔄 Mock API update received:', updatedVehicles?.length || 0);
            setLocations(updatedVehicles);
          }, 3000);
          
          // Start the updates
          subscriber.start();
          mockDataSubscriberRef.current = subscriber;
        }
        
      } catch (error) {
        console.error('❌ Error initializing mock data:', error);
        setLoading(false);
      }
    };

    // Defer mock data loading to avoid blocking initial render
    const timeout = setTimeout(() => {
      initializeMockData();
    }, 200);

    return () => {
      clearTimeout(timeout);
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