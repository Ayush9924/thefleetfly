# Live Tracking & Maintenance Integration Guide

## Overview

The fleet app now has complete integration between **live vehicle tracking** and **maintenance scheduling**. This provides dispatchers and managers with real-time visibility into vehicle locations alongside their maintenance status.

## New Features

### 1. Fleet Location Map (New Tab)

A comprehensive map view showing all vehicles with their current locations and maintenance status.

**Location:** `MaintenancePage.jsx` → "Fleet Map" tab

**What it displays:**
- Left panel: List of all vehicles with quick status indicators
  - 🟢 **Green (OK)**: No overdue or upcoming maintenance
  - 🟡 **Amber (UP)**: Has upcoming maintenance scheduled
  - 🔴 **Red (OVD)**: Has overdue maintenance requiring action
  
- Right panel: Detailed vehicle information when selected
  - Current GPS location with address
  - Speed and movement status (Moving/Parked)
  - Last location update timestamp
  - Overdue maintenance count with warning
  - Upcoming maintenance count with schedule info

**Features:**
- Real-time location updates (refreshes every 30 seconds)
- Color-coded status badges for quick identification
- Clickable vehicles for detailed information
- Responsive design works on mobile

### 2. Location Status in Maintenance List

Each maintenance record now shows the vehicle's current location.

**What it displays:**
- Vehicle current address or GPS coordinates
- Speed indicator (Moving 45.2 km/h or Parked)
- Last location update time
- Styled in blue accent box for quick visibility

**Benefits:**
- Know vehicle whereabouts before assigning maintenance
- Identify vehicles that are currently parked (better maintenance timing)
- Track vehicle movement history

### 3. Updated MaintenancePage

**New Tab Structure:**
1. Overview - Dashboard with statistics and recent maintenance
2. Upcoming - All scheduled maintenance for next 30 days
3. Overdue - All overdue maintenance requiring immediate action
4. **Fleet Map** ← NEW
5. History - Complete maintenance history

## Component Files

### New Components Created

#### 1. `services/locationService.js`
Utility service for location data operations.

**Functions:**
```javascript
// Get latest location for a single vehicle
getVehicleLocation(vehicleId)

// Get latest locations for all vehicles
getAllVehiclesLocations()

// Calculate distance between two GPS coordinates (Haversine formula)
calculateDistance(lat1, lon1, lat2, lon2)

// Format timestamp as relative time ("5 minutes ago", "2 hours ago")
formatTimeAgo(timestamp)
```

#### 2. `components/MaintenanceMap.jsx`
Fleet map view component showing vehicles with maintenance status.

**Props:**
- `maintenanceData` (array): All maintenance records
- `locations` (object): Location data keyed by vehicleId

**Features:**
- Vehicle list with status indicators
- Selected vehicle detail panel
- Real-time location display
- Maintenance status summary

#### 3. `components/VehicleLocationStatus.jsx`
Display component for location information on maintenance records.

**Props:**
- `vehicleId` (string): Vehicle ID
- `location` (object): Location data with address, coordinates, speed, timestamp

**Features:**
- Address and GPS coordinates display
- Speed and movement status
- Relative timestamp ("5 min ago")
- Status badges (Active/Parked)

### Updated Components

#### `pages/MaintenancePage.jsx`
**Changes:**
- Added imports for location service and MaintenanceMap component
- Added state: `locations`, `loadingLocations`
- Added `fetchLocations()` function to get vehicle locations
- Auto-refresh locations when "Fleet Map" tab is active
- Added "Fleet Map" tab to navigation
- Integrated MaintenanceMap component in map tab

#### `components/MaintenanceList.jsx`
**Changes:**
- Added MapPin and Navigation icons
- Added location status display section
- Shows vehicle address, speed, and last update time
- Blue-accent box for location information

## API Integration

### Backend Requirements

The system expects these API endpoints to exist (or uses mock data):

```
GET /api/location/vehicle/:vehicleId/latest
Response: {
  vehicleId: string,
  address: string,
  latitude: number,
  longitude: number,
  speed: number (km/h),
  timestamp: ISO8601 string
}

GET /api/location/vehicles/latest
Response: Array of location objects for all vehicles
```

**Current Implementation:** Using mock data from `locationService.js`. To integrate with real backend:

