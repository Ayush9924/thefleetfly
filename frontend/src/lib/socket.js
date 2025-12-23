// frontend/src/lib/socket.js
import { io } from 'socket.io-client';

let socketInstance = null;
let initAttempts = 0;
const MAX_INIT_ATTEMPTS = 5;

const getSocketUrl = () => {
  // Use environment variable if available
  if (import.meta.env.VITE_SOCKET_URL) {
    console.log('🔌 Using VITE_SOCKET_URL:', import.meta.env.VITE_SOCKET_URL);
    return import.meta.env.VITE_SOCKET_URL;
  }
  
  // Fallback to API URL
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';
  const url = apiUrl.replace(/\/api\/?$/, '');
  console.log('🔌 Derived socket URL from API URL:', url);
  return url;
};

export const initSocket = (token) => {
  // Don't reinitialize if socket already exists and is connected
  if (socketInstance && socketInstance.connected) {
    console.log('✅ Socket already connected, reusing:', socketInstance.id);
    return socketInstance;
  }

  // Disconnect any existing socket instance
  if (socketInstance) {
    console.log('🔌 Disconnecting previous socket instance');
    socketInstance.disconnect();
    socketInstance = null;
  }

  // Validate token
  if (!token) {
    console.error('❌ initSocket: No token provided');
    return null;
  }

  const socketUrl = getSocketUrl();
  initAttempts++;

  console.log(`🔌 [Attempt ${initAttempts}] Creating socket connection to: ${socketUrl}`);
  console.log('🔌 Token length:', token.length);
  
  try {
    socketInstance = io(socketUrl, {
      path: '/socket.io/',
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 45000,
      transports: ['websocket', 'polling'],
      withCredentials: true,
    });

    // Connection success
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected! ID:', socketInstance.id);
      initAttempts = 0; // Reset attempts on successful connection
    });

    // Connection error
    socketInstance.on('connect_error', (error) => {
      console.error('❌ Socket connection error:', {
        message: error.message,
        code: error.code,
        context: error.context?.type,
      });
    });

    // Disconnection
    socketInstance.on('disconnect', (reason) => {
      console.log('🔌 Socket disconnected. Reason:', reason);
    });

    // Generic error
    socketInstance.on('error', (data) => {
      console.error('❌ Socket error:', data);
    });

    return socketInstance;
  } catch (error) {
    console.error('❌ Failed to create socket:', error.message);
    return null;
  }
};

export const getSocket = () => socketInstance;

export const isSocketConnected = () => {
  return !!(socketInstance && socketInstance.connected);
};

export const disconnectSocket = () => {
  if (socketInstance) {
    console.log('🔌 Disconnecting socket');
    socketInstance.disconnect();
    socketInstance = null;
  }
};