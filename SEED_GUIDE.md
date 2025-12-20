# Database Seeding Guide

## Important: Data Protection Policy

**From now on, your data is always protected.** No scripts will delete your data automatically.

---

## Safe Seed Script (DEFAULT - PRESERVES DATA)

```bash
npm run seed
```

### What it does:
✅ Checks if database already has data  
✅ If data exists → **SKIPS seeding** (your data is safe)  
✅ If database is empty → Adds initial demo data  
✅ **Never deletes anything**

### When to use:
- First time setup
- Adding initial test data
- Safe to run multiple times

---

## Force Seed Script (DANGEROUS - USE ONLY IF NEEDED)

```bash
npm run seed:force
```

### ⚠️ WARNING:
**This script DELETES all data and reseeds the database from scratch.**

### What it does:
❌ Deletes ALL users, vehicles, drivers, assignments, fuel logs, maintenance records  
❌ Creates fresh demo data  

### When to use:
- Emergency data reset
- Testing database schema changes
- Starting completely fresh
- **Use with CAUTION!**

---

## Default Seed Data Structure

When seeding with demo data, you get:

### Vehicles
- TRK-001 through TRK-005
- Toyota Hilux models
- Mixed active/maintenance status

### Drivers
- Driver 1 through Driver 5
- Available status

### Maintenance (Important!)
- **Scheduled (Future)**: Oil change, Battery replacement, Tire rotation
- **Overdue (Past)**: Engine inspection (2 days overdue)
- **Pending**: Brake pad replacement

### Admin User
- Email: `admin@fleet.com`
- Password: `admin123`

---

## Never Used Scripts

Do NOT use these (they delete data):
- ~~`node seeders/force-seed.js`~~ → Use `npm run seed:force` instead
- ~~`node seeders/seed.js`~~ → Use `npm run seed` instead (safe)

---

## Troubleshooting

### Q: I accidentally deleted my data with force-seed. Can I get it back?
A: If you have MongoDB backups, yes. Otherwise, you'll need to manually re-enter it. Always use `npm run seed` for safety!

### Q: How do I know if seeding worked?
A: Check the console output:
- "Database already has data" → Safe mode, data preserved ✅
- "Database seeded successfully!" → Initial data added ✅
- "Database cleared..." → Force seed ran (data was reset)

### Q: Can I modify the seed data?
A: Yes! Edit `seeders/seed.js` to change demo data. Changes only apply if database is empty.

---

**Remember: Use `npm run seed` for safety. Only use `npm run seed:force` when you absolutely need a fresh start!**
