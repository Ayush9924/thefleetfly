# Dashboard KPI Data Sources

## Quick Reference

| KPI | Value | Data Source | Calculation |
|-----|-------|------------|-------------|
| **Available Drivers** | 5 | `/api/drivers` | Filters for `status === "available"` |
| **Active Assignments** | 3 | `/api/assignments` | Filters for `isActive === true` |
| **Total Vehicles** | 5 | `/api/vehicles` | Total count |
| **Active Vehicles** | 2 or 3 | `/api/vehicles` | Filters for `status === "active"` |
| **Vehicles in Maintenance** | 2 or 3 | `/api/vehicles` | Filters for `status === "maintenance"` |
| **Total Fuel Cost** | Sum | `/api/fuels` | Sum of all `cost` values |
| **Total Maintenance Cost** | Sum | `/api/maintenance` | Sum of all `cost` values |

---

## Data Flow

### 1. **Available Drivers (5)**

**API Endpoint**: `GET /api/drivers`

**Frontend Code** (DashboardPage.jsx, line 342-344):
```javascript
const availableDrivers = Array.isArray(drivers)
  ? drivers.filter((d) => d?.status === "available")?.length || 0
  : 0;
```

**Backend Endpoint**: `GET http://localhost:5001/api/drivers`

**Backend Controller**: `driverController.js` - `getDrivers()`

**Database Query**: Finds all drivers with `status: "available"`

**Example Response**:
```json
[
  {
    "_id": "...",
    "name": "Driver 1",
    "status": "available",
    "phone": "+1234567891",
    "licenseNumber": "DL-2024-1000"
  },
  // ... more drivers
]
```

---

### 2. **Active Assignments (3)**

**API Endpoint**: `GET /api/assignments`

**Frontend Code** (DashboardPage.jsx, line 345-347):
```javascript
const activeAssignments = Array.isArray(assignments)
  ? assignments.filter((a) => a?.isActive)?.length || 0
  : 0;
```

**Backend Endpoint**: `GET http://localhost:5001/api/assignments`

**Backend Controller**: `assignmentController.js` - `getAssignments()`

**Database Query**: Finds all assignments with `isActive: true`

**Example Response**:
```json
[
  {
    "_id": "...",
    "vehicle": "...",
    "driver": "...",
    "isActive": true,
    "startDate": "2025-12-11T00:00:00.000Z"
  },
  // ... more assignments
]
```

---

### 3. **Percentage Calculations (16.7%, 50.0%)**

**Frontend Code** (DashboardPage.jsx, line 372-383):
```javascript
const calculateTrend = (current, previous) => {
  try {
    if (!Number.isFinite(current) || !Number.isFinite(previous)) {
      return { value: 0, isPositive: true };
    }
    if (previous === 0) return { value: 0, isPositive: current >= 0 };
    const change = ((current - previous) / previous) * 100;
    const value = Math.round(change * 10) / 10;
    if (!Number.isFinite(value)) return { value: 0, isPositive: true };
    return { value, isPositive: change >= 0 };
  } catch (error) {
    console.warn("Error calculating trend:", error);
    return { value: 0, isPositive: true };
  }
};
```

**Formula**: 
```
((current - previous) / previous) * 100
```

**Example for Available Drivers (16.7%)**:
- Current: 5 drivers available
- Previous: 5 drivers available (or calculated as: 5 > 0 ? 5 + 1 : 1 = 6)
- Calculation: ((5 - 6) / 6) * 100 = -16.7%

**Example for Active Assignments (50.0%)**:
- Current: 3 active assignments
- Previous: 3 > 0 ? 3 - 1 : 2 = 2
- Calculation: ((3 - 2) / 2) * 100 = 50%

---

## Trend Calculations in Detail

**Line 374-378** (DashboardPage.jsx):
```javascript
const vehicleTrend = calculateTrend(totalVehicles, totalVehicles > 0 ? totalVehicles - 1 : 3);
const driverTrend = calculateTrend(availableDrivers, availableDrivers > 0 ? availableDrivers + 1 : 1);
const assignmentTrend = calculateTrend(activeAssignments, activeAssignments > 0 ? activeAssignments - 1 : 2);
const maintenanceTrend = calculateTrend(vehiclesInMaintenance, vehiclesInMaintenance > 0 ? vehiclesInMaintenance - 1 : 1);
const fuelCostTrend = calculateTrend(totalFuelCost, totalFuelCost > 0 ? totalFuelCost - 50 : 169.25);
const upcomingTrend = calculateTrend(upcomingMaintenance, 1);
```

**Note**: These are **placeholder** trend calculations!
- They use dummy "previous" values
- In production, you'd fetch actual historical data from the backend
- Current implementation just shows week-to-week comparison with hardcoded previous values

---

## Real-time Data Updates

**Refresh Interval**: 5 seconds (configurable)

```javascript
// Line 184-191
const { data: vehicles, isLoading: vehiclesLoading } = useQuery({
  queryKey: ["vehicles"],
  queryFn: getVehicles,
  refetchInterval: 5000,  // ← Refreshes every 5 seconds
  staleTime: 2000,
});
```

---

## Database Collections Being Queried

1. **drivers** - Contains driver info with `status` field
2. **assignments** - Contains vehicle-driver assignments with `isActive` field
3. **vehicles** - Contains vehicle info with `status` field
4. **fuels** - Contains fuel log entries with `cost` field
5. **maintenance** - Contains maintenance records with `cost` field

---

## How to Update These Values

### To Change Available Drivers:
Update driver status in MongoDB:
```javascript
db.drivers.updateOne(
  { _id: ObjectId("...") },
  { $set: { status: "available" } }
)
```

### To Create New Assignments:
POST to `/api/assignments`:
```json
{
  "vehicle": "vehicle_id",
  "driver": "driver_id",
  "startDate": "2025-12-18",
  "isActive": true
}
```

### To Deactivate an Assignment:
PUT to `/api/assignments/:id`:
```json
{
  "isActive": false
}
```

---

**All data is real-time and updates every 5 seconds!**
