# TheFleetFly - Backend Architecture Explained
## Simple Presentation Guide for Non-Technical People

---

## 🎯 WHAT IS BACKEND?

**Simple Definition**: Backend is like the "kitchen" of a restaurant.
- **Frontend** (Landing Page, Login, Dashboard) = What customers see
- **Backend** = The chef and cooking process (behind the scenes)

**What Backend does:**
- Stores data in database
- Processes user requests
- Returns information to frontend
- Manages authentication (login/logout)
- Handles real-time updates

---

## 🏗️ BACKEND ARCHITECTURE (How it works)

```
┌─────────────────────────────────────────────────────────┐
│                                                          │
│                    FRONTEND (Browser)                   │
│                  (Landing Page, Login)                  │
│                                                          │
└────────────────┬──────────────────────────────┬─────────┘
                 │                              │
         ┌───────▼──────────┐         ┌────────▼──────┐
         │  HTTP/HTTPS      │         │  WebSocket    │
         │  Request/Response│         │  (Real-time)  │
         └───────┬──────────┘         └────────┬──────┘
                 │                              │
     ┌───────────▼──────────────────────────────▼────────┐
     │                                                    │
     │          BACKEND SERVER (Node.js + Express)       │
     │                                                    │
     │  ┌────────────────┬─────────┬──────────────────┐ │
     │  │ Controllers    │ Routes  │ Middleware       │ │
     │  │ (Logic)        │ (URLs)  │ (Validation)     │ │
     │  └────────────────┴─────────┴──────────────────┘ │
     │                                                    │
     └────────────────────┬────────────────────────────┘
                          │
                          │
         ┌────────────────▼──────────────────┐
         │                                   │
         │    DATABASE (MongoDB)             │
         │    (Where data is stored)         │
         │                                   │
         │  - Users                          │
         │  - Vehicles                       │
         │  - Drivers                        │
         │  - Assignments                    │
         │  - Maintenance Records            │
         │                                   │
         └─────────────────────────────────┘
```

---

## 🔄 HOW DATA FLOWS (Step by Step)

### Example: User Login

```
STEP 1: User enters email & password
         ↓
         (Frontend - Login Page)

STEP 2: Frontend sends data to Backend
         POST http://localhost:5000/api/auth/login
         Email: karan@example.com
         Password: xxxxxx
         ↓
         (Network Request)

STEP 3: Backend receives request
         ↓
         Routes it to: authController.login()
         ↓

STEP 4: Backend checks validation
         ✓ Email format correct?
         ✓ Password not empty?
         ✓ Both fields filled?
         ↓

STEP 5: Backend searches Database
         MongoDB looks for user with that email
         ↓

STEP 6: Backend verifies password
         Uses bcryptjs to compare passwords
         ✓ Password matches?
         ↓

STEP 7: Backend creates JWT Token
         Special secure code: "eyJhbGciOiJIUzI1NiIs..."
         ↓

STEP 8: Backend sends response to Frontend
         {
           success: true,
           token: "eyJhbGciOiJIUzI1NiIs...",
           user: {
             id: "123",
             name: "Karan",
             email: "karan@example.com"
           }
         }
         ↓

STEP 9: Frontend saves token in Browser
         localStorage.setItem('token', tokenValue)
         ↓

STEP 10: User logged in ✅
         Can now access Dashboard
```

---

## 📚 BACKEND FOLDER STRUCTURE

