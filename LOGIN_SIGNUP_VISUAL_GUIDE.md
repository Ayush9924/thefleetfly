# Authentication System - Visual Diagrams & Code Examples
## TheFleetFly Login, Sign Up & Forgot Password

---

## 📊 PART 1: Visual Flowcharts & Diagrams

### 1. User Authentication State Machine

```
                    ┌─────────────────┐
                    │   UNAUTHENTICATED
                    │   (Not Logged In)
                    └────────┬─────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
        LOGIN            SIGNUP         FORGOT PASSWORD
           │                 │                 │
           ▼                 ▼                 ▼
    ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
    │ Email Check  │  │ Email Check  │  │ Email Check  │
    │ Password OK? │  │ User Create  │  │ OTP Generate │
    └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
           │                 │                 │
        YES/NO              YES                YES
           │                 │                 ▼
           ▼                 ▼          ┌──────────────┐
    Token Generated   Token Generated  │ OTP Verify   │
           │                 │         │ Token Create │
           └─────────┬───────┘         └──────┬───────┘
                     │                        │
                     ▼                        │
            ┌─────────────────┐              │
            │ Save in Storage │              │
            │ Redirect Home   │              │
            └────────┬────────┘              │
                     │                       ▼
                     │              ┌─────────────────┐
                     │              │Password Reset OK│
                     │              │ Redirect Login  │
                     │              └────────┬────────┘
                     │                       │
                     └───────────┬───────────┘
                                 │
                                 ▼
                     ┌─────────────────────┐
                     │  AUTHENTICATED ✓    │
                     │ (JWT Token Valid)   │
                     └────────┬────────────┘
                              │
                         Token Expires
                         (24 Hours)
                              │
                              ▼
                     ┌─────────────────┐
                     │ UNAUTHENTICATED │
                     │ (Must Login     │
                     │  Again)         │
                     └─────────────────┘
```

### 2. Password Security Levels

```
┌─────────────────────────────────────────────────────────┐
│         PASSWORD SECURITY: 3-LAYER PROTECTION           │
└─────────────────────────────────────────────────────────┘

LAYER 1: Frontend Validation (Client-Side)
┌─────────────────────────────────────┐
│ User Types Password                 │
│  ↓                                  │
│ Check: Length ≥ 6 chars? ✓         │
│ Check: Passwords match? ✓          │
│ Check: Not same as old? ✓          │
│  ↓                                  │
│ Show Strength Indicator             │
│  └→ Weak (red)    [■ ]            │
│  └→ Fair (yellow) [■ ■ ]          │
│  └→ Strong (green) [■ ■ ■]        │
│                                     │
│ Only send if valid ✓               │
└─────────────────────────────────────┘

LAYER 2: Network Encryption (SSL/HTTPS)
┌─────────────────────────────────────┐
│ Frontend ──(HTTPS)──> Backend       │
│                                     │
│ All data encrypted in transit       │
│ Even if intercepted, unreadable     │
│                                     │
│ Example:                            │
│ Plain:  "password123"               │
│ Over network: 🔐🔐🔐🔐🔐🔐🔐       │
└─────────────────────────────────────┘

LAYER 3: Backend Security (Database)
┌─────────────────────────────────────┐
│ Backend Receives Password            │
│  ↓                                  │
│ Hash with bcryptjs + Salt           │
│  ↓                                  │
│ Original: "password123"              │
│ Hashed: "$2a$10$kf.a7X..."          │
│  ↓                                  │
│ Store ONLY hashed version           │
│  ↓                                  │
│ Database (MongoDB):                 │
│ {                                   │
│   "email": "john@ex.com",           │
│   "password": "$2a$10$kf.a7X...",   │
│   "name": "John Smith"              │
│ }                                   │
│                                     │
│ ⚠️ Original password NEVER stored   │
│ Even hackers see only hash!         │
└─────────────────────────────────────┘
```

### 3. Token & OTP Lifecycle

