# Complete Guide: Login, Sign Up & Password Recovery
## TheFleetFly Authentication System - Simple Explained

---

## 🎯 Overview (30-Second Explanation)

**What These Pages Do:**
- **Login Page**: Users enter email and password to access their dashboard
- **Sign Up Page**: New users create accounts with name, email, password, and role
- **Forgot Password**: Users reset forgotten passwords using OTP sent to email

**The Flow:**
1. User arrives at Login/Sign Up → Fills form → Backend validates → Creates JWT token → User logged in
2. Forgot Password: Enter email → OTP sent → Verify OTP → Reset password → Success

---

## 📱 PART 1: LOGIN PAGE (Frontend)

### What Users See

```
┌─────────────────────────────────┐
│  FleetFly                       │  ← Logo & branding
│  Sign in to your dashboard      │  ← Subtitle
├─────────────────────────────────┤
│                                 │
│ 📧 Email Address               │
│  [admin@fleet.com          ]   │  ← Input field with icon
│                                 │
│ 🔒 Password                    │
│  [••••••••              ]       │  ← Hidden password input
│                                 │
│ → Forgot Password?              │  ← Link to password recovery
│                                 │
│  [  Sign In Button   ]          │  ← Submit button
│                                 │
│ Demo: admin@fleet.com           │  ← Demo credentials
│        admin123                 │
│                                 │
│ Don't have account? Create one  │  ← Link to Sign Up
│                                 │
└─────────────────────────────────┘
```

### File Location
**[frontend/src/pages/LoginPage.jsx](frontend/src/pages/LoginPage.jsx)** (284 lines)

### What Happens When User Clicks "Sign In"

#### Step 1: Form Validation (Lines 24-31)
```javascript
const validateForm = () => {
  // Check if email and password are filled
  if (!email || !password) {
    toast.error("Please fill in all required fields");
    return false;
  }

  // Check if email format is correct (contains @ and .)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error("Please enter a valid email address");
    return false;
  }

  return true; // All good!
};
```

**What it checks:**
- ✅ Both fields have something entered
- ✅ Email looks like a real email (has @ and .)

#### Step 2: Send to Backend (Lines 33-53)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent page refresh

  if (!validateForm()) {
    setHasError(true); // Show error animation
    return;
  }

  setLoading(true); // Show spinning loader
  
  try {
    await login(email, password); // Call login function from AuthContext
    navigate("/"); // Go to dashboard
  } catch (error) {
    toast.error(errorMessage); // Show error message
  } finally {
    setLoading(false); // Hide loading spinner
  }
};
```

#### Step 3: Beautiful Animations (Lines 55-90)

**What makes it smooth:**
- Items slide in from bottom with staggered timing (0.1 second delay between each)
- Error shake animation (wiggles left and right)
- Loading spinner rotates while waiting

```javascript
// Stagger children = each item appears 0.1 seconds after the previous
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // 0.1 second delay between items
    },
  },
};

// Each item slides up from bottom while fading in
const itemVariants = {
  hidden: { y: 20, opacity: 0 }, // Start: 20px down, invisible
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.5 }, // Animate over 0.5 seconds
  },
};
```

### Design Features

#### 1. Decorative Background (Lines 104-109)
- 3 animated blurred circles moving in background
- Creates modern, professional look
- Doesn't interfere with form

#### 2. Card with Glass Effect (Line 113)
```jsx
<Card className="... bg-white/90 backdrop-blur-xl">
```
- Semi-transparent white card
- Blurry background shows through
- Modern "glassmorphism" design

#### 3. Gradient Header (Lines 129-135)
```jsx
<div className="bg-linear-to-r from-blue-600 to-indigo-600">
  <div className="text-3xl font-bold text-white">
    Fleet<span className="text-blue-100">Fly</span>
  </div>
</div>
```
- Blue to purple gradient color
- "Fly" text slightly lighter
- Professional branding

#### 4. Input Fields with Icons (Lines 143-158)
```jsx
<Input
  id="email"
  type="email"
  placeholder="admin@fleet.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
