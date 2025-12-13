const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Development mode: In-memory users storage
const devUsers = {
  'admin@fleet.com': {
    _id: '1',
    name: 'Admin User',
    email: 'admin@fleet.com',
    role: 'admin'
  },
  'karan@202@gmail.com': {
    _id: '2',
    name: 'Roxy',
    email: 'karan@202@gmail.com',
    role: 'manager'
  },
  'karan@2001@gmail.com': {
    _id: '3',
    name: 'Karan',
    email: 'karan@2001@gmail.com',
    role: 'manager'
  }
};

// Simple password match for dev mode
const verifyDevPassword = (inputPassword, email) => {
  if (email === 'admin@fleet.com' && inputPassword === 'admin123') return true;
  if (email === 'karan@202@gmail.com' && inputPassword === 'karan@202') return true;
  if (email === 'karan@2001@gmail.com' && inputPassword === 'password123') return true;
  return false;
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    try {
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const user = await User.create({
        name,
        email,
        password,
        role: role || 'manager'
      });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });
    } catch (dbError) {
      console.warn('⚠️  MongoDB unavailable, using development mode');

      if (devUsers[email]) {
        return res.status(400).json({ message: 'User already exists' });
      }

      const newUser = {
        _id: Date.now().toString(),
        name,
        email,
        role: role || 'manager'
      };

      devUsers[email] = newUser;

      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      res.status(201).json({
        user: {
          _id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role
        },
        token
      });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if MongoDB is available first
    let user = null;
    let useDevMode = false;

    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      console.warn('⚠️  MongoDB unavailable, using development mode');
      useDevMode = true;
    }

    if (useDevMode) {
      // Development mode without MongoDB
      const devUser = devUsers[email];
      if (!devUser) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      if (!verifyDevPassword(password, email)) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      const token = jwt.sign(
        { id: devUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      console.log('✅ Development mode login successful for:', email);
      return res.json({
        user: {
          _id: devUser._id,
          name: devUser.name,
          email: devUser.email,
          role: devUser.role
        },
        token
      });
    }

    // MongoDB mode
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    res.json({
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      },
      token
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = (req, res) => {
  res.json({
    user: {
      _id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      role: req.user.role
    }
  });
};

module.exports = { register, login, getMe };