```
JWT TOKEN LIFECYCLE (24 hours)
────────────────────────────────

0 hours        (Login)
│
│ ✓ Valid
│
├──────────────────────────────────────────────────
│
12 hours       (Can still use)
│
│ ✓ Still Valid
│
├──────────────────────────────────────────────────
│
24 hours       (Next day)
│
│ ✗ EXPIRED
│ Must login again
│
└──────────────────────────────────────────────────


OTP LIFECYCLE (15 minutes)
────────────────────────────────

0 mins         (Email sent)
│
│ ✓ Valid
│
├──────────────────────
│
7 mins         (User reading email)
│
│ ✓ Still Valid
│
├──────────────────────
│
15 mins        (Time's up)
│
│ ✗ EXPIRED
│ Must request new OTP
│
└──────────────────────


RESET TOKEN LIFECYCLE (15 minutes)
────────────────────────────────────

0 mins         (OTP verified)
│
│ ✓ Valid
│
├──────────────────────
│
15 mins        (After OTP verified)
│
│ ✗ EXPIRED
│ Must verify OTP again
│
└──────────────────────
```

### 4. Data Flow for Login

```
┌────────────────────────────────────────────────────────────────┐
│                      LOGIN DATA FLOW                           │
└────────────────────────────────────────────────────────────────┘

STEP 1: USER ENTERS DATA
┌──────────────────────────────────────┐
│ Frontend (React Component)            │
│                                      │
│ State Variables:                     │
│  email = "admin@fleet.com"           │
│  password = "admin123"               │
│  loading = false                     │
│                                      │
│ User clicks "Sign In"                │
│  ↓                                   │
│ validateForm() called                │
│  ├─ Check not empty ✓                │
│  ├─ Check email format ✓             │
│  └─ Return true                      │
│                                      │
│ setLoading(true)  {show spinner}     │
└──────────────────────────────────────┘

STEP 2: SEND TO BACKEND
┌──────────────────────────────────────┐
│ Network Request                      │
│                                      │
│ POST /api/auth/login                 │
│                                      │
│ Headers:                             │
│ {                                    │
│   "Content-Type": "application/json",│
│   "Authorization": null              │
│ }                                    │
│                                      │
│ Body:                                │
│ {                                    │
│   "email": "admin@fleet.com",       │
│   "password": "admin123"             │
│ }                                    │
└──────────────────────────────────────┘

STEP 3: BACKEND PROCESSES
┌──────────────────────────────────────┐
│ Node.js Backend (Express)            │
│                                      │
│ 1. Receive request                   │
│ 2. Extract email & password          │
│ 3. Validate input ✓                  │
│ 4. Search MongoDB:                   │
│                                      │
│   MongoDB Query:                     │
│   db.users.findOne({                 │
│     email: "admin@fleet.com"         │
│   })                                 │
│                                      │
│ 5. Found user? YES                   │
│ 6. Compare passwords:                │
│                                      │
│   bcrypt.compare(                    │
│     "admin123",                      │
│     "$2a$10$kf.a7X..."              │
│   ) → true                           │
│                                      │
│ 7. Create JWT:                       │
│                                      │
│   jwt.sign(                          │
│     { id: user._id },                │
│     process.env.JWT_SECRET,          │
│     { expiresIn: "24h" }            │
│   ) → "eyJhbGc..."                  │
│                                      │
│ 8. Prepare response                  │
└──────────────────────────────────────┘

STEP 4: BACKEND SENDS RESPONSE
┌──────────────────────────────────────┐
│ HTTP Response                        │
│                                      │
│ Status: 200 OK                       │
│                                      │
│ Body:                                │
│ {                                    │
│   "user": {                          │
│     "_id": "507f1f77bcf86cd799...", │
│     "name": "Admin User",            │
│     "email": "admin@fleet.com",      │
│     "role": "admin"                  │
│   },                                 │
│   "token": "eyJhbGciOiJIUzI1NiIs... │
│ }                                    │
└──────────────────────────────────────┘

STEP 5: FRONTEND RECEIVES
┌──────────────────────────────────────┐
│ React Component                      │
│                                      │
│ response.data = {                    │
│   user: {...},                       │
│   token: "eyJhbGc..."                │
│ }                                    │
│                                      │
│ 1. Extract token                     │
│ 2. localStorage.setItem('token', ...) │
│ 3. Update state: currentUser = user  │
│ 4. navigate("/dashboard")            │
│ 5. setLoading(false)                 │
│ 6. Show success toast                │
└──────────────────────────────────────┘

STEP 6: USER REDIRECTED
┌──────────────────────────────────────┐
│ Dashboard Page                       │
│ ✓ User Logged In!                    │
│                                      │
│ Requests include token:              │
│ Authorization: Bearer eyJhbGc...     │
│                                      │
│ Backend verifies token ✓             │
│ Serves dashboard ✓                   │
└──────────────────────────────────────┘
```

