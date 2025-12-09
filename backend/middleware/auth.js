const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Development mode user cache
const devUserCache = {
  '1': { _id: '1', name: 'Admin User', email: 'admin@fleet.com', role: 'admin' },
  '2': { _id: '2', name: 'Roxy', email: 'karan@202@gmail.com', role: 'manager' }
};

// Protect routes - require authentication
const protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Try to get user from MongoDB
      try {
        req.user = await User.findById(decoded.id).select('-password');
      } catch (dbError) {
        // MongoDB failed, use dev cache
        console.warn('⚠️  Using development mode user cache');
        req.user = devUserCache[decoded.id] || { _id: decoded.id, role: 'user' };
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Restrict access to specific roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role (${req.user.role}) is not authorized`
      });
    }
    next();
  };
};

module.exports = { protect, authorize };