# Upcoming Maintenance Fix - Complete Resolution

## Problem
New maintenance records were appearing in "Recent Maintenance" but NOT in the "Upcoming" tab, even though they were created as scheduled maintenance.

Example: DEF-777 tire maintenance ($140) was visible in "Recent Maintenance" but the "Upcoming (2)" tab only showed 2 items instead of 3.

## Root Cause
The `getUpcomingScheduledMaintenance()` query was only checking `nextScheduledDate`, which is only populated for **recurring** maintenance. For **one-time** maintenance, only `scheduledDate` is set and `nextScheduledDate` remains `null`.

### Creation Logic (working correctly):
```javascript
nextScheduledDate: scheduleType === 'recurring' ? parsedScheduledDate : null
```

### Query Bug (before fix):
```javascript
const getUpcomingScheduledMaintenance = async (daysAhead = 30) => {
  return await Maintenance.find({
    status: 'scheduled',
    nextScheduledDate: {  // ❌ Only checks nextScheduledDate
      $gte: today,
      $lte: futureDate
    },
    isScheduled: true
  });
};
```

This filtered OUT all one-time maintenance records because they had `nextScheduledDate: null`.

## Solution

### Fixed Query (lines 158-192 in maintenanceScheduler.js)
Now checks BOTH `scheduledDate` (for one-time) AND `nextScheduledDate` (for recurring):

```javascript
const getUpcomingScheduledMaintenance = async (daysAhead = 30) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const futureDate = new Date(today);
  futureDate.setDate(futureDate.getDate() + daysAhead);
  futureDate.setHours(23, 59, 59, 999);

  return await Maintenance.find({
    status: 'scheduled',
    isScheduled: true,
    $or: [
      {
        scheduleType: 'one-time',
        scheduledDate: {
          $gte: today,
          $lte: futureDate
        }
      },
      {
        scheduleType: 'recurring',
        nextScheduledDate: {
          $gte: today,
          $lte: futureDate
        }
      }
    ]
  })
  .populate('vehicle', 'plateNumber make model')
  .sort({ scheduledDate: 1, nextScheduledDate: 1 });
};
```

### Fixed Overdue Query (lines 194-220)
Similarly updated to handle both one-time and recurring:

```javascript
const getOverdueScheduledMaintenance = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return await Maintenance.find({
    isScheduled: true,
    $or: [
      {
        status: 'scheduled',
        scheduleType: 'one-time',
        scheduledDate: { $lt: today }
      },
      {
        status: 'scheduled',
        scheduleType: 'recurring',
        nextScheduledDate: { $lt: today }
      },
      {
        status: 'overdue'
      }
    ]
  })
  .populate('vehicle', 'plateNumber make model')
  .sort({ scheduledDate: 1, nextScheduledDate: 1 });
};
```

## Impact
✅ **One-time maintenance** (like DEF-777 tire) now appears in Upcoming tab within 30 days
✅ **Recurring maintenance** continues to work as before
✅ **Overdue detection** now properly identifies past one-time maintenance
✅ Sorting improved to handle both date fields

## Testing
1. Create a new one-time maintenance for any vehicle with scheduledDate within 30 days
2. Wait for auto-refetch (10 seconds)
3. Verify it appears in "Upcoming" tab count and list
4. Create maintenance with past date - should appear in "Overdue" tab

## Files Modified
- `/backend/services/maintenanceScheduler.js` - Fixed `getUpcomingScheduledMaintenance()` and `getOverdueScheduledMaintenance()`
- Backend restarted with new queries
