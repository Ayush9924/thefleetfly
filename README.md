# TheFleetFly - Fleet Management System

[![Node.js](https://img.shields.io/badge/Node.js-v16+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-v19.2-blue)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Latest-green)](https://www.mongodb.com/)
[![Express](https://img.shields.io/badge/Express.js-v5.2-black)](https://expressjs.com/)
[![Socket.io](https://img.shields.io/badge/Socket.io-v4.8-white)](https://socket.io/)
[![License](https://img.shields.io/badge/License-ISC-blue)](#license)

A comprehensive full-stack fleet management platform designed to streamline vehicle operations, driver management, and logistics. TheFleetFly provides real-time tracking, intelligent scheduling, maintenance management, and advanced analytics to optimize fleet operations.

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Project Architecture](#project-architecture)
- [Prerequisites](#prerequisites)
- [Installation & Setup](#installation--setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Real-Time Features](#real-time-features)
- [Testing](#testing)
- [Security](#security)
- [Troubleshooting](#troubleshooting)
- [Contributing](#contributing)
- [License](#license)
- [Support](#support)

---

## Overview

TheFleetFly is an enterprise-grade fleet management solution built with modern technologies. It enables organizations to manage vehicles, drivers, routes, maintenance schedules, and fuel consumption efficiently while providing real-time visibility into fleet operations through an intuitive web-based interface.

### Use Cases
- **Logistics Companies**: Manage delivery routes and track vehicle locations
- **Transportation Services**: Schedule drivers and vehicles for assignments
- **Fleet Operators**: Monitor maintenance schedules and fuel consumption
- **Dispatch Centers**: Real-time communication with drivers and route optimization

---

## Key Features

### Core Management Features
- **Vehicle Management**: Register, track, and maintain comprehensive vehicle inventories
- **Driver Management**: Manage driver information, licenses, and performance metrics
- **Assignment Tracking**: Create and monitor vehicle-driver assignments with status updates
- **Route Planning**: Plan optimal routes with interactive map visualization
- **Maintenance Scheduling**: Automated maintenance tracking and scheduling
- **Fuel Management**: Log and analyze fuel consumption patterns
- **Analytics & Reporting**: Generate detailed performance and cost analysis reports

### Real-Time Capabilities
- **Live Vehicle Tracking**: GPS-enabled real-time location updates on interactive maps
- **Instant Notifications**: Real-time alerts for maintenance, assignments, and system events
- **Live Chat**: Direct messaging between dispatchers and drivers
- **Location History**: Track detailed movement history and route performance
- **Persistent Connections**: WebSocket-based communication for instant data synchronization

---

## Technology Stack

### Backend Ecosystem
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | v16+ | Runtime environment |
| Express.js | v5.2.1 | Web framework |
| MongoDB | Latest | NoSQL database |
| Mongoose | v9.0.1 | ODM & schema validation |
| Socket.io | v4.8.1 | Real-time bidirectional communication |
| JWT | jsonwebtoken | Authentication & authorization |
| bcryptjs | v3.0.3 | Password hashing |
| Helmet | v8.1.0 | Security headers |
| Redis | v5.10 | Caching & session management |
| Jest | v30.2 | Testing framework |
| Nodemon | v3.1 | Development hot reload |

### Frontend Stack
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | v19.2 | UI library |
| Vite | Latest | Build tool & dev server |
| React Router | v7.10.1 | Client-side routing |
| Tailwind CSS | Latest | Utility-first CSS |
| Socket.io Client | v4.8.1 | Real-time client |
| Axios | Latest | HTTP client |
| React Query | Latest | Server state management |
| React Hook Form | Latest | Form state management |
| Zod | Latest | Schema validation |
| Leaflet | v1.9.4 | Interactive maps |
| Recharts | Latest | Data visualization |
| Radix UI | Latest | Headless components |
| Framer Motion | Latest | Animations |

---

## Project Architecture

### Directory Structure
```
thefleetfly/
├── backend/
│   ├── config/
│   │   └── db.js                      # MongoDB connection configuration
│   ├── models/
│   │   ├── User.js                    # User authentication model
│   │   ├── Vehicle.js                 # Vehicle information model
│   │   ├── Driver.js                  # Driver profile model
│   │   ├── Assignment.js              # Vehicle-driver assignment model
│   │   ├── Maintenance.js             # Maintenance records model
│   │   ├── FuelLog.js                 # Fuel consumption tracking
│   │   ├── Route.js                   # Route planning model
│   │   ├── Message.js                 # Chat messages
│   │   ├── Conversation.js            # Chat conversations
│   │   ├── LocationHistory.js         # GPS location history
│   │   ├── NotificationLog.js         # System notifications
│   │   └── OTP.js                     # One-time password storage
│   ├── controllers/
│   │   ├── authController.js          # Authentication logic
│   │   ├── vehicleController.js       # Vehicle management
│   │   ├── driverController.js        # Driver management
│   │   ├── assignmentController.js    # Assignment operations
│   │   ├── maintenanceController.js   # Maintenance scheduling
│   │   ├── fuelLogController.js       # Fuel tracking
│   │   ├── routeController.js         # Route planning
│   │   └── reportController.js        # Analytics & reports
│   ├── routes/
│   │   ├── authRoutes.js              # Auth endpoints
│   │   ├── vehicleRoutes.js           # Vehicle endpoints
│   │   ├── driverRoutes.js            # Driver endpoints
│   │   ├── assignmentRoutes.js        # Assignment endpoints
│   │   ├── maintenanceRoutes.js       # Maintenance endpoints
│   │   ├── fuelLogRoutes.js           # Fuel log endpoints
│   │   ├── routeRoutes.js             # Route endpoints
│   │   ├── messageRoutes.js           # Chat endpoints
│   │   └── reportRoutes.js            # Report endpoints
│   ├── middleware/
│   │   ├── auth.js                    # JWT authentication
│   │   ├── socketAuth.js              # Socket.io authentication
│   │   ├── error.js                   # Error handling
│   │   └── upload.js                  # File upload processing
│   ├── services/
│   │   ├── socketService.js           # Socket.io event handlers
│   │   ├── locationService.js         # GPS tracking service
│   │   ├── maintenanceScheduler.js    # Cron-based maintenance scheduler
│   │   └── mailService.js             # Email notifications
│   ├── seeders/
│   │   ├── seed.js                    # Safe data seeding
│   │   └── force-seed.js              # Force data reset
│   ├── tests/
│   │   ├── setup.js                   # Test configuration
│   │   └── integration/
│   │       └── auth.test.js           # Authentication tests
│   ├── server.js                      # Main Express application
│   ├── jest.config.js                 # Jest configuration
│   ├── package.json                   # Dependencies
│   └── .env                           # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveMapTracker.jsx     # Real-time map component
│   │   │   ├── ChatList.jsx           # Chat conversation list
│   │   │   ├── ChatWindow.jsx         # Chat interface
│   │   │   ├── NotificationCenter.jsx # Notification display
│   │   │   ├── VehicleCard.jsx        # Vehicle information card
│   │   │   ├── VehicleForm.jsx        # Vehicle creation/editing
│   │   │   ├── MaintenanceList.jsx    # Maintenance display
│   │   │   ├── MaintenanceScheduler.jsx # Maintenance scheduler
│   │   │   ├── MaintenanceStats.jsx   # Maintenance statistics
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx         # Main layout wrapper
│   │   │   │   ├── Navbar.jsx         # Navigation bar
│   │   │   │   ├── Sidebar.jsx        # Side navigation
│   │   │   │   ├── ProtectedRoute.jsx # Protected route guard
│   │   │   │   └── PublicRoute.jsx    # Public route guard
│   │   │   ├── dashboard/
│   │   │   │   └── KpiCard.jsx        # Dashboard metrics
│   │   │   └── ui/
│   │   │       ├── button.jsx         # Reusable button
│   │   │       ├── card.jsx           # Reusable card
│   │   │       ├── input.jsx          # Reusable input
│   │   │       ├── select.jsx         # Select dropdown
│   │   │       ├── table.jsx          # Data table
│   │   │       └── skeleton.jsx       # Loading skeleton
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx        # Public landing page
│   │   │   ├── LoginPage.jsx          # User login
│   │   │   ├── SignUpPage.jsx         # User registration
│   │   │   ├── DashboardPage.jsx      # Main dashboard
│   │   │   ├── VehiclesPage.jsx       # Vehicle list
│   │   │   ├── VehicleDetailPage.jsx  # Vehicle details
│   │   │   ├── DriversPage.jsx        # Driver management
│   │   │   ├── AssignmentsPage.jsx    # Assignments
│   │   │   ├── MaintenancePage.jsx    # Maintenance
│   │   │   ├── FuelLogsPage.jsx       # Fuel tracking
│   │   │   ├── RoutePlannerPage.jsx   # Route planning
│   │   │   ├── LiveTrackingPage.jsx   # Real-time tracking
│   │   │   ├── ChatPage.jsx           # Messaging
│   │   │   ├── NotificationsPage.jsx  # Notifications
│   │   │   ├── ReportsPage.jsx        # Analytics reports
│   │   │   ├── ForgotPassword.jsx     # Password recovery
│   │   │   ├── ResetPassword.jsx      # Password reset
│   │   │   └── VerifyOTP.jsx          # OTP verification
│   │   ├── services/
│   │   │   ├── api.jsx                # API client configuration
│   │   │   ├── authService.jsx        # Auth service
│   │   │   └── index.jsx              # Service exports
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx        # Authentication state
│   │   │   ├── RealtimeContext.jsx    # Real-time event state
│   │   │   └── QueryProvider.jsx      # React Query setup
│   │   ├── hooks/
│   │   │   ├── useSocketChat.js       # Chat socket hook
│   │   │   ├── useSocketLocation.js   # Location socket hook
│   │   │   ├── useSocketNotifications.js # Notification hook
│   │   │   ├── useMaintenanceScheduler.js # Maintenance scheduler
│   │   │   └── index.js               # Hook exports
│   │   ├── lib/
│   │   │   ├── socket.js              # Socket.io configuration
│   │   │   ├── mockLocationData.js    # Mock data for testing
│   │   │   └── utils.js               # Utility functions
│   │   ├── assets/                    # Images & static files
│   │   ├── App.jsx                    # Main app component
│   │   ├── main.jsx                   # React entry point
│   │   ├── App.css                    # App styles
│   │   └── index.css                  # Global styles
│   ├── public/                        # Static files
│   ├── index.html                     # HTML template
│   ├── vite.config.js                 # Vite configuration
│   ├── tailwind.config.js             # Tailwind CSS config
│   ├── postcss.config.js              # PostCSS config
│   ├── eslint.config.js               # ESLint rules
│   ├── package.json                   # Dependencies
│   └── .env                           # Environment variables
│
├── package.json                       # Workspace root
├── README.md                          # This file
└── .gitignore                         # Git ignore rules
```

### Key Components Explained

#### Backend Services
- **Authentication Service**: JWT-based authentication with role-based access control
- **Location Service**: Real-time GPS tracking and location history management
- **Socket Service**: WebSocket event handling for real-time updates
- **Maintenance Service**: Automated scheduling and tracking
- **Email Service**: Notification delivery via Nodemailer

#### Frontend Architecture
- **Components**: Reusable UI components built with Radix UI
- **Pages**: Route-based pages for different features
- **Hooks**: Custom React hooks for Socket.io integration
- **Contexts**: Global state management (Auth, RealTime)
- **Services**: API client configuration and service methods

---

## Prerequisites

Before getting started, ensure you have the following installed:

- **Node.js**: v16 or higher ([Download](https://nodejs.org/))
- **npm/yarn**: v7 or higher (bundled with Node.js)
- **MongoDB**: Local installation or MongoDB Atlas account ([Setup Guide](https://www.mongodb.com/docs/manual/installation/))
- **Git**: v2.0+ ([Download](https://git-scm.com/))
- **Modern Browser**: Chrome, Firefox, Safari, or Edge

---

## Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Ayush9924/thefleetfly.git
cd thefleetfly
```

### 2. Backend Setup

```bash
cd backend
npm install
```

### 3. Frontend Setup

```bash
cd ../frontend
npm install
```

---

## Environment Configuration

### Backend Configuration (.env)

Create a `.env` file in the `backend/` directory with the following variables:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Choose one)
# Local MongoDB
MONGO_URI=mongodb://localhost:27017/fleet-app

# MongoDB Atlas (Cloud)
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fleet-app?retryWrites=true&w=majority

# Authentication
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# CORS Configuration
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880  # 5MB
UPLOAD_DIR=./uploads

# Email Service (Optional)
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password

# Redis (Optional - for caching)
REDIS_URL=redis://localhost:6379
```

### Frontend Configuration (.env)

Create a `.env` file in the `frontend/` directory:

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api
VITE_API_TIMEOUT=30000

# Socket.io Configuration
VITE_SOCKET_URL=http://localhost:5000
```

---

## Running the Application

### Backend Server

**Development Mode with Hot Reload:**
```bash
cd backend
npm run dev
```
Server runs on `http://localhost:5000`

**Production Mode:**
```bash
npm start
```

**Seed Database (Populate Sample Data):**
```bash
npm run seed           # Safe seed (non-destructive)
npm run seed:force    # Force seed (drops existing data)
```

### Frontend Application

**Development Mode:**
```bash
cd frontend
npm run dev
```
App runs on `http://localhost:5173`

**Production Build:**
```bash
npm run build         # Creates optimized build
npm run preview       # Preview production build locally
```

### Running Both Simultaneously

Open two terminal windows side-by-side:

**Terminal 1 - Backend:**
```bash
cd backend && npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend && npm run dev
```

Then visit `http://localhost:5173` in your browser.

---

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

```http
POST   /auth/signup              # Register new user
POST   /auth/login               # User login
GET    /auth/profile             # Get user profile (Protected)
PUT    /auth/profile             # Update profile (Protected)
POST   /auth/logout              # Logout user (Protected)
POST   /auth/refresh-token       # Refresh JWT token
POST   /auth/request-reset       # Request password reset
POST   /auth/reset-password      # Reset password
```

### Vehicle Management

```http
GET    /vehicles                 # List all vehicles
GET    /vehicles/:id             # Get vehicle details
POST   /vehicles                 # Create new vehicle
PUT    /vehicles/:id             # Update vehicle
DELETE /vehicles/:id             # Delete vehicle
GET    /vehicles/:id/history     # Get vehicle history
GET    /vehicles/stats           # Get vehicle statistics
```

### Driver Management

```http
GET    /drivers                  # List all drivers
GET    /drivers/:id              # Get driver details
POST   /drivers                  # Create new driver
PUT    /drivers/:id              # Update driver
DELETE /drivers/:id              # Delete driver
GET    /drivers/:id/performance  # Get driver performance metrics
```

### Assignments

```http
GET    /assignments              # List all assignments
GET    /assignments/:id          # Get assignment details
POST   /assignments              # Create assignment
PUT    /assignments/:id          # Update assignment
DELETE /assignments/:id          # Delete assignment
PUT    /assignments/:id/status   # Update assignment status
```

### Maintenance

```http
GET    /maintenance              # List all maintenance records
GET    /maintenance/:id          # Get maintenance details
POST   /maintenance              # Create maintenance record
PUT    /maintenance/:id          # Update maintenance
DELETE /maintenance/:id          # Delete maintenance
GET    /maintenance/:id/history  # Get maintenance history
```

### Fuel Logs

```http
GET    /fuels                    # List all fuel logs
GET    /fuels/:id                # Get fuel log details
POST   /fuels                    # Create fuel log
PUT    /fuels/:id                # Update fuel log
DELETE /fuels/:id                # Delete fuel log
GET    /fuels/vehicle/:id        # Get vehicle fuel logs
```

### Routes

```http
GET    /routes                   # List all routes
GET    /routes/:id               # Get route details
POST   /routes                   # Create new route
PUT    /routes/:id               # Update route
DELETE /routes/:id               # Delete route
GET    /routes/optimize          # Optimize route
```

### Reports

```http
GET    /reports/summary          # Get summary report
GET    /reports/vehicle/:id      # Get vehicle report
GET    /reports/driver/:id       # Get driver report
GET    /reports/fuel             # Get fuel analysis
GET    /reports/maintenance      # Get maintenance report
GET    /reports/export           # Export reports (PDF/CSV)
```

---

## Database Schema

### User Model
```javascript
{
  name: String (required),
  email: String (required, unique),
  password: String (hashed, required),
  role: String (enum: ['admin', 'manager', 'driver']),
  phone: String,
  avatar: String,
  isActive: Boolean (default: true),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle Model
```javascript
{
  licensePlate: String (required, unique),
  model: String (required),
  manufacturer: String,
  year: Number,
  vin: String (unique),
  type: String (enum: ['truck', 'van', 'car', 'bike']),
  status: String (enum: ['active', 'maintenance', 'inactive']),
  mileage: Number,
  fuelType: String (enum: ['petrol', 'diesel', 'electric']),
  fuelCapacity: Number,
  image: String,
  registrationDate: Date,
  insurance: {
    provider: String,
    policyNumber: String,
    expiryDate: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Driver Model
```javascript
{
  name: String (required),
  email: String (required),
  phone: String,
  licenseNumber: String (unique, required),
  licenseType: String,
  licenseExpiry: Date,
  status: String (enum: ['active', 'inactive', 'on-leave']),
  yearsOfExperience: Number,
  emergencyContact: {
    name: String,
    phone: String
  },
  documents: [String],
  rating: Number (0-5),
  totalTrips: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment Model
```javascript
{
  vehicle: ObjectId (ref: Vehicle),
  driver: ObjectId (ref: Driver),
  startDate: Date (required),
  endDate: Date,
  status: String (enum: ['pending', 'active', 'completed', 'cancelled']),
  route: {
    startLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    },
    endLocation: {
      latitude: Number,
      longitude: Number,
      address: String
    }
  },
  distance: Number,
  estimatedDuration: Number,
  actualDuration: Number,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Maintenance Model
```javascript
{
  vehicle: ObjectId (ref: Vehicle),
  type: String (enum: ['preventive', 'corrective', 'inspection']),
  description: String,
  cost: Number,
  scheduledDate: Date,
  completedDate: Date,
  status: String (enum: ['pending', 'in-progress', 'completed']),
  nextMaintenanceDate: Date,
  notes: String,
  attachments: [String],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Real-Time Features

TheFleetFly uses Socket.io for real-time communication. All real-time events are authenticated with JWT tokens.

### Location Tracking Events
```javascript
// Client emits
socket.emit('driver-location-update', {
  driverId: String,
  latitude: Number,
  longitude: Number,
  speed: Number,
  heading: Number,
  altitude: Number
});

// Server broadcasts to subscribed clients
socket.on('location-updated', (locationData) => {
  // Update map with new driver location
});
```

### Chat Events
```javascript
// Send message
socket.emit('send-message', {
  conversationId: String,
  message: String,
  attachments: [File]
});

// Receive message
socket.on('message-received', (messageData) => {
  // Display message in chat
});
```

### Notification Events
```javascript
socket.on('notification', {
  type: String, // 'assignment', 'maintenance', 'alert'
  title: String,
  message: String,
  data: Object,
  timestamp: Date
});
```

### Connection Authentication
```javascript
const socket = io(SOCKET_URL, {
  auth: {
    token: localStorage.getItem('authToken')
  },
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: 5
});
```

---

## Testing

### Backend Tests

```bash
cd backend

# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

### Test Coverage

Currently covers:
- Authentication endpoints (login, signup, JWT validation)
- Authorization & role-based access
- Vehicle CRUD operations
- Error handling and validation

---

## Security

### Implemented Security Features

- ✅ **JWT Authentication**: Secure token-based authentication
- ✅ **Password Hashing**: bcryptjs for secure password storage
- ✅ **CORS Protection**: Cross-origin request validation
- ✅ **Helmet Headers**: Security headers via Helmet middleware
- ✅ **Protected Routes**: Role-based access control (RBAC)
- ✅ **Socket.io Authentication**: JWT validation for WebSocket connections
- ✅ **Input Validation**: Joi and Zod schema validation
- ✅ **Error Handling**: Safe error messages in production
- ✅ **File Upload Security**: File type & size validation
- ✅ **Rate Limiting**: Prevents abuse and brute force attacks

### Best Practices

- Never commit `.env` files
- Use environment-specific configurations
- Keep dependencies updated
- Implement regular security audits
- Use HTTPS in production
- Enable database authentication
- Set strong JWT secrets (min 32 characters)

---

## Troubleshooting

### Maps Not Loading
- Clear browser cache (Ctrl+Shift+R)
- Ensure Leaflet CSS is loaded properly
- Check that `VITE_API_URL` is correctly configured
- Verify backend is running on port 5000

### Socket.io Connection Issues
- Ensure backend server is running
- Check CORS configuration matches your frontend URL
- Verify JWT token is present in browser localStorage
- Check browser console for WebSocket errors
- Verify `VITE_SOCKET_URL` in frontend .env

### MongoDB Connection Errors
- Verify MongoDB URI in `.env`
- For MongoDB Atlas: Ensure your IP is whitelisted
- Check network connectivity to database server
- Verify credentials are correct
- Test connection with mongo shell: `mongosh "your-uri"`

### Authentication Failures
- Ensure backend is running on correct port (5000)
- Clear browser cache and localStorage
- Check that JWT_SECRET matches in backend
- Verify API endpoint URL in frontend configuration
- Check browser DevTools Console for detailed errors

### Port Already in Use

**Windows:**
```powershell
Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process
```

**Linux/Mac:**
```bash
lsof -ti:5000 | xargs kill -9
```

Or change PORT in `.env` file

### Node Modules Issues
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Vite Build Issues
```bash
# Clear cache and rebuild
rm -rf dist
npm run build
```

---

## Contributing

We welcome contributions! Please follow these steps:

1. **Fork the Repository**
   ```bash
   git clone https://github.com/your-username/thefleetfly.git
   ```

2. **Create a Feature Branch**
   ```bash
   git checkout -b feature/AmazingFeature
   ```

3. **Commit Your Changes**
   ```bash
   git commit -m 'Add some AmazingFeature'
   ```

4. **Push to the Branch**
   ```bash
   git push origin feature/AmazingFeature
   ```

5. **Open a Pull Request**
   - Describe your changes clearly
   - Reference any related issues
   - Ensure all tests pass

---

## License

This project is licensed under the **ISC License** - see the LICENSE file for details.

```
ISC License

Copyright (c) 2025 Ayush9924

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.
```

---

## Support

### Getting Help

- **Documentation**: Check the [documentation files](./docs) for detailed guides
- **Issues**: Open an [issue on GitHub](https://github.com/Ayush9924/thefleetfly/issues)
- **Discussions**: Join our [community discussions](https://github.com/Ayush9924/thefleetfly/discussions)

### Contact

- **Author**: [Ayush9924](https://github.com/Ayush9924)
- **Email**: Contact through GitHub profile
- **Repository**: [thefleetfly](https://github.com/Ayush9924/thefleetfly)

---

## Roadmap

### Upcoming Features

- [ ] Mobile app for iOS and Android
- [ ] Advanced predictive maintenance
- [ ] Integration with payment gateways
- [ ] SMS/Email notifications
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Data export (PDF/Excel)
- [ ] Advanced analytics dashboard
- [ ] API rate limiting and throttling
- [ ] Vehicle health score system

### Recently Completed

- ✅ Real-time vehicle tracking with Socket.io
- ✅ Live chat and notification system
- ✅ Enhanced authentication with OTP
- ✅ Fixed API endpoint configuration
- ✅ Leaflet map integration with custom styling
- ✅ Comprehensive error handling
- ✅ Database seeding with sample data

---

## Acknowledgments

- [Express.js](https://expressjs.com/) - Web framework
- [React](https://react.dev/) - UI library
- [MongoDB](https://www.mongodb.com/) - Database
- [Socket.io](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [Leaflet](https://leafletjs.com/) - Mapping library

---

## Changelog

### Version 1.0.0 (December 2025)
- Initial release
- Core fleet management features
- Real-time tracking system
- Live chat functionality
- Comprehensive API documentation

---

**Last Updated**: December 26, 2025  
**Maintained by**: [Ayush9924](https://github.com/Ayush9924)  
**Status**: Active Development ✨

---

<p align="center">
  <strong>Made with ❤️ for efficient fleet management</strong>
</p>
