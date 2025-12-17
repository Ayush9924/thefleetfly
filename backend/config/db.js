const mongoose = require('mongoose');
require('dotenv').config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 5,
      retryWrites: true,
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Listen for connection events
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      console.log('✅ MongoDB reconnected');
    });
    
    mongoose.connection.on('error', (error) => {
      console.error('❌ MongoDB error:', error.message);
    });
  } catch (error) {
    console.error(`⚠️  MongoDB Connection Error: ${error.message}`);
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    } else {
      console.warn('⚠️  Running in development mode without MongoDB. Database operations will fail.');
    }
  }
};

module.exports = connectDB;