// frontend/src/lib/socket.js
import { io } from 'socket.io-client';

// Determine socket URL
const getSocketUrl = () => {
  // Try environment variable first
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // Fallback to API URL without '/api'
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  return apiUrl.replace(/\/api\/?$/, '');
};

const socketUrl = getSocketUrl();

console.log('🔌 Socket Configuration:', {
  socketUrl,
  nodeEnv: import.meta.env.MODE,
});

let socketInstance = null;

export const initSocket = (token) => {
  // Prevent multiple socket instances
  if (socketInstance) {
    console.log('🔌 Socket instance already exists, disconnecting old one...');
    socketInstance.disconnect();
    socketInstance = null;
  }

  if (!token) {
    console.error('❌ No token provided to initSocket');
    return null;
  }

  console.log('🔌 Initializing socket connection');
  console.log('🔌 Socket URL:', socketUrl);
  console.log('🔌 Token available:', !!token);
  
  socketInstance = io(socketUrl, {
    path: '/socket.io/',
    auth: {
      token: token,
    },
    reconnection: true,
    reconnectionAttempts: 10,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
    transports: ['websocket', 'polling'],
    forceNew: false,
    withCredentials: true,
  });

  // Connection event
  socketInstance.on('connect', () => {
    console.log('✅ Socket connected successfully! ID:', socketInstance.id);
  });
  
  // Connection error
  socketInstance.on('connect_error', (error) => {
    console.error('❌ Socket connect_error:', {
      message: error.message,
      type: error.type,
      data: error.data,
    });
  });
  
  // Disconnection event
  socketInstance.on('disconnect', (reason) => {
    console.log('🔌 Socket disconnected. Reason:', reason);
  });

  // Error event
  socketInstance.on('error', (error) => {
    console.error('❌ Socket error:', error);
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