const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Development mode: In-memory users storage
const devUsers = {
  'admin@fleet.com': {
    _id: '1',
    name: 'Admin User',
    email: 'admin@fleet.com',
    password: 'admin123',
    role: 'admin'
  },
  'karan@202@gmail.com': {
    _id: '2',
    name: 'Roxy',
    email: 'karan@202@gmail.com',
    password: 'karan@202',
    role: 'manager'
  },
  'karan@2001@gmail.com': {
    _id: '3',
    name: 'Karan',
    email: 'karan@2001@gmail.com',
    password: 'password123',
    role: 'manager'
  }
};

// @desc    Register new user
// @route   POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    let useDevMode = false;

    try {
      // Try to register in MongoDB
      console.log('📝 Attempting MongoDB registration for:', email);
      
      const userExists = await User.findOne({ email });
      if (userExists) {
        console.log('❌ User already exists:', email);
        return res.status(400).json({ message: 'User already exists' });
      }

      console.log('📝 Creating user in MongoDB...', { name, email, role });
      const user = await User.create({
        name,
        email,
        password,
        role: role || 'manager'
      });

      console.log('✅ User created in MongoDB:', { _id: user._id, email: user.email });

      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      console.log('✅ User registered in MongoDB:', email);
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
      console.error('❌ MongoDB registration error:', dbError.message);
      if (dbError.errors) {
        console.error('❌ Validation errors:', Object.keys(dbError.errors).map(key => `${key}: ${dbError.errors[key].message}`));
      }
      console.log('⚠️  Using development mode for registration');
      useDevMode = true;

      if (dbError.code === 11000) {
        // Duplicate key error
        return res.status(400).json({ message: 'Email already registered' });
      }

      if (devUsers[email]) {
        return res.status(400).json({ message: 'User already exists' });
      }

      // Create new user in dev mode with password stored
      const newUser = {
        _id: Date.now().toString(),
        name,
        email,
        password, // Store password in plain text for dev mode
        role: role || 'manager'
      };

      devUsers[email] = newUser;

      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      console.log('✅ User registered in dev mode:', email);
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
    console.error('❌ Registration error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Authenticate user & get token
// @route   POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validation
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    // Check if MongoDB is available first
    let user = null;
    let useDevMode = false;

    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      console.log('⚠️  MongoDB unavailable, using development mode for login');
      useDevMode = true;
    }

    if (useDevMode) {
      // Development mode without MongoDB
      const devUser = devUsers[email];
      if (!devUser) {
        return res.status(401).json({ message: 'Invalid email or password' });
      }

      // Compare plain text password in dev mode
      if (devUser.password !== password) {
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

    console.log('✅ MongoDB login successful for:', email);
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
    console.error('❌ Login error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
const getMe = (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role
  });
};

module.exports = { register, login, getMe };