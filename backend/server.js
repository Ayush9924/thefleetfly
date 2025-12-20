require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/error');
const cors = require('cors');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');

// Connect to database
connectDB();

const app = express();
const server = http.createServer(app);

// Socket.io setup with Redis adapter for production
let io;

if (process.env.REDIS_URL) {
  const { createAdapter } = require('@socket.io/redis-adapter');
  const { createClient } = require('redis');
  
  const redisClientPub = createClient({ url: process.env.REDIS_URL });
  const redisClientSub = createClient({ url: process.env.REDIS_URL });
  
  Promise.all([redisClientPub.connect(), redisClientSub.connect()]).then(() => {
    io = new socketIo.Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [process.env.FRONTEND_URL || 'https://thefleetfly-frontend.vercel.app']
          : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
        credentials: true,
      },
      adapter: createAdapter({ pubClient: redisClientPub, subClient: redisClientSub }),
    });
    console.log('✅ Socket.io initialized with Redis adapter');
  }).catch(err => {
    console.error('❌ Redis connection failed, falling back to in-memory adapter:', err.message);
    io = new socketIo.Server(server, {
      cors: {
        origin: process.env.NODE_ENV === 'production' 
          ? [process.env.FRONTEND_URL || 'https://thefleetfly-frontend.vercel.app']
          : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
        credentials: true,
      },
    });
  });
} else {
  io = new socketIo.Server(server, {
    cors: {
      origin: process.env.NODE_ENV === 'production' 
        ? (process.env.FRONTEND_URL || 'https://thefleetfly-frontend.vercel.app')
        : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
      credentials: true,
    },
  });
  console.log('✅ Socket.io initialized in development mode');
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL || 'https://thefleetfly-frontend.vercel.app'] 
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176'],
  credentials: true
}));
app.use(morgan('dev'));

// Health check route
app.get('/', (req, res) => {
  res.json({ 
    message: 'Fleet Management API',
    status: 'running',
    version: '1.0.0'
  });
});

// Database health check endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState;
  const statuses = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  
  res.json({
    status: 'running',
    database: statuses[dbStatus],
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/usersRoutes'));
app.use('/api/vehicles', require('./routes/vehicleRoutes'));
app.use('/api/drivers', require('./routes/driverRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/fuels', require('./routes/fuelLogRoutes'));
app.use('/api/routes', require('./routes/routeRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

// Serve static files (for uploaded images)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve frontend build (Vite -> dist, CRA -> build) when present
const viteDist = path.join(__dirname, '..', 'frontend', 'dist');
const craBuild = path.join(__dirname, '..', 'frontend', 'build');

if (fs.existsSync(viteDist)) {
  app.use(express.static(viteDist));
} else if (fs.existsSync(craBuild)) {
  app.use(express.static(craBuild));
}

// Socket.io Authentication & Event Handler Setup
const socketAuth = require('./middleware/socketAuth');
const socketService = require('./services/socketService');

// Apply socket authentication middleware
io.use(socketAuth);

// Initialize socket event handlers
socketService(io);

console.log('✅ Socket.io authentication and services initialized');

// Initialize maintenance background jobs
const { initializeMaintenanceCrons } = require('./services/maintenanceCron');
initializeMaintenanceCrons();

// Error handling middleware (must be last)
app.use(errorHandler);

// Catch-all route for frontend (must be after all other routes and middleware)
app.use((req, res) => {
  const indexFile = fs.existsSync(viteDist) 
    ? path.join(viteDist, 'index.html')
    : path.join(craBuild, 'index.html');
  
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).json({ error: 'Not Found' });
  }
});

// Use env PORT or 5000
const PORT = process.env.PORT || 5001;
const serverInstance = server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

serverInstance.on('error', (err) => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Set PORT in .env or free the port.`);
    process.exit(1);
  } else {
    throw err;
  }
});

// Export for potential use in services and testing
module.exports = { app, server, io };