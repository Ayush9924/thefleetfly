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
    // Check if data already exists
    const userCount = await User.countDocuments();
    const vehicleCount = await Vehicle.countDocuments();
    const driverCount = await Driver.countDocuments();

    if (userCount > 0 || vehicleCount > 0 || driverCount > 0) {
      console.log('⚠️  Database already has data. Skipping seed to preserve existing data.');
      console.log(`   Users: ${userCount}, Vehicles: ${vehicleCount}, Drivers: ${driverCount}`);
      process.exit(0);
    }

    console.log('Seeding database with initial data...');

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

    // Create maintenance records
    const maintenanceData = [
      {
        vehicle: vehicles[0]._id,
        description: 'oil change',
        cost: 19.69,
        status: 'scheduled',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        estimatedDuration: 2,
        priority: 'high'
      },
      {
        vehicle: vehicles[1]._id,
        description: 'Battery replacement',
        cost: 120.00,
        status: 'scheduled',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        estimatedDuration: 1,
        priority: 'medium'
      },
      {
        vehicle: vehicles[2]._id,
        description: 'Engine inspection',
        cost: 180.00,
        status: 'overdue',
        dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        estimatedDuration: 3,
        priority: 'medium'
      },
      {
        vehicle: vehicles[3]._id,
        description: 'Tire rotation and alignment',
        cost: 200.00,
        status: 'scheduled',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        estimatedDuration: 1.5,
        priority: 'medium'
      },
      {
        vehicle: vehicles[4]._id,
        description: 'Brake pad replacement',
        cost: 250.00,
        status: 'pending',
        dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
        estimatedDuration: 2,
        priority: 'medium'
      }
    ];

    for (const maintenance of maintenanceData) {
      await Maintenance.create(maintenance);
    }

    console.log('Maintenance records created...');

    console.log('Database seeded successfully!');
    process.exit();
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seed();