### 5. Data Flow for Forgot Password

```
┌────────────────────────────────────────────────────────────────┐
│              FORGOT PASSWORD DATA FLOW                         │
└────────────────────────────────────────────────────────────────┘

USER JOURNEY (3 Steps):

STEP 1️⃣  REQUEST OTP
┌──────────────────────────────────────┐
│ ForgotPassword Component             │
│                                      │
│ User enters: admin@fleet.com         │
│  ↓                                   │
│ Validate email ✓                     │
│  ↓                                   │
│ POST /api/auth/forgot-password       │
│  ↓                                   │
│ Backend:                             │
│  1. Find user by email               │
│  2. Generate OTP: 483726             │
│  3. Save OTP to DB (15 min expiry)   │
│  4. Send email: "Code: 483726"       │
│  5. Return success                   │
│  ↓                                   │
│ Frontend:                            │
│  1. Show "OTP Sent!" message         │
│  2. Display VerifyOTP component      │
└──────────────────────────────────────┘
      ↓
User checks email and sees: "Code: 483726"


STEP 2️⃣  VERIFY OTP
┌──────────────────────────────────────┐
│ VerifyOTP Component                  │
│                                      │
│ User enters: 483726                  │
│  ↓                                   │
│ POST /api/auth/verify-otp            │
│  ↓                                   │
│ Backend:                             │
│  1. Find OTP record                  │
│  2. Check: OTP matches? ✓            │
│  3. Check: Not expired? ✓            │
│  4. Delete OTP (one-time use)        │
│  5. Generate resetToken              │
│  6. Save resetToken (15 min expiry)  │
│  7. Return resetToken                │
│  ↓                                   │
│ Frontend:                            │
│  1. Store resetToken                 │
│  2. Display ResetPassword component  │
└──────────────────────────────────────┘
      ↓

STEP 3️⃣  RESET PASSWORD
┌──────────────────────────────────────┐
│ ResetPassword Component              │
│                                      │
│ User enters:                         │
│  - newPassword: newPass123           │
│  - confirmPassword: newPass123       │
│  ↓                                   │
│ Show strength: Strong (green) ✓      │
│ Show match: Passwords match ✓        │
│  ↓                                   │
│ POST /api/auth/reset-password        │
│  ↓                                   │
│ Backend:                             │
│  1. Find user by email               │
│  2. Verify resetToken valid ✓        │
│  3. Check not expired ✓              │
│  4. Hash new password                │
│  5. Update user.password             │
│  6. Clear resetToken                 │
│  7. Send confirmation email          │
│  8. Return success                   │
│  ↓                                   │
│ Frontend:                            │
│  1. Show "Password reset!" message   │
│  2. Redirect to login (/login)       │
│  3. User can now login with new pass │
└──────────────────────────────────────┘
```

---

## 💻 PART 2: Code Examples & Implementation Details

### 1. Frontend: Complete Login Hook

```javascript
// From: frontend/src/contexts/AuthContext.jsx
// Lines: 28-39

const login = useCallback(async (email, password) => {
  try {
    // Step 1: Call backend API
    const { user, token } = await apiLogin(email, password);
    
    // Step 2: Save user to context state
    setCurrentUser(user);
    
    // Step 3: Save token to browser storage (persist across page refresh)
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Step 4: Show success notification
    toast.success('Logged in successfully!');
    
    // Step 5: Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    // If login fails, show error
    toast.error('Failed to login. Please check your credentials.');
    throw error; // Re-throw for component to handle
  }
}, [navigate]);
```

