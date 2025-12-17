# Maintenance Data Verification Guide

## Average Cost Calculation

### How It Works
1. **Backend** (`maintenanceScheduler.js`): Aggregates all maintenance records with `cost > 0` and calculates average
2. **Formula**: `Sum of all costs / Number of records with cost`

### Current Seeded Data

| Vehicle | Description | Cost | Status | nextScheduledDate |
|---------|-------------|------|--------|------------------|
| TRK-001 | Oil change | $19.69 | scheduled | +7 days |
| TRK-002 | Battery replacement | $120.00 | scheduled | +14 days |
| TRK-003 | Engine inspection | $180.00 | scheduled | -2 days (overdue) |
| TRK-004 | Tire rotation | $200.00 | scheduled | +5 days |
| TRK-005 | Brake pad replacement | $250.00 | pending | +10 days |

### Expected Average
```
(19.69 + 120.00 + 180.00 + 200.00 + 250.00) / 5 = 769.69 / 5 = $153.94
```

### Display Shows: $245
**Possible reasons:**
1. **Different seed data** - Costs might have been modified
2. **Fewer items counted** - Only 3 items? (120 + 180 + 250) / 3 = $183.33 (still not $245)
3. **Only pending items** - Not calculating scheduled ones
4. **Custom data added** - You might have added items with different costs

---

## How to Verify

### Option 1: Check Database Directly

If using MongoDB Atlas or local MongoDB:
```bash
# Connect to MongoDB and run:
db.maintenances.find({}, { description: 1, cost: 1, status: 1 })

# Get average:
db.maintenances.aggregate([
  { $match: { cost: { $ne: null, $gt: 0 } } },
  { $group: { _id: null, avgCost: { $avg: "$cost" } } }
])
```

### Option 2: Check Backend Response

Open browser Developer Tools (F12) and go to Network tab, then:

1. Navigate to Maintenance page
2. Look for API calls to:
   - `GET /api/maintenance/stats`
   - `GET /api/maintenance/scheduled/upcoming`
   - `GET /api/maintenance/scheduled/overdue`

3. Click each request and check the Response tab
4. Look for the `averageCost` field in the stats response

### Option 3: Check Frontend Console

Open browser DevTools Console (F12 → Console) and add this code:

```javascript
// Check the hook data
fetch('/api/maintenance/stats', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => {
  console.log('Stats from API:', data);
  console.log('Average Cost:', data.averageCost);
  console.log('Total Records:', data.totalRecords);
  console.log('Scheduled:', data.totalScheduled);
  console.log('Pending:', data.totalPending);
})
```

---

## Auto-Refetch Implementation

### What Was Added:

1. **Auto-refetch every 10 seconds** - Maintenance data updates automatically
2. **Tab-specific refetch** - When switching to Upcoming/Overdue, data refreshes
3. **Ensures latest data** - New maintenance records appear immediately

### Refetch Triggers:
- ✅ Page load
- ✅ Every 10 seconds (automatic)
- ✅ When switching tabs (Upcoming/Overdue)
- ✅ After creating new maintenance
- ✅ After completing maintenance
- ✅ After cancelling maintenance

---

## Troubleshooting Upcoming Not Updating

### If Upcoming tab still shows old data:

**Step 1**: Verify the backend is returning new data
```
Browser DevTools → Network → Filter by "scheduled/upcoming"
Check the Response JSON
```

**Step 2**: Check console for errors
```
Browser DevTools → Console → Look for red error messages
```

**Step 3**: Force manual refetch
```javascript
// Open Console and paste:
document.location.reload()  // Full page reload
```

**Step 4**: Check if new maintenance was actually created
```javascript
// In Console:
fetch('/api/maintenance', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`
  }
})
.then(r => r.json())
.then(data => console.log('All maintenance:', data))
```

---

## Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Average shows wrong number | Check database for actual cost values |
| Upcoming doesn't update | Try switching tabs or wait 10 seconds for auto-refetch |
| New maintenance not appearing | Create using "Schedule Maintenance" button → should auto-appear |
| Stats showing 0 | Check if any maintenance has valid costs (>0) |
| Can't see tab numbers | Make sure you're on Overview tab first to see initial load |

---

## API Endpoints Being Called

```
GET /api/maintenance/stats                  → Get average cost & counts
GET /api/maintenance/scheduled/upcoming     → Get upcoming (next 30 days)
GET /api/maintenance/scheduled/overdue      → Get overdue items
GET /api/maintenance                        → Get all maintenance records
```

All endpoints update every 10 seconds automatically!
