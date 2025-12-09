import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSocket, initSocket } from '../lib/socket';
import { useAuth } from './AuthContext';
import { generateMockLocationUpdates } from '../lib/mockLocationData';

const RealtimeContext = createContext();

export const RealtimeProvider = ({ children }) => {
  const { token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [locations, setLocations] = useState({});
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (token) {
      const s = initSocket(token);
      setSocket(s);
      setIsConnected(s.connected);

      s.on('connect', () => setIsConnected(true));
      s.on('disconnect', () => setIsConnected(false));

      // Location listener
      s.on('driver:location_update', ({ driverId, location }) => {
        setLocations(prev => ({ ...prev, [driverId]: location }));
      });

      // Notification listener
      s.on('notification:new', (notif) => {
        setNotifications(prev => [notif, ...prev]);
        setUnreadCount(c => c + 1);
      });

      // Fallback: Generate mock data if no real data (for demo/development)
      const mockInterval = setInterval(() => {
        const mockUpdates = generateMockLocationUpdates();
        mockUpdates.forEach(update => {
          setLocations(prev => ({ 
            ...prev, 
            [update.driverId]: update 
          }));
        });
      }, 3000); // Update every 3 seconds

      return () => {
        clearInterval(mockInterval);
        if (socket) {
          socket.off('connect');
          socket.off('disconnect');
          socket.off('driver:location_update');
          socket.off('notification:new');
        }
      };
    }
  }, [token]);

  // Convert locations object to array
  const locationsArray = Object.values(locations);

  return (
    <RealtimeContext.Provider
      value={{
        socket,
        isConnected,
        locations: locationsArray,
        notifications,
        unreadCount,
        setUnreadCount,
      }}
    >
      {children}
    </RealtimeContext.Provider>
  );
};

export const useRealtime = () => useContext(RealtimeContext);