### 2. Frontend: Complete Signup Hook

```javascript
// From: frontend/src/contexts/AuthContext.jsx
// Lines: 40-54

const register = useCallback(async (name, email, password, role = 'manager') => {
  try {
    // Step 1: Call backend API with all registration data
    const { user, token } = await apiRegister(name, email, password, role);
    
    // Step 2: Save user to context state
    setCurrentUser(user);
    
    // Step 3: Save token to browser storage
    localStorage.setItem('token', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    
    // Step 4: Show success notification
    toast.success('Registered successfully!');
    
    // Step 5: Redirect to dashboard
    navigate('/dashboard');
  } catch (error) {
    // If registration fails
    toast.error('Failed to register. Please try again.');
    throw error;
  }
}, [navigate]);
```

### 3. Backend: Complete Login Controller

```javascript
// From: backend/controllers/authController.js
// Lines: 104-162

const login = async (req, res) => {
  try {
    // STEP 1: Extract credentials from request body
    const { email, password } = req.body;

    // STEP 2: Validate that both fields are provided
    if (!email || !password) {
      return res.status(400).json({ 
        message: 'Please provide email and password' 
      });
    }

    // STEP 3: Try to find user in MongoDB
    let user = null;
    let useDevMode = false;

    try {
      user = await User.findOne({ email });
    } catch (dbError) {
      // If database connection fails, use in-memory users
      console.log('⚠️  MongoDB unavailable, using development mode');
      useDevMode = true;
    }

    // STEP 4: If in development mode
    if (useDevMode) {
      const devUser = devUsers[email];
      if (!devUser) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }

      // In dev mode, passwords are plain text (NOT SECURE)
      if (devUser.password !== password) {
        return res.status(401).json({ 
          message: 'Invalid email or password' 
        });
      }

      // Create JWT token
      const token = jwt.sign(
        { id: devUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

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

    // STEP 5: If MongoDB is available and user not found
    if (!user) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // STEP 6: Compare provided password with hashed password
    // matchPassword() is a method in User model that uses bcryptjs
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ 
        message: 'Invalid email or password' 
      });
    }

    // STEP 7: Create JWT token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE }
    );

    // STEP 8: Send successful response
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
```

### 4. Backend: Complete Registration Controller

```javascript
// From: backend/controllers/authController.js
// Lines: 28-102

const register = async (req, res) => {
  try {
    // STEP 1: Extract data from request body
    const { name, email, password, role } = req.body;

    // STEP 2: Validate all required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: 'Please provide all required fields' 
      });
    }

    // STEP 3: Validate password length
    if (password.length < 6) {
      return res.status(400).json({ 
        message: 'Password must be at least 6 characters' 
      });
    }

    let useDevMode = false;

    try {
      // STEP 4: Try to register in MongoDB
      console.log('📝 Attempting MongoDB registration for:', email);
      
      // STEP 5: Check if email already exists
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ 
          message: 'User already exists' 
        });
      }

      // STEP 6: Create new user in MongoDB
      const user = await User.create({
        name,
        email,
        password, // Mongoose middleware will hash this automatically
        role: role || 'manager'
      });

      // STEP 7: Create JWT token
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      // STEP 8: Send success response
      return res.status(201).json({
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
          role: user.role
        },
        token
      });

    } catch (dbError) {
      // STEP 9: If MongoDB fails, use development mode
      console.error('❌ MongoDB registration error:', dbError.message);
      useDevMode = true;

      if (dbError.code === 11000) {
        return res.status(400).json({ 
          message: 'Email already registered' 
        });
      }

      // STEP 10: Check if user exists in dev mode
      if (devUsers[email]) {
        return res.status(400).json({ 
          message: 'User already exists' 
        });
      }

      // STEP 11: Create in-memory user for development
      const newUser = {
        _id: Date.now().toString(),
        name,
        email,
        password, // NOT hashed in dev mode (unsafe)
        role: role || 'manager'
      };

      devUsers[email] = newUser;

      // STEP 12: Create and send token
      const token = jwt.sign(
        { id: newUser._id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE }
      );

      return res.status(201).json({
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
```

