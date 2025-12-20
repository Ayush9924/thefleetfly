const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const OTP = require('../models/OTP');
const { sendOTPEmail, sendPasswordChangedEmail } = require('../utils/mailer');

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

// Generate 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// @desc    Request password reset (send OTP)
// @route   POST /api/auth/forgot-password
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user by email
    let user = null;
    
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (dbError) {
      console.log('⚠️  MongoDB unavailable, using development mode');
    }

    // Check in dev mode if MongoDB not available
    if (!user && devUsers[email]) {
      user = { name: devUsers[email].name, email: devUsers[email].email };
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate OTP
    const otp = generateOTP();

    try {
      // Delete any existing OTP for this email
      await OTP.deleteMany({ email: email.toLowerCase(), type: 'password-reset' });

      // Save OTP to database
      const otpRecord = new OTP({
        email: email.toLowerCase(),
        otp: otp,
        type: 'password-reset'
      });
      await otpRecord.save();
    } catch (dbError) {
      console.log('⚠️  Could not save OTP to database:', dbError.message);
      // Continue anyway, email will be sent
    }

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email. Please check email configuration.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully to your email',
      email: email
    });

  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
const verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP'
      });
    }

    // Find OTP record
    let otpRecord = null;
    
    try {
      otpRecord = await OTP.findOne({
        email: email.toLowerCase(),
        otp: otp,
        type: 'password-reset'
      });
    } catch (dbError) {
      console.log('⚠️  Could not verify OTP from database');
    }

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      try {
        await otpRecord.deleteOne();
      } catch (err) {
        console.log('Could not delete expired OTP');
      }
      return res.status(400).json({
        success: false,
        message: 'OTP has expired'
      });
    }

    // Delete the used OTP
    try {
      await otpRecord.deleteOne();
    } catch (err) {
      console.log('Could not delete OTP after verification');
    }

    // Generate a reset token
    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    // Store reset token in user document
    try {
      await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
        }
      );
    } catch (dbError) {
      console.log('⚠️  Could not store reset token in database');
    }

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken,
      email: email
    });

  } catch (error) {
    console.error('Error in verifyOTP:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password
const resetPassword = async (req, res) => {
  try {
    const { email, resetToken, newPassword, confirmPassword } = req.body;

    // Validate inputs
    if (!email || !resetToken || !newPassword || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Validate passwords
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user and validate reset token
    let user = null;
    let useDevMode = false;

    try {
      user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: new Date() }
      });
    } catch (dbError) {
      console.log('⚠️  MongoDB unavailable, using development mode');
      useDevMode = true;
    }

    if (!user) {
      if (!useDevMode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
      
      // Check in dev mode
      const devUser = devUsers[email];
      if (devUser) {
        // Update dev mode user password
        devUser.password = newPassword;
        
        // Send confirmation email
        await sendPasswordChangedEmail(email, devUser.name);

        return res.status(200).json({
          success: true,
          message: 'Password reset successfully'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      });
    }

    // Check if new password is same as old password
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be same as old password'
      });
    }

    // Update password
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation email
    await sendPasswordChangedEmail(email, user.name);

    res.status(200).json({
      success: true,
      message: 'Password reset successfully'
    });

  } catch (error) {
    console.error('Error in resetPassword:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

module.exports = { register, login, getMe, requestPasswordReset, verifyOTP, resetPassword };