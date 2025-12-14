// frontend/src/lib/socket.js
import { io } from 'socket.io-client';

// Prefer dedicated socket URL; fallback to API URL without trailing '/api'
const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const socketUrl = import.meta.env.VITE_SOCKET_URL || apiUrl.replace(/\/?api\/?$/, '');

let socketInstance = null;

export const initSocket = (token) => {
  // Disconnect old socket if exists
  if (socketInstance && socketInstance.connected) {
    console.log('🔌 Disconnecting old socket...');
    socketInstance.disconnect();
  }

  // Always create a new socket with the new token
  console.log('🔌 Creating new socket connection with token');
  socketInstance = io(`${socketUrl}/`, {
    auth: { token },
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    forceNew: true, // Force new connection
  });

  socketInstance.on('connect', () => {
    console.log('✅ Socket connected:', socketInstance.id);
  });
  socketInstance.on('connect_error', (err) => {
    console.error('❌ Socket connect error:', err.message);
  });
  socketInstance.on('disconnect', () => {
    console.log('🔌 Socket disconnected');
  });

  return socketInstance;
};

export const getSocket = () => socketInstance;

export const disconnectSocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};