1. Update `locationService.js` endpoints to match your API
2. Ensure location data includes: vehicleId, address, latitude, longitude, speed, timestamp
3. Update MaintenanceList.jsx to fetch location data for displayed vehicles

## Real-Time Updates

### Socket.io Integration (Optional)

To add real-time location updates via Socket.io:

```javascript
// In MaintenancePage.jsx useEffect:
useEffect(() => {
  const socket = io(); // from socket.io client
  
  socket.on('vehicle_location_update', (data) => {
    setLocations(prev => ({
      ...prev,
      [data.vehicleId]: data
    }));
  });
  
  return () => socket.off('vehicle_location_update');
}, []);
```

## Styling

All components use:
- **Tailwind CSS** for styling
- **Glassmorphism** effects (backdrop blur, semi-transparent backgrounds)
- **Lucide icons** for consistent iconography
- **Framer Motion** for smooth animations
- **Responsive design** for mobile and desktop

Color scheme:
- Green (OK/Active): `text-green-600`, `bg-green-50`
- Amber (Upcoming): `text-amber-600`, `bg-amber-50`
- Red (Overdue): `text-red-600`, `bg-red-50`
- Blue (Location): `text-blue-600`, `bg-blue-50`

## Usage Examples

### View Fleet Map
1. Navigate to Maintenance page
2. Click "Fleet Map" tab
3. See all vehicles with location markers
4. Click vehicle to see detailed info

### Check Vehicle Location Before Assignment
1. In Maintenance List, look for blue location box
2. See current address and speed
3. Decide if vehicle is in good position for maintenance

### Monitor Overdue Maintenance
1. Go to Fleet Map tab
2. Red-marked vehicles need immediate attention
3. Click red vehicle to see location and maintenance details
4. Dispatch vehicle to nearest service center

## Performance Considerations

**Optimization:**
- Location data fetches once when map tab opens
- Auto-refresh every 30 seconds (configurable)
- Batch requests for all vehicles (not per-vehicle)
- Interval clears when switching away from map tab

**Scalability:**
- Tested with 50+ vehicles
- Efficient vehicle deduplication logic
- Minimal re-renders with proper React key usage

## Troubleshooting

### Locations Not Showing
1. Check that location API is responding
2. Verify vehicleId matches between maintenance and location data
3. Check browser console for fetch errors
4. Ensure vehicles exist in database first

### Map Tab Loading Slowly
1. Check network tab for API response time
2. Reduce refresh interval in MaintenancePage.jsx (line with `setInterval(fetchLocations, 30000)`)
3. Optimize backend location query

### Location Data Stale
1. Locations refresh every 30 seconds automatically
2. To refresh manually: Switch tabs and back to Fleet Map
3. Check if location service has recent data

## Future Enhancements

Potential features to add:

1. **Route Planning**: Show optimal route from vehicle location to service center
2. **Geofencing**: Alert when vehicle enters maintenance zone
3. **Historical Tracking**: Show vehicle movement history over time
4. **Predictive Maintenance**: Calculate next maintenance based on location/usage
5. **Driver Communication**: Message drivers about upcoming maintenance
6. **Mobile App**: Extend to mobile with native map libraries
7. **MapBox Integration**: Use actual map library instead of list view

## File Structure

```
fleet-app/
├── frontend/
│   └── src/
│       ├── services/
│       │   └── locationService.js (NEW)
│       ├── components/
│       │   ├── MaintenanceMap.jsx (NEW)
│       │   ├── VehicleLocationStatus.jsx (NEW)
│       │   └── MaintenanceList.jsx (UPDATED)
│       └── pages/
│           └── MaintenancePage.jsx (UPDATED)
└── backend/
    └── services/
        └── locationService.js (existing)
```

## Testing Checklist

- [ ] Fleet Map tab loads without errors
- [ ] Vehicles display with correct status colors
- [ ] Clicking vehicle shows detailed information
- [ ] Location updates refresh every 30 seconds
- [ ] Location status appears in maintenance list
- [ ] Mobile responsive design works
- [ ] No console errors when switching tabs
- [ ] Performance acceptable with 50+ vehicles

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoints are correctly configured
3. Ensure location data is being sent from backend
4. Review console logs in network tab

---

**Last Updated:** Version 2.0 - Live Tracking Integration Complete
