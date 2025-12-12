# 🚚 TheFleetFly - Fleet Management System

A comprehensive full-stack fleet management application built with **Node.js/Express** backend and **React** frontend. This system enables efficient management of vehicles, drivers, assignments, maintenance, fuel logs, routes, and generates detailed reports.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database Models](#database-models)
- [Frontend Pages](#frontend-pages)
- [Testing](#testing)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Features
- **User Authentication & Authorization**
  - Secure login/signup with JWT tokens
  - Password encryption with bcryptjs
  - Role-based access control

- **Vehicle Management**
  - Add, update, and delete vehicles
  - Track vehicle details (model, license plate, status)
  - View vehicle history and metrics
  - Upload vehicle images

- **Driver Management**
  - Manage driver information and licenses
  - Track driver performance metrics
  - Assign drivers to vehicles
  - Driver document uploads

- **Route Planning**
  - Create and manage delivery routes
  - Real-time route tracking with Leaflet maps
  - Route optimization and planning

- **Assignments**
  - Create vehicle-driver assignments
  - Track assignment status
  - Manage assignment history

- **Maintenance Management**
  - Schedule and track vehicle maintenance
  - Record maintenance history
  - Track maintenance costs

- **Fuel Log Tracking**
  - Log fuel consumption
  - Track fuel costs and efficiency
  - Fuel consumption analytics

- **Reports & Analytics**
  - Generate comprehensive reports
  - Vehicle performance metrics
  - Driver analytics
  - Cost analysis and trends

- **Real-Time Features** ⭐ NEW
  - Live vehicle tracking with Leaflet maps
  - Real-time location updates via Socket.io
  - Live driver notifications
  - Real-time chat messaging between dispatchers and drivers
  - Instant updates on assignments and maintenance alerts

---

## 🛠️ Tech Stack

### Backend
- **Runtime:** Node.js
- **Framework:** Express.js (v5.2.1)
- **Real-Time:** Socket.io (v4.8.1)
- **Database:** MongoDB with Mongoose (v9.0.1)
- **Authentication:** JWT (jsonwebtoken)
- **Password Hashing:** bcryptjs
- **Security:** Helmet, CORS
- **Logging:** Morgan
- **File Upload:** Multer
- **Testing:** Jest, Supertest
- **Development:** Nodemon

### Frontend
- **Library:** React (v19.2.0)
- **Build Tool:** Vite
- **Routing:** React Router (v7.10.1)
- **Styling:** Tailwind CSS
- **UI Components:** Radix UI, Lucide React
- **Maps:** Leaflet, React Leaflet
- **Real-Time:** Socket.io-client (v4.8.1)
- **Form Handling:** React Hook Form with Zod validation
- **Data Fetching:** Axios, React Query
- **Charting:** Recharts
- **Animations:** Framer Motion
- **Notifications:** React Hot Toast
- **Linting:** ESLint

---

## 📁 Project Structure

```
fleet-app/
├── backend/
│   ├── config/
│   │   └── db.js                 # MongoDB connection
│   ├── models/
│   │   ├── User.js               # User schema
│   │   ├── Vehicle.js            # Vehicle schema
│   │   ├── Driver.js             # Driver schema
│   │   ├── Assignment.js         # Assignment schema
│   │   ├── Maintenance.js        # Maintenance schema
│   │   ├── FuelLog.js            # Fuel log schema
│   │   └── Route.js              # Route schema
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── vehicleController.js
│   │   ├── driverController.js
│   │   ├── assignmentController.js
│   │   ├── maintenanceController.js
│   │   ├── fuelLogController.js
│   │   ├── routeController.js
│   │   └── reportController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── vehicleRoutes.js
│   │   ├── driverRoutes.js
│   │   ├── assignmentRoutes.js
│   │   ├── maintenanceRoutes.js
│   │   ├── fuelLogRoutes.js
│   │   ├── routeRoutes.js
│   │   └── reportRoutes.js
│   ├── middleware/
│   │   ├── auth.js               # JWT authentication
│   │   ├── socketAuth.js         # Socket.io authentication
│   │   ├── error.js              # Error handling
│   │   └── upload.js             # File upload handling
│   ├── services/
│   │   ├── socketService.js      # Socket.io event handlers
│   │   └── locationService.js    # Location tracking service
│   ├── seeders/
│   │   └── seed.js               # Database seeding
│   ├── uploads/                  # Uploaded files storage
│   ├── tests/
│   │   ├── setup.js
│   │   └── integration/
│   │       └── auth.test.js
│   ├── server.js                 # Express app setup
│   ├── jest.config.js
│   ├── package.json
│   └── .env                      # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveMapTracker.jsx    # Real-time vehicle tracking map
│   │   │   ├── ChatList.jsx          # Live chat component
│   │   │   ├── ChatWindow.jsx        # Chat messaging
│   │   │   ├── NotificationCenter.jsx # Notifications
│   │   │   ├── layout/
│   │   │   │   ├── Layout.jsx
│   │   │   │   ├── Navbar.jsx
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── ProtectedRoute.jsx
│   │   │   │   └── PublicRoute.jsx
│   │   │   ├── dashboard/
│   │   │   │   └── KpiCard.jsx
│   │   │   └── ui/               # Reusable UI components
│   │   │       ├── button.jsx
│   │   │       ├── card.jsx
│   │   │       ├── input.jsx
│   │   │       ├── select.jsx
│   │   │       ├── table.jsx
│   │   │       ├── dropdown-menu.jsx
│   │   │       └── skeleton.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx
│   │   │   ├── LoginPage.jsx
│   │   │   ├── SignUpPage.jsx
│   │   │   ├── DashboardPage.jsx
│   │   │   ├── VehiclesPage.jsx
│   │   │   ├── VehicleDetailPage.jsx
│   │   │   ├── DriversPage.jsx
│   │   │   ├── AssignmentsPage.jsx
│   │   │   ├── MaintenancePage.jsx
│   │   │   ├── FuelLogsPage.jsx
│   │   │   ├── RoutePlannerPage.jsx
│   │   │   ├── LiveTrackingPage.jsx
│   │   │   ├── ChatPage.jsx
│   │   │   ├── NotificationsPage.jsx
│   │   │   └── ReportsPage.jsx
│   │   ├── services/
│   │   │   ├── api.jsx                # API client configuration
│   │   │   ├── authService.jsx
│   │   │   └── index.jsx
│   │   ├── contexts/
│   │   │   ├── AuthContext.jsx        # Authentication context
│   │   │   ├── RealtimeContext.jsx    # Real-time events context
│   │   │   └── QueryProvider.jsx      # React Query provider
│   │   ├── hooks/
│   │   │   ├── useSocketChat.js       # Socket.io chat hook
│   │   │   ├── useSocketLocation.js   # Socket.io location hook
│   │   │   ├── useSocketNotifications.js # Socket.io notifications hook
│   │   │   └── index.js
│   │   ├── lib/
│   │   │   ├── socket.js              # Socket.io configuration
│   │   │   ├── mockLocationData.js    # Mock location data
│   │   │   └── utils.js               # Utility functions
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── public/
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── eslint.config.js
│   ├── package.json
│   └── README.md
│
└── README.md (this file)
```

---

## 📦 Prerequisites

- **Node.js:** v16+ (preferably v18+)
- **npm or yarn:** Package manager
- **MongoDB:** Local or cloud (MongoDB Atlas)
- **Git:** Version control

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Ayush9924/thefleetfly.git
cd fleet-app
```

### 2. Setup Backend

```bash
cd backend
npm install
```

### 3. Setup Frontend

```bash
cd ../frontend
npm install
```

---

## ⚙️ Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration
MONGO_URI=mongodb://localhost:27017/fleet-app
# Or use MongoDB Atlas:
# MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/fleet-app?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_in_production
JWT_EXPIRE=7d

# Frontend URL (CORS)
FRONTEND_URL=http://localhost:5173

# File Upload
MAX_FILE_SIZE=5242880  # 5MB in bytes
UPLOAD_DIR=./uploads
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🎯 Running the Application

### Backend

**Development Mode:**
```bash
cd backend
npm run dev
```
The backend server will start on `http://localhost:5000`

**Production Mode:**
```bash
npm start
```

**Seed Database (Optional):**
```bash
npm run seed
```

### Frontend

**Development Mode:**
```bash
cd frontend
npm run dev
```
The frontend will be available at `http://localhost:5173`

**Build for Production:**
```bash
npm run build
npm run preview
```

### Running Both Simultaneously

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend && npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend && npm run dev
```

Then open your browser to `http://localhost:5173`

---

## � Real-Time Features (Socket.io)

The application now includes real-time communication using **Socket.io** for live vehicle tracking, chat, and notifications.

### Features
- **Live Vehicle Tracking**: Real-time location updates from drivers displayed on interactive map
- **Live Chat**: Instant messaging between dispatchers and drivers
- **Notifications**: Real-time alerts for assignments, maintenance, and system updates
- **Location History**: Track vehicle movement history

### Socket.io Events

#### Location Events
```javascript
// Client emits location update
socket.emit('driver-location-update', {
  driverId: 'driver123',
  latitude: 40.7128,
  longitude: -74.0060,
  speed: 45,
  heading: 90
});

// Server broadcasts to all clients
socket.on('driver-location-updated', (data) => {
  // Update map with new location
});
```

#### Chat Events
```javascript
// Send message
socket.emit('send-message', {
  senderId: 'user123',
  recipientId: 'user456',
  message: 'Hello!',
  timestamp: Date.now()
});

// Receive message
socket.on('receive-message', (data) => {
  // Display message
});
```

#### Notification Events
```javascript
// Server sends notifications
socket.on('notification', (data) => {
  // notification alert
});
```

### Authentication
Socket.io connections are authenticated using JWT tokens. The token is sent as:
```javascript
socket.io(url, {
  auth: {
    token: localStorage.getItem('token')
  }
});
```

---

## �📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register a new user |
| POST | `/auth/login` | Login user |
| GET | `/auth/profile` | Get current user profile (Protected) |
| PUT | `/auth/profile` | Update user profile (Protected) |

### Vehicle Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/vehicles` | Get all vehicles |
| GET | `/vehicles/:id` | Get vehicle details |
| POST | `/vehicles` | Create new vehicle |
| PUT | `/vehicles/:id` | Update vehicle |
| DELETE | `/vehicles/:id` | Delete vehicle |

### Driver Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/drivers` | Get all drivers |
| GET | `/drivers/:id` | Get driver details |
| POST | `/drivers` | Create new driver |
| PUT | `/drivers/:id` | Update driver |
| DELETE | `/drivers/:id` | Delete driver |

### Assignment Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/assignments` | Get all assignments |
| POST | `/assignments` | Create assignment |
| PUT | `/assignments/:id` | Update assignment |
| DELETE | `/assignments/:id` | Delete assignment |

### Maintenance Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/maintenance` | Get all maintenance records |
| POST | `/maintenance` | Create maintenance record |
| PUT | `/maintenance/:id` | Update maintenance record |
| DELETE | `/maintenance/:id` | Delete maintenance record |

### Fuel Log Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/fuels` | Get all fuel logs |
| POST | `/fuels` | Create fuel log |
| PUT | `/fuels/:id` | Update fuel log |
| DELETE | `/fuels/:id` | Delete fuel log |

### Route Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/routes` | Get all routes |
| POST | `/routes` | Create new route |
| PUT | `/routes/:id` | Update route |
| DELETE | `/routes/:id` | Delete route |

### Report Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/summary` | Get summary report |
| GET | `/reports/vehicle/:id` | Get vehicle report |
| GET | `/reports/driver/:id` | Get driver report |

---

## 🗄️ Database Models

### User
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['admin', 'manager', 'driver']),
  phone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Vehicle
```javascript
{
  licensePlate: String (unique),
  model: String,
  manufacturer: String,
  year: Number,
  type: String,
  registrationNumber: String,
  status: String (enum: ['active', 'maintenance', 'inactive']),
  mileage: Number,
  fuelType: String,
  capacity: Number,
  image: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Driver
```javascript
{
  name: String,
  email: String,
  phone: String,
  licenseNumber: String,
  licenseExpiry: Date,
  status: String (enum: ['active', 'inactive', 'on-leave']),
  experience: Number,
  contactPerson: String,
  contactPhone: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Assignment
```javascript
{
  vehicleId: ObjectId (ref: Vehicle),
  driverId: ObjectId (ref: Driver),
  startDate: Date,
  endDate: Date,
  status: String (enum: ['pending', 'active', 'completed', 'cancelled']),
  route: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Maintenance
```javascript
{
  vehicleId: ObjectId (ref: Vehicle),
  type: String (enum: ['preventive', 'corrective', 'inspection']),
  description: String,
  cost: Number,
  date: Date,
  nextMaintenanceDate: Date,
  status: String (enum: ['pending', 'in-progress', 'completed']),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### FuelLog
```javascript
{
  vehicleId: ObjectId (ref: Vehicle),
  driverId: ObjectId (ref: Driver),
  quantity: Number,
  cost: Number,
  fuelType: String,
  date: Date,
  mileage: Number,
  location: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Route
```javascript
{
  name: String,
  description: String,
  startLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  endLocation: {
    latitude: Number,
    longitude: Number,
    address: String
  },
  distance: Number,
  estimatedTime: Number,
  status: String (enum: ['planned', 'active', 'completed']),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🖥️ Frontend Pages

### Public Pages
- **Landing Page** (`/`) - Welcome page with project information
- **Login Page** (`/login`) - User authentication
- **Sign Up Page** (`/signup`) - User registration

### Protected Pages
- **Dashboard** (`/dashboard`) - Overview with KPI cards and metrics
- **Vehicles** (`/vehicles`) - List and manage vehicles
- **Vehicle Details** (`/vehicles/:id`) - Individual vehicle information
- **Drivers** (`/drivers`) - List and manage drivers
- **Assignments** (`/assignments`) - Create and manage vehicle-driver assignments
- **Maintenance** (`/maintenance`) - Schedule and track maintenance
- **Fuel Logs** (`/fuels`) - Log and track fuel consumption
- **Route Planner** (`/routes`) - Plan and manage routes with map view
- **Reports** (`/reports`) - Generate and view analytics

---

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run tests
npm test

# Run tests in watch mode
npm run test:watch
```

Current test coverage:
- Authentication tests
- Integration tests

---

## 🔐 Security Features

- ✅ JWT-based authentication
- ✅ Password hashing with bcryptjs
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ Protected routes with middleware
- ✅ Socket.io authentication

---

## 🎯 Development Credentials

For testing purposes, use these default credentials:

| Email | Password | Role |
|-------|----------|------|
| admin@fleet.com | admin123 | Admin |
| karan@202@gmail.com | karan@202 | Manager |

> **Note:** These are development credentials only. Replace with proper user management in production.

---

## 🐛 Troubleshooting

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

### MongoDB Connection Errors
- Verify MongoDB URI in `.env`
- For MongoDB Atlas: Ensure your IP is whitelisted
- Check network connectivity to database server
- Verify credentials are correct

### Authentication Failures
- Ensure backend is running on correct port (5000)
- Clear browser cache and localStorage
- Check that JWT_SECRET matches in backend
- Verify API endpoint URL in frontend configuration

### Port Already in Use
- Windows: `Get-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess | Stop-Process`
- Linux/Mac: `lsof -ti:5000 | xargs kill -9`
- Or change PORT in `.env` file
- ✅ File upload validation
- ✅ Input validation with Zod

---

## 🚨 Error Handling

The application includes comprehensive error handling:

- Custom error middleware in backend
- Error boundaries in React
- Detailed error messages for debugging
- Production-safe error responses

---

## 📝 Available Scripts

### Backend

| Command | Description |
|---------|-------------|
| `npm start` | Start production server |
| `npm run dev` | Start development server with hot reload |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run seed` | Seed database with initial data |

### Frontend

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |

---

## 🤝 Contributing

1. Create a feature branch (`git checkout -b feature/AmazingFeature`)
2. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Ayush9924**
- GitHub: [Ayush9924](https://github.com/Ayush9924)
- Repository: [thefleetfly](https://github.com/Ayush9924/thefleetfly)

---

## 📞 Support

For support, please open an issue on the GitHub repository or contact the development team.

---

## 🎯 Future Enhancements

- Real-time GPS tracking integration
- Mobile app for drivers
- Advanced analytics dashboard
- Integration with payment gateways
- SMS/Email notifications
- Multi-language support
- Data export functionality (PDF/Excel)

---

**Last Updated:** December 13, 2025

### Recent Changes
- ✅ Real-time vehicle tracking with Socket.io
- ✅ Live chat and notification system
- ✅ Enhanced authentication with fallback credentials
- ✅ Fixed API endpoint configuration
- ✅ GitHub code synchronized while keeping servers running
- ✅ Leaflet map integration with custom styling

Happy Fleet Managing! 🚚✨
