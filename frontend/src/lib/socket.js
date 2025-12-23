// frontend/src/lib/socket.js
import { io } from 'socket.io-client';

// Prefer dedicated socket URL; fallback to API URL without trailing '/api'
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/api\/?$/, '');

console.log('🔌 Socket Configuration:', { apiUrl, socketUrl });

let socketInstance = null;

export const initSocket = (token) => {
  // Disconnect old socket if exists
  if (socketInstance) {
    console.log('🔌 Disconnecting existing socket instance...');
    socketInstance.disconnect();
    socketInstance = null;
  }

  if (!token) {
    console.error('❌ No token provided to initSocket');
    return null;
  }

  // Create new socket with the token
  console.log('🔌 Creating new socket connection');
  console.log('🔌 Socket URL:', socketUrl);
  console.log('🔌 Token provided:', !!token);
  
  socketInstance = io(socketUrl, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000, // 20 second connection timeout
    transports: ['websocket', 'polling'], // Try websocket first, fallback to polling
    forceNew: true, // Force new connection
    withCredentials: true, // Important for CORS with credentials
  });

  socketInstance.on('connect', () => {
    console.log('✅ Socket connected successfully:', socketInstance.id);
  });
  
  socketInstance.on('connect_error', (err) => {
    console.error('❌ Socket connect error:', err.message);
    if (err.data) {
      console.error('❌ Error details:', err.data);
    }
  });
  
  socketInstance.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected, reason:', reason);
  });

  socketInstance.on('error', (error) => {
    console.error('❌ Socket error event:', error);
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    console.log('🔌 Disconnecting socket...');
    socketInstance.disconnect();
    socketInstance = null;
  }
};

export const isSocketConnected = () => {
  return socketInstance && socketInstance.connected;
};