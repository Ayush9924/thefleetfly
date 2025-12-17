# 🔧 Data Loading Diagnostic Guide

## Step 1: Check Backend Connection ✅

Run this command to test if MongoDB is connected and has data:

```bash
cd backend
npm run test-data-load
```

You should see output like:
```
✅ Vehicles: 10 found
✅ Drivers: 5 found
✅ Users: 3 found
```

**If you see 0 for any category**, proceed to Step 2.

---

## Step 2: Seed the Database 🌱

If the database is empty, add sample data:

```bash
cd backend
npm run seed
```

This will populate your database with test data.

---

## Step 3: Verify Backend is Running 🚀

Make sure the backend server is running:

```bash
cd backend
npm start
```

You should see:
```
✅ MongoDB Connected: cluster0.kgbrskp.mongodb.net
✅ Socket.io initialized in development mode
Server listening on port 5001
```

---

## Step 4: Test API Directly 📡

Open your browser and visit:
```
http://localhost:5001/api/vehicles
```

You should see JSON data with vehicles. If you get an error or empty array, the API isn't working correctly.

---

## Step 5: Check Frontend Configuration ⚙️

Verify frontend `.env` has correct API URL:

File: `frontend/.env`
```
VITE_API_URL=http://localhost:5001/api
```

---

## Step 6: Clear Cache & Restart Frontend 🔄

1. **Clear Browser Cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear "Cookies and other site data"
   - Clear "Cached images and files"

2. **Clear localStorage:**
   - Press `F12` to open DevTools
   - Go to Application → Local Storage
   - Delete everything for `localhost:5173`

3. **Restart Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

---

## Step 7: Check Network Requests 📊

1. Open DevTools (`F12`)
2. Go to Network tab
3. Refresh the page
4. Look for API calls like `/api/vehicles`
5. Check the Response tab - you should see actual data

---

## If Still Not Working:

Check the browser console for errors:
1. Open DevTools (`F12`)
2. Go to Console tab
3. Look for red error messages
4. Share those errors for diagnosis

---

## Common Issues & Fixes:

| Issue | Fix |
|-------|-----|
| **Empty array returned from API** | Run `npm run seed` to populate database |
| **401 Unauthorized error** | Token expired - log out and log back in |
| **Network error** | Backend not running - run `npm start` in backend folder |
| **CORS error** | Make sure `VITE_API_URL` matches backend port (5001) |
| **Data still old after reload** | Clear browser cache (Ctrl+Shift+Delete) |

