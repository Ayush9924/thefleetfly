// frontend/src/lib/socket.js
import { io } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

let socketInstance = null;

export const initSocket = (token) => {
  if (!socketInstance) {
    socketInstance = io(`${URL}/`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socketInstance.on('connect', () => console.log('Socket connected'));
    socketInstance.on('connect_error', (err) => console.error('Socket connect error:', err));
    socketInstance.on('disconnect', () => console.log('Socket disconnected'));
  }
  return socketInstance;
};

export const getSocket = () => socketInstance;