<Mail className="... text-gray-400" /> {/* Icon inside */}
```

**Features:**
- Icon inside left side of input
- Blue focus color (when clicked)
- Smooth transitions

#### 5. Submit Button (Lines 163-176)
```jsx
<Button
  type="submit"
  className="... from-blue-600 to-indigo-600"
  disabled={loading} {/* Disabled while loading */}
>
  {loading ? (
    <>
      <Loader2 className="... animate-spin" />
      Signing In...
    </>
  ) : (
    "Sign In"
  )}
</Button>
```

**What happens:**
- Shows "Signing In..." with spinning icon while waiting
- Cannot click again while loading
- Shows "Sign In" when ready

### Key Technologies Used

| Technology | What It Does | Why Used |
|-----------|------------|---------|
| `useState` | Store email, password, loading state | React state management |
| `useNavigate` | Redirect to dashboard after login | React Router navigation |
| `useAuth` | Get login function from context | Shared authentication state |
| `react-hot-toast` | Show success/error messages | Beautiful toast notifications |
| `framer-motion` | Smooth animations | Professional animations |
| `lucide-react` | Email & lock icons | Clean icon library |

---

## 📱 PART 2: SIGN UP PAGE (Frontend)

### What Users See

```
┌─────────────────────────────────┐
│  ← back  FleetPro              │  ← Back button + logo
│  Create your fleet account      │  ← Subtitle
├─────────────────────────────────┤
│                                 │
│ 👤 Full Name                   │
│  [John Smith            ]       │  ← New field
│                                 │
│ 📧 Email Address               │
│  [you@company.com        ]      │
│                                 │
│ 🔒 Password                    │
│  [••••••••              ]       │
│  Minimum 6 characters           │  ← Requirement text
│                                 │
│ Account Role                    │
│  [▼ Fleet Manager         ]     │  ← Dropdown selector
│  - Fleet Manager                │
│  - Driver                       │
│  - Administrator                │
│                                 │
│  [  Create Account   ]          │  ← Submit button
│                                 │
│ Already have account? Sign In   │  ← Link to Login
│                                 │
└─────────────────────────────────┘
```

### File Location
**[frontend/src/pages/SignUpPage.jsx](frontend/src/pages/SignUpPage.jsx)** (289 lines)

### What Happens When User Clicks "Create Account"

#### Step 1: Form Validation (Lines 28-48)
```javascript
const validateForm = () => {
  // All fields required
  if (!name || !email || !password) {
    toast.error('Please fill in all required fields')
    return false
  }

  // Valid email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    toast.error('Please enter a valid email address')
    return false
  }

  // Password at least 6 characters
  if (password.length < 6) {
    toast.error('Password must be at least 6 characters long')
    return false
  }

  return true // Success!
};
```

**Checks:**
- ✅ Name, email, password all filled
- ✅ Email has @ and . (valid format)
- ✅ Password is at least 6 characters

#### Step 2: Send to Backend (Lines 50-73)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault()

  if (!validateForm()) {
    setHasError(true) // Error animation
    return
  }

  setLoading(true)
  
  try {
    // Call register function from AuthContext
    await register(name, email, password, role)
    
    // Show success message
    toast.success('Account created successfully!')
    
    // Go to dashboard
    navigate('/dashboard')
  } catch (error) {
    // Show error from server
    toast.error(errorMessage)
  } finally {
    setLoading(false)
  }
};
```

### New Features in Sign Up

#### 1. Full Name Field (Lines 89-105)
```jsx
<Input
  id="name"
  type="text"
  placeholder="John Smith"
  value={name}
  onChange={(e) => setName(e.target.value)}
/>
```

#### 2. Role Selector Dropdown (Lines 128-142)
```jsx
<select
  id="role"
  value={role} {/* Current selected value */}
  onChange={(e) => setRole(e.target.value)}
>
  <option value="manager">Fleet Manager</option>
  <option value="driver">Driver</option>
  <option value="admin">Administrator</option>
</select>
```

**Three roles:**
1. **Fleet Manager**: Can manage vehicles and assignments
2. **Driver**: Can view assigned vehicles
3. **Administrator**: Full system access

#### 3. Password Requirement Text (Line 126)
```jsx
<p className="text-xs text-gray-500">
  Minimum 6 characters required
</p>
```