### 5. Backend: Complete Password Reset Flow

```javascript
// STEP 1: REQUEST PASSWORD RESET (Send OTP)
// From: backend/controllers/authController.js
// Lines: 264-315

const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address'
      });
    }

    // Find user
    let user = null;
    try {
      user = await User.findOne({ email: email.toLowerCase() });
    } catch (dbError) {
      console.log('⚠️  MongoDB unavailable');
    }

    if (!user && devUsers[email]) {
      user = { name: devUsers[email].name, email: devUsers[email].email };
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Generate 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    try {
      // Delete old OTPs
      await OTP.deleteMany({ 
        email: email.toLowerCase(), 
        type: 'password-reset' 
      });

      // Save new OTP with 15-minute expiration
      const otpRecord = new OTP({
        email: email.toLowerCase(),
        otp: otp,
        type: 'password-reset'
      });
      await otpRecord.save();
    } catch (dbError) {
      console.log('Could not save OTP to database');
    }

    // Send OTP via email
    const emailSent = await sendOTPEmail(email, otp, user.name);
    
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP email'
      });
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
      email: email
    });

  } catch (error) {
    console.error('Error in requestPasswordReset:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// STEP 2: VERIFY OTP
// From: backend/controllers/authController.js
// Lines: 317-378

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
      console.log('Could not verify OTP');
    }

    if (!otpRecord) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP'
      });
    }

    // Check if expired
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

    // Delete the OTP (one-time use)
    try {
      await otpRecord.deleteOne();
    } catch (err) {
      console.log('Could not delete OTP');
    }

    // Generate reset token
    const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

    // Store reset token (15 minute expiration)
    try {
      await User.findOneAndUpdate(
        { email: email.toLowerCase() },
        {
          resetPasswordToken: resetToken,
          resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000)
        }
      );
    } catch (dbError) {
      console.log('Could not store reset token');
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
      message: 'Server error'
    });
  }
};

// STEP 3: RESET PASSWORD
// From: backend/controllers/authController.js
// Lines: 380-465

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

    // Check passwords match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match'
      });
    }

    // Check password length
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long'
      });
    }

    // Find user with valid reset token
    let user = null;
    let useDevMode = false;

    try {
      user = await User.findOne({
        email: email.toLowerCase(),
        resetPasswordToken: resetToken,
        resetPasswordExpires: { $gt: new Date() } // Not expired
      });
    } catch (dbError) {
      console.log('MongoDB unavailable');
      useDevMode = true;
    }

    if (!user) {
      if (!useDevMode) {
        return res.status(400).json({
          success: false,
          message: 'Invalid or expired reset token'
        });
      }
      
      // Dev mode
      const devUser = devUsers[email];
      if (devUser) {
        devUser.password = newPassword;
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

    // Check new password not same as old
    const isSamePassword = await bcrypt.compare(newPassword, user.password);
    if (isSamePassword) {
      return res.status(400).json({
        success: false,
        message: 'New password cannot be same as old password'
      });
    }

    // Update password (Mongoose middleware will hash it)
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
      message: 'Server error'
    });
  }
};
```

### 6. Frontend: Animated Login Form

```javascript
// Key animations from: frontend/src/pages/LoginPage.jsx
// Lines: 55-90

// Stagger container - children appear one by one
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 100ms delay between each child
    },
  },
};

// Individual item animation
const itemVariants = {
  hidden: { 
    y: 20,        // Start 20px lower
    opacity: 0    // Invisible
  },
  visible: {
    y: 0,         // Move up to normal position
    opacity: 1,   // Visible
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

// Error shake animation
const errorVariants = {
  animate: {
    x: [0, -10, 10, -10, 10, 0], // Shake left/right
    transition: {
      duration: 0.5,
    },
  },
};

// Usage in JSX:
<motion.form
  onSubmit={handleSubmit}
  className="space-y-6"
  variants={containerVariants}
  initial="hidden"
  animate="visible"
>
  <motion.div variants={itemVariants} className="space-y-2">
    {/* Email input - slides up and fades in */}
  </motion.div>

  <motion.div variants={itemVariants} className="space-y-2">
    {/* Password input - slides up and fades in after 100ms */}
  </motion.div>

  <motion.div variants={itemVariants} className="pt-4">
    {/* Submit button - slides up and fades in after 200ms */}
  </motion.div>
</motion.form>
```

