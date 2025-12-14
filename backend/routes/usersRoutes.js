const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Driver = require('../models/Driver');

/**
 * GET /api/users
 * Get all users with optional role filter
 * Query: ?role=driver,manager,admin (comma-separated)
 */
router.get('/', protect, async (req, res) => {
  try {
    const { role } = req.query;
    const userId = req.user.id;

    // Build filter
    const filter = { _id: { $ne: userId } }; // Exclude current user
    
    if (role) {
      const roles = role.split(',').map(r => r.trim());
      filter.role = { $in: roles };
    }

    const users = await User.find(filter)
      .select('_id name email role')
      .lean()
      .limit(100);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/by-role/:role
 * Get users by specific role
 */
router.get('/by-role/:role', protect, async (req, res) => {
  try {
    const { role } = req.params;
    const userId = req.user.id;

    // Validate role
    const validRoles = ['admin', 'manager', 'driver', 'dispatcher'];
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Invalid role' });
    }

    const users = await User.find({
      role: role,
      _id: { $ne: userId } // Exclude current user
    })
      .select('_id name email role')
      .lean()
      .limit(100);

    res.json(users);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

/**
 * GET /api/users/contacts/available
 * Get all available contacts grouped by role
 */
router.get('/contacts/available', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch users grouped by role
    const roles = ['admin', 'manager', 'driver'];
    const contacts = {};

    for (const role of roles) {
      const users = await User.find({
        role: role,
        _id: { $ne: userId }
      })
        .select('_id name email role')
        .lean()
        .limit(50);

      contacts[role] = users;
    }

    res.json(contacts);
  } catch (error) {
    console.error('Error fetching available contacts:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

module.exports = router;