#### 4. Back Arrow (Lines 62-67)
```jsx
<Link to="/login" className="text-white hover:text-blue-100">
  <ArrowLeft className="w-5 h-5" />
</Link>
```

Allows users to go back to Login page

---

## 🔐 PART 3: FORGOT PASSWORD FLOW

### What Users See

**Step 1: Enter Email**
```
┌─────────────────────────────────┐
│    ✉️                           │  ← Mail icon
│  Forgot Password?               │
│  Enter your email & we'll send  │
│  you an OTP to reset password   │  ← Instructions
├─────────────────────────────────┤
│                                 │
│ Email Address                   │
│  [user@company.com       ]      │
│                                 │
│  [  Send OTP   ]                │  ← Button
│                                 │
│ Remember password? Back to      │
│ Login                           │
│                                 │
└─────────────────────────────────┘
```

**Step 2: Enter OTP**
```
┌─────────────────────────────────┐
│    🔢                           │
│  Verify OTP                     │
│  Enter the 6-digit code         │
│  sent to your email             │
├─────────────────────────────────┤
│                                 │
│ OTP Code                        │
│  [123456         ]              │  ← 6 digits from email
│                                 │
│  [  Verify OTP   ]              │
│                                 │
└─────────────────────────────────┘
```

**Step 3: Reset Password**
```
┌─────────────────────────────────┐
│    🔒                           │
│  Reset Password                 │
│  Create a strong password       │
├─────────────────────────────────┤
│                                 │
│ New Password                    │
│  [••••••••              ]       │  ← New password
│ ███ ███ ███ Strong              │  ← Strength meter
│                                 │
│ Confirm Password                │
│  [••••••••              ]       │  ← Retype password
│ ✓ Passwords match               │  ← Match indicator
│                                 │
│  [  Reset Password   ]          │
│                                 │
└─────────────────────────────────┘
```

### File Location
**[frontend/src/components/ForgotPassword.jsx](frontend/src/components/ForgotPassword.jsx)** (95 lines)

### How It Works Step by Step

#### Step 1: Enter Email (ForgotPassword.jsx Lines 27-50)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate email
  if (!email.trim()) {
    toast.error('Please enter your email address');
    return;
  }

  if (!validateEmail(email)) {
    toast.error('Please enter a valid email address');
    return;
  }

  setLoading(true);

  try {
    // Send email to backend
    const response = await api.post('/auth/forgot-password', { email });
    
    if (response.data.success) {
      setIsSubmitted(true); // Show "OTP Sent" message
      toast.success('OTP sent to your email!');
    }
  } catch (err) {
    toast.error(err.response?.data?.message);
  } finally {
    setLoading(false);
  }
};
```

### Features

#### 1. Email Icon & Instructions (Lines 58-68)
```jsx
<div className="flex justify-center">
  <div className="p-3 bg-blue-100 rounded-full">
    <Mail className="w-8 h-8 text-blue-600" />
  </div>
</div>
<h2 className="text-2xl font-bold">Forgot Password?</h2>
<p className="text-gray-600 text-sm">
  Enter your email & we'll send OTP...
</p>
```

#### 2. Submit Button Changes (Lines 78-86)
```jsx
<button
  type="submit"
  disabled={loading || isSubmitted}
  className="..."
>
  {loading ? (
    <>
      <Loader2 className="animate-spin" />
      Sending OTP...
    </>
  ) : isSubmitted ? (
    'OTP Sent Successfully!'  // Shows after sending
  ) : (
    'Send OTP'  // Initial text
  )}