### 7. Frontend: Password Strength Meter

```javascript
// From: frontend/src/components/ResetPassword.jsx
// Lines: 36-47

const getPasswordStrength = (password) => {
  // Empty = no strength
  if (!password) {
    return { 
      strength: 0, 
      label: '', 
      color: 'bg-gray-200' 
    };
  }
  
  // Less than 6 chars = weak
  if (password.length < 6) {
    return { 
      strength: 1, // Fill 1 of 3 bars
      label: 'Weak', 
      color: 'bg-red-500' 
    };
  }
  
  // 6-8 chars = fair
  if (password.length < 8) {
    return { 
      strength: 2, // Fill 2 of 3 bars
      label: 'Fair', 
      color: 'bg-yellow-500' 
    };
  }
  
  // 8+ chars = strong
  return { 
    strength: 3, // Fill all 3 bars
    label: 'Strong', 
    color: 'bg-green-500' 
  };
};

// Visual output:
// Weak:   [■ ] 
// Fair:   [■ ■ ]
// Strong: [■ ■ ■]
```

---

## 🔗 PART 3: Environment Variables & Configuration

```bash
# .env file (Backend)
───────────────────────────────

# JWT Configuration
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=24h

# Database
MONGODB_URI=mongodb://localhost:27017/fleet-management
DB_NAME=fleetfly

# Email (for OTP)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587

# Development
NODE_ENV=development
PORT=5000
```

---

## 🧪 PART 4: API Response Examples

### Login Success
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@fleet.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMSIsImlhdCI6MTcwMzk5OTk5OSwiZXhwIjoxNzA0MDg2Mzk5fQ.abc123def456"
}
```

### Login Error
```json
{
  "message": "Invalid email or password"
}
```

### Registration Success
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "manager"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjUwN2YxZjc3YmNmODZjZDc5OTQzOTAxMiIsImlhdCI6MTcwMzk5OTk5OSwiZXhwIjoxNzA0MDg2Mzk5fQ.xyz789uvw456"
}
```

### OTP Request Success
```json
{
  "success": true,
  "message": "OTP sent successfully to your email",
  "email": "admin@fleet.com"
}
```

### OTP Verification Success
```json
{
  "success": true,
  "message": "OTP verified successfully",
  "resetToken": "YWRtaW5AZmxlZXQuY29tOjE3MDM5OTk5OTk=",
  "email": "admin@fleet.com"
}
```

### Password Reset Success
```json
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

## 📋 Summary Table: All Components & Their Files

| Component | File Path | Lines | Purpose |
|-----------|-----------|-------|---------|
| **LoginPage** | `frontend/src/pages/LoginPage.jsx` | 284 | User login with email/password |
| **SignUpPage** | `frontend/src/pages/SignUpPage.jsx` | 289 | User registration with role selection |
| **ForgotPassword** | `frontend/src/components/ForgotPassword.jsx` | 95 | OTP request for password reset |
| **ResetPassword** | `frontend/src/components/ResetPassword.jsx` | 251 | Password reset with strength meter |
| **AuthContext** | `frontend/src/contexts/AuthContext.jsx` | 80 | Shared auth state & functions |
| **authController** | `backend/controllers/authController.js` | 507 | All backend auth logic |
| **authRoutes** | `backend/routes/authRoutes.js` | 11 | API endpoint definitions |

---

## 🎓 Quick Reference: Key Functions

```javascript
// Frontend
useAuth()                    // Get auth state and functions
login(email, password)       // Login user
register(name, email, pwd)   // Register new user
logout()                     // Logout and clear storage

// Backend
POST /api/auth/login         // Authenticate user
POST /api/auth/register      // Create new user account
POST /api/auth/forgot-password // Request OTP
POST /api/auth/verify-otp    // Verify OTP code
POST /api/auth/reset-password // Reset password with token
```

