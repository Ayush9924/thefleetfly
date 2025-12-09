const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Development mode user cache
const devUserCache = {
  '1': { _id: '1', name: 'Admin User', email: 'admin@fleet.com', role: 'admin' },
  '2': { _id: '2', name: 'Roxy', email: 'karan@202@gmail.com', role: 'manager' }
};

/**
 * Socket.io Authentication Middleware
 * Verifies JWT token from socket handshake and attaches user to socket
 */
const socketAuth = async (socket, next) => {
  try {
    // Get token from socket handshake auth
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Try to fetch user from MongoDB
    try {
      const user = await User.findById(decoded.id).select('-password');
      if (!user) {
        throw new Error('User not found');
      }
      socket.userId = user._id;
      socket.userRole = user.role;
      socket.userName = user.name;
      socket.userEmail = user.email;
      next();
    } catch (dbError) {
      // Development mode: Use dev cache if MongoDB fails
      console.warn('⚠️  MongoDB user lookup failed, using development cache');
      const devUser = devUserCache[decoded.id];
      
      if (devUser) {
        socket.userId = devUser._id;
        socket.userRole = devUser.role;
        socket.userName = devUser.name;
        socket.userEmail = devUser.email;
        next();
      } else {
        next(new Error('Authentication error: Invalid user'));
      }
    }
  } catch (error) {
    console.error('❌ Socket authentication error:', error.message);
    next(new Error(`Authentication error: ${error.message}`));
  }
};

module.exports = socketAuth;
