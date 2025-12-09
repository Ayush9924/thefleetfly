const mongoose = require('mongoose');
require('dotenv').config();
const bcrypt = require('bcryptjs');

// Import models
const User = require('../models/User');
const Vehicle = require('../models/Vehicle');
const Driver = require('../models/Driver');
const Assignment = require('../models/Assignment');
const FuelLog = require('../models/FuelLog');
const Maintenance = require('../models/Maintenance');

// Connect to DB
const connectDB = require('../config/db');
connectDB();

const seed = async () => {
  try {
    // Clear existing data
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Assignment.deleteMany();
    await FuelLog.deleteMany();
    await Maintenance.deleteMany();

    console.log('Database cleared...');

    // Create admin user (password will be hashed by User model pre-hook)
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@fleet.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('Admin user created...');

    // Create vehicles
    const vehicles = [];
    for (let i = 1; i <= 5; i++) {
      vehicles.push(
        await Vehicle.create({
          plateNumber: `TRK-00${i}`,
          make: 'Toyota',
          model: 'Hilux',
          year: 2020 + i,
          odometer: 50000 + i * 1000,
          status: i % 2 === 0 ? 'active' : 'maintenance'
        })
      );
    }

    console.log('Vehicles created...');

    // Create drivers
    const drivers = [];
    for (let i = 1; i <= 5; i++) {
      drivers.push(
        await Driver.create({
          name: `Driver ${i}`,
          licenseNumber: `DL-2024-${i}000`,
          phone: `+123456789${i}`,
          status: 'available'
        })
      );
    }

    console.log('Drivers created...');

    // Create assignments
    for (let i = 0; i < 3; i++) {
      await Assignment.create({
        vehicle: vehicles[i]._id,
        driver: drivers[i]._id,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    }

    console.log('Assignments created...');

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();