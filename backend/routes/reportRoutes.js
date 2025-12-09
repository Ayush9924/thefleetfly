const express = require('express');
const router = express.Router();
const { getCostPerKmReport } = require('../controllers/reportController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);

router.get('/cost-per-km', authorize('admin', 'manager'), getCostPerKmReport);

module.exports = router;