```
backend/
├── config/
│   └── db.js
│       └── Connects to MongoDB database
│
├── models/
│   ├── User.js          ← Defines user data structure
│   ├── Vehicle.js       ← Defines vehicle data structure
│   ├── Driver.js        ← Defines driver data structure
│   ├── Assignment.js    ← Defines assignment data
│   ├── Maintenance.js   ← Maintenance records
│   ├── FuelLog.js       ← Fuel consumption data
│   └── Route.js         ← Route information
│
├── controllers/
│   ├── authController.js       ← Login/Signup logic
│   ├── vehicleController.js    ← Vehicle management
│   ├── driverController.js     ← Driver management
│   ├── assignmentController.js ← Assignments
│   ├── maintenanceController.js← Maintenance
│   ├── fuelLogController.js    ← Fuel logs
│   ├── routeController.js      ← Routes
│   └── reportController.js     ← Reports & analytics
│
├── routes/
│   ├── authRoutes.js           ← Auth endpoints
│   ├── vehicleRoutes.js        ← Vehicle endpoints
│   ├── driverRoutes.js         ← Driver endpoints
│   ├── assignmentRoutes.js     ← Assignment endpoints
│   ├── maintenanceRoutes.js    ← Maintenance endpoints
│   ├── fuelLogRoutes.js        ← Fuel endpoints
│   ├── routeRoutes.js          ← Route endpoints
│   └── reportRoutes.js         ← Report endpoints
│
├── middleware/
│   ├── auth.js          ← Checks if user is logged in
│   ├── socketAuth.js    ← Authenticates socket connections
│   ├── error.js         ← Handles errors
│   └── upload.js        ← Handles file uploads
│
├── services/
│   ├── socketService.js     ← Real-time communication
│   ├── locationService.js   ← GPS tracking
│   └── mailService.js       ← Email notifications
│
├── seeders/
│   ├── seed.js              ← Add sample data
│   └── force-seed.js        ← Reset & add sample data
│
├── server.js            ← Main Express app
├── package.json         ← Dependencies
└── .env                 ← Environment variables (secrets)
```

---

## 🔑 KEY BACKEND CONCEPTS

### 1. **Models** (Data Structure)

A Model is like a **template** for data.

**Example: User Model**
```javascript
// backend/models/User.js
{
  name: "Karan",
  email: "karan@example.com",
  password: "hashed_password_here",
  role: "admin",
  phone: "9876543210",
  createdAt: "2025-12-26T10:30:00Z",
  updatedAt: "2025-12-26T10:30:00Z"
}
```

**What it defines:**
- What fields a User must have
- What type each field is (string, number, date)
- Which fields are required
- Which fields are unique

---

### 2. **Controllers** (Business Logic)

Controllers are like **instructions** for what to do with data.

**Example: authController.js**
```javascript
exports.login = async (req, res) => {
  // STEP 1: Get email and password from request
  const { email, password } = req.body;
  
  // STEP 2: Check if both are provided
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: "Email and password required"
    });
  }
  
  // STEP 3: Find user in database
  const user = await User.findOne({ email });
  
  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found"
    });
  }
  
  // STEP 4: Check if password matches
  const isPasswordCorrect = await bcryptjs.compare(password, user.password);
  
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      message: "Incorrect password"
    });
  }
  
  // STEP 5: Create JWT token
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
  
  // STEP 6: Send token back
  res.status(200).json({
    success: true,
    token: token,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
};
```

**In Simple Terms**: 
> "Take user's email and password → Search database → Compare password → Create token → Send back to user"

---

### 3. **Routes** (API Endpoints)

Routes are like **URL paths** to different functions.

**Example: authRoutes.js**
```javascript
router.post('/auth/login', authController.login);
router.post('/auth/signup', authController.signup);
router.get('/auth/profile', auth, authController.getProfile);
router.put('/auth/profile', auth, authController.updateProfile);
```

**What it means:**
- `POST /auth/login` → User logs in
- `POST /auth/signup` → User creates account
- `GET /auth/profile` → Get user info
- `PUT /auth/profile` → Update user info

---

### 4. **Middleware** (Traffic Cops)

Middleware checks requests before they reach controllers.

**Example: Auth Middleware**
```javascript
// Check if user has valid JWT token
const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided"
    });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.id;
    next(); // Go to next step
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid token"
    });
  }
};
```

**What it does:**
- Checks if user has valid token
- If yes → Allows request to continue
- If no → Blocks request

---

## 💾 DATABASE (MongoDB)

MongoDB is like a **file cabinet** that stores all your data.

