require('dotenv').config();
const connectDB = require('./config/db');
const Vehicle = require('./models/Vehicle');
const Driver = require('./models/Driver');
const User = require('./models/User');

const testDataLoad = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();
    
    console.log('\n📋 Checking data in database:\n');
    
    // Check vehicles
    const vehicleCount = await Vehicle.countDocuments();
    console.log(`✅ Vehicles: ${vehicleCount} found`);
    if (vehicleCount > 0) {
      const vehicles = await Vehicle.find().limit(3);
      console.log('  Sample vehicles:', vehicles.map(v => ({ _id: v._id, plateNumber: v.plateNumber })));
    }
    
    // Check drivers
    const driverCount = await Driver.countDocuments();
    console.log(`✅ Drivers: ${driverCount} found`);
    if (driverCount > 0) {
      const drivers = await Driver.find().limit(3);
      console.log('  Sample drivers:', drivers.map(d => ({ _id: d._id, name: d.name })));
    }
    
    // Check users
    const userCount = await User.countDocuments();
    console.log(`✅ Users: ${userCount} found`);
    if (userCount > 0) {
      const users = await User.find().limit(3);
      console.log('  Sample users:', users.map(u => ({ _id: u._id, email: u.email, role: u.role })));
    }
    
    if (vehicleCount === 0 && driverCount === 0 && userCount === 0) {
      console.log('\n⚠️  WARNING: No data found in database!');
      console.log('You need to seed the database. Run: npm run seed');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testDataLoad();
