require('dotenv').config();
const mongoose = require('mongoose');

const testMongoDB = async () => {
  try {
    console.log('🔄 Testing MongoDB Connection...');
    console.log(`📌 URI: ${process.env.MONGO_URI}`);
    
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 10000,
    });
    
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);
    
    // Get database stats
    const admin = conn.connection.db.admin();
    const stats = await admin.serverStatus();
    console.log(`\n📈 MongoDB Status:`);
    console.log(`   - Version: ${stats.version}`);
    console.log(`   - Uptime: ${stats.uptime} seconds`);
    console.log(`   - Connections: ${stats.connections.current}/${stats.connections.available}`);
    
    // Test a simple query
    console.log(`\n🧪 Testing Collection Access...`);
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log(`   - Collections found: ${collections.length}`);
    collections.forEach(col => {
      console.log(`     • ${col.name}`);
    });
    
    // Count documents in vehicles
    const Vehicle = require('./models/Vehicle');
    const vehicleCount = await Vehicle.countDocuments();
    console.log(`\n🚗 Vehicles in database: ${vehicleCount}`);
    
    if (vehicleCount > 0) {
      const sample = await Vehicle.findOne().lean();
      console.log(`   - Sample vehicle:`, sample ? { _id: sample._id, plateNumber: sample.plateNumber } : 'none');
    }
    
    console.log(`\n✅ All tests passed! MongoDB is working correctly.`);
    process.exit(0);
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Failed!`);
    console.error(`Error: ${error.message}`);
    
    if (error.message.includes('ENOTFOUND')) {
      console.error(`\n💡 Fix: Check your internet connection or MongoDB Atlas status`);
    } else if (error.message.includes('authentication failed')) {
      console.error(`\n💡 Fix: Check your MONGO_URI username and password in .env`);
    } else if (error.message.includes('timed out')) {
      console.error(`\n💡 Fix: MongoDB is taking too long. Try:`);
      console.error(`   1. Check if MongoDB Atlas cluster is running`);
      console.error(`   2. Add your IP to MongoDB Atlas whitelist`);
      console.error(`   3. Check your internet connection`);
    }
    
    process.exit(1);
  }
};

testMongoDB();