```
MongoDB
├── Fleet-App Database
│   ├── users collection
│   │   ├── { _id: "1", name: "Karan", email: "karan@..." }
│   │   ├── { _id: "2", name: "Priya", email: "priya@..." }
│   │   └── ...
│   │
│   ├── vehicles collection
│   │   ├── { _id: "v1", licensePlate: "DL01AB1234", model: "Truck", ... }
│   │   ├── { _id: "v2", licensePlate: "DL01AB5678", model: "Van", ... }
│   │   └── ...
│   │
│   ├── drivers collection
│   │   ├── { _id: "d1", name: "Rajesh", licenseNumber: "DL0919990001", ... }
│   │   ├── { _id: "d2", name: "Suresh", licenseNumber: "DL0919990002", ... }
│   │   └── ...
│   │
│   └── assignments collection
│       ├── { _id: "a1", vehicleId: "v1", driverId: "d1", status: "active", ... }
│       └── ...
```

**Each record is called a "Document"** (like a word document with structured data)

---

## 🔐 SECURITY FEATURES

### 1. **Password Hashing (bcryptjs)**

```
User enters: password123

Backend hashes it: $2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKeUxWdeS86.CHyqiZDm

Only hashed version stored in database, never plain text!
```

**Why?** If hacker gets database, they can't use passwords to login.

---

### 2. **JWT Token (JSON Web Token)**

```
After login, backend creates:
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.
eyJpZCI6IjEyMyIsImVtYWlsIjoieHl6QGNvbS5jb20ifQ.
TJVA95OrM7E2cBab30RMHrHDcEfxjoYZgeFONFh7HgQ

Frontend stores this token. 
For every request, sends: Authorization: Bearer token_here

Backend verifies token is real and not expired.
```

**Why?** User doesn't send password every time (unsafe). Token proves they logged in.

---

### 3. **CORS (Cross-Origin Resource Sharing)**

```
Frontend: http://localhost:5173
Backend: http://localhost:5000

Backend says: "I allow requests from port 5173"
So Frontend can communicate with Backend safely.
```

---

## 🔄 REAL-TIME FEATURES (Socket.io)

Normal HTTP: Frontend asks backend, backend responds, done.
Problem: How to push live updates to frontend?

**Solution: Socket.io (Two-way Communication)**

```
┌──────────────────┐                    ┌──────────────────┐
│   FRONTEND       │                    │   BACKEND        │
│   (Browser)      │  ◄─────────────►   │   (Server)       │
│                  │   WebSocket        │                  │
└──────────────────┘   Connection       └──────────────────┘

Frontend can:
- Listen for updates: socket.on('location-update', ...)
- Send data: socket.emit('driver-location', {...})

Backend can:
- Listen for events: socket.on('driver-location', ...)
- Send to all: socket.emit('location-updated', {...})
```

**Real Example: Live Vehicle Tracking**

```
FRONTEND:
Driver moves, sends location:
socket.emit('driver-location-update', {
  driverId: 'd1',
  latitude: 40.7128,
  longitude: -74.0060,
  speed: 45
});

BACKEND:
Receives location:
socket.on('driver-location-update', (data) => {
  // Save to database
  // Broadcast to all users watching dashboard
  socket.emit('location-updated', data);
});

FRONTEND:
Gets real-time update:
socket.on('location-updated', (data) => {
  // Update map with new location
  updateMapMarker(data.latitude, data.longitude);
});
```

---

## 📡 API ENDPOINTS (Like URLs)

### Authentication APIs
```
POST   /api/auth/signup
POST   /api/auth/login
GET    /api/auth/profile
PUT    /api/auth/profile
```

### Vehicle APIs
```
GET    /api/vehicles              ← Get all vehicles
GET    /api/vehicles/:id          ← Get one vehicle
POST   /api/vehicles              ← Create new vehicle
PUT    /api/vehicles/:id          ← Update vehicle
DELETE /api/vehicles/:id          ← Delete vehicle
```

### Driver APIs
```
GET    /api/drivers               ← Get all drivers
GET    /api/drivers/:id           ← Get one driver
POST   /api/drivers               ← Create new driver
PUT    /api/drivers/:id           ← Update driver
DELETE /api/drivers/:id           ← Delete driver
```