</button>
```

### ResetPassword Component

**File:** [frontend/src/components/ResetPassword.jsx](frontend/src/components/ResetPassword.jsx) (251 lines)

#### Password Strength Indicator (Lines 42-47)
```javascript
const getPasswordStrength = (password) => {
  if (!password) return { strength: 0, label: '', color: 'bg-gray-200' };
  if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
  if (password.length < 8) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
  return { strength: 3, label: 'Strong', color: 'bg-green-500' };
};
```

**Shows:**
- 🔴 Red = Weak (< 6 characters)
- 🟡 Yellow = Fair (6-8 characters)
- 🟢 Green = Strong (8+ characters)

#### Password Match Check (Lines 26-32)
```javascript
if (name === 'newPassword' || name === 'confirmPassword') {
  const newPass = name === 'newPassword' ? value : formData.newPassword;
  const confirmPass = name === 'confirmPassword' ? value : formData.confirmPassword;
  
  // Check if they match
  setPasswordsMatch(newPass === confirmPass && newPass.length > 0);
}
```

Shows ✓ or ✗ when passwords match/don't match

#### Submit Handler (Lines 55-86)
```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  
  // Validate password
  const passwordError = validatePassword(formData.newPassword);
  if (passwordError) {
    toast.error(passwordError);
    return;
  }

  // Check if passwords match
  if (formData.newPassword !== formData.confirmPassword) {
    toast.error('Passwords do not match');
    return;
  }

  setLoading(true);

  try {
    // Send to backend with reset token
    const response = await api.post('/auth/reset-password', {
      email,
      resetToken,
      newPassword: formData.newPassword,
      confirmPassword: formData.confirmPassword
    });

    if (response.data.success) {
      toast.success('Password reset successfully!');
    }
  } catch (err) {
    toast.error(err.response?.data?.message);
  } finally {
    setLoading(false);
  }
};
```

---

## 🖥️ PART 4: BACKEND EXPLAINED

### File Location
**[backend/controllers/authController.js](backend/controllers/authController.js)** (507 lines)

### How Backend Works - The Journey

```
┌──────────────┐
│ User on PC   │
│ (Frontend)   │
└──────┬───────┘
       │ (Sends: email, password)
       │
       ▼
┌──────────────────────────────┐
│ Backend Server               │
│ - Validate form              │
│ - Check database             │
│ - Hash password              │
│ - Generate token             │
└──────┬───────────────────────┘
       │ (Sends back: token, user data)
       │
       ▼
┌──────────────┐
│ User on PC   │
│ Logged in!   │
└──────────────┘
```

---

## 🔐 PART 4A: LOGIN BACKEND

### What Happens Behind Scenes

#### Step 1: Receive Request (Lines 106-108)
```javascript
const login = async (req, res) => {
  try {
    const { email, password } = req.body; // Get email and password from frontend
```

**Receives:**
```json
{
  "email": "admin@fleet.com",
  "password": "admin123"
}
```

#### Step 2: Validate Input (Lines 110-113)
```javascript
if (!email || !password) {
  return res.status(400).json({ 
    message: 'Please provide email and password' 
  });
}
```

**Checks:**
- ✅ Both email and password are provided
- Returns error if missing

#### Step 3: Find User in Database (Lines 118-122)
```javascript
let user = null;

try {
  user = await User.findOne({ email }); // Search MongoDB for matching email
} catch (dbError) {
  useDevMode = true; // If MongoDB down, use development mode
}
```

**What it does:**
- Searches MongoDB for user with matching email
- If MongoDB is down, falls back to in-memory users

#### Step 4: Check Password (Lines 143-146)
```javascript
const isMatch = await user.matchPassword(password);
if (!isMatch) {
  return res.status(401).json({ 
    message: 'Invalid email or password' 
  });
}
```

**Uses bcryptjs library:**
- Compares provided password with hashed password in database
- Returns error if passwords don't match

**Why hash passwords?**
- If someone hacks database, they can't see real passwords
- Only the "hash" (jumbled version) is stored
- `bcryptjs.compare()` checks if plain password matches hash

#### Step 5: Create JWT Token (Lines 148-151)
```javascript
const token = jwt.sign(
  { id: user._id }, // Put user ID in token
  process.env.JWT_SECRET, // Secret key
  { expiresIn: process.env.JWT_EXPIRE } // Token expires in time
);
```

**What is JWT?**
- **JWT = JSON Web Token**
- Looks like: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Contains user ID encrypted
- Backend can verify it's real token
- **Expires**: Token stops working after 24 hours (or configured time)

#### Step 6: Send Response (Lines 153-160)
```javascript
res.json({
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  },
  token // Send token to frontend
});
```

**Backend sends back:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439011",
    "name": "Admin User",
    "email": "admin@fleet.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Complete Login Flow Diagram

```
Frontend                          Backend
─────────                         ───────

1. User submits email + password
   ──────────────────────────────> 
                                   2. Find user by email in MongoDB
                                   3. Compare password with bcryptjs
                                   4. Create JWT token

                                   <──────────────────────────────
                                   5. Send token + user data back
6. Save token in localStorage
7. Redirect to dashboard


If password wrong:
                                   Backend returns:
                                   { "message": "Invalid email or password" }
   <──────────────────────────────
8. Show error toast to user
```

---

## 📝 PART 4B: SIGNUP/REGISTER BACKEND

### File Location
**[backend/controllers/authController.js](backend/controllers/authController.js)** Lines 28-102

### What Happens

#### Step 1: Receive Data (Lines 30-32)
```javascript
const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
```

**Receives from frontend:**
```json
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "password123",
  "role": "manager"
}
```

#### Step 2: Validate Data (Lines 34-43)
```javascript
// Check all fields filled
if (!name || !email || !password) {
  return res.status(400).json({ 
    message: 'Please provide all required fields' 
  });
}

