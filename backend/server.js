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
const isTestEnv = process.env.NODE_ENV === 'test';

['BREVO_SMTP_USER', 'BREVO_SMTP_KEY', 'BREVO_FROM'].forEach(key => {
  if (!process.env[key]) {
    console.error(`[STARTUP] ❌ MISSING: ${key}`);
  } else {
    console.log(`[STARTUP] ✓ ${key} loaded`);
  }
});

if (!process.env.JWT_SECRET) {
  console.error('[STARTUP] MISSING ENV VAR: JWT_SECRET');
} else {
  console.log('[STARTUP] JWT_SECRET loaded ✓');
}

// Connect to database
if (!isTestEnv) {
  connectDB();
}

const app = express();
const server = http.createServer(app);

// Socket.io setup - Initialize immediately
let io;

// CORS configuration for Socket.io
const socketCorsConfig = {
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://thefleetfly.xyz',
        'https://www.thefleetfly.xyz',
        'https://thefleetfly-frontend.vercel.app',
        'https://thefleetfly.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000'
      ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  allowEIO3: true,
};

// Socket.io configuration options
const socketConfig = {
  path: '/socket.io/',
  cors: socketCorsConfig,
  transports: ['websocket', 'polling'],
  pingInterval: 25000,
  pingTimeout: 20000,
  connectTimeout: 45000,
};

// Define socket initialization function
const initializeSocket = () => {
  console.log('🔌 Initializing Socket.io...');
  console.log('🔌 Environment:', process.env.NODE_ENV);
  console.log('🔌 CORS origins:', socketCorsConfig.origin);
  
  io = new socketIo.Server(server, socketConfig);
  console.log('✅ Socket.io initialized successfully');
};

// Initialize Socket.io
if (!isTestEnv) {
  if (process.env.REDIS_URL) {
    const { createAdapter } = require('@socket.io/redis-adapter');
    const { createClient } = require('redis');
    
    const redisClientPub = createClient({ url: process.env.REDIS_URL });
    const redisClientSub = createClient({ url: process.env.REDIS_URL });
    
    Promise.all([redisClientPub.connect(), redisClientSub.connect()])
      .then(() => {
        io = new socketIo.Server(server, {
          ...socketConfig,
          adapter: createAdapter({ pubClient: redisClientPub, subClient: redisClientSub }),
        });
        console.log('✅ Socket.io initialized with Redis adapter');
      })
      .catch(err => {
        console.error('❌ Redis connection failed:', err.message);
        console.log('🔄 Falling back to in-memory adapter');
        initializeSocket();
      });
  } else {
    // Use in-memory adapter for development
    initializeSocket();
  }
}

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

console.log('🔧 CORS Configuration:');
console.log('   NODE_ENV:', process.env.NODE_ENV);
console.log('   Allowed origins:', process.env.NODE_ENV === 'production' 
  ? ['thefleetfly.xyz', 'www.thefleetfly.xyz', 'vercel.app', 'onrender.com']
  : ['localhost:5173', 'localhost:5174', 'localhost:3000']);

app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        process.env.FRONTEND_URL || 'https://thefleetfly-frontend.vercel.app',
        'https://thefleetfly.xyz',
        'https://www.thefleetfly.xyz',
        'https://thefleetfly.onrender.com',
        'http://localhost:5173',
        'http://localhost:5174',
        'http://localhost:3000'
      ]
    : ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175', 'http://localhost:5176', 'http://localhost:3000', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
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
app.use('/api/location', require('./routes/locationRoutes'));
// Brevo SMTP routes (public): POST /send-email, POST /send-otp
app.use('/', require('./routes/mailRoutes'));


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

if (!isTestEnv) {
  // Socket.io Authentication & Event Handler Setup
  const socketAuth = require('./middleware/socketAuth');
  const socketService = require('./services/socketService');

  // Setup socket handlers (io may not be ready immediately if using Redis, so add after creation)
  const setupSocketIfReady = setInterval(() => {
    if (io) {
      clearInterval(setupSocketIfReady);
      // Apply socket authentication middleware
      io.use(socketAuth);
      // Initialize socket event handlers
      socketService(io);
      console.log('✅ Socket.io authentication and services initialized');
    }
  }, 100);

  // Initialize maintenance background jobs asynchronously
  setImmediate(() => {
    try {
      const { initializeMaintenanceCrons } = require('./services/maintenanceCron');
      initializeMaintenanceCrons();
    } catch (err) {
      console.error('Warning: Failed to initialize maintenance crons:', err.message);
    }
  });
}

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

// Avoid binding a network port during tests; supertest will use the app directly.
let serverInstance = null;
if (!isTestEnv) {
  const PORT = process.env.PORT || 5001;
  serverInstance = server.listen(PORT, () => {
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
}

// Export app directly for tests while still exposing internals when needed.
module.exports = app;
module.exports.server = server;
module.exports.io = io;
module.exports.serverInstance = serverInstance;