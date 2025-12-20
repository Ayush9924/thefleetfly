const mongoose = require('mongoose');
require('dotenv').config();

// ⚠️  WARNING: This script DELETES all data in the database!
// Only use this if you need to completely reset the database.
// Use: node seeders/force-seed.js

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

const forceSeed = async () => {
  try {
    console.log('⚠️  Force clearing all data...');
    
    // Clear all collections
    await User.deleteMany();
    await Vehicle.deleteMany();
    await Driver.deleteMany();
    await Assignment.deleteMany();
    await FuelLog.deleteMany();
    await Maintenance.deleteMany();

    console.log('✅ Database cleared...');

    // Create admin user
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@fleet.com',
      password: 'admin123',
      role: 'admin'
    });

    console.log('✅ Admin user created...');

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

    console.log('✅ Vehicles created...');

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

    console.log('✅ Drivers created...');

    // Create assignments
    for (let i = 0; i < 3; i++) {
      await Assignment.create({
        vehicle: vehicles[i]._id,
        driver: drivers[i]._id,
        startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        isActive: true
      });
    }

    console.log('✅ Assignments created...');

    // Create maintenance records with proper scheduled fields
    const maintenanceData = [
      {
        vehicle: vehicles[0]._id,
        description: 'oil change',
        cost: 19.69,
        status: 'scheduled',
        isScheduled: true,
        scheduleType: 'one-time',
        nextScheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        scheduledDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedDuration: 2,
        priority: 'high',
        maintenanceType: 'routine'
      },
      {
        vehicle: vehicles[1]._id,
        description: 'Battery replacement',
        cost: 120.00,
        status: 'scheduled',
        isScheduled: true,
        scheduleType: 'one-time',
        nextScheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        scheduledDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        estimatedDuration: 1,
        priority: 'medium',
        maintenanceType: 'routine'
      },
      {
        vehicle: vehicles[2]._id,
        description: 'Engine inspection',
        cost: 180.00,
        status: 'scheduled',
        isScheduled: true,
        scheduleType: 'one-time',
        nextScheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        scheduledDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedDuration: 3,
        priority: 'medium',
        maintenanceType: 'routine'
      },
      {
        vehicle: vehicles[3]._id,
        description: 'Tire rotation and alignment',
        cost: 200.00,
        status: 'scheduled',
        isScheduled: true,
        scheduleType: 'one-time',
        nextScheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        scheduledDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedDuration: 1.5,
        priority: 'medium',
        maintenanceType: 'routine'
      },
      {
        vehicle: vehicles[4]._id,
        description: 'Brake pad replacement',
        cost: 250.00,
        status: 'pending',
        isScheduled: false,
        nextScheduledDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        estimatedDuration: 2,
        priority: 'medium',
        maintenanceType: 'routine'
      }
    ];

    for (const maintenance of maintenanceData) {
      await Maintenance.create(maintenance);
    }

    console.log('✅ Maintenance records created...');
    console.log('✅ Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

forceSeed();