// Check password length
if (password.length < 6) {
  return res.status(400).json({ 
    message: 'Password must be at least 6 characters' 
  });
}
```

#### Step 3: Check if Email Already Exists (Lines 47-51)
```javascript
const userExists = await User.findOne({ email });
if (userExists) {
  return res.status(400).json({ 
    message: 'User already exists' 
  });
}
```

**Why?**
- Can't have two accounts with same email
- Prevents duplicates

#### Step 4: Create New User (Lines 53-60)
```javascript
const user = await User.create({
  name,
  email,
  password, // Mongoose will auto-hash this in User model
  role: role || 'manager' // Default role is 'manager' if not provided
});
```

**The User model automatically:**
- Hashes the password using bcryptjs
- Saves to MongoDB database
- Generates unique ID

#### Step 5: Create JWT Token (Lines 62-67)
```javascript
const token = jwt.sign(
  { id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: process.env.JWT_EXPIRE }
);
```

Same as login - creates token that proves user is logged in

#### Step 6: Send Back (Lines 69-80)
```javascript
res.status(201).json({
  user: {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role
  },
  token
});
```

**Response:**
```json
{
  "user": {
    "_id": "507f1f77bcf86cd799439012",
    "name": "John Smith",
    "email": "john@example.com",
    "role": "manager"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### Dev Mode Fallback (Lines 84-102)

If MongoDB is down:
```javascript
useDevMode = true;

// Create user in memory (development only)
const newUser = {
  _id: Date.now().toString(),
  name,
  email,
  password, // Stored plain in dev mode
  role: role || 'manager'
};

devUsers[email] = newUser;
```

**Why?**
- App still works even if database down
- Uses in-memory object `devUsers`
- Passwords not hashed in dev mode (unsafe - dev only)

---

## 🔐 PART 4C: FORGOT PASSWORD BACKEND

### 3-Step Password Recovery Process

```
Step 1: User sends email
   ↓
Step 2: Backend sends OTP via email
   ↓
Step 3: User verifies OTP
   ↓
Step 4: User resets password
```

### Step 1: Request Password Reset (Lines 264-315)

**Frontend sends:**
```json
{
  "email": "admin@fleet.com"
}
```

**Backend does:**

#### Find User
```javascript
let user = null;

try {
  user = await User.findOne({ email: email.toLowerCase() });
} catch (dbError) {
  console.log('⚠️  MongoDB unavailable');
}

// Check in dev mode if not found
if (!user && devUsers[email]) {
  user = { name: devUsers[email].name, email: devUsers[email].email };
}

if (!user) {
  return res.status(404).json({
    message: 'User not found'
  });
}
```

#### Generate 6-Digit OTP
```javascript
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const otp = generateOTP(); // Generates something like "483726"
```

#### Save OTP to Database
```javascript
// Delete old OTPs for this email
await OTP.deleteMany({ email: email.toLowerCase(), type: 'password-reset' });

// Create new OTP record
const otpRecord = new OTP({
  email: email.toLowerCase(),
  otp: otp,
  type: 'password-reset'
  // expiresAt: auto-set to 15 minutes from now
});
await otpRecord.save();
```

**OTP Model sets expiration automatically** (usually 15 minutes)

#### Send Email with OTP
```javascript
const emailSent = await sendOTPEmail(email, otp, user.name);

if (!emailSent) {
  return res.status(500).json({
    message: 'Failed to send OTP email'
  });
}
```

**Email looks like:**
```
Hello John Smith,

Your password reset code is: 483726

This code expires in 15 minutes.

If you didn't request this, ignore this email.
```

#### Response to Frontend
```javascript
res.status(200).json({
  success: true,
  message: 'OTP sent successfully to your email',
  email: email
});
```

---

### Step 2: Verify OTP (Lines 317-378)

**Frontend sends:**
```json
{
  "email": "admin@fleet.com",
  "otp": "483726"
}
```

**Backend does:**

#### Find OTP Record
```javascript
const otpRecord = await OTP.findOne({
  email: email.toLowerCase(),
  otp: otp, // Must match exactly
  type: 'password-reset'
});

if (!otpRecord) {
  return res.status(400).json({
    message: 'Invalid or expired OTP'
  });
}
```

#### Check if Not Expired
```javascript
if (otpRecord.expiresAt < new Date()) {
  // Time is past expiration
  await otpRecord.deleteOne(); // Delete expired OTP
  
  return res.status(400).json({
    message: 'OTP has expired'
  });
}
```

#### Delete Used OTP
```javascript
await otpRecord.deleteOne(); // Remove OTP so it can't be reused
```

#### Create Reset Token
```javascript
const resetToken = Buffer.from(`${email}:${Date.now()}`).toString('base64');

// Stores in database
await User.findOneAndUpdate(
  { email: email.toLowerCase() },
  {
    resetPasswordToken: resetToken,
    resetPasswordExpires: new Date(Date.now() + 15 * 60 * 1000) // 15 mins from now
  }
);
```

**What is resetToken?**
- One-time token that proves user verified OTP
- Can only reset password if you have this token
- Expires in 15 minutes

#### Send Back
```javascript
res.status(200).json({
  success: true,
  message: 'OTP verified successfully',
  resetToken: resetToken, // Frontend stores this
  email: email
});
```

---

### Step 3: Reset Password (Lines 380-465)

**Frontend sends:**
```json
{
  "email": "admin@fleet.com",
  "resetToken": "YWRtaW5AZmxlZXQuY29tOjE3MDM5OTk5OTk=",
  "newPassword": "newSecurePass123",
  "confirmPassword": "newSecurePass123"
}
```

**Backend does:**

#### Validate
```javascript
if (newPassword !== confirmPassword) {
  return res.status(400).json({
    message: 'Passwords do not match'
  });
}

if (newPassword.length < 6) {
  return res.status(400).json({
    message: 'Password must be at least 6 characters'
  });
}
```

#### Find User with Valid Reset Token
```javascript
const user = await User.findOne({
  email: email.toLowerCase(),
  resetPasswordToken: resetToken,
  resetPasswordExpires: { $gt: new Date() } // Token not expired
});

if (!user) {
  return res.status(400).json({
    message: 'Invalid or expired reset token'
  });
}
```

#### Check Not Same as Old Password
```javascript
const isSamePassword = await bcrypt.compare(newPassword, user.password);
if (isSamePassword) {
  return res.status(400).json({
    message: 'New password cannot be same as old password'
  });
}
```

**Why?**
- If hacked before, old password might be compromised
- Must use new password

#### Update Password
```javascript
user.password = newPassword; // Mongoose will auto-hash it
user.resetPasswordToken = undefined; // Remove reset token
user.resetPasswordExpires = undefined; // Remove expiration
await user.save(); // Save to database
```

#### Send Confirmation Email
```javascript
await sendPasswordChangedEmail(email, user.name);
```

**Email sent to user:**
```
Hello John Smith,

Your password has been reset successfully!

If you didn't do this, please contact support immediately.
```

#### Success Response
```javascript
res.status(200).json({
  success: true,
  message: 'Password reset successfully'
});
```

---

## 📊 Security Features Explained

### 1. Password Hashing with bcryptjs
```javascript
// When saving password:
user.password = "password123"; // User enters this
// Mongoose automatically hashes to:
// $2a$10$kf.a7XxP3Knx34wj8Zx7Yeo.e0p8vX9I2oYzK...

// When checking password:
const isMatch = await bcrypt.compare("password123", hashedPassword);
// Returns true if they match, false if they don't
```

**Why hash?**
- If database hacked, hackers can't see real passwords
- Only jumbled hash visible
- Can't reverse-engineer the original password

### 2. JWT Tokens
```javascript
// Token format: header.payload.signature
// Example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjU...

// When user makes request to protected endpoint:
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

// Backend verifies:
// 1. Token format is correct
// 2. Signature is valid (not tampered)
// 3. Token not expired
```

**Token expiration:**
- Token only valid for set time (usually 24 hours)
- User must login again after expiration
- Limits damage if token stolen

### 3. OTP Expiration
```javascript
// OTP expires in 15 minutes
const otpRecord = new OTP({
  email: email,
  otp: "483726",
  expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 mins from now
});
```

**Why 15 minutes?**
- Long enough for user to check email
- Short enough that if hacker gets OTP, can't use it later
- Forces attacker to act quickly

### 4. One-Time Use
```javascript
// After OTP verified, delete it
await otpRecord.deleteOne();

// Can't use same OTP twice
// User must request new OTP if code expires
```

---

## 🔄 Complete Authentication Flow Diagram

```
╔════════════════════════════════════════════════════════════════════╗
║                     AUTHENTICATION FLOW                            ║
╚════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────┐
│ 1. LOGIN FLOW                                                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend                    Backend              Database      │
│  ────────                    ───────              ────────      │
│                                                                 │
│  User enters email & password  │                               │
│  ─────────────────────────────> │                               │
│                                 │ Find user by email            │
│                                 │ ──────────────────────────>   │
│                                 │                   Return user │
│                                 │ <──────────────────────────   │
│                                 │ Verify password w/ bcryptjs   │
│                                 │ ────────────────────────>     │
│                                 │                   Pass match? │
│                                 │ <──────────────────────────   │
│                                 │ Create JWT token              │
│  Token + user data             │                               │
│  <────────────────────────────   │                               │
│  Save token in localStorage                                     │
│  Redirect to /dashboard                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 2. SIGNUP FLOW                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend                    Backend              Database      │
│  ────────                    ───────              ────────      │
│                                                                 │
│  User submits form             │                               │
│  ─────────────────────────────> │                               │
│                                 │ Check email unique            │
│                                 │ ──────────────────────────>   │
│                                 │          Email exists? No     │
│                                 │ <──────────────────────────   │
│                                 │ Create new user               │
│                                 │ ──────────────────────────>   │
│                                 │                Save to DB     │
│                                 │ <──────────────────────────   │
│                                 │ Hash password (auto)          │
│                                 │ Create JWT token              │
│  Token + user data             │                               │
│  <────────────────────────────   │                               │
│  Redirect to /dashboard                                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ 3. FORGOT PASSWORD FLOW                                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend                    Backend              Database      │
│  ────────                    ───────              ────────      │
│                                                                 │
│  User submits email            │                               │
│  ─────────────────────────────> │                               │
│                                 │ Find user                     │
│                                 │ ──────────────────────────>   │
│                                 │                Return user    │
│                                 │ <──────────────────────────   │
│                                 │ Generate OTP                  │
│                                 │ Save OTP (15 min expiry)      │
│                                 │ ──────────────────────────>   │
│                                 │          Save to OTP table    │
│  Success message               │ <──────────────────────────   │
│  <────────────────────────────   │                               │
│                                 │ Send email with OTP           │
│  User gets email with OTP ◄─────┼──────────────────────────     │
│                                 │                               │
│  User enters OTP               │                               │
│  ─────────────────────────────> │                               │
│                                 │ Find OTP record               │
│                                 │ ──────────────────────────>   │
│                                 │           Check if valid      │
│                                 │ <──────────────────────────   │
│                                 │ Delete OTP (one-time use)     │
│                                 │ Create resetPasswordToken     │
│                                 │ Save token (15 min expiry)    │
│                                 │ ──────────────────────────>   │
│  Reset token sent             │ <──────────────────────────   │
│  <────────────────────────────   │                               │
│                                 │                               │
│  User enters new password      │                               │
│  ─────────────────────────────> │                               │
│                                 │ Verify resetPasswordToken     │
│                                 │ ──────────────────────────>   │
│                                 │           Token valid? Yes    │
│                                 │ <──────────────────────────   │
│                                 │ Hash new password             │
│                                 │ Update user password          │
│                                 │ ──────────────────────────>   │
│                                 │    Delete reset token & save  │
│                                 │ <──────────────────────────   │
│  Success! Redirect to login    │                               │
│  <────────────────────────────   │                               │
│                                 │ Send confirmation email       │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🧠 Key Concepts Quick Reference

| Concept | What It Is | Example |
|---------|-----------|---------|
| **bcryptjs** | Password hashing library | `password123` → `$2a$10$kf.a7X...` |
| **JWT** | Token that proves you're logged in | `eyJhbGciOi...JXVCJ9.eyJpZCI...` |
| **OTP** | One-time 6-digit code | `483726` |
| **Token Expiration** | How long token is valid | 24 hours |
| **OTP Expiration** | How long OTP is valid | 15 minutes |
| **Reset Token** | Proves user verified OTP | `YWRtaW5A...` |
| **Hashing** | Converting password to unreadable form | Can't reverse |
| **Validate** | Checking if data is correct | Check email format |
| **Authenticate** | Verifying user identity | Check password match |

---

## 💾 API Endpoints Summary

```bash
# Registration
POST /api/auth/register
{
  "name": "John Smith",
  "email": "john@example.com",
  "password": "password123",
  "role": "manager"
}
Response: { user: {...}, token: "..." }

# Login
POST /api/auth/login
{
  "email": "admin@fleet.com",
  "password": "admin123"
}
Response: { user: {...}, token: "..." }

# Forgot Password - Step 1
POST /api/auth/forgot-password
{
  "email": "admin@fleet.com"
}
Response: { success: true, message: "OTP sent" }

# Forgot Password - Step 2
POST /api/auth/verify-otp
{
  "email": "admin@fleet.com",
  "otp": "483726"
}
Response: { success: true, resetToken: "..." }

# Forgot Password - Step 3
POST /api/auth/reset-password
{
  "email": "admin@fleet.com",
  "resetToken": "...",
  "newPassword": "newPass123",
  "confirmPassword": "newPass123"
}
Response: { success: true, message: "Password reset successfully" }

# Get Current User
GET /api/auth/me
Headers: Authorization: Bearer <token>
Response: { _id: "...", name: "...", email: "...", role: "..." }
```

---

## 🎓 What You Now Know

✅ How Login Page works (frontend)
✅ How Sign Up Page works (frontend)
✅ How Forgot Password flow works (frontend)
✅ How Login backend processes requests
✅ How Sign Up backend processes requests
✅ How Forgot Password backend works (OTP + reset token)
✅ Why passwords are hashed with bcryptjs
✅ What JWT tokens are and how they work
✅ Why OTPs expire
✅ Complete authentication flow from user input to database

**You can now explain to anyone:**
- "Why do we hash passwords?"
- "How does JWT token authentication work?"
- "What is an OTP and why is it one-time?"
- "Why does OTP expire?"
- "What happens when you click Sign In?"
- "How does Forgot Password work?"

---

## 🚀 Presentation Tips

When presenting this to managers/interviewers:

### For Non-Technical People:
> "We have three authentication pages: Login where users enter credentials, Sign Up to create new accounts, and Forgot Password for account recovery. Everything is encrypted for security - passwords are hashed so even if someone hacks our server, they can't see the real passwords."

### For Technical People:
> "We use bcryptjs for password hashing, JWT for session tokens with 24-hour expiration, and OTP with 15-minute expiration for password reset verification. Passwords are validated client-side first, then validated again server-side. Reset tokens expire after 15 minutes and are one-time use."

### Key Statistics:
- ✅ 3 authentication pages (Login, Sign Up, Forgot Password)
- ✅ Password hashing with bcryptjs (salted)
- ✅ JWT tokens expire in 24 hours
- ✅ OTP expires in 15 minutes
- ✅ Reset tokens are one-time use
- ✅ Form validation on frontend AND backend
- ✅ Beautiful animations with Framer Motion
- ✅ Professional UI with Tailwind CSS