---

## 🚀 WHEN LANDING PAGE CONNECTS TO BACKEND

### Scenario 1: User clicks "Sign In"
```
Landing Page
    ↓
  navigate("/login")
    ↓
Login Page appears
    ↓
User enters email & password
    ↓
Clicks "Login"
    ↓
Sends POST /api/auth/login to Backend
    ↓
Backend validates & returns token
    ↓
Frontend stores token
    ↓
User logged in ✅
    ↓
Can access Dashboard with real data
```

### Scenario 2: User clicks "Get Started Free"
```
Landing Page
    ↓
  navigate("/login") → Goes to Login
    ↓
User clicks "Sign Up" on Login page
    ↓
Signup Page appears
    ↓
User fills form (name, email, password)
    ↓
Clicks "Create Account"
    ↓
Sends POST /api/auth/signup to Backend
    ↓
Backend checks email doesn't exist
    ↓
Backend hashes password
    ↓
Backend saves user to MongoDB
    ↓
Backend returns token
    ↓
User logged in ✅
```

---

## 🗄️ HOW DATA IS STORED (MongoDB Example)

### User Collection
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439011"),
  "name": "Karan Singh",
  "email": "karan@example.com",
  "password": "$2b$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcg7b3XeKe...",
  "role": "admin",
  "phone": "9876543210",
  "createdAt": "2025-12-26T10:30:00Z",
  "updatedAt": "2025-12-26T10:30:00Z"
}
```

### Vehicle Collection
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439012"),
  "licensePlate": "DL01AB1234",
  "model": "Truck",
  "manufacturer": "Tata",
  "year": 2023,
  "status": "active",
  "mileage": 15000,
  "fuelType": "diesel",
  "fuelCapacity": 200,
  "image": "https://...",
  "createdAt": "2025-12-20T08:00:00Z"
}
```

### Assignment Collection (Links vehicle to driver)
```json
{
  "_id": ObjectId("507f1f77bcf86cd799439013"),
  "vehicle": ObjectId("507f1f77bcf86cd799439012"),  ← Reference to vehicle
  "driver": ObjectId("507f1f77bcf86cd799439014"),   ← Reference to driver
  "startDate": "2025-12-26T06:00:00Z",
  "endDate": "2025-12-26T18:00:00Z",
  "status": "active",
  "route": {
    "startLocation": {
      "latitude": 40.7128,
      "longitude": -74.0060,
      "address": "Warehouse A"
    },
    "endLocation": {
      "latitude": 40.7589,
      "longitude": -73.9851,
      "address": "Downtown"
    }
  }
}
```

---

## 🎯 PRESENTATION SUMMARY

**For Non-Technical Audience:**

> "Our backend is like the brain of the application. When you sign in on the landing page, it checks your credentials, creates a secure token, and lets you into the dashboard. It stores all vehicle and driver information in a database and provides real-time updates about fleet movements."

**For Technical Audience:**

> "We use Node.js with Express framework. Data is stored in MongoDB. Authentication uses JWT tokens with bcryptjs password hashing. Socket.io enables real-time communication via WebSockets. We follow REST API standards for HTTP endpoints and implement middleware for authentication, validation, and error handling."

---

## 🔗 CONNECTION FLOW SUMMARY

```
Frontend (React) 
    ↓
Landing Page → Sign In Button
    ↓
Routes to Login Page
    ↓
User enters credentials
    ↓
HTTP POST to Backend
    ↓
Backend (Node.js + Express)
    ↓
authController.login()
    ↓
Queries MongoDB for user
    ↓
Verifies password
    ↓
Creates JWT token
    ↓
Returns token to Frontend
    ↓
Frontend stores token
    ↓
Routes to Dashboard
    ↓
Dashboard sends requests with token
    ↓
Backend verifies token (middleware)
    ↓
Returns real data from MongoDB
    ↓
Dashboard displays live data ✅
```

---

This framework allows the landing page to seamlessly connect users to the full